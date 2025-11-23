# Jefit Glassmorphism - Design Guidelines v2

## Design Approach
**System**: Material Design foundations with Glassmorphism aesthetic
**Justification**: Fitness tracking demands data clarity. Glassmorphism's frosted surfaces create visual hierarchy while blue-to-orange gradients energize the experience. Translucent cards over vibrant backgrounds deliver premium appeal without sacrificing workout readability.

**Key Principles**:
- Elevated glass surfaces with precise opacity stratification
- Premium micro-interactions that feel responsive and polished
- Strategic gradient applications for visual energy
- Mobile-first responsive architecture with desktop enhancements

## Color System

**Dark Mode** (primary):
- Background: Diagonal gradient from #0f172a → #1e3a5f → #1e2a4a → #1a1410
- Glass Base: rgba(255, 255, 255, 0.08) + backdrop-blur-xl
- Glass Elevated: rgba(255, 255, 255, 0.12) for active states
- Glass Premium: rgba(255, 255, 255, 0.15) for modals/overlays
- Text Primary: rgba(255, 255, 255, 0.95)
- Text Secondary: rgba(255, 255, 255, 0.65)
- Accent Gradient: hsl(210, 85%, 52%) → hsl(25, 85%, 55%)
- Success: #10b981 with emerald glow
- Warning: #f59e0b amber
- Border: rgba(255, 255, 255, 0.18) 1px

**Light Mode**:
- Background: hsl(210, 80%, 94%) → hsl(200, 70%, 96%) → hsl(25, 75%, 96%)
- Glass: rgba(255, 255, 255, 0.7) + backdrop-blur-xl
- Text Primary: rgba(0, 0, 0, 0.9)
- Border: rgba(255, 255, 255, 0.35)

**Glass Card Specification**:
- Border: 1px solid rgba(255, 255, 255, 0.18)
- Shadow: 0 8px 32px rgba(0, 0, 0, 0.37)
- Backdrop-filter: blur(12px) saturate(180%)

## Typography
**Fonts**: Inter (UI), JetBrains Mono (numeric stats) via Google Fonts CDN

**Hierarchy**:
- Page Titles: text-3xl font-bold tracking-tight with gradient text
- Section Headers: text-xl font-semibold
- Exercise Names: text-lg font-medium
- Stats/Numbers: text-4xl font-bold font-mono with gradient treatment
- Body: text-base
- Labels: text-sm font-medium uppercase tracking-wide
- Micro: text-xs opacity-75

## Layout System
**Spacing**: Tailwind units 2, 4, 6, 8
- Card padding: p-6
- Section gaps: gap-6
- Bottom nav height: h-20
- Touch targets: min-h-14

**Breakpoints**:
- Mobile: base (< 768px) - single column, full-width glass cards
- Tablet: md (768px+) - 2-column grids, expanded nav
- Desktop: lg (1024px+) - 3-column grids, max-w-7xl container

## Component Library

### Bottom Navigation
Frosted glass bar (backdrop-blur-xl, rgba(255, 255, 255, 0.08)) fixed at bottom. 5 icon-only tabs with gradient underline indicator (2px height) on active state. Micro-interaction: Icon scales to 1.1 on tap with 150ms spring animation.

### Exercise Library
Masonry grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-4). Glass cards with:
- 16:9 exercise image with bottom gradient overlay
- Muscle group chip (top-left, glass pill with gradient text)
- Exercise name overlay with text-shadow
- Floating quick-add button (bottom-right, gradient background with blur)
Micro-interaction: Card lifts on hover (translateY(-4px), shadow deepens, blur intensifies to blur-2xl)

### Workout Logger
Full-screen glass interface. Sticky header (blur-2xl, opacity 0.15) with workout name gradient text and live timer. Exercise cards stack with accordion expansion. 

**Set Table**: Frosted rows for Set#/Previous/Weight/Reps/Checkbox. Completed sets get emerald gradient left border (4px) and animated checkmark burst. Input fields use glass styling with gradient focus border.

**Rest Timer Modal**: Centered overlay (blur-3xl, opacity 0.2), large gradient countdown, circular progress ring, glass pause/skip buttons. Micro-interaction: Numbers fade-scale transition on decrement.

### Progress Dashboard
2x2 stat cards (stacked on mobile). Large gradient numbers (text-4xl), animated gradient border pulse for PRs. Exercise performance charts in glass containers with gradient stroke lines. Glass dropdown for exercise selector, segmented glass control for time ranges.

### Routine Management
Large glass cards with routine name (gradient text), exercise count badge, duration estimate, last performed timestamp. Glass icon buttons for Edit/Delete/Start. Drag handles appear with gradient on reorder mode. Micro-interaction: Card shadow expands during drag.

### Forms & Inputs
Glass text inputs: rgba(255, 255, 255, 0.1) background, 1px glass border, blur-sm. Focus adds gradient border glow with 200ms transition. Number inputs use large +/- glass buttons with press scale animation (0.95). Unit toggles (lbs/kg) as segmented glass control.

## Images

**Exercise Demonstrations**: Required for all exercises. 16:9 aspect ratio with subtle gradient overlay (bottom 30%) for text readability. Used in:
- Exercise detail view: Full-width with rounded-xl corners
- Library cards: Thumbnail with rounded-lg corners and glass border
- Workout logger: Compact 4:3 ratio in collapsed accordion state

**Progress Photos**: Body tracking feature. Glass-bordered frames with date stamps, before/after split-view uses glass panels with gradient divider line.

**No Hero Image**: Productivity app launches directly into bottom nav interface.

## Glassmorphism Effects

**4-Layer System**:
- Background: Animated gradient (subtle 20s loop)
- Base: Cards at blur-xl, opacity 0.08
- Elevated: Active elements at blur-2xl, opacity 0.12
- Overlay: Modals at blur-3xl, opacity 0.15-0.2

**Borders**: 1px rgba(255, 255, 255, 0.18) on all glass. Active states add gradient border with glow effect.

## Micro-Interactions

**Core Animations**:
- Set completion: Checkmark with emerald gradient burst (300ms)
- Card hover: Scale 1.02, shadow deepens, blur increases (200ms ease-out)
- Button press: Scale 0.95 (100ms), return 0.97 → 1.0 spring
- Rest timer: Gradient pulse, smooth number transitions
- Background gradient: Continuous 20s animation
- Focus rings: Gradient ring fade-in (150ms)
- Toast notifications: Slide-up from bottom with glass backdrop

**Performance**: No animations during active set logging—prioritize input responsiveness.

## Accessibility
- Contrast: 7:1 minimum via white text (opacity 0.9+) with text-shadow on glass
- Touch targets: 56x56px minimum
- Focus indicators: Gradient ring (2px, 4px offset)
- High-contrast mode: Glass opacity increases to 0.9, gradients become solid colors
- Screen reader labels on all icon-only navigation