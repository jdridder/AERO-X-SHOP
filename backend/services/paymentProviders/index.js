import { StripeProvider } from './StripeProvider.js';
import { PayPalProvider } from './PayPalProvider.js';

/**
 * Provider registry — maps provider names to singleton adapter instances.
 * Adding a new fintech supplier only requires:
 *   1. Create MyProvider.js extending BasePaymentProvider.
 *   2. Import + register it here.
 *   3. Add its header fingerprint to detectProvider().
 * No changes to the gateway route or FulfillmentService.
 */
const PROVIDERS = {
  stripe: new StripeProvider(),
  paypal: new PayPalProvider(),
};

/**
 * Identify the payment provider from webhook request headers.
 * Each provider sends a unique signature header.
 *
 * @param  {Object} headers - Express req.headers (lower-cased).
 * @returns {'stripe' | 'paypal' | null}
 */
export function detectProvider(headers) {
  if (headers['stripe-signature'])      return 'stripe';
  if (headers['paypal-transmission-id']) return 'paypal';
  return null;
}

/**
 * Retrieve the adapter instance for a named provider.
 *
 * @param  {string} name - Provider key from detectProvider().
 * @returns {import('./types.js').BasePaymentProvider}
 * @throws  {Error}  For unknown provider names.
 */
export function getProvider(name) {
  const provider = PROVIDERS[name];
  if (!provider) throw new Error(`Unknown payment provider: "${name}"`);
  return provider;
}
