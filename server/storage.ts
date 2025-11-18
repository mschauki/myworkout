import { 
  exercises,
  workoutRoutines,
  workoutLogs,
  progressRecords,
  bodyStats,
  type Exercise, 
  type InsertExercise,
  type WorkoutRoutine,
  type InsertWorkoutRoutine,
  type WorkoutLog,
  type InsertWorkoutLog,
  type ProgressRecord,
  type InsertProgressRecord,
  type BodyStats,
  type InsertBodyStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Exercises
  getAllExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
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
  
  // Progress Records
  getAllProgressRecords(): Promise<ProgressRecord[]>;
  getProgressRecordsByExercise(exerciseId: string): Promise<ProgressRecord[]>;
  createProgressRecord(record: InsertProgressRecord): Promise<ProgressRecord>;
  
  // Body Stats
  getAllBodyStats(): Promise<BodyStats[]>;
  getBodyStats(id: string): Promise<BodyStats | undefined>;
  createBodyStats(stats: InsertBodyStats): Promise<BodyStats>;
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
      .values(insertExercise)
      .returning();
    return exercise;
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
}

export const storage = new DatabaseStorage();
