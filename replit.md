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
- Minimal API surface (optional server mode for persistence)
- In-memory storage with IStorage interface for future extensibility
- Development-only Vite middleware integration for HMR

**API Design:**
- RESTful API prefix: `/api/*`
- JSON request/response format
- Express middleware for logging, parsing, and error handling

**Storage Layer:**
- MemStorage class implementing IStorage interface
- Designed for easy swap to database persistence
- Current implementation: in-memory Map-based storage
- User schema defined but minimal server functionality implemented

### Data Storage Solutions

**Client-Side (Primary):**
- Browser LocalStorage for entry persistence
- JSON serialization of entry data
- Baseline configuration stored locally

**Server-Side (Optional):**
- Configurable storage mode toggle in UI
- MemStorage implementation ready for JSON file or database backend
- Drizzle ORM configured for future PostgreSQL integration

**Database Schema (Prepared but not fully utilized):**
- PostgreSQL dialect configured via Drizzle
- Users table with UUID primary keys
- Schema location: `shared/schema.ts`
- Migrations output: `./migrations`

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