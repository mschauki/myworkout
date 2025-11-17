import { z } from "zod";

// Exercise schemas
export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  muscleGroup: z.string(),
  equipment: z.string(),
  imageUrl: z.string().nullable(),
});

export const insertExerciseSchema = exerciseSchema.omit({ id: true });

export type Exercise = z.infer<typeof exerciseSchema>;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

// Workout Routine schemas
export const workoutRoutineSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    sets: z.number().int().positive(),
    reps: z.number().int().positive(),
  })),
  createdAt: z.string(),
});

export const insertWorkoutRoutineSchema = workoutRoutineSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type WorkoutRoutine = z.infer<typeof workoutRoutineSchema>;
export type InsertWorkoutRoutine = z.infer<typeof insertWorkoutRoutineSchema>;

// Workout Log schemas
export const workoutLogSchema = z.object({
  id: z.string(),
  routineName: z.string(),
  date: z.string(),
  duration: z.number().int(),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    exerciseName: z.string(),
    sets: z.array(z.object({
      weight: z.number(),
      reps: z.number().int(),
      completed: z.boolean(),
    })),
  })),
  totalVolume: z.number(),
});

export const insertWorkoutLogSchema = workoutLogSchema.omit({ id: true }).extend({
  date: z.string().optional(),
});

export type WorkoutLog = z.infer<typeof workoutLogSchema>;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;

// Progress Record schemas
export const progressRecordSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  date: z.string(),
  weight: z.number(),
  reps: z.number().int(),
  volume: z.number(),
});

export const insertProgressRecordSchema = progressRecordSchema.omit({ id: true }).extend({
  date: z.string().optional(),
});

export type ProgressRecord = z.infer<typeof progressRecordSchema>;
export type InsertProgressRecord = z.infer<typeof insertProgressRecordSchema>;

// Body Stats schemas
export const bodyStatsSchema = z.object({
  id: z.string(),
  date: z.string(),
  weight: z.number().nullable(),
  bodyFat: z.number().nullable(),
  measurements: z.object({
    chest: z.number().optional(),
    waist: z.number().optional(),
    arms: z.number().optional(),
    legs: z.number().optional(),
  }).optional(),
});

export const insertBodyStatsSchema = bodyStatsSchema.omit({ id: true }).extend({
  date: z.string().optional(),
});

export type BodyStats = z.infer<typeof bodyStatsSchema>;
export type InsertBodyStats = z.infer<typeof insertBodyStatsSchema>;
