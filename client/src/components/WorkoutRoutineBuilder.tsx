import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Exercise } from "@shared/schema";
import { Plus, X, Dumbbell, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const ALL_DAYS = [...WEEKDAYS, "any"];

interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  days: string[];
  restPeriod?: number;
  setsConfig?: Array<{
    reps: number;
    restPeriod: number;
  }>;
}

interface WorkoutRoutineBuilderProps {
  onComplete: () => void;
}

export function WorkoutRoutineBuilder({ onComplete }: WorkoutRoutineBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentDay, setCurrentDay] = useState<string>("monday");
  const [exercisesByDay, setExercisesByDay] = useState<Record<string, RoutineExercise[]>>({});
  const [dayTitles, setDayTitles] = useState<Record<string, string>>({});
  
  // Exercise configuration state
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [sets, setSets] = useState("3");
  const [perSetConfig, setPerSetConfig] = useState<Array<{ reps: string; restPeriod: string }>>([
    { reps: "10", restPeriod: "90" },
    { reps: "10", restPeriod: "90" },
    { reps: "10", restPeriod: "90" }
  ]);

  // Custom exercise creation state
  const [isCustomExerciseDialogOpen, setIsCustomExerciseDialogOpen] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [customMuscleGroup, setCustomMuscleGroup] = useState("");
  const [customEquipment, setCustomEquipment] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const { toast } = useToast();

  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const createRoutineMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/workout-routines", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-routines"] });
      toast({ title: "Workout routine created successfully" });
      onComplete();
    },
    onError: () => {
      toast({ title: "Failed to create routine", variant: "destructive" });
    },
  });

  const createCustomExerciseMutation = useMutation<Exercise, Error, any>({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/exercises", data);
      const created = await response.json() as Exercise;
      if (!created.id) {
        throw new Error("Failed to create exercise: missing ID");
      }
      return created;
    },
    onSuccess: (newExercise: Exercise) => {
      // Optimistically add the new exercise to the cache immediately
      // De-duplicate by ID to prevent duplicate entries from retries or double-submits
      queryClient.setQueryData<Exercise[]>(["/api/exercises"], (oldData) => {
        if (!oldData) return [newExercise];
        const exists = oldData.some(ex => ex.id === newExercise.id);
        return exists ? oldData : [...oldData, newExercise];
      });
      
      // Also invalidate to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      
      toast({ title: "Custom exercise created successfully" });
      setSelectedExerciseId(newExercise.id);
      setIsCustomExerciseDialogOpen(false);
      
      // Reset form
      setCustomExerciseName("");
      setCustomMuscleGroup("");
      setCustomEquipment("");
      setCustomDescription("");
    },
    onError: () => {
      toast({ title: "Failed to create exercise", variant: "destructive" });
    },
  });

  const updateSetCount = (newCount: number) => {
    const count = Math.max(1, Math.min(10, newCount));
    setSets(String(count));
    
    const currentConfig = [...perSetConfig];
    if (count > currentConfig.length) {
      const lastSet = currentConfig[currentConfig.length - 1] || { reps: "10", restPeriod: "90" };
      while (currentConfig.length < count) {
        currentConfig.push({ ...lastSet });
      }
    } else {
      currentConfig.splice(count);
    }
    setPerSetConfig(currentConfig);
  };

  const updatePerSet = (index: number, field: 'reps' | 'restPeriod', value: string) => {
    const updated = [...perSetConfig];
    updated[index] = { ...updated[index], [field]: value };
    setPerSetConfig(updated);
  };

  const addExerciseToDay = () => {
    if (!selectedExerciseId) return;
    
    const setsConfig = perSetConfig.map(set => ({
      reps: parseInt(set.reps || "10") || 10,
      restPeriod: Math.max(30, Math.min(300, parseInt(set.restPeriod || "90") || 90)),
    }));
    
    const exerciseData: RoutineExercise = {
      exerciseId: selectedExerciseId,
      sets: setsConfig.length,
      reps: setsConfig[0]?.reps || 10,
      days: [currentDay],
      setsConfig,
    };
    
    setExercisesByDay(prev => ({
      ...prev,
      [currentDay]: [...(prev[currentDay] || []), exerciseData]
    }));
    
    // Reset exercise selection
    setSelectedExerciseId("");
    setSets("3");
    setPerSetConfig([
      { reps: "10", restPeriod: "90" },
      { reps: "10", restPeriod: "90" },
      { reps: "10", restPeriod: "90" }
    ]);
  };

  const removeExerciseFromDay = (day: string, index: number) => {
    setExercisesByDay(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, i) => i !== index)
    }));
  };

  const updateDayTitle = (day: string, title: string) => {
    setDayTitles(prev => {
      if (title.trim() === "") {
        const newTitles = { ...prev };
        delete newTitles[day];
        return newTitles;
      }
      return { ...prev, [day]: title };
    });
  };

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicit validation for required fields (Radix Select doesn't honor "required" attribute)
    if (!customExerciseName.trim()) {
      toast({ title: "Exercise name is required", variant: "destructive" });
      return;
    }
    if (!customMuscleGroup || customMuscleGroup.trim() === "") {
      toast({ title: "Please select a muscle group", variant: "destructive" });
      return;
    }
    if (!customEquipment || customEquipment.trim() === "") {
      toast({ title: "Please select equipment type", variant: "destructive" });
      return;
    }
    
    createCustomExerciseMutation.mutate({
      name: customExerciseName.trim(),
      muscleGroup: customMuscleGroup,
      equipment: customEquipment,
      description: customDescription.trim() || undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert exercisesByDay to flat array with days
    const allExercises: RoutineExercise[] = [];
    Object.entries(exercisesByDay).forEach(([day, exercises]) => {
      exercises.forEach(ex => {
        allExercises.push({ ...ex, days: [day] });
      });
    });
    
    if (!name || allExercises.length === 0) {
      toast({ title: "Please add a name and at least one exercise", variant: "destructive" });
      return;
    }

    // Get all days that have exercises (excluding "any")
    const daysWithExercises = Object.keys(exercisesByDay).filter(
      day => day !== "any" && exercisesByDay[day]?.length > 0
    );

    // Sanitize dayTitles: only include days with exercises and non-empty titles
    const sanitizedDayTitles: Record<string, string> = {};
    daysWithExercises.forEach(day => {
      if (dayTitles[day]?.trim()) {
        sanitizedDayTitles[day] = dayTitles[day].trim();
      }
    });

    createRoutineMutation.mutate({
      name,
      description,
      exercises: allExercises,
      dayTitles: Object.keys(sanitizedDayTitles).length > 0 ? sanitizedDayTitles : undefined,
    });
  };

  const getExerciseName = (id: string) => {
    return exercises.find(e => e.id === id)?.name || "Unknown";
  };

  const getDayExerciseCount = (day: string) => {
    return exercisesByDay[day]?.length || 0;
  };

  const getTotalExerciseCount = () => {
    return Object.values(exercisesByDay).reduce((sum, exs) => sum + exs.length, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Routine Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="routine-name">Routine Name</Label>
          <Input
            id="routine-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., My Weekly Routine, Full Body Split"
            data-testid="input-routine-name"
            required
          />
        </div>

        <div>
          <Label htmlFor="routine-description">Description (optional)</Label>
          <Textarea
            id="routine-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your routine..."
            data-testid="input-routine-description"
          />
        </div>
      </div>

      {/* Day Tabs */}
      <div className="space-y-4">
        <Label>Configure Exercises by Day</Label>
        <Tabs value={currentDay} onValueChange={setCurrentDay} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 h-auto">
            {WEEKDAYS.map((day) => (
              <TabsTrigger 
                key={day} 
                value={day} 
                className="capitalize text-xs sm:text-sm"
                data-testid={`tab-${day}`}
              >
                <span className="hidden sm:inline">{day.slice(0, 3)}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
                {getDayExerciseCount(day) > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                    {getDayExerciseCount(day)}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
            <TabsTrigger 
              value="any" 
              className="text-xs sm:text-sm col-span-4 lg:col-span-1"
              data-testid="tab-any"
            >
              Any Day
              {getDayExerciseCount("any") > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                  {getDayExerciseCount("any")}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {ALL_DAYS.map((day) => (
            <TabsContent key={day} value={day} className="space-y-4 mt-4">
              {/* Day Title */}
              {day !== "any" && (
                <div>
                  <Label htmlFor={`title-${day}`} className="text-sm">
                    Custom Title for {day.charAt(0).toUpperCase() + day.slice(1)} (optional)
                  </Label>
                  <Input
                    id={`title-${day}`}
                    value={dayTitles[day] || ""}
                    onChange={(e) => updateDayTitle(day, e.target.value)}
                    placeholder="e.g., Arms & Abs, Chest & Triceps"
                    className="mt-1"
                    data-testid={`input-day-title-${day}`}
                  />
                </div>
              )}

              {/* Exercises for this day */}
              {(exercisesByDay[day]?.length || 0) > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">
                    Exercises for {day === "any" ? "Any Day" : day.charAt(0).toUpperCase() + day.slice(1)} ({exercisesByDay[day].length})
                  </Label>
                  <div className="space-y-2">
                    {exercisesByDay[day].map((exercise, index) => (
                      <Card key={index} className="glass-surface" data-testid={`card-exercise-${day}-${index}`}>
                        <CardContent className="p-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Dumbbell className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{getExerciseName(exercise.exerciseId)}</p>
                              <p className="text-sm text-muted-foreground">
                                {exercise.sets} sets
                              </p>
                              {exercise.setsConfig && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {exercise.setsConfig.map((set, i) => (
                                    <span key={i} className="inline-block mr-2">
                                      Set {i + 1}: {set.reps} reps, {set.restPeriod}s rest
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExerciseFromDay(day, index)}
                            data-testid={`button-remove-exercise-${day}-${index}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Exercise Card */}
              <Card className="glass-surface">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Add Exercise to {day === "any" ? "Any Day" : day.charAt(0).toUpperCase() + day.slice(1)}
                    </Label>
                    <Dialog open={isCustomExerciseDialogOpen} onOpenChange={setIsCustomExerciseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          data-testid={`button-create-custom-exercise-${day}`}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Custom
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-surface-elevated max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create Custom Exercise</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateCustomExercise} className="space-y-4">
                          <div>
                            <Label htmlFor="custom-exercise-name">Exercise Name *</Label>
                            <Input
                              id="custom-exercise-name"
                              value={customExerciseName}
                              onChange={(e) => setCustomExerciseName(e.target.value)}
                              placeholder="e.g., Seated Calf Raise"
                              data-testid="input-custom-exercise-name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="custom-muscle-group">Muscle Group *</Label>
                            <Select value={customMuscleGroup} onValueChange={setCustomMuscleGroup} required>
                              <SelectTrigger id="custom-muscle-group" data-testid="select-custom-muscle-group">
                                <SelectValue placeholder="Select muscle group" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="chest">Chest</SelectItem>
                                <SelectItem value="back">Back</SelectItem>
                                <SelectItem value="shoulders">Shoulders</SelectItem>
                                <SelectItem value="biceps">Biceps</SelectItem>
                                <SelectItem value="triceps">Triceps</SelectItem>
                                <SelectItem value="legs">Legs</SelectItem>
                                <SelectItem value="glutes">Glutes</SelectItem>
                                <SelectItem value="abs">Abs</SelectItem>
                                <SelectItem value="calves">Calves</SelectItem>
                                <SelectItem value="forearms">Forearms</SelectItem>
                                <SelectItem value="cardio">Cardio</SelectItem>
                                <SelectItem value="full body">Full Body</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="custom-equipment">Equipment *</Label>
                            <Select value={customEquipment} onValueChange={setCustomEquipment} required>
                              <SelectTrigger id="custom-equipment" data-testid="select-custom-equipment">
                                <SelectValue placeholder="Select equipment" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="barbell">Barbell</SelectItem>
                                <SelectItem value="dumbbell">Dumbbell</SelectItem>
                                <SelectItem value="machine">Machine</SelectItem>
                                <SelectItem value="cable">Cable</SelectItem>
                                <SelectItem value="bodyweight">Bodyweight</SelectItem>
                                <SelectItem value="kettlebell">Kettlebell</SelectItem>
                                <SelectItem value="resistance band">Resistance Band</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="custom-description">Description (optional)</Label>
                            <Textarea
                              id="custom-description"
                              value={customDescription}
                              onChange={(e) => setCustomDescription(e.target.value)}
                              placeholder="Exercise instructions or notes..."
                              data-testid="input-custom-description"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsCustomExerciseDialogOpen(false)}
                              className="flex-1"
                              data-testid="button-cancel-custom-exercise"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={createCustomExerciseMutation.isPending}
                              className="flex-1 gradient-primary text-primary-foreground font-bold"
                              data-testid="button-save-custom-exercise"
                            >
                              {createCustomExerciseMutation.isPending ? "Creating..." : "Create Exercise"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                      <SelectTrigger data-testid={`select-exercise-${day}`}>
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises.map((exercise) => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            <div className="flex items-center gap-2">
                              <span>{exercise.name}</span>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {exercise.muscleGroup}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Per-Set Configuration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Number of Sets</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateSetCount(parseInt(sets) - 1)}
                          disabled={parseInt(sets) <= 1}
                          data-testid={`button-decrease-sets-${day}`}
                        >
                          -
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{sets}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateSetCount(parseInt(sets) + 1)}
                          disabled={parseInt(sets) >= 10}
                          data-testid={`button-increase-sets-${day}`}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {perSetConfig.map((set, index) => (
                        <Card key={index} className="glass-surface bg-muted/30">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium min-w-[40px]">Set {index + 1}</span>
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <div>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={set.reps}
                                    onChange={(e) => updatePerSet(index, 'reps', e.target.value)}
                                    placeholder="Reps"
                                    className="h-8 text-xs"
                                    data-testid={`input-set-${day}-${index}-reps`}
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Timer className="w-3 h-3 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min="30"
                                    max="300"
                                    value={set.restPeriod}
                                    onChange={(e) => updatePerSet(index, 'restPeriod', e.target.value)}
                                    placeholder="Rest (s)"
                                    className="h-8 text-xs"
                                    data-testid={`input-set-${day}-${index}-rest`}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addExerciseToDay}
                    disabled={!selectedExerciseId}
                    className="w-full gradient-primary text-primary-foreground font-bold"
                    data-testid={`button-add-exercise-${day}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to {day === "any" ? "Any Day" : day.charAt(0).toUpperCase() + day.slice(1)}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Total exercises: {getTotalExerciseCount()}
        </p>
        <Button 
          type="submit" 
          disabled={createRoutineMutation.isPending}
          className="gradient-primary text-primary-foreground font-bold px-8"
          data-testid="button-create-routine"
        >
          Create Routine
        </Button>
      </div>
    </form>
  );
}
