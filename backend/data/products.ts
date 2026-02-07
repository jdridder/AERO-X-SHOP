// Server-side product catalog - Source of truth for pricing
// Prices are stored in cents to avoid floating point issues

export type Product = {
    id: string;
    slug: string;
    name: string;
    price: number;
    category: "APPAREL" | "EQUIPMENT" | "ACCESSORY";
    image_url: string;
    tech_stats: {
        weight?: string;
        drag_coefficient?: string;
        temperature?: string;
        occasion?: string;
        fit?: string;
    };
    featured: boolean;
};

export const products: Product[] = [
    {
        id: "prod_001",
        slug: "heart-beat-arm-sleeve",
        name: "HEART BEAT ARM SLEEVE",
        price: 37,
        category: "ACCESSORY",
        image_url: "https://images.unsplash.com/photo-1556906781-9a412961d28c?w=800&q=80",
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
        slug: "track-athlete-shirt",
        name: "TRACK ATHLETE T-SHIRT",
        price: 49,
        category: "APPAREL",
        image_url: "https://images.unsplash.com/photo-1579298245158-33e8f568f7d3?w=800&q=80",
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
