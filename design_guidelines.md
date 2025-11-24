# Fitness Tracker - Material Design 3 Guidelines

## Design Approach
**System**: Material Design 3 with dynamic elevation and vibrant color system
**Justification**: Fitness tracking demands clear data hierarchy and energetic visual language. Material Design 3's elevation system creates depth for component layering, while its bold color approach motivates users. The system's responsive surfaces and motion principles optimize both workout logging and progress visualization.

**Key Principles**:
- Dynamic elevation layers create visual hierarchy and depth
- Bold, vibrant color system energizes the fitness experience
- Container surfaces with distinct elevation levels
- Fluid, purposeful motion that guides user attention
- Mobile-first with gesture-friendly touch targets

## Typography
**Fonts**: Google Fonts - Roboto (primary), Roboto Mono (stats)

**Hierarchy**:
- Display Large: text-6xl font-bold (Hero stats, achievements)
- Headline Large: text-4xl font-bold (Page titles)
- Headline Medium: text-3xl font-semibold (Section headers)
- Title Large: text-2xl font-medium (Exercise names, cards)
- Title Medium: text-xl font-medium (Subtitles)
- Body Large: text-base (Primary content)
- Body Medium: text-sm (Secondary content)
- Label Large: text-sm font-medium uppercase tracking-wide (Buttons, badges)
- Label Small: text-xs font-medium (Timestamps, metadata)

## Layout System
**Spacing Units**: Tailwind 4, 8, 12, 16, 24, 32
- Container padding: p-6 md:p-8
- Card padding: p-6
- Section gaps: space-y-12
- Component gaps: gap-6
- Grid gaps: gap-4
- Touch targets: min-h-14 (56px)

**Breakpoints**: Mobile (base), Tablet (md: 768px), Desktop (lg: 1024px), Wide (xl: 1280px)
**Containers**: max-w-7xl with px-4 md:px-6

## Component Library

### Navigation
**Top App Bar**: Elevated surface with medium prominence shadow. Full-width with logo/title left, actions right. Sticky positioning with backdrop blur. Elevation increases on scroll.

**Bottom Navigation Bar (Mobile)**: High elevation surface anchored to viewport bottom. Four primary tabs with Material icons. Active state shows filled icons with vibrant indicator bar (h-1) underneath. Ripple effect on tap. Icon + label combination.

**FAB (Floating Action Button)**: Large circular button (w-14 h-14) with highest elevation, positioned bottom-right with mb-20 mr-4 offset. Contains primary workout action ("Start Workout"). Smooth scale animation on press.

### Dashboard
**Stats Cards Grid**: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 with gap-4. Elevated cards with:
- Large monospace numbers (text-5xl font-bold)
- Descriptive label above
- Small trend indicator (icon + percentage)
- Subtle background gradient overlay
- Medium elevation shadow

**Quick Actions Section**: Horizontal scrollable card row with:
- Wide cards (min-w-64) displaying recent workouts
- Exercise thumbnail images
- Workout summary stats
- "Continue" action button
- Low elevation, increases on hover

**Activity Feed**: Vertical list with timeline indicators. Cards showing:
- Achievement badges with animated reveals
- Workout summaries with set counts
- Personal records with celebratory styling
- Low elevation cards with dividers

### Exercise Library
**Search Bar**: Elevated search field with leading icon, full-width on mobile. Persistent elevation, expands on focus with smooth animation.

**Filter Chips**: Horizontal scroll row of elevated chip buttons. Active chips show filled style with vibrant background. Toggle interaction with ripple.

**Exercise Grid**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6. Each card features:
- 16:9 aspect ratio exercise image at top
- Muscle group chips as small elevated pills
- Exercise title (text-xl font-medium)
- Equipment requirement with icon
- Difficulty indicator
- Elevated card with hover lift animation

### Workout Builder
**Routine Card**: Large elevated surface containing:
- Routine header with editable title
- Drag-handle indicators for reordering
- Exercise list with thumbnail images
- Set configuration (compact table format)
- Add exercise FAB within card
- High elevation with rounded-xl corners

**Exercise Selection Sheet**: Bottom sheet modal with:
- Categorized tabs for muscle groups
- Search integration
- Grid of selectable exercises
- Selected state with checkmarks
- Confirm button in elevated footer

### Active Workout Interface
**Exercise Card**: Prominent elevated card at top showing current exercise:
- Large exercise image with overlay gradient
- Exercise name (text-3xl)
- Target muscle group badges
- Form tips expandable section

**Set Tracker**: Below exercise card, elevated surface with:
- Set number indicators (large, circular)
- Weight/reps input fields (outlined style)
- Previous set reference (ghosted)
- Checkmark buttons for set completion
- Auto-advance to next set

**Rest Timer Sheet**: Full-width bottom sheet overlay with:
- Huge countdown timer (text-7xl font-mono)
- Circular progress indicator
- Skip/Add time controls
- Next exercise preview

**Floating Controls**: Bottom bar with:
- Previous/Next exercise navigation
- Pause workout button
- Finish workout action
- Highest elevation layer

### Progress Dashboard
**Period Selector**: Segmented button group (Week/Month/Year) with elevated active state

**Chart Cards**: Large elevated surfaces containing:
- Line charts for weight progression
- Bar charts for volume tracking
- Clean axis labels and grid lines
- Interactive tooltips on data points
- Legend with color indicators

**Personal Records Section**: Elevated cards in grid showing:
- Exercise name with icon
- Record weight/reps (huge monospace)
- Date achieved
- "Beat Record" motivation text
- Celebration animation on new PR

**Body Stats Tracker**: Card with tab navigation (Measurements/Photos):
- Input fields for measurements
- Before/after photo comparison
- Progress visualization
- Timeline scrubber

### Forms & Inputs
**Text Fields**: Outlined style with label animation. Focus state shows vibrant border with floating label. Helper text below field.

**Buttons**: Three elevation levels (elevated, filled, outlined). Standard heights (h-10, h-12). Ripple effect on all interactions. Icon + text combinations.

**Switches**: Material toggle switches with track animation

**Sliders**: Vibrant track with elevated thumb. Show value on drag.

## Images
**Hero Section**: Not applicable - Dashboard leads with stats grid

**Exercise Library**: Each exercise card requires a demonstration image (16:9 ratio). Use clear, well-lit photos showing proper form. Images should feature diverse body types and settings (gym, home, outdoor).

**Workout Cards**: Thumbnail images (4:3 ratio) showing primary exercise of the routine.

**Progress Photos**: User-uploaded before/after comparison images in body stats section.

## Accessibility
- Text contrast: 7:1 minimum (WCAG AAA)
- Touch targets: 56px minimum for all interactive elements
- Focus indicators: Vibrant 3px outline on keyboard focus
- Elevation: Never rely on shadow alone for information
- Motion: Respect prefers-reduced-motion

## Motion & Animation
**Material Motion System**:
- **Easing**: Standard (0.4s cubic-bezier), emphasized (0.6s), decelerated (0.3s)
- **Elevation changes**: 0.3s duration with emphasized easing
- **Page transitions**: 0.4s shared axis transforms
- **Ripple effects**: Radial expansion from touch point
- **FAB transformations**: Morph into sheets with container transform
- **Number counters**: Animate stats on mount with spring physics
- **Chart reveals**: Stagger bar/line animations on scroll-into-view
- **Achievement celebrations**: Confetti particle systems with fade-out

**State Changes**:
- Hover: Elevation lift (8dp → 12dp) with 0.2s duration
- Active: Slight scale-down (0.98) with quick snap-back
- Loading: Circular progress indicators with indeterminate animation
- Success: Checkmark animation with ripple expansion