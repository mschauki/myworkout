# Fitness Tracker - Liquid Glass Design Guidelines

## Design Approach
**System**: Premium Liquid Glass Glassmorphism
**Justification**: Fitness tracking elevated through layered glass surfaces that create depth and sophistication. The deep blue to vibrant orange gradient system provides energy and motivation while maintaining excellent data readability through carefully controlled transparency and blur.

**Key Principles**:
- Multi-layered frosted glass surfaces with backdrop-blur-xl (24px blur)
- Deep blue (#1a237e) to vibrant orange (#ff6f00) gradient system
- Soft rounded corners (rounded-2xl, rounded-3xl) for premium fluidity
- Smooth gradient transitions creating depth hierarchy
- Enhanced transparency layering for visual interest

## Typography
**Fonts**: Inter for UI, JetBrains Mono for stats (via Google Fonts CDN)

**Hierarchy**:
- Hero/Page Titles: text-5xl md:text-6xl font-bold with gradient text effect
- Section Headers: text-3xl font-semibold
- Exercise Names: text-xl font-semibold
- Large Stats: text-6xl font-bold font-mono with subtle glow
- Medium Stats: text-4xl font-semibold font-mono
- Body Text: text-base font-medium (increased weight for glass readability)
- Labels: text-sm font-semibold
- All text uses white/near-white for optimal glass contrast

## Layout System
**Spacing Units**: Tailwind 6, 8, 12, 16, 24, 32
- Glass card padding: p-8
- Section spacing: space-y-12
- Grid gaps: gap-6
- Touch targets: min-h-14 (56px)
- Page margins: px-6 md:px-12

**Glass Layers**:
- Level 1 (Background): Deep gradient base
- Level 2 (Primary Cards): backdrop-blur-xl with 15% opacity
- Level 3 (Elevated Cards): backdrop-blur-2xl with 20% opacity
- Level 4 (Active/Hover): backdrop-blur-2xl with 25% opacity

## Component Library

### Hero Section (Dashboard)
Full-width gradient background (deep blue top to vibrant orange bottom). Large welcome headline with white text and subtle text-shadow. Quick stats grid (2x2) with glass cards floating over gradient. Hero uses abstract fitness imagery (blurred athlete silhouettes, motion blur effects) as background texture.

### Navigation
**Bottom Glass Bar**: Fixed bar with heavy backdrop-blur-xl, white/10 background, white/20 border-top. Icons use white with 60% opacity inactive, 100% active. Active state shows gradient underline indicator with smooth slide animation.

### Glass Cards
All cards use rounded-2xl with backdrop-blur-xl, white/15 background, white/20 border (1px). Hover elevates with increased blur (backdrop-blur-2xl) and white/20 background. Smooth shadow-2xl with colored glow matching gradient position.

### Exercise Library
Grid layout (1 col mobile, 2 tablet, 3 desktop) with gap-6. Each card features:
- Rounded-xl exercise image with gradient overlay
- Glass surface over image
- Muscle group badges with glass effect and gradient borders
- Exercise name in bold white
- Glass button with blurred background at bottom

### Active Workout Interface
Floating glass panels with heavy blur. Set tracking uses glass table rows with alternating opacity. Numeric inputs have glass backgrounds with increased blur on focus. Rest timer appears as centered glass modal with pulsing gradient border.

### Progress Dashboard
Stats displayed in glass cards with gradient number backgrounds. Charts use glass containers with gradient line colors (blue to orange). Interactive tooltips appear as small glass surfaces. Calendar uses glass cell backgrounds with gradient highlights for workout days.

### Buttons & Controls
**Primary Button**: Glass surface with gradient border (2px), backdrop-blur-xl, implements own hover/active states
**Buttons on Images**: Additional backdrop-blur-md on button itself, no custom hover states
**Input Fields**: Glass background with border-white/30, focus adds gradient border glow
**Toggles**: Glass track with gradient indicator
**Tabs**: Glass surface with gradient underline for active tab

## Images
**Hero Background**: Abstract fitness imagery - motion-blurred athletes in action, dynamic workout poses, or gym equipment with dramatic lighting. Image should be dark-toned (deep blues/purples) to complement gradient overlay. Positioned as full-width background with gradient overlay (blue-to-transparent top, orange-to-transparent bottom).

**Exercise Cards**: High-quality exercise demonstration photos, each with subtle gradient overlay matching card position in layout (earlier cards lean blue, later cards lean orange).

**Profile/Achievement Sections**: Authentic workout photography with glass overlays for stats and information display.

## Accessibility
- Text contrast: White text on glass maintains 7:1+ ratio through background gradient darkness
- Touch targets: 56px minimum
- Focus indicators: Gradient ring-2 with glow effect
- Reduced motion: Disable fluid animations, maintain glass aesthetic
- High contrast mode: Increase opacity and reduce blur

## Fluid Animations
**Philosophy**: Smooth, liquid-like motion enhancing premium feel

**Core Animations**:
- Glass surface transitions: 500ms cubic-bezier(0.4, 0, 0.2, 1)
- Gradient shifts: 700ms ease-in-out on scroll/interaction
- Blur intensity changes: 300ms linear
- Scale transforms: subtle (0.98-1.02 range) on press
- Float effects: gentle vertical translation (-2px to 2px) on cards
- Page transitions: fade with slight scale (0.95 to 1)

**Hover States**: Increase blur, brighten background (+5% opacity), subtle lift (translateY -2px)
**Active States**: Slight scale down (0.98), increased glow
**Loading States**: Gradient shimmer effect across glass surfaces