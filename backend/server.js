import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import profileRoutes from './routes/profile.js';
import productRoutes from './routes/products.js';
import stripeRoutes from './routes/stripe.js';
import webhookRoutes from './routes/webhook.js';
import './config/database.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Stripe webhook must be mounted BEFORE express.json() — it needs raw body
app.use(webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use('/api', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', profileRoutes);
app.use('/api', productRoutes);
app.use('/api', stripeRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'operational', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`AERO-X API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
