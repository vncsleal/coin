-- Create users table for additional user information
-- Note: Clerk handles authentication, this table stores additional profile data
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY, -- Clerk user ID
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  avatar_url VARCHAR(500),
  is_public BOOLEAN DEFAULT true,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month, year)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shared_expenses table
CREATE TABLE IF NOT EXISTS shared_expenses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  tag VARCHAR(100) NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  split_method VARCHAR(20) DEFAULT 'equal', -- equal, percentage, custom, itemwise
  items JSONB, -- for itemwise splitting
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shared_expense_participants table
CREATE TABLE IF NOT EXISTS shared_expense_participants (
  id SERIAL PRIMARY KEY,
  shared_expense_id INTEGER REFERENCES shared_expenses(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  share_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_expense_participants_user_id ON shared_expense_participants(user_id);

-- Friends system tables
CREATE TABLE IF NOT EXISTS friends (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  friend_user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked, declined
  initiated_by VARCHAR(255) NOT NULL REFERENCES users(id), -- who sent the friend request
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, friend_user_id)
);

-- User privacy settings
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id),
  discoverable_by_email BOOLEAN DEFAULT true,
  discoverable_by_username BOOLEAN DEFAULT true,
  show_in_user_browse BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settlements tracking for shared expenses
CREATE TABLE IF NOT EXISTS shared_expense_settlements (
  id SERIAL PRIMARY KEY,
  shared_expense_id INTEGER REFERENCES shared_expenses(id) ON DELETE CASCADE,
  debtor_id VARCHAR(255) NOT NULL REFERENCES users(id),
  creditor_id VARCHAR(255) NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  paid_at TIMESTAMP,
  confirmed_by VARCHAR(255) REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, confirmed
  last_reminder_sent TIMESTAMP,
  reminder_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional indexes for friends system
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_user_id ON friends(friend_user_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_settlements_shared_expense_id ON shared_expense_settlements(shared_expense_id);
CREATE INDEX IF NOT EXISTS idx_settlements_debtor_id ON shared_expense_settlements(debtor_id);
CREATE INDEX IF NOT EXISTS idx_settlements_creditor_id ON shared_expense_settlements(creditor_id);
