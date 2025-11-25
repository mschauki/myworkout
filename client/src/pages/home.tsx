import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Dumbbell, Flame, TrendingUp, Trophy, Trash2 } from "lucide-react";
import { WorkoutLog, BodyStats } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUnitSystem } from "@/hooks/use-unit-system";

export default function Home() {
  const { formatWeight, getUnitLabel, convertWeight } = useUnitSystem();
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: workoutLogs, isLoading: logsLoading } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workout-logs"],
  });

  const { data: bodyStats, isLoading: statsLoading } = useQuery<BodyStats[]>({
    queryKey: ["/api/body-stats"],
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/workout-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs"] });
      toast({ title: "Workout deleted successfully" });
      setDeleteLogId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete workout", variant: "destructive" });
    },
  });

  // Calculate stats
  const thisMonthWorkouts = workoutLogs?.filter(log => {
    const logDate = new Date(log.date);
    const now = new Date();
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const totalVolume = workoutLogs?.reduce((sum, log) => 
    sum + log.totalVolume, 0
  ) || 0;
  const displayTotalVolume = convertWeight(totalVolume).toFixed(getUnitLabel() === "kg" ? 1 : 0);

  const currentWeight = bodyStats?.[0]?.weight ? convertWeight(bodyStats[0].weight).toFixed(1) : null;
  
  const recentWorkouts = workoutLogs?.slice(0, 3) || [];

  const isLoading = logsLoading || statsLoading;

  return (
    <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
      {/* Hero Section with Ultra Glass */}
      <div className="glass-hero mb-12">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "var(--gradient-mesh-bg)" }}></div>
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 text-gradient" data-testid="text-page-title">Dashboard</h1>
          <p className="text-lg text-muted-foreground">Track your fitness journey with precision</p>
        </div>
      </div>

      {/* Stats Grid - Liquid Glass */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card data-testid="card-stat-workouts" className="glass-card-lg glass-hover">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">This Month</CardTitle>
            <div className="glass-icon w-10 h-10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoading ? (
              <Skeleton className="h-12 w-20 shimmer" />
            ) : (
              <>
                <div className="text-5xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent" data-testid="text-stat-workouts">{thisMonthWorkouts}</div>
                <p className="text-xs text-muted-foreground mt-3 uppercase tracking-widest font-semibold">Workouts</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-volume" className="glass-card-lg glass-hover">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Volume</CardTitle>
            <div className="glass-icon w-10 h-10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoading ? (
              <Skeleton className="h-12 w-24 shimmer" />
            ) : (
              <>
                <div className="text-5xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary" data-testid="text-stat-volume">{displayTotalVolume}</div>
                <p className="text-xs text-muted-foreground mt-3 uppercase tracking-widest font-semibold">{getUnitLabel()} lifted</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-streak" className="glass-card-lg glass-hover">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Streak</CardTitle>
            <div className="glass-icon w-10 h-10">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoading ? (
              <Skeleton className="h-12 w-16 shimmer" />
            ) : (
              <>
                <div className="text-5xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary" data-testid="text-stat-streak">0</div>
                <p className="text-xs text-muted-foreground mt-3 uppercase tracking-widest font-semibold">Days</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-weight" className="glass-card-lg glass-hover">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Body Weight</CardTitle>
            <div className="glass-icon w-10 h-10">
              <Trophy className="w-5 h-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoading ? (
              <Skeleton className="h-12 w-20" />
            ) : currentWeight ? (
              <>
                <div className="text-5xl font-bold font-mono text-emerald-500" data-testid="text-stat-weight">{currentWeight}</div>
                <p className="text-xs text-muted-foreground mt-3 uppercase tracking-widest font-semibold">{getUnitLabel()}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 tracking-tight">Recent Workouts</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-40 mb-2 shimmer" />
                  <Skeleton className="h-4 w-56 shimmer" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentWorkouts.length === 0 ? (
          <Card className="glass-card-lg">
            <CardContent className="p-12 text-center">
              <div className="glass-icon w-20 h-20 mx-auto mb-4">
                <Dumbbell className="w-10 h-10 text-primary/60" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">No workouts yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start your first workout to see it here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((log) => (
              <Card key={log.id} className="glass-card glass-hover" data-testid={`card-workout-log-${log.id}`}>
                <CardContent className="p-5 relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold truncate" data-testid="text-workout-name">{log.routineName}</h3>
                        <Badge variant="secondary" className="shrink-0" data-testid={`badge-day-${log.id}`}>
                          {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {new Date(log.date).toLocaleDateString()} • {Math.floor(log.duration / 60)} min • {formatWeight(log.totalVolume)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="glass-stat text-right">
                        <p className="text-lg font-bold font-mono text-primary">{log.exercises.length}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">exercises</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="glass-button"
                        onClick={() => setDeleteLogId(log.id)}
                        data-testid={`button-delete-workout-${log.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive/70 hover:text-destructive transition-colors" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteLogId !== null} onOpenChange={(open) => !open && setDeleteLogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout log? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLogId && deleteWorkoutMutation.mutate(deleteLogId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
