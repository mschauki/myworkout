import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Dumbbell, Clock } from "lucide-react";
import { WorkoutRoutine } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutRoutineBuilder } from "@/components/WorkoutRoutineBuilder";
import { ActiveWorkout } from "@/components/ActiveWorkout";

export default function Workouts() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);

  const { data: routines = [], isLoading } = useQuery<WorkoutRoutine[]>({
    queryKey: ["/api/workout-routines"],
  });

  const activeRoutine = routines.find(r => r.id === activeRoutineId);

  if (activeRoutine) {
    return <ActiveWorkout routine={activeRoutine} onComplete={() => setActiveRoutineId(null)} />;
  }

  return (
    <div className="pb-20 px-4 pt-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">My Workouts</h1>
          <p className="text-muted-foreground">Create and track your routines</p>
        </div>
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogTrigger asChild>
            <Button size="icon" data-testid="button-create-routine">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Workout Routine</DialogTitle>
            </DialogHeader>
            <WorkoutRoutineBuilder onComplete={() => setIsBuilderOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : routines.length === 0 ? (
        <Card>
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
            <Card key={routine.id} className="hover-elevate" data-testid={`card-routine-${routine.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl mb-1" data-testid="text-routine-name">{routine.name}</CardTitle>
                  {routine.description && (
                    <p className="text-sm text-muted-foreground">{routine.description}</p>
                  )}
                </div>
                <Button
                  onClick={() => setActiveRoutineId(routine.id)}
                  variant="default"
                  size="icon"
                  data-testid={`button-start-${routine.id}`}
                >
                  <Play className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    <span>{routine.exercises.length} exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>~{routine.exercises.length * 5} min</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {routine.exercises.slice(0, 3).map((ex, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {ex.sets}x{ex.reps}
                    </Badge>
                  ))}
                  {routine.exercises.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{routine.exercises.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
