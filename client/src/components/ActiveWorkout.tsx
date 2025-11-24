import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { WorkoutRoutine, Exercise } from "@shared/schema";
import { X, Check, Timer, Pause, Play, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUnitSystem } from "@/hooks/use-unit-system";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActiveWorkoutProps {
  routine: WorkoutRoutine;
  selectedDay?: string;
  startingExerciseIndex?: number;
  onComplete: () => void;
}

interface WorkoutSet {
  weight: number;
  reps?: number;
  duration?: number;
  completed: boolean;
  restPeriod: number; // Rest period in seconds for this specific set
}

interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  defaultRestPeriod?: number;
  sets: WorkoutSet[];
  supersetGroup?: string;
}

export function ActiveWorkout({ routine, selectedDay, startingExerciseIndex = 0, onComplete }: ActiveWorkoutProps) {
  const { formatWeight, getUnitLabel, convertWeight, convertToLbs } = useUnitSystem();
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [restTimer, setRestTimer] = useState(0);
  const [restPaused, setRestPaused] = useState(false);
  const [currentRestPeriod, setCurrentRestPeriod] = useState(90);
  const [currentRestingExerciseIndex, setCurrentRestingExerciseIndex] = useState<number | null>(null);
  const [currentRestingSetIndex, setCurrentRestingSetIndex] = useState<number | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(startingExerciseIndex);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([`exercise-${startingExerciseIndex}`]);
  const [startingPointIndex] = useState(startingExerciseIndex);
  const [showRestPeriodDialog, setShowRestPeriodDialog] = useState(false);
  const [pendingRestPeriodChange, setPendingRestPeriodChange] = useState<{
    exerciseIndex: number;
    setIndex: number;
    newRestPeriod: number;
  } | null>(null);
  const [showAddSetDialog, setShowAddSetDialog] = useState(false);
  const [pendingSetAddition, setPendingSetAddition] = useState<{
    exerciseIndex: number;
  } | null>(null);

  const { toast } = useToast();

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Initialize exercise logs once
  useEffect(() => {
    if (exerciseLogs.length > 0 || exercises.length === 0) return;
    
    const logs: ExerciseLog[] = routine.exercises.map((ex) => {
      const exercise = exercises.find((e) => e.id === ex.exerciseId);
      
      // Check if per-set configuration exists
      const defaultRestPeriod = ex.restPeriod || 90;
      if (ex.setsConfig && ex.setsConfig.length > 0) {
        // Use per-set configuration
        return {
          exerciseId: ex.exerciseId,
          exerciseName: exercise?.name || "Unknown Exercise",
          defaultRestPeriod,
          supersetGroup: ex.supersetGroup,
          sets: ex.setsConfig.map((setConfig) => ({
            weight: setConfig.weight || 0, // Use weight from routine if available
            reps: setConfig.reps || 0,
            duration: setConfig.duration,
            completed: false,
            restPeriod: setConfig.restPeriod,
          })),
        };
      } else {
        // Use legacy simple configuration
        return {
          exerciseId: ex.exerciseId,
          exerciseName: exercise?.name || "Unknown Exercise",
          defaultRestPeriod,
          supersetGroup: ex.supersetGroup,
          sets: Array.from({ length: ex.sets }, () => ({
            weight: 0,
            reps: ex.reps,
            completed: false,
            restPeriod: defaultRestPeriod,
          })),
        };
      }
    });
    setExerciseLogs(logs);
  }, [exercises, routine, exerciseLogs.length]);

  // Elapsed time tracker
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Function to play audio tones
  const playTone = (frequency: number, duration: number = 100) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  };

  // Rest timer
  useEffect(() => {
    if (restTimer > 0 && !restPaused) {
      const interval = setInterval(() => {
        setRestTimer((prev) => {
          const newTimer = Math.max(0, prev - 1);
          
          // Play tones at 3, 2, 1, 0 seconds
          if (newTimer === 3 || newTimer === 2 || newTimer === 1) {
            playTone(800, 100); // Medium pitch for 3, 2, 1
          } else if (newTimer === 0) {
            playTone(1200, 150); // Higher pitch for 0
          }
          
          if (newTimer === 0) {
            // Rest timer finished, clear the current resting indices
            setCurrentRestingExerciseIndex(null);
            setCurrentRestingSetIndex(null);
          }
          return newTimer;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [restTimer, restPaused]);

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    setExerciseLogs((logs) => {
      const newLogs = [...logs];
      let parsedValue = value;
      
      if (field === 'weight' || field === 'reps' || field === 'duration') {
        // Don't update if value is empty string - keep previous value
        if (value === '' || value === null || value === undefined) {
          return logs;
        }
        parsedValue = Number(value);
        // Don't allow negative or NaN values
        if (isNaN(parsedValue) || parsedValue < 0) {
          return logs;
        }
        
        // Convert weight from user's unit to lbs for storage
        if (field === 'weight') {
          parsedValue = convertToLbs(parsedValue);
        }
      }
      
      newLogs[exerciseIndex].sets[setIndex] = {
        ...newLogs[exerciseIndex].sets[setIndex],
        [field]: parsedValue,
      };
      return newLogs;
    });
  };

  const updateSetRestPeriod = (exerciseIndex: number, setIndex: number, newRestPeriod: number) => {
    setExerciseLogs((logs) => {
      const newLogs = [...logs];
      if (newLogs[exerciseIndex]?.sets[setIndex]) {
        newLogs[exerciseIndex].sets[setIndex] = {
          ...newLogs[exerciseIndex].sets[setIndex],
          restPeriod: newRestPeriod,
        };
      }
      return newLogs;
    });
  };

  const addSet = (exerciseIndex: number) => {
    // Show dialog to ask if user wants to save permanently
    setPendingSetAddition({ exerciseIndex });
    setShowAddSetDialog(true);
  };

  const confirmAddSet = (makePermanent: boolean) => {
    if (pendingSetAddition) {
      const { exerciseIndex } = pendingSetAddition;
      
      // Add set to current workout session
      setExerciseLogs((logs) => {
        const newLogs = [...logs];
        const exercise = newLogs[exerciseIndex];
        if (exercise) {
          const lastSet = exercise.sets[exercise.sets.length - 1];
          const newSet: WorkoutSet = {
            weight: lastSet?.weight || 0,
            reps: lastSet?.reps || 10,
            completed: false,
            restPeriod: exercise.defaultRestPeriod || 90,
          };
          exercise.sets.push(newSet);
        }
        return newLogs;
      });
      
      // If user wants to make it permanent, update the routine
      if (makePermanent && routine.id) {
        const exerciseLog = exerciseLogs[exerciseIndex];
        addSetToRoutineMutation.mutate({
          routineId: routine.id,
          exerciseId: exerciseLog.exerciseId,
        });
      } else {
        toast({ title: "Set added for this session only" });
      }
    }
    
    setShowAddSetDialog(false);
    setPendingSetAddition(null);
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    const set = exerciseLogs[exerciseIndex]?.sets[setIndex];
    const exercise = exerciseLogs[exerciseIndex];
    const exerciseInfo = exercises.find(e => e.id === exercise?.exerciseId);
    
    // For time-based exercises, no validation needed; for strength exercises, validate reps
    if (!set) {
      toast({ 
        title: "Invalid set data", 
        variant: "destructive" 
      });
      return;
    }
    
    if (!exerciseInfo?.isTimeBased && (set.reps ?? 0) <= 0) {
      toast({ 
        title: "Invalid set data", 
        description: "Please enter positive values for reps",
        variant: "destructive" 
      });
      return;
    }
    
    // Check if this is the last set of the current exercise
    const currentExercise = exerciseLogs[exerciseIndex];
    const isLastSet = setIndex === currentExercise.sets.length - 1;
    
    // Mark set as complete
    updateSet(exerciseIndex, setIndex, "completed", true);
    
    // Auto-advance to next exercise if this is the last set
    if (isLastSet) {
      // Check if all other sets are already complete (which means when we mark this one done, all will be complete)
      const allOthersComplete = currentExercise.sets.every((s, idx) => idx === setIndex || s.completed);
      if (allOthersComplete) {
        // Calculate next exercise index with wrap-around logic
        let nextIndex = exerciseIndex + 1;
        
        // If we've reached the end and started from a different index, wrap around
        if (nextIndex >= exerciseLogs.length) {
          if (startingPointIndex > 0) {
            // Wrap to beginning
            nextIndex = 0;
          } else {
            // Started from beginning, workout is complete - no more auto-advance
            nextIndex = exerciseIndex;
          }
        }
        
        // Check if we've cycled back to one before the starting point
        const previousExerciseBeforeStart = startingPointIndex === 0 ? exerciseLogs.length - 1 : startingPointIndex - 1;
        if (nextIndex === previousExerciseBeforeStart && startingPointIndex > 0 && exerciseIndex >= startingPointIndex) {
          // We've completed the cycle, stay on current
          nextIndex = exerciseIndex;
        }
        
        // Immediately advance to next exercise if different
        if (nextIndex !== exerciseIndex) {
          setCurrentExerciseIndex(nextIndex);
        }
      }
    }
    
    // If this is the last set and there's a next exercise to auto-expand, expand it
    if (isLastSet) {
      let nextIndex = exerciseIndex + 1;
      if (nextIndex >= exerciseLogs.length && startingPointIndex > 0) {
        nextIndex = 0;
      }
      
      if (nextIndex < exerciseLogs.length && nextIndex !== exerciseIndex) {
        const nextExerciseKey = `exercise-${nextIndex}`;
        if (!expandedExercises.includes(nextExerciseKey)) {
          setExpandedExercises(prev => [...prev, nextExerciseKey]);
        }
      }
    }
    
    // Superset handling: When transitioning between exercises in the same superset,
    // use the minimum of configured rest and superset transition rest
    const currentSuperset = currentExercise.supersetGroup;
    const SUPERSET_MAX_TRANSITION_REST = 15; // Maximum rest for superset transitions
    const configuredRest = set.restPeriod ?? 90; // Use nullish coalescing to preserve 0
    
    let restPeriod = configuredRest;
    
    // Debug logging
    console.log('Superset check:', {
      currentSuperset,
      isLastSet,
      exerciseIndex,
      totalExercises: exerciseLogs.length,
      currentExerciseName: currentExercise.exerciseId,
      nextExercise: exerciseIndex < exerciseLogs.length - 1 ? exerciseLogs[exerciseIndex + 1] : null
    });
    
    if (currentSuperset && isLastSet && exerciseIndex < exerciseLogs.length - 1) {
      // Last set of this exercise - check if next exercise is in same superset
      const nextExercise = exerciseLogs[exerciseIndex + 1];
      console.log('Checking superset:', { currentSuperset, nextSuperset: nextExercise?.supersetGroup });
      if (nextExercise && nextExercise.supersetGroup === currentSuperset) {
        // Next exercise is in same superset - use minimum of configured and max transition rest
        // This allows users to configure shorter rests (even 0) while capping longer rests at 15s
        restPeriod = Math.min(configuredRest, SUPERSET_MAX_TRANSITION_REST);
        console.log('Superset rest capping applied:', { configuredRest, cappedRest: restPeriod });
      }
    }
    
    setCurrentRestPeriod(restPeriod);
    setRestTimer(restPeriod);
    setRestPaused(false);
    setCurrentRestingExerciseIndex(exerciseIndex);
    setCurrentRestingSetIndex(setIndex);
  };

  const saveWorkoutMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/workout-logs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs"] });
      toast({ title: "Workout completed successfully!" });
      onComplete();
    },
    onError: () => {
      toast({ title: "Failed to save workout", variant: "destructive" });
    },
  });

  const updateRoutineRestPeriodMutation = useMutation({
    mutationFn: async ({ routineId, exerciseId, setIndex, newRestPeriod }: {
      routineId: string;
      exerciseId: string;
      setIndex: number;
      newRestPeriod: number;
    }) => {
      // Get the current routine
      const response = await apiRequest("GET", `/api/workout-routines/${routineId}`);
      const currentRoutine = await response.json();
      
      let wasUpdated = false;
      
      // Update the specific exercise's setsConfig preserving all other properties
      const updatedExercises = currentRoutine.exercises.map((ex: any) => {
        if (ex.exerciseId === exerciseId) {
          // Clone the existing exercise to preserve all properties
          const updatedExercise = { ...ex };
          
          if (ex.setsConfig && ex.setsConfig.length > 0) {
            // Exercise already has setsConfig - verify setIndex is in bounds
            if (setIndex < ex.setsConfig.length) {
              // Deep clone and update only the specific set
              const setsConfig = ex.setsConfig.map((cfg: any) => ({ ...cfg }));
              setsConfig[setIndex] = {
                ...setsConfig[setIndex],
                restPeriod: newRestPeriod,
              };
              updatedExercise.setsConfig = setsConfig;
              wasUpdated = true;
            }
            // If setIndex out of bounds, skip (don't save dynamically added sets)
          } else if (ex.sets && ex.reps) {
            // Legacy exercise - convert to setsConfig only if setIndex is in bounds
            if (setIndex < ex.sets) {
              const setsConfig = Array.from({ length: ex.sets }, (_, idx) => ({
                reps: ex.reps,
                restPeriod: idx === setIndex ? newRestPeriod : (ex.restPeriod || 90),
              }));
              updatedExercise.setsConfig = setsConfig;
              wasUpdated = true;
            }
          }
          
          return updatedExercise;
        }
        return ex;
      });
      
      // Send back the full routine object to prevent data loss
      const updatedRoutine = {
        ...currentRoutine,
        exercises: updatedExercises,
      };
      
      const result = await apiRequest("PUT", `/api/workout-routines/${routineId}`, updatedRoutine);
      return { result, wasUpdated };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-routines"] });
      if (data.wasUpdated) {
        toast({ title: "Rest period saved for future workouts" });
      } else {
        toast({ 
          title: "Cannot save rest period for dynamically added sets",
          description: "This set was added during the workout and is not part of the routine",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({ title: "Failed to update routine", variant: "destructive" });
    },
  });

  const addSetToRoutineMutation = useMutation({
    mutationFn: async ({ routineId, exerciseId }: {
      routineId: string;
      exerciseId: string;
    }) => {
      // Get the current routine
      const response = await apiRequest("GET", `/api/workout-routines/${routineId}`);
      const currentRoutine = await response.json();
      
      // Update the specific exercise's setsConfig by adding a new set
      const updatedExercises = currentRoutine.exercises.map((ex: any) => {
        if (ex.exerciseId === exerciseId) {
          const updatedExercise = { ...ex };
          
          if (ex.setsConfig && ex.setsConfig.length > 0) {
            // Clone existing setsConfig and add a new set based on the last set
            const setsConfig = ex.setsConfig.map((cfg: any) => ({ ...cfg }));
            const lastSet = setsConfig[setsConfig.length - 1];
            setsConfig.push({
              ...lastSet,  // Clone all properties from last set
            });
            updatedExercise.setsConfig = setsConfig;
            // Update legacy sets field to match setsConfig length
            updatedExercise.sets = setsConfig.length;
          } else if (ex.sets && ex.reps) {
            // Legacy exercise - convert to setsConfig and add one more set
            const setsConfig = Array.from({ length: ex.sets + 1 }, (_, idx) => ({
              reps: ex.reps,
              restPeriod: ex.restPeriod || 90,
            }));
            updatedExercise.setsConfig = setsConfig;
            // Update legacy sets field to match setsConfig length
            updatedExercise.sets = ex.sets + 1;
          }
          
          return updatedExercise;
        }
        return ex;
      });
      
      // Send back the full routine object
      const updatedRoutine = {
        ...currentRoutine,
        exercises: updatedExercises,
      };
      
      return apiRequest("PUT", `/api/workout-routines/${routineId}`, updatedRoutine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-routines"] });
      toast({ title: "Set count saved for future workouts" });
    },
    onError: () => {
      toast({ title: "Failed to update routine", variant: "destructive" });
    },
  });

  const handleRestPeriodChange = (newRestPeriod: number) => {
    const clamped = Math.max(1, Math.min(3600, newRestPeriod));
    setCurrentRestPeriod(clamped);
    setRestTimer(clamped);
    
    // Show dialog to ask if user wants to make it permanent
    if (currentRestingExerciseIndex !== null && currentRestingSetIndex !== null) {
      setPendingRestPeriodChange({
        exerciseIndex: currentRestingExerciseIndex,
        setIndex: currentRestingSetIndex,
        newRestPeriod: clamped,
      });
      setShowRestPeriodDialog(true);
    }
  };

  const confirmRestPeriodChange = (makePermanent: boolean) => {
    if (pendingRestPeriodChange) {
      const { exerciseIndex, setIndex, newRestPeriod } = pendingRestPeriodChange;
      
      // Update current set's rest period
      updateSetRestPeriod(exerciseIndex, setIndex, newRestPeriod);
      
      // If user wants to make it permanent, update the routine
      if (makePermanent && routine.id) {
        const exerciseLog = exerciseLogs[exerciseIndex];
        updateRoutineRestPeriodMutation.mutate({
          routineId: routine.id,
          exerciseId: exerciseLog.exerciseId,
          setIndex: setIndex,
          newRestPeriod: newRestPeriod,
        });
      }
    }
    
    setShowRestPeriodDialog(false);
    setPendingRestPeriodChange(null);
  };

  const finishWorkout = () => {
    const totalVolume = exerciseLogs.reduce((total, log) => {
      return total + log.sets
        .filter(set => set.completed && set.weight > 0 && (set.reps || 0) > 0)
        .reduce((sum, set) => sum + (set.weight * (set.reps || 0)), 0);
    }, 0);

    saveWorkoutMutation.mutate({
      routineName: routine.name,
      date: new Date().toISOString(),
      duration: elapsedTime,
      exercises: exerciseLogs,
      totalVolume,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate 1RM using Epley formula: 1RM = weight × (1 + reps/30)
  const calculate1RM = (weight: number, reps: number): number => {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
  };

  // Get the best estimated 1RM from completed sets for an exercise
  const getBest1RM = (sets: WorkoutSet[]): number => {
    const completedSets = sets.filter(s => s.completed && s.weight > 0 && (s.reps || 0) > 0);
    if (completedSets.length === 0) return 0;
    return Math.max(...completedSets.map(s => calculate1RM(s.weight, s.reps || 0)));
  };

  const completedSets = exerciseLogs.reduce((sum, log) => 
    sum + log.sets.filter(s => s.completed).length, 0
  );
  const totalSets = exerciseLogs.reduce((sum, log) => sum + log.sets.length, 0);

  return (
    <div className="pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-card-border">
        <div className="px-4 py-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate" data-testid="text-workout-name">{routine.name}</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onComplete}
              data-testid="button-cancel-workout"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono font-medium" data-testid="text-elapsed-time">{formatTime(elapsedTime)}</span>
              </div>
              <Badge variant="secondary" data-testid="badge-progress">
                {completedSets}/{totalSets} sets
              </Badge>
            </div>
            {restTimer > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-md">
                <Timer className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold text-primary" data-testid="text-rest-timer">{formatTime(restTimer)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setRestPaused(!restPaused)}
                  data-testid="button-rest-toggle"
                >
                  {restPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setRestTimer(0)}
                  data-testid="button-rest-skip"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Current Exercise - Fullscreen */}
      {exerciseLogs.length > 0 && (
        <div className="min-h-screen flex flex-col px-4 pt-6 pb-20">
          {(() => {
            const log = exerciseLogs[currentExerciseIndex];
            if (!log) return null;
            
            const routineExercise = routine.exercises[currentExerciseIndex];
            const exercise = exercises.find((e) => e.id === routineExercise?.exerciseId);
            const isBodyweight = exercise?.equipment?.toLowerCase() === "bodyweight";
            const isTimeBased = exercise?.isTimeBased || false;
            const isInSuperset = !!log.supersetGroup;
            const prevLog = currentExerciseIndex > 0 ? exerciseLogs[currentExerciseIndex - 1] : null;
            const isSupersetStart = isInSuperset && (!prevLog || prevLog.supersetGroup !== log.supersetGroup);
            
            const completedInExercise = log.sets.filter(s => s.completed).length;
            const totalInExercise = log.sets.length;
            const allComplete = completedInExercise === totalInExercise && totalInExercise > 0;
            
            return (
              <div className="flex flex-col flex-1">
                {/* Exercise Header */}
                <div className="mb-8 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-bold">{log.exerciseName}</h2>
                      {isSupersetStart && (
                        <Badge variant="default" className="text-xs bg-card border border-card-border">
                          Superset
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="text-base px-3 py-2">
                        {completedInExercise}/{totalInExercise} sets
                      </Badge>
                      {!isTimeBased && getBest1RM(log.sets) > 0 && (
                        <Badge variant="default" className="text-sm bg-primary/90" data-testid={`badge-1rm-${currentExerciseIndex}`}>
                          Est. 1RM: {formatWeight(Math.round(getBest1RM(log.sets)))}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress indicator for other exercises */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Exercise {currentExerciseIndex + 1} of {exerciseLogs.length}</span>
                  </div>
                </div>


                {/* Exercise Image */}
                {exercise?.imageUrl && (
                  <Card className="bg-card border border-card-border mb-6 overflow-hidden">
                    <img 
                      src={exercise.imageUrl} 
                      alt={log.exerciseName}
                      className="w-full h-48 object-cover rounded-lg"
                      data-testid={`img-exercise-${currentExerciseIndex}`}
                    />
                  </Card>
                )}

                {/* Sets Grid */}
                <div className="flex-1 space-y-4">
                  {/* Table Header */}
                  <div className={`grid ${isBodyweight ? 'grid-cols-8' : 'grid-cols-12'} gap-2 text-xs font-medium text-muted-foreground px-2`}>
                    <div className="col-span-2">Set</div>
                    {!isBodyweight && <div className="col-span-4">Weight ({getUnitLabel()})</div>}
                    <div className={isBodyweight ? 'col-span-4' : 'col-span-4'}>{isTimeBased ? 'Duration (s)' : 'Reps'}</div>
                    <div className="col-span-2">Done</div>
                  </div>

                  {/* Sets */}
                  <div className="space-y-2">
                    {log.sets.map((set, setIndex) => {
                      const isNextIncomplete = setIndex === log.sets.findIndex(s => !s.completed);
                      return (
                        <div
                          key={setIndex}
                          className={`grid ${isBodyweight ? 'grid-cols-8' : 'grid-cols-12'} gap-2 items-center p-3 rounded-md border-2 ${
                            set.completed 
                              ? "bg-primary/20 border-primary/50" 
                              : isNextIncomplete
                              ? "bg-card border-primary"
                              : "bg-card border-card-border"
                          }`}
                          data-testid={`row-set-${currentExerciseIndex}-${setIndex}`}
                        >
                          <div className="col-span-2 font-bold text-lg">{setIndex + 1}</div>
                          {!isBodyweight && (
                            <div className="col-span-4">
                              <Input
                                type="number"
                                min="0"
                                step={getUnitLabel() === "kg" ? "0.5" : "2.5"}
                                value={set.weight ? (() => {
                                  const converted = convertWeight(set.weight);
                                  // Round to reasonable precision to avoid floating point issues
                                  const precision = getUnitLabel() === "kg" ? 1 : 1;
                                  const rounded = Math.round(converted * Math.pow(10, precision)) / Math.pow(10, precision);
                                  // If it's a whole number, display without decimals
                                  if (Math.abs(rounded - Math.round(rounded)) < 0.00001) {
                                    return Math.round(rounded).toString();
                                  }
                                  return rounded.toString();
                                })() : ""}
                                onChange={(e) => updateSet(currentExerciseIndex, setIndex, "weight", e.target.value)}
                                disabled={set.completed}
                                className="h-12 text-lg"
                                data-testid={`input-weight-${currentExerciseIndex}-${setIndex}`}
                              />
                            </div>
                          )}
                          <div className={isBodyweight ? 'col-span-4' : 'col-span-4'}>
                            <Input
                              type="number"
                              min="0"
                              value={isTimeBased ? (set.duration || "") : (set.reps || "")}
                              onChange={(e) => updateSet(currentExerciseIndex, setIndex, isTimeBased ? "duration" : "reps", e.target.value)}
                              disabled={set.completed}
                              className="h-12 text-lg"
                              placeholder={isTimeBased ? "Seconds" : "Reps"}
                              data-testid={`input-${isTimeBased ? 'duration' : 'reps'}-${currentExerciseIndex}-${setIndex}`}
                            />
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <Button
                              type="button"
                              variant={set.completed ? "default" : "outline"}
                              size="icon"
                              onClick={() => completeSet(currentExerciseIndex, setIndex)}
                              disabled={(isTimeBased ? (set.duration ?? 0) <= 0 : (set.reps ?? 0) <= 0) && !set.completed}
                              className="h-10 w-10"
                              data-testid={`button-done-set-${currentExerciseIndex}-${setIndex}`}
                            >
                              <Check className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Set Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSet(currentExerciseIndex)}
                    className="mt-4"
                    data-testid={`button-add-set-${currentExerciseIndex}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Set
                  </Button>
                </div>

                {/* Bottom Actions - Navigation and Finish Buttons (only when all sets complete) */}
                {allComplete && (
                  <div className="mt-auto pt-8 space-y-2 flex flex-col">
                    {/* Next Exercise or Finish Button */}
                    {currentExerciseIndex < exerciseLogs.length - 1 ? (
                      <>
                        <Button
                          onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
                          size="lg"
                          className="w-full h-16 text-lg font-bold"
                          data-testid={`button-next-exercise-${currentExerciseIndex}`}
                        >
                          Next Exercise
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
                          size="sm"
                          data-testid={`button-prev-exercise-${currentExerciseIndex}`}
                        >
                          Previous Exercise
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={finishWorkout}
                          size="lg"
                          className="w-full h-16 text-lg font-bold"
                          disabled={saveWorkoutMutation.isPending || completedSets === 0}
                          data-testid="button-finish-workout"
                        >
                          {saveWorkoutMutation.isPending ? "Saving..." : "Finish Workout"}
                        </Button>
                        {currentExerciseIndex > 0 && (
                          <Button
                            variant="secondary"
                            onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
                            size="sm"
                            data-testid={`button-prev-exercise-${currentExerciseIndex}`}
                          >
                            Previous Exercise
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Rest Period Change Confirmation Dialog */}
      <AlertDialog open={showRestPeriodDialog} onOpenChange={setShowRestPeriodDialog}>
        <AlertDialogContent data-testid="dialog-rest-period-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Rest Period Change?</AlertDialogTitle>
            <AlertDialogDescription>
              You've changed the rest period to {pendingRestPeriodChange?.newRestPeriod} seconds.
              Would you like to save this change for future workout sessions?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => confirmRestPeriodChange(false)}
              data-testid="button-rest-period-temporary"
            >
              No, just this session
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmRestPeriodChange(true)}
              data-testid="button-rest-period-permanent"
            >
              Yes, save for future workouts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Set Confirmation Dialog */}
      <AlertDialog open={showAddSetDialog} onOpenChange={setShowAddSetDialog}>
        <AlertDialogContent data-testid="dialog-add-set-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Set Count Change?</AlertDialogTitle>
            <AlertDialogDescription>
              You're adding a new set to this exercise. Would you like to save this change for future workout sessions?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => confirmAddSet(false)}
              data-testid="button-add-set-temporary"
            >
              No, just this session
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmAddSet(true)}
              data-testid="button-add-set-permanent"
            >
              Yes, save for future workouts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
