import { 
  exercises,
  workoutRoutines,
  workoutLogs,
  progressRecords,
  bodyStats,
  settings,
  type Exercise, 
  type InsertExercise,
  type WorkoutRoutine,
  type InsertWorkoutRoutine,
  type WorkoutLog,
  type InsertWorkoutLog,
  type ProgressRecord,
  type InsertProgressRecord,
  type BodyStats,
  type InsertBodyStats,
  type Settings,
  type InsertSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Exercises
  getAllExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: string, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  deleteExercise(id: string): Promise<boolean>;
  updateWorkoutRoutine(id: string, routine: Partial<InsertWorkoutRoutine>): Promise<WorkoutRoutine | undefined>;
  deleteWorkoutRoutine(id: string): Promise<boolean>;
  
  // Workout Routines
  getAllWorkoutRoutines(): Promise<WorkoutRoutine[]>;
  getWorkoutRoutine(id: string): Promise<WorkoutRoutine | undefined>;
  createWorkoutRoutine(routine: InsertWorkoutRoutine): Promise<WorkoutRoutine>;
  
  // Workout Logs
  getAllWorkoutLogs(): Promise<WorkoutLog[]>;
  getWorkoutLog(id: string): Promise<WorkoutLog | undefined>;
  createWorkoutLog(log: InsertWorkoutLog): Promise<WorkoutLog>;
  deleteWorkoutLog(id: string): Promise<boolean>;
  
  // Progress Records
  getAllProgressRecords(): Promise<ProgressRecord[]>;
  getProgressRecordsByExercise(exerciseId: string): Promise<ProgressRecord[]>;
  createProgressRecord(record: InsertProgressRecord): Promise<ProgressRecord>;
  
  // Body Stats
  getAllBodyStats(): Promise<BodyStats[]>;
  getBodyStats(id: string): Promise<BodyStats | undefined>;
  createBodyStats(stats: InsertBodyStats): Promise<BodyStats>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(data: Partial<InsertSettings>): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  // Exercises
  async getAllExercises(): Promise<Exercise[]> {
    return db.select().from(exercises).orderBy(exercises.name);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise || undefined;
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const [exercise] = await db
      .insert(exercises)
      .values({ ...insertExercise, isCustom: true })
      .returning();
    return exercise;
  }

  async updateExercise(id: string, updateData: Partial<InsertExercise>): Promise<Exercise | undefined> {
    // Drizzle omits undefined values but should keep null values
    // Explicitly set null for imageUrl if it's present in updateData
    const dataToSet: any = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        dataToSet[key] = value;
      }
    }
    
    const [exercise] = await db
      .update(exercises)
      .set(dataToSet)
      .where(eq(exercises.id, id))
      .returning();
    return exercise || undefined;
  }

  async deleteExercise(id: string): Promise<boolean> {
    const result = await db
      .delete(exercises)
      .where(eq(exercises.id, id))
      .returning();
    return result.length > 0;
  }

  // Workout Routines
  async getAllWorkoutRoutines(): Promise<WorkoutRoutine[]> {
    return db.select().from(workoutRoutines).orderBy(desc(workoutRoutines.createdAt));
  }

  async getWorkoutRoutine(id: string): Promise<WorkoutRoutine | undefined> {
    const [routine] = await db.select().from(workoutRoutines).where(eq(workoutRoutines.id, id));
    return routine || undefined;
  }

  async createWorkoutRoutine(insertRoutine: InsertWorkoutRoutine): Promise<WorkoutRoutine> {
    const [routine] = await db
      .insert(workoutRoutines)
      .values(insertRoutine)
      .returning();
    return routine;
  }

  async updateWorkoutRoutine(id: string, updateData: Partial<InsertWorkoutRoutine>): Promise<WorkoutRoutine | undefined> {
    const updateValues: any = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.description !== undefined) updateValues.description = updateData.description;
    if (updateData.exercises !== undefined) updateValues.exercises = updateData.exercises;
    if (updateData.dayTitles !== undefined) updateValues.dayTitles = updateData.dayTitles;
    
    const [routine] = await db
      .update(workoutRoutines)
      .set(updateValues)
      .where(eq(workoutRoutines.id, id))
      .returning();
    return routine || undefined;
  }

  async deleteWorkoutRoutine(id: string): Promise<boolean> {
    const result = await db
      .delete(workoutRoutines)
      .where(eq(workoutRoutines.id, id))
      .returning();
    return result.length > 0;
  }

  // Workout Logs
  async getAllWorkoutLogs(): Promise<WorkoutLog[]> {
    return db.select().from(workoutLogs).orderBy(desc(workoutLogs.date));
  }

  async getWorkoutLog(id: string): Promise<WorkoutLog | undefined> {
    const [log] = await db.select().from(workoutLogs).where(eq(workoutLogs.id, id));
    return log || undefined;
  }

  async createWorkoutLog(insertLog: InsertWorkoutLog): Promise<WorkoutLog> {
    const normalizedExercises = insertLog.exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({
        ...set,
        restPeriod: set.restPeriod ?? exercise.defaultRestPeriod ?? 90,
      })),
    }));
    
    const logData = {
      routineName: insertLog.routineName,
      duration: insertLog.duration,
      exercises: normalizedExercises,
      totalVolume: insertLog.totalVolume,
      date: insertLog.date ? new Date(insertLog.date) : undefined,
    };
    const [log] = await db
      .insert(workoutLogs)
      .values(logData)
      .returning();
    return log;
  }

  async deleteWorkoutLog(id: string): Promise<boolean> {
    const result = await db
      .delete(workoutLogs)
      .where(eq(workoutLogs.id, id))
      .returning();
    return result.length > 0;
  }

  // Progress Records
  async getAllProgressRecords(): Promise<ProgressRecord[]> {
    return db.select().from(progressRecords).orderBy(desc(progressRecords.date));
  }

  async getProgressRecordsByExercise(exerciseId: string): Promise<ProgressRecord[]> {
    return db
      .select()
      .from(progressRecords)
      .where(eq(progressRecords.exerciseId, exerciseId))
      .orderBy(desc(progressRecords.date));
  }

  async createProgressRecord(insertRecord: InsertProgressRecord): Promise<ProgressRecord> {
    const [record] = await db
      .insert(progressRecords)
      .values({
        ...insertRecord,
        date: insertRecord.date ? new Date(insertRecord.date) : undefined,
      })
      .returning();
    return record;
  }

  // Body Stats
  async getAllBodyStats(): Promise<BodyStats[]> {
    return db.select().from(bodyStats).orderBy(desc(bodyStats.date));
  }

  async getBodyStats(id: string): Promise<BodyStats | undefined> {
    const [stats] = await db.select().from(bodyStats).where(eq(bodyStats.id, id));
    return stats || undefined;
  }

  async createBodyStats(insertStats: InsertBodyStats): Promise<BodyStats> {
    const [stats] = await db
      .insert(bodyStats)
      .values({
        ...insertStats,
        date: insertStats.date ? new Date(insertStats.date) : undefined,
      })
      .returning();
    return stats;
  }

  // Settings
  async getSettings(): Promise<Settings> {
    const [setting] = await db.select().from(settings);
    if (setting) {
      return setting;
    }
    // Create default settings if none exist
    const [newSetting] = await db
      .insert(settings)
      .values({
        unitSystem: "lbs",
        firstDayOfWeek: 0,
        autoStartTimer: true,
        restTimerSound: true,
        defaultRestDuration: 90,
        workoutHistoryRetentionDays: -1,
      })
      .returning();
    return newSetting;
  }

  async updateSettings(data: Partial<InsertSettings>): Promise<Settings> {
    const updateValues: any = {};
    if (data.unitSystem !== undefined) updateValues.unitSystem = data.unitSystem;
    if (data.firstDayOfWeek !== undefined) updateValues.firstDayOfWeek = data.firstDayOfWeek;
    if (data.autoStartTimer !== undefined) updateValues.autoStartTimer = data.autoStartTimer;
    if (data.restTimerSound !== undefined) updateValues.restTimerSound = data.restTimerSound;
    if (data.defaultRestDuration !== undefined) updateValues.defaultRestDuration = data.defaultRestDuration;
    if (data.workoutHistoryRetentionDays !== undefined) updateValues.workoutHistoryRetentionDays = data.workoutHistoryRetentionDays;
    updateValues.updatedAt = new Date();
    
    const [setting] = await db
      .update(settings)
      .set(updateValues)
      .where(eq(settings.id, (await this.getSettings()).id))
      .returning();
    return setting;
  }
}

export const storage = new DatabaseStorage();
