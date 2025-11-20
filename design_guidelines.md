# Jefit Bold Athletic - Design Guidelines

## Design Approach
**Reference-Based**: Drawing from Nike Training Club's bold energy, Strava's achievement focus, and Strong's data clarity
**Justification**: Fitness tracking demands both precision and motivation—bold contrasts create workout data clarity while vibrant accent colors drive engagement. Dark backgrounds focus attention on metrics while electric accent colors celebrate progress and energize users.

**Key Design Principles**:
- Maximum contrast for instant readability during workouts
- Electric accent colors to energize and motivate
- Bold typography hierarchy emphasizing numbers and achievements
- Athletic visual language celebrating strength and progress

## Color System

**Background Foundation**:
- Primary BG: Deep charcoal #0a0a0b to rich black #000000 gradient
- Card surfaces: #1a1a1c with subtle borders
- Elevated surfaces: #242426 for active/selected states

**Vibrant Accent System (Orange-Focused)**:
- Primary Electric: Vivid orange hsl(20, 100%, 55%) to hsl(30, 100%, 60%) gradient (CTAs, progress bars, active states, all primary actions)
- Secondary Warm: Amber hsl(30, 100%, 60%) (stats highlights, chart accents, secondary emphasis)
- Success Energy: Neon green hsl(135, 100%, 55%) (completed sets, achievements)
- Warning Pulse: Bright amber hsl(45, 100%, 60%) (rest timers, alerts)

**Text Hierarchy**:
- Primary: Pure white #ffffff (headers, key stats)
- Secondary: Light gray #b0b0b0 (labels, descriptions)
- Muted: Medium gray #6a6a6a (metadata, timestamps)
- Accent text: Use gradient overlays for numbers/stats

**Borders & Dividers**: 1px solid #2a2a2c for subtle separation, 2px gradient borders for emphasis

## Typography
**Fonts**: Montserrat (headers/UI - bold athletic feel), Inter (body - readable), Roboto Mono (numbers/stats)

**Hierarchy**:
- Page Titles: text-4xl font-black tracking-tight uppercase
- Section Headers: text-2xl font-bold
- Exercise Names: text-xl font-semibold
- Stat Numbers: text-5xl font-black font-mono with gradient text treatment
- Set Details: text-base font-medium
- Labels: text-sm font-semibold uppercase tracking-wider
- Body Text: text-base font-normal

## Layout System
**Spacing Units**: 2, 4, 6, 8 (Tailwind)
- Card padding: p-6
- Section spacing: gap-6 to gap-8
- Touch targets: min-h-14
- Bottom nav height: h-16

**Grid Strategy**:
- Mobile: Single column, px-4
- Tablet: 2 columns for stats/cards
- Desktop: max-w-7xl, 3-4 column grids for data displays

## Component Library

### Bottom Navigation
Fixed bar, height 64px, dark background #1a1a1c with top gradient border (1px, orange to blue). Five icon-based tabs with labels. Active state: Icon fills with gradient, 3px top accent bar slides in, label turns white. Inactive: Gray icons #6a6a6a.

### Exercise Library
Masonry grid (1/2/3 columns responsive). Cards: Dark background #1a1a1c, 16:9 exercise image with subtle gradient overlay (bottom), muscle group badge (top-left, gradient background, white text), exercise name overlaid on image (bottom, bold white text with text-shadow), floating gradient add button (bottom-right, 48px circle).

**Search/Filter**: Full-width search bar (dark input, gradient focus ring), horizontal scrollable filter chips below (dark background, gradient border on active, white text).

### Workout Logger
Full-screen interface with sticky header (dark gradient background, blur effect). Timer displayed prominently in gradient text (large, pulsing). Exercise cards stack vertically with expand/collapse. 

**Set Tracking**: Table with columns: Set# | Previous | Weight | Reps | ✓. Dark row backgrounds alternating (#1a1a1c / #242426). Input fields: Dark with orange focus rings. Completed sets: Left 3px neon green accent bar, check icon animates in. Current set: Subtle orange left border.

**Rest Timer**: Full-screen modal overlay (dark background with 80% opacity), centered countdown (text-7xl gradient numbers), circular progress ring (gradient stroke), large pause/skip buttons below (gradient backgrounds, 56px height).

### Progress Dashboard
**Stats Grid**: 2x2 desktop, stacked mobile. Large stat cards with gradient number displays (text-6xl), icons, trend arrows (up/down with colors), all-time record indicator (trophy icon, gradient). Cards have subtle gradient top borders.

**Charts**: Dark containers, gradient line charts (orange/blue), axis labels in gray, grid lines subtle #2a2a2c. Chart.js with custom tooltips (dark background, gradient accent). Time range selector: Segmented control with gradient active state.

**Body Tracking**: Weight chart with gradient area fill, measurement inputs in dark cards, progress photo grid (3 columns, dark borders, date stamps), comparison view with split-screen gradient divider.

### Workout Routines
Large cards displaying routine name (bold, gradient optional), exercise count badge (gradient background), duration estimate, last performed date. Action row: Edit/Delete/Start buttons (gradient primary for Start, outline style for Edit/Delete). Drag handles visible in edit mode.

### Forms & Inputs
**Text Fields**: Dark background #1a1a1c, 1px gray border, focus adds gradient ring
**Number Inputs**: Large +/- buttons (gradient on press), centered number display, unit toggle (lbs/kg) as segmented control with gradient active state
**Buttons**: Primary (gradient orange-red background, white text, bold), Secondary (dark with gradient border, white text), Destructive (red gradient)

## Images

**Exercise Demonstrations**: Required for all exercises. 16:9 aspect ratio with bottom gradient overlay (dark to transparent) for text readability. Placement: Full-width in detail views, rounded thumbnail in library cards.

**Progress Photos**: Body tracking photos in dark-bordered frames with date stamps. Comparison views use side-by-side panels with vertical gradient divider line.

**Hero Image**: None - launches directly into workout interface (productivity-first).

## Animations
- Set completion: Check icon scales in with neon green gradient burst
- Stats updates: Numbers count up with subtle gradient pulse
- Rest timer: Countdown with pulsing gradient
- Card hover: Subtle lift (scale 1.02) with increased shadow
- Background: Very subtle diagonal gradient shift (40s loop)
- NO animations during active data entry

## Accessibility
- Text contrast: Minimum 7:1 (white on dark backgrounds)
- Touch targets: 56x56px minimum
- Focus indicators: 2px gradient ring on all interactive elements
- High contrast mode: Increase border visibility, reduce gradient complexity