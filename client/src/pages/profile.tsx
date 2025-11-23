import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Weight, TrendingDown, Plus } from "lucide-react";
import { BodyStats, insertBodyStatsSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

export default function Profile() {
  const [showAddStats, setShowAddStats] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { data: bodyStats = [], isLoading } = useQuery<BodyStats[]>({
    queryKey: ["/api/body-stats"],
  });

  const form = useForm({
    resolver: zodResolver(insertBodyStatsSchema),
    defaultValues: {
      date: new Date().toISOString(),
      weight: null,
      bodyFat: null,
      measurements: undefined,
    },
  });

  const addStatsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/body-stats", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/body-stats"] });
      toast({ title: "Body stats added successfully" });
      form.reset();
      setShowAddStats(false);
    },
    onError: () => {
      toast({ title: "Failed to add body stats", variant: "destructive" });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    addStatsMutation.mutate(data);
  });

  const currentStats = bodyStats[0];
  const chartData = bodyStats.slice(0, 20).reverse().map(stat => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: stat.weight,
    bodyFat: stat.bodyFat,
  }));

  return (
    <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground" data-testid="text-page-title">Profile</h1>
        <p className="text-base text-muted-foreground">Track your body stats and measurements</p>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card data-testid="card-current-weight">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Weight</CardTitle>
            <Weight className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : currentStats?.weight ? (
              <>
                <div className="text-4xl font-bold text-primary" data-testid="text-current-weight">
                  {currentStats.weight.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">lbs</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-current-bodyfat">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Body Fat</CardTitle>
            <TrendingDown className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20" />
            ) : currentStats?.bodyFat ? (
              <>
                <div className="text-4xl font-bold text-primary" data-testid="text-current-bodyfat">
                  {currentStats.bodyFat.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">%</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Stats Form */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Body Measurements</CardTitle>
          <Button
            size="sm"
            variant={showAddStats ? "secondary" : "default"}
            onClick={() => setShowAddStats(!showAddStats)}
            data-testid="button-toggle-add-stats"
          >
            {showAddStats ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add</>}
          </Button>
        </CardHeader>
        {showAddStats && (
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="185.5"
                            {...field}
                            value={field.value ?? ""}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            data-testid="input-weight"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bodyFat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Fat (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="15.0"
                            {...field}
                            value={field.value ?? ""}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            data-testid="input-bodyfat"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={addStatsMutation.isPending}
                  data-testid="button-submit-stats"
                >
                  {addStatsMutation.isPending ? "Saving..." : "Save Measurements"}
                </Button>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>

      {/* Weight Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No body stats yet</p>
                <p className="text-sm mt-1">Add your first measurement to track progress</p>
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
                  domain={['dataMin - 5', 'dataMax + 5']}
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
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Appearance</Label>
              <p className="text-sm text-muted-foreground">
                {theme === "dark" ? "Dark" : "Light"} mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
