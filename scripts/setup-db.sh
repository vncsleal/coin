#!/bin/bash

# Database Setup Script for Cutia

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | grep -v '^$' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Please set your DATABASE_URL in the .env.local file."
    echo "Example: DATABASE_URL=\"postgresql://user:password@host:port/database\""
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Please install PostgreSQL client tools."
    echo "macOS: brew install postgresql"
    echo "Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Run database setup scripts in a specific order
psql "$DATABASE_URL" -f ./scripts/009-friends-table.sql

# Verify tables were created
echo "
psql "$DATABASE_URL" -c "\dt" | head -15

echo "