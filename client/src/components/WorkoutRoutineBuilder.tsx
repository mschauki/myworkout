import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Exercise } from "@shared/schema";
import { Plus, X, Dumbbell, Calendar, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

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
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [selectedDays, setSelectedDays] = useState<string[]>(["any"]);
  const [restPeriod, setRestPeriod] = useState("90");
  const [usePerSetConfig, setUsePerSetConfig] = useState(false);
  const [perSetConfig, setPerSetConfig] = useState<Array<{ reps: string; restPeriod: string }>>([]);
  const [hasPerSetEdits, setHasPerSetEdits] = useState(false);
  const prevUsePerSetConfig = useRef(false);
  const lastSyncedValues = useRef({ sets: "3", reps: "10", restPeriod: "90" });

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

  // Synchronize perSetConfig with simple mode values only when user hasn't made per-set edits
  useEffect(() => {
    // Skip sync if we just toggled from per-set to simple mode
    const justToggledFromPerSet = prevUsePerSetConfig.current && !usePerSetConfig;
    
    // Check if simple values have changed since last tracked values
    const simpleValuesChanged = 
      lastSyncedValues.current.sets !== sets ||
      lastSyncedValues.current.reps !== reps ||
      lastSyncedValues.current.restPeriod !== restPeriod;
    
    // Sync if: in simple mode, no custom edits, not just toggled, AND (empty OR values changed)
    if (!usePerSetConfig && !hasPerSetEdits && !justToggledFromPerSet && (perSetConfig.length === 0 || simpleValuesChanged)) {
      // Sanitize and validate inputs
      const targetCount = Math.max(1, parseInt(sets?.trim()) || 3);
      const targetReps = Math.max(1, parseInt(reps?.trim()) || 10).toString();
      const targetRest = Math.max(30, Math.min(300, parseInt(restPeriod?.trim()) || 90)).toString();
      
      setPerSetConfig(Array.from({ length: targetCount }, () => ({
        reps: targetReps,
        restPeriod: targetRest,
      })));
    }
    
    // Always update lastSyncedValues when in simple mode to track current values
    if (!usePerSetConfig) {
      lastSyncedValues.current = { sets, reps, restPeriod };
    }
    
    // Update ref for next render
    prevUsePerSetConfig.current = usePerSetConfig;
  }, [sets, reps, restPeriod, usePerSetConfig, hasPerSetEdits, perSetConfig.length]);

  const toggleDay = (day: string) => {
    if (day === "any") {
      // If "any" is already selected, uncheck it (enabling individual days)
      if (selectedDays.includes("any")) {
        setSelectedDays([]);
      } else {
        setSelectedDays(["any"]);
      }
    } else {
      const newDays = selectedDays.filter(d => d !== "any");
      if (newDays.includes(day)) {
        const filtered = newDays.filter(d => d !== day);
        // If no days selected, default back to "any"
        setSelectedDays(filtered.length === 0 ? ["any"] : filtered);
      } else {
        setSelectedDays([...newDays, day]);
      }
    }
  };

  const addExercise = () => {
    if (!selectedExerciseId) return;
    
    let exerciseData: RoutineExercise;
    
    if (usePerSetConfig) {
      // Use per-set configuration
      const setsConfig = perSetConfig.map(set => ({
        reps: parseInt(set.reps || "10") || 10,
        restPeriod: Math.max(30, Math.min(300, parseInt(set.restPeriod || "90") || 90)),
      }));
      
      exerciseData = {
        exerciseId: selectedExerciseId,
        sets: setsConfig.length,
        reps: setsConfig[0]?.reps || 10, // Use first set's reps as default
        days: selectedDays,
        setsConfig,
      };
    } else {
      // Use simple configuration
      const parsedRestPeriod = parseInt(restPeriod || "90") || 90;
      const clampedRestPeriod = Math.max(30, Math.min(300, parsedRestPeriod));
      
      exerciseData = {
        exerciseId: selectedExerciseId,
        sets: parseInt(sets || "3") || 3,
        reps: parseInt(reps || "10") || 10,
        days: selectedDays,
        restPeriod: clampedRestPeriod,
      };
    }
    
    setRoutineExercises([...routineExercises, exerciseData]);
    setSelectedExerciseId("");
    setSets("3");
    setReps("10");
    setSelectedDays(["any"]);
    setRestPeriod("90");
    setUsePerSetConfig(false);
    setPerSetConfig([]);
    setHasPerSetEdits(false);
  };

  const updateSetCount = (newCount: number) => {
    const count = Math.max(1, Math.min(10, newCount));
    setSets(String(count));
    
    // Clear hasPerSetEdits when user changes simple mode values
    setHasPerSetEdits(false);
    
    // Update perSetConfig array to match new count
    const currentConfig = [...perSetConfig];
    if (count > currentConfig.length) {
      // Add new sets
      const lastSet = currentConfig[currentConfig.length - 1] || { reps: "10", restPeriod: "90" };
      while (currentConfig.length < count) {
        currentConfig.push({ ...lastSet });
      }
    } else {
      // Remove sets
      currentConfig.splice(count);
    }
    setPerSetConfig(currentConfig);
  };

  const updatePerSet = (index: number, field: 'reps' | 'restPeriod', value: string) => {
    const updated = [...perSetConfig];
    updated[index] = { ...updated[index], [field]: value };
    setPerSetConfig(updated);
    setHasPerSetEdits(true);
  };
  
  // Reset per-set edits and resync from simple mode
  const resetPerSetEdits = () => {
    setHasPerSetEdits(false);
    const targetCount = Math.max(1, parseInt(sets?.trim()) || 3);
    const targetReps = Math.max(1, parseInt(reps?.trim()) || 10).toString();
    const targetRest = Math.max(30, Math.min(300, parseInt(restPeriod?.trim()) || 90)).toString();
    
    setPerSetConfig(Array.from({ length: targetCount }, () => ({
      reps: targetReps,
      restPeriod: targetRest,
    })));
  };

  const removeExercise = (index: number) => {
    setRoutineExercises(routineExercises.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || routineExercises.length === 0) {
      toast({ title: "Please add a name and at least one exercise", variant: "destructive" });
      return;
    }

    createRoutineMutation.mutate({
      name,
      description,
      exercises: routineExercises,
    });
  };

  const getExerciseName = (id: string) => {
    return exercises.find(e => e.id === id)?.name || "Unknown";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="routine-name">Routine Name</Label>
          <Input
            id="routine-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Push Day, Full Body"
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

      {/* Add Exercise */}
      <div className="space-y-4">
        <Label>Add Exercises</Label>
        <Card>
          <CardContent className="p-4 space-y-4">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger data-testid="select-exercise">
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

            {/* Configuration Mode Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Configuration</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="per-set-toggle" className="text-xs text-muted-foreground cursor-pointer">
                  Per-Set Rest
                </Label>
                <Checkbox
                  id="per-set-toggle"
                  checked={usePerSetConfig}
                  onCheckedChange={(checked) => setUsePerSetConfig(Boolean(checked))}
                  data-testid="checkbox-per-set-config"
                />
              </div>
            </div>

            {!usePerSetConfig ? (
              /* Simple Mode */
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sets" className="text-xs">Sets</Label>
                  <Input
                    id="sets"
                    type="number"
                    min="1"
                    value={sets}
                    onChange={(e) => updateSetCount(parseInt(e.target.value))}
                    data-testid="input-sets"
                  />
                </div>
                <div>
                  <Label htmlFor="reps" className="text-xs">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    min="1"
                    value={reps}
                    onChange={(e) => {
                      setReps(e.target.value);
                      setHasPerSetEdits(false); // Clear edits when simple mode values change
                    }}
                    data-testid="input-reps"
                  />
                </div>
                <div>
                  <Label htmlFor="rest" className="text-xs flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    Rest (sec)
                  </Label>
                  <Input
                    id="rest"
                    type="number"
                    min="30"
                    max="300"
                    value={restPeriod}
                    onChange={(e) => {
                      setRestPeriod(e.target.value);
                      setHasPerSetEdits(false); // Clear edits when simple mode values change
                    }}
                    data-testid="input-rest-period"
                  />
                </div>
              </div>
            ) : (
              /* Per-Set Configuration Mode */
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
                      data-testid="button-decrease-sets"
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
                      data-testid="button-increase-sets"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {perSetConfig.map((set, index) => (
                    <Card key={index} className="bg-muted/50">
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
                                data-testid={`input-set-${index}-reps`}
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
                                data-testid={`input-set-${index}-rest`}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Training Days
              </Label>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="day-any"
                    checked={selectedDays.includes("any")}
                    onCheckedChange={() => toggleDay("any")}
                    data-testid="checkbox-day-any"
                  />
                  <label
                    htmlFor="day-any"
                    className="text-sm font-medium cursor-pointer"
                    onClick={() => toggleDay("any")}
                  >
                    Any Day
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const isDisabled = selectedDays.includes("any");
                  return (
                    <div
                      key={day}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`day-${day}`}
                        checked={selectedDays.includes(day)}
                        disabled={isDisabled}
                        onCheckedChange={() => !isDisabled && toggleDay(day)}
                        data-testid={`checkbox-day-${day}`}
                      />
                      <label
                        htmlFor={`day-${day}`}
                        className={`text-sm capitalize ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => !isDisabled && toggleDay(day)}
                      >
                        {day.slice(0, 3)}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              type="button"
              onClick={addExercise}
              disabled={!selectedExerciseId}
              className="w-full"
              data-testid="button-add-exercise"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Exercise List */}
      {routineExercises.length > 0 && (
        <div className="space-y-2">
          <Label>Exercises ({routineExercises.length})</Label>
          <div className="space-y-2">
            {routineExercises.map((exercise, index) => (
              <Card key={index} data-testid={`card-exercise-${index}`}>
                <CardContent className="p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Dumbbell className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getExerciseName(exercise.exerciseId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs capitalize">
                          <Calendar className="w-3 h-3 mr-1" />
                          {exercise.days.includes("any") 
                            ? "Any day" 
                            : exercise.days.map(d => d.slice(0, 3)).join(", ")}
                        </Badge>
                        {exercise.restPeriod && (
                          <Badge variant="outline" className="text-xs">
                            <Timer className="w-3 h-3 mr-1" />
                            {exercise.restPeriod}s rest
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExercise(index)}
                    data-testid={`button-remove-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={createRoutineMutation.isPending}
        data-testid="button-create-routine"
      >
        {createRoutineMutation.isPending ? "Creating..." : "Create Routine"}
      </Button>
    </form>
  );
}
