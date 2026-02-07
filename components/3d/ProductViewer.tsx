"use client";

import { ClientOnly } from "@/components/ui/ClientOnly";
import { Environment, ScrollControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";

interface ModelProps {
    [key: string]: unknown;
}

function Model(props: ModelProps) {
    const gltf = useGLTF('/models/track-athlete-shirt.glb');
    const nodes = gltf.nodes as Record<string, THREE.Mesh>;
    const materials = gltf.materials as Record<string, THREE.Material>;

    return (
        <group {...props} dispose={null}>
            <mesh geometry={nodes.Mesh_0_1.geometry} material={materials.Material_0} />
            <mesh geometry={nodes.Mesh_0_2.geometry} material={materials.Material_1} />
            <mesh geometry={nodes.Mesh_0_3.geometry} material={materials.Material_2} />
            <mesh geometry={nodes.Mesh_0_4.geometry} material={materials.Material_3} />
            <mesh geometry={nodes.Mesh_0_5.geometry} material={materials.Material_4} />
            <mesh geometry={nodes.Mesh_0_6.geometry} material={materials.Material_5} />
            <mesh geometry={nodes.Mesh_0_7.geometry} material={materials.Material_6} />
            <mesh geometry={nodes.Mesh_0_8.geometry} material={materials.Material_7} />
            <mesh geometry={nodes.Mesh_0_9.geometry} material={materials.Material_8} />
            <mesh geometry={nodes.Mesh_0_10.geometry} material={materials.Material_9} />
            <mesh geometry={nodes.Mesh_0_11.geometry} material={materials.Material_10} />
            <mesh geometry={nodes.Mesh_0_12.geometry} material={materials.Material_11} />
            <mesh geometry={nodes.Mesh_0_13.geometry} material={materials.Material_12} />
            <mesh geometry={nodes.Mesh_0_14.geometry} material={materials.Material_13} />
            <mesh geometry={nodes.Mesh_0_15.geometry} material={materials.Material_14} />
            <mesh geometry={nodes.Mesh_0_16.geometry} material={materials.Material_15} />
            <mesh geometry={nodes.Mesh_0_17.geometry} material={materials.Material_16} />
            <mesh geometry={nodes.Mesh_0_18.geometry} material={materials.Material_17} />
            <mesh geometry={nodes.Mesh_0_19.geometry} material={materials.Material_18} />
            <mesh geometry={nodes.Mesh_0_20.geometry} material={materials.Material_19} />
            <mesh geometry={nodes.Mesh_0_21.geometry} material={materials.Material_20} />
            <mesh geometry={nodes.Mesh_0_22.geometry} material={materials.Material_21} />
            <mesh geometry={nodes.Mesh_0_23.geometry} material={materials.Material_22} />
            <mesh geometry={nodes.Mesh_0_24.geometry} material={materials.Material_23} />
            <mesh geometry={nodes.Mesh_0_25.geometry} material={materials.Material_24} />
            <mesh geometry={nodes.Mesh_0_26.geometry} material={materials.Material_25} />
            <mesh geometry={nodes.Mesh_0_27.geometry} material={materials.Material_26} />
            <mesh geometry={nodes.Mesh_0_28.geometry} material={materials.Material_27} />
            <mesh geometry={nodes.Mesh_0_29.geometry} material={materials.Material_28} />
            <mesh geometry={nodes.Mesh_0_30.geometry} material={materials.Material_29} />
            <mesh geometry={nodes.Mesh_0_31.geometry} material={materials.Material_30} />
            <mesh geometry={nodes.Mesh_0_32.geometry} material={materials.Material_31} />
            <mesh geometry={nodes.Mesh_0_33.geometry} material={materials.Material_32} />
            <mesh geometry={nodes.Mesh_0_34.geometry} material={materials.Material_33} />
            <mesh geometry={nodes.Mesh_0_35.geometry} material={materials.Material_34} />
            <mesh geometry={nodes.Mesh_0_36.geometry} material={materials.Material_35} />
            <mesh geometry={nodes.Mesh_0_37.geometry} material={materials.Material_36} />
            <mesh geometry={nodes.Mesh_0_38.geometry} material={materials.Material_37} />
            <mesh geometry={nodes.Mesh_0_39.geometry} material={materials.Material_38} />
            <mesh geometry={nodes.Mesh_0_40.geometry} material={materials.Material_39} />
        </group>
    );
}
useGLTF.preload('/track-athlete-shirt.glb')

export function ProductViewer() {
    return (
        <ClientOnly>
            <div className="w-full h-screen absolute top-0 left-0 -z-10 bg-canvas">
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                    <color attach="background" args={["#050507"]} />
                    <fog attach="fog" args={["#050507", 5, 20]} />
                    <ambientLight intensity={1.4} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4D4DFF" />

                    <ScrollControls pages={3} damping={0.2}>
                            <Suspense fallback={null}/>
                                <Model/>
                            <Suspense/>
                    </ScrollControls>

                    <Environment preset="city" />
                </Canvas>
            </div>
        </ClientOnly>
    );
}
