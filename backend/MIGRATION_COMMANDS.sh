#!/bin/bash

###############################################################################
# AERO-X Backend - Security Vulnerability Remediation Script
# This script provides commands for both remediation strategies
###############################################################################

set -e

echo "=================================="
echo "AERO-X Security Remediation Script"
echo "=================================="
echo ""

# Determine backend directory
BACKEND_DIR="/Users/jandavidridder/Desktop/Wasp-Aerodynamics-Lab/website-2o/backend"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Check if we're in the right directory
if [ ! -f "$BACKEND_DIR/package.json" ]; then
  print_error "Backend directory not found at $BACKEND_DIR"
  exit 1
fi

cd "$BACKEND_DIR"
print_success "Changed to backend directory"

echo ""
echo "Choose a remediation strategy:"
echo "1) STRATEGY 1: Migrate to better-sqlite3 (RECOMMENDED)"
echo "2) STRATEGY 2: Use npm overrides (TEMPORARY FIX)"
echo "3) Exit"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo ""
    print_warning "STRATEGY 1: Migrating to better-sqlite3"
    echo "This will modify your code files and require testing."
    echo ""
    read -p "Are you sure you want to proceed? (y/n): " confirm

    if [ "$confirm" != "y" ]; then
      print_warning "Migration cancelled"
      exit 0
    fi

    echo ""
    print_success "Step 1/7: Backing up current files..."
    cp package.json package.json.backup
    cp config/database.js config/database.js.backup
    cp routes/auth.js routes/auth.js.backup
    cp routes/orders.js routes/orders.js.backup
    print_success "Backups created with .backup extension"

    echo ""
    print_success "Step 2/7: Cleaning node_modules and package-lock.json..."
    rm -rf node_modules package-lock.json
    print_success "Clean slate prepared"

    echo ""
    print_success "Step 3/7: Uninstalling sqlite3..."
    npm uninstall sqlite3

    echo ""
    print_success "Step 4/7: Installing better-sqlite3..."
    npm install better-sqlite3@12.6.2

    echo ""
    print_success "Step 5/7: Updating package.json..."
    cp package.better-sqlite3.json package.json

    echo ""
    print_success "Step 6/7: Updating code files..."
    cp config/database.better-sqlite3.js config/database.js
    cp routes/auth.better-sqlite3.js routes/auth.js
    cp routes/orders.better-sqlite3.js routes/orders.js

    echo ""
    print_success "Step 7/7: Running npm audit..."
    npm audit || true

    echo ""
    print_success "Migration complete!"
    echo ""
    echo "Next steps:"
    echo "1. Review the changes in your code files"
    echo "2. Test the server with: npm start"
    echo "3. Test all endpoints (register, login, checkout, etc.)"
    echo ""
    echo "To rollback, use the .backup files:"
    echo "  cp config/database.js.backup config/database.js"
    echo "  cp routes/auth.js.backup routes/auth.js"
    echo "  cp routes/orders.js.backup routes/orders.js"
    echo "  cp package.json.backup package.json"
    echo "  npm install"
    ;;

  2)
    echo ""
    print_warning "STRATEGY 2: Using npm overrides (temporary fix)"
    echo "This will not modify your code but is a band-aid solution."
    echo ""
    read -p "Are you sure you want to proceed? (y/n): " confirm

    if [ "$confirm" != "y" ]; then
      print_warning "Fix cancelled"
      exit 0
    fi

    echo ""
    print_success "Step 1/4: Backing up package.json..."
    cp package.json package.json.backup

    echo ""
    print_success "Step 2/4: Cleaning node_modules and package-lock.json..."
    rm -rf node_modules package-lock.json

    echo ""
    print_success "Step 3/4: Updating package.json with overrides..."
    cp package.overrides.json package.json

    echo ""
    print_success "Step 4/4: Reinstalling dependencies..."
    npm install

    echo ""
    print_success "Running npm audit..."
    npm audit || true

    echo ""
    print_success "Override fix applied!"
    echo ""
    echo "Next steps:"
    echo "1. Test the server with: npm start"
    echo "2. Monitor for any compatibility issues"
    echo ""
    echo "Note: This is a temporary fix. Consider migrating to better-sqlite3 for long-term security."
    ;;

  3)
    print_warning "Exiting without changes"
    exit 0
    ;;

  *)
    print_error "Invalid choice"
    exit 1
    ;;
esac

echo ""
print_success "All done!"
