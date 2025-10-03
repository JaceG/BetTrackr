# Sports Betting Balance Tracker - Design Guidelines

## Design Approach: Functional Dashboard System

**Selected Approach:** Design System (Material Design principles + Fintech dashboard patterns)

**Justification:** This is a data-intensive, utility-focused mobile application requiring clarity, readability, and efficient interaction patterns. Drawing inspiration from trading platforms (Robinhood, Coinbase) and analytics dashboards (Linear, Notion) for their clean data visualization and mobile-optimized interfaces.

**Key Design Principles:**
1. Data clarity over decoration
2. Touch-optimized interactions (48px minimum touch targets)
3. Glanceable metrics and quick actions
4. Clear visual hierarchy for financial data
5. Color-coded feedback (green=profit, red=loss, neutral=baseline)

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 220 15% 8% (deep slate, reduces eye strain)
- Surface/Cards: 220 14% 12%
- Borders: 220 10% 20%
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%

**Accent Colors:**
- Profit Green: 142 76% 45% (vibrant, optimistic)
- Loss Red: 0 72% 55% (clear warning, not alarming)
- Baseline: 0 0% 25% (neutral gray for reference line)
- Primary Action: 217 91% 60% (trustworthy blue)
- Warning/Info: 38 92% 50% (amber for alerts)

**Light Mode:**
- Background: 0 0% 98%
- Surface/Cards: 0 0% 100%
- Borders: 220 10% 88%
- Text Primary: 220 15% 15%
- Text Secondary: 220 8% 45%

### B. Typography

**Font Family:**
- Primary: 'Inter' (Google Fonts) - excellent readability, modern
- Monospace: 'JetBrains Mono' for numbers/data tables - clarity for financial figures

**Scale:**
- Display: text-3xl font-bold (stats, current balance)
- Heading: text-xl font-semibold (section titles)
- Body: text-base font-normal (forms, general content)
- Caption: text-sm font-medium (labels, metadata)
- Data: text-base font-mono (numbers in tables/tooltips)

**Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### C. Layout System

**Spacing Primitives:** Use Tailwind units: 2, 3, 4, 6, 8, 12, 16
- Micro spacing: p-2, gap-2 (8px)
- Component padding: p-4 (16px)
- Section spacing: py-6, py-8 (24-32px)
- Large gaps: gap-8, gap-12 (32-48px)

**Mobile Layout:**
- Full-width sections with horizontal padding: px-4
- Max container width: max-w-7xl mx-auto (when needed on larger screens)
- Sticky controls bar: sticky top-0 with backdrop-blur
- Card-based sections with rounded-xl borders

### D. Component Library

**1. Controls Bar (Sticky Header)**
- Backdrop blur with semi-transparent background
- Horizontal scroll for multiple controls on mobile
- Pill-shaped toggle buttons (Per Bet/Per Day)
- Inline number input for baseline (large, tappable)
- Icon buttons for actions (48px touch targets)

**2. Stats Strip**
- 2x2 grid on mobile (grid-cols-2 gap-4)
- Each stat card: dark surface, large mono number, small label
- Color-coded borders: green for profit, red for loss, blue for neutral
- Icon indicators for each metric

**3. Chart Card**
- Full-width container with p-4
- Minimum height: h-80 on mobile, h-96 on tablet
- Chart.js canvas with responsive aspect ratio
- Clean axis labels in caption size
- Black baseline as horizontal line
- Segment colors: green above, red below
- Tooltip: Dark overlay card with date, net (+/- prefix), running balance, notes (italic)

**4. Entry Form (Modal/Slide-up)**
- Slide up from bottom on mobile (overlay)
- Large input fields with clear labels above
- Date/time picker: native mobile inputs
- Net Change: Large number input with +/- toggle buttons
- Notes: Multiline textarea, min-h-24
- Action buttons: Full-width primary (Save), text secondary (Cancel)

**5. Data Table**
- Alternating row backgrounds for readability
- Sticky header row
- Columns: Date | Net Change | Running | Notes | Actions
- Mobile: Stack to 2 columns (Date+Net / Running+Actions), notes below
- Running balance: Bold, mono font, color-coded
- Action icons: Edit (pencil), Delete (trash) - 40px touch targets
- Virtualized scrolling for 1000+ rows

**6. Buttons & Controls**
- Primary: Solid blue background, white text, rounded-lg, px-6 py-3
- Secondary: Outline border, transparent bg, rounded-lg
- Destructive: Red outline for delete actions
- Toggle: Segmented control with active state background
- All buttons: min-h-12 for mobile taps

**7. Import/Export UI**
- File input styled as large dashed border card with upload icon
- CSV format helper text below
- Success/error toasts: Slide from top, auto-dismiss
- Progress indicator for large CSV processing

**8. Confirmation Dialog**
- Center modal with dark backdrop
- Card with title, message, two action buttons (stacked on mobile)
- Delete confirmation: Highlight destructive action

### E. Animations

**Minimal, Purposeful Only:**
- Page transitions: Fade-in content (150ms)
- Modal/form: Slide-up (200ms ease-out)
- Chart updates: Smooth line transitions (300ms)
- Button feedback: Scale active state (100ms)
- No decorative animations, loading spinners only when needed

---

## Mobile-First Considerations

1. **Touch Targets:** Minimum 44-48px for all interactive elements
2. **Scrolling:** Smooth native scroll, no custom scrollbars
3. **Forms:** Large inputs, clear focus states, native date pickers
4. **Chart:** Pinch-to-zoom support, tap tooltips (not hover-only)
5. **Tables:** Horizontal scroll with momentum, sticky columns
6. **Navigation:** Bottom or top sticky bar, no hidden hamburger menus
7. **Feedback:** Clear visual states for all actions (loading, success, error)

---

## Data Visualization Specifics

**Chart Configuration:**
- Grid lines: Subtle, low opacity (10%)
- Baseline: Solid black line, 2px width
- Data lines: 3px width, smooth bezier curves
- Fill: Subtle gradient under lines (opacity 0.1)
- Tooltip: Custom dark card with rounded corners, shadow
- X-axis: Date labels, rotated 45° on mobile if needed
- Y-axis: Currency formatted ($), right-aligned

**Color Coding Logic:**
- Running balance >= baseline: Green segment
- Running balance < baseline: Red segment
- Transition points: Connect with thin neutral line
- Current position: Dot marker on latest point

---

## Responsive Breakpoints

- Mobile: default (< 640px)
- Tablet: sm (640px+) - 3-column stats, wider charts
- Desktop: lg (1024px+) - Side-by-side layouts, max-width containers