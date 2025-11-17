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
- 100+ exercises organized by muscle group (chest, back, legs, shoulders, arms, core)
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

## API Endpoints (To be implemented in Task 2)
- `GET /api/exercises` - Fetch all exercises
- `POST /api/exercises` - Create new exercise
- `GET /api/workout-routines` - Fetch all workout routines
- `POST /api/workout-routines` - Create workout routine
- `GET /api/workout-logs` - Fetch workout history
- `POST /api/workout-logs` - Log completed workout
- `GET /api/body-stats` - Fetch body measurements
- `POST /api/body-stats` - Add body stats entry

## Recent Changes
- Nov 17, 2025: Initial project setup with complete frontend implementation
- Configured Roboto fonts and blue accent color scheme
- Built all 5 main pages with bottom navigation
- Created workout routine builder and active workout tracker
- Implemented progress charts with Recharts
- Added body stats tracking with visualizations
