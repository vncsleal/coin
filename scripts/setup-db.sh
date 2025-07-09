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

# Run the database setup script
echo "📊 Creating database tables..."
if psql "$DATABASE_URL" -f scripts/001-create-tables.sql; then
    echo "✅ Database tables created successfully!"
    
    # Verify tables were created
    echo "🔍 Verifying tables..."
    psql "$DATABASE_URL" -c "\dt" | head -10
    
    echo "🎉 Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Make sure your Clerk credentials are set in .env.local"
    echo "2. Set up your Google AI API key for AI counseling"
    echo "3. Run 'pnpm dev' to start the development server"
else
    echo "❌ ERROR: Failed to create database tables."
    echo "Please check your DATABASE_URL and try again."
    exit 1
fi
