import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Dumbbell, Clock, Calendar, ChevronLeft, Trash2, ArrowRight, Pencil } from "lucide-react";
import { WorkoutRoutine, Exercise } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutRoutineBuilder } from "@/components/WorkoutRoutineBuilder";
import { ActiveWorkout } from "@/components/ActiveWorkout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function Workouts() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [viewingRoutineId, setViewingRoutineId] = useState<string | null>(null);
  const [viewingDay, setViewingDay] = useState<string | null>(null);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: routines = [], isLoading } = useQuery<WorkoutRoutine[]>({
    queryKey: ["/api/workout-routines"],
  });

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const viewingRoutine = routines.find(r => r.id === viewingRoutineId);
  const activeRoutine = routines.find(r => r.id === activeRoutineId);
  const editingRoutine = routines.find(r => r.id === editingRoutineId);

  // Get today's day name
  const todayDayName = WEEKDAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Helper to get exercise name
  const getExerciseName = (id: string) => {
    return exercises.find(e => e.id === id)?.name || "Unknown";
  };

  // Get day title (custom or default)
  const getDayTitle = (routine: WorkoutRoutine, day: string) => {
    if (day === "any") return "Any Day";
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
    const customTitle = routine.dayTitles?.[day];
    return customTitle ? `${dayName} - ${customTitle}` : dayName;
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (routineId: string) => {
      return apiRequest("DELETE", `/api/workout-routines/${routineId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-routines"] });
      toast({ title: "Routine deleted successfully" });
      setDeleteRoutineId(null);
      setViewingRoutineId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete routine", variant: "destructive" });
    },
  });

  // Render builder dialog (always available)
  const builderDialog = (
    <Dialog open={isBuilderOpen} onOpenChange={(open) => {
      setIsBuilderOpen(open);
      if (!open) {
        setEditingRoutineId(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button size="icon" className="glass-button" data-testid="button-create-routine">
          <Plus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-surface-elevated">
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
            <Card className="glass-surface">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-primary/40" />
                <h3 className="text-xl font-semibold mb-2">No exercises for this day</h3>
                <p className="text-foreground/60 mb-6">
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
        <ActiveWorkout routine={filteredRoutine} selectedDay={selectedDay} onComplete={() => {
          setActiveRoutineId(null);
          setSelectedDay(null);
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
          <h1 className="text-4xl font-bold mb-2 gradient-text">{viewingRoutine.name}</h1>
          <p className="text-base text-foreground/70">{dayTitle}</p>
        </div>

        {dayExercises.length === 0 ? (
          <Card className="glass-surface">
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-primary/40" />
              <p className="text-foreground/70">No exercises for this day</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {dayExercises.map((exercise, idx) => (
                <Card key={idx} className="glass-surface" data-testid={`card-exercise-${idx}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" data-testid="text-exercise-name">
                          {getExerciseName(exercise.exerciseId)}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="glass-surface">
                            {exercise.sets} sets × {exercise.reps} reps
                          </Badge>
                          <Badge variant="outline">
                            Rest: {exercise.restPeriod || 90}s
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button
              onClick={() => {
                setActiveRoutineId(viewingRoutineId);
                setSelectedDay(viewingDay);
              }}
              className="w-full glass-button"
              size="lg"
              data-testid="button-start-workout"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Workout
            </Button>
          </>
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
              <h1 className="text-4xl font-bold mb-2 gradient-text" data-testid="text-routine-name">
                {viewingRoutine.name}
              </h1>
              {viewingRoutine.description && (
                <p className="text-base text-foreground/70">{viewingRoutine.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
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
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteRoutineId(viewingRoutine.id);
                }}
                data-testid="button-delete-routine"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
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
                className="glass-surface hover:scale-[1.01] transition-all cursor-pointer"
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
                      <Badge variant="secondary" className="glass-surface">
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteRoutineId} onOpenChange={(open) => !open && setDeleteRoutineId(null)}>
          <AlertDialogContent className="glass-surface-elevated">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Routine?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this workout routine. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteRoutineId && deleteMutation.mutate(deleteRoutineId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      </>
    );
  }

  return (
    <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text" data-testid="text-page-title">My Workouts</h1>
          <p className="text-base text-foreground/70">Create and track your routines</p>
        </div>
        {builderDialog}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-surface">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : routines.length === 0 ? (
        <Card className="glass-surface">
          <CardContent className="p-12 text-center">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No workout routines yet</h3>
            <p className="text-muted-foreground mb-6">Create your first routine to get started</p>
            <Button onClick={() => setIsBuilderOpen(true)} data-testid="button-create-first-routine">
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
              className="glass-surface hover:scale-[1.01] transition-all cursor-pointer"
              onClick={() => setViewingRoutineId(routine.id)}
              data-testid={`card-routine-${routine.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-1" data-testid="text-routine-name">{routine.name}</CardTitle>
                    {routine.description && (
                      <p className="text-sm text-foreground/60">{routine.description}</p>
                    )}
                  </div>
                  <ArrowRight className="w-6 h-6 text-foreground/40 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    <span>{routine.exercises.length} exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
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
