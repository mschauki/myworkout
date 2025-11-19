import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { WorkoutRoutine, Exercise } from "@shared/schema";
import { X, Check, Timer, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ActiveWorkoutProps {
  routine: WorkoutRoutine;
  selectedDay?: string;
  onComplete: () => void;
}

interface WorkoutSet {
  weight: number;
  reps: number;
  completed: boolean;
  restPeriod: number; // Rest period in seconds for this specific set
}

interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  defaultRestPeriod?: number;
  sets: WorkoutSet[];
}

export function ActiveWorkout({ routine, selectedDay, onComplete }: ActiveWorkoutProps) {
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [restTimer, setRestTimer] = useState(0);
  const [restPaused, setRestPaused] = useState(false);
  const [currentRestPeriod, setCurrentRestPeriod] = useState(90);
  const [currentRestingExerciseIndex, setCurrentRestingExerciseIndex] = useState<number | null>(null);
  const [currentRestingSetIndex, setCurrentRestingSetIndex] = useState<number | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<string[]>(["exercise-0"]);

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
          sets: ex.setsConfig.map((setConfig) => ({
            weight: 0,
            reps: setConfig.reps,
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

  // Rest timer
  useEffect(() => {
    if (restTimer > 0 && !restPaused) {
      const interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            // Rest timer finished, clear the current resting indices
            setCurrentRestingExerciseIndex(null);
            setCurrentRestingSetIndex(null);
          }
          return Math.max(0, prev - 1);
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [restTimer, restPaused]);

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    setExerciseLogs((logs) => {
      const newLogs = [...logs];
      let parsedValue = value;
      
      if (field === 'weight' || field === 'reps') {
        // Don't update if value is empty string - keep previous value
        if (value === '' || value === null || value === undefined) {
          return logs;
        }
        parsedValue = Number(value);
        // Don't allow negative or NaN values
        if (isNaN(parsedValue) || parsedValue < 0) {
          return logs;
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

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    const set = exerciseLogs[exerciseIndex]?.sets[setIndex];
    if (!set || set.weight <= 0 || set.reps <= 0) {
      toast({ 
        title: "Invalid set data", 
        description: "Please enter positive values for weight and reps",
        variant: "destructive" 
      });
      return;
    }
    updateSet(exerciseIndex, setIndex, "completed", true);
    
    // Check if this is the last set of the current exercise
    const currentExercise = exerciseLogs[exerciseIndex];
    const isLastSet = setIndex === currentExercise.sets.length - 1;
    
    // If this is the last set and there's a next exercise, auto-expand it
    if (isLastSet && exerciseIndex < exerciseLogs.length - 1) {
      const nextExerciseKey = `exercise-${exerciseIndex + 1}`;
      if (!expandedExercises.includes(nextExerciseKey)) {
        setExpandedExercises(prev => [...prev, nextExerciseKey]);
      }
    }
    
    // Use the per-set rest period
    const restPeriod = set.restPeriod || 90;
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

  const finishWorkout = () => {
    const totalVolume = exerciseLogs.reduce((total, log) => {
      return total + log.sets
        .filter(set => set.completed && set.weight > 0 && set.reps > 0)
        .reduce((sum, set) => sum + (set.weight * set.reps), 0);
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
    const completedSets = sets.filter(s => s.completed && s.weight > 0 && s.reps > 0);
    if (completedSets.length === 0) return 0;
    return Math.max(...completedSets.map(s => calculate1RM(s.weight, s.reps)));
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
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono font-medium" data-testid="text-elapsed-time">{formatTime(elapsedTime)}</span>
            </div>
            <Badge variant="secondary" data-testid="badge-progress">
              {completedSets}/{totalSets} sets
            </Badge>
          </div>
        </div>
      </div>

      {/* Rest Timer */}
      {restTimer > 0 && (
        <div className="sticky top-[120px] z-30 mx-4 mt-4">
          <Card className="bg-primary text-primary-foreground border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Timer className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Rest Timer</p>
                    <p className="text-2xl font-bold font-mono">{formatTime(restTimer)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        min="30"
                        max="300"
                        step="15"
                        value={currentRestPeriod}
                        onChange={(e) => {
                          const parsed = parseInt(e.target.value) || 90;
                          // Clamp value to 30-300 range
                          const clamped = Math.max(30, Math.min(300, parsed));
                          setCurrentRestPeriod(clamped);
                          setRestTimer(clamped);
                          // Update rest period only for the current resting set
                          if (currentRestingExerciseIndex !== null && currentRestingSetIndex !== null) {
                            updateSetRestPeriod(currentRestingExerciseIndex, currentRestingSetIndex, clamped);
                          }
                        }}
                        className="w-20 h-8 bg-primary-foreground text-primary text-sm"
                        data-testid="input-edit-rest"
                      />
                      <span className="text-xs">seconds</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setRestPaused(!restPaused)}
                    data-testid="button-rest-toggle"
                  >
                    {restPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setRestTimer(0)}
                    data-testid="button-rest-skip"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exercise List */}
      <div className="px-4 pt-6 max-w-6xl mx-auto">
        <Accordion 
          type="multiple" 
          value={expandedExercises}
          onValueChange={setExpandedExercises}
        >
          {exerciseLogs.map((log, exerciseIndex) => (
            <AccordionItem key={exerciseIndex} value={`exercise-${exerciseIndex}`}>
              <AccordionTrigger className="text-lg font-medium" data-testid={`accordion-exercise-${exerciseIndex}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span>{log.exerciseName}</span>
                  <Badge variant="outline" className="text-xs">
                    {log.sets.filter(s => s.completed).length}/{log.sets.length}
                  </Badge>
                  {getBest1RM(log.sets) > 0 && (
                    <Badge variant="default" className="text-xs bg-primary/90" data-testid={`badge-1rm-${exerciseIndex}`}>
                      Est. 1RM: {Math.round(getBest1RM(log.sets))} lbs
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                    <div className="col-span-2">Set</div>
                    <div className="col-span-4">Weight (lbs)</div>
                    <div className="col-span-3">Reps</div>
                    <div className="col-span-3 text-right">Done</div>
                  </div>

                  {/* Sets */}
                  {log.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-md ${
                        set.completed ? "bg-muted" : ""
                      }`}
                      data-testid={`row-set-${exerciseIndex}-${setIndex}`}
                    >
                      <div className="col-span-2 font-medium">{setIndex + 1}</div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          min="0"
                          step="5"
                          value={set.weight || ""}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, "weight", e.target.value)}
                          disabled={set.completed}
                          className="h-9"
                          data-testid={`input-weight-${exerciseIndex}-${setIndex}`}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          min="0"
                          value={set.reps || ""}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, "reps", e.target.value)}
                          disabled={set.completed}
                          className="h-9"
                          data-testid={`input-reps-${exerciseIndex}-${setIndex}`}
                        />
                      </div>
                      <div className="col-span-3 flex justify-end">
                        {set.completed ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateSet(exerciseIndex, setIndex, "completed", false)}
                            data-testid={`button-undo-${exerciseIndex}-${setIndex}`}
                          >
                            <Check className="w-5 h-5 text-primary" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => completeSet(exerciseIndex, setIndex)}
                            disabled={!set.weight || set.weight <= 0 || !set.reps || set.reps <= 0}
                            data-testid={`button-complete-${exerciseIndex}-${setIndex}`}
                          >
                            <Check className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Finish Button */}
        <div className="mt-8 pb-4">
          <Button
            onClick={finishWorkout}
            className="w-full"
            size="lg"
            disabled={saveWorkoutMutation.isPending || completedSets === 0}
            data-testid="button-finish-workout"
          >
            {saveWorkoutMutation.isPending ? "Saving..." : "Finish Workout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
