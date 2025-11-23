import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Exercise, WorkoutLog } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Calendar as CalendarIcon } from "lucide-react";

export default function Progress() {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [timeRange, setTimeRange] = useState("3M");

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: workoutLogs = [], isLoading: logsLoading } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workout-logs"],
  });

  const isLoading = exercisesLoading || logsLoading;

  // Get workout data for chart
  const chartData = workoutLogs.slice(0, 10).reverse().map((log, idx) => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: log.totalVolume,
    workout: idx + 1,
  }));

  const totalWorkouts = workoutLogs.length;
  const totalVolume = workoutLogs.reduce((sum, log) => sum + log.totalVolume, 0).toFixed(0);

  return (
    <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground" data-testid="text-page-title">Progress</h1>
        <p className="text-base text-muted-foreground">Track your fitness journey</p>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="w-full bg-card border border-card-border">
          <TabsTrigger value="overview" className="flex-1" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="exercises" className="flex-1" data-testid="tab-exercises">Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card data-testid="card-total-workouts" className="bg-card border border-card-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-12 w-20 bg-card border border-card-border" />
                ) : (
                  <div className="text-4xl font-bold font-mono text-foreground" data-testid="text-total-workouts">{totalWorkouts}</div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-total-volume" className="bg-card border border-card-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-12 w-24 bg-card border border-card-border" />
                ) : (
                  <>
                    <div className="text-4xl font-bold font-mono text-foreground" data-testid="text-total-volume">{totalVolume}</div>
                    <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">lbs</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Volume Chart */}
          <Card className="bg-card border border-card-border">
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

          {/* Calendar Heatmap Placeholder */}
          <Card className="bg-card border border-card-border">
            <CardHeader>
              <CardTitle className="text-base">Workout Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Calendar view coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6 mt-6">
          <Card className="bg-card border border-card-border">
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
                    weight: workout.weight,
                    volume: workout.volume,
                  }));

                return (
                  <div className="mt-6 space-y-6">
                    {/* Personal Records */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Personal Records</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-md border" data-testid="pr-max-weight">
                          <div>
                            <p className="text-sm text-muted-foreground">Best Weight</p>
                            <p className="text-2xl font-bold font-mono">{maxWeight} lbs</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{exerciseSets.find(s => s.weight === maxWeight)?.reps} reps</Badge>
                            {maxWeightDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {maxWeightDate.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-md border" data-testid="pr-max-reps">
                          <div>
                            <p className="text-sm text-muted-foreground">Best Reps</p>
                            <p className="text-2xl font-bold font-mono">{maxReps} reps</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{exerciseSets.find(s => s.reps === maxReps)?.weight} lbs</Badge>
                            {maxRepsDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {maxRepsDate.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-md border" data-testid="pr-max-volume">
                          <div>
                            <p className="text-sm text-muted-foreground">Best Volume (Single Set)</p>
                            <p className="text-2xl font-bold font-mono">{maxVolume} lbs</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">
                              {bestWeightSet?.weight} lbs × {bestWeightSet?.reps}
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
                              name="Weight (lbs)"
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
