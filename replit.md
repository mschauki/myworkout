# Jefit Clone - Workout Tracking Application

## Overview
A comprehensive fitness tracking application inspired by Jefit, featuring exercise library, workout routine builder, active workout logging, progress tracking, and body stats monitoring.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: Express.js, Node.js
- **Storage**: In-memory storage (MemStorage)
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
- `storage.ts` - In-memory data storage interface

### Shared (`shared/`)
- `schema.ts` - Data models and Zod schemas for:
  - Exercises (name, muscle group, equipment)
  - Workout Routines (templates with exercises)
  - Workout Logs (completed sessions)
  - Progress Records (exercise performance)
  - Body Stats (weight, body fat, measurements)

## Features Implemented

### Exercise Library
- 35+ exercises organized by muscle group (chest, back, legs, shoulders, arms, core)
- Search functionality with real-time filtering
- Muscle group filter badges
- Equipment type badges

### Workout Routines
- Create custom workout routines
- Add exercises with sets/reps configuration
- Save and manage multiple routines
- Start workout sessions from routines

### Active Workout Tracking
- Real-time workout session tracker
- Set-by-set logging with weight and reps
- Automatic rest timer (90 seconds) after completing sets
- Pause/skip rest timer controls
- Progress tracking (completed sets vs total sets)
- Elapsed time counter

### Progress Dashboard
- Workout statistics (total workouts, volume lifted)
- Volume progression chart with time range filters
- Exercise-specific progress tracking
- Body stats integration

### Body Stats Tracking
- Record weight and body fat percentage
- Visual progress charts
- Historical data tracking

## Design System
- **Typography**: Roboto (primary), Roboto Mono (stats/numbers)
- **Colors**: Blue accent theme (Material Design inspired)
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
