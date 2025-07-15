#!/bin/bash

# Database Setup Script for Expense Tracker
echo "🚀 Setting up database for Expense Tracker..."

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    echo "📄 Loading environment variables from .env.local..."
    export $(grep -v '^#' .env.local | grep -v '^$' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set."
    echo "Please set your DATABASE_URL in the .env.local file."
    echo "Example: DATABASE_URL=\"postgresql://user:password@host:port/database\""
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ ERROR: psql command not found."
    echo "Please install PostgreSQL client tools."
    echo "macOS: brew install postgresql"
    echo "Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

echo "✅ PostgreSQL client found"

# Run all database setup scripts
echo "📊 Creating and updating database tables..."
for f in scripts/*.sql; do
  echo "Executing $f..."
  if psql "$DATABASE_URL" -f "$f"; then
    echo "✅ $f executed successfully!"
  else
    echo "❌ ERROR: Failed to execute $f."
    echo "Please check your DATABASE_URL and the script for errors."
    exit 1
  fi
done

# Verify tables were created
echo "🔍 Verifying tables..."
psql "$DATABASE_URL" -c "\dt" | head -15

echo "🎉 Database setup complete!"