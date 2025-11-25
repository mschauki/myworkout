# Fitness Tracker - Ultra-Minimalist Apple-Inspired Design Guidelines

## Design Approach
**System**: Apple Health + Nike Training Club inspired minimalism
**Justification**: Content-first design with maximum breathing room. Nearly invisible interface chrome lets workout data and imagery take center stage. Extreme restraint with glass effects - barely perceptible blur creating depth without distraction.

**Key Principles**:
- Maximum whitespace - let content breathe
- Nearly invisible UI chrome (borders, backgrounds)
- Extremely subtle glass (backdrop-blur-xs, white/5-10 overlays)
- Monochromatic gray scale with blue accent (#007AFF Apple blue)
- Flat design with micro-depth cues only
- Typography and spacing create all hierarchy

## Typography
**Font**: SF Pro Display / Inter (Google Fonts CDN fallback)

**Hierarchy**:
- Hero Titles: text-6xl md:text-7xl font-light tracking-tighter
- Page Headers: text-4xl font-thin tracking-tight
- Section Titles: text-2xl font-regular
- Exercise Names: text-xl font-medium
- Mega Stats: text-7xl font-extralight tabular-nums
- Standard Stats: text-4xl font-light tabular-nums
- Body: text-base font-normal leading-relaxed
- Labels: text-xs font-medium uppercase tracking-wide text-gray-400
- Primary text: gray-900, secondary: gray-500, tertiary: gray-400

## Layout System
**Spacing**: Tailwind 6, 12, 16, 24, 32, 48, 64 (generous gaps)
- Extreme vertical rhythm: space-y-32 md:space-y-48
- Card padding: p-8 md:p-12 lg:p-16
- Grid gaps: gap-12 md:gap-16
- Page margins: px-8 md:px-16 lg:px-32
- Max width: max-w-7xl mx-auto
- Touch targets: min-h-14 (Apple standard)

**Ultra-Subtle Glass**:
- Barely-there cards: backdrop-blur-xs white/5 with invisible borders
- Elevated states: backdrop-blur-sm white/10 on interaction
- Overlays: backdrop-blur-md white/40 maximum

## Component Library

### Hero Section
Full-width clean fitness photography (bright, minimalist gym with natural light, or serene outdoor workout). Large centered headline in font-light gray-900. No visible overlay - just pure image with text floating on top. CTA button with backdrop-blur-md white/20 background (no hover states). Three large stats below in nearly invisible glass cards (backdrop-blur-xs white/5).

### Navigation
**Desktop**: Borderless white background. Logo left (gray-900), centered nav links (gray-500 with blue-500 active), profile icon right. No visible chrome - just floating elements.
**Mobile**: Minimal tab bar with icons only (gray-400 inactive, blue-500 active). No background until scroll - then adds backdrop-blur-sm white/80.

### Workout Cards
Nearly flat with rounded-2xl. White background with gray-100/50 border (almost invisible). On hover: subtle shadow-sm and white/90 background. Each card shows large exercise image (full-bleed rounded top), minimal text overlay with backdrop-blur-sm white/20 badge for muscle group. Title in gray-900, metadata in gray-500.

### Active Workout Interface
Clean white panel with extreme padding. Set counter uses minimal table - no borders, just gray-50 row backgrounds alternating. Weight/rep inputs are borderless with gray-100 focus backgrounds. Rest timer as centered modal with thin blue-500 progress ring and massive font-light countdown.

### Progress Dashboard
Grid of stat cards (1-2-3 col responsive) with gap-16. Each card barely visible (white/5 background) showing one large metric in font-extralight. Line charts with single blue-500 stroke, no grid lines, no axes - pure data. Calendar heat map with gray-100 base, blue-500/20 to blue-500 intensity.

### Exercise Library
Masonry grid layout (Pinterest-style) with gap-8. Cards showing large exercise photos with minimal overlays. Muscle tags as pill shapes with gray-100 fill and gray-700 text. Hover reveals blue-500 underline on exercise name only.

### Forms & Controls
**Primary Button**: Solid blue-500, white text, rounded-xl, no shadow, font-medium
**Secondary**: White background, gray-900 text, invisible border
**Glass Button (on images)**: backdrop-blur-md white/20, white text
**Inputs**: Borderless with gray-100 background, rounded-lg, blue-500 focus ring (ring-1)
**Toggles**: Gray-200 track, blue-500 thumb, minimal size
**Checkboxes**: Invisible until checked - blue-500 fill

## Images
**Hero**: High-quality minimalist fitness photography - bright modern gym interior with clean lines, or peaceful outdoor setting with natural lighting. Full-width, no gradient overlays. Images should feel spacious and calm.

**Exercise Cards**: Professional demonstration photos on pure white or seamless backgrounds. Well-lit, focused on form and movement. Portrait orientation preferred.

**Dashboard**: Optional progress photos with clean white borders and generous spacing.

## Accessibility
- Gray-900 on white maintains 15:1 contrast
- Blue-500 accent maintains 4.5:1 minimum
- 56px touch targets on mobile
- Focus: Blue-500 ring-1 with ring-offset-4
- Reduced motion: Remove all transitions, maintain layout
- Clear hierarchy through extreme spacing and type scale

## Animations
**Micro-interactions only**:
- Hover: 200ms opacity shift (0.9 to 1.0), subtle shadow-sm appears
- Scale: None - Apple doesn't scale
- Transitions: 250ms ease-out maximum
- Loading: Minimal blue-500 spinner (16px stroke-2)
- Page transitions: Simple 200ms crossfade

**Restraint**: No bounces, no slides, no complex choreography. Pure, simple, immediate.