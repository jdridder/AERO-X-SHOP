/**
 * Internal-only routes — called by the Next.js webhook API route, not by clients.
 *
 * Security model: every request must carry the X-Internal-Token header matching
 * the INTERNAL_WEBHOOK_SECRET env var.  This prevents external actors from
 * triggering order fulfilment without a verified Stripe signature.
 *
 * These routes are mounted WITHOUT the /api prefix so they are clearly
 * distinguished from public API endpoints.
 */

import 'dotenv/config';
import express from 'express';
import { fulfill } from '../services/FulfillmentService.js';

const router = express.Router();

const INTERNAL_TOKEN = process.env.INTERNAL_WEBHOOK_SECRET ?? '';

/**
 * Simple shared-secret guard for internal routes.
 * Rejects any request whose X-Internal-Token header doesn't match.
 */
function requireInternalToken(req, res, next) {
  if (!INTERNAL_TOKEN) {
    // If no secret is configured, refuse all calls to prevent accidental exposure.
    console.error('[Internal] INTERNAL_WEBHOOK_SECRET is not set — rejecting request');
    return res.status(503).json({ error: 'Internal routes not configured' });
  }
  if (req.headers['x-internal-token'] !== INTERNAL_TOKEN) {
    console.warn('[Internal] Rejected request with invalid X-Internal-Token');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/**
 * POST /internal/fulfill
 *
 * Accepts a normalised PaymentEvent (already signature-verified by the
 * Next.js webhook route) and runs the full fulfilment pipeline:
 *   – optional account creation
 *   – shipping address update
 *   – shipping estimate calculation
 *   – order row insertion
 *
 * Idempotent: FulfillmentService skips processing if an order for the same
 * payment_provider_id already exists (handles Stripe retries).
 */
router.post('/internal/fulfill', requireInternalToken, async (req, res) => {
  try {
    const { orderId, shipping } = await fulfill(req.body);
    res.status(200).json({
      success:      true,
      orderId,
      shippingTier: shipping.tier,
      deliveryEta:  shipping.displayRange,
    });
  } catch (err) {
    console.error('[Internal] Fulfilment error:', err);
    res.status(500).json({ error: 'Fulfilment failed' });
  }
});

export default router;
