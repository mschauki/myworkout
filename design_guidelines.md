# Fitness Tracker - Design Guidelines (Glassmorphism Edition)

## Design Approach
**System**: Premium Glassmorphism Fitness Tracker
**Justification**: A modern fitness tracking app deserves a premium aesthetic. Glassmorphism creates visual depth and hierarchy while maintaining data clarity through frosted glass surfaces, vibrant accent colors, and subtle depth layers.

**Key Principles**:
- Frosted glass surfaces with backdrop-blur throughout
- Semi-transparent white backgrounds (#FFFFFF with 15-25% opacity)
- Vibrant orange (#FF6B35) for primary actions and achievements
- Cool blue (#4A90E2) for progress tracking and secondary elements
- Layered depth through shadow and blur combinations
- Mobile-first with glass bottom navigation

## Colors
**Primary Palette**:
- Glass Base: White (#FFFFFF) at 15-25% opacity with backdrop-blur-lg
- Primary Action: Orange (#FF6B35) - CTAs, active states, achievements
- Secondary/Progress: Blue (#4A90E2) - charts, progress indicators, links
- Borders: White (#FFFFFF) at 20% opacity
- Text on Glass: Dark gray (#1F2937) for readability
- Muted Text: Medium gray (#6B7280)

**Glass Effects**:
- Card surfaces: bg-white/20 backdrop-blur-lg border border-white/20
- Navigation: bg-white/15 backdrop-blur-xl border-t border-white/30
- Overlays: bg-white/25 backdrop-blur-md
- Buttons over images: bg-white/30 backdrop-blur-md

## Typography
**Fonts**: System fonts (San Francisco, Segoe UI, Roboto)

**Hierarchy**:
- Page Titles: text-4xl font-bold text-gray-900
- Section Headers: text-2xl font-semibold text-gray-800
- Exercise Names: text-xl font-medium text-gray-900
- Large Stats: text-5xl font-bold font-mono text-gray-900
- Medium Stats: text-3xl font-semibold font-mono text-gray-800
- Body Text: text-base text-gray-700
- Labels: text-sm font-medium text-gray-600
- Timestamps: text-xs text-gray-500

## Layout System
**Spacing Units**: Tailwind 4, 6, 8, 12, 16, 24
- Glass card padding: p-6
- Section spacing: space-y-8
- Grid gaps: gap-4
- Touch targets: min-h-14 (56px)
- Container: max-w-6xl px-4 md:px-8

**Breakpoints**: Mobile (base), Tablet (md: 768px), Desktop (lg: 1024px)

## Component Library

### Navigation
**Bottom Glass Bar (Mobile)**: Fixed bottom bar with bg-white/15 backdrop-blur-xl border-t border-white/30. Active items show orange (#FF6B35) with smooth scale-110 transition. Small circular orange indicator dot beneath active icon.

**Desktop Sidebar**: Frosted glass sidebar (bg-white/20 backdrop-blur-lg) with shadow-2xl. Navigation items with glass hover states (bg-white/30).

### Dashboard
**Hero Stats Grid**: 2x2 mobile, auto-fit desktop grid of glass cards displaying:
- Large monospace numbers with subtle orange/blue accents
- Trend indicators in blue
- Shadow-lg with subtle glow on hover

**Activity Feed**: Glass cards (bg-white/20 backdrop-blur-lg) stacked vertically with smooth hover elevation.

### Exercise Library
**Grid Layout**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

**Exercise Cards**: Glass cards with:
- Exercise image at top with subtle overlay gradient
- Muscle group badges as frosted pills (bg-blue/20 backdrop-blur-sm)
- Orange "Start Exercise" button at bottom
- Shadow-xl with hover:shadow-2xl transition

### Active Workout Interface
**Workout Cards**: Prominent glass cards with:
- Exercise header with blue accent border-l-4
- Set tracking table with alternating subtle row backgrounds
- Large orange "Complete Set" button
- Rest timer as full-screen glass overlay (bg-white/90 backdrop-blur-2xl) with blue countdown

**Timer Overlay**: Centered glass card with massive countdown numbers, orange pulse animation on completion.

### Progress Dashboard
**Charts Section**: Glass containers with:
- Line charts using blue gradient fills
- Bar charts with orange bars for achievements
- Interactive tooltips with frosted backgrounds

**Body Stats Cards**: Grid of glass cards showing measurements with blue progress indicators.

### Forms & Inputs
**Text Fields**: Glass inputs (bg-white/30 backdrop-blur-sm border border-white/30) with orange focus rings
**Primary Buttons**: Solid orange (#FF6B35) with white text, subtle shadow-lg
**Secondary Buttons**: Glass style (bg-white/30 backdrop-blur-md border border-white/30) with hover glow
**Toggles**: Blue when active, glass when inactive

### Data Visualization
**Progress Bars**: Blue fill on frosted track
**Achievement Badges**: Orange glass circles with backdrop-blur
**Calendar**: Glass card with blue selected dates, orange for workout days

## Images
**Exercise Library**: High-quality exercise demonstration images at top of each card (16:9 aspect ratio, 400x225px minimum). Images have subtle gradient overlay (black to transparent, 10% opacity) for text readability.

**Hero Section**: Full-width motivational fitness image with frosted glass overlay containing welcome message and quick stats. Image shows dynamic workout scene (person exercising, gym environment). Overlay uses bg-white/40 backdrop-blur-lg.

**Profile/Body Stats**: Optional user progress photos displayed in glass frames with rounded-lg borders.

## Accessibility
- Text contrast: 7:1 minimum on glass surfaces (use darker text)
- Touch targets: 56px minimum (44px for icon buttons)
- Focus rings: Orange (ring-2 ring-orange-500) on all interactive elements
- Keyboard navigation: Full tab support
- ARIA labels: Complete coverage for screen readers

## Micro-Interactions
**Glass Polish**: Smooth transitions (0.3s ease-in-out) on all glass surfaces
**Hover States**: Increase backdrop-blur intensity (lg to xl) and shadow depth
**Button Press**: Subtle scale-95 on active state
**Card Interactions**: Lift effect via shadow-2xl and translate-y-[-2px]
**Focus States**: Orange ring-2 with subtle glow
**Page Transitions**: Fade with blur intensity changes

**Animation Budget**: Reserve animations for critical interactions - rest timer countdown, set completion celebration (orange pulse), achievement unlocks.