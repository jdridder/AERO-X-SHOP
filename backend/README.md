# AERO-X Backend API

Production-ready, hardened API for AERO-X shop.

## Directory Structure

```
backend/
├── server.js              # Main entry point
├── config/
│   └── database.js        # SQLite configuration & schema
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── routes/
│   ├── auth.js            # Register & login endpoints
│   └── orders.js          # Order management endpoints
├── data/
│   └── vault.sqlite       # SQLite database (auto-created)
├── package.json
├── .env.example
└── README.md
```

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm start
```

## API Endpoints

### Authentication

**POST /api/register**
- Body: `{ "email": "user@example.com", "password": "securepass123" }`
- Returns: User ID, email, and sets httpOnly cookie

**POST /api/login**
- Body: `{ "email": "user@example.com", "password": "securepass123" }`
- Returns: User ID, email, and sets httpOnly cookie

### Orders (Protected)

**GET /api/my-orders**
- Headers: Requires `auth_token` cookie
- Returns: Array of user's orders

**POST /api/return/:orderId**
- Headers: Requires `auth_token` cookie
- Returns: Updated order with status `return_initiated`

**POST /api/checkout**
- Headers: Requires `auth_token` cookie
- Body:
```json
{
  "items": [
    { "id": "prod_001", "name": "AERO-SINGLET", "quantity": 2, "price": 12500 }
  ],
  "total_price": 25000,
  "shipping_address": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001"
  }
}
```
- Returns: Order ID and status

### Health Check

**GET /health**
- Returns: Server status and timestamp

## Security Features

- Parameterized SQL queries (prevents SQL injection)
- bcryptjs password hashing (10 rounds)
- JWT authentication with httpOnly cookies
- Security headers (X-Frame-Options, CSP, etc.)
- Secure cookie configuration (sameSite: strict)
- Input validation on all endpoints
- User ownership verification on protected routes

## Database Schema

**users**
- id (INTEGER, PRIMARY KEY)
- email (TEXT, UNIQUE)
- password (TEXT, hashed)
- created_at (DATETIME)

**orders**
- id (TEXT UUID, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- items (TEXT JSON)
- total_price (REAL)
- shipping_address (TEXT JSON)
- is_paid (INTEGER, 0 or 1)
- status (TEXT, default: 'processed')
- created_at (DATETIME)
