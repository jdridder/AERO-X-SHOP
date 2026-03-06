import { v4 as uuidv4 } from 'uuid';
import { queryGet, queryRun } from '../config/database.js';
import { calculateEstimatedArrival } from './ShippingService.js';

/**
 * FulfillmentService — provider-agnostic order creation.
 *
 * Receives a normalised PaymentEvent (any provider), then:
 *   1. Optionally creates a user account if guest checked out with a password.
 *   2. Updates the shipping address for returning authenticated users.
 *   3. Calculates an estimated delivery window via ShippingService.
 *   4. Persists the order in the database.
 *
 * This function has zero knowledge of Stripe, PayPal, or any other provider.
 * New payment providers plug in at the webhook gateway layer.
 *
 * @param  {import('./paymentProviders/types.js').PaymentEvent} paymentEvent
 * @returns {Promise<{
 *   orderId:  string,
 *   shipping: import('./ShippingService.js').EstimatedArrivalResult,
 * }>}
 */
export async function fulfill(paymentEvent) {
  const { providerOrderId, totalAmount, currency, shippingAddress, metadata } = paymentEvent;

  // ── Idempotency guard ─────────────────────────────────────────────────────
  // Stripe (and other providers) retry an event when a 2xx is not received in
  // time.  If an order for this payment ID already exists, return it immediately
  // so no duplicate records are created.
  const existingOrder = queryGet(
    'SELECT id FROM orders WHERE payment_provider_id = ?',
    [providerOrderId]
  );
  if (existingOrder) {
    console.log(`[Fulfillment] Idempotent skip — order ${existingOrder.id} already exists for ${providerOrderId}`);
    return { orderId: existingOrder.id, shipping: calculateEstimatedArrival(shippingAddress) };
  }
  // ─────────────────────────────────────────────────────────────────────────

  const totalPrice = totalAmount / 100; // cents → main currency unit
  const items = safeParseJSON(metadata.items, []);

  let userId = metadata.user_id ? Number(metadata.user_id) : null;

  // ── 1. Account creation for guest checkout with password ──────────────
  if (metadata.hashed_password && metadata.account_email) {
    // Race-condition guard: a prior webhook delivery may have already created this account.
    const existing = queryGet('SELECT id FROM users WHERE email = ?', [metadata.account_email]);

    if (!existing) {
      const fullName = buildFullName(shippingAddress);
      const result = queryRun(
        'INSERT INTO users (email, password, name, shipping_address) VALUES (?, ?, ?, ?)',
        [
          metadata.account_email,
          metadata.hashed_password,
          fullName,
          JSON.stringify(shippingAddress),
        ]
      );
      userId = result.lastInsertRowid;
      console.log(`[Fulfillment] Pilot account created: ${metadata.account_email} (id ${userId})`);
    } else {
      userId = existing.id;
      console.log(userId)
    }
  }

  // ── 2. Update shipping address for authenticated users ────────────────
  if (userId && metadata.user_id) {
    const fullName = buildFullName(shippingAddress);
    queryRun(
      'UPDATE users SET name = ?, shipping_address = ? WHERE id = ?',
      [fullName, JSON.stringify(shippingAddress), userId]
    );
  }

  // ── 3. Estimate delivery window ───────────────────────────────────────
  const shipping = calculateEstimatedArrival(shippingAddress);

  // ── 4. Persist order ──────────────────────────────────────────────────
  const orderId = uuidv4();

  queryRun(
    `INSERT INTO orders
       (id, user_id, items, total_price, shipping_address, is_paid, status, payment_provider_id)
     VALUES (?, ?, ?, ?, ?, 1, 'processed', ?)`,
    [
      orderId,
      userId,
      JSON.stringify(items),
      totalAmount,
      JSON.stringify(shippingAddress),
      providerOrderId,
    ]
  );

  console.log(
    `[Fulfillment] Order ${orderId} fulfilled — ` +
    `${currency.toUpperCase()} ${totalPrice.toFixed(2)} — ` +
    `ETA ${shipping.displayRange} (${shipping.tier})`
  );

  return { orderId, shipping };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildFullName({ firstName = '', lastName = '' } = {}) {
  return `${firstName} ${lastName}`.trim();
}

function safeParseJSON(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}
