import bcrypt from 'bcryptjs';
import express from 'express';
import Stripe from 'stripe';
import { validateAndCalculateTotal } from '../data/products.ts';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
});

// POST /api/create-payment-intent
// Creates a Stripe PaymentIntent with server-validated pricing.
// Metadata carries everything the webhook needs to fulfil the order.
router.post('/create-payment-intent', optionalAuth, async (req, res) => {
  try {
    const { items, shipping_address, password } = req.body;

    // ── Validate items + calculate total server-side ──────────
    const priceValidation = validateAndCalculateTotal(items);
    if (!priceValidation.valid) {
      return res.status(400).json({
        error: 'Invalid items in order.',
        details: priceValidation.errors,
      });
    }

    // ── Validate shipping address ────────────────────────────
    if (!shipping_address || typeof shipping_address !== 'object') {
      return res.status(400).json({ error: 'Shipping address is required.' });
    }

    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'email'];
    for (const field of requiredFields) {
      if (!shipping_address[field]) {
        return res.status(400).json({ error: `Shipping address missing field: ${field}` });
      }
    }

    // ── Build metadata for webhook fulfillment ───────────────
    const amountInCents = Math.round(priceValidation.calculatedTotal * 100);

    const metadata = {
      items: JSON.stringify(items),
      shipping_address: JSON.stringify(shipping_address),
    };

    // Authenticated user
    if (req.user && req.user.userId) {
      metadata.user_id = String(req.user.userId);
    }

    // Guest wants to create account — hash password now so the
    // webhook doesn't need to deal with plaintext
    if (password && password.length >= 8 && !(req.user && req.user.userId)) {
      metadata.hashed_password = await bcrypt.hash(password, 12);
      metadata.account_email = shipping_address.email;
    }

    // ── Create PaymentIntent ─────────────────────────────────
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata,
      receipt_email: shipping_address.email,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Create payment intent error:', err);
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
});

export default router;
