// Server-side product catalog - Source of truth for pricing

// ── Rich product sub-types ──────────────────────────────────────

export type ProductImage = {
    src: string;
    alt: string;
};

export type ProductAnnotation = {
    id: string;
    label: string;
    value: string;
};

export type SizeEntry = {
    size: string;
    measurements: Record<string, string>;
};

export type StorytellingBlock = {
    title: string;
    text: string;
    image: string;
    layoutDirection: "normal" | "reversed";
};

// Measurement arrow definition for 3D Size Guide.
// Coordinates are [0-1] fractions of the model bounding box:
//   0 = bbox min, 0.5 ≈ center, 1 = bbox max.
export type MeasurementDef =
    | {
          id: string;
          type: "ring";
          stagger: number;
          /** Width position as fraction [0-1] of bbox width */
          xFraction: number;
          /** Height position as fraction [0-1] of bbox height */
          yFraction: number;
          /** X-radius as fraction of bbox width */
          zFraction: number;
          rxFraction: number;
          /** Z-radius as fraction of bbox depth */
          rzFraction: number;
          /** Optional tilt around the Z-axis in degrees [-90, 90]. Default: 0 */
          tiltDeg?: number;
      }
    | {
          id: string;
          type: "line";
          stagger: number;
          /** Start point as [x, y, z] fractions of bbox */
          start: [number, number, number];
          /** End point as [x, y, z] fractions of bbox */
          end: [number, number, number];
      };

// ── Main product type ───────────────────────────────────────────

export type Product = {
    id: string;
    slug: string;
    name: string;
    price: number;
    category: "APPAREL" | "EQUIPMENT" | "ACCESSORY";
    image_url: string;
    images?: ProductImage[];
    threeModelPath?: string;
    annotations?: ProductAnnotation[];
    availableSizes?: SizeEntry[];
    measurements?: MeasurementDef[];
    storytelling?: StorytellingBlock[];
    tech_stats: {
        weight?: string;
        drag_coefficient?: string;
        temperature?: string;
        occasion?: string;
        fit?: string;
    };
    featured: boolean;
};

// ── Product catalog ─────────────────────────────────────────────

export const products: Product[] = [
    {
        id: "prod_001",
        slug: "heart-beat-arm-sleeve",
        name: "HEART BEAT ARM SLEEVE",
        price: 37,
        category: "ACCESSORY",
        image_url: "/pictures/arm-sleeves/hearts-arm-sleeve.jpg",
        images: [
            { src: "/pictures/arm-sleeves/hearts-arm-sleeve.jpg", alt: "Heart Beat Arm Sleeve - Neutral" },
            { src: "/pictures/arm-sleeves/hearts-arm-sleeves-stretch.jpg", alt: "Heart Beat Arm Sleeve - Exercise" },
            { src: "/pictures/arm-sleeves/hearts-arm-sleeve-05.jpg", alt: "Heart Beat Arm Sleeve - Fabric" },
            { src: "/pictures/arm-sleeves/hearts-arm-sleeve-02.jpg", alt: "Heart Beat Arm Sleeve - Front View" },
            { src: "/pictures/arm-sleeves/hearts-arm-sleeve-01.jpg", alt: "Heart Beat Arm Sleeve - Back View" },
        ],
        threeModelPath: "/models/arm-sleeve.glb",
        annotations: [
            { id: "bicep", label: "A", value: "BICEP" },
            { id: "length", label: "B", value: "LENGTH" },
        ],
        measurements: [
            { id: "bicep", type: "ring", stagger: 0.15, xFraction: 0.32, yFraction: 0.75, zFraction: 0.66, rxFraction: 0.30, rzFraction: 0.30, tiltDeg: 30},
            { id: "length", type: "line", stagger: 0.25, start: [0.18, 0.90, 0.20], end: [0.86, 0.06, 0.84] },
        ],
        availableSizes: [
            { size: "XS", measurements: { bicep: '22-24 cm', length: '35 cm' } },
            { size: "S", measurements: { bicep: '24-26 cm', length: '37 cm' } },
            { size: "M", measurements: { bicep: '26-28 cm', length: '39 cm' } },
            { size: "L", measurements: { bicep: '28-30 cm', length: '41 cm' } },
            { size: "XL", measurements: { bicep: '30-32 cm', length: '43 cm' } },
        ],
        storytelling: [
            {
                title: "PERFORMANCE FABRIC",
                text: "Engineered from premium Lycra that moulds to your skin with zero drag. The ultra-lightweight 20g construction creates a second-skin fit that eliminates air resistance at the arm surface, allowing unrestricted movement with a drag coefficient of just 0.01.",
                image: "/pictures/arm-sleeves/hearts-arm-sleeve-05.jpg",
                layoutDirection: "normal",
            },
            {
                title: "VISIONARY DESIGN",
                text: "The signature Heart Beat pattern is more than aesthetic. Inspired by ECG waveforms, the raised texture channels create micro-turbulence at the fabric surface, disrupting the boundary layer for reduced aerodynamic drag at sprint velocities above 8 m/s.",
                image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
                layoutDirection: "reversed",
            },
            {
                title: "ATHLETE-ENGINEERED",
                text: "Developed alongside sprinters and middle-distance runners at the Dortmund wind tunnel facility. The graduated compression profile provides 18 mmHg at the wrist tapering to 12 mmHg at the bicep, promoting venous return without restricting muscle contraction.",
                image: "https://images.unsplash.com/photo-1556906781-9a412961d28c?w=800&q=80",
                layoutDirection: "normal",
            },
        ],
        tech_stats: {
            drag_coefficient: "0.01",
            weight: "20 g",
            temperature: "7°C",
            occasion: "hard workout",
            fit: "0.8 (tight)",
        },
        featured: true,
    },
    {
        id: "prod_002",
        slug: "camouflage-arm-sleeve",
        name: "CLOSE COMBAT ARM SLEEVE",
        price: 37,
        category: "ACCESSORY",
        image_url: "/pictures/arm-sleeves/gray-camo-arm-sleeve.jpg",
        images: [
            { src: "/pictures/arm-sleeves/gray-camo-arm-sleeve.jpg", alt: "Gray Camo Arm Sleeve - Neutral" },
            { src: "/pictures/arm-sleeves/gray-camo-arm-sleeve-gym.jpg", alt: "Gray Camo Arm Sleeve - Gym" },
            { src: "/pictures/arm-sleeves/gray-camo-arm-sleeve-02.jpg", alt: "Gray Camo Arm Sleeve - Front View" },
            { src: "/pictures/arm-sleeves/gray-camo-arm-sleeve-01.jpg", alt: "Gray Camo Arm Sleeve - Back View" },
            { src: "/pictures/arm-sleeves/gray-camo-arm-sleeve-05.jpg", alt: "Gray Camo Arm Sleeve - Fabric" },
        ],
        threeModelPath: "/models/arm-sleeve.glb",
        annotations: [
            { id: "bicep", label: "A", value: "BICEP" },
            { id: "length", label: "B", value: "LENGTH" },
        ],
        measurements: [
            { id: "bicep", type: "ring", stagger: 0.15, xFraction: 0.32, yFraction: 0.75, zFraction: 0.66, rxFraction: 0.30, rzFraction: 0.30, tiltDeg: 30},
            { id: "length", type: "line", stagger: 0.25, start: [0.18, 0.90, 0.20], end: [0.86, 0.06, 0.84] },
        ],
        availableSizes: [
            { size: "XS", measurements: { bicep: '22-24 cm', length: '35 cm' } },
            { size: "S", measurements: { bicep: '24-26 cm', length: '37 cm' } },
            { size: "M", measurements: { bicep: '26-28 cm', length: '39 cm' } },
            { size: "L", measurements: { bicep: '28-30 cm', length: '41 cm' } },
            { size: "XL", measurements: { bicep: '30-32 cm', length: '43 cm' } },
        ],
        storytelling: [
            {
                title: "PERFORMANCE FABRIC",
                text: "Engineered from premium Lycra that moulds to your skin with zero drag. The ultra-lightweight 20g construction creates a second-skin fit that eliminates air resistance at the arm surface, allowing unrestricted movement with a drag coefficient of just 0.01.",
                image: "/pictures/arm-sleeves/hearts-arm-sleeve-05.jpg",
                layoutDirection: "normal",
            },
            {
                title: "VISIONARY DESIGN",
                text: "The signature Heart Beat pattern is more than aesthetic. Inspired by ECG waveforms, the raised texture channels create micro-turbulence at the fabric surface, disrupting the boundary layer for reduced aerodynamic drag at sprint velocities above 8 m/s.",
                image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
                layoutDirection: "reversed",
            },
            {
                title: "ATHLETE-ENGINEERED",
                text: "Developed alongside sprinters and middle-distance runners at the Dortmund wind tunnel facility. The graduated compression profile provides 18 mmHg at the wrist tapering to 12 mmHg at the bicep, promoting venous return without restricting muscle contraction.",
                image: "https://images.unsplash.com/photo-1556906781-9a412961d28c?w=800&q=80",
                layoutDirection: "normal",
            },
        ],
        tech_stats: {
            drag_coefficient: "0.01",
            weight: "20 g",
            temperature: "7°C",
            occasion: "hard workout",
            fit: "0.8 (tight)",
        },
        featured: true,
    },
    {
        id: "prod_003",
        slug: "pink-arm-sleeve",
        name: "NEON PULSE ARM SLEEVE",
        price: 37,
        category: "ACCESSORY",
        image_url: "/pictures/arm-sleeves/pink-arm-sleeve.jpg",
        images: [
            { src: "/pictures/arm-sleeves/pink-arm-sleeve.jpg", alt: "Neon Pink Arm Sleeve - Neutral" },
            { src: "/pictures/arm-sleeves/pink-arm-sleeve-cycling.jpg", alt: "Neon Pink Arm Sleeve - Exercise" },
            { src: "/pictures/arm-sleeves/pink-arm-sleeve-03.jpg", alt: "Neon Pink Arm Sleeve - Fabric" },
            { src: "/pictures/arm-sleeves/pink-arm-sleeve-02.jpg", alt: "Neon Pink Arm Sleeve - Front View" },
            { src: "/pictures/arm-sleeves/pink-arm-sleeve-01.jpg", alt: "Neon Pink Arm Sleeve - Back View" },
        ],
        threeModelPath: "/models/arm-sleeve.glb",
        annotations: [
            { id: "bicep", label: "A", value: "BICEP" },
            { id: "length", label: "B", value: "LENGTH" },
        ],
        measurements: [
            { id: "bicep", type: "ring", stagger: 0.15, xFraction: 0.32, yFraction: 0.75, zFraction: 0.66, rxFraction: 0.30, rzFraction: 0.30, tiltDeg: 30},
            { id: "length", type: "line", stagger: 0.25, start: [0.18, 0.90, 0.20], end: [0.86, 0.06, 0.84] },
        ],
        availableSizes: [
            { size: "XS", measurements: { bicep: '22-24 cm', length: '35 cm' } },
            { size: "S", measurements: { bicep: '24-26 cm', length: '37 cm' } },
            { size: "M", measurements: { bicep: '26-28 cm', length: '39 cm' } },
            { size: "L", measurements: { bicep: '28-30 cm', length: '41 cm' } },
            { size: "XL", measurements: { bicep: '30-32 cm', length: '43 cm' } },
        ],
        storytelling: [
            {
                title: "PERFORMANCE FABRIC",
                text: "Engineered from premium Lycra that moulds to your skin with zero drag. The ultra-lightweight 20g construction creates a second-skin fit that eliminates air resistance at the arm surface, allowing unrestricted movement with a drag coefficient of just 0.01.",
                image: "/pictures/arm-sleeves/hearts-arm-sleeve-05.jpg",
                layoutDirection: "normal",
            },
            {
                title: "VISIONARY DESIGN",
                text: "The signature Heart Beat pattern is more than aesthetic. Inspired by ECG waveforms, the raised texture channels create micro-turbulence at the fabric surface, disrupting the boundary layer for reduced aerodynamic drag at sprint velocities above 8 m/s.",
                image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
                layoutDirection: "reversed",
            },
            {
                title: "ATHLETE-ENGINEERED",
                text: "Developed alongside sprinters and middle-distance runners at the Dortmund wind tunnel facility. The graduated compression profile provides 18 mmHg at the wrist tapering to 12 mmHg at the bicep, promoting venous return without restricting muscle contraction.",
                image: "https://images.unsplash.com/photo-1556906781-9a412961d28c?w=800&q=80",
                layoutDirection: "normal",
            },
        ],
        tech_stats: {
            drag_coefficient: "0.01",
            weight: "20 g",
            temperature: "7°C",
            occasion: "hard workout",
            fit: "0.8 (tight)",
        },
        featured: true,
    },
    {
        id: "prod_004",
        slug: "white-triangle-arm-sleeve",
        name: "MINT TRIAD ARM SLEEVE",
        price: 37,
        category: "ACCESSORY",
        image_url: "/pictures/arm-sleeves/green-arm-sleeve.jpg",
        images: [
            { src: "/pictures/arm-sleeves/green-arm-sleeve.jpg", alt: "Mint Triad Arm Sleeve - Neutral" },
            { src: "/pictures/arm-sleeves/green-arm-sleeve-05.jpg", alt: "Mint Triad Arm Sleeve - Exercise" },
            { src: "/pictures/arm-sleeves/green-arm-sleeve-02.jpg", alt: "Mint Triad Arm Sleeve - Front View" },
            { src: "/pictures/arm-sleeves/green-arm-sleeve-01.jpg", alt: "Mint Triad Arm Sleeve - Back View" },
            { src: "/pictures/arm-sleeves/pink-arm-sleeve-cycling.jpg", alt: "Mint Triad Arm Sleeve - Action" },
        ],
        threeModelPath: "/models/arm-sleeve.glb",
        annotations: [
            { id: "bicep", label: "A", value: "BICEP" },
            { id: "length", label: "B", value: "LENGTH" },
        ],
        measurements: [
            { id: "bicep", type: "ring", stagger: 0.15, xFraction: 0.32, yFraction: 0.75, zFraction: 0.66, rxFraction: 0.30, rzFraction: 0.30, tiltDeg: 30},
            { id: "length", type: "line", stagger: 0.25, start: [0.18, 0.90, 0.20], end: [0.86, 0.06, 0.84] },
        ],
        availableSizes: [
            { size: "XS", measurements: { bicep: '22-24 cm', length: '35 cm' } },
            { size: "S", measurements: { bicep: '24-26 cm', length: '37 cm' } },
            { size: "M", measurements: { bicep: '26-28 cm', length: '39 cm' } },
            { size: "L", measurements: { bicep: '28-30 cm', length: '41 cm' } },
            { size: "XL", measurements: { bicep: '30-32 cm', length: '43 cm' } },
        ],
        storytelling: [
            {
                title: "PERFORMANCE FABRIC",
                text: "Engineered from premium Lycra that moulds to your skin with zero drag. The ultra-lightweight 20g construction creates a second-skin fit that eliminates air resistance at the arm surface, allowing unrestricted movement with a drag coefficient of just 0.01.",
                image: "/pictures/arm-sleeves/hearts-arm-sleeve-05.jpg",
                layoutDirection: "normal",
            },
            {
                title: "VISIONARY DESIGN",
                text: "The signature Heart Beat pattern is more than aesthetic. Inspired by ECG waveforms, the raised texture channels create micro-turbulence at the fabric surface, disrupting the boundary layer for reduced aerodynamic drag at sprint velocities above 8 m/s.",
                image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
                layoutDirection: "reversed",
            },
            {
                title: "ATHLETE-ENGINEERED",
                text: "Developed alongside sprinters and middle-distance runners at the Dortmund wind tunnel facility. The graduated compression profile provides 18 mmHg at the wrist tapering to 12 mmHg at the bicep, promoting venous return without restricting muscle contraction.",
                image: "https://images.unsplash.com/photo-1556906781-9a412961d28c?w=800&q=80",
                layoutDirection: "normal",
            },
        ],
        tech_stats: {
            drag_coefficient: "0.01",
            weight: "20 g",
            temperature: "7°C",
            occasion: "hard workout",
            fit: "0.8 (tight)",
        },
        featured: true,
    },
    {
        id: "prod_005",
        slug: "bone-arm-sleeve",
        name: "X-RAY ARM SLEEVE",
        price: 37,
        category: "ACCESSORY",
        image_url: "/pictures/arm-sleeves/bone-arm-sleeve.jpg",
        images: [
            { src: "/pictures/arm-sleeves/bone-arm-sleeve.jpg", alt: "X-RAY Arm Sleeve - Neutral" },
            { src: "/pictures/arm-sleeves/gray-camo-arm-sleeve-02.jpg", alt: "X-RAY Arm Sleeve - Front View" },
            { src: "/pictures/arm-sleeves/gray-camo-arm-sleeve-01.jpg", alt: "X-RAY Arm Sleeve - Back View" },
        ],
        threeModelPath: "/models/arm-sleeve.glb",
        annotations: [
            { id: "bicep", label: "A", value: "BICEP" },
            { id: "length", label: "B", value: "LENGTH" },
        ],
        measurements: [
            { id: "bicep", type: "ring", stagger: 0.15, xFraction: 0.32, yFraction: 0.75, zFraction: 0.66, rxFraction: 0.30, rzFraction: 0.30, tiltDeg: 30},
            { id: "length", type: "line", stagger: 0.25, start: [0.18, 0.90, 0.20], end: [0.86, 0.06, 0.84] },
        ],
        availableSizes: [
            { size: "XS", measurements: { bicep: '22-24 cm', length: '35 cm' } },
            { size: "S", measurements: { bicep: '24-26 cm', length: '37 cm' } },
            { size: "M", measurements: { bicep: '26-28 cm', length: '39 cm' } },
            { size: "L", measurements: { bicep: '28-30 cm', length: '41 cm' } },
            { size: "XL", measurements: { bicep: '30-32 cm', length: '43 cm' } },
        ],
        storytelling: [
            {
                title: "PERFORMANCE FABRIC",
                text: "Engineered from premium Lycra that moulds to your skin with zero drag. The ultra-lightweight 20g construction creates a second-skin fit that eliminates air resistance at the arm surface, allowing unrestricted movement with a drag coefficient of just 0.01.",
                image: "/pictures/arm-sleeves/hearts-arm-sleeve-05.jpg",
                layoutDirection: "normal",
            },
            {
                title: "VISIONARY DESIGN",
                text: "The signature Heart Beat pattern is more than aesthetic. Inspired by ECG waveforms, the raised texture channels create micro-turbulence at the fabric surface, disrupting the boundary layer for reduced aerodynamic drag at sprint velocities above 8 m/s.",
                image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
                layoutDirection: "reversed",
            },
            {
                title: "ATHLETE-ENGINEERED",
                text: "Developed alongside sprinters and middle-distance runners at the Dortmund wind tunnel facility. The graduated compression profile provides 18 mmHg at the wrist tapering to 12 mmHg at the bicep, promoting venous return without restricting muscle contraction.",
                image: "https://images.unsplash.com/photo-1556906781-9a412961d28c?w=800&q=80",
                layoutDirection: "normal",
            },
        ],
        tech_stats: {
            drag_coefficient: "0.01",
            weight: "20 g",
            temperature: "7°C",
            occasion: "hard workout",
            fit: "0.8 (tight)",
        },
        featured: true,
    },
    {
        id: "prod_006",
        slug: "track-athlete-shirt",
        name: "TRACK ATHLETE T-SHIRT",
        price: 49,
        category: "APPAREL",
        image_url: "/pictures/Track-Athlete-Shirt-6.jpg",
        images: [
            { src: "/pictures/Track-Athlete-Shirt-6.jpg", alt: "Track Athlete Shirt - Front" },
            { src: "/pictures/Track-Athlete-Shirt-2.jpg", alt: "Track Athlete Shirt - Action" },
            { src: "/pictures/Track-Athlete-Shirt-1.jpg", alt: "Track Athlete Shirt - Training" },
        ],
        threeModelPath: "/models/male-tee-model.glb",
        annotations: [
            { id: "chest", label: "A", value: "CHEST" },
            { id: "length", label: "B", value: "LENGTH" },
            { id: "sleeve", label: "C", value: "SLEEVE" },
        ],
        measurements: [
            { id: "chest", type: "ring", stagger: 0.15, xFraction: 0.5, yFraction: 0.62, zFraction:0.5, rxFraction: 0.33, rzFraction: 0.53 },
            { id: "length", type: "line", stagger: 0.25, start: [0.32, 0.02, 0.68], end: [0.32, 0.97, 0.68] },
            { id: "sleeve", type: "line", stagger: 0.35, start: [0.80, 0.82, 0.63], end: [0.95, 0.60, 0.58] },
        ],
        availableSizes: [
            { size: "XS", measurements: { chest: '32-34"', length: '26"', sleeve: '7.5"' } },
            { size: "S", measurements: { chest: '34-36"', length: '27"', sleeve: '8"' } },
            { size: "M", measurements: { chest: '38-40"', length: '28"', sleeve: '8.5"' } },
            { size: "L", measurements: { chest: '42-44"', length: '29"', sleeve: '9"' } },
            { size: "XL", measurements: { chest: '46-48"', length: '30"', sleeve: '9.5"' } },
            { size: "XXL", measurements: { chest: '50-52"', length: '31"', sleeve: '10"' } },
        ],
        storytelling: [
            {
                title: "PERFORMANCE FABRIC",
                text: "Engineered from ultra-lightweight 85g mesh with a drag coefficient of just 0.1. The micro-perforated structure maximises airflow across the torso while maintaining structural integrity at velocities exceeding 10 m/s in controlled wind-tunnel conditions.",
                image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
                layoutDirection: "normal",
            },
            {
                title: "VISIONARY DESIGN",
                text: "Every seam placement is informed by computational fluid dynamics analysis. The offset shoulder seams eliminate drag-inducing ridges at the airflow separation point, while the contoured hem follows the body's natural aerodynamic profile to minimise wake turbulence.",
                image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
                layoutDirection: "reversed",
            },
            {
                title: "ATHLETE-ENGINEERED",
                text: "Developed with input from over 40 competitive track athletes across sprint, middle-distance, and field events. The 0.5 fit factor delivers a relaxed performance cut that doesn't compromise aerodynamic efficiency during easy training sessions and warm-ups.",
                image: "https://images.unsplash.com/photo-1579298245158-33e8f568f7d3?w=800&q=80",
                layoutDirection: "normal",
            },
        ],
        tech_stats: {
            drag_coefficient: "0.1",
            weight: "85 g",
            temperature: "18 °C",
            occasion: "easy workout",
            fit: "0.5 (normal)",
        },
        featured: true,
    },
];



// Create lookup map for O(1) price retrieval
export const productPriceMap = new Map(
  products.map((p) => [p.id, p.price])
);

// Validate and calculate total price from items array
// Returns { valid: boolean, calculatedTotal: number, errors: string[] }
interface CartItem {
  id: string;
  quantity?: number | string;
}
export function validateAndCalculateTotal(items: CartItem[]) {
  const errors: string[] = [];
  let calculatedTotal = 0;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return { valid: false, calculatedTotal: 0, errors: ['Items array is required and must not be empty.'] };
  }

  for (const item of items) {
    if (!item.id) {
      errors.push(`Item missing product ID.`);
      continue;
    }

    const serverPrice = productPriceMap.get(item.id);
    if (serverPrice === undefined) {
      errors.push(`Unknown product ID: ${item.id}`);
      continue;
    }

    const quantity = parseInt(String(item.quantity ?? 1), 10) || 1;
    if (quantity < 1 || quantity > 100) {
      errors.push(`Invalid quantity for ${item.id}: ${quantity}`);
      continue;
    }

    calculatedTotal += serverPrice * quantity;
  }

  return {
    valid: errors.length === 0,
    calculatedTotal,
    errors,
  };
}
