# Security Vulnerability Remediation Plan
## AERO-X Backend API - Dependency Modernization

---

## Current Vulnerability Assessment

**5 High Severity Vulnerabilities Detected:**

| CVE | Package | Issue | CVSS Score |
|-----|---------|-------|------------|
| GHSA-8qq5-rm4j-mr97 | tar ≤7.5.2 | Arbitrary File Overwrite via Insufficient Path Sanitization | N/A |
| GHSA-r6q2-hw4h-h46w | tar ≤7.5.3 | Race Condition via Unicode Ligature Collisions (macOS APFS) | 8.8 |
| GHSA-34x7-hfp2-rc4v | tar <7.5.7 | Arbitrary File Creation via Hardlink Path Traversal | 8.2 |
| Transitive | cacache 14.0.0-18.0.4 | Via tar vulnerability | High |
| Transitive | make-fetch-happen 7.1.1-14.0.0 | Via cacache vulnerability | High |

**Dependency Chain:**
```
sqlite3@5.1.7
  └── node-gyp ≤10.3.1
      ├── make-fetch-happen (vulnerable)
      │   └── cacache (vulnerable)
      │       └── tar ≤7.5.6 (VULNERABLE)
      └── tar ≤7.5.6 (VULNERABLE)
```

---

## Remediation Strategies

### STRATEGY 1: Switch to better-sqlite3 (RECOMMENDED)

**Why This Approach:**
- Eliminates entire vulnerability chain
- Better performance (fully synchronous, faster than async wrappers)
- Simpler API (no callbacks/promises needed)
- Active maintenance and modern codebase
- Uses `prebuild-install` instead of `node-gyp`

**Risk Level:** Medium (requires code changes)
**Effort:** 2-3 hours
**Long-term Benefit:** High

---

### STRATEGY 2: Use npm overrides (TEMPORARY WORKAROUND)

**Why This Approach:**
- Minimal code changes
- Forces secure tar version
- Keeps sqlite3 (familiar API)

**Risk Level:** Low (may break in future)
**Effort:** 15 minutes
**Long-term Benefit:** Low (band-aid solution)

---

## STRATEGY 1: Migration to better-sqlite3

### Step 1: Clean Slate Preparation

```bash
# Navigate to backend directory
cd /Users/jandavidridder/Desktop/Wasp-Aerodynamics-Lab/website-2o/backend

# Remove existing node_modules and lock file
rm -rf node_modules package-lock.json

# Verify clean state
ls -la | grep -E "node_modules|package-lock"
```

### Step 2: Uninstall sqlite3

```bash
npm uninstall sqlite3
```

### Step 3: Install better-sqlite3

```bash
npm install better-sqlite3@12.6.2
```

### Step 4: Verify Installation

```bash
npm audit
```

**Expected Output:** 0 vulnerabilities

### Step 5: Updated package.json

```json
{
  "name": "aero-x-backend",
  "version": "1.0.0",
  "description": "Production-ready hardened API for AERO-X shop",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "keywords": ["express", "sqlite", "jwt", "bcrypt", "api"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.21.2",
    "better-sqlite3": "^12.6.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cookie-parser": "^1.4.7",
    "uuid": "^11.0.5"
  }
}
```

---

## Breaking Changes Report: sqlite3 → better-sqlite3

### API Paradigm Shift: Async → Sync

| Feature | sqlite3 (OLD) | better-sqlite3 (NEW) |
|---------|---------------|----------------------|
| Database Open | `new sqlite3.Database(path, callback)` | `new Database(path)` (sync) |
| Query Execution | `db.all(sql, params, callback)` | `db.prepare(sql).all(params)` |
| Single Row | `db.get(sql, params, callback)` | `db.prepare(sql).get(params)` |
| Insert/Update | `db.run(sql, params, callback)` | `db.prepare(sql).run(params)` |
| Error Handling | Callback `(err, result)` | Try-catch blocks |
| Prepared Statements | Optional | Recommended (performance) |

### Code Migration: config/database.js

**BEFORE (sqlite3):**

```javascript
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'data', 'vault.sqlite');

// ASYNC: Database connection with callback
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database at', dbPath);
});

// ASYNC: Schema initialization
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (...)`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (...)`);
  console.log('Database schema initialized');
});

// ASYNC: Wrapper functions returning Promises
export const queryAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};
```

**AFTER (better-sqlite3):**

```javascript
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'data', 'vault.sqlite');

// SYNC: Database connection (no callback needed)
let db;
try {
  db = new Database(dbPath);
  console.log('Connected to SQLite database at', dbPath);
} catch (err) {
  console.error('Database connection error:', err.message);
  process.exit(1);
}

// SYNC: Schema initialization (no serialize needed)
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      items TEXT NOT NULL,
      total_price REAL NOT NULL,
      shipping_address TEXT NOT NULL,
      is_paid INTEGER DEFAULT 0,
      status TEXT DEFAULT 'processed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  console.log('Database schema initialized');
} catch (err) {
  console.error('Schema initialization error:', err.message);
  process.exit(1);
}

// SYNC: No need for wrapper functions - use directly
// But for compatibility, we can create similar APIs

export const queryAll = (sql, params = []) => {
  try {
    return db.prepare(sql).all(params);
  } catch (err) {
    throw err;
  }
};

export const queryRun = (sql, params = []) => {
  try {
    return db.prepare(sql).run(params);
  } catch (err) {
    throw err;
  }
};

export const queryGet = (sql, params = []) => {
  try {
    return db.prepare(sql).get(params);
  } catch (err) {
    throw err;
  }
};

export default db;
```

**KEY DIFFERENCES:**
1. **Line 9:** `new Database()` is synchronous, no callback
2. **Line 15-34:** `db.exec()` replaces `db.serialize()` and `db.run()`
3. **Line 42-62:** Functions are now synchronous, use try-catch instead of promises
4. **Return Values:** `run()` returns `{ changes, lastInsertRowid }` instead of `{ lastID, changes }`

---

### Code Migration: routes/auth.js

**Changes Required:**

```javascript
// BEFORE (sqlite3)
import { getAsync, runAsync } from '../config/database.js';

const existingUser = await getAsync('SELECT id FROM users WHERE email = ?', [email]);
const result = await runAsync('INSERT INTO users ...', [email, hashedPassword]);
const token = generateToken(result.lastID, email);  // lastID

// AFTER (better-sqlite3)
import { queryGet, queryRun } from '../config/database.js';

const existingUser = queryGet('SELECT id FROM users WHERE email = ?', [email]);
const result = queryRun('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
const token = generateToken(result.lastInsertRowid, email);  // lastInsertRowid
```

**Critical Changes:**
- Remove `await` (functions are now synchronous)
- Change `result.lastID` → `result.lastInsertRowid`
- No try-catch needed in routes if using wrapper functions

---

### Code Migration: routes/orders.js

**Changes Required:**

```javascript
// BEFORE (sqlite3)
import { queryAsync, runAsync, getAsync } from '../config/database.js';

const orders = await queryAsync('SELECT ...', [userId]);
const order = await getAsync('SELECT ...', [orderId]);
await runAsync('UPDATE orders ...', ['return_initiated', orderId]);
await runAsync('INSERT INTO orders ...', [...]);

// AFTER (better-sqlite3)
import { queryAll, queryRun, queryGet } from '../config/database.js';

const orders = queryAll('SELECT id, items, ... FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
const order = queryGet('SELECT id, user_id, status FROM orders WHERE id = ?', [orderId]);
queryRun('UPDATE orders SET status = ? WHERE id = ?', ['return_initiated', orderId]);
queryRun('INSERT INTO orders (id, user_id, items, ...) VALUES (?, ?, ?, ...)', [...]);
```

**Critical Changes:**
- Remove all `await` keywords
- Rename `queryAsync` → `queryAll`
- Rename `getAsync` → `queryGet`
- Rename `runAsync` → `queryRun`

---

### Performance Improvements with Prepared Statements

**For High-Frequency Queries (Optional Optimization):**

```javascript
// In routes/orders.js
import db from '../config/database.js';

// Prepare once, reuse many times
const getOrdersByUserStmt = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
const updateOrderStatusStmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');

// In route handler
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = getOrdersByUserStmt.all(req.user.userId);
    // ... rest of logic
  } catch (err) {
    // error handling
  }
});
```

**Benefit:** 20-30% faster for repeated queries

---

## STRATEGY 2: npm overrides (Temporary Workaround)

### Updated package.json with overrides

```json
{
  "name": "aero-x-backend",
  "version": "1.0.0",
  "description": "Production-ready hardened API for AERO-X shop",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "keywords": ["express", "sqlite", "jwt", "bcrypt", "api"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.21.2",
    "sqlite3": "^5.1.7",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cookie-parser": "^1.4.7",
    "uuid": "^11.0.5"
  },
  "overrides": {
    "tar": "^7.5.7",
    "node-gyp": {
      "tar": "^7.5.7"
    }
  }
}
```

### Commands for Strategy 2

```bash
cd /Users/jandavidridder/Desktop/Wasp-Aerodynamics-Lab/website-2o/backend

# Clean slate
rm -rf node_modules package-lock.json

# Update package.json with overrides (see above)

# Reinstall dependencies
npm install

# Verify fix
npm audit
```

**Expected Outcome:** 0 high severity vulnerabilities

**Warning:** This is a temporary fix. npm may still warn about overrides, and future sqlite3 updates may break compatibility.

---

## Deprecation Cleanup (For Future Consideration)

The deprecations mentioned (rimraf, glob, inflight, npmlog, gauge, are-we-there-yet) are **transitive dependencies** of sqlite3/node-gyp and **not direct dependencies** of your project.

### Current Status
```bash
npm ls rimraf glob inflight npmlog gauge are-we-there-yet
# All are dependencies of sqlite3 → node-gyp
```

### Resolution
- **Strategy 1 (better-sqlite3):** Eliminates all these deprecations entirely
- **Strategy 2 (overrides):** Deprecations remain but are non-critical

**No action needed** unless you add these as direct dependencies in the future.

---

## Recommendation Matrix

| Criteria | Strategy 1 (better-sqlite3) | Strategy 2 (overrides) |
|----------|----------------------------|------------------------|
| Security Risk Elimination | ✅ Complete | ⚠️ Partial |
| Performance | ✅ Improved | ➖ Same |
| Code Changes Required | ⚠️ Medium | ✅ None |
| Long-term Maintainability | ✅ High | ⚠️ Low |
| Implementation Time | 2-3 hours | 15 minutes |
| Future Vulnerability Risk | ✅ Low | ⚠️ Medium |

**FINAL RECOMMENDATION:** Use Strategy 1 (better-sqlite3 migration)

---

## Testing Checklist After Migration

```bash
# 1. Install dependencies
npm install

# 2. Verify no vulnerabilities
npm audit

# 3. Start server
npm start

# 4. Test endpoints
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@aero-x.com","password":"SecurePass123"}'

curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@aero-x.com","password":"SecurePass123"}'

# 5. Check database file
ls -lh data/vault.sqlite

# 6. Verify schema
sqlite3 data/vault.sqlite ".schema"
```

---

## Rollback Plan

If migration fails:

```bash
# Restore original package.json
git checkout package.json

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Restore original database.js
git checkout config/database.js routes/auth.js routes/orders.js
```

---

## References

- [better-sqlite3 npm package](https://www.npmjs.com/package/better-sqlite3)
- [Understanding Better-SQLite3: The Fastest SQLite Library for Node.js](https://dev.to/lovestaco/understanding-better-sqlite3-the-fastest-sqlite-library-for-nodejs-4n8)
- [better-sqlite3 API Documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [GitHub Issue: sqlite3 tar vulnerability](https://github.com/TryGhost/node-sqlite3/issues/1483)
- [GitHub Issue: node-gyp tar vulnerability](https://github.com/nodejs/node-gyp/issues/1714)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-30
**Author:** Senior DevOps & Security Engineer
