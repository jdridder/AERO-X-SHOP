import express from 'express';
import bcrypt from 'bcryptjs';
import { queryGet, queryRun } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    const user = queryGet(
      'SELECT id, email, name, shipping_address, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
      userId: user.id,
      email: user.email,
      name: user.name || null,
      shippingAddress: user.shipping_address ? JSON.parse(user.shipping_address) : null,
      createdAt: user.created_at
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update user profile (name and shipping address)
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, shippingAddress } = req.body;

    // Validate shipping address if provided
    if (shippingAddress && typeof shippingAddress === 'object') {
      const requiredFields = ['firstName', 'lastName', 'address', 'city', 'postalCode'];
      for (const field of requiredFields) {
        if (shippingAddress[field] && typeof shippingAddress[field] !== 'string') {
          return res.status(400).json({ error: `Invalid ${field} format.` });
        }
      }
    }

    queryRun(
      'UPDATE users SET name = ?, shipping_address = ? WHERE id = ?',
      [
        name || null,
        shippingAddress ? JSON.stringify(shippingAddress) : null,
        userId
      ]
    );

    res.status(200).json({
      message: 'Profile updated successfully.',
      name,
      shippingAddress
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Change password
router.put('/profile/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must contain at least one numeric digit.' });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must contain at least one uppercase letter.' });
    }

    // Get current user
    const user = queryGet('SELECT password FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    queryRun('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
