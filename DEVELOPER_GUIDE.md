# Developer Guide - Cutia

A comprehensive guide for developers and LLMs to understand the project architecture, patterns, and best practices for extending the expense tracker application.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure Deep Dive](#project-structure-deep-dive)
- [Database Schema & Patterns](#database-schema--patterns)
- [API Development Patterns](#api-development-patterns)
- [Component Architecture](#component-architecture)
- [Currency System](#currency-system)
- [Authentication & User Management](#authentication--user-management)
- [Development Workflows](#development-workflows)
- [Testing Patterns](#testing-patterns)
- [Deployment & Production](#deployment--production)
- [Common Patterns & Examples](#common-patterns--examples)
- [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

The Cutia is a full-stack Next.js application built with TypeScript that provides:
- **Personal income and expense management** with categories and budgets
- **Friends system** for user relationships
- **Settlement tracking** with payment workflows
- **AI-powered financial insights** using Google Generative AI
- **Real-time analytics** with interactive charts
- **Multi-currency support** (defaulting to Brazilian Reais)

### Key Features
- **Settlement Workflow**: Pending → Paid → Confirmed
- **Bulk Operations**: Manage multiple expenses efficiently
- **Real-time Updates**: Live settlement tracking and notifications
- **Responsive Design**: Works seamlessly across devices

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks + Context API
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Notifications**: Sonner toast library

### Backend
- **API**: Next.js API routes with App Router
- **Database**: PostgreSQL (hosted on Neon)
- **Query**: Raw SQL with tagged template literals
- **Authentication**: Clerk for complete user management
- **AI**: Google Generative AI for financial insights

### Infrastructure
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: pnpm
- **Deployment**: Vercel-ready
- **Database**: Neon PostgreSQL

## 📁 Project Structure Deep Dive

```
expense-tracker/
├── app/                    # Next.js 15+ App Router
│   ├── api/               # Backend API routes
│   │   ├── incomes/           # Income CRUD
│   │   ├── expenses/          # Personal expense CRUD
│   │   ├── settlements/       # Settlement operations
│   │   │   ├── [id]/route.ts      # Individual settlement ops
│   │   │   └── reminder/route.ts  # Reminder system
│   │   ├── friends/           # Friends system
│   │   │   ├── route.ts           # Friend CRUD
│   │   │   └── [id]/route.ts      # Individual friend ops
│   │   ├── users/             # User management
│   │   │   └── browse/route.ts    # User discovery
│   │   └── ai-counseling/     # AI financial advice & reporting
│   ├── dashboard/         # Protected pages
│   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   ├── page.tsx           # Main dashboard overview
│   │   ├── income/            # Income management page
│   │   ├── expenses/          # Personal expense pages
│   │   ├── friends/           # Friends management
│   │   ├── budget/            # Budget tracking
│   │   ├── analytics/         # Personal analytics
│   │   ├── profile/           # User preferences
│   │   └── ai-counseling/     # AI reporting page
│   ├── globals.css        # Global styles & CSS variables
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── income-manager.tsx # Income management component
│   ├── income-chart.tsx   # Income chart component
│   ├── expense-*.tsx     # Personal expense components
│   ├── budget-*.tsx      # Budget-related components
│   ├── app-sidebar.tsx   # Navigation sidebar
│   └── theme-provider.tsx # Dark/light theme
├── hooks/                # Custom React hooks
│   ├── use-debounce.ts       # Debounced search
│   ├── use-mobile.tsx        # Mobile detection
│   └── use-toast.ts          # Toast notifications
├── lib/                  # Utility functions
│   ├── db.ts                 # Database connection
│   ├── types.ts              # TypeScript definitions
│   ├── currency.ts           # Currency utilities
│   ├── user-management.ts    # Clerk integration
│   └── utils.ts              # General utilities
├── scripts/              # Database & setup scripts
│   ├── setup-db.sh           # Automated DB setup
│   ├── 001-create-tables.sql # Core schema
│   ├── 002-friends-system.sql # Friends extensions
│   ├── 003-incomes-table.sql # Incomes table
│   └── 008-remove-shared-expenses.sql # Remove shared expenses tables
└── public/               # Static assets
```

## 🗄️ Database Schema & Patterns

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    avatar_url VARCHAR(500),
    is_public BOOLEAN DEFAULT TRUE,
    bio TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Budgets Table
```sql
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month, year)
);
```

#### Expenses Table (Personal)
```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Incomes Table
```sql
CREATE TABLE incomes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Shared Expenses System
```sql
-- Main shared expense record
CREATE TABLE shared_expenses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participant relationships
CREATE TABLE shared_expense_participants (
    id SERIAL PRIMARY KEY,
    shared_expense_id INTEGER REFERENCES shared_expenses(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    share_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settlement tracking
CREATE TABLE shared_expense_settlements (
    id SERIAL PRIMARY KEY,
    shared_expense_id INTEGER REFERENCES shared_expenses(id) ON DELETE CASCADE,
    debtor_id VARCHAR(255) NOT NULL,
    creditor_id VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    paid_amount NUMERIC(10,2) DEFAULT 0,
    paid_at TIMESTAMP WITHOUT TIME ZONE,
    confirmed_by VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    last_reminder_sent TIMESTAMP WITHOUT TIME ZONE,
    reminder_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Friends System
```sql
CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    friend_user_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    initiated_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_user_id)
);

CREATE TABLE user_privacy_settings (
    user_id VARCHAR(255) PRIMARY KEY,
    discoverable_by_email BOOLEAN DEFAULT TRUE,
    discoverable_by_username BOOLEAN DEFAULT TRUE,
    show_in_user_browse BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Database Patterns

#### Indexes for Performance
```sql
-- Essential indexes
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_shared_expenses_created_by ON shared_expenses(created_by);
CREATE INDEX idx_settlements_participant ON shared_expense_settlements(participant_id, status);
CREATE INDEX idx_friends_user_status ON friends(user_id, status);
```

#### Common Queries
```sql
-- Get user's monthly expenses
SELECT COALESCE(SUM(amount), 0) as total
FROM expenses 
WHERE user_id = $1
AND EXTRACT(MONTH FROM date) = $2
AND EXTRACT(YEAR FROM date) = $3;

-- Get shared expenses with participants
SELECT se.*, 
       json_agg(json_build_object(
           'user_id', sep.user_id,
           'share_amount', sep.share_amount,
           'user_name', u.name,
           'user_email', u.email
       )) as participants
FROM shared_expenses se
JOIN shared_expense_participants sep ON se.id = sep.shared_expense_id
JOIN users u ON sep.user_id = u.id
WHERE se.created_by = $1 OR sep.user_id = $1
GROUP BY se.id;
```

## 🔌 API Development Patterns

### Standard API Structure

#### Route Handler Pattern
```typescript
// app/api/[resource]/route.ts
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Database operation
    const results = await sql`
      SELECT * FROM table_name 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validation
    if (!body.name || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Database operation
    const result = await sql`
      INSERT INTO table_name (user_id, name, amount)
      VALUES (${userId}, ${body.name}, ${body.amount})
      RETURNING *
    `;

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

#### Dynamic Route Pattern
```typescript
// app/api/[resource]/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  const { id } = params;
  const body = await request.json();
  
  // Update operation with ownership check
  const result = await sql`
    UPDATE table_name 
    SET name = ${body.name}, amount = ${body.amount}
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  
  if (result.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json({ data: result[0] });
}
```

### Error Handling Patterns

#### Standard Error Response
```typescript
interface APIError {
  error: string;
  details?: string;
}

interface APISuccess<T> {
  data: T;
  message?: string;
}

// Usage
return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
return NextResponse.json({ data: result, message: 'Created successfully' });
```

### AI Reporting Feature

The application includes an AI-powered reporting feature that allows users to generate detailed financial reports for specific periods. This feature is designed to provide users with a comprehensive overview of their financial activity, including insights and actionable recommendations.

#### Report Generation

The AI reporting feature is accessible from the "AI Counseling" page. Users can select from predefined report types (e.g., "Weekly", "Monthly") or specify a custom date range. The backend then fetches the relevant financial data and uses a sophisticated prompt to generate a detailed report with the help of Google's Generative AI.

#### Report Content

The generated reports include:

*   A summary of total income, expenses, and net balance.
*   A breakdown of expenses by category.
*   A list of top expenses.
*   Simulated data visualizations (e.g., pie charts, bar charts).
*   Actionable insights and recommendations.

## 🧩 Component Architecture

### Component Categories

#### 1. Page Components
```typescript
// app/dashboard/[feature]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function FeaturePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Server-side data fetching
  const data = await fetchData(userId);
  
  return (
    <div className="space-y-6">
      <PageHeader />
      <FeatureComponent data={data} />
    </div>
  );
}
```

#### 2. Feature Components
```typescript
// components/income-manager.tsx
export function IncomeManager() {
  // Component implementation
}

// components/income-chart.tsx
export function IncomeChart() {
  // Component implementation
}

// components/ai-counseling.tsx
export function AICounseling() {
  // Component implementation
}
```

#### 3. Form Components
```typescript
// components/feature-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0.01, 'Amount must be positive'),
});

type FormData = z.infer<typeof formSchema>;

export function FeatureForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      amount: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
```

## 💰 Currency System

### Currency Configuration
```typescript
// lib/currency.ts
export const CURRENCIES = {
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    locale: 'pt-BR',
    decimals: 2
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    decimals: 2
  }
} as const;

export const DEFAULT_CURRENCY = 'BRL';
```

### Usage Patterns
```typescript
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';

// In components
<span>{formatCurrency(expense.amount)}</span>           // R$ 123,45
<Input placeholder={getCurrencySymbol()} />             // R$

// In charts
<Tooltip formatter={(value) => formatCurrency(Number(value))} />
<YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
```

## 🔐 Authentication & User Management

### Clerk Integration Pattern
```typescript
// lib/user-management.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { sql } from './db';

export async function syncUserWithDatabase() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) return null;

  // Upsert user to database
  const result = await sql`
    INSERT INTO users (id, email, name, avatar_url)
    VALUES (
      ${userId}, 
      ${user.primaryEmailAddress?.emailAddress}, 
      ${user.fullName}, 
      ${user.imageUrl}
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return result[0];
}
```

### Protected Route Pattern
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});
```

## 🔄 Development Workflows

### Adding a New Feature

#### 1. Database Changes
```bash
# Create migration script
touch scripts/003-new-feature.sql

# Add schema changes
echo "CREATE TABLE new_table (...)" >> scripts/003-new-feature.sql

# Update setup script
echo "psql \"\$DATABASE_URL\" -f scripts/003-new-feature.sql" >> scripts/setup-db.sh
```

#### 2. Type Definitions
```typescript
// lib/types.ts
export interface NewFeature {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
}
```

#### 3. API Routes
```typescript
// app/api/new-feature/route.ts
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET() {
  const { userId } = await auth();
  const results = await sql`SELECT * FROM new_table WHERE user_id = ${userId}`;
  return NextResponse.json({ data: results });
}
```

#### 4. Components
```typescript
// components/new-feature-component.tsx
export function NewFeatureComponent() {
  // Component implementation
}
```

#### 5. Pages
```typescript
// app/dashboard/new-feature/page.tsx
export default function NewFeaturePage() {
  return <NewFeatureComponent />;
}
```

#### 6. Navigation
```typescript
// components/app-sidebar.tsx
const navItems = [
  // ...existing items
  {
    title: "New Feature",
    url: "/dashboard/new-feature",
    icon: NewIcon,
  }
];
```

### Testing Patterns

#### API Testing
```typescript
// __tests__/api/new-feature.test.ts
import { GET } from '@/app/api/new-feature/route';

describe('/api/new-feature', () => {
  it('should return user data', async () => {
    const request = new Request('http://localhost:3000/api/new-feature');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
  });
});
```

#### Component Testing
```typescript
// __tests__/components/new-feature.test.tsx
import { render, screen } from '@testing-library/react';
import { NewFeatureComponent } from '@/components/new-feature-component';

describe('NewFeatureComponent', () => {
  it('should render correctly', () => {
    render(<NewFeatureComponent />);
    expect(screen.getByText('New Feature')).toBeInTheDocument();
  });
});
```

## 🚀 Deployment & Production

### Environment Setup
```bash
# Development
cp .env.example .env.local
# Fill in development credentials

# Production (Vercel)
# Set environment variables in Vercel dashboard
```

### Build Process
```bash
# Install dependencies
pnpm install

# Type check
pnpm run type-check

# Build application
pnpm run build

# Start production server
pnpm start
```

### Database Migration
```bash
# Run setup script
chmod +x scripts/setup-db.sh
./scripts/setup-db.sh

# Manual migration
psql $DATABASE_URL -f scripts/001-create-tables.sql
```

## 📚 Common Patterns & Examples

### Bulk Operations Pattern
```typescript
// API: app/api/resource/bulk/route.ts
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { action, ids } = await request.json();

  switch (action) {
    case 'delete':
      await sql`DELETE FROM table WHERE id = ANY(${ids}) AND user_id = ${userId}`;
      break;
    case 'update':
      await sql`UPDATE table SET status = 'updated' WHERE id = ANY(${ids}) AND user_id = ${userId}`;
      break;
  }

  return NextResponse.json({ success: true });
}

// Component usage
const handleBulkAction = async (action: string, selectedIds: number[]) => {
  const response = await fetch('/api/resource/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ids: selectedIds })
  });
  // Handle response
};
```

### Real-time Updates Pattern
```typescript
// Component with real-time updates
export function RealtimeComponent() {
  const [data, setData] = useState([]);

  const refreshData = async () => {
    const response = await fetch('/api/data');
    const result = await response.json();
    setData(result.data);
  };

  useEffect(() => {
    refreshData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    // Perform update
    await updateAction();
    // Refresh data immediately
    await refreshData();
  };

  return (
    <div>
      {/* Render data */}
      <Button onClick={handleUpdate}>Update</Button>
    </div>
  );
}
```

### Search and Filter Pattern
```typescript
export function SearchableList() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <Input 
        placeholder="Search..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Select value={filter} onValueChange={setFilter}>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
      </Select>
      
      {filteredItems.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check database URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check tables
psql $DATABASE_URL -c "\dt"
```

#### Build Errors
```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Type check
pnpm run type-check
```

#### Authentication Issues
```typescript
// Debug auth
import { auth } from '@clerk/nextjs/server';

const { userId } = await auth();
console.log('User ID:', userId);

// Check environment variables
console.log('Clerk keys configured:', {
  publishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secret: !!process.env.CLERK_SECRET_KEY
});
```

### Development Tools

#### Database Queries
```sql
-- Check user data
SELECT * FROM users LIMIT 5;

-- Check recent expenses
SELECT * FROM expenses ORDER BY created_at DESC LIMIT 10;

-- Check shared expenses with participants
SELECT se.name, COUNT(sep.id) as participant_count
FROM shared_expenses se
LEFT JOIN shared_expense_participants sep ON se.id = sep.shared_expense_id
GROUP BY se.id, se.name;
```

#### API Testing
```bash
# Test endpoint with curl
curl -X GET http://localhost:3000/api/expenses \
  -H "Authorization: Bearer $TOKEN"

# Test with specific data
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","amount":10.50,"tag":"test"}'
```

---

## 🎯 Best Practices Summary

1. **Always authenticate users** in API routes
2. **Use TypeScript interfaces** for all data structures
3. **Implement proper error handling** with meaningful messages
4. **Follow the currency utility pattern** for all monetary displays
5. **Use the established component patterns** for consistency
6. **Test API endpoints** before building UI components
7. **Follow the database query patterns** for performance
8. **Implement proper loading states** in all async operations
9. **Use the toast system** for user feedback
10. **Follow the established file organization** for maintainability

This guide should provide a solid foundation for any developer or LLM working on the expense tracker project. The patterns and examples shown here are battle-tested and follow the established conventions of the codebase.
