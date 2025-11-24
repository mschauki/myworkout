import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Exercise, WorkoutLog, Settings } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useUnitSystem } from "@/hooks/use-unit-system";

export default function Progress() {
  const { formatWeight, getUnitLabel, convertWeight } = useUnitSystem();
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [timeRange, setTimeRange] = useState("3M");
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: workoutLogs = [], isLoading: logsLoading } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workout-logs"],
  });

  const { data: settings, refetch: refetchSettings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    staleTime: 0,
    gcTime: 0,
  });

  // Refetch settings on mount and when component visibility changes
  useEffect(() => {
    refetchSettings();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetchSettings();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refetchSettings]);

  const isLoading = exercisesLoading || logsLoading;

  // Get workout data for chart
  const chartData = workoutLogs.slice(0, 10).reverse().map((log, idx) => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: convertWeight(log.totalVolume),
    workout: idx + 1,
  }));

  const totalWorkouts = workoutLogs.length;
  const totalVolume = workoutLogs.reduce((sum, log) => sum + log.totalVolume, 0);
  const displayTotalVolume = convertWeight(totalVolume).toFixed(getUnitLabel() === "kg" ? 1 : 0);

  return (
    <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
      {/* Page Header with Gradient */}
      <div className="mb-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent" data-testid="text-page-title">
          Progress
        </h1>
        <p className="text-muted-foreground text-lg">Track your fitness journey</p>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="w-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-blue-200/30 dark:border-blue-500/30 p-1">
          <TabsTrigger 
            value="overview" 
            className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30" 
            data-testid="tab-overview"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30" 
            data-testid="tab-calendar"
          >
            Calendar
          </TabsTrigger>
          <TabsTrigger 
            value="exercises" 
            className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30" 
            data-testid="tab-exercises"
          >
            Exercises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Glass Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card data-testid="card-total-workouts" className="relative overflow-visible bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-blue-200/30 dark:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-lg"></div>
              <CardHeader className="pb-3 pl-5">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Workouts</CardTitle>
              </CardHeader>
              <CardContent className="pl-5">
                {isLoading ? (
                  <Skeleton className="h-12 w-20 bg-white/30 dark:bg-gray-900/30" />
                ) : (
                  <div className="text-5xl font-bold font-mono bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent" data-testid="text-total-workouts">
                    {totalWorkouts}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-total-volume" className="relative overflow-visible bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-orange-200/30 dark:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 to-orange-600 rounded-l-lg"></div>
              <CardHeader className="pb-3 pl-5">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Volume</CardTitle>
              </CardHeader>
              <CardContent className="pl-5">
                {isLoading ? (
                  <Skeleton className="h-12 w-24 bg-white/30 dark:bg-gray-900/30" />
                ) : (
                  <>
                    <div className="text-5xl font-bold font-mono bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent" data-testid="text-total-volume">
                      {displayTotalVolume}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">{getUnitLabel()}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Glass Chart Container */}
          <Card className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-blue-200/30 dark:border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">Volume Progression</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[90px] h-8 text-sm" data-testid="select-time-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1M">1M</SelectItem>
                    <SelectItem value="3M">3M</SelectItem>
                    <SelectItem value="6M">6M</SelectItem>
                    <SelectItem value="1Y">1Y</SelectItem>
                    <SelectItem value="All">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No workout data yet</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--popover-border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6 mt-6">
          <Card className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-blue-200/30 dark:border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-base">Workout Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex justify-center w-full">
                    <DayPicker
                      mode="single"
                      selected={selectedCalendarDay}
                      onSelect={setSelectedCalendarDay}
                      weekStartsOn={settings?.firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 || 0}
                    />
                  </div>
                  <div className="flex flex-col gap-2 text-sm w-full">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-primary rounded-sm"></div>
                      <span className="text-muted-foreground">Day with completed workout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 border border-input rounded-sm"></div>
                      <span className="text-muted-foreground">No workout available</span>
                    </div>
                  </div>
                  {selectedCalendarDay && (() => {
                    const dayString = selectedCalendarDay.toDateString();
                    const dayWorkouts = workoutLogs
                      .filter(log => new Date(log.date).toDateString() === dayString)
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    
                    if (dayWorkouts.length === 0) {
                      return (
                        <div className="w-full pt-4 border-t border-border">
                          <p className="text-sm font-medium text-foreground mb-3">
                            {selectedCalendarDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-sm text-muted-foreground">No workouts on this day</p>
                        </div>
                      );
                    }

                    return (
                      <div className="w-full pt-4 border-t border-border">
                        <p className="text-sm font-medium text-foreground mb-3">
                          {selectedCalendarDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <div className="space-y-2">
                          {dayWorkouts.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 bg-background rounded-md border border-input">
                              <div>
                                <p className="text-sm font-medium text-foreground">{log.routineName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(log.date).toLocaleTimeString('en-US', { 
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="secondary">{log.duration} min</Badge>
                                <p className="text-xs text-muted-foreground mt-1">{formatWeight(log.totalVolume)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6 mt-6">
          <Card className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-blue-200/30 dark:border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-base">Exercise Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger data-testid="select-exercise">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedExercise && (() => {
                // Calculate PRs for selected exercise from workout logs
                const exerciseSets: { weight: number; reps: number; volume: number; date: Date }[] = [];
                
                workoutLogs.forEach(log => {
                  log.exercises.forEach(ex => {
                    if (ex.exerciseId === selectedExercise) {
                      ex.sets.forEach(set => {
                        if (set.completed) {
                          exerciseSets.push({
                            weight: set.weight,
                            reps: set.reps,
                            volume: set.weight * set.reps,
                            date: new Date(log.date)
                          });
                        }
                      });
                    }
                  });
                });

                const selectedExerciseName = exercises.find(e => e.id === selectedExercise)?.name || "";

                if (exerciseSets.length === 0) {
                  return (
                    <div className="mt-6 h-64 flex items-center justify-center text-muted-foreground">
                      <p>No workout data for this exercise yet</p>
                    </div>
                  );
                }

                // Calculate personal records
                const maxWeight = Math.max(...exerciseSets.map(s => s.weight));
                const maxReps = Math.max(...exerciseSets.map(s => s.reps));
                
                // Best volume is the volume from the set with the best (heaviest) weight
                const bestWeightSet = exerciseSets.find(s => s.weight === maxWeight);
                const maxVolume = bestWeightSet ? bestWeightSet.volume : 0;
                
                // Get dates when PRs were achieved
                const maxWeightDate = bestWeightSet?.date;
                const maxRepsDate = exerciseSets.find(s => s.reps === maxReps)?.date;
                const maxVolumeDate = bestWeightSet?.date;

                // Prepare chart data (last 10 workouts with this exercise)
                // Group sets by workout date and take the max weight per workout
                const workoutsByDate = new Map<string, { weight: number; volume: number; date: Date }>();
                exerciseSets.forEach(set => {
                  const dateKey = set.date.toDateString();
                  const existing = workoutsByDate.get(dateKey);
                  if (!existing || set.weight > existing.weight) {
                    workoutsByDate.set(dateKey, set);
                  }
                });
                
                const exerciseHistory = Array.from(workoutsByDate.values())
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .slice(0, 10)
                  .reverse()
                  .map((workout, idx) => ({
                    workout: idx + 1,
                    date: workout.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    weight: convertWeight(workout.weight),
                    volume: convertWeight(workout.volume),
                  }));

                return (
                  <div className="mt-6 space-y-6">
                    {/* Personal Records */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Personal Records</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border border-blue-200/30 dark:border-blue-500/30" data-testid="pr-max-weight">
                          <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wide">Best Weight</p>
                            <p className="text-3xl font-bold font-mono bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{formatWeight(maxWeight)}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="bg-blue-500/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-500/30 text-blue-700 dark:text-blue-300">
                              {exerciseSets.find(s => s.weight === maxWeight)?.reps} reps
                            </Badge>
                            {maxWeightDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {maxWeightDate.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border border-orange-200/30 dark:border-orange-500/30" data-testid="pr-max-reps">
                          <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wide">Best Reps</p>
                            <p className="text-3xl font-bold font-mono bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">{maxReps} reps</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="bg-orange-500/20 backdrop-blur-sm border border-orange-200/30 dark:border-orange-500/30 text-orange-700 dark:text-orange-300">
                              {formatWeight(exerciseSets.find(s => s.reps === maxReps)?.weight || 0)}
                            </Badge>
                            {maxRepsDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {maxRepsDate.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border border-emerald-200/30 dark:border-emerald-500/30" data-testid="pr-max-volume">
                          <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wide">Best Volume (Single Set)</p>
                            <p className="text-3xl font-bold font-mono bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{formatWeight(maxVolume)}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="bg-emerald-500/20 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                              {formatWeight(bestWeightSet?.weight || 0, { includeUnit: false })} {getUnitLabel()} × {bestWeightSet?.reps}
                            </Badge>
                            {maxVolumeDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {maxVolumeDate.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Chart */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Weight Progress</h3>
                      {exerciseHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={exerciseHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="date" 
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <YAxis 
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--popover-border))",
                                borderRadius: "6px",
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="weight" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              dot={{ fill: "hsl(var(--primary))", r: 4 }}
                              name={`Weight (${getUnitLabel()})`}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                          <p>Not enough data to display chart</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
