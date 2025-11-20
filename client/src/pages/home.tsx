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
        <h1 className="text-5xl font-black mb-2 gradient-text tracking-tight uppercase" data-testid="text-page-title">Dashboard</h1>
        <p className="text-base text-muted-foreground">Track your fitness journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card data-testid="card-stat-workouts" className="athletic-card hover:scale-[1.02] transition-transform relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">This Month</CardTitle>
            <Calendar className="w-6 h-6 text-primary" />
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <Skeleton className="h-14 w-20 bg-muted" />
            ) : (
              <>
                <div className="text-5xl font-black font-mono gradient-text" data-testid="text-stat-workouts">{thisMonthWorkouts}</div>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-semibold">Workouts</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-volume" className="athletic-card hover:scale-[1.02] transition-transform relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Total Volume</CardTitle>
            <TrendingUp className="w-6 h-6 text-accent" />
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <Skeleton className="h-14 w-24 bg-muted" />
            ) : (
              <>
                <div className="text-5xl font-black font-mono gradient-text" data-testid="text-stat-volume">{totalVolume}</div>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-semibold">lbs lifted</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-streak" className="athletic-card hover:scale-[1.02] transition-transform relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-4/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Streak</CardTitle>
            <Flame className="w-6 h-6 text-chart-4" />
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <Skeleton className="h-14 w-16 bg-muted" />
            ) : (
              <>
                <div className="text-5xl font-black font-mono gradient-text" data-testid="text-stat-streak">0</div>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-semibold">Days</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-weight" className="athletic-card hover:scale-[1.02] transition-transform relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-3/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Body Weight</CardTitle>
            <Trophy className="w-6 h-6 text-chart-3" />
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <Skeleton className="h-14 w-20 bg-muted" />
            ) : currentWeight ? (
              <>
                <div className="text-5xl font-black font-mono gradient-text" data-testid="text-stat-weight">{currentWeight}</div>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-semibold">lbs</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-6 uppercase tracking-tight gradient-text">Recent Workouts</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="athletic-card">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-40 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-56 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentWorkouts.length === 0 ? (
          <Card className="athletic-card">
            <CardContent className="p-16 text-center">
              <Dumbbell className="w-20 h-20 mx-auto mb-6 text-primary" />
              <p className="text-foreground text-xl font-bold mb-2">No workouts yet</p>
              <p className="text-sm text-muted-foreground">Start your first workout to see it here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((log) => (
              <Card key={log.id} className="athletic-card hover:scale-[1.01] transition-all relative overflow-hidden" data-testid={`card-workout-log-${log.id}`}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
                <CardContent className="p-6 pl-8">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold truncate mb-2" data-testid="text-workout-name">{log.routineName}</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {new Date(log.date).toLocaleDateString()} • {Math.floor(log.duration / 60)} min • {log.totalVolume.toFixed(0)} lbs
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right bg-muted/30 px-4 py-3 rounded-lg border border-card-border">
                        <p className="text-2xl font-black font-mono gradient-text">{log.exercises.length}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">exercises</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteLogId(log.id)}
                        data-testid={`button-delete-workout-${log.id}`}
                      >
                        <Trash2 className="w-5 h-5 text-destructive" />
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
        <AlertDialogContent className="athletic-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Delete Workout</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this workout log? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLogId && deleteWorkoutMutation.mutate(deleteLogId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
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
