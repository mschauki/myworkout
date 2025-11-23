# Jefit Minimalist - Design Guidelines

## Design Approach
**System**: Material Design foundations with minimalist aesthetic
**Justification**: Fitness tracking prioritizes data clarity and quick input during workouts. Material Design's established patterns ensure immediate usability while a minimalist approach eliminates distractions. Clean surfaces, clear typography hierarchy, and purposeful whitespace keep focus on workout execution and progress tracking.

**Key Principles**:
- Clean surfaces with subtle shadows for depth
- Immediate readability with high-contrast typography
- Intentional whitespace for visual breathing room
- Mobile-first responsive architecture optimizing one-handed use during workouts

## Typography
**Fonts**: Inter (primary UI), Roboto Mono (numeric stats) via Google Fonts CDN

**Hierarchy**:
- Page Titles: text-3xl font-bold tracking-tight
- Section Headers: text-xl font-semibold
- Exercise Names: text-lg font-medium
- Large Stats/Numbers: text-5xl font-bold font-mono
- Medium Stats: text-2xl font-semibold font-mono
- Body Text: text-base
- Labels: text-sm font-medium uppercase tracking-wide
- Micro Text: text-xs
- Timestamps: text-xs font-mono

## Layout System
**Spacing Units**: Tailwind 3, 4, 6, 8, 12
- Card padding: p-6
- Section spacing: space-y-8
- Grid gaps: gap-6
- Bottom nav height: h-16
- Touch targets: min-h-12 (48px minimum)

**Breakpoints**:
- Mobile: base (< 768px) - single column, full-width cards
- Tablet: md (768px+) - 2-column grids, sidebar navigation appears
- Desktop: lg (1024px+) - 3-column grids, max-w-7xl container

## Component Library

### Navigation
**Bottom Tab Bar (Mobile)**: Fixed bottom bar with 5 icons + labels. Active state shows solid underline indicator (h-1). Icons scale subtly (1.05) on tap.

**Sidebar Navigation (Desktop)**: Left sidebar (w-64) with icon + label menu items. Active item has solid left border (w-1) and subtle background fill.

### Exercise Library
**Layout**: Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) with gap-6. Cards feature:
- 16:9 exercise demonstration image with rounded-lg corners
- Muscle group badge (top-left overlay, solid small pill)
- Exercise name below image (text-lg font-semibold)
- Quick stats row (difficulty level, equipment needed) in text-sm
- Floating "Add to Routine" button (bottom-right, solid rounded-full)

**Interaction**: Cards elevate on hover (shadow-lg), images maintain aspect ratio, quick-add button pulses gently on long-press.

### Active Workout Interface
**Header**: Sticky top bar with workout name (text-xl font-bold), live timer (font-mono), and pause/finish buttons. Solid background with shadow-md for depth.

**Exercise Accordion**: Stacked cards with rounded-lg borders. Header shows exercise name + set count. Expansion reveals:
- Exercise image (4:3 compact ratio)
- Set table with columns: Set #, Previous, Weight, Reps, ✓
- Large numeric input fields with +/- steppers
- Rest timer countdown (appears after set completion)

**Set Completion**: Completed sets get solid left border (w-1) and checkmark animation (scale + fade).

**Rest Timer Modal**: Centered overlay (max-w-sm) with:
- Large countdown number (text-6xl font-mono font-bold)
- Circular progress ring (stroke-width-4)
- Pause/Skip solid buttons below
- Subtle background overlay (backdrop-blur-sm)

### Progress Dashboard
**Stats Grid**: 2x2 cards on mobile, 4-column on desktop. Each card displays:
- Large primary metric (text-5xl font-mono)
- Metric label (text-sm uppercase tracking-wide)
- Trend indicator (arrow + percentage change)
- Sparkline mini-chart (optional, using libraries)

**Charts Section**: Full-width cards containing:
- Line charts for exercise progress (using Chart.js or similar)
- Bar charts for volume tracking
- Dropdown selectors for exercise/time range (solid styled selects)

**Personal Records Table**: Clean table with alternating row backgrounds, sortable columns, date stamps in font-mono.

### Routine Management
**Routine Cards**: Large cards (rounded-xl) displaying:
- Routine name header (text-2xl font-bold)
- Exercise count badge
- Estimated duration
- Last performed timestamp (text-sm font-mono)
- Action buttons row: Edit, Delete, Start Workout (solid buttons)

**Drag Reorder**: Reorder mode shows drag handles (6-dot grid icon), cards lift with shadow-xl during drag.

**Routine Builder**: Two-column layout (available exercises | selected exercises). Drag-and-drop between columns with visual placeholders.

### Forms & Inputs
**Text Inputs**: Solid borders (border-2), rounded-lg corners, internal padding (p-3). Focus state adds solid ring (ring-2).

**Numeric Inputs**: Horizontal layout with large +/- buttons flanking centered number display (text-2xl font-mono). Rapid-tap supported for quick adjustments.

**Selects/Dropdowns**: Solid styled selects matching text input treatment. Dropdown menus use shadow-xl and rounded-lg.

**Toggle Switches**: Material Design-style switches for settings (lbs/kg, light/dark mode).

**Primary Buttons**: Solid fills, rounded-lg, font-semibold, px-6 py-3. Press state scales to 0.98.

**Secondary Buttons**: Solid border (border-2), transparent fill, matching padding.

### Data Visualization
**Line Charts**: Clean axis lines, single solid stroke for data line, grid lines at 25% opacity. Tooltips appear on hover with solid backgrounds.

**Progress Rings**: Circular progress indicators (stroke-width-8) for goal completion. Percentage displayed center (text-2xl font-mono).

**Calendar Heatmap**: Grid layout showing workout frequency, cells use intensity-based fills.

## Images

**Exercise Demonstrations**: Required for all exercises in library. Specifications:
- Exercise Library: 16:9 ratio, rounded-lg, fills card width
- Workout Logger: 4:3 compact ratio when accordion collapsed
- Exercise Detail View: Large 16:9 header image, rounded-xl

**Progress Photos**: Body tracking feature with:
- Upload interface with preview
- Grid gallery view (grid-cols-2 md:grid-cols-3)
- Before/after comparison view with side-by-side layout
- Date stamps overlaid on bottom (solid pill background)

**No Marketing Hero**: App launches directly into dashboard/bottom nav interface. This is a productivity tool, not a marketing site.

## Accessibility
- Contrast ratios: Minimum 7:1 for all text
- Touch targets: 48x48px minimum throughout
- Focus indicators: Solid ring (ring-2) on all interactive elements
- Form labels: Visible labels for all inputs (not placeholder-only)
- Icon buttons: Include aria-label for screen readers
- Keyboard navigation: Full support with visible focus states
- Motion: Respect prefers-reduced-motion for all animations

## Micro-Interactions
**Minimal Animation Philosophy**: Animations only where they provide functional feedback.

**Core Interactions**:
- Set completion checkmark: Scale + fade (200ms)
- Card hover: Shadow elevation change (150ms ease-out)
- Button press: Scale to 0.98 (100ms)
- Input focus: Ring appearance (150ms)
- Rest timer: Smooth number decrement with fade
- Toast notifications: Slide up from bottom (300ms)

**No Animations During**: Active set logging to maintain input responsiveness.