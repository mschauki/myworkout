import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WorkoutRoutine, Exercise } from "@shared/schema";
import { X, Check, Timer, Pause, Play, Plus, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

const WORKOUT_PROGRESS_KEY = "jefit-workout-progress";

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
  restPeriod: number;
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
  
  // Load saved progress from localStorage
  const getSavedProgress = () => {
    try {
      const saved = localStorage.getItem(WORKOUT_PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if it's the same routine
        if (parsed.routineId === routine.id && parsed.selectedDay === selectedDay) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load workout progress:", e);
    }
    return null;
  };
  
  const savedProgress = useRef(getSavedProgress());
  
  const [startTime] = useState(() => savedProgress.current?.startTime || Date.now());
  const [elapsedTime, setElapsedTime] = useState(() => {
    if (savedProgress.current?.startTime) {
      return Math.floor((Date.now() - savedProgress.current.startTime) / 1000);
    }
    return 0;
  });
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => savedProgress.current?.exerciseLogs || []);
  const [restTimer, setRestTimer] = useState(() => savedProgress.current?.restTimer || 0);
  const [restPaused, setRestPaused] = useState(false);
  const [currentRestPeriod, setCurrentRestPeriod] = useState(() => savedProgress.current?.currentRestPeriod || 90);
  const [currentRestingExerciseIndex, setCurrentRestingExerciseIndex] = useState<number | null>(() => savedProgress.current?.currentRestingExerciseIndex ?? null);
  const [currentRestingSetIndex, setCurrentRestingSetIndex] = useState<number | null>(() => savedProgress.current?.currentRestingSetIndex ?? null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(() => savedProgress.current?.currentExerciseIndex ?? startingExerciseIndex);
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
  const [showExitConfirmDialog, setShowExitConfirmDialog] = useState(false);
  const [showIncompleteWorkoutDialog, setShowIncompleteWorkoutDialog] = useState(false);

  const { toast } = useToast();

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Save workout progress to localStorage whenever state changes
  useEffect(() => {
    if (exerciseLogs.length === 0) return;
    
    try {
      const progress = {
        routineId: routine.id,
        selectedDay,
        startTime,
        exerciseLogs,
        currentExerciseIndex,
        restTimer,
        currentRestPeriod,
        currentRestingExerciseIndex,
        currentRestingSetIndex,
      };
      localStorage.setItem(WORKOUT_PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save workout progress:", e);
    }
  }, [exerciseLogs, currentExerciseIndex, restTimer, currentRestPeriod, currentRestingExerciseIndex, currentRestingSetIndex, routine.id, selectedDay, startTime]);

  // Initialize exercise logs once
  useEffect(() => {
    if (exerciseLogs.length > 0 || exercises.length === 0) return;
    
    const logs: ExerciseLog[] = routine.exercises.map((ex) => {
      const exercise = exercises.find((e) => e.id === ex.exerciseId);
      
      const defaultRestPeriod = ex.restPeriod || 90;
      if (ex.setsConfig && ex.setsConfig.length > 0) {
        return {
          exerciseId: ex.exerciseId,
          exerciseName: exercise?.name || "Unknown Exercise",
          defaultRestPeriod,
          supersetGroup: ex.supersetGroup,
          sets: ex.setsConfig.map((setConfig) => ({
            weight: setConfig.weight || 0,
            reps: setConfig.reps || 0,
            duration: setConfig.duration,
            completed: false,
            restPeriod: setConfig.restPeriod,
          })),
        };
      } else {
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
        setRestTimer((prev: number) => {
          const newTimer = Math.max(0, prev - 1);
          
          if (newTimer === 3 || newTimer === 2 || newTimer === 1) {
            playTone(800, 100);
          } else if (newTimer === 0) {
            playTone(1200, 150);
          }
          
          if (newTimer === 0) {
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
        if (value === '' || value === null || value === undefined) {
          return logs;
        }
        parsedValue = Number(value);
        if (isNaN(parsedValue) || parsedValue < 0) {
          return logs;
        }
        
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
    setPendingSetAddition({ exerciseIndex });
    setShowAddSetDialog(true);
  };

  const confirmAddSet = (makePermanent: boolean) => {
    if (pendingSetAddition) {
      const { exerciseIndex } = pendingSetAddition;
      
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
    
    const currentExercise = exerciseLogs[exerciseIndex];
    const isLastSet = setIndex === currentExercise.sets.length - 1;
    
    updateSet(exerciseIndex, setIndex, "completed", true);
    
    // Scroll to the next set after a brief delay to allow state update
    setTimeout(() => {
      const nextSetIndex = setIndex + 1;
      if (nextSetIndex < currentExercise.sets.length) {
        // Scroll to next set in same exercise
        const nextSetElement = document.querySelector(`[data-testid="row-set-${exerciseIndex}-${nextSetIndex}"]`);
        if (nextSetElement) {
          nextSetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
    
    if (isLastSet) {
      const allOthersComplete = currentExercise.sets.every((s, idx) => idx === setIndex || s.completed);
      if (allOthersComplete) {
        let nextIndex = exerciseIndex + 1;
        
        if (nextIndex >= exerciseLogs.length) {
          if (startingPointIndex > 0) {
            nextIndex = 0;
          } else {
            nextIndex = exerciseIndex;
          }
        }
        
        const previousExerciseBeforeStart = startingPointIndex === 0 ? exerciseLogs.length - 1 : startingPointIndex - 1;
        if (nextIndex === previousExerciseBeforeStart && startingPointIndex > 0 && exerciseIndex >= startingPointIndex) {
          nextIndex = exerciseIndex;
        }
        
        if (nextIndex !== exerciseIndex) {
          setTimeout(() => {
            setCurrentExerciseIndex(nextIndex);
            // Scroll to top of the page when moving to next exercise
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 300);
        }
      }
    }
    
    const currentSuperset = currentExercise.supersetGroup;
    const SUPERSET_MAX_TRANSITION_REST = 15;
    const configuredRest = set.restPeriod ?? 90;
    
    let restPeriod = configuredRest;
    
    if (currentSuperset && isLastSet && exerciseIndex < exerciseLogs.length - 1) {
      const nextExercise = exerciseLogs[exerciseIndex + 1];
      if (nextExercise && nextExercise.supersetGroup === currentSuperset) {
        restPeriod = Math.min(configuredRest, SUPERSET_MAX_TRANSITION_REST);
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
      const response = await apiRequest("GET", `/api/workout-routines/${routineId}`);
      const currentRoutine = await response.json();
      
      let wasUpdated = false;
      
      const updatedExercises = currentRoutine.exercises.map((ex: any) => {
        if (ex.exerciseId === exerciseId) {
          const updatedExercise = { ...ex };
          
          if (ex.setsConfig && ex.setsConfig.length > 0) {
            if (setIndex < ex.setsConfig.length) {
              const setsConfig = ex.setsConfig.map((cfg: any) => ({ ...cfg }));
              setsConfig[setIndex] = {
                ...setsConfig[setIndex],
                restPeriod: newRestPeriod,
              };
              updatedExercise.setsConfig = setsConfig;
              wasUpdated = true;
            }
          } else if (ex.sets && ex.reps) {
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
      const response = await apiRequest("GET", `/api/workout-routines/${routineId}`);
      const currentRoutine = await response.json();
      
      const updatedExercises = currentRoutine.exercises.map((ex: any) => {
        if (ex.exerciseId === exerciseId) {
          const updatedExercise = { ...ex };
          
          if (ex.setsConfig && ex.setsConfig.length > 0) {
            const setsConfig = ex.setsConfig.map((cfg: any) => ({ ...cfg }));
            const lastSet = setsConfig[setsConfig.length - 1];
            setsConfig.push({
              ...lastSet,
            });
            updatedExercise.setsConfig = setsConfig;
            updatedExercise.sets = setsConfig.length;
          } else if (ex.sets && ex.reps) {
            const setsConfig = Array.from({ length: ex.sets + 1 }, (_, idx) => ({
              reps: ex.reps,
              restPeriod: ex.restPeriod || 90,
            }));
            updatedExercise.setsConfig = setsConfig;
            updatedExercise.sets = ex.sets + 1;
          }
          
          return updatedExercise;
        }
        return ex;
      });
      
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
      
      updateSetRestPeriod(exerciseIndex, setIndex, newRestPeriod);
      
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

  const isWorkoutComplete = () => {
    return exerciseLogs.every(log => log.sets.every(set => set.completed));
  };

  const handleFinishClick = () => {
    if (isWorkoutComplete()) {
      finishWorkout();
    } else {
      setShowIncompleteWorkoutDialog(true);
    }
  };

  const clearWorkoutProgress = () => {
    try {
      localStorage.removeItem(WORKOUT_PROGRESS_KEY);
    } catch (e) {
      console.error("Failed to clear workout progress:", e);
    }
  };

  const finishWorkout = () => {
    // Clear saved progress since workout is finishing
    clearWorkoutProgress();
    
    // Filter to only include exercises with completed sets, and only save completed sets
    const completedExerciseLogs = exerciseLogs
      .map(log => ({
        ...log,
        sets: log.sets.filter(set => set.completed)
      }))
      .filter(log => log.sets.length > 0);

    const totalVolume = completedExerciseLogs.reduce((total, log) => {
      return total + log.sets
        .filter(set => set.weight > 0 && (set.reps || 0) > 0)
        .reduce((sum, set) => sum + (set.weight * (set.reps || 0)), 0);
    }, 0);

    // Get the day title from routine if available
    const dayTitle = selectedDay && routine.dayTitles?.[selectedDay] 
      ? routine.dayTitles[selectedDay] 
      : undefined;

    saveWorkoutMutation.mutate({
      routineName: routine.name,
      routineDay: selectedDay || undefined,
      routineDayTitle: dayTitle,
      date: new Date().toISOString(),
      duration: elapsedTime,
      exercises: completedExerciseLogs,
      totalVolume,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculate1RM = (weight: number, reps: number): number => {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
  };

  const getBest1RM = (sets: WorkoutSet[]): number => {
    const completedSets = sets.filter(s => s.completed && s.weight > 0 && (s.reps || 0) > 0);
    if (completedSets.length === 0) return 0;
    return Math.max(...completedSets.map(s => calculate1RM(s.weight, s.reps || 0)));
  };

  const completedSets = exerciseLogs.reduce((sum, log) => 
    sum + log.sets.filter(s => s.completed).length, 0
  );
  const totalSets = exerciseLogs.reduce((sum, log) => sum + log.sets.length, 0);

  const goToNextExercise = () => {
    if (currentExerciseIndex < exerciseLogs.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const goToPrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Glass Header */}
      <div className="sticky top-0 z-50 glass-header">
        <div className="px-4 py-3 max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowExitConfirmDialog(true)}
              className="glass-button h-10 w-10 shrink-0"
              data-testid="button-cancel-workout"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 text-center min-w-0">
              <h1 className="text-lg font-bold truncate" data-testid="text-workout-name">{routine.name}</h1>
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono" data-testid="text-elapsed-time">{formatTime(elapsedTime)}</span>
                <span>•</span>
                <span data-testid="badge-progress">{completedSets}/{totalSets} sets</span>
              </div>
            </div>

            {/* Rest Timer or Finish Button */}
            <div className="shrink-0">
              {restTimer > 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 glass-badge rounded-full bg-primary/20 border-primary/40">
                  <Timer className="w-4 h-4 text-primary" />
                  <span className="font-mono font-bold text-primary" data-testid="text-rest-timer">{formatTime(restTimer)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0"
                    onClick={() => setRestPaused(!restPaused)}
                    data-testid="button-rest-toggle"
                  >
                    {restPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0"
                    onClick={() => setRestTimer(0)}
                    data-testid="button-rest-skip"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleFinishClick}
                  disabled={saveWorkoutMutation.isPending || completedSets === 0}
                  className="h-10 px-4"
                  data-testid="button-finish-workout"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Done
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Current Exercise */}
      {exerciseLogs.length > 0 && (
        <div className="flex-1 flex flex-col">
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
            const nextIncompleteSetIndex = log.sets.findIndex(s => !s.completed);
            
            return (
              <div className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
                {/* Exercise Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {isSupersetStart && (
                      <Badge className="glass-badge text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Superset
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">{log.exerciseName}</h2>
                  <div className="flex items-center justify-center gap-3">
                    <Badge variant="secondary" className="glass-badge px-3 py-1">
                      {completedInExercise}/{totalInExercise} sets
                    </Badge>
                    {!isTimeBased && getBest1RM(log.sets) > 0 && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1" data-testid={`badge-1rm-${currentExerciseIndex}`}>
                        Est. 1RM: {formatWeight(Math.round(getBest1RM(log.sets)))}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Exercise Image */}
                {exercise?.imageUrl && (
                  <div className="glass-card mb-6 overflow-hidden">
                    <img 
                      src={exercise.imageUrl} 
                      alt={log.exerciseName}
                      className="w-full h-40 object-cover"
                      data-testid={`img-exercise-${currentExerciseIndex}`}
                    />
                  </div>
                )}

                {/* Sets - Card Style for Each Set */}
                <div className="flex-1 space-y-3">
                  {log.sets.map((set, setIndex) => {
                    const isNextIncomplete = setIndex === nextIncompleteSetIndex;
                    const isCurrentlyResting = currentRestingExerciseIndex === currentExerciseIndex && currentRestingSetIndex === setIndex;
                    
                    return (
                      <div
                        key={setIndex}
                        className={`glass-card p-4 transition-all duration-300 ${
                          set.completed 
                            ? "bg-primary/15 border-primary/40" 
                            : isNextIncomplete
                            ? "border-2 border-primary shadow-lg scale-[1.02]"
                            : "opacity-70"
                        } ${isCurrentlyResting ? 'ring-2 ring-primary/50' : ''}`}
                        data-testid={`row-set-${currentExerciseIndex}-${setIndex}`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Set Number */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                            set.completed 
                              ? 'bg-primary text-white' 
                              : isNextIncomplete 
                              ? 'glass-surface border-2 border-primary text-primary'
                              : 'glass-surface'
                          }`}>
                            {setIndex + 1}
                          </div>
                          
                          {/* Inputs */}
                          <div className="flex-1 flex items-center gap-3">
                            {!isBodyweight && (
                              <div className="flex-1">
                                <label className="text-xs text-muted-foreground mb-1 block">
                                  {getUnitLabel()}
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  step={getUnitLabel() === "kg" ? "0.5" : "2.5"}
                                  value={set.weight ? (() => {
                                    const converted = convertWeight(set.weight);
                                    const precision = 1;
                                    const rounded = Math.round(converted * Math.pow(10, precision)) / Math.pow(10, precision);
                                    if (Math.abs(rounded - Math.round(rounded)) < 0.00001) {
                                      return Math.round(rounded).toString();
                                    }
                                    return rounded.toString();
                                  })() : ""}
                                  onChange={(e) => updateSet(currentExerciseIndex, setIndex, "weight", e.target.value)}
                                  disabled={set.completed}
                                  className="glass-input h-12 text-lg font-medium text-center"
                                  placeholder="0"
                                  data-testid={`input-weight-${currentExerciseIndex}-${setIndex}`}
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <label className="text-xs text-muted-foreground mb-1 block">
                                {isTimeBased ? 'Seconds' : 'Reps'}
                              </label>
                              <Input
                                type="number"
                                min="0"
                                value={isTimeBased ? (set.duration || "") : (set.reps || "")}
                                onChange={(e) => updateSet(currentExerciseIndex, setIndex, isTimeBased ? "duration" : "reps", e.target.value)}
                                disabled={set.completed}
                                className="glass-input h-12 text-lg font-medium text-center"
                                placeholder="0"
                                data-testid={`input-${isTimeBased ? 'duration' : 'reps'}-${currentExerciseIndex}-${setIndex}`}
                              />
                            </div>
                          </div>
                          
                          {/* Complete Button */}
                          <Button
                            type="button"
                            variant={set.completed ? "default" : "outline"}
                            size="icon"
                            onClick={() => completeSet(currentExerciseIndex, setIndex)}
                            disabled={(isTimeBased ? (set.duration ?? 0) <= 0 : (set.reps ?? 0) <= 0) && !set.completed}
                            className={`h-12 w-12 shrink-0 ${
                              set.completed 
                                ? 'bg-primary' 
                                : isNextIncomplete 
                                ? 'glass-button border-2 border-primary text-primary hover:bg-primary hover:text-white'
                                : 'glass-button'
                            }`}
                            data-testid={`button-done-set-${currentExerciseIndex}-${setIndex}`}
                          >
                            <Check className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Set Button */}
                  <Button
                    variant="ghost"
                    onClick={() => addSet(currentExerciseIndex)}
                    className="w-full glass-button h-12 border-dashed"
                    data-testid={`button-add-set-${currentExerciseIndex}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Set
                  </Button>

                  {/* Finish Workout Button - shown on last exercise when all sets are complete */}
                  {currentExerciseIndex === exerciseLogs.length - 1 && 
                   completedInExercise === totalInExercise && 
                   totalInExercise > 0 && (
                    <Button
                      onClick={handleFinishClick}
                      disabled={saveWorkoutMutation.isPending}
                      className="w-full h-14 text-lg font-semibold mt-4"
                      data-testid="button-finish-workout-bottom"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Finish Workout
                    </Button>
                  )}
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={goToPrevExercise}
                    disabled={currentExerciseIndex === 0}
                    className="glass-button"
                    data-testid={`button-prev-exercise-${currentExerciseIndex}`}
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Prev
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    {currentExerciseIndex + 1} / {exerciseLogs.length}
                  </span>
                  
                  <Button
                    variant="ghost"
                    onClick={goToNextExercise}
                    disabled={currentExerciseIndex === exerciseLogs.length - 1}
                    className="glass-button"
                    data-testid={`button-next-exercise-${currentExerciseIndex}`}
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Rest Period Change Confirmation Dialog */}
      <AlertDialog open={showRestPeriodDialog} onOpenChange={setShowRestPeriodDialog}>
        <AlertDialogContent className="glass-modal" data-testid="dialog-rest-period-confirmation">
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
              className="glass-button"
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
        <AlertDialogContent className="glass-modal" data-testid="dialog-add-set-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Set Count Change?</AlertDialogTitle>
            <AlertDialogDescription>
              You're adding a new set to this exercise. Would you like to save this change for future workout sessions?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => confirmAddSet(false)}
              className="glass-button"
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

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirmDialog} onOpenChange={setShowExitConfirmDialog}>
        <AlertDialogContent className="glass-modal" data-testid="dialog-exit-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>End Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {completedSets} completed sets. Would you like to save your progress to history?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowExitConfirmDialog(false);
                clearWorkoutProgress();
                onComplete();
              }}
              className="glass-button"
              data-testid="button-exit-discard"
            >
              Discard
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowExitConfirmDialog(false);
                finishWorkout();
                onComplete();
              }}
              data-testid="button-exit-save"
            >
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Incomplete Workout Confirmation Dialog */}
      <AlertDialog open={showIncompleteWorkoutDialog} onOpenChange={setShowIncompleteWorkoutDialog}>
        <AlertDialogContent className="glass-modal" data-testid="dialog-incomplete-workout">
          <AlertDialogHeader>
            <AlertDialogTitle>Finish Workout Early?</AlertDialogTitle>
            <AlertDialogDescription>
              You've completed {completedSets} of {totalSets} sets. Would you like to save your progress and end the workout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="glass-button"
              data-testid="button-incomplete-continue"
            >
              Keep Going
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowIncompleteWorkoutDialog(false);
                finishWorkout();
              }}
              data-testid="button-incomplete-save"
            >
              Save & Finish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
