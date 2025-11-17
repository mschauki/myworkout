import { 
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
import { randomUUID } from "crypto";

export interface IStorage {
  // Exercises
  getAllExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  
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

export class MemStorage implements IStorage {
  private exercises: Map<string, Exercise>;
  private workoutRoutines: Map<string, WorkoutRoutine>;
  private workoutLogs: Map<string, WorkoutLog>;
  private progressRecords: Map<string, ProgressRecord>;
  private bodyStats: Map<string, BodyStats>;

  constructor() {
    this.exercises = new Map();
    this.workoutRoutines = new Map();
    this.workoutLogs = new Map();
    this.progressRecords = new Map();
    this.bodyStats = new Map();
    
    // Seed initial exercises
    this.seedExercises();
  }

  private seedExercises() {
    const exercises: Omit<Exercise, 'id'>[] = [
      // Chest
      { name: "Barbell Bench Press", description: "Lie on a bench and press the barbell up from chest level", muscleGroup: "chest", equipment: "barbell", imageUrl: null },
      { name: "Dumbbell Bench Press", description: "Press dumbbells up from chest level while lying on a bench", muscleGroup: "chest", equipment: "dumbbell", imageUrl: null },
      { name: "Incline Bench Press", description: "Press barbell on an inclined bench to target upper chest", muscleGroup: "chest", equipment: "barbell", imageUrl: null },
      { name: "Cable Flyes", description: "Perform chest flyes using cable machine for constant tension", muscleGroup: "chest", equipment: "cable", imageUrl: null },
      { name: "Push-ups", description: "Classic bodyweight exercise for chest, shoulders, and triceps", muscleGroup: "chest", equipment: "bodyweight", imageUrl: null },
      
      // Back
      { name: "Barbell Row", description: "Row a barbell to your chest while bent over", muscleGroup: "back", equipment: "barbell", imageUrl: null },
      { name: "Pull-ups", description: "Pull your body up until chin is over the bar", muscleGroup: "back", equipment: "bodyweight", imageUrl: null },
      { name: "Lat Pulldown", description: "Pull cable bar down to chest level", muscleGroup: "back", equipment: "machine", imageUrl: null },
      { name: "Dumbbell Row", description: "Row dumbbell to hip while supporting body on bench", muscleGroup: "back", equipment: "dumbbell", imageUrl: null },
      { name: "Deadlift", description: "Lift barbell from ground to standing position", muscleGroup: "back", equipment: "barbell", imageUrl: null },
      { name: "Seated Cable Row", description: "Pull cable handle to torso while seated", muscleGroup: "back", equipment: "cable", imageUrl: null },
      
      // Legs
      { name: "Barbell Squat", description: "Squat with barbell on upper back", muscleGroup: "legs", equipment: "barbell", imageUrl: null },
      { name: "Leg Press", description: "Press weight away using leg press machine", muscleGroup: "legs", equipment: "machine", imageUrl: null },
      { name: "Romanian Deadlift", description: "Hinge at hips while lowering barbell to shins", muscleGroup: "legs", equipment: "barbell", imageUrl: null },
      { name: "Leg Curl", description: "Curl legs up against resistance on machine", muscleGroup: "legs", equipment: "machine", imageUrl: null },
      { name: "Leg Extension", description: "Extend legs against resistance on machine", muscleGroup: "legs", equipment: "machine", imageUrl: null },
      { name: "Lunges", description: "Step forward and lower body until both knees are bent", muscleGroup: "legs", equipment: "bodyweight", imageUrl: null },
      { name: "Calf Raise", description: "Raise heels to stand on toes", muscleGroup: "legs", equipment: "machine", imageUrl: null },
      
      // Shoulders
      { name: "Overhead Press", description: "Press barbell overhead from shoulder level", muscleGroup: "shoulders", equipment: "barbell", imageUrl: null },
      { name: "Dumbbell Shoulder Press", description: "Press dumbbells overhead from shoulder level", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
      { name: "Lateral Raise", description: "Raise dumbbells to sides until arms are parallel to floor", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
      { name: "Front Raise", description: "Raise dumbbells to front until arms are parallel to floor", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
      { name: "Face Pull", description: "Pull cable to face level with rope attachment", muscleGroup: "shoulders", equipment: "cable", imageUrl: null },
      
      // Arms
      { name: "Barbell Curl", description: "Curl barbell up to shoulders", muscleGroup: "arms", equipment: "barbell", imageUrl: null },
      { name: "Dumbbell Curl", description: "Curl dumbbells up to shoulders", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
      { name: "Hammer Curl", description: "Curl dumbbells with neutral grip", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
      { name: "Tricep Pushdown", description: "Push cable bar down using triceps", muscleGroup: "arms", equipment: "cable", imageUrl: null },
      { name: "Skull Crusher", description: "Lower barbell to forehead while lying on bench", muscleGroup: "arms", equipment: "barbell", imageUrl: null },
      { name: "Dips", description: "Lower body between parallel bars and push back up", muscleGroup: "arms", equipment: "bodyweight", imageUrl: null },
      
      // Core
      { name: "Plank", description: "Hold body in straight line supported on forearms and toes", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
      { name: "Crunches", description: "Curl upper body towards knees while lying on back", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
      { name: "Russian Twist", description: "Rotate torso side to side while seated", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
      { name: "Hanging Leg Raise", description: "Raise legs while hanging from bar", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
      { name: "Cable Crunch", description: "Crunch down using cable resistance", muscleGroup: "core", equipment: "cable", imageUrl: null },
    ];

    exercises.forEach(ex => {
      const id = randomUUID();
      this.exercises.set(id, { ...ex, id });
    });
  }

  // Exercises
  async getAllExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = { ...insertExercise, id };
    this.exercises.set(id, exercise);
    return exercise;
  }

  // Workout Routines
  async getAllWorkoutRoutines(): Promise<WorkoutRoutine[]> {
    return Array.from(this.workoutRoutines.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getWorkoutRoutine(id: string): Promise<WorkoutRoutine | undefined> {
    return this.workoutRoutines.get(id);
  }

  async createWorkoutRoutine(insertRoutine: InsertWorkoutRoutine): Promise<WorkoutRoutine> {
    const id = randomUUID();
    const routine: WorkoutRoutine = {
      ...insertRoutine,
      id,
      createdAt: new Date().toISOString(),
    };
    this.workoutRoutines.set(id, routine);
    return routine;
  }

  // Workout Logs
  async getAllWorkoutLogs(): Promise<WorkoutLog[]> {
    return Array.from(this.workoutLogs.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getWorkoutLog(id: string): Promise<WorkoutLog | undefined> {
    return this.workoutLogs.get(id);
  }

  async createWorkoutLog(insertLog: InsertWorkoutLog): Promise<WorkoutLog> {
    const id = randomUUID();
    const log: WorkoutLog = { 
      ...insertLog, 
      id,
      date: insertLog.date || new Date().toISOString(),
    };
    this.workoutLogs.set(id, log);
    return log;
  }

  // Progress Records
  async getAllProgressRecords(): Promise<ProgressRecord[]> {
    return Array.from(this.progressRecords.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getProgressRecordsByExercise(exerciseId: string): Promise<ProgressRecord[]> {
    return Array.from(this.progressRecords.values())
      .filter(record => record.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createProgressRecord(insertRecord: InsertProgressRecord): Promise<ProgressRecord> {
    const id = randomUUID();
    const record: ProgressRecord = { 
      ...insertRecord, 
      id,
      date: insertRecord.date || new Date().toISOString(),
    };
    this.progressRecords.set(id, record);
    return record;
  }

  // Body Stats
  async getAllBodyStats(): Promise<BodyStats[]> {
    return Array.from(this.bodyStats.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getBodyStats(id: string): Promise<BodyStats | undefined> {
    return this.bodyStats.get(id);
  }

  async createBodyStats(insertStats: InsertBodyStats): Promise<BodyStats> {
    const id = randomUUID();
    const stats: BodyStats = { 
      ...insertStats, 
      id,
      date: insertStats.date || new Date().toISOString(),
    };
    this.bodyStats.set(id, stats);
    return stats;
  }
}

export const storage = new MemStorage();
