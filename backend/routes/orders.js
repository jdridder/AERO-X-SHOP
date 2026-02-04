import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryGet, queryRun } from '../config/database.js';
import { validateAndCalculateTotal } from '../data/products.ts';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aero-x-secure-key-change-in-production';

router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = queryAll(
      'SELECT id, items, total_price, shipping_address, is_paid, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const parsedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items),
      shipping_address: JSON.parse(order.shipping_address),
      is_paid: order.is_paid === 1
    }));

    res.status(200).json({ orders: parsedOrders });
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/return/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = queryGet(
      'SELECT id, user_id, status FROM orders WHERE id = ?',
      [orderId]
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (order.status === 'return_initiated') {
      return res.status(400).json({ error: 'Return already initiated for this order.' });
    }

    queryRun(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['return_initiated', orderId]
    );

    res.status(200).json({
      message: 'Return initiated successfully.',
      orderId,
      status: 'return_initiated'
    });
  } catch (err) {
    console.error('Return order error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const { items, shipping_address } = req.body;
    const userId = req.user.userId;

    // Server-side price validation - ignore client-sent total_price
    const priceValidation = validateAndCalculateTotal(items);
    if (!priceValidation.valid) {
      return res.status(400).json({
        error: 'Invalid items in order.',
        details: priceValidation.errors
      });
    }

    // Use server-calculated price as source of truth
    const validatedTotalPrice = priceValidation.calculatedTotal;

    if (!shipping_address || typeof shipping_address !== 'object') {
      return res.status(400).json({ error: 'Shipping address is required.' });
    }

    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'email'];
    for (const field of requiredFields) {
      if (!shipping_address[field]) {
        return res.status(400).json({ error: `Shipping address missing field: ${field}` });
      }
    }

    const orderId = uuidv4();

    queryRun(
      'INSERT INTO orders (id, user_id, items, total_price, shipping_address, is_paid, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        orderId,
        userId,
        JSON.stringify(items),
        validatedTotalPrice,
        JSON.stringify(shipping_address),
        1,
        'processed'
      ]
    );

    res.status(201).json({
      message: 'Order created successfully.',
      orderId,
      status: 'processed',
      total_price: validatedTotalPrice
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Smart Checkout - Handles 3 cases:
// Case A: Authenticated user (auto-fill from DB)
// Case B: Guest with password (create account + order)
// Case C: Pure guest (no account, just order)
router.post('/smart-checkout', optionalAuth, async (req, res) => {
  try {
    const { items, shipping_address, password } = req.body;

    // Server-side price validation - ignore client-sent total_price
    const priceValidation = validateAndCalculateTotal(items);
    if (!priceValidation.valid) {
      return res.status(400).json({
        error: 'Invalid items in order.',
        details: priceValidation.errors
      });
    }

    // Use server-calculated price as source of truth
    const validatedTotalPrice = priceValidation.calculatedTotal;

    if (!shipping_address || typeof shipping_address !== 'object') {
      return res.status(400).json({ error: 'Shipping address is required.' });
    }

    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'email'];
    for (const field of requiredFields) {
      if (!shipping_address[field]) {
        return res.status(400).json({ error: `Shipping address missing field: ${field}` });
      }
    }

    let userId = null;
    let isNewAccount = false;
    let authToken = null;

    // CASE A: Authenticated User
    if (req.user && req.user.userId) {
      userId = req.user.userId;

      // Update user's stored shipping address
      const fullName = `${shipping_address.firstName} ${shipping_address.lastName}`;
      queryRun(
        'UPDATE users SET name = ?, shipping_address = ? WHERE id = ?',
        [fullName, JSON.stringify(shipping_address), userId]
      );
    }
    // CASE B: Guest with Password - Create account
    else if (password && password.length >= 8) {
      // Validate password strength
      if (!/[0-9]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain at least one digit.' });
      }
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain at least one uppercase letter.' });
      }

      // Check if email already exists
      const existingUser = queryGet('SELECT id FROM users WHERE email = ?', [shipping_address.email]);
      if (existingUser) {
        return res.status(409).json({
          error: 'An account with this email already exists. Please log in or use a different email.',
          code: 'EMAIL_EXISTS'
        });
      }

      // Create new account
      const hashedPassword = await bcrypt.hash(password, 12);
      const fullName = `${shipping_address.firstName} ${shipping_address.lastName}`;

      const result = queryRun(
        'INSERT INTO users (email, password, name, shipping_address) VALUES (?, ?, ?, ?)',
        [shipping_address.email, hashedPassword, fullName, JSON.stringify(shipping_address)]
      );

      userId = result.lastInsertRowid;
      isNewAccount = true;

      // Generate JWT for auto-login
      authToken = jwt.sign(
        { userId, email: shipping_address.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    }
    // CASE C: Pure Guest - No account creation
    // userId remains null

    // Create the order with server-validated price
    const orderId = uuidv4();

    queryRun(
      'INSERT INTO orders (id, user_id, items, total_price, shipping_address, is_paid, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        orderId,
        userId,
        JSON.stringify(items),
        validatedTotalPrice,
        JSON.stringify(shipping_address),
        1,
        'processed'
      ]
    );

    const response = {
      message: 'Order created successfully.',
      orderId,
      status: 'processed',
      total_price: validatedTotalPrice,
      isNewAccount,
      isGuest: userId === null
    };

    // Set auth cookie if new account was created
    if (authToken) {
      res.cookie('auth_token', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
      response.userId = userId;
      response.email = shipping_address.email;
    }

    res.status(201).json(response);
  } catch (err) {
    console.error('Smart checkout error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
