# Jefit Clone - Workout Tracking Application

## Overview
A comprehensive fitness tracking application inspired by Jefit, featuring exercise library, workout routine builder, active workout logging, progress tracking, and body stats monitoring.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: Wouter (frontend), Express (backend)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation

## Project Structure

### Frontend (`client/src/`)
- **Pages**:
  - `home.tsx` - Dashboard with workout stats and recent activity
  - `exercises.tsx` - Exercise library with search and muscle group filtering
  - `workouts.tsx` - Workout routines management
  - `progress.tsx` - Progress charts and analytics
  - `profile.tsx` - Body stats tracking with weight/body fat charts

- **Components**:
  - `BottomNav.tsx` - Bottom navigation bar (5 tabs)
  - `WorkoutRoutineBuilder.tsx` - Create custom workout routines
  - `ActiveWorkout.tsx` - Live workout session tracker with rest timer

### Backend (`server/`)
- `routes.ts` - API endpoints for all features
- `storage.ts` - Database storage interface using Drizzle ORM
- `db.ts` - PostgreSQL database connection
- `seed.ts` - Idempotent database seeding script

### Shared (`shared/`)
- `schema.ts` - Data models and Zod schemas for:
  - Exercises (name, muscle group, equipment)
  - Workout Routines (templates with exercises)
  - Workout Logs (completed sessions)
  - Progress Records (exercise performance)
  - Body Stats (weight, body fat, measurements)

## Features Implemented

### Exercise Library
- **110 exercises** organized by muscle group with proper distribution:
  - Chest: 15 exercises
  - Back: 20 exercises
  - Legs: 22 exercises
  - Shoulders: 18 exercises
  - Arms: 20 exercises
  - Core: 15 exercises
- Search functionality with real-time filtering
- Muscle group filter badges
- Equipment type badges
- Exercise descriptions for all exercises

### Workout Routines
- Create custom workout routines
- Add exercises with sets/reps configuration
- **Day-specific scheduling**: Assign exercises to specific weekdays or "Any Day"
- **Custom rest periods**: Configure rest time (30-300 seconds) per exercise
- Save and manage multiple routines
- **3-Level Navigation Flow**: 
  - Tap routine → View days of week with exercise counts
  - Tap day → View exercises assigned to that day
  - Tap "Start Workout" → Begin active workout session
- **"Any Day" option**: Shown at the end of weekday list for exercises that can be done any day
- **Delete routines**: Delete button with confirmation dialog on routine details page

### Active Workout Tracking
- Real-time workout session tracker
- Set-by-set logging with weight and reps
- **Custom rest timer**: Uses configured rest period per exercise (not fixed 90s)
- **Editable rest timer**: Adjust rest period on-the-fly during active workout
- Pause/skip rest timer controls
- Progress tracking (completed sets vs total sets)
- Elapsed time counter
- **Per-exercise rest persistence**: Rest edits apply only to current exercise's subsequent sets

### Progress Dashboard
- **Overview Tab**:
  - Workout statistics (total workouts, volume lifted)
  - Volume progression chart with time range filters
  - Calendar heatmap placeholder
- **Exercises Tab**:
  - **Personal Records (PR) Tracking**:
    - Best Weight: Maximum weight lifted for each exercise
    - Best Reps: Maximum reps completed for each exercise
    - Best Volume: Volume (weight × reps) from the set with heaviest weight
    - Date stamps showing when each PR was achieved
  - Weight progression chart (last 10 workouts)
  - Empty state handling for exercises with no data

### Body Stats Tracking
- Record weight and body fat percentage
- Visual progress charts
- Historical data tracking

## Design System
- **Typography**: Inter (primary), JetBrains Mono (stats/numbers)
- **Colors**: Blue and orange gradient theme with Glassmorphism aesthetic
  - Gradients: Blue-to-orange backgrounds and text
  - Primary: Blue (hsl(210, 85%, 45-52%))
  - Accent: Orange (hsl(25, 85%, 22-88%))
- **Theme**: Dark mode support with ThemeProvider and ThemeToggle component
- **Layout**: Mobile-first with responsive breakpoints, frosted glass surfaces
- **Navigation**: Fixed bottom navigation bar with glass styling
- **Components**: Shadcn UI with glassmorphism effects (backdrop-blur, semi-transparent backgrounds)

## API Endpoints
- `GET /api/exercises` - Fetch all exercises
- `POST /api/exercises` - Create new exercise
- `GET /api/workout-routines` - Fetch all workout routines
- `POST /api/workout-routines` - Create workout routine
- `PUT /api/workout-routines/:id` - Update workout routine
- `DELETE /api/workout-routines/:id` - Delete workout routine
- `GET /api/workout-logs` - Fetch workout history
- `GET /api/workout-logs/:id` - Fetch specific workout log
- `POST /api/workout-logs` - Log completed workout (with server-side validation)
- `GET /api/progress-records` - Fetch progress data
- `POST /api/progress-records` - Add progress record
- `GET /api/body-stats` - Fetch body measurements
- `POST /api/body-stats` - Add body stats entry

## Data Validation
- **Client-side**: Weight and reps validated as positive numbers before set completion
- **Server-side**: Workout logs validate completed sets have weight > 0 and reps > 0
- **Volume calculation**: Server recomputes totalVolume from validated completed sets

## Recent Changes

- Nov 19, 2025: **Color Scheme Update & Critical Bug Fixes**
  - ✅ **Color scheme**: Changed from pink/purple to blue/orange gradients
    - Light mode: Blue-to-orange gradient background (hsl(210, 80%, 94%) to hsl(25, 75%, 96%))
    - Dark mode: Deep blue-to-orange gradient (#0f172a to #1e3a5f to #1a1410)
    - Gradient text: Blue-to-orange (used in page titles and CTAs)
    - Primary colors: Blue tones throughout
    - Accent: Orange highlights
  - ✅ **Fixed delete functionality**: Added missing DELETE route for workout routines
    - DELETE endpoint now properly removes routines from database
    - Confirmation dialog works correctly
    - Backend storage function was already implemented, just needed route wiring
  - ✅ **Fixed button visibility**: Updated glass-button styling for better contrast
    - Changed from transparent glass to visible blue primary color
    - Background: Primary color with 90% opacity
    - Text: White for clear contrast
    - Buttons now clearly visible against gradient backgrounds
  - ✅ **Day titles with day names**: Custom titles now show alongside day names
    - Format: "Monday - Arms & abs" instead of just "Arms & abs"
    - Falls back to just day name if no custom title
  - ✅ **All fixes verified with end-to-end testing**

- Nov 18, 2025: **Workflow Routine Flow Redesign & Delete Functionality**
  - ✅ **New 3-level navigation**: Routine card → Day selection → Exercise list → Active workout
  - ✅ **Day-first workflow**: View all days with exercise counts before selecting
  - ✅ **"Any Day" placement**: Shows at end of weekday list for flexible exercises
  - ✅ **Exercise preview**: View all exercises for a day before starting workout
  - ✅ **Delete functionality**: Delete button with confirmation dialog on routine details
  - ✅ **Proper state management**: Clean navigation between all levels with back buttons
  - ✅ **Glassmorphism consistency**: All new views use glass surfaces and gradient styling
  - ✅ **End-to-end tested**: Complete workflow from routine selection to workout start verified
  - Navigation: Routines list → (tap) → Days view → (tap day) → Exercises view → (tap Start) → Active workout

- Nov 18, 2025: **Complete Glassmorphism UI Redesign**
  - ✅ **Full design system migration** from Material Design to Glassmorphism aesthetic
  - ✅ **CSS design tokens** in index.css: glass surfaces, borders, shadows, and gradient backgrounds
  - ✅ **Tailwind utility classes**: .glass-surface, .glass-surface-elevated, .glass-button, .glass-input, .gradient-text
  - ✅ **Vibrant gradient backgrounds**: Pink-to-lavender for light mode, purple-to-blue for dark mode
  - ✅ **Component updates**: Card, Dialog, BottomNav all use frosted glass with backdrop-blur-xl
  - ✅ **All pages redesigned**: Home, Exercises, Workouts, Progress, Profile with gradient titles and glass cards
  - ✅ **Bottom navigation**: Glass elevated surface with gradient active tab indicator
  - ✅ **Accessibility fix**: Removed nested button-in-link for proper semantic structure
  - ✅ **Theme support**: Seamless light/dark mode transitions with proper contrast
  - ✅ **Hover effects**: Subtle scale transforms and glass elevation on cards
  - ✅ **End-to-end tested**: All glassmorphism effects verified in both light and dark modes
  - Design features: Semi-transparent backgrounds (rgba 0.08-0.15), backdrop blur, gradient text, layered glass surfaces

- Nov 18, 2025: **Custom Exercise Creation & Per-Set Rest Periods**
  - ✅ **Custom exercise creation**: Dialog-based UI for creating custom exercises with name, muscle group, equipment, and description
  - ✅ **Per-set rest period configuration**: Configure individual rest periods (30-300 seconds) for each set in a routine
  - ✅ **Per-set mode toggle**: Switch between simple mode (uniform sets) and per-set mode (individual reps/rest per set)
  - ✅ **Rest timer scoping**: During active workout, editing rest timer updates ONLY the current set (preserves per-set customization)
  - ✅ **Workout log normalization**: Backend ensures all sets have numeric restPeriod (falls back to exercise default, then 90s)
  - ✅ **defaultRestPeriod field**: Workout logs include exercise-level default for proper normalization
  - ✅ **Full data persistence**: Per-set rest periods correctly saved and retrieved from PostgreSQL JSONB columns
  - ✅ **Zod validation**: Form validation for exercise creation with client-side feedback
  - ✅ **Cache invalidation**: TanStack Query properly updates UI after mutations
  - ✅ All features verified with comprehensive end-to-end testing

- Nov 18, 2025: **Day-Specific Exercises & Editable Rest Periods**
  - ✅ **Day-specific exercise scheduling**: Assign exercises to specific weekdays (Monday-Sunday) or "Any Day"
  - ✅ **Day selection dialog**: Automatically shown when starting routines with day-specific exercises
  - ✅ **Custom rest periods per exercise**: Configure 30-300 second rest periods in routine builder
  - ✅ **Editable rest timer**: Adjust rest period during active workout with real-time updates
  - ✅ **Smart rest persistence**: Rest edits apply only to current exercise's remaining sets
  - ✅ **Backward compatibility**: Legacy routines without days/restPeriod fields work seamlessly
  - ✅ **Empty exercise validation**: Prevents starting workout if selected day has no exercises
  - ✅ **Checkbox UI improvements**: Fixed "Any Day" toggle to properly enable individual day selection
  - ✅ All features verified with comprehensive end-to-end testing

- Nov 18, 2025: **Database Migration & Feature Expansion**
  - ✅ Migrated from in-memory storage to PostgreSQL with Drizzle ORM
  - ✅ Created idempotent seed script (deletes existing + inserts) for reliable database reseeding
  - ✅ Expanded exercise library from 35 to **110 exercises** across all muscle groups
  - ✅ Implemented dark theme support with ThemeProvider and localStorage persistence
  - ✅ Added ThemeToggle component in Profile page with smooth icon transitions
  - ✅ **Personal Records (PR) tracking** in Progress > Exercises tab:
    - Calculate and display best weight, reps, and volume for each exercise
    - Show dates when PRs were achieved
    - Weight progression chart aggregated by workout (last 10 workouts)
  - ✅ All features verified with end-to-end testing

- Nov 17, 2025: **MVP Complete and Tested**
  - ✅ Complete data schema with Zod validation
  - ✅ All frontend components built with Roboto fonts and blue accent theme
  - ✅ Backend API with full CRUD operations and in-memory storage
  - ✅ 35+ exercises seeded across all muscle groups
  - ✅ TanStack Query integration for data fetching
  - ✅ Comprehensive input validation (client + server)
  - ✅ End-to-end testing passed: routine creation → workout logging → progress tracking
  - ✅ Active workout tracker with set completion and rest timer
  - ✅ Progress dashboard with charts and statistics
