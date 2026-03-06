import { BasePaymentProvider } from './types.js';

/**
 * PayPalProvider — Extensibility demonstration.
 *
 * ─── How to activate ──────────────────────────────────────────────────────
 *  1. npm install @paypal/payouts-sdk  (or the newer @paypal/checkout-server-sdk)
 *  2. Set env vars:
 *       PAYPAL_CLIENT_ID=...
 *       PAYPAL_CLIENT_SECRET=...
 *       PAYPAL_WEBHOOK_ID=...     ← from PayPal Developer Dashboard
 *  3. Un-comment the verifySignature() body below.
 *  4. Register a PayPal webhook pointing to POST /api/webhooks/payment.
 *
 * ─── PayPal event shape (PAYMENT.CAPTURE.COMPLETED) ──────────────────────
 * {
 *   event_type: 'PAYMENT.CAPTURE.COMPLETED',
 *   resource: {
 *     id:           'CAPTURE_ID',
 *     amount:       { value: '49.00', currency_code: 'EUR' },
 *     payer:        { email_address: 'customer@example.com' },
 *     purchase_units: [{
 *       shipping: {
 *         name:    { full_name: 'Jane Doe' },
 *         address: {
 *           address_line_1: '123 Main St',
 *           admin_area_2:   'Berlin',
 *           postal_code:    '10115',
 *           country_code:   'DE',
 *         }
 *       }
 *     }],
 *     custom_id: JSON.stringify({ items, user_id?, hashed_password?, account_email? })
 *   }
 * }
 * ─────────────────────────────────────────────────────────────────────────
 */
export class PayPalProvider extends BasePaymentProvider {
  /**
   * Verify PayPal webhook authenticity via WEBHOOK_ID + signature headers.
   *
   * Required headers (sent by PayPal on every webhook):
   *   paypal-auth-algo, paypal-cert-url, paypal-transmission-id,
   *   paypal-transmission-sig, paypal-transmission-time
   *
   * @param {Buffer}  rawBody
   * @param {Object}  headers
   * @returns {Object}  Parsed PayPal event.
   * @throws  {Error}   When signature invalid or SDK not installed.
   */
  verifySignature(rawBody, headers) {
    // ── TODO: Replace stub with real SDK call ───────────────────────────
    //
    // import paypal from '@paypal/checkout-server-sdk';
    //
    // const verified = await paypal.notifications.WebhookEvent.verifyAsync(
    //   process.env.PAYPAL_CLIENT_ID,
    //   process.env.PAYPAL_CLIENT_SECRET,
    //   {
    //     'paypal-auth-algo':        headers['paypal-auth-algo'],
    //     'paypal-cert-url':         headers['paypal-cert-url'],
    //     'paypal-transmission-id':  headers['paypal-transmission-id'],
    //     'paypal-transmission-sig': headers['paypal-transmission-sig'],
    //     'paypal-transmission-time':headers['paypal-transmission-time'],
    //   },
    //   rawBody.toString(),
    //   process.env.PAYPAL_WEBHOOK_ID
    // );
    // if (verified.verification_status !== 'SUCCESS') {
    //   throw new Error('PayPal webhook signature verification failed');
    // }
    // return JSON.parse(rawBody.toString());
    // ────────────────────────────────────────────────────────────────────

    throw new Error(
      'PayPalProvider is not yet configured. ' +
      'Set PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID ' +
      'and install @paypal/checkout-server-sdk.'
    );
  }

  /**
   * Maps PayPal's PAYMENT.CAPTURE.COMPLETED → normalised PaymentEvent.
   *
   * @param {Object} paypalEvent
   * @returns {{ type: string, data: import('./types.js').PaymentEvent | null }}
   */
  normalizeEvent(paypalEvent) {
    if (paypalEvent.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return { type: 'unhandled', data: null };
    }

    const resource = paypalEvent.resource;
    const amountCents = Math.round(parseFloat(resource.amount.value) * 100);
    const currency = resource.amount.currency_code.toLowerCase();

    // custom_id carries our metadata: items, user_id, hashed_password, account_email
    let metadata = {};
    try {
      metadata = resource.custom_id ? JSON.parse(resource.custom_id) : {};
    } catch { /* malformed custom_id — treat as empty */ }

    // Normalise PayPal address → our internal shippingAddress shape
    const ppAddr = resource.purchase_units?.[0]?.shipping ?? {};
    const ppFullName = ppAddr.name?.full_name ?? '';
    const [firstName = '', ...rest] = ppFullName.split(' ');
    const lastName = rest.join(' ');
    const addr = ppAddr.address ?? {};

    const shippingAddress = {
      firstName,
      lastName,
      address:    addr.address_line_1 ?? '',
      city:       addr.admin_area_2   ?? '',
      postalCode: addr.postal_code    ?? '',
      country:    addr.country_code   ?? '',
      email:      resource.payer?.email_address ?? metadata.account_email ?? '',
    };

    return {
      type: 'payment.succeeded',
      data: {
        providerOrderId: resource.id,
        provider: 'paypal',
        totalAmount: amountCents,
        currency,
        customerEmail: shippingAddress.email,
        shippingAddress,
        metadata,
      },
    };
  }
}
