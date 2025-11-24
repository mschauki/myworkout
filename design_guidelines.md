# Fitness Tracker - Design Guidelines

## Design Approach
**System**: Modern, clean fitness tracking with subtle premium touches
**Justification**: A fitness tracking application needs to be functional and data-focused while maintaining visual appeal. This design balances professionalism with subtle modern aesthetics through smooth transitions, clean typography, and thoughtful color usage.

**Key Principles**:
- Clean, data-focused interface optimized for tracking workouts
- Small rounded corners (rounded-md) for all components following universal design standards
- Smooth transitions for polished feel without sacrificing performance
- Mobile-first design with one-handed workout logging optimization
- Subtle visual hierarchy through typography and spacing

## Typography
**Fonts**: System fonts for optimal performance

**Hierarchy**:
- Page Titles: text-4xl font-bold
- Section Headers: text-2xl font-semibold
- Exercise Names: text-xl font-medium
- Large Stats: text-5xl font-bold font-mono
- Medium Stats: text-3xl font-semibold font-mono
- Body Text: text-base
- Labels: text-sm font-medium
- Timestamps: text-xs text-muted-foreground

## Layout System
**Spacing Units**: Tailwind 4, 6, 8, 12, 16, 24
- Card padding: p-6
- Section spacing: space-y-8
- Grid gaps: gap-4
- Touch targets: min-h-9 (56px for buttons)
- Standard margins: px-4 md:px-8

**Breakpoints**: Mobile (base), Tablet (md: 768px), Desktop (lg: 1024px)
**Containers**: max-w-6xl with px-4

## Component Library

### Navigation
**Bottom Tab Bar (Mobile)**: Fixed full-width bar at bottom with standard background and border-top. Icons scale subtly on active state (scale-110). Active items show primary color text with small circular indicator dot. Smooth transitions for all interactions.

### Dashboard
**Layout**: Standard page layout with max-w-6xl container
- Welcome headline (text-4xl font-bold)
- Stats grid (2x2 on mobile, auto-fit desktop) using Card components
- Large numbers displayed with monospace font for readability
- Recent activity feed with Cards

### Exercise Library
**Grid**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 with gap-4. Standard Cards with:
- Exercise image at top
- Muscle group badges as small pills
- Exercise name and description
- Equipment information
- Action buttons at bottom
- Smooth hover transitions

### Active Workout Interface  
**Cards**: Standard rounded-md cards with smooth transitions
- Exercise information clearly displayed
- Set table with clean rows
- Numeric inputs with proper focus states
- Completion indicators
- Rest timer overlay when active

### Progress Dashboard
**Stats Section**: Cards in responsive grid displaying:
- Primary metrics in large font-mono
- Trend indicators where applicable
- Charts with clean, readable styling

**Charts Area**: Standard containers with:
- Clean line/bar charts
- Readable labels and legends
- Interactive tooltips on hover

### Forms & Inputs
**Text Fields**: Standard inputs with rounded-md borders, proper focus rings
**Buttons**: Standard button component with variants (default, outline, ghost, destructive) and sizes (sm, default, lg, icon)
**Toggles**: Standard switch/checkbox components
**Tabs**: Clean tab interface with rounded-md styling

### Data Visualization
**Charts**: Clean, readable charts focusing on data clarity
**Progress Indicators**: Simple progress bars and completion percentages
**Calendar**: React DayPicker with clean styling and smooth interactions

## Accessibility
- Text contrast: 7:1 minimum (WCAG AAA)
- Touch targets: 56px minimum (44px for icon buttons)
- Focus indicators: Clear ring-2 on all interactive elements
- Keyboard navigation: Full support
- Screen readers: Complete aria-labels

## Micro-Interactions
**Animation Philosophy**: Subtle, purposeful animations that enhance usability

**Core Animations**:
- Smooth transitions on all interactive elements (0.3s cubic-bezier)
- Button press: subtle active states via active-elevate-2
- Hover states: subtle elevation via hover-elevate
- Focus: ring animations
- Page transitions: smooth fades

**Interaction States**:
- Hover: Subtle background elevation
- Active: More pronounced elevation for tactile feedback
- Focus: Clear ring indicator
- Disabled: Reduced opacity
