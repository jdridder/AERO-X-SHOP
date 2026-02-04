import express from 'express';
import { products } from '../data/products.ts';

const router = express.Router();

// Fields that should never be exposed to clients
// Currently all fields are safe, but this provides a pattern for future sensitive data
const SENSITIVE_FIELDS = [
  'vendor_margin',
  'internal_sku',
  'cost_price',
  'supplier_id'
];

// Strip sensitive fields from product objects
function sanitizeProduct(product) {
  const sanitized = { ...product };
  for (const field of SENSITIVE_FIELDS) {
    delete sanitized[field];
  }
  return sanitized;
}

// GET /api/products - Fetch all products (public endpoint)
router.get('/products', (req, res) => {
  try {
    const sanitizedProducts = products.map(sanitizeProduct);
    res.status(200).json({ products: sanitizedProducts });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/products/:slug - Fetch single product by slug (public endpoint)
router.get('/products/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const product = products.find(p => p.slug === slug);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.status(200).json({ product: sanitizeProduct(product) });
  } catch (err) {
    console.error('Fetch product error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
