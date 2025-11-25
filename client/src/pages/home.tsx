import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Dumbbell, Flame, TrendingUp, Trophy } from "lucide-react";
import { WorkoutLog, BodyStats } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnitSystem } from "@/hooks/use-unit-system";

export default function Home() {
  const { getUnitLabel, convertWeight } = useUnitSystem();

  const { data: workoutLogs, isLoading: logsLoading } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workout-logs"],
  });

  const { data: bodyStats, isLoading: statsLoading } = useQuery<BodyStats[]>({
    queryKey: ["/api/body-stats"],
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

    </div>
  );
}
