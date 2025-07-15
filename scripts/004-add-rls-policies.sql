-- RLS Policies for Cutia Application
-- This script enables Row-Level Security and defines policies for all relevant tables.
-- It should be run after the initial table creation scripts.

-- Set session variable for RLS (example, typically set by application)
-- SET "auth.user_id" = '<your_clerk_user_id>';

--------------------------------------------------------------------------------
-- 1. `users` Table
--------------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_select_policy ON users FOR SELECT USING (
    id = current_setting('auth.user_id', true)::varchar OR is_public = TRUE
);

CREATE POLICY user_insert_policy ON users FOR INSERT WITH CHECK (
    id = current_setting('auth.user_id', true)::varchar
);

CREATE POLICY user_update_policy ON users FOR UPDATE USING (
    id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    id = current_setting('auth.user_id', true)::varchar
);

--------------------------------------------------------------------------------
-- 2. `expenses` Table
--------------------------------------------------------------------------------
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY expense_owner_policy ON expenses FOR ALL USING (
    user_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    user_id = current_setting('auth.user_id', true)::varchar
);

--------------------------------------------------------------------------------
-- 3. `incomes` Table
--------------------------------------------------------------------------------
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY income_owner_policy ON incomes FOR ALL USING (
    user_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    user_id = current_setting('auth.user_id', true)::varchar
);

--------------------------------------------------------------------------------
-- 4. `budgets` Table
--------------------------------------------------------------------------------
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_owner_policy ON budgets FOR ALL USING (
    user_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    user_id = current_setting('auth.user_id', true)::varchar
);

--------------------------------------------------------------------------------
-- 5. `shared_expenses` Table
--------------------------------------------------------------------------------
ALTER TABLE shared_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY shared_expense_select_policy ON shared_expenses FOR SELECT USING (
    created_by = current_setting('auth.user_id', true)::varchar OR
    id IN (SELECT shared_expense_id FROM shared_expense_participants WHERE user_id = current_setting('auth.user_id', true)::varchar)
);

CREATE POLICY shared_expense_insert_policy ON shared_expenses FOR INSERT WITH CHECK (
    created_by = current_setting('auth.user_id', true)::varchar
);

CREATE POLICY shared_expense_update_policy ON shared_expenses FOR UPDATE USING (
    created_by = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    created_by = current_setting('auth.user_id', true)::varchar
);

CREATE POLICY shared_expense_delete_policy ON shared_expenses FOR DELETE USING (
    created_by = current_setting('auth.user_id', true)::varchar
);

--------------------------------------------------------------------------------
-- 6. `shared_expense_participants` Table
--------------------------------------------------------------------------------
ALTER TABLE shared_expense_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY participant_access_policy ON shared_expense_participants FOR ALL USING (
    shared_expense_id IN (
        SELECT id FROM shared_expenses
        WHERE created_by = current_setting('auth.user_id', true)::varchar OR
              id IN (SELECT shared_expense_id FROM shared_expense_participants WHERE user_id = current_setting('auth.user_id', true)::varchar)
    )
) WITH CHECK (
    shared_expense_id IN (
        SELECT id FROM shared_expenses
        WHERE created_by = current_setting('auth.user_id', true)::varchar OR
              id IN (SELECT shared_expense_id FROM shared_expense_participants WHERE user_id = current_setting('auth.user_id', true)::varchar)
    )
);

--------------------------------------------------------------------------------
-- 7. `shared_expense_settlements` Table
--------------------------------------------------------------------------------
ALTER TABLE shared_expense_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY settlement_access_policy ON shared_expense_settlements FOR ALL USING (
    debtor_id = current_setting('auth.user_id', true)::varchar OR
    creditor_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    debtor_id = current_setting('auth.user_id', true)::varchar OR
    creditor_id = current_setting('auth.user_id', true)::varchar
);

--------------------------------------------------------------------------------
-- 8. `friends` Table
--------------------------------------------------------------------------------
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY friend_access_policy ON friends FOR ALL USING (
    user_id = current_setting('auth.user_id', true)::varchar OR
    friend_user_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    user_id = current_setting('auth.user_id', true)::varchar OR
    friend_user_id = current_setting('auth.user_id', true)::varchar
);

--------------------------------------------------------------------------------
-- 9. `user_privacy_settings` Table
--------------------------------------------------------------------------------
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY privacy_settings_owner_policy ON user_privacy_settings FOR ALL USING (
    user_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    user_id = current_setting('auth.user_id', true)::varchar
);
