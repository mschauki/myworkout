# Jefit Minimalist - Design Guidelines

## Design Approach
**System**: Apple Human Interface Guidelines with minimalist principles
**Justification**: Fitness tracking demands focus and clarity. Clean surfaces, generous whitespace, and restrained typography keep users engaged with their workout data, not decorative elements. Functional simplicity reduces cognitive load during exercise sessions.

**Key Principles**:
- Content-first layouts with generous breathing room
- Crisp borders and subtle shadows for depth
- Single accent color for strategic emphasis
- Mobile-first responsive architecture

## Color System

**Light Mode** (primary):
- Background: #FFFFFF
- Surface: #F9FAFB (subtle gray for cards)
- Border: #E5E7EB
- Text Primary: #111827
- Text Secondary: #6B7280
- Accent: #3B82F6 (blue for CTAs and active states)
- Success: #10B981
- Subtle Surface: #F3F4F6 (input backgrounds)

**Dark Mode**:
- Background: #0F172A
- Surface: #1E293B
- Border: #334155
- Text Primary: #F8FAFC
- Text Secondary: #94A3B8
- Accent: #60A5FA (lighter blue)

**Card Specification**:
- Border: 1px solid border color
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Background: surface color
- Radius: rounded-lg (8px)

## Typography
**Fonts**: Inter (all text) via Google Fonts CDN

**Hierarchy**:
- Page Titles: text-2xl font-semibold
- Section Headers: text-lg font-semibold
- Exercise Names: text-base font-medium
- Stats/Numbers: text-5xl font-bold tracking-tight
- Body: text-base
- Labels: text-sm font-medium text-secondary
- Micro: text-xs text-secondary

## Layout System
**Spacing**: Tailwind units 4, 6, 8, 12, 16
- Card padding: p-6
- Section gaps: gap-6
- Bottom nav height: h-16
- Touch targets: min-h-12
- Screen padding: px-4 md:px-6

**Breakpoints**:
- Mobile: base - single column, full-width cards
- Tablet: md (768px+) - 2-column grids
- Desktop: lg (1024px+) - max-w-6xl container, 3-column grids

## Component Library

### Bottom Navigation
Clean white bar (dark: #1E293B) with 1px top border. 5 icon-label pairs with accent color for active state. Icons use 24px size, labels text-xs. Active state adds accent color with 2px top border indicator.

### Exercise Library
Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-4). Simple cards with:
- Exercise image (16:9 aspect ratio) with rounded-t-lg corners
- White content area with p-4
- Exercise name (font-medium)
- Muscle group pill (small border chip, text-sm)
- Add button (text-accent, right-aligned)

### Workout Logger
Clean header with workout name (text-xl font-semibold), timer (text-accent), and end button. Exercise cards with simple expansion. 

**Set Table**: Clean table rows with Set/Previous/Weight/Reps/Complete columns. Completed sets show success checkmark and subtle green left border (3px). Input fields use subtle gray backgrounds with clean borders, accent color on focus.

**Rest Timer**: Simple centered modal with large countdown number (text-6xl font-bold), circular progress indicator (stroke-accent), and two action buttons below. Clean dismiss background.

### Progress Dashboard
4-stat grid (2x2, stacked mobile). Each stat card shows large number (text-4xl font-bold), label below (text-sm text-secondary), and subtle icon. Line charts use simple paths with accent stroke. Time range selector as simple segmented control with border styling.

### Routine Management
Large cards with routine name (text-lg font-semibold), exercise count and duration (text-sm text-secondary), last performed date. Icon buttons (Edit/Delete/Start) aligned right. Start button uses accent background. Simple reorder handles appear in edit mode.

### Forms & Inputs
Text inputs: subtle gray background (#F3F4F6 light, #1E293B dark), 1px border, rounded-md. Focus adds accent border. Number inputs show large centered value with +/- buttons on sides. Unit toggle (lbs/kg) as simple segmented button group.

### Exercise Detail
Full-screen view with exercise image at top (aspect-video), content below with generous padding (p-6). Instructions in clean paragraphs (space-y-4), muscle groups as bordered chips, equipment list with checkmarks.

## Images

**Exercise Library**: Each exercise requires a demonstration image. Use clean, well-lit photos showing proper form. 16:9 ratio, positioned at card top with rounded-t-lg corners.

**Exercise Detail View**: Large demonstration image (aspect-video) at page top, full-width with rounded-lg corners on desktop (max-w-2xl).

**Progress Photos**: Body tracking images in simple bordered frames (aspect-square), displayed in chronological grid. Date stamps overlay bottom in small text with subtle background.

**No Hero Image**: App launches directly into bottom navigation interface - productivity-focused.

## Accessibility
- Contrast: 7:1 minimum maintained across all text
- Touch targets: 48x48px minimum
- Focus indicators: 2px accent ring with 2px offset
- Clear visual hierarchy through size and weight, not color alone
- All interactive elements have visible focus states