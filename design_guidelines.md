# Fitness Tracker - Minimalist Glass Design Guidelines

## Design Approach
**System**: Minimalist Glass with Clean Modernism
**Justification**: A refined fitness tracking experience using subtle glassmorphism that enhances content clarity rather than competing with it. Soft blues and neutral grays create calm focus while light glass effects add depth without distraction.

**Key Principles**:
- Subtle frosted glass with light blur (backdrop-blur-sm to backdrop-blur-md)
- Soft blue (#3b82f6) and neutral gray (#6b7280, #f3f4f6) palette
- Generous whitespace for breathing room
- Clean solid backgrounds with glass overlays
- Minimal visual complexity - clarity over decoration

## Typography
**Fonts**: Inter for all text (via Google Fonts CDN)

**Hierarchy**:
- Hero/Page Titles: text-4xl md:text-5xl font-bold tracking-tight
- Section Headers: text-2xl md:text-3xl font-semibold
- Exercise Names: text-lg font-semibold
- Large Stats: text-5xl font-bold tabular-nums
- Medium Stats: text-3xl font-semibold tabular-nums
- Body Text: text-base font-normal
- Labels: text-sm font-medium text-gray-600
- All primary text uses gray-900, secondary text gray-600

## Layout System
**Spacing Units**: Tailwind 4, 6, 8, 12, 16, 24, 32
- Card padding: p-6 md:p-8
- Section spacing: space-y-16 md:space-y-24 (generous vertical rhythm)
- Grid gaps: gap-8
- Touch targets: min-h-12
- Page margins: px-6 md:px-16 lg:px-24
- Max content width: max-w-7xl mx-auto

**Glass System**:
- Background Glass: backdrop-blur-sm with white/80 or gray-50/90
- Card Glass: backdrop-blur-md with white/70
- Elevated Glass: backdrop-blur-md with white/80 on hover

## Component Library

### Hero Section
Full-width section with soft blue gradient background (blue-50 to white). Large, clean headline in gray-900. Hero image showing clean, minimalist fitness environment (modern gym, yoga studio, or clean workout space) with subtle white/40 overlay. Quick stats row with glass cards (2-4 metrics) floating below hero image.

### Navigation
**Top Bar (Desktop)**: Clean white background with subtle shadow. Logo left, navigation center, profile right. Simple hover underline in blue-500.
**Bottom Bar (Mobile)**: Fixed glass bar with backdrop-blur-md, white/90 background, gray-200 border-top. Icons in gray-600, active state blue-500.

### Glass Cards
Rounded-xl with backdrop-blur-md, white/70 background, gray-200/50 border (1px). Subtle shadow-lg. Hover adds white/80 background and shadow-xl. Clean and light feeling.

### Exercise Library
Grid layout (1 col mobile, 2 tablet, 3 desktop) with gap-8. Each card:
- Rounded-lg exercise image (clean demonstration photo)
- White/60 glass overlay on image
- Clean muscle group badges (gray-100 background, gray-700 text, rounded-full)
- Exercise name in gray-900
- Subtle blue-500 text link for "View Details"

### Active Workout Interface
Clean glass panel with generous padding. Set tracking uses simple table with gray-100 row backgrounds alternating. Number inputs have white backgrounds with gray-300 borders, focus shows blue-500 ring. Rest timer as centered glass modal with blue-500 progress ring.

### Progress Dashboard
Stats in clean glass cards with blue-50 accent backgrounds. Charts use minimal gray-200 grid lines with blue-500 data lines. Simple tooltips with white backgrounds and subtle shadows. Calendar grid with gray-100 backgrounds, blue-500 highlights for workout days.

### Forms & Controls
**Primary Button**: Solid blue-500 background, white text, rounded-lg, shadow-sm
**Secondary Button**: White background, gray-700 text, gray-300 border
**Glass Button (on images)**: White/20 background, backdrop-blur-md, white text, no custom hover states
**Input Fields**: White background, gray-300 border, rounded-lg, focus shows blue-500 ring
**Toggles**: Gray-200 track, blue-500 active indicator
**Radio/Checkbox**: Blue-500 checked state with white checkmark

## Images
**Hero**: Modern, clean fitness environment - minimalist gym interior, serene yoga space, or bright outdoor workout setting. Light, airy photography with natural lighting. Use as full-width background with subtle white gradient overlay.

**Exercise Cards**: Clean demonstration photos on neutral backgrounds showing proper form. Professional, well-lit images without busy backgrounds.

**Profile Section**: Optional user workout photos with clean glass information overlays.

## Accessibility
- Text contrast: Gray-900 on white backgrounds maintains 12:1+ ratio
- Touch targets: 48px minimum
- Focus indicators: Blue-500 ring-2 with ring-offset-2
- Reduced motion: Disable transitions, maintain glass aesthetic
- Clear visual hierarchy through spacing and typography weight

## Animations
**Philosophy**: Subtle, purposeful motion that doesn't distract

**Transitions**:
- Glass surfaces: 200ms ease-in-out
- Hover states: 150ms ease-out
- Scale: Minimal (1 to 1.02) on interactive elements
- Page transitions: Simple 200ms fade

**Hover States**: Increase background opacity (+10%), add shadow-xl
**Active States**: Slight scale (0.98)
**Loading**: Simple blue-500 spinner or skeleton screens with gray-200 backgrounds