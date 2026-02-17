"use client";

import { ClientOnly } from "@/components/ui/ClientOnly";
import { MeasurementDef, ProductAnnotation } from "@/lib/services/api";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ============================================================================
// TYPES
// ============================================================================

interface SizeGuideProps {
    modelPath?: string;
    annotations?: ProductAnnotation[];
    measurements?: MeasurementDef[];
    onReady?: () => void;
}

interface AnnotationData {
    id: string;
    label: string;
    position: THREE.Vector3;
    value: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
    accentB: 0xccff00,   // Acid Green
    accentA: 0x4d4dff,   // Plasma Blue
    canvas: 0x050507,    // Obsidian
    white: 0xffffff,
};

const ANNOTATIONS: AnnotationData[] = [
    { id: "chest", label: "A", position: new THREE.Vector3(0, 0, 0), value: "CHEST" },
    { id: "length", label: "B", position: new THREE.Vector3(0, 0, 0), value: "LENGTH" },
    { id: "sleeve", label: "C", position: new THREE.Vector3(0, 0, 0), value: "SLEEVE" },
];

// Default T-shirt measurements (fallback when no measurements prop is provided)
const DEFAULT_MEASUREMENTS: MeasurementDef[] = [
    { id: "chest", type: "ring", stagger: 0.15, xFraction: 0.5, yFraction: 0.62, zFraction: 0.5, rxFraction: 0.33, rzFraction: 0.53 },
    { id: "length", type: "line", stagger: 0.25, start: [0.32, 0.02, 0.68], end: [0.32, 0.97, 0.68] },
    { id: "sleeve", type: "line", stagger: 0.35, start: [0.80, 0.82, 0.63], end: [0.95, 0.60, 0.58] },
];

// ============================================================================
// SHADERS — Contour Lines
// ============================================================================

const contourVertexShader = /* glsl */ `
    attribute float edgeRandom;

    uniform float uTime;
    uniform float uProgress;
    uniform float uYMin;
    uniform float uYRange;

    varying float vNormalizedY;
    varying float vEdgeRandom;
    varying float vArrival;

    void main() {
        // Each edge has a random [0,1] value that staggers its arrival.
        // Edges with low edgeRandom arrive first; high edgeRandom arrive last.
        float stagger = edgeRandom * 0.6;
        float arrival = smoothstep(stagger, stagger + 0.4, uProgress);
        vArrival = arrival;

        // Fly-in from the right: offset decreases as arrival → 1
        float flyInX = (1.0 - arrival) * (6.0 + edgeRandom * 3.0);
        float flyInY = (1.0 - arrival) * (edgeRandom - 0.5) * 0.8;

        vec3 pos = position + vec3(flyInX, flyInY, 0.0);

        // Normalize Y into [0, 1] for the scanning pulse
        vNormalizedY = (position.y - uYMin) / uYRange;
        vEdgeRandom = edgeRandom;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const contourFragmentShader = /* glsl */ `
    uniform float uTime;

    varying float vNormalizedY;
    varying float vEdgeRandom;
    varying float vArrival;

    void main() {
        // ── Base color: Acid Green #CCFF00 ────────────────────────────
        vec3 acidGreen = vec3(0.8, 1.0, 0.0);

        // ── Scanning pulse: two bands sweeping at different speeds ─────
        // Band 1: slow sweep upward
        float scan1Pos = fract(uTime * 0.25 + vEdgeRandom * 0.15);
        float scan1Dist = abs(vNormalizedY - scan1Pos);
        scan1Dist = min(scan1Dist, 1.0 - scan1Dist);
        float pulse1 = smoothstep(0.12, 0.0, scan1Dist);

        // Band 2: faster sweep downward (offset phase)
        float scan2Pos = fract(-uTime * 0.4 + 0.5 + vEdgeRandom * 0.1);
        float scan2Dist = abs(vNormalizedY - scan2Pos);
        scan2Dist = min(scan2Dist, 1.0 - scan2Dist);
        float pulse2 = smoothstep(0.08, 0.0, scan2Dist);

        float pulse = max(pulse1, pulse2);

        // ── Brightness: base + pulse boost ────────────────────────────
        float baseBrightness = 0.35;
        float brightness = baseBrightness + pulse * 0.65;

        vec3 color = acidGreen * brightness;

        // Holographic glow at pulse peaks: add slight white
        color += vec3(1.0) * pulse * 0.25;

        // ── Alpha: fades in with arrival, pulses with scan ────────────
        float alpha = vArrival * (0.4 + pulse * 0.6);

        if (alpha < 0.01) discard;

        gl_FragColor = vec4(color, alpha);
    }
`;

// ============================================================================
// SHADERS — Plasma Measurement Arrows
// ============================================================================

const plasmaVertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uProgress;
    uniform float uStagger;

    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;
    varying float vArrival;

    void main() {
        // Staggered arrival — each arrow flies in after a delay
        float arrival = smoothstep(uStagger, uStagger + 0.3, uProgress);
        vArrival = arrival;

        // Fly-in from the right (matches contour line direction)
        float flyInX = (1.0 - arrival) * 5.0;
        vec3 pos = position + vec3(flyInX, 0.0, 0.0);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewDir = -mvPosition.xyz;
        vNormal = normalMatrix * normal;
        vUv = uv;

        gl_Position = projectionMatrix * mvPosition;
    }
`;

const plasmaFragmentShader = /* glsl */ `
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;
    varying float vArrival;

    void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewDir);

        vec3 baseColor = vec3(0.302, 0.302, 1.0);

        gl_FragColor = vec4(baseColor, 0.1);
    }
`;

// ============================================================================
// CONTOUR LINE SYSTEM
// ============================================================================

class ContourLineSystem {
    private geometry: THREE.BufferGeometry;
    private material: THREE.ShaderMaterial;
    private lines: THREE.LineSegments;
    private uniforms: Record<string, THREE.IUniform>;

    constructor(geometries: THREE.BufferGeometry[]) {
        const allPositions: number[] = [];
        const allEdgeRandoms: number[] = [];

        let yMin = Infinity;
        let yMax = -Infinity;

        // Extract edges from every sub-mesh geometry
        for (const geom of geometries) {
            const edges = new THREE.EdgesGeometry(geom, 1);
            const edgePos = edges.getAttribute("position") as THREE.BufferAttribute;

            for (let i = 0; i < edgePos.count; i += 2) {
                // One random value shared by both vertices of an edge
                const rand = Math.random();

                for (let j = 0; j < 2; j++) {
                    const idx = i + j;
                    const x = edgePos.getX(idx);
                    const y = edgePos.getY(idx);
                    const z = edgePos.getZ(idx);

                    allPositions.push(x, y, z);
                    allEdgeRandoms.push(rand);

                    if (y < yMin) yMin = y;
                    if (y > yMax) yMax = y;
                }
            }

            edges.dispose();
        }

        const yRange = yMax - yMin || 1;

        // Build geometry
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(allPositions, 3));
        this.geometry.setAttribute("edgeRandom", new THREE.Float32BufferAttribute(allEdgeRandoms, 1));

        // Uniforms
        this.uniforms = {
            uTime: { value: 0 },
            uProgress: { value: 0 },
            uYMin: { value: yMin },
            uYRange: { value: yRange },
        };

        // Material
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: contourVertexShader,
            fragmentShader: contourFragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            blending: THREE.AdditiveBlending,
        });

        this.lines = new THREE.LineSegments(this.geometry, this.material);
    }

    getObject(): THREE.LineSegments {
        return this.lines;
    }

    update(time: number) {
        this.uniforms.uTime.value = time;
    }

    setProgress(progress: number) {
        this.uniforms.uProgress.value = progress;
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}

// ============================================================================
// MEASUREMENT ARROW SYSTEM
// ============================================================================

class MeasurementArrowSystem {
    private group: THREE.Group;
    private materials: THREE.ShaderMaterial[];
    private geometries: THREE.BufferGeometry[];
    private anchorPoints: Record<string, THREE.Vector3>;

    constructor(tBBox: THREE.Box3, defs: MeasurementDef[]) {
        this.group = new THREE.Group();
        this.materials = [];
        this.geometries = [];
        this.anchorPoints = {};

        const tSize = tBBox.getSize(new THREE.Vector3());
        const tMin = tBBox.min.clone();
        const tCenter = tBBox.getCenter(new THREE.Vector3());

        const tubeRadius = 0.01;
        const arrowRadius = 0.02;
        const arrowHeight = 0.03;

        for (const def of defs) {
            const mat = this.createMaterial(def.stagger);
            this.materials.push(mat);

            if (def.type === "ring") {
                this.buildRing(def, tMin, tSize, tCenter, tubeRadius, mat);
            } else {
                this.buildLine(def, tMin, tSize, tubeRadius, arrowRadius, arrowHeight, mat);
            }
        }
    }

    // ── Ring measurement (circumference) ────────────────────────
    private buildRing(
        def: Extract<MeasurementDef, { type: "ring" }>,
        tMin: THREE.Vector3,
        tSize: THREE.Vector3,
        tCenter: THREE.Vector3,
        tubeRadius: number,
        mat: THREE.ShaderMaterial,
    ) {
        const x = tMin.x + tSize.x * def.xFraction;
        const y = tMin.y + tSize.y * def.yFraction;
        const z = tMin.z + tSize.z * def.rzFraction;
        const rx = tSize.x * def.rxFraction;
        const rz = tSize.z * def.rzFraction;

        // Clamp tilt to [-90, 90] and convert to radians
        const tiltRad = THREE.MathUtils.degToRad(
            THREE.MathUtils.clamp(def.tiltDeg ?? 0, -90, 90),
        );

        const cosT = Math.cos(tiltRad);
        const sinT = Math.sin(tiltRad);

        const points: THREE.Vector3[] = [];
        const segs = 72;
        for (let i = 0; i <= segs; i++) {
            const angle = (i / segs) * Math.PI * 2;
            // Flat ring point relative to center
            const lx = Math.cos(angle) * rx;
            const lz = Math.sin(angle) * rz;
            // Rotate around Z-axis: affects X and Y
            points.push(new THREE.Vector3(
                lx * cosT + x,
                lx * sinT + y,
                lz + z,
            ));
        }

        const curve = new THREE.CatmullRomCurve3(points, true);
        const geom = new THREE.TubeGeometry(curve, 72, tubeRadius, 8, true);
        this.group.add(new THREE.Mesh(geom, mat));
        this.geometries.push(geom);

        // Anchor at ~45° offset for label placement (also tilted)
        const anchorLx = Math.cos(Math.PI / 4) * rx;
        this.anchorPoints[def.id] = new THREE.Vector3(
            anchorLx * cosT + tCenter.x + 0.2,
            anchorLx * sinT + y,
            Math.sin(Math.PI / 4) * rz + tCenter.z + 0.15,
        );
    }

    // ── Line measurement (linear distance) ──────────────────────
    private buildLine(
        def: Extract<MeasurementDef, { type: "line" }>,
        tMin: THREE.Vector3,
        tSize: THREE.Vector3,
        tubeRadius: number,
        arrowRadius: number,
        arrowHeight: number,
        mat: THREE.ShaderMaterial,
    ) {
        const start = new THREE.Vector3(
            tMin.x + tSize.x * def.start[0],
            tMin.y + tSize.y * def.start[1],
            tMin.z + tSize.z * def.start[2],
        );
        const end = new THREE.Vector3(
            tMin.x + tSize.x * def.end[0],
            tMin.y + tSize.y * def.end[1],
            tMin.z + tSize.z * def.end[2],
        );

        const curve = new THREE.LineCurve3(start, end);
        const geom = new THREE.TubeGeometry(curve, 32, tubeRadius, 8, false);
        this.group.add(new THREE.Mesh(geom, mat));
        this.geometries.push(geom);

        // Arrowheads at both ends
        const dir = end.clone().sub(start).normalize();
        this.addArrowhead(end, dir, arrowRadius, arrowHeight, mat);
        this.addArrowhead(start, dir.clone().negate(), arrowRadius, arrowHeight, mat);

        // Anchor at midpoint with slight offset for label placement
        this.anchorPoints[def.id] = new THREE.Vector3(
            (start.x + end.x) / 2 + 0.2,
            (start.y + end.y) / 2 + 0.15,
            (start.z + end.z) / 2 + 0.1,
        );
    }

    private createMaterial(stagger: number): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uProgress: { value: 0 },
                uStagger: { value: stagger },
            },
            vertexShader: plasmaVertexShader,
            fragmentShader: plasmaFragmentShader,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
            side: THREE.DoubleSide,
        });
    }

    private addArrowhead(
        position: THREE.Vector3,
        direction: THREE.Vector3,
        radius: number,
        height: number,
        material: THREE.ShaderMaterial
    ) {
        const coneGeom = new THREE.ConeGeometry(radius, height, 12);

        // ConeGeometry points up (+Y) by default — rotate to match direction
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize());
        coneGeom.applyQuaternion(quat);

        // Offset so the cone base sits at the tube endpoint
        const offset = direction.clone().normalize().multiplyScalar(height * 0.5);
        coneGeom.translate(
            position.x + offset.x,
            position.y + offset.y,
            position.z + offset.z
        );

        const mesh = new THREE.Mesh(coneGeom, material);
        this.group.add(mesh);
        this.geometries.push(coneGeom);
    }

    getObject(): THREE.Group {
        return this.group;
    }

    getAnchorPoints(): Record<string, THREE.Vector3> {
        return this.anchorPoints;
    }

    update(time: number) {
        for (const mat of this.materials) {
            mat.uniforms.uTime.value = time;
        }
    }

    setProgress(progress: number) {
        for (const mat of this.materials) {
            mat.uniforms.uProgress.value = progress;
        }
    }

    dispose() {
        for (const geom of this.geometries) geom.dispose();
        for (const mat of this.materials) mat.dispose();
    }
}

// ============================================================================
// ANNOTATION HELPER
// ============================================================================

function createAnnotationElement(data: AnnotationData): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "size-guide-annotation";
    el.innerHTML = `
        <div class="annotation-marker">${data.label}</div>
        <div class="annotation-label">${data.value}</div>
    `;
    el.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: auto;
        opacity: 0;
        transform: translateX(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    return el;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function SizeGuideScene({ modelPath, annotations: annotationsProp, measurements: measurementsProp, onReady }: SizeGuideProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const container: HTMLDivElement = containerRef.current;

        // ── Disposed flag ─────────────────────────────────────────────
        let disposed = false;
        let animationId: number | null = null;

        // ── Mutable state ─────────────────────────────────────────────
        const mousePosition = { x: 0, y: 0 };
        const targetRotation = { x: 0, y: 0 };

        // ── Cleanup references ────────────────────────────────────────
        let contourLines: ContourLineSystem | null = null;
        let measurementArrows: MeasurementArrowSystem | null = null;
        let timeline: gsap.core.Timeline | null = null;
        const annotations: CSS2DObject[] = [];

        // ── Scene ─────────────────────────────────────────────────────
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(COLORS.canvas);
        scene.fog = null;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 5);

        // ── WebGL Renderer ────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.NoToneMapping;
        container.appendChild(renderer.domElement);

        // ── CSS2D Renderer ────────────────────────────────────────────
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(width, height);
        labelRenderer.domElement.style.position = "absolute";
        labelRenderer.domElement.style.top = "0";
        labelRenderer.domElement.style.left = "0";
        labelRenderer.domElement.style.pointerEvents = "none";
        container.appendChild(labelRenderer.domElement);

        // ── Post-processing ───────────────────────────────────────────
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            0.6,  // strength
            0.4,  // radius
            0.1   // threshold — low so the acid green lines trigger bloom
        );
        composer.addPass(bloomPass);

        // ── Lighting (tuned for white matte model) ────────────────────
        scene.add(new THREE.AmbientLight(COLORS.white, 0.6));

        const keyLight = new THREE.DirectionalLight(COLORS.white, 1.2);
        keyLight.position.set(3, 4, 5);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(COLORS.white, 0.4);
        fillLight.position.set(-3, 1, 3);
        scene.add(fillLight);

        const rimLight = new THREE.PointLight(COLORS.accentA, 0.6);
        rimLight.position.set(-2, 2, -3);
        scene.add(rimLight);

        const accentLight = new THREE.PointLight(COLORS.accentB, 0.3);
        accentLight.position.set(2, -1, 3);
        scene.add(accentLight);

        // ── Model group ───────────────────────────────────────────────
        const group = new THREE.Group();
        scene.add(group);

        // ── Animation loop ────────────────────────────────────────────
        const clock = new THREE.Clock();

        function loop() {
            if (disposed) return;
            animationId = requestAnimationFrame(loop);

            const elapsed = clock.getElapsedTime();

            if (contourLines) {
                contourLines.update(elapsed);
            }
            if (measurementArrows) {
                measurementArrows.update(elapsed);
            }

            // Mouse parallax
            targetRotation.y = mousePosition.x * 0.3;
            targetRotation.x = mousePosition.y * 0.15;
            group.rotation.y += (targetRotation.y - group.rotation.y) * 0.05;
            group.rotation.x += (targetRotation.x - group.rotation.x) * 0.05;

            // Idle sway
            group.rotation.y += Math.sin(elapsed * 0.5) * 0.002;

            composer.render();
            labelRenderer.render(scene, camera);
        }

        loop();

        // ── Load model ────────────────────────────────────────────────
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        gltfLoader.load(
            modelPath || "/models/male-tee-model.glb",
            (gltf) => {
                if (disposed) return;

                const model = gltf.scene;

                // ── Collect ALL mesh geometries ───────────────────────
                const meshGeometries: THREE.BufferGeometry[] = [];
                const combinedBBox = new THREE.Box3();

                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const geom = child.geometry as THREE.BufferGeometry;
                        meshGeometries.push(geom);

                        geom.computeBoundingBox();
                        if (geom.boundingBox) {
                            combinedBBox.union(geom.boundingBox);
                        }
                    }
                });

                if (meshGeometries.length === 0) return;

                // ── Center and normalize scale ────────────────────────
                const center = combinedBBox.getCenter(new THREE.Vector3());
                const size = combinedBBox.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const normScale = 2.5 / maxDim;

                // Clone and transform each geometry so both the white
                // model and the edge extraction use consistent coords.
                const transformedGeometries: THREE.BufferGeometry[] = [];

                for (const geom of meshGeometries) {
                    const clone = geom.clone();
                    clone.translate(-center.x, -center.y, -center.z);
                    clone.scale(normScale, normScale, normScale);

                    transformedGeometries.push(clone);
                }

                // ── Compute transformed bounding box ────────────────
                const transformedBBox = new THREE.Box3();
                for (const tGeom of transformedGeometries) {
                    tGeom.computeBoundingBox();
                    if (tGeom.boundingBox) transformedBBox.union(tGeom.boundingBox);
                }

                // ── Create contour lines from edges ───────────────────
                contourLines = new ContourLineSystem(transformedGeometries);
                group.add(contourLines.getObject());

                // ── Create measurement arrows ─────────────────────────
                const resolvedMeasurements = measurementsProp ?? DEFAULT_MEASUREMENTS;
                measurementArrows = new MeasurementArrowSystem(transformedBBox, resolvedMeasurements);
                group.add(measurementArrows.getObject());

                // ── Annotations (anchored to arrow midpoints) ─────────
                const anchorPoints = measurementArrows.getAnchorPoints();
                const resolvedAnnotations: AnnotationData[] = annotationsProp
                    ? annotationsProp.map((a) => ({
                          id: a.id,
                          label: a.label,
                          value: a.value,
                          position: new THREE.Vector3(0, 0, 0),
                      }))
                    : ANNOTATIONS;
                resolvedAnnotations.forEach((data) => {
                    const element = createAnnotationElement(data);
                    const label = new CSS2DObject(element);
                    label.position.copy(anchorPoints[data.id] || data.position);
                    group.add(label);
                    annotations.push(label);
                });

                // ── GSAP scroll timeline ──────────────────────────────
                timeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: container,
                        start: "top 100%",
                        end: "bottom 70%",
                        scrub: 1,
                    },
                });

                // Phase 1: Lines fly in + wrap (0–50% of scroll)
                timeline.to(
                    { progress: 0 },
                    {
                        progress: 1,
                        duration: 1,
                        ease: "power2.out",
                        onUpdate: function () {
                            const p = this.targets()[0].progress;
                            contourLines?.setProgress(p);
                            measurementArrows?.setProgress(p);
                        },
                    },
                    0
                );

                // Annotations fade in (50–65%)
                annotations.forEach((annotation, index) => {
                    const el = annotation.element as HTMLElement;
                    timeline!.to(
                        el,
                        { opacity: 1, x: 0, duration: 0.1, delay: index * 0.05 },
                        0.5
                    );
                });
                onReady?.();
            },
            undefined,
            (error) => {
                if (!disposed) console.error("Error loading model:", error);
            }
        );

        // ── Event handlers ────────────────────────────────────────────
        function handleMouseMove(e: MouseEvent) {
            const rect = container.getBoundingClientRect();
            mousePosition.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mousePosition.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        }

        function handleResize() {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            labelRenderer.setSize(w, h);
            composer.setSize(w, h);
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", handleResize);

        // ── Cleanup ───────────────────────────────────────────────────
        return () => {
            disposed = true;

            // 1. Animation loop
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }

            // 2. GSAP
            if (timeline) {
                timeline.kill();
                timeline = null;
            }
            ScrollTrigger.getAll().forEach((st) => {
                if (st.vars.trigger === container) st.kill();
            });

            // 3. Contour line GPU resources
            if (contourLines) {
                contourLines.dispose();
                contourLines = null;
            }

            // 4. Measurement arrow GPU resources
            if (measurementArrows) {
                measurementArrows.dispose();
                measurementArrows = null;
            }

            // 5. All scene objects (meshes, geometries, materials)
            scene.traverse((obj) => {
                if (
                    obj instanceof THREE.Mesh ||
                    obj instanceof THREE.LineSegments ||
                    obj instanceof THREE.Points
                ) {
                    obj.geometry?.dispose();
                    const mat = obj.material;
                    if (Array.isArray(mat)) {
                        mat.forEach((m) => m.dispose());
                    } else if (mat) {
                        mat.dispose();
                    }
                }
            });

            // 6. Post-processing
            composer.dispose();

            // 7. Renderer
            renderer.dispose();

            // 8. DOM cleanup (exhaustive)
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            // 9. Events
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelPath, measurementsProp]);

    return (
        <div
            ref={containerRef}
            className="size-guide-container w-full h-screen relative"
            style={{ background: "rgb(5, 5, 7)" }}
        />
    );
}

// ============================================================================
// EXPORTED COMPONENT
// ============================================================================

export function SizeGuide({ modelPath, annotations, measurements, onReady }: SizeGuideProps) {
    return (
        <ClientOnly
            fallback={
                <div className="w-full h-screen flex items-center justify-center bg-canvas">
                    <div className="text-accent-a font-mono text-xs tracking-widest animate-pulse">
                        INITIALIZING HOLOGRAM...
                    </div>
                </div>
            }
        >
            <SizeGuideScene modelPath={modelPath} annotations={annotations} measurements={measurements} onReady={onReady} />
        </ClientOnly>
    );
}
