import express from 'express';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { queryGet, queryRun } from '../config/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aero-x-secure-key-change-in-production';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
});

// POST /webhook
// Stripe sends events here. Must use raw body for signature verification.
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ── Handle events ──────────────────────────────────────────
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error(
          `Payment failed for PI ${paymentIntent.id}:`,
          paymentIntent.last_payment_error?.message
        );
        break;
      }
      default:
        // Unhandled event type — safe to ignore
        break;
    }

    res.json({ received: true });
  }
);

// ── Fulfillment: create order (+ optional account) ───────────
async function handlePaymentSuccess(paymentIntent) {
  const { metadata } = paymentIntent;

  const items = JSON.parse(metadata.items);
  const shippingAddress = JSON.parse(metadata.shipping_address);
  const totalPrice = paymentIntent.amount / 100; // cents → EUR

  let userId = metadata.user_id ? Number(metadata.user_id) : null;

  // ── Account creation (guest with password) ───────────────
  if (metadata.hashed_password && metadata.account_email) {
    // Check if email already registered (race condition guard)
    const existingUser = queryGet(
      'SELECT id FROM users WHERE email = ?',
      [metadata.account_email]
    );

    if (!existingUser) {
      const fullName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
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
      console.log(`New account created for ${metadata.account_email} (userId: ${userId})`);
    } else {
      userId = existingUser.id;
    }
  }

  // ── Update shipping address for existing users ───────────
  if (userId && metadata.user_id) {
    const fullName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
    queryRun(
      'UPDATE users SET name = ?, shipping_address = ? WHERE id = ?',
      [fullName, JSON.stringify(shippingAddress), userId]
    );
  }

  // ── Create order ─────────────────────────────────────────
  const orderId = uuidv4();

  queryRun(
    'INSERT INTO orders (id, user_id, items, total_price, shipping_address, is_paid, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      orderId,
      userId,
      JSON.stringify(items),
      totalPrice,
      JSON.stringify(shippingAddress),
      1,
      'processed',
    ]
  );

  console.log(
    `Order ${orderId} created from PI ${paymentIntent.id} — €${totalPrice}`
  );
}

export default router;
