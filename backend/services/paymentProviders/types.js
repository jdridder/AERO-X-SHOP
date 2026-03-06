/**
 * Normalized, provider-agnostic payment event.
 * Every provider adapter must produce this shape via normalizeEvent().
 *
 * @typedef {Object} PaymentEvent
 * @property {string}  providerOrderId  - Provider's unique transaction/capture ID.
 * @property {string}  provider         - 'stripe' | 'paypal' | ...
 * @property {number}  totalAmount      - Amount in smallest currency unit (cents / pence).
 * @property {string}  currency         - ISO 4217 lowercase ('eur', 'usd').
 * @property {string}  customerEmail
 * @property {Object}  shippingAddress  - Normalised to { firstName, lastName, address,
 *                                        city, postalCode, country, email }.
 * @property {Object}  metadata         - Provider-specific passthrough data
 *                                        (items JSON, user_id, hashed_password, etc.)
 */

/**
 * Abstract base class for payment provider adapters.
 * Concrete implementations must override verifySignature() and normalizeEvent().
 */
export class BasePaymentProvider {
  /**
   * Verify the authenticity of an incoming webhook request.
   * Must throw an Error if verification fails — the gateway treats any throw
   * as a 400 response so Stripe / PayPal will retry the event.
   *
   * @param {Buffer}  rawBody  - Raw request body (before JSON parsing).
   * @param {Object}  headers  - Request headers map.
   * @returns {Object}          Parsed provider-specific event object.
   * @throws  {Error}           On signature mismatch or missing headers.
   */
  verifySignature(rawBody, headers) {
    throw new Error(`verifySignature() must be implemented by ${this.constructor.name}`);
  }

  /**
   * Map a verified provider event to a normalised { type, data } pair.
   *
   * Return values:
   *   { type: 'payment.succeeded', data: PaymentEvent }
   *   { type: 'payment.failed',    data: PaymentEvent }
   *   { type: 'unhandled',         data: null }          — safe to ignore
   *
   * @param  {Object} providerEvent - Raw event from verifySignature().
   * @returns {{ type: string, data: import('./types.js').PaymentEvent | null }}
   */
  normalizeEvent(providerEvent) {
    throw new Error(`normalizeEvent() must be implemented by ${this.constructor.name}`);
  }
}
