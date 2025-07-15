# Cutia

Cutia is a comprehensive financial planning application built with Next.js, featuring AI-powered insights, advanced shared expenses with smart splitting, friends management, settlement tracking, and detailed analytics. Inspired by the Brazilian animal that saves and plants seeds for the future, Cutia helps you manage your finances with a focus on growth and future planning.

## ✨ Features

### 📊 **Core Financial Management**
- **Smart Analytics** - Interactive charts and spending pattern visualization
- **Budget Tracking** - Set and monitor monthly budgets with alerts
- **Income & Expense Categories** - Organize income and expenses with custom tags
- **Advanced Search** - Filter and search through your financial history

### 👥 **Advanced Shared Expenses**
- **Friends System** - Add friends, manage relationships, and browse users
- **Smart Expense Splitting** - Multiple splitting methods:
  - **Equal Split** - Divide expenses equally among participants
  - **Percentage Split** - Set custom percentages for each person
  - **Custom Amount** - Specify exact amounts per participant
  - **Item-wise Split** - Add receipt items and assign to specific people
- **Settlement Tracking** - Complete payment workflow with progress visualization
- **Payment Management** - Mark payments, confirm receipts, send reminders
- **Bulk Operations** - Manage multiple expenses at once

### 📈 **Analytics & Insights**
- **Monthly Trends** - Track spending patterns over time
- **Category Breakdown** - Detailed analysis by expense categories
- **Friend Analysis** - See spending patterns with different friends
- **Settlement Analytics** - Monitor payment completion rates
- **Export Features** - Download data as CSV for external analysis

### 🤖 **AI-Powered Features**
- **AI Financial Counseling** - Get personalized financial advice
- **Spending Insights** - AI-powered analysis of your expenses
- **Budget Recommendations** - Smart suggestions for budget optimization

### 🔐 **Security & UX**
- **Secure Authentication** - Powered by Clerk with full user management
- **Responsive Design** - Seamless experience across all devices
- **Real-time Updates** - Live settlement tracking and notifications
- **Bulk Actions** - Efficient management of multiple expenses
- **Status Indicators** - Visual feedback for all expense and settlement states

### 💰 **Currency Support**
- **Brazilian Reais (BRL)** - Default currency with proper R$ formatting
- **Multi-currency Ready** - Built-in support for USD, EUR, and BRL
- **Localized Formatting** - Proper number formatting for Brazilian Portuguese (pt-BR)
- **Consistent Display** - All amounts displayed with R$ symbol throughout the app

## Prerequisites

Before running this application, you'll need:

1. **Node.js** (v18 or higher)
2. **pnpm** package manager
3. **Neon Database** account (for PostgreSQL database)
4. **Clerk** account (for authentication)
5. **Google AI API** key (for AI counseling feature)

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd cutia
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Database
DATABASE_URL=your_neon_database_url_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# AI API (for AI counseling feature)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
```

### 4. Set up the database

1. Create a new project in [Neon](https://neon.tech/)
2. Copy your database URL to the `DATABASE_URL` environment variable
3. Run the database setup script:

```bash
# Make the script executable (if not already)
chmod +x scripts/setup-db.sh

# Run the automated setup script
./scripts/setup-db.sh
```

The setup script will create all necessary tables including:
- **Core tables**: `users`, `budgets`, `expenses`, `shared_expenses`, `shared_expense_participants`
- **Friends system**: `friends`, `user_privacy_settings` 
- **Settlement tracking**: `shared_expense_settlements` with debtor/creditor relationships
- **Analytics support**: Optimized indexes for performance

### 5. Set up Clerk Authentication

1. Create a new application in [Clerk](https://clerk.com/)
2. Copy your publishable key and secret key to the environment variables
3. Configure your Clerk application settings as needed

### 6. Set up Google AI API

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add the API key to your environment variables

### 7. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
├── app/                    # Next.js 15+ App Router
│   ├── api/               # API routes
│   │   ├── shared-expenses/   # Shared expense APIs
│   │   │   ├── analytics/     # Analytics endpoints
│   │   │   ├── bulk/          # Bulk operations
│   │   │   └── [id]/          # Individual expense operations
│   │   ├── settlements/       # Settlement management APIs
│   │   ├── friends/           # Friends system APIs
│   │   └── users/            # User management APIs
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── shared/           # Shared expenses pages
│   │   │   └── analytics/    # Shared expense analytics
│   │   ├── friends/          # Friends management
│   │   ├── expenses/         # Personal expenses
│   │   └── analytics/        # Personal analytics
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── shared/           # Shared expense components
│   │   ├── enhanced-shared-expense-form.tsx
│   │   ├── settlement-tracker.tsx
│   │   ├── shared-expense-analytics.tsx
│   │   ├── friends-manager.tsx
│   │   ├── user-browser.tsx
│   │   ├── enhanced-expense-card.tsx
│   │   └── bulk-operations.tsx
│   └── ui/               # Reusable UI components (shadcn/ui)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
│   ├── db.ts             # Database connection
│   ├── types.ts          # TypeScript type definitions
│   ├── currency.ts       # Currency utilities and BRL support
│   └── user-management.ts # Clerk user sync utilities
├── scripts/               # Database scripts
│   ├── setup-db.sh       # Automated database setup
│   └── 001-create-tables.sql # Database schema
└── public/               # Static assets
```

## 🛠️ Technologies Used

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI + shadcn/ui component library
- **Authentication**: Clerk (complete user management)
- **Database**: PostgreSQL (hosted on Neon)
- **ORM/Query**: Raw SQL with tagged template literals
- **AI Integration**: Google Generative AI
- **Charts & Visualization**: Recharts
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks + Context API
- **Notifications**: Sonner toast library
- **Icons**: Lucide React
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: pnpm

## 🗃️ Database Schema

### Core Tables
- **users** - User profiles synced from Clerk
- **expenses** - Personal expense records
- **budgets** - Monthly budget tracking

### Shared Expenses System
- **shared_expenses** - Shared expense records with split method support
- **shared_expense_participants** - User participation in shared expenses
- **shared_expense_settlements** - Settlement tracking with debtor/creditor relationships

### Friends System
- **friends** - Friend relationships and requests
- **user_privacy_settings** - User discoverability settings

### Key Features
- Optimized indexes for performance
- Cascading deletes for data integrity
- JSONB support for flexible item-wise splitting
- Timestamp tracking for audit trails

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key | Yes (for AI features) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Custom sign-in URL | No |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Custom sign-up URL | No |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in | No |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up | No |

## 🚀 Quick Start Guide

### For New Users

1. **Sign up** using the authentication system
2. **Set up your profile** and privacy settings
3. **Add friends** to start sharing expenses
4. **Create your first shared expense** with smart splitting
5. **Track settlements** and manage payments
6. **View analytics** to understand your spending patterns

### Key Pages & Features

- **Dashboard** (`/dashboard`) - Overview of your finances
- **Income** (`/dashboard/income`) - Income management
- **Expenses** (`/dashboard/expenses`) - Personal expense management
- **Shared Expenses** (`/dashboard/shared`) - Advanced shared expense creation and management
- **Shared Analytics** (`/dashboard/shared/analytics`) - Detailed insights into shared spending
- **Friends** (`/dashboard/friends`) - Friend management and user discovery
- **Budget** (`/dashboard/budget`) - Monthly budget tracking
- **AI Counseling** (`/dashboard/ai-counseling`) - Personalized financial advice

## 💡 Advanced Features

### Smart Expense Splitting

The application supports four different splitting methods:

1. **Equal Split** - Default method that divides the total equally
2. **Percentage Split** - Assign specific percentages to each participant
3. **Custom Amount** - Set exact amounts for each person
4. **Item-wise Split** - Add individual items and assign them to specific participants

### Settlement Workflow

1. **Payment Initiation** - Debtor marks payment as "paid"
2. **Confirmation** - Creditor confirms receipt 
3. **Completion** - Settlement marked as "confirmed"
4. **Reminders** - Automated reminder system for pending payments

### Bulk Operations

Efficiently manage multiple expenses with bulk actions:
- **Bulk Settle** - Mark multiple payments as paid
- **Bulk Remind** - Send payment reminders for selected expenses
- **Bulk Export** - Download expense data as CSV
- **Bulk Delete** - Remove multiple expenses (with confirmation)

### Analytics Features

- **Time-based Analysis** - 3 months, 6 months, or 1 year views
- **Settlement Rate Tracking** - Monitor payment completion rates
- **Friend Spending Analysis** - See expense patterns with different friends
- **Category Insights** - Understand spending by category
- **Export Capabilities** - Download analytics data for external use

## 📞 Support

If you encounter any issues or have questions:

1. **Check the troubleshooting section** above
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information including:
   - Error messages
   - Steps to reproduce
   - Environment details (OS, Node.js version, etc.)
   - Screenshots if applicable

## 🗺️ Roadmap

### Upcoming Features
- [ ] **Mobile App** - React Native implementation
- [ ] **Recurring Expenses** - Automatic expense creation
- [ ] **Receipt Scanning** - OCR-powered receipt processing
- [ ] **Bank Integration** - Automatic transaction import
- [ ] **Extended Multi-currency Support** - Additional international currencies and exchange rates
- [ ] **Advanced Notifications** - Email and push notifications
- [ ] **Expense Reports** - Detailed PDF reports
- [ ] **Team Workspaces** - Organizational expense management

### Recently Completed ✅
- [x] **Brazilian Reais (BRL) Support** - Default currency with proper formatting
- [x] **Friends System** - User discovery and friend management
- [x] **Smart Expense Splitting** - Multiple splitting methods
- [x] **Settlement Tracking** - Complete payment workflow
- [x] **Bulk Operations** - Efficient expense management
- [x] **Advanced Analytics** - Comprehensive spending insights
- [x] **Enhanced UX** - Status indicators and quick actions

## 🙏 Acknowledgments

- **shadcn/ui** for the excellent component library
- **Vercel** for seamless deployment platform
- **Neon** for reliable PostgreSQL hosting
- **Clerk** for robust authentication
- **Google AI** for intelligent insights

---

**Made with ❤️ by the Expense Tracker team**

For more information, visit our [documentation](https://github.com/yourusername/expense-tracker/wiki) or check out the [live demo](https://expense-tracker-demo.vercel.app).
