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
  
  const recentWorkouts = workoutLogs?.slice(0, 5) || [];

  const isLoading = logsLoading || statsLoading;

  return (
    <div className="pb-24">
      {/* Hero Section with Full-Bleed Image */}
      <div className="relative h-[50vh] min-h-[400px] -mt-4 mb-12 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-orange-500"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent"></div>
        
        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <Dumbbell className="w-16 h-16 mx-auto text-white drop-shadow-lg animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-white drop-shadow-2xl tracking-tight" data-testid="text-page-title">
            Your Fitness<br/>
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Journey Starts Here</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium max-w-2xl drop-shadow-lg">
            Track workouts. Crush goals. Build strength.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-2xl shadow-orange-500/50 text-lg px-8 border-0">
              <Flame className="w-5 h-5 mr-2" />
              Start Workout
            </Button>
            <Button size="lg" variant="outline" className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 shadow-xl text-lg px-8">
              <Trophy className="w-5 h-5 mr-2" />
              View Progress
            </Button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 max-w-6xl mx-auto">
        {/* Stats Grid - Dynamic & Bold */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 tracking-tight">Your Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* This Month Workouts - Blue Theme */}
          <Card data-testid="card-stat-workouts" className="relative overflow-visible border border-blue-200/30 dark:border-blue-500/30 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-lg"></div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">This Month</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Workouts</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-16 w-24" />
              ) : (
                <div className="text-6xl md:text-7xl font-black font-mono bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent" data-testid="text-stat-workouts">
                  {thisMonthWorkouts}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Volume - Orange Theme */}
          <Card data-testid="card-stat-volume" className="relative overflow-visible border border-orange-200/30 dark:border-orange-500/30 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 to-orange-600 rounded-l-lg"></div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">Total Volume</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{getUnitLabel()} Lifted</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-16 w-32" />
              ) : (
                <div className="text-6xl md:text-7xl font-black font-mono bg-gradient-to-br from-orange-600 to-orange-800 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent" data-testid="text-stat-volume">
                  {displayTotalVolume}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streak - Amber Theme */}
          <Card data-testid="card-stat-streak" className="relative overflow-visible border border-amber-200/30 dark:border-amber-500/30 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-500 to-amber-600 rounded-l-lg"></div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Current Streak</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Days Active</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400 animate-pulse" />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-16 w-20" />
              ) : (
                <div className="text-6xl md:text-7xl font-black font-mono bg-gradient-to-br from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent" data-testid="text-stat-streak">
                  0
                </div>
              )}
            </CardContent>
          </Card>

          {/* Body Weight - Emerald Theme */}
          <Card data-testid="card-stat-weight" className="relative overflow-visible border border-emerald-200/30 dark:border-emerald-500/30 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-l-lg"></div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Body Weight</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Current {getUnitLabel()}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-16 w-24" />
              ) : currentWeight ? (
                <div className="text-6xl md:text-7xl font-black font-mono bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent" data-testid="text-stat-weight">
                  {currentWeight}
                </div>
              ) : (
                <p className="text-lg text-muted-foreground font-medium">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 tracking-tight">Recent Workouts</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-56" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentWorkouts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-primary/40" />
              <p className="text-muted-foreground text-lg font-medium">No workouts yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start your first workout to see it here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((log) => (
              <Card key={log.id} className="hover-elevate transition-all group relative overflow-hidden" data-testid={`card-workout-log-${log.id}`}>
                <CardContent className="p-5 relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold truncate mb-2" data-testid="text-workout-name">{log.routineName}</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {new Date(log.date).toLocaleDateString()} • {Math.floor(log.duration / 60)} min • {formatWeight(log.totalVolume)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right bg-card border border-card-border px-3 py-2 rounded-lg">
                        <p className="text-lg font-bold font-mono text-primary">{log.exercises.length}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">exercises</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
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
