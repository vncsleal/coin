-- Friends system database schema
-- Run this after the initial database setup

-- Enhance users table if needed
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  friend_user_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked, declined
  initiated_by VARCHAR(255) NOT NULL, -- who sent the friend request
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, friend_user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_user_id ON friends(friend_user_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- User privacy settings
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  user_id VARCHAR(255) PRIMARY KEY,
  discoverable_by_email BOOLEAN DEFAULT true,
  discoverable_by_username BOOLEAN DEFAULT true,
  show_in_user_browse BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settlements tracking for shared expenses

