import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Home() {
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
  ).toFixed(0) || "0";

  const currentWeight = bodyStats?.[0]?.weight ? bodyStats[0].weight.toFixed(1) : null;
  
  const recentWorkouts = workoutLogs?.slice(0, 5) || [];

  const isLoading = logsLoading || statsLoading;

  return (
    <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-text" data-testid="text-page-title">Dashboard</h1>
        <p className="text-base text-foreground/70">Track your fitness journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card data-testid="card-stat-workouts" className="glass-surface-elevated hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="w-5 h-5 text-primary/60" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20 glass-surface" />
            ) : (
              <>
                <div className="text-4xl font-bold font-mono gradient-text" data-testid="text-stat-workouts">{thisMonthWorkouts}</div>
                <p className="text-xs text-foreground/60 mt-2 uppercase tracking-wide">Workouts</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-volume" className="glass-surface-elevated hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="w-5 h-5 text-primary/60" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-24 glass-surface" />
            ) : (
              <>
                <div className="text-4xl font-bold font-mono gradient-text" data-testid="text-stat-volume">{totalVolume}</div>
                <p className="text-xs text-foreground/60 mt-2 uppercase tracking-wide">lbs lifted</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-streak" className="glass-surface-elevated hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="w-5 h-5 text-amber-400/80" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-16 glass-surface" />
            ) : (
              <>
                <div className="text-4xl font-bold font-mono gradient-text" data-testid="text-stat-streak">0</div>
                <p className="text-xs text-foreground/60 mt-2 uppercase tracking-wide">Days</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-weight" className="glass-surface-elevated hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Weight</CardTitle>
            <Trophy className="w-5 h-5 text-emerald-400/80" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20 glass-surface" />
            ) : currentWeight ? (
              <>
                <div className="text-4xl font-bold font-mono gradient-text" data-testid="text-stat-weight">{currentWeight}</div>
                <p className="text-xs text-foreground/60 mt-2 uppercase tracking-wide">lbs</p>
              </>
            ) : (
              <p className="text-sm text-foreground/50">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Recent Workouts</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-surface">
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-56" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentWorkouts.length === 0 ? (
          <Card className="glass-surface">
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-primary/40" />
              <p className="text-foreground/70 text-lg font-medium">No workouts yet</p>
              <p className="text-sm text-foreground/50 mt-2">Start your first workout to see it here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((log) => (
              <Card key={log.id} className="glass-surface hover:scale-[1.01] transition-all" data-testid={`card-workout-log-${log.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate mb-1" data-testid="text-workout-name">{log.routineName}</h3>
                      <p className="text-sm text-foreground/60">
                        {new Date(log.date).toLocaleDateString()} • {Math.floor(log.duration / 60)} min • {log.totalVolume.toFixed(0)} lbs
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right glass-surface px-3 py-2 rounded-lg">
                        <p className="text-lg font-bold font-mono gradient-text">{log.exercises.length}</p>
                        <p className="text-xs text-foreground/60 uppercase tracking-wide">exercises</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteLogId(log.id)}
                        data-testid={`button-delete-workout-${log.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
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
        <AlertDialogContent className="glass-surface-elevated">
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
