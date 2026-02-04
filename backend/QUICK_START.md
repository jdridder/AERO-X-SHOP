# Security Remediation Quick Start Guide

## TL;DR - Execute Commands Now

### OPTION A: Automated Migration (Recommended)

```bash
cd /Users/jandavidridder/Desktop/Wasp-Aerodynamics-Lab/website-2o/backend
./MIGRATION_COMMANDS.sh
```

Follow the interactive prompts to choose your strategy.

---

### OPTION B: Manual Commands - Strategy 1 (better-sqlite3)

```bash
cd /Users/jandavidridder/Desktop/Wasp-Aerodynamics-Lab/website-2o/backend

# Clean slate
rm -rf node_modules package-lock.json

# Backup files
cp package.json package.json.backup
cp config/database.js config/database.js.backup
cp routes/auth.js routes/auth.js.backup
cp routes/orders.js routes/orders.js.backup

# Uninstall sqlite3
npm uninstall sqlite3

# Install better-sqlite3
npm install better-sqlite3@12.6.2

# Replace files
cp package.better-sqlite3.json package.json
cp config/database.better-sqlite3.js config/database.js
cp routes/auth.better-sqlite3.js routes/auth.js
cp routes/orders.better-sqlite3.js routes/orders.js

# Install dependencies
npm install

# Verify
npm audit
npm start
```

---

### OPTION C: Manual Commands - Strategy 2 (npm overrides)

```bash
cd /Users/jandavidridder/Desktop/Wasp-Aerodynamics-Lab/website-2o/backend

# Clean slate
rm -rf node_modules package-lock.json

# Backup
cp package.json package.json.backup

# Replace package.json
cp package.overrides.json package.json

# Install with overrides
npm install

# Verify
npm audit
npm start
```

---

## Files Generated

| File | Purpose |
|------|---------|
| [SECURITY_REMEDIATION.md](SECURITY_REMEDIATION.md) | Comprehensive remediation plan |
| [MIGRATION_COMMANDS.sh](MIGRATION_COMMANDS.sh) | Automated migration script |
| [package.better-sqlite3.json](package.better-sqlite3.json) | Package.json for Strategy 1 |
| [package.overrides.json](package.overrides.json) | Package.json for Strategy 2 |
| [config/database.better-sqlite3.js](config/database.better-sqlite3.js) | Updated database config |
| [routes/auth.better-sqlite3.js](routes/auth.better-sqlite3.js) | Updated auth routes |
| [routes/orders.better-sqlite3.js](routes/orders.better-sqlite3.js) | Updated order routes |

---

## Post-Migration Testing

```bash
# Start server
npm start

# Test in another terminal
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

# Should return auth_token cookie
```

---

## Rollback (if needed)

```bash
cp package.json.backup package.json
cp config/database.js.backup config/database.js
cp routes/auth.js.backup routes/auth.js
cp routes/orders.js.backup routes/orders.js
rm -rf node_modules package-lock.json
npm install
```

---

## Key Changes Summary

### database.js
- Line 9: `new sqlite3.Database(path, callback)` → `new Database(path)`
- Line 15-34: `db.serialize()` → `db.exec()`
- Line 42-62: Removed async Promise wrappers

### auth.js
- Line 3: Import `queryGet, queryRun` instead of `getAsync, runAsync`
- Line 20: Remove `await` from `queryGet()`
- Line 26: Remove `await` from `queryRun()`
- Line 31: `result.lastID` → `result.lastInsertRowid`

### orders.js
- Line 3: Import `queryAll, queryGet, queryRun`
- Line 12-15: Remove `await` from all queries
- All database calls are now synchronous

---

## Questions?

Read the full documentation: [SECURITY_REMEDIATION.md](SECURITY_REMEDIATION.md)
