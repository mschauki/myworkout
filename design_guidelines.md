# Jefit Clone - Design Guidelines

## Design Approach
**System Selected**: Material Design with fitness app adaptations
**Justification**: Information-dense workout tracking app requiring robust data visualization, clear hierarchy for exercise listings, and strong touch targets for active workout sessions. Material's elevation system perfect for card-based exercise layouts and bottom navigation patterns.

**Key Design Principles**:
- Data clarity over decoration - workout stats must be immediately scannable
- Touch-first interactions - large tap targets for active workout sessions
- Information density - pack functionality without overwhelming users
- Progressive disclosure - reveal detail when needed, hide complexity when not

## Typography System

**Font Family**: Roboto (primary), Roboto Mono (for numbers/stats)

**Hierarchy**:
- Page Titles: text-3xl, font-bold (Workout Log, Exercise Library)
- Section Headers: text-xl, font-semibold (Today's Workout, Progress Charts)
- Exercise Names: text-lg, font-medium
- Set Details: text-base, font-normal (12 reps x 135 lbs)
- Stats/Numbers: text-2xl, font-bold, font-mono (Personal records, volume totals)
- Labels/Meta: text-sm, font-medium (Muscle group tags, timestamps)
- Microcopy: text-xs (Rest timer, last workout date)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-4
- Section spacing: space-y-6 or gap-6
- Card margins: m-2 between cards, p-4 internal
- Bottom nav height: h-16
- List item height: min-h-16 for touch targets

**Container Strategy**:
- Mobile-first: Full width with px-4 edge padding
- Desktop: max-w-6xl mx-auto for main content
- Exercise library: Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

## Component Library

### Navigation
**Bottom Navigation Bar** (5 tabs):
- Home, Workouts, Exercises, Progress, Profile
- Icons with labels, h-16, active state with indicator
- Fixed position bottom-0, spans full width

### Exercise Library
**Exercise Cards** (150+ exercises):
- Muscle group tag chips at top
- Exercise name (text-lg, font-medium)
- Equipment required badge
- Thumbnail image (exercise demonstration)
- Quick-add button to workout
- Expandable for full description and animated demo

**Filtering System**:
- Horizontal scrolling muscle group chips
- Search bar with debounced input
- Equipment filter dropdown

### Workout Builder/Logger
**Active Workout Interface**:
- Sticky header with workout name and elapsed timer
- Exercise accordion list
- Per-exercise: Sets table with checkboxes
- Input fields for weight/reps (type="number", large touch targets)
- Rest timer between sets (countdown with pause/skip)
- Quick-access number pad for rapid input
- Floating action button to add exercise mid-workout

**Set Tracking Table**:
- Columns: Set #, Previous, Weight, Reps, Checkbox
- Previous performance shown in muted text
- Completed rows get check state styling
- Swipe actions: delete set, duplicate set

### Progress Dashboard
**Statistics Cards** (2-column grid on desktop):
- Total workouts this month
- Personal records broken
- Total volume lifted
- Consistency streak
- Each card: Large number (text-3xl, font-bold, font-mono), label below, trend indicator

**Charts Section**:
- Line graphs for exercise progress (Chart.js or Recharts)
- X-axis: Date, Y-axis: Weight/Volume
- Interactive tooltips on data points
- Exercise selector dropdown
- Time range toggle (1M, 3M, 6M, 1Y, All)

**Body Stats Tracking**:
- Line graph for weight over time
- Measurement inputs (weight, body fat %, custom measurements)
- Date-based entry system
- Photo progress gallery option

### Workout Calendar
**Calendar View**:
- Month grid layout
- Completed workout indicators (dot or icon)
- Click date to see workout details
- Color intensity based on volume

### Workout Routines Library
**Routine Cards**:
- Routine name and description
- Exercise count and estimated duration
- Last performed date
- Edit/Delete/Start workout actions
- Drag-to-reorder exercises in edit mode

### Forms & Inputs
**Exercise Creation/Edit**:
- Text inputs for name, description
- Dropdown for muscle group, equipment
- Image upload for demonstration
- Video URL input (optional)

**Number Inputs** (weight/reps):
- Large increment/decrement buttons
- Direct keyboard input
- Unit toggle (lbs/kg)

## Images

**Exercise Demonstrations**:
- Required for each exercise in library
- Aspect ratio: 16:9 or 4:3
- Can be static illustrations or animated GIFs
- Placement: Exercise detail view (full width), exercise card (thumbnail)

**No Hero Image**: This is a productivity app, not a marketing site. Launch directly into functionality with bottom navigation and immediate access to workouts.

**User Progress Photos** (optional feature):
- Body measurement tracking section
- Before/after comparison view
- Date-stamped entries

## Animations
**Minimal, purposeful animations only**:
- Rest timer countdown (smooth number transitions)
- Check animations on set completion
- Accordion expand/collapse (200ms ease)
- Bottom sheet slides for exercise picker
- NO decorative animations during active workouts

## Accessibility
- Touch targets minimum 44x44px for all interactive elements
- High contrast for workout session (critical data visibility)
- Consistent form input styling across all number fields
- Screen reader labels for icons and charts
- Keyboard navigation for desktop users