import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertExerciseSchema,
  insertWorkoutRoutineSchema,
  insertWorkoutLogSchema,
  insertProgressRecordSchema,
  insertBodyStatsSchema
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
      const validatedData = insertWorkoutLogSchema.parse(req.body);
      
      // Validate that completed sets have positive weight and reps
      const hasInvalidSets = validatedData.exercises.some(ex =>
        ex.sets.some(set => set.completed && (set.weight <= 0 || set.reps <= 0))
      );
      
      if (hasInvalidSets) {
        return res.status(400).json({ error: "Completed sets must have positive weight and reps" });
      }
      
      // Recompute totalVolume from completed sets only
      const totalVolume = validatedData.exercises.reduce((total, ex) => {
        return total + ex.sets
          .filter(set => set.completed && set.weight > 0 && set.reps > 0)
          .reduce((sum, set) => sum + (set.weight * set.reps), 0);
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
