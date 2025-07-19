-- Create the shared_incomes table
CREATE TABLE IF NOT EXISTS shared_incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(255),
    received_by_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'unsettled', -- e.g., 'unsettled', 'settled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_shared_incomes_received_by_user_id ON shared_incomes (received_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_incomes_shared_with_user_id ON shared_incomes (shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_incomes_date ON shared_incomes (date);

-- RLS Policy for shared_incomes table
ALTER TABLE shared_incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_shared_incomes_policy ON shared_incomes FOR SELECT USING (
    received_by_user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    shared_with_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);

CREATE POLICY insert_shared_incomes_policy ON shared_incomes FOR INSERT WITH CHECK (
    received_by_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);

CREATE POLICY update_shared_incomes_policy ON shared_incomes FOR UPDATE USING (
    received_by_user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    shared_with_user_id = (current_setting('auth.user_id', true)::VARCHAR)
) WITH CHECK (
    received_by_user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    shared_with_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);

CREATE POLICY delete_shared_incomes_policy ON shared_incomes FOR DELETE USING (
    received_by_user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    shared_with_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);
