import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Dumbbell, Clock, Calendar, ChevronLeft, ArrowRight, Pencil } from "lucide-react";
import { WorkoutRoutine, Exercise } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutRoutineBuilder } from "@/components/WorkoutRoutineBuilder";
import { ActiveWorkout } from "@/components/ActiveWorkout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const ACTIVE_WORKOUT_STORAGE_KEY = "jefit-active-workout";

export default function Workouts() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [viewingRoutineId, setViewingRoutineId] = useState<string | null>(null);
  const [viewingDay, setViewingDay] = useState<string | null>(null);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewingExerciseIndex, setViewingExerciseIndex] = useState<number | null>(null);
  const [startingExerciseIndex, setStartingExerciseIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Load active workout state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
      if (stored) {
        const { activeRoutineId, selectedDay, startingExerciseIndex } = JSON.parse(stored);
        setActiveRoutineId(activeRoutineId);
        setSelectedDay(selectedDay);
        setStartingExerciseIndex(startingExerciseIndex);
      }
    } catch (error) {
      console.error("Failed to load active workout from localStorage:", error);
    }
  }, []);

  // Save active workout state to localStorage whenever it changes
  useEffect(() => {
    if (activeRoutineId && selectedDay) {
      try {
        localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify({
          activeRoutineId,
          selectedDay,
          startingExerciseIndex
        }));
      } catch (error) {
        console.error("Failed to save active workout to localStorage:", error);
      }
    } else {
      // Clear localStorage when no active workout
      localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
    }
  }, [activeRoutineId, selectedDay, startingExerciseIndex]);

  const { data: routines = [], isLoading } = useQuery<WorkoutRoutine[]>({
    queryKey: ["/api/workout-routines"],
  });

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const viewingRoutine = routines.find(r => r.id === viewingRoutineId);
  const activeRoutine = routines.find(r => r.id === activeRoutineId);
  const editingRoutine = routines.find(r => r.id === editingRoutineId);

  // Clear active workout if the routine no longer exists
  useEffect(() => {
    if (activeRoutineId && !isLoading && !activeRoutine) {
      // Routine was deleted or doesn't exist, clear the active workout
      setActiveRoutineId(null);
      setSelectedDay(null);
      setStartingExerciseIndex(null);
      localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
    }
  }, [activeRoutineId, activeRoutine, isLoading]);

  // Get today's day name
  const todayDayName = WEEKDAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Helper to get exercise name
  const getExerciseName = (id: string) => {
    return exercises.find(e => e.id === id)?.name || "Unknown";
  };

  // Helper to get exercise metadata
  const getExerciseInfo = (id: string) => {
    return exercises.find(e => e.id === id);
  };

  // Get day title (custom or default)
  const getDayTitle = (routine: WorkoutRoutine, day: string) => {
    if (day === "any") return "Any Day";
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
    const customTitle = routine.dayTitles?.[day];
    return customTitle ? `${dayName} - ${customTitle}` : dayName;
  };

  // Format set configuration display
  const getSetConfigDisplay = (exercise: any) => {
    const exerciseInfo = getExerciseInfo(exercise.exerciseId);
    const isTimeBased = exerciseInfo?.isTimeBased || false;
    
    if (exercise.setsConfig && exercise.setsConfig.length > 0) {
      const setCount = exercise.setsConfig.length;
      const firstSet = exercise.setsConfig[0];
      
      // Check if all sets have the same config
      const allSame = exercise.setsConfig.every((set: any) => {
        if (isTimeBased) {
          return set.duration === firstSet.duration && set.restPeriod === firstSet.restPeriod;
        } else {
          return set.reps === firstSet.reps && set.restPeriod === firstSet.restPeriod;
        }
      });
      
      if (allSame) {
        // All sets are the same, show simple format
        const value = isTimeBased ? firstSet.duration : firstSet.reps;
        const unit = isTimeBased ? 's' : 'reps';
        return {
          sets: `${setCount} sets × ${value} ${unit}`,
          rest: `Rest: ${firstSet.restPeriod}s`
        };
      } else {
        // Sets vary, show summary
        return {
          sets: `${setCount} sets (varying)`,
          rest: 'Rest: (varying)'
        };
      }
    } else {
      // Fallback to legacy format
      const unit = isTimeBased ? 's' : 'reps';
      return {
        sets: `${exercise.sets} sets × ${exercise.reps} ${unit}`,
        rest: `Rest: ${exercise.restPeriod || 90}s`
      };
    }
  };

  // Filter exercises for selected day
  const getFilteredRoutine = (routine: WorkoutRoutine, day: string) => {
    return {
      ...routine,
      exercises: routine.exercises.filter(ex => {
        const days = ex.days || ["any"];
        return days.includes("any") || days.includes(day);
      })
    };
  };

  // Get exercises for a specific day
  const getExercisesForDay = (routine: WorkoutRoutine, day: string) => {
    return routine.exercises.filter(ex => {
      const days = ex.days || ["any"];
      return days.includes("any") || days.includes(day);
    });
  };

  // Render builder dialog (always available)
  const builderDialog = (
    <Dialog open={isBuilderOpen} onOpenChange={(open) => {
      setIsBuilderOpen(open);
      if (!open) {
        setEditingRoutineId(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button size="icon" className="bg-primary text-primary-foreground hover-elevate" data-testid="button-create-routine">
          <Plus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-card-border">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingRoutine ? "Edit Workout Routine" : "Create Workout Routine"}
          </DialogTitle>
        </DialogHeader>
        <WorkoutRoutineBuilder 
          editingRoutine={editingRoutine} 
          onComplete={() => {
            setIsBuilderOpen(false);
            setEditingRoutineId(null);
            setViewingRoutineId(null);
          }} 
        />
      </DialogContent>
    </Dialog>
  );

  // Active workout view
  if (activeRoutine && selectedDay) {
    const filteredRoutine = getFilteredRoutine(activeRoutine, selectedDay);
    
    if (filteredRoutine.exercises.length === 0) {
      return (
        <>
          {builderDialog}
          <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
            <Card className="glass-card glass-hover">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-primary/40" />
                <h3 className="text-xl font-semibold mb-2">No exercises for this day</h3>
                <p className="text-muted-foreground mb-6">
                  This routine doesn't have any exercises scheduled for {selectedDay}.
                </p>
                <Button onClick={() => {
                  setActiveRoutineId(null);
                  setSelectedDay(null);
                }}>
                  Back to Workouts
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }
    
    return (
      <>
        {builderDialog}
        <ActiveWorkout routine={filteredRoutine} selectedDay={selectedDay} startingExerciseIndex={startingExerciseIndex ?? undefined} onComplete={() => {
          setActiveRoutineId(null);
          setSelectedDay(null);
          setStartingExerciseIndex(null);
        }} />
      </>
    );
  }

  // Exercise list view for selected day
  if (viewingRoutine && viewingDay) {
    const dayExercises = getExercisesForDay(viewingRoutine, viewingDay);
    const dayTitle = getDayTitle(viewingRoutine, viewingDay);
    
    return (
      <>
        {builderDialog}
        <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setViewingDay(null)}
            className="mb-4"
            data-testid="button-back-to-days"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Days
          </Button>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">{viewingRoutine.name}</h1>
          <div className="flex items-center justify-between gap-4">
            <p className="text-base text-muted-foreground">{dayTitle}</p>
            {dayExercises.length > 0 && (
              <Button
                onClick={() => {
                  setActiveRoutineId(viewingRoutineId);
                  setSelectedDay(viewingDay);
                  setStartingExerciseIndex(null);
                }}
                className="bg-primary text-primary-foreground hover-elevate"
                size="lg"
                data-testid="button-start-workout"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Workout
              </Button>
            )}
          </div>
        </div>

        {dayExercises.length === 0 ? (
          <Card className="glass-card glass-hover">
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-primary/40" />
              <p className="text-muted-foreground">No exercises for this day</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {dayExercises.map((exercise, idx) => {
                const config = getSetConfigDisplay(exercise);
                const exerciseInfo = getExerciseInfo(exercise.exerciseId);
                return (
                <Card 
                  key={idx} 
                  className="bg-card border border-card-border cursor-pointer hover-elevate" 
                  data-testid={`card-exercise-${idx}`}
                  onClick={() => setViewingExerciseIndex(idx)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" data-testid="text-exercise-name">
                          {getExerciseName(exercise.exerciseId)}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="glass-card glass-hover">
                            {config.sets}
                          </Badge>
                          <Badge variant="outline">
                            {config.rest}
                          </Badge>
                          {exerciseInfo?.isTimeBased && (
                            <Badge variant="outline" className="text-xs">Time-based</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>
          </>
        )}

        {/* Exercise Detail Dialog */}
        {viewingExerciseIndex !== null && (
          <Dialog open={viewingExerciseIndex !== null} onOpenChange={(open) => !open && setViewingExerciseIndex(null)}>
            <DialogContent className="bg-card border border-card-border max-w-md">
              <DialogHeader>
                <DialogTitle>{getExerciseName(dayExercises[viewingExerciseIndex].exerciseId)}</DialogTitle>
              </DialogHeader>
              {(() => {
                const exercise = dayExercises[viewingExerciseIndex];
                const exerciseInfo = getExerciseInfo(exercise.exerciseId);
                const config = getSetConfigDisplay(exercise);
                
                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Sets Configuration</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="glass-card glass-hover">
                          {config.sets}
                        </Badge>
                        <Badge variant="outline">
                          {config.rest}
                        </Badge>
                      </div>
                    </div>
                    
                    {exerciseInfo?.description && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm">{exerciseInfo.description}</p>
                      </div>
                    )}
                    
                    {exerciseInfo?.equipment && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Equipment</p>
                        <Badge variant="outline" className="capitalize">
                          {exerciseInfo.equipment}
                        </Badge>
                      </div>
                    )}
                    
                    {(exerciseInfo?.otherMuscleGroups && exerciseInfo.otherMuscleGroups.length > 0) && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Secondary Muscles</p>
                        <div className="flex flex-wrap gap-1">
                          {exerciseInfo.otherMuscleGroups.map((muscle: string) => (
                            <Badge key={muscle} variant="secondary" className="text-xs">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => {
                        setActiveRoutineId(viewingRoutineId);
                        setSelectedDay(viewingDay);
                        setStartingExerciseIndex(viewingExerciseIndex);
                        setViewingExerciseIndex(null);
                      }}
                      className="w-full"
                      size="lg"
                      data-testid="button-start-from-exercise"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Workout From Here
                    </Button>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        )}
      </div>
      </>
    );
  }

  // Routine detail view (days selection)
  if (viewingRoutine) {
    const allDays = [...WEEKDAYS, "any"];
    const daysWithExercises = allDays.filter(day => getExercisesForDay(viewingRoutine, day).length > 0);
    
    return (
      <>
        {builderDialog}
        <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setViewingRoutineId(null)}
            className="mb-4"
            data-testid="button-back-to-routines"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Routines
          </Button>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold mb-2 text-gradient" data-testid="text-routine-name">
                {viewingRoutine.name}
              </h1>
              {viewingRoutine.description && (
                <p className="text-base text-muted-foreground">{viewingRoutine.description}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setEditingRoutineId(viewingRoutine.id);
                setIsBuilderOpen(true);
              }}
              data-testid="button-edit-routine"
            >
              <Pencil className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-4 text-foreground/90">Select Training Day</h2>
          {daysWithExercises.map(day => {
            const dayExercises = getExercisesForDay(viewingRoutine, day);
            const exerciseCount = dayExercises.length;
            const isToday = day === todayDayName;
            const isAny = day === "any";
            const dayTitle = getDayTitle(viewingRoutine, day);
            
            return (
              <Card
                key={day}
                className="bg-card border border-card-border hover:scale-[1.01] transition-all cursor-pointer"
                onClick={() => setViewingDay(day)}
                data-testid={`card-day-${day}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary/60" />
                      <div>
                        <h3 className="font-semibold">
                          {dayTitle}
                        </h3>
                        {isToday && !isAny && (
                          <Badge variant="secondary" className="text-xs mt-1">Today</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="glass-card glass-hover">
                        {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
                      </Badge>
                      <ArrowRight className="w-5 h-5 text-foreground/40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
      {/* Hero Section with Ultra Glass */}
      <div className="glass-hero mb-12 mx-4">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "var(--gradient-mesh-bg)" }}></div>
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 text-gradient" data-testid="text-page-title">My Workouts</h1>
          <p className="text-lg text-muted-foreground">Train smarter, not harder</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mb-8">
        {builderDialog}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card-lg">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-3 shimmer" />
                <Skeleton className="h-4 w-full mb-2 shimmer" />
                <Skeleton className="h-4 w-32 shimmer" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : routines.length === 0 ? (
        <Card className="glass-card-lg">
          <CardContent className="p-12 text-center">
            <div className="glass-icon w-20 h-20 mx-auto mb-4">
              <Dumbbell className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No workout routines yet</h3>
            <p className="text-muted-foreground mb-6">Create your first routine to get started</p>
            <Button className="glass-button" onClick={() => setIsBuilderOpen(true)} data-testid="button-create-first-routine">
              <Plus className="w-4 h-4 mr-2" />
              Create Routine
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {routines.map((routine) => (
            <Card
              key={routine.id}
              className="glass-card glass-hover cursor-pointer"
              onClick={() => setViewingRoutineId(routine.id)}
              data-testid={`card-routine-${routine.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-1" data-testid="text-routine-name">{routine.name}</CardTitle>
                    {routine.description && (
                      <p className="text-sm text-muted-foreground">{routine.description}</p>
                    )}
                  </div>
                  <div className="glass-icon w-10 h-10">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="glass-pill">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    <span>{routine.exercises.length} exercises</span>
                  </div>
                  <div className="glass-pill">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>~{routine.exercises.length * 5} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
