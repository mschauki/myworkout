import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Settings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [unitSystem, setUnitSystem] = useState<string>("lbs");
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<string>("0");
  const [autoStartTimer, setAutoStartTimer] = useState<boolean>(false);
  const [restTimerSound, setRestTimerSound] = useState<boolean>(true);
  const [defaultRestDuration, setDefaultRestDuration] = useState<string>("90");
  const [workoutHistoryRetention, setWorkoutHistoryRetention] = useState<string>("-1");

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setUnitSystem(settings.unitSystem);
      setFirstDayOfWeek(String(settings.firstDayOfWeek));
      setAutoStartTimer(settings.autoStartTimer);
      setRestTimerSound(settings.restTimerSound);
      setDefaultRestDuration(String(settings.defaultRestDuration));
      setWorkoutHistoryRetention(String(settings.workoutHistoryRetentionDays));
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      return apiRequest("POST", "/api/settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = async () => {
    updateSettingsMutation.mutate({
      unitSystem,
      firstDayOfWeek: parseInt(firstDayOfWeek),
      autoStartTimer,
      restTimerSound,
      defaultRestDuration: parseInt(defaultRestDuration),
      workoutHistoryRetentionDays: parseInt(workoutHistoryRetention),
    });
  };

  const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="pb-24 px-4 pt-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          data-testid="button-back"
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-foreground" data-testid="text-page-title">
            Settings
          </h1>
          <p className="text-base text-muted-foreground">Customize your preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Unit System Setting */}
        <Card className="bg-card border border-card-border">
          <CardHeader>
            <CardTitle className="text-base">Measurement Unit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose your preferred unit system for weight and volume measurements.
            </p>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={unitSystem} onValueChange={setUnitSystem}>
                <SelectTrigger data-testid="select-unit-system">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              {unitSystem === "lbs"
                ? "Using pounds for weight and volume calculations"
                : "Using kilograms for weight and volume calculations"}
            </p>
          </CardContent>
        </Card>

        {/* Calendar Setting */}
        <Card className="bg-card border border-card-border">
          <CardHeader>
            <CardTitle className="text-base">Calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set the first day of the week for the calendar view.
            </p>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={firstDayOfWeek} onValueChange={setFirstDayOfWeek}>
                <SelectTrigger data-testid="select-first-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayLabels.map((day, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              Calendar weeks will start on {dayLabels[parseInt(firstDayOfWeek)]}
            </p>
          </CardContent>
        </Card>

        {/* Workout Timer Settings */}
        <Card className="bg-card border border-card-border">
          <CardHeader>
            <CardTitle className="text-base">Workout Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">Auto-start Timer</Label>
                  <p className="text-xs text-muted-foreground">Automatically start rest timer between sets</p>
                </div>
                <button
                  onClick={() => setAutoStartTimer(!autoStartTimer)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    autoStartTimer ? "bg-primary" : "bg-input"
                  }`}
                  data-testid="toggle-auto-start-timer"
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-background transition-transform ${
                      autoStartTimer ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">Timer Sound</Label>
                  <p className="text-xs text-muted-foreground">Play sound when rest period ends</p>
                </div>
                <button
                  onClick={() => setRestTimerSound(!restTimerSound)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    restTimerSound ? "bg-primary" : "bg-input"
                  }`}
                  data-testid="toggle-rest-timer-sound"
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-background transition-transform ${
                      restTimerSound ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 border-t border-border">
                <Label className="text-sm font-medium text-foreground mb-2 block">Default Rest Duration</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[60, 90, 120].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setDefaultRestDuration(String(duration))}
                      className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        defaultRestDuration === String(duration)
                          ? "bg-primary text-primary-foreground"
                          : "bg-input text-foreground hover-elevate"
                      }`}
                      data-testid={`button-rest-duration-${duration}`}
                    >
                      {duration}s
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Default rest time between sets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-card border border-card-border">
          <CardHeader>
            <CardTitle className="text-base">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure how long to keep your workout history.
            </p>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={workoutHistoryRetention} onValueChange={setWorkoutHistoryRetention}>
                <SelectTrigger data-testid="select-history-retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1">Keep Forever (Unlimited)</SelectItem>
                  <SelectItem value="90">3 Months</SelectItem>
                  <SelectItem value="180">6 Months</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              {workoutHistoryRetention === "-1"
                ? "All workout history will be preserved"
                : `Workouts older than ${parseInt(workoutHistoryRetention)} days may be archived`}
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            data-testid="button-save-settings"
            className="flex-1"
          >
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {/* About Section */}
        <Card className="bg-card border border-card-border">
          <CardHeader>
            <CardTitle className="text-sm">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              These settings apply to your entire fitness tracking experience. Changes are saved automatically to your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
