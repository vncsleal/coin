-- Create the friends table
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'denied'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a unique constraint to prevent duplicate friendships
CREATE UNIQUE INDEX IF NOT EXISTS unique_friendship ON friends (LEAST(user_id, friend_user_id), GREATEST(user_id, friend_user_id));

-- Optional: Add an index for faster lookups by user_id or friend_user_id
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends (user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_user_id ON friends (friend_user_id);

-- RLS Policy for friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_friends_policy ON friends FOR SELECT USING (
    user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    friend_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);

CREATE POLICY insert_friends_policy ON friends FOR INSERT WITH CHECK (
    user_id = (current_setting('auth.user_id', true)::VARCHAR)
);

CREATE POLICY update_friends_policy ON friends FOR UPDATE USING (
    user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    friend_user_id = (current_setting('auth.user_id', true)::VARCHAR)
) WITH CHECK (
    user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    friend_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);

CREATE POLICY delete_friends_policy ON friends FOR DELETE USING (
    user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    friend_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);