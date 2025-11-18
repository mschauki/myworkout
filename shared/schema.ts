import { pgTable, varchar, text, jsonb, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Exercise table
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  muscleGroup: varchar("muscle_group", { length: 100 }).notNull(),
  equipment: varchar("equipment", { length: 100 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true });
export const selectExerciseSchema = createSelectSchema(exercises);
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

// Workout Routine table
export const workoutRoutines = pgTable("workout_routines", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  exercises: jsonb("exercises").notNull().$type<Array<{
    exerciseId: string;
    sets: number; // Legacy: total number of sets (used if setsConfig not present)
    reps: number; // Legacy: reps per set (used if setsConfig not present)
    days: string[]; // Array of day names: ["monday", "wednesday"] or ["any"] for any day
    restPeriod?: number; // Legacy: rest period in seconds (used if setsConfig not present, defaults to 90)
    setsConfig?: Array<{  // New: individual configuration per set (overrides sets/reps/restPeriod if present)
      reps: number;
      restPeriod: number; // Rest period in seconds for this specific set
    }>;
  }>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWorkoutRoutineSchema = createInsertSchema(workoutRoutines).omit({
  id: true,
  createdAt: true,
});
export const selectWorkoutRoutineSchema = createSelectSchema(workoutRoutines);
export type WorkoutRoutine = typeof workoutRoutines.$inferSelect;
export type InsertWorkoutRoutine = z.infer<typeof insertWorkoutRoutineSchema>;

// Workout Log table
export const workoutLogs = pgTable("workout_logs", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  routineName: varchar("routine_name", { length: 255 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  duration: integer("duration").notNull(),
  exercises: jsonb("exercises").notNull().$type<Array<{
    exerciseId: string;
    exerciseName: string;
    defaultRestPeriod?: number; // Default rest period from routine (used for normalization)
    sets: Array<{
      weight: number;
      reps: number;
      completed: boolean;
      restPeriod?: number; // Optional: rest period in seconds for this set (from per-set configuration)
    }>;
  }>>(),
  totalVolume: doublePrecision("total_volume").notNull(),
});

export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({
  id: true,
}).extend({
  date: z.string().optional(),
});
export const selectWorkoutLogSchema = createSelectSchema(workoutLogs);
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;

// Progress Record table
export const progressRecords = pgTable("progress_records", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  exerciseId: varchar("exercise_id", { length: 255 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  weight: doublePrecision("weight").notNull(),
  reps: integer("reps").notNull(),
  volume: doublePrecision("volume").notNull(),
});

export const insertProgressRecordSchema = createInsertSchema(progressRecords).omit({
  id: true,
}).extend({
  date: z.string().optional(),
});
export const selectProgressRecordSchema = createSelectSchema(progressRecords);
export type ProgressRecord = typeof progressRecords.$inferSelect;
export type InsertProgressRecord = z.infer<typeof insertProgressRecordSchema>;

// Body Stats table
export const bodyStats = pgTable("body_stats", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: timestamp("date").notNull().defaultNow(),
  weight: doublePrecision("weight"),
  bodyFat: doublePrecision("body_fat"),
  measurements: jsonb("measurements").$type<{
    chest?: number;
    waist?: number;
    arms?: number;
    legs?: number;
  }>(),
});

export const insertBodyStatsSchema = createInsertSchema(bodyStats).omit({
  id: true,
}).extend({
  date: z.string().optional(),
});
export const selectBodyStatsSchema = createSelectSchema(bodyStats);
export type BodyStats = typeof bodyStats.$inferSelect;
export type InsertBodyStats = z.infer<typeof insertBodyStatsSchema>;
