import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertExerciseSchema,
  insertWorkoutRoutineSchema,
  insertWorkoutLogSchema,
  insertProgressRecordSchema,
  insertBodyStatsSchema,
  type InsertWorkoutRoutine,
  type InsertWorkoutLog
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.getExercise(req.params.id);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exercise" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const validatedData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(validatedData);
      res.status(201).json(exercise);
    } catch (error) {
      res.status(400).json({ error: "Invalid exercise data" });
    }
  });

  app.put("/api/exercises/:id", async (req, res) => {
    try {
      // First, check if the exercise exists and is custom
      const existingExercise = await storage.getExercise(req.params.id);
      if (!existingExercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      if (!existingExercise.isCustom) {
        return res.status(403).json({ error: "Cannot edit seeded exercises" });
      }
      
      const validatedData = insertExerciseSchema.partial().parse(req.body);
      // Strip isCustom from the update to prevent clients from toggling the flag
      const { isCustom, ...updateData } = validatedData as any;
      const exercise = await storage.updateExercise(req.params.id, updateData);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ error: "Invalid exercise data" });
    }
  });

  app.delete("/api/exercises/:id", async (req, res) => {
    try {
      const exerciseId = req.params.id;
      
      // Check if exercise exists
      const exercise = await storage.getExercise(exerciseId);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      
      // Check if exercise is used in any routines
      const routines = await storage.getAllWorkoutRoutines();
      const usedInRoutines = routines.some(routine => 
        routine.exercises.some(ex => ex.exerciseId === exerciseId)
      );
      
      if (usedInRoutines) {
        return res.status(409).json({ 
          error: "Cannot delete exercise that is used in workout routines" 
        });
      }
      
      // Check if exercise is used in any workout logs
      const logs = await storage.getAllWorkoutLogs();
      const usedInLogs = logs.some(log =>
        log.exercises.some(ex => ex.exerciseId === exerciseId)
      );
      
      if (usedInLogs) {
        return res.status(409).json({ 
          error: "Cannot delete exercise that is used in workout logs" 
        });
      }
      
      // Safe to delete
      const deleted = await storage.deleteExercise(exerciseId);
      if (!deleted) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete exercise" });
    }
  });

  // Workout Routines
  app.get("/api/workout-routines", async (req, res) => {
    try {
      const routines = await storage.getAllWorkoutRoutines();
      res.json(routines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workout routines" });
    }
  });

  app.get("/api/workout-routines/:id", async (req, res) => {
    try {
      const routine = await storage.getWorkoutRoutine(req.params.id);
      if (!routine) {
        return res.status(404).json({ error: "Workout routine not found" });
      }
      res.json(routine);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workout routine" });
    }
  });

  app.post("/api/workout-routines", async (req, res) => {
    try {
      const validatedData = insertWorkoutRoutineSchema.parse(req.body);
      const routine = await storage.createWorkoutRoutine(validatedData);
      res.status(201).json(routine);
    } catch (error) {
      res.status(400).json({ error: "Invalid workout routine data" });
    }
  });

  app.put("/api/workout-routines/:id", async (req, res) => {
    try {
      // Manual validation for partial updates
      const updateData: Partial<InsertWorkoutRoutine> = {};
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.exercises !== undefined) updateData.exercises = req.body.exercises;
      if (req.body.dayTitles !== undefined) updateData.dayTitles = req.body.dayTitles;
      
      const routine = await storage.updateWorkoutRoutine(req.params.id, updateData);
      if (!routine) {
        return res.status(404).json({ error: "Workout routine not found" });
      }
      res.json(routine);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workout routine" });
    }
  });

  app.delete("/api/workout-routines/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWorkoutRoutine(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Workout routine not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workout routine" });
    }
  });

  app.post("/api/workout-routines/:id/add-exercise", async (req, res) => {
    try {
      const { exerciseId, days, setsConfig } = req.body;
      
      // Validate required fields
      if (!exerciseId || !days || !Array.isArray(days) || days.length === 0) {
        return res.status(400).json({ error: "exerciseId and days are required" });
      }
      
      // Validate days array contains only valid day strings
      const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "any"];
      const areValidDays = days.every((day: any) => typeof day === 'string' && validDays.includes(day.toLowerCase()));
      
      if (!areValidDays) {
        return res.status(400).json({ error: "days must be an array of valid day names (monday-sunday or any)" });
      }
      
      if (!setsConfig || !Array.isArray(setsConfig) || setsConfig.length === 0) {
        return res.status(400).json({ error: "setsConfig is required and must have at least one set" });
      }
      
      // Validate setsConfig structure and values
      const isValidSetsConfig = setsConfig.every(
        (set: any) => 
          typeof set.reps === 'number' && 
          typeof set.restPeriod === 'number' &&
          set.reps > 0 &&
          set.restPeriod >= 30 && set.restPeriod <= 300 &&
          // weight is optional but if present must be a positive number
          (set.weight === undefined || (typeof set.weight === 'number' && set.weight > 0))
      );
      
      if (!isValidSetsConfig) {
        return res.status(400).json({ error: "Invalid setsConfig: reps must be positive, restPeriod must be between 30-300 seconds, and weight (if provided) must be positive" });
      }
      
      // Verify exercise exists
      const exercise = await storage.getExercise(exerciseId);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      
      // Get the existing routine
      const routine = await storage.getWorkoutRoutine(req.params.id);
      if (!routine) {
        return res.status(404).json({ error: "Workout routine not found" });
      }
      
      // Create the new exercise entry
      const newExercise = {
        exerciseId,
        sets: setsConfig.length, // Legacy field for backward compatibility
        reps: setsConfig[0]?.reps || 10, // Legacy field - use first set's reps
        days,
        restPeriod: setsConfig[0]?.restPeriod || 90, // Legacy field - use first set's rest
        setsConfig
      };
      
      // Add the exercise to the routine
      const updatedExercises = [...routine.exercises, newExercise];
      
      // Update the routine
      const updatedRoutine = await storage.updateWorkoutRoutine(req.params.id, {
        exercises: updatedExercises
      });
      
      res.json(updatedRoutine);
    } catch (error) {
      res.status(500).json({ error: "Failed to add exercise to routine" });
    }
  });

  // Workout Logs
  app.get("/api/workout-logs", async (req, res) => {
    try {
      const logs = await storage.getAllWorkoutLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workout logs" });
    }
  });

  app.get("/api/workout-logs/:id", async (req, res) => {
    try {
      const log = await storage.getWorkoutLog(req.params.id);
      if (!log) {
        return res.status(404).json({ error: "Workout log not found" });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workout log" });
    }
  });

  app.post("/api/workout-logs", async (req, res) => {
    try {
      const validatedData = insertWorkoutLogSchema.parse(req.body) as InsertWorkoutLog;
      
      // Validate that completed sets have positive reps
      // Note: weight can be 0 or undefined for bodyweight exercises
      const hasInvalidSets = validatedData.exercises.some((ex: any) =>
        ex.sets.some((set: any) => set.completed && set.reps <= 0)
      );
      
      if (hasInvalidSets) {
        return res.status(400).json({ error: "Completed sets must have positive reps" });
      }
      
      // Recompute totalVolume from completed sets only
      const totalVolume = validatedData.exercises.reduce((total: number, ex: any) => {
        return total + ex.sets
          .filter((set: any) => set.completed && set.weight > 0 && set.reps > 0)
          .reduce((sum: number, set: any) => sum + (set.weight * set.reps), 0);
      }, 0);
      
      const log = await storage.createWorkoutLog({
        ...validatedData,
        totalVolume,
      });
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ error: "Invalid workout log data" });
    }
  });

  app.delete("/api/workout-logs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWorkoutLog(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Workout log not found" });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workout log" });
    }
  });

  // Progress Records
  app.get("/api/progress-records", async (req, res) => {
    try {
      const { exerciseId } = req.query;
      if (exerciseId && typeof exerciseId === 'string') {
        const records = await storage.getProgressRecordsByExercise(exerciseId);
        return res.json(records);
      }
      const records = await storage.getAllProgressRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress records" });
    }
  });

  app.post("/api/progress-records", async (req, res) => {
    try {
      const validatedData = insertProgressRecordSchema.parse(req.body);
      const record = await storage.createProgressRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid progress record data" });
    }
  });

  // Body Stats
  app.get("/api/body-stats", async (req, res) => {
    try {
      const stats = await storage.getAllBodyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch body stats" });
    }
  });

  app.get("/api/body-stats/:id", async (req, res) => {
    try {
      const stats = await storage.getBodyStats(req.params.id);
      if (!stats) {
        return res.status(404).json({ error: "Body stats not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch body stats" });
    }
  });

  app.post("/api/body-stats", async (req, res) => {
    try {
      const validatedData = insertBodyStatsSchema.parse(req.body);
      const stats = await storage.createBodyStats(validatedData);
      res.status(201).json(stats);
    } catch (error) {
      res.status(400).json({ error: "Invalid body stats data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
