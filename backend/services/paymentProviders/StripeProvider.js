import 'dotenv/config';
import Stripe from 'stripe';
import { BasePaymentProvider } from './types.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

/**
 * Stripe adapter — implements BasePaymentProvider for Stripe webhook events.
 *
 * Signature verification uses HMAC-SHA256 via stripe.webhooks.constructEvent(),
 * which requires the raw (un-parsed) request body.
 *
 * Supported event → normalised type mapping:
 *   payment_intent.succeeded   → payment.succeeded
 *   payment_intent.payment_failed → payment.failed
 */
export class StripeProvider extends BasePaymentProvider {
  /**
   * @param {Buffer}  rawBody
   * @param {Object}  headers  - Must contain 'stripe-signature'.
   * @returns {import('stripe').Stripe.Event}
   * @throws  {Error}  On missing header or signature mismatch.
   */
  
  verifySignature(rawBody, headers) {
    const sig = headers['stripe-signature'];
    if (!sig) throw new Error('Missing stripe-signature header');
    return stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }

  /**
   * @param {import('stripe').Stripe.Event} stripeEvent
   * @returns {{ type: string, data: import('./types.js').PaymentEvent | null }}
   */
  normalizeEvent(stripeEvent) {
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded': {
        const pi = stripeEvent.data.object;
        const shippingAddress = safeParseJSON(pi.metadata.shipping_address, {});
        return {
          type: 'payment.succeeded',
          data: {
            providerOrderId: pi.id,
            provider: 'stripe',
            totalAmount: pi.amount,
            currency: pi.currency,
            customerEmail: pi.receipt_email || shippingAddress.email || '',
            shippingAddress,
            metadata: pi.metadata,
          },
        };
      }

      case 'payment_intent.payment_failed': {
        const pi = stripeEvent.data.object;
        const shippingAddress = safeParseJSON(pi.metadata?.shipping_address, {});
        return {
          type: 'payment.failed',
          data: {
            providerOrderId: pi.id,
            provider: 'stripe',
            totalAmount: pi.amount,
            currency: pi.currency,
            customerEmail: pi.receipt_email || shippingAddress.email || '',
            shippingAddress,
            metadata: pi.metadata ?? {},
          },
        };
      }

      default:
        return { type: 'unhandled', data: null };
    }
  }
}

function safeParseJSON(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}
