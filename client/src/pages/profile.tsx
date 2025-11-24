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
import { useUnitSystem } from "@/hooks/use-unit-system";

export default function Profile() {
  const { formatWeight, getUnitLabel, convertWeight, convertToLbs } = useUnitSystem();
  const [showAddStats, setShowAddStats] = useState(false);
  const { toast } = useToast();

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
    // Convert weight from user's unit to lbs for storage
    const dataToSubmit = {
      ...data,
      weight: data.weight ? convertToLbs(data.weight) : null,
    };
    addStatsMutation.mutate(dataToSubmit);
  });

  const currentStats = bodyStats[0];
  const chartData = bodyStats.slice(0, 20).reverse().map(stat => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: convertWeight(stat.weight || 0),
    bodyFat: stat.bodyFat,
  }));

  return (
    <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative mb-12 mx-4 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "var(--gradient-mesh-bg)" }}></div>
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 text-gradient">Body Stats</h1>
          <p className="text-lg text-muted-foreground">Monitor your body composition</p>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-2 text-gradient" data-testid="text-page-title">Profile</h1>
        <p className="text-base text-muted-foreground">Track your body stats and measurements</p>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card data-testid="card-current-weight" className="glass-card glass-hover">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Weight className="w-5 h-5 text-primary/60" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-24 bg-card border border-card-border" />
            ) : currentStats?.weight ? (
              <>
                <div className="text-4xl font-bold font-mono text-foreground" data-testid="text-current-weight">
                  {convertWeight(currentStats.weight).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">{getUnitLabel()}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-current-bodyfat" className="glass-card glass-hover">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
            <TrendingDown className="w-5 h-5 text-emerald-400/80" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20 bg-card border border-card-border" />
            ) : currentStats?.bodyFat ? (
              <>
                <div className="text-4xl font-bold font-mono text-foreground" data-testid="text-current-bodyfat">
                  {currentStats.bodyFat.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">%</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Stats Form */}
      <Card className="mb-6 bg-card border border-card-border">
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
                        <FormLabel>Weight ({getUnitLabel()})</FormLabel>
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
      <Card className="glass-card glass-hover">
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
                  name={`Weight (${getUnitLabel()})`}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
