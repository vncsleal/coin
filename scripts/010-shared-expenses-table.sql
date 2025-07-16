-- Create the shared_expenses table
CREATE TABLE IF NOT EXISTS shared_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(255),
    paid_by_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'unsettled', -- e.g., 'unsettled', 'settled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_shared_expenses_paid_by_user_id ON shared_expenses (paid_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_shared_with_user_id ON shared_expenses (shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_date ON shared_expenses (date);

-- RLS Policy for shared_expenses table
ALTER TABLE shared_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_shared_expenses_policy ON shared_expenses FOR SELECT USING (
    paid_by_user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    shared_with_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);

CREATE POLICY insert_shared_expenses_policy ON shared_expenses FOR INSERT WITH CHECK (
    paid_by_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);

CREATE POLICY update_shared_expenses_policy ON shared_expenses FOR UPDATE USING (
    paid_by_user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    shared_with_user_id = (current_setting('auth.user_id', true)::VARCHAR)
) WITH CHECK (
    paid_by_user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    shared_with_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);

CREATE POLICY delete_shared_expenses_policy ON shared_expenses FOR DELETE USING (
    paid_by_user_id = (current_setting('auth.user_id', true)::VARCHAR) OR
    shared_with_user_id = (current_setting('auth.user_id', true)::VARCHAR)
);
