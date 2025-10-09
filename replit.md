# Sports Betting Balance Tracker

## Overview

A mobile-first web application for tracking sports betting balances with running balance calculations, visual analytics, and CSV import/export capabilities. Built with React, TypeScript, and Chart.js, this application provides real-time financial tracking with color-coded visualizations that show profit/loss against a configurable baseline.

The application allows users to manually enter betting transactions, import CSV data, visualize balance trends over time, and export their data. It features a dark-mode-first design optimized for mobile devices with touch-friendly interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool:**
- Vite + React with TypeScript for fast development and optimized production builds
- Component-based architecture with functional React components and hooks
- Client-side routing via Wouter (lightweight React router)

**UI Component System:**
- Shadcn/ui component library (Radix UI primitives with Tailwind CSS styling)
- "New York" style variant configured for a modern, refined look
- Custom design system extending Material Design principles for fintech dashboards
- Dark mode as primary theme with light mode support

**Styling:**
- Tailwind CSS with custom configuration for mobile-first responsive design
- CSS variables for theming (HSL color space for easy manipulation)
- Custom color palette: profit green (142 76% 45%), loss red (0 72% 55%), baseline neutral
- Typography: Inter for UI text, JetBrains Mono for numerical data
- Touch-optimized interactions (48px minimum touch targets)

**State Management:**
- Local React state with useState for component-level state
- TanStack Query (React Query) for server state management and caching
- LocalStorage for client-side data persistence (default mode)
- Optional server-side persistence mode

**Data Visualization:**
- Chart.js v4.5.0 for line charts
- chartjs-plugin-annotation for baseline reference lines
- Color-coded segments: green when above baseline, red when below
- Custom tooltips showing date, net change, running balance, and notes

**Data Processing:**
- Papa Parse for CSV import/export functionality
- Client-side deduplication logic based on date + notes + net amount
- Chronological sorting with running balance calculation
- View mode toggle: "per-bet" (individual entries) vs "per-day" (aggregated daily)

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Session-based authentication with httpOnly cookies
- Proxy trust enabled for Replit infrastructure (`trust proxy: 1`)
- MongoDB integration for user data persistence
- Development-only Vite middleware integration for HMR

**API Design:**
- RESTful API prefix: `/api/*`
- JSON request/response format
- Express middleware for logging, parsing, and error handling
- Authentication middleware for protected routes

**Authentication System:**
- Session-based authentication using express-session
- Password hashing with bcrypt (10 rounds)
- MongoDB session store for persistence
- HttpOnly, SameSite=lax cookies for security
- User signup with mandatory email (cannot be changed after creation)
- User login/logout functionality with proper cache invalidation
- Account management (update username/password, delete account)
- Login flow invalidates auth queries to ensure immediate state updates across browsers
- Logout flow clears localStorage and query cache to prevent data bleeding between users

**Storage Layer:**
- MongoStorage class implementing IStorage interface
- MongoDB Atlas integration via @neondatabase/serverless driver
- ObjectId handling with string conversion for session compatibility
- Username uniqueness enforcement at application level

### Data Storage Solutions & Freemium Model

**Freemium Business Model:**
- **Free Tier:** All features available via localStorage (offline mode, no account required)
- **Premium Tier:** $9/month subscription for cloud sync across devices via MongoDB
- Stripe integration for subscription management and payment processing
- Subscription status check gates access to MongoDB cloud storage

**Client-Side (Free Tier & Non-Subscribers):**
- Browser localStorage for entry persistence
- JSON serialization of entry data
- Baseline configuration stored locally
- Capital injection auto-generation for localStorage users
- Full app functionality without authentication

**Server-Side (Premium Subscribers Only):**
- MongoDB Atlas cloud database (configured via DEMO_MONGODB_URI secret)
- Database: `sportsBetApp`
- Collections: `users`, `sessions`, `betting_entries`, `capital_injections`, `tip_expenses`, `user_settings`
- Users collection includes Stripe customer ID and subscription ID for payment tracking
- Session collection managed by connect-mongodb-session
- User-specific collections (betting_entries, capital_injections, tip_expenses, user_settings) include userId reference
- MongoDB access gated by `requireActiveSubscription` middleware (checks active Stripe subscription)
- Premium users: No capital injection auto-generation (server data is authoritative)

**Database Schema:**
- User schema: _id (ObjectId), username (string), email (string), password (bcrypt hash), createdAt (Date)
- Betting Entry: userId (ObjectId), date (string), net (number), betAmount (number), winningAmount (number), notes (string)
- Capital Injection: userId (ObjectId), date (string), amount (number), notes (string), autoGenerated (boolean)
- User Settings: userId (ObjectId), baseline (number), weekStartDate (string)
- Email is mandatory and immutable after account creation
- ObjectId converted to string for session storage and API responses
- Schema location: `shared/schema.ts`

**Data Migration:**
- Automatic migration banner appears when authenticated user has localStorage data
- One-click migration saves all betting entries, capital injections, and settings to MongoDB
- Migration clears localStorage after successful transfer
- Uses useDataStorage hook for migration logic
- Migration banner includes "Save to Account" (migrate) and "Not now" (dismiss) options

**Stripe Subscription System:**
- Stripe Checkout integration for $9/month subscription
- User schema includes `stripeCustomerId` and `stripeSubscriptionId` fields
- API endpoints: `/api/create-checkout-session`, `/api/subscription-status`, `/api/cancel-subscription`
- `requireActiveSubscription` middleware validates active Stripe subscriptions before MongoDB access
- Subscription status checked via Stripe API (status === 'active' or 'trialing')
- Frontend `useDataStorage` hook enables cloud storage only for authenticated users with active subscriptions
- Subscription page (`/subscribe`) with Stripe Elements for payment processing
- Account settings page shows subscription status and cancellation option

### External Dependencies

**Core Libraries:**
- React 18 with TypeScript
- Vite for bundling and development server
- Express for backend API server

**UI & Styling:**
- Radix UI primitives (24+ component packages for accessible UI)
- Tailwind CSS with PostCSS
- class-variance-authority for component variant styling
- clsx/tailwind-merge for className utilities

**Data & Visualization:**
- Chart.js with chartjs-plugin-annotation
- Papa Parse for CSV processing
- date-fns for date manipulation

**State Management:**
- TanStack Query v5 for async state
- React Hook Form with Zod resolvers (configured but minimal usage)

**Database & ORM (Configured):**
- Drizzle ORM with PostgreSQL adapter
- @neondatabase/serverless for serverless PostgreSQL
- Drizzle-kit for schema management

**Development Tools:**
- tsx for TypeScript execution
- esbuild for production builds
- Replit-specific plugins for development (vite-plugin-runtime-error-modal, cartographer, dev-banner)

**Type Safety:**
- Zod for runtime validation
- Drizzle-zod for schema validation

### Design System

**Color Palette:**
- Dark mode primary: Deep slate backgrounds (220 15% 8%)
- Profit indicator: Vibrant green (142 76% 45%)
- Loss indicator: Clear red (0 72% 55%)
- Baseline/neutral: Gray (0 0% 25%)
- Primary action: Trustworthy blue (217 91% 60%)

**Component Patterns:**
- Data clarity prioritized over decoration
- Touch-optimized mobile-first interactions
- Glanceable metrics with quick actions
- Clear visual hierarchy for financial data
- Color-coded feedback throughout

## Important Implementation Details

### Timezone Handling and Week Calculations

**Date Parsing Strategy:**
- All date comparisons use **local timezone** to avoid timezone offset bugs
- Week start dates stored as YYYY-MM-DD strings and parsed using manual date component extraction
- Entry dates (datetime strings) are reduced to date-only (YYYY-MM-DD) before comparison
- This ensures consistent week boundaries regardless of timezone suffixes in stored data

**Week Boundary Logic (Profit Calculator):**
- `parseLocalDate()` helper splits "YYYY-MM-DD" strings and creates Date objects in local timezone
- `isInCurrentWeek()` extracts date portion from entry timestamps before comparison
- Week runs from weekStartDate (inclusive) to weekStartDate + 7 days (exclusive)
- This date-only comparison approach is intentional: bets are grouped by the DAY they were placed, not exact datetime

**Rationale:**
- Users care about which day a bet was placed for weekly tracking, not the exact hour/minute
- Stripping time portion prevents timezone-shifted dates from affecting week calculations
- Example: Entry "2025-09-30T23:00Z" (Sept 30 11pm UTC) → extracts "2025-09-30" → counts as Sept 30 regardless of local timezone

**Edge Cases Handled:**
- Empty or malformed week start dates fallback to today (settings always initialized with valid date)
- Entries with/without timezone suffixes (Z, +00:00, etc.) are normalized to date-only comparison
- localStorage recovery includes fallback to today if weekStartDate is missing

### Timeline Filtering System

**Rolling Time Windows:**
- Timeline filters use true rolling windows based on millisecond offsets from current time
- 1D = last 24 hours (not calendar day from midnight)
- 3D = last 72 hours
- 1W = last 7 days (168 hours)
- Month/quarter/year views use day approximations (30/90/180/365 days)
- YTD (Year to Date) anchors to January 1st of current year

**Filter Implementation:**
- "All" view: No filtering applied, shows complete dataset including future-dated entries
- Time-based views: Filter entries between cutoffDate and current time (now)
- Future-dated entries are excluded from time-based views but visible in "All" view
- Starting balance recalculates based on entries before the cutoff date

**useMemo Dependencies:**
- Recalculates when `entries`, `timelineRange`, or `baseline` changes
- Fresh `now` timestamp generated on each recalculation
- Ensures timeline stays current when data is added/removed/modified

**Design Rationale:**
- Rolling windows provide accurate "last N days" view for performance tracking
- "All" view preserves future-scheduled bets for planning purposes
- Filtered views focus on historical performance within specified timeframe
- Two linear scans per recalculation (before/after cutoff) with acceptable performance

### Freemium Flow & Storage Logic

**Storage Mode Determination:**
- `useCloudStorage` flag = `isAuthenticated && hasActiveSubscription`
- Free users (no auth): `useCloudStorage = false` → localStorage
- Authenticated without subscription: `useCloudStorage = false` → localStorage
- Authenticated with active subscription: `useCloudStorage = true` → MongoDB

**Capital Injection Auto-Generation:**
- Auto-generation effect runs ONLY when `useCloudStorage = false`
- Effect dependencies: `[baseline, entries, useCloudStorage, toast]`
- Preserves user-created injections (filters out `autoGenerated: true`)
- Generates auto-injections when balance goes negative
- localStorage users: Auto-generation works as expected
- Premium users: No auto-generation, server data is authoritative

**Data Synchronization:**
- localStorage operations: `if (!useCloudStorage)` - save/load all data types
- MongoDB operations: `if (useCloudStorage)` - query/mutation for all data types
- Migration banner: Shows for authenticated users with localStorage data
- Migration transfers: betting entries, capital injections, tip expenses, and settings
- Post-migration: localStorage cleared, cloud storage becomes authoritative

**API Protection:**
- All MongoDB routes protected with `requireActiveSubscription` middleware
- Returns 403 for authenticated users without active subscriptions
- Free users never hit these routes (useDataStorage returns null)
- Premium users have full MongoDB access for sync across devices