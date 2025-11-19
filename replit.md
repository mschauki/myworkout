# Jefit Clone - Workout Tracking Application

## Overview
A comprehensive fitness tracking application inspired by Jefit. The project aims to provide users with tools for managing their fitness journey, including an extensive exercise library, a flexible workout routine builder, real-time active workout logging, detailed progress tracking, and body statistics monitoring. The business vision is to deliver a user-friendly and robust platform that empowers individuals to achieve their fitness goals.

## User Preferences
I prefer detailed explanations and iterative development. Please ask before making major changes. Do not make changes to the folder `Z` and do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The application features a mobile-first design with responsive breakpoints. It employs a modern Glassmorphism aesthetic, characterized by frosted glass surfaces, semi-transparent backgrounds, and backdrop-blur effects. The color scheme utilizes blue and orange gradients, providing a vibrant yet clean interface. Typography is primarily Inter, with JetBrains Mono used for statistical and numerical displays. Dark mode is supported with a `ThemeProvider` and `ThemeToggle` component, ensuring consistent visual appeal across themes. Navigation is handled by a fixed bottom navigation bar with glass styling.

### Technical Implementations
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Recharts for data visualization, Wouter for routing, TanStack Query for state management, and React Hook Form with Zod for form validation.
- **Backend**: Express.js and Node.js for API services.
- **Database**: PostgreSQL, managed with Drizzle ORM.
- **Data Models**: Shared Zod schemas define data structures for exercises, workout routines, logs, progress records, and body stats, ensuring consistency between frontend and backend.

### Feature Specifications
-   **Exercise Library**: Contains 110 exercises categorized by muscle group, with search, filtering, equipment badges, and descriptions. Includes support for displaying exercise images and falls back to a dumbbell icon if no image URL is present. Users can create custom exercises from the exercise library page or directly during routine building.
-   **Custom Exercise Creation**: Users can create custom exercises with name, muscle group, equipment type, and optional description. Available both from the exercise library and inline during routine building via a "Custom" button. Features explicit validation for required fields, optimistic cache updates for immediate availability, and auto-selection after creation. Includes safeguards against duplicate submissions and displays exercise names correctly without "Unknown" placeholders.
-   **Workout Routines**: Allows users to create custom routines using a day-by-day builder workflow with tabs for each day (Monday-Sunday + "Any Day"). Users can assign exercises to specific days, configure sets, reps, and individual rest periods (30-300 seconds) per set. Custom day titles are supported. Routines can be deleted with a confirmation dialog.
-   **Active Workout Tracking**: Provides a real-time tracker for workout sessions, logging sets with weight and reps. Features a custom and editable rest timer with persistent save option: users can edit rest periods during countdown, and when finished editing (blur or Enter key), a dialog appears asking whether to save the change permanently to the routine or apply it only for the current session. The system deep-clones routine data to preserve all exercise metadata when saving, and provides clear feedback when attempting to save rest periods for dynamically added sets (which are session-specific). Displays an estimated 1RM (One-Rep Max) dynamically during workouts using the Epley formula. Uses smart auto-expansion: the first exercise is expanded by default when starting a workout, and each subsequent exercise automatically expands when the last set of the previous exercise is completed, creating a smooth, focused workout flow. Supports dynamic set addition during workouts via "+ Add Set" button.
-   **Progress Dashboard**: Offers an overview of workout statistics (total workouts, volume lifted) and volume progression charts. Includes an "Exercises" tab for tracking Personal Records (PRs) such as best weight, reps, and volume, along with the dates achieved. Displays weight progression charts for the last 10 workouts.
-   **Body Stats Tracking**: Enables recording and visualizing weight and body fat percentage over time with historical data.

### System Design Choices
-   **Modular Project Structure**: Separates frontend (`client/`), backend (`server/`), and shared schemas (`shared/`) for clear organization.
-   **API Endpoints**: Comprehensive RESTful API for all major features (exercises, workout routines, logs, progress, body stats).
-   **Data Validation**: Implements both client-side and server-side validation (e.g., positive numbers for weight/reps, server-side recomputation of total volume) to ensure data integrity.
-   **Idempotent Seeding**: A database seed script ensures a consistent initial state for development and testing.

## External Dependencies
-   **PostgreSQL**: Primary database for data persistence.
-   **Shadcn UI**: UI component library for consistent design.
-   **Recharts**: Library for rendering charts and graphs in the progress dashboard.
-   **TanStack Query**: For server state management and caching.
-   **Wouter**: Client-side routing.
-   **React Hook Form with Zod**: For form management and validation.