import express from 'express';
import { fulfill } from '../services/FulfillmentService.js';
import { detectProvider, getProvider } from '../services/paymentProviders/index.js';

const router = express.Router();

/**
 * POST /api/webhooks/payment
 *
 * Unified webhook gateway — provider-agnostic entry point for all payment events.
 *
 * ─── Request flow ───────────────────────────────────────────────────────────
 *  1. Detect provider from headers (stripe-signature / paypal-transmission-id).
 *  2. Retrieve the matching provider adapter from the registry.
 *  3. Delegate signature verification to the adapter (throws on failure → 400).
 *  4. Normalise the raw event to a standard PaymentEvent via adapter.normalizeEvent().
 *  5. Route the event type to FulfillmentService or logging.
 *
 * IMPORTANT: This route uses express.raw() — it MUST be mounted BEFORE
 * express.json() in server.js so the raw body is preserved for HMAC verification.
 */
router.post(
  '/api/webhooks/payment',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    // ── 1. Identify provider ───────────────────────────────────────────
    const providerName = detectProvider(req.headers);
    if (!providerName) {
      console.warn('[WebhookGateway] Unrecognised provider — no matching signature header');
      return res.status(400).json({ error: 'Unknown payment provider' });
    }

    // ── 2. Retrieve adapter ────────────────────────────────────────────
    let provider;
    try {
      provider = getProvider(providerName);
    } catch (err) {
      console.error('[WebhookGateway] Provider lookup failed:', err.message);
      return res.status(400).json({ error: err.message });
    }

    // ── 3. Verify webhook signature ────────────────────────────────────
    let providerEvent;
    try {
      providerEvent = provider.verifySignature(req.body, req.headers);
    } catch (err) {
      console.error(`[WebhookGateway] ${providerName} signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ── 4. Normalise to PaymentEvent ───────────────────────────────────
    const { type, data: paymentEvent } = provider.normalizeEvent(providerEvent);

    // ── 5. Dispatch ────────────────────────────────────────────────────
    try {
      switch (type) {
        case 'payment.succeeded':
          await fulfill(paymentEvent);
          break;

        case 'payment.failed':
          console.warn(
            `[WebhookGateway] Payment failed — provider: ${providerName}, ` +
            `id: ${paymentEvent?.providerOrderId}, ` +
            `email: ${paymentEvent?.customerEmail}`
          );
          break;

        default:
          // Intentionally unhandled event — acknowledge and move on
          break;
      }
    } catch (err) {
      console.error('[WebhookGateway] Fulfillment error:', err);
      // Return 500 so the provider retries the event
      return res.status(500).json({ error: 'Fulfillment error' });
    }

    // Acknowledge receipt — providers expect a 2xx response quickly
    res.json({ received: true });
  }
);

export default router;
