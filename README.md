# BetTrackr - Sports Betting Balance Tracker

![License](https://img.shields.io/badge/License-MIT-blue.svg)

![Sports Betting Tracker Dashboard](attached_assets/screenshot.png)

## Overview

BetTrackr is a comprehensive sports betting balance tracker that helps you monitor your betting performance, track profits and losses, manage tip expenses, and visualize your betting journey over time. Built with React, TypeScript, and MongoDB, this mobile-first application provides real-time financial tracking with color-coded visualizations, profit calculators, and comprehensive analytics.

**Key Features:**
- **Free Tier**: Full functionality available via localStorage (no account required)
- **Cloud Sync**: Free MongoDB cloud sync for authenticated users across all devices
- Real-time balance tracking with running balance calculations
- Visual analytics with interactive charts and color-coded profit/loss indicators
- Profit calculator with weekly goal tracking and tip expense management
- CSV import/export for data portability
- Capital injection tracking with automatic detection
- Timeline filtering (1 day, 3 days, 1 week, 2 weeks, 1 month, 3 months, 6 months, 1 year, year-to-date, all)
- Per-bet and per-day view modes
- Mobile-first design optimized for touch interactions

## Prerequisites

- **Node.js 18+** installed with ESM (ES Modules) support
- **MongoDB Atlas** account (free tier available) - Optional for cloud sync
- **Stripe** account (optional, for future premium features)

## Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```bash
# Required Core Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/betTrackr?retryWrites=true&w=majority
SESSION_SECRET=your-session-secret-here

# Optional Stripe Configuration (for future premium features)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Optional Development Settings
NODE_ENV=development
CLIENT_URL=http://localhost:5173
PORT=3000
```

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (free M0 tier is sufficient for development)
4. Configure database access:
   - Go to "Database Access"
   - Create a user with password authentication
   - Grant "Atlas Admin" privileges or at least "readWrite" to your database
5. Configure network access:
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
6. Get connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Select "Node.js" driver
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `betTrackr` (or your preferred database name)

Example connection string:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/betTrackr?retryWrites=true&w=majority
```

## Installation & Running

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Application

```bash
npm run dev
```

The application will start on **http://localhost:3000** (backend) and **http://localhost:5173** (frontend Vite dev server)

### 3. Production Build & Deploy

```bash
npm run build
npm start
```

## Data Storage & Sync

### Free Tier (No Account Required)

- **localStorage Mode**: All features available offline
  - Browser localStorage for entry persistence
  - JSON serialization of betting data
  - Baseline configuration stored locally
  - Capital injection auto-generation
  - Full app functionality without authentication
  - Data persists in your browser only

### Cloud Sync (Free for All Users)

- **With Account**: Cloud sync across devices via MongoDB (free)
  - MongoDB Atlas cloud database
  - Automatic backup and sync across all devices
  - Data migration from localStorage on first login
  - No capital injection auto-generation (server data is authoritative)
  - Access your data from any device

### Future Premium Features

- Stripe integration ready for future monetization
- User schema includes `stripeCustomerId` and `stripeSubscriptionId` fields
- API endpoints available: `/api/create-subscription`, `/api/subscription-status`, `/api/cancel-subscription`
- Subscription page (`/subscribe`) available for future premium features
- Current features are free for all authenticated users

## Features

### Core Betting Tracking

- **Betting Entries**: Track individual bets with date, bet amount, winning amount, net profit/loss, and notes
- **Running Balance**: Automatic calculation of running balance from baseline
- **Capital Injections**: Track additional capital added to your bankroll
- **Auto-Generated Injections**: Automatically detects when capital injections are needed (localStorage mode only)
- **Tip Expenses**: Track tip payments to betting services/providers
- **Baseline Configuration**: Set your starting balance/bankroll

### Analytics & Visualization

- **Balance Over Time Chart**: Interactive line chart showing balance trends
  - Green segments when balance ≥ baseline (profit)
  - Red segments when balance < baseline (loss)
  - Black horizontal baseline reference line
  - Tooltips showing date, net change, running balance, and notes
  - Fullscreen chart view
- **Timeline Filtering**: Filter data by time ranges:
  - 1 day, 3 days, 1 week, 2 weeks, 1 month, 3 months, 6 months, 1 year
  - Year-to-date (YTD)
  - All time
- **View Modes**: Toggle between per-bet and per-day aggregation
- **Key Metrics Dashboard**:
  - Current Balance
  - Peak Balance
  - Max Drawdown
  - Total Capital Invested
  - Total Tips Paid
  - Net Profit After Tips

### Profit Calculator

- **Weekly Profit Goal**: Set and track weekly profit targets
- **Tip Pricing**: Configure tip expenses (weekly package or per-bet pricing)
- **Estimated Bets Per Week**: Set expected betting frequency
- **Week Start Date**: Configure when your betting week begins
- **Real-time Calculations**:
  - Baseline calculation with tip costs
  - Profit per bet needed to meet goals
  - This week's progress tracking
  - Adjusted calculations based on actual performance

### Data Management

- **CSV Import**: Import betting entries and tip expenses from CSV files
  - Automatic duplicate detection
  - Config row support for baseline and calculator settings
  - Validates data format and skips invalid rows
- **CSV Export**: Export all data including:
  - Betting entries
  - Tip expenses
  - Configuration settings (baseline, calculator settings)
- **Data Migration**: One-click migration from localStorage to cloud storage
- **Entry Management**: Add, edit, and delete betting entries
- **Tip Expense Management**: Track and manage tip payments

### User Account Features

- **User Registration**: Create account with username, email, and password
- **Authentication**: Secure login/logout with session management
- **Account Management**: Update username and password
- **Data Sync**: Automatic cloud sync across devices
- **Data Migration**: Migrate localStorage data to cloud storage

## Database Schema

The application uses MongoDB with the following collections:

- **users**: User accounts and authentication
  - `_id` (ObjectId), `username` (string), `email` (string), `password` (bcrypt hash), `createdAt` (Date), `stripeCustomerId` (optional), `stripeSubscriptionId` (optional)
- **bettingEntries**: Individual betting transactions
  - `userId` (ObjectId), `date` (string), `net` (number), `betAmount` (number), `winningAmount` (number), `notes` (string)
- **capitalInjections**: Additional capital added to bankroll
  - `userId` (ObjectId), `date` (string), `amount` (number), `notes` (string), `autoGenerated` (boolean)
- **userSettings**: User preferences and configuration
  - `userId` (ObjectId), `baseline` (number), `weekStartDate` (string)
- **tipExpenses**: Tip payments (currently localStorage only, MongoDB backend coming soon)
  - `_id` (string), `date` (string), `amount` (number), `provider` (string), `notes` (string)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Account Management
- `PATCH /api/account` - Update user account (username, password)

### Betting Data
- `GET /api/entries` - Get all betting entries for authenticated user
- `POST /api/entries` - Create new betting entry
- `PATCH /api/entries/:id` - Update betting entry
- `DELETE /api/entries/:id` - Delete betting entry

### Capital Injections
- `GET /api/injections` - Get all capital injections for authenticated user
- `POST /api/injections` - Create new capital injection
- `DELETE /api/injections/:id` - Delete capital injection

### User Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Create user settings
- `PATCH /api/settings` - Update user settings

### Subscription (Future Premium Features)
- `GET /api/subscription-status` - Get subscription status
- `POST /api/create-subscription` - Create Stripe subscription
- `POST /api/cancel-subscription` - Cancel Stripe subscription

## Deployment

### Replit Deployment (Recommended)

1. Fork this repository to Replit
2. Set environment variables in Replit Secrets:
   - `MONGODB_URI` (required for cloud sync)
   - `SESSION_SECRET` (required for authentication)
   - `STRIPE_SECRET_KEY` (optional, for future premium features)
   - `STRIPE_PUBLISHABLE_KEY` (optional, for future premium features)
3. Run the application - it will automatically install dependencies

### Other Cloud Platforms

- Ensure all environment variables are properly set
- MongoDB Atlas should be accessible from your deployment platform
- The application serves on port 3000 (backend) and builds frontend to `dist/public`
- Consider setting up proper CORS and security headers for production
- Supports both horizontal and vertical scaling

### Local Development

- Uses Vite for hot module replacement in development
- TypeScript files run directly using `tsx` in development
- Production builds bundle the backend using ESBuild
- Frontend builds to `dist/public` directory

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter (lightweight React router)
- **UI Components**: Shadcn/ui (Radix UI primitives with Tailwind CSS)
- **Charts**: Chart.js with react-chartjs-2
- **State Management**: React Query (TanStack Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with mobile-first responsive design

### Backend
- **Framework**: Express.js with ESM modules
- **Database**: MongoDB with native driver
- **Authentication**: Session-based authentication with bcrypt password hashing
- **Validation**: Zod schemas for type-safe API validation
- **Payments**: Stripe integration (ready for future premium features)

### Data Flow

**LocalStorage Mode (Unauthenticated):**
- Betting entries → React state → localStorage
- Capital injections → React state → localStorage
- Tip expenses → React state → localStorage
- Baseline → React state → localStorage

**Cloud Sync Mode (Authenticated):**
- Betting entries → React Query → MongoDB
- Capital injections → React Query → MongoDB
- User settings → React Query → MongoDB
- Tip expenses → React state → localStorage (MongoDB backend coming soon)

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes (Drizzle ORM)

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string format and credentials
- Check database user permissions (requires readWrite access)
- Ensure network access is configured for your IP
- Test connection using MongoDB Compass or Atlas web interface

### Authentication Issues
- Verify `SESSION_SECRET` environment variable is set
- Check that MongoDB is accessible and user collection exists
- Clear browser cookies if experiencing session issues

### Data Sync Issues
- Check MongoDB connection status in server logs
- Verify user is authenticated (`/api/auth/me` endpoint)
- Check browser console for API errors
- Ensure MongoDB collections are properly initialized

### CSV Import Issues
- Verify CSV format matches expected structure
- Check that date format is ISO 8601 (YYYY-MM-DD)
- Ensure numeric fields (betAmount, winningAmount, net) are valid numbers
- Check browser console for validation errors

### Common Error Messages
- "MongoDB connection string required" → Set MONGODB_URI environment variable
- "Not authenticated" → User needs to log in or register
- "Failed to save entry" → Check MongoDB connection and user permissions
- "Invalid CSV format" → Verify CSV structure matches expected format

## SEO & Marketing

The application is fully optimized for search engines with:

### SEO Features
- **Structured Data**: Schema.org JSON-LD markup for rich snippets (WebApplication, Organization, Product schemas)
- **Dynamic Meta Tags**: Unique title, description, and Open Graph tags for each page
- **Sitemap**: XML sitemap at `/sitemap.xml` with proper priorities and change frequencies
- **Robots.txt**: Configured to allow all crawlers and reference sitemap
- **Performance**: Optimized loading with resource preconnection and DNS prefetch
- **Mobile-First**: Responsive design with proper viewport and theme-color meta tags
- **Social Sharing**: Open Graph and Twitter Card tags for social media previews

### SEO Configuration
See **SEO_GUIDE.md** for complete documentation including:
- Page-specific SEO configurations
- Keywords targeted
- Missing assets checklist (OG images, favicons)
- Google Search Console setup instructions
- Performance monitoring guidelines

### Target Keywords
Primary: sports betting tracker, betting analytics, bankroll management, betting profit calculator
Secondary: tip fee tracker, betting charts, sports betting balance, betting ROI tracker

## Support & Development

### Getting Help

For technical issues:
1. Check the application logs for error messages
2. Verify your environment variables are correctly set
3. Test your MongoDB connection independently
4. Check the browser console for frontend errors
5. Review the GitHub repository for known issues and updates
6. For SEO questions, see **SEO_GUIDE.md**

### Contributing

This is a personal project, but suggestions and improvements are welcome. Please ensure:
- Code follows TypeScript best practices
- Components use TypeScript types
- API endpoints use Zod validation
- UI follows mobile-first design principles
- All features work in both localStorage and cloud sync modes

---

**🎯 Start tracking your sports betting performance today - no account required! Use localStorage mode for instant access, or create a free account for cloud sync across all your devices.**

**Note**: This application is designed for personal betting tracking and analysis. Please ensure compliance with applicable gambling regulations in your jurisdiction. Bet responsibly.
