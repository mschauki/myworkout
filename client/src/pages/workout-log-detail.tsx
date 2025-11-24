import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutLog, Exercise } from "@shared/schema";
import { ArrowLeft, Dumbbell, Clock, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useUnitSystem } from "@/hooks/use-unit-system";

export default function WorkoutLogDetail() {
  const [, params] = useRoute("/workout-log/:id");
  const logId = params?.id;
  const { formatWeight, getUnitLabel, convertWeight } = useUnitSystem();

  const { data: workoutLogs = [], isLoading: logsLoading } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workout-logs"],
  });

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const workoutLog = workoutLogs.find(log => log.id === logId);
  const isLoading = logsLoading || exercisesLoading;

  if (isLoading) {
    return (
      <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!workoutLog) {
    return (
      <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
        <Link href="/progress">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Progress
          </Button>
        </Link>
        <Card className="glass-card glass-hover">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">Workout not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const workoutDate = new Date(workoutLog.date);
  const formattedDate = workoutDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = workoutDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
      {/* Header with back button */}
      <Link href="/progress">
        <Button variant="ghost" className="mb-6" data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Progress
        </Button>
      </Link>

      {/* Workout Summary Card */}
      <Card className="bg-card border border-card-border mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2" data-testid="text-routine-name">
                {workoutLog.routineName}
              </CardTitle>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p data-testid="text-workout-date">{formattedDate}</p>
                <p data-testid="text-workout-time">{formattedTime}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 rounded-md border border-input bg-background">
              <Clock className="w-5 h-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold font-mono" data-testid="text-duration">{workoutLog.duration}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Minutes</p>
            </div>
            <div className="flex flex-col items-center p-3 rounded-md border border-input bg-background">
              <TrendingUp className="w-5 h-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold font-mono" data-testid="text-total-volume">
                {formatWeight(workoutLog.totalVolume, { includeUnit: false })}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{getUnitLabel()}</p>
            </div>
            <div className="flex flex-col items-center p-3 rounded-md border border-input bg-background">
              <Dumbbell className="w-5 h-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold font-mono" data-testid="text-exercise-count">
                {workoutLog.exercises.length}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Exercises</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Exercises</h2>
        {workoutLog.exercises.map((exercise, exerciseIndex) => {
          const exerciseInfo = exercises.find(e => e.id === exercise.exerciseId);
          const isBodyweight = exerciseInfo?.equipment?.toLowerCase() === "bodyweight";
          const completedSets = exercise.sets.filter(set => set.completed);
          const totalSets = exercise.sets.length;

          return (
            <Card key={exerciseIndex} className="glass-card glass-hover" data-testid={`card-exercise-${exerciseIndex}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1" data-testid={`text-exercise-name-${exerciseIndex}`}>
                      {exercise.exerciseName}
                    </CardTitle>
                    {exerciseInfo && (
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {exerciseInfo.muscleGroup}
                        </Badge>
                        {exerciseInfo.equipment && (
                          <Badge variant="outline" className="text-xs">
                            {exerciseInfo.equipment}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge variant={completedSets.length === totalSets ? "default" : "secondary"}>
                    {completedSets.length}/{totalSets} sets
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Sets Table */}
                <div className="space-y-2">
                  {/* Header */}
                  <div className={`grid ${isBodyweight ? 'grid-cols-8' : 'grid-cols-12'} gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide`}>
                    <div className="col-span-2">Set</div>
                    {!isBodyweight && <div className="col-span-4">Weight</div>}
                    <div className="col-span-3">Reps</div>
                    <div className="col-span-3">Rest</div>
                  </div>

                  {/* Sets */}
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className={`grid ${isBodyweight ? 'grid-cols-8' : 'grid-cols-12'} gap-2 px-3 py-3 rounded-md ${
                        set.completed 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-muted/30 border border-input'
                      }`}
                      data-testid={`row-set-${exerciseIndex}-${setIndex}`}
                    >
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm font-medium">{setIndex + 1}</span>
                      </div>
                      {!isBodyweight && (
                        <div className="col-span-4 flex items-center">
                          <span className="text-sm font-mono" data-testid={`text-weight-${exerciseIndex}-${setIndex}`}>
                            {set.weight > 0 ? formatWeight(convertWeight(set.weight)) : '-'}
                          </span>
                        </div>
                      )}
                      <div className="col-span-3 flex items-center">
                        <span className="text-sm font-mono" data-testid={`text-reps-${exerciseIndex}-${setIndex}`}>
                          {set.reps}
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-xs text-muted-foreground">
                          {set.restPeriod !== undefined ? `${set.restPeriod}s` : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
