# Expense Tracker

A modern expense tracking application built with Next.js, featuring AI-powered insights, shared expenses, and comprehensive budget tracking.

## Features

- 📊 **Smart Analytics** - Visualize spending patterns with interactive charts
- 💰 **Budget Tracking** - Set and monitor monthly budgets
- 👥 **Shared Expenses** - Split bills and expenses with friends
- 🤖 **AI Counseling** - Get AI-powered financial insights and advice
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔐 **Secure Authentication** - Powered by Clerk

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
cd expense-tracker
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
- Core tables: `users`, `budgets`, `expenses`, `shared_expenses`
- Friends system: `friends`, `user_privacy_settings` 
- Advanced features: `shared_expense_settlements`

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

## Project Structure

```
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── scripts/               # Database scripts
└── public/               # Static assets
```

## Technologies Used

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Clerk
- **Database**: PostgreSQL (Neon)
- **AI**: Google Generative AI
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Validation**: Zod

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
