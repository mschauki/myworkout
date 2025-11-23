import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, ArrowLeft } from "lucide-react";
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

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setUnitSystem(settings.unitSystem);
      setFirstDayOfWeek(String(settings.firstDayOfWeek));
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: { unitSystem: string; firstDayOfWeek: number }) => {
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
