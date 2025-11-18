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
- Start workout sessions from routines
- **Day selection dialog**: Choose training day for routines with day-specific exercises

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
- **Typography**: Roboto (primary), Roboto Mono (stats/numbers)
- **Colors**: Blue accent theme (Material Design inspired)
- **Theme**: Dark mode support with ThemeProvider and ThemeToggle component
- **Layout**: Mobile-first with responsive breakpoints
- **Navigation**: Fixed bottom navigation bar
- **Components**: Shadcn UI with consistent spacing and elevation

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
