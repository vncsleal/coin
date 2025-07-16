# Row-Level Security (RLS) Instructions for Neon PostgreSQL

This guide provides instructions on how to implement Row-Level Security (RLS) in your Neon PostgreSQL database for the Cutia application. RLS is a crucial security feature that restricts which rows a user can access in a database table, based on policies defined by you.

## Why RLS?

In the Cutia application, RLS is essential for:
- **Data Isolation:** Ensuring users can only access and modify their own financial data (expenses, incomes, budgets).
- **Shared Data Control:** Managing access to shared expenses, participants, and settlements based on involvement.
- **Security Best Practices:** Adding a robust layer of defense against unauthorized data access, even if application-level checks are bypassed.

## Prerequisites

Before proceeding, ensure you have:
- Access to your Neon PostgreSQL database.
- `psql` client installed and configured, or a database management tool that allows executing SQL commands.
- An understanding of how your application passes the Clerk `userId` to the database session (typically via `SET LOCAL "auth.user_id" = '<clerk_user_id>';`).

## General Steps for RLS Implementation

For each table that requires RLS:

1.  **Enable RLS:**
    ```sql
    ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
    ```
2.  **Define Policies:** Create policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations. The `USING` clause defines the condition for `SELECT`, `UPDATE`, and `DELETE` (what rows they can *see* or *affect*). The `WITH CHECK` clause defines the condition for `INSERT` and `UPDATE` (what rows they can *create* or *change to*).

    The `current_setting('auth.user_id', true)::varchar` function will be used to retrieve the Clerk `userId` from the database session.

## RLS Policies for Cutia Tables

Below are the recommended RLS policies for the core tables in the Cutia application. For this guide, we'll assume `auth.user_id` is the session variable used to store the Clerk user ID.

---

### 1. `users` Table

Users should generally only be able to view their own profile, or public profiles of other users.

```sql
-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Users can see their own profile or public profiles
CREATE POLICY user_select_policy ON users FOR SELECT USING (
    id = current_setting('auth.user_id', true)::varchar OR is_public = TRUE
);

-- Policy for INSERT: Users can only insert their own profile (handled by Clerk sync)
CREATE POLICY user_insert_policy ON users FOR INSERT WITH CHECK (
    id = current_setting('auth.user_id', true)::varchar
);

-- Policy for UPDATE: Users can only update their own profile
CREATE POLICY user_update_policy ON users FOR UPDATE USING (
    id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    id = current_setting('auth.user_id', true)::varchar
);

-- Policy for DELETE: Users cannot delete their own profile directly (rely on Clerk webhooks)
-- If direct deletion is needed, adjust this policy.
```

---

### 2. `expenses` Table

Users can only manage their own personal expenses.

```sql
-- Enable RLS on the expenses table
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy for ALL operations: Users can only access their own expenses
CREATE POLICY expense_owner_policy ON expenses FOR ALL USING (
    user_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    user_id = current_setting('auth.user_id', true)::varchar
);
```

---

### 3. `incomes` Table

Users can only manage their own personal incomes.

```sql
-- Enable RLS on the incomes table
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

-- Policy for ALL operations: Users can only access their own incomes
CREATE POLICY income_owner_policy ON incomes FOR ALL USING (
    user_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    user_id = current_setting('auth.user_id', true)::varchar
);
```

---

### 4. `budgets` Table

Users can only manage their own budgets.

```sql
-- Enable RLS on the budgets table
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Policy for ALL operations: Users can only access their own budgets
CREATE POLICY budget_owner_policy ON budgets FOR ALL USING (
    user_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    user_id = current_setting('auth.user_id', true)::varchar
);
```

---

### 5. `shared_expenses` Table

Users can view/manage shared expenses they created or are a participant in.

```sql
-- Enable RLS on the shared_expenses table
ALTER TABLE shared_expenses ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Users can see shared expenses they created or are a participant in
CREATE POLICY shared_expense_select_policy ON shared_expenses FOR SELECT USING (
    created_by = current_setting('auth.user_id', true)::varchar OR
    id IN (SELECT shared_expense_id FROM shared_expense_participants WHERE user_id = current_setting('auth.user_id', true)::varchar)
);

-- Policy for INSERT: Users can only create shared expenses where they are the creator
CREATE POLICY shared_expense_insert_policy ON shared_expenses FOR INSERT WITH CHECK (
    created_by = current_setting('auth.user_id', true)::varchar
);

-- Policy for UPDATE: Users can update shared expenses they created
CREATE POLICY shared_expense_update_policy ON shared_expenses FOR UPDATE USING (
    created_by = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    created_by = current_setting('auth.user_id', true)::varchar
);

-- Policy for DELETE: Users can delete shared expenses they created
CREATE POLICY shared_expense_delete_policy ON shared_expenses FOR DELETE USING (
    created_by = current_setting('auth.user_id', true)::varchar
);
```

---

### 6. `shared_expense_participants` Table

Users can view/manage participants for shared expenses they are involved in.

```sql
-- Enable RLS on the shared_expense_participants table
ALTER TABLE shared_expense_participants ENABLE ROW LEVEL SECURITY;

-- Policy for ALL operations: Users can access participants of shared expenses they are involved in
CREATE POLICY participant_access_policy ON shared_expense_participants FOR ALL USING (
    shared_expense_id IN (
        SELECT id FROM shared_expenses
        WHERE created_by = current_setting('auth.user_id', true)::varchar OR
              EXISTS (SELECT 1 FROM shared_expense_participants WHERE shared_expense_id = shared_expenses.id AND user_id = current_setting('auth.user_id', true)::varchar)
    )
) WITH CHECK (
    shared_expense_id IN (
        SELECT id FROM shared_expenses
        WHERE created_by = current_setting('auth.user_id', true)::varchar OR
              EXISTS (SELECT 1 FROM shared_expense_participants WHERE shared_expense_id = shared_expenses.id AND user_id = current_setting('auth.user_id', true)::varchar)
    )
);
```

---

### 7. `shared_expense_settlements` Table

Users can view/manage settlements where they are the debtor or creditor.

```sql
-- Enable RLS on the shared_expense_settlements table
ALTER TABLE shared_expense_settlements ENABLE ROW LEVEL SECURITY;

-- Policy for ALL operations: Users can access settlements where they are debtor or creditor
CREATE POLICY settlement_access_policy ON shared_expense_settlements FOR ALL USING (
    debtor_id = current_setting('auth.user_id', true)::varchar OR
    creditor_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    debtor_id = current_setting('auth.user_id', true)::varchar OR
    creditor_id = current_setting('auth.user_id', true)::varchar
);
```

---

### 8. `friends` Table

Users can view/manage friend relationships they are part of.

```sql
-- Enable RLS on the friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Policy for ALL operations: Users can access friend relationships they are part of
CREATE POLICY friend_access_policy ON friends FOR ALL USING (
    user_id = current_setting('auth.user_id', true)::varchar OR
    friend_user_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    user_id = current_setting('auth.user_id', true)::varchar OR
    friend_user_id = current_setting('auth.user_id', true)::varchar
);
```

---

### 9. `user_privacy_settings` Table

Users can only manage their own privacy settings.

```sql
-- Enable RLS on the user_privacy_settings table
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Policy for ALL operations: Users can only access their own privacy settings
CREATE POLICY privacy_settings_owner_policy ON user_privacy_settings FOR ALL USING (
    user_id = current_setting('auth.user_id', true)::varchar
) WITH CHECK (
    user_id = current_setting('auth.user_id', true)::varchar
);
```

## How to Apply These Policies

1.  **Connect to your Neon Database:** Use `psql` or your preferred database client.
    ```bash
    psql <YOUR_NEON_DATABASE_URL>
    ```
2.  **Execute SQL Commands:** Copy and paste the SQL commands for each table into your database client and execute them.
3.  **Application Integration:** Ensure your application sets the `auth.user_id` session variable before executing any database queries. This is typically done in your API routes or database connection middleware.

    Example in a Next.js API route (assuming `userId` is from Clerk):
    ```typescript
    import { sql } from '@vercel/postgres'; // Or your database client
    import { auth } from '@clerk/nextjs/server';

    export async function GET(request: Request) {
      const { userId } = auth();
      if (!userId) {
        return new Response('Unauthorized', { status: 401 });
      }

      // Set the session variable for RLS
      await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

      // Now, any subsequent queries in this session will be filtered by RLS policies
      const expenses = await sql`SELECT * FROM expenses;`; // This will only return expenses for the current user

      return new Response(JSON.stringify(expenses), { status: 200 });
    }
    ```

## Important Considerations

-   **Superuser Bypass:** RLS policies are not applied to superusers. Be mindful of which roles have superuser privileges.
-   **Existing Data:** RLS policies apply to all data, existing and new. Ensure your policies correctly handle your current data.
-   **Testing:** Thoroughly test your RLS policies in a development environment to ensure they behave as expected and do not inadvertently block legitimate access or expose sensitive data.
-   **Performance:** While RLS is generally optimized, complex policies can impact query performance. Monitor your query execution plans.
-   **`USING` vs `WITH CHECK`:**
    -   `USING`: Filters rows that are *visible* for `SELECT`, `UPDATE`, `DELETE`.
    -   `WITH CHECK`: Filters rows that can be *inserted* or *updated to* for `INSERT`, `UPDATE`. For `INSERT`, the new row must satisfy the `WITH CHECK` condition. For `FOR ALL` policies, `USING` and `WITH CHECK` are often the same.

By following these instructions, you can significantly enhance the security of your Cutia application.
