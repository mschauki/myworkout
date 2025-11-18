# Jefit Glassmorphism - Design Guidelines

## Design Approach
**System Selected**: Material Design foundations adapted for Glassmorphism aesthetic
**Justification**: Workout tracking demands data clarity—glassmorphism's layered depth and frosted surfaces create visual hierarchy while vibrant gradients energize the fitness context. Translucent cards over gradient backgrounds provide modern appeal without sacrificing workout session readability.

**Key Design Principles**:
- Layered glass surfaces with strategic opacity levels
- High-contrast text on translucent backgrounds for workout legibility
- Vibrant gradient backdrops to energize fitness tracking
- Precise backdrop blur values for depth without distraction

## Color System

**Dark Mode Primary** (default experience):
- Background Gradients: Deep purple-to-blue diagonal (from #1a0b2e via #2d1b4e to #0f172a), or teal-to-purple radial overlays
- Glass Surface Base: rgba(255, 255, 255, 0.08) with backdrop-blur-xl
- Glass Surface Elevated: rgba(255, 255, 255, 0.12) for active cards
- Text Primary: rgba(255, 255, 255, 0.95) for high readability
- Text Secondary: rgba(255, 255, 255, 0.65)
- Accent Gradients: Cyan-to-purple (#06b6d4 to #8b5cf6) for CTAs, stats highlights
- Success/Complete: Emerald glow (#10b981)
- Rest Timer: Amber (#f59e0b)

**Light Mode Adaptation**:
- Background Gradients: Soft pink-to-lavender (#fce7f3 to #e0e7ff)
- Glass Surface: rgba(255, 255, 255, 0.7) with backdrop-blur-xl
- Text Primary: rgba(0, 0, 0, 0.9)
- Borders: rgba(255, 255, 255, 0.3) with 1px stroke

**Glass Card Specifications**:
- Border: 1px solid rgba(255, 255, 255, 0.18)
- Shadow: 0 8px 32px rgba(0, 0, 0, 0.37)
- Backdrop filter: blur(12px) saturate(180%)

## Typography
**Font Family**: Inter (primary, excellent glass UI readability), JetBrains Mono (stats/numbers)

**Hierarchy**:
- Page Titles: text-3xl font-bold tracking-tight
- Section Headers: text-xl font-semibold
- Exercise Names: text-lg font-medium
- Set Details: text-base font-normal
- Stats/Numbers: text-3xl font-bold font-mono with gradient text treatment
- Labels: text-sm font-medium uppercase tracking-wide
- Microcopy: text-xs opacity-75

## Layout System
**Spacing**: Tailwind units of 2, 4, 6, 8
- Glass card padding: p-6 (more generous for premium feel)
- Section gaps: gap-6
- Bottom nav: h-20 (slightly taller with glass effect)
- Touch targets: min-h-14

**Container Strategy**:
- Mobile: Full width with px-4
- Desktop: max-w-7xl mx-auto
- Layered backgrounds: Fixed gradient base, scrollable glass content above

## Component Library

### Navigation
**Bottom Navigation Bar**: Frosted glass strip with backdrop-blur-xl, rgba(255, 255, 255, 0.08) background, 5 tabs with icon-only design. Active tab gets gradient underline indicator (2px, cyan-to-purple). Fixed bottom with safe-area-inset padding.

### Exercise Library
**Exercise Cards**: Glass morphism cards in masonry grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-4). Each card: backdrop-blur-xl, semi-transparent white background, muscle group gradient chip (top-left), exercise image with 16:9 ratio, exercise name overlay with text-shadow for readability, quick-add floating button (bottom-right) with gradient background and backdrop-blur.

**Filtering**: Horizontal scrollable chip group with glass pill buttons, search bar as prominent glass input with magnifying glass icon.

### Workout Logger
**Active Workout Interface**: Full-screen glass panel over gradient. Sticky header bar (backdrop-blur-2xl, higher opacity 0.15) with workout name and real-time elapsed timer in gradient text. Exercise list as stacked glass cards with accordion expansion. 

**Set Tracking Table**: Frosted table rows, columns for Set#/Previous/Weight/Reps/Check. Input fields with glass styling (border, subtle inner shadow). Completed rows get emerald gradient left border and check icon animation. Previous performance in muted gradient text.

**Rest Timer**: Modal glass overlay (centered, backdrop-blur-3xl) with large countdown numbers in gradient, circular progress ring, pause/skip glass buttons below.

### Progress Dashboard
**Statistics Grid**: 2x2 on desktop, stacked mobile. Each stat card: Large gradient number (text-4xl), label, trend arrow, subtle animated gradient border pulse for records. Cards have deeper glass effect (0.12 opacity).

**Charts**: Glass containers with gradient-stroked chart lines. Chart.js integration with custom glassmorphic tooltips. Exercise selector as glass dropdown, time range as segmented glass control.

**Body Stats**: Weight tracking line chart with gradient fill below line, measurement inputs in glass cards, progress photo gallery in glass masonry grid with lightbox expansion.

### Workout Routines
**Routine Cards**: Large glass cards with routine name in gradient text, exercise count badge (glass chip), estimated duration, last performed date. Action buttons (Edit/Delete/Start) as glass icon buttons. Drag handles with gradient when reordering in edit mode.

### Forms & Inputs
**Text Inputs**: Glass aesthetic with rgba(255, 255, 255, 0.1) background, 1px glass border, backdrop-blur-sm, focus state adds gradient border glow.

**Number Inputs**: Large +/- glass buttons flanking input, haptic-style press animations, unit toggle (lbs/kg) as segmented glass control.

## Images

**Exercise Demonstrations**: Required for all 150+ exercises. Aspect ratio 16:9, displayed with subtle gradient overlay at bottom for text readability. Placement: Full-width in exercise detail view, rounded corners on library card thumbnails.

**Progress Photos**: Optional body tracking feature. Photos displayed in glass-bordered frames with date stamps, before/after comparison uses split-view glass panels with gradient divider line.

**No Hero Image**: Launch directly into bottom nav interface—this is productivity-first.

## Glassmorphism Effects

**Layering System**:
- Background Layer: Animated gradient (subtle slow shift)
- Mid Layer: Main glass cards (blur-xl, opacity 0.08-0.12)
- Front Layer: Elevated elements (blur-2xl, opacity 0.15)
- Overlay Layer: Modals and sheets (blur-3xl, opacity 0.2)

**Borders**: All glass surfaces use 1px borders with rgba(255, 255, 255, 0.18) for definition. Active/selected states add gradient border glow.

**Shadows**: Combine box-shadow with backdrop-filter for authentic depth: `0 8px 32px rgba(0, 0, 0, 0.37)` standard, `0 12px 48px rgba(0, 0, 0, 0.5)` for elevated modals.

## Animations
- Rest timer: Smooth gradient pulse and number transitions
- Set completion: Check icon with emerald gradient burst
- Card interactions: Subtle scale (1.02) with shadow/blur increase
- Background gradients: Slow 20s infinite animation loop
- NO animations during active workout data entry

## Accessibility
- Text contrast ratios: Minimum 7:1 on glass surfaces using white text with high opacity (0.9+) and text-shadow for legibility
- Touch targets: 56x56px minimum with glass button styling
- Focus indicators: Gradient ring around interactive glass elements
- High-contrast mode override: Reduce translucency to 0.9 opacity for glass surfaces when enabled