import { useState } from "react";
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
    
    // Validate and clamp rest period to 30-300 range
    const parsedRestPeriod = parseInt(restPeriod) || 90;
    const clampedRestPeriod = Math.max(30, Math.min(300, parsedRestPeriod));
    
    setRoutineExercises([
      ...routineExercises,
      {
        exerciseId: selectedExerciseId,
        sets: parseInt(sets),
        reps: parseInt(reps),
        days: selectedDays,
        restPeriod: clampedRestPeriod,
      },
    ]);
    setSelectedExerciseId("");
    setSets("3");
    setReps("10");
    setSelectedDays(["any"]);
    setRestPeriod("90");
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sets" className="text-xs">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  min="1"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
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
                  onChange={(e) => setReps(e.target.value)}
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
                  onChange={(e) => setRestPeriod(e.target.value)}
                  data-testid="input-rest-period"
                />
              </div>
            </div>

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
