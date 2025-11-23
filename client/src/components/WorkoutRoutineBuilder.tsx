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
import { Checkbox } from "@/components/ui/checkbox";
import { Exercise } from "@shared/schema";
import { Plus, X, Dumbbell, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const ALL_DAYS = [...WEEKDAYS, "any"];
const MUSCLE_GROUPS = ["Chest", "Back", "Upper Legs", "Lower Legs", "Shoulders", "Arms", "Core", "Biceps", "Triceps", "Glutes", "Upper Abs", "Lower Abs", "Calves", "Forearms", "Cardio", "Full Body"];

interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  days: string[];
  restPeriod?: number;
  setsConfig?: Array<{
    reps?: number;
    duration?: number;
    restPeriod: number;
    weight?: number;
  }>;
  supersetGroup?: string;
}

interface WorkoutRoutineBuilderProps {
  onComplete: () => void;
  editingRoutine?: any; // Optional routine to edit
}

export function WorkoutRoutineBuilder({ onComplete, editingRoutine }: WorkoutRoutineBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentDay, setCurrentDay] = useState<string>("monday");
  const [exercisesByDay, setExercisesByDay] = useState<Record<string, RoutineExercise[]>>({});
  const [dayTitles, setDayTitles] = useState<Record<string, string>>({});
  
  // Exercise configuration state
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [sets, setSets] = useState("3");
  const [perSetConfig, setPerSetConfig] = useState<Array<{ reps?: string; duration?: string; restPeriod: string; weight?: string }>>([
    { reps: "10", restPeriod: "90", weight: "" },
    { reps: "10", restPeriod: "90", weight: "" },
    { reps: "10", restPeriod: "90", weight: "" }
  ]);

  // Custom exercise creation state
  const [isCustomExerciseDialogOpen, setIsCustomExerciseDialogOpen] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [customMuscleGroup, setCustomMuscleGroup] = useState("");
  const [customOtherMuscleGroups, setCustomOtherMuscleGroups] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState("");
  const [customIsTimeBased, setCustomIsTimeBased] = useState(false);
  const [customDescription, setCustomDescription] = useState("");
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

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

  const updateRoutineMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/workout-routines/${editingRoutine.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-routines"] });
      toast({ title: "Workout routine updated successfully" });
      onComplete();
    },
    onError: () => {
      toast({ title: "Failed to update routine", variant: "destructive" });
    },
  });

  // Populate form when editing an existing routine
  useEffect(() => {
    if (editingRoutine) {
      setName(editingRoutine.name);
      setDescription(editingRoutine.description || "");
      setDayTitles(editingRoutine.dayTitles || {});
      
      // Convert flat exercises array back to exercisesByDay structure
      const byDay: Record<string, RoutineExercise[]> = {};
      (editingRoutine.exercises || []).forEach((ex: any) => {
        const days = ex.days || [];
        days.forEach((day: string) => {
          if (!byDay[day]) byDay[day] = [];
          byDay[day].push({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            days: ex.days,
            restPeriod: ex.restPeriod,
            setsConfig: ex.setsConfig,
            supersetGroup: ex.supersetGroup,
          });
        });
      });
      setExercisesByDay(byDay);
    }
  }, [editingRoutine]);

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
      setCustomOtherMuscleGroups([]);
      setCustomEquipment("");
      setCustomIsTimeBased(false);
      setCustomDescription("");
      setCustomImageFile(null);
      setCustomImagePreview(null);
      setUploadedImageUrl(null);
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
      const lastSet = currentConfig[currentConfig.length - 1] || { reps: "10", restPeriod: "90", weight: "" };
      while (currentConfig.length < count) {
        currentConfig.push({ ...lastSet });
      }
    } else {
      currentConfig.splice(count);
    }
    setPerSetConfig(currentConfig);
  };

  const updatePerSet = (index: number, field: 'reps' | 'duration' | 'restPeriod' | 'weight', value: string) => {
    const updated = [...perSetConfig];
    updated[index] = { ...updated[index], [field]: value };
    setPerSetConfig(updated);
  };

  const copyToAllSets = (index: number, field: 'reps' | 'duration' | 'restPeriod' | 'weight') => {
    const sourceValue = perSetConfig[index]?.[field];
    if (sourceValue === undefined || sourceValue === "") {
      toast({ 
        title: `Cannot copy empty ${field}`, 
        variant: "destructive" 
      });
      return;
    }
    
    const updated = perSetConfig.map((set, idx) => ({
      ...set,
      [field]: idx === index ? set[field] : sourceValue
    }));
    setPerSetConfig(updated);
    toast({ 
      title: `${field.charAt(0).toUpperCase() + field.slice(1)} copied to all sets` 
    });
  };

  const addExerciseToDay = () => {
    if (!selectedExerciseId) return;
    
    const selectedExercise = exercises.find(e => e.id === selectedExerciseId);
    const isBodyweight = selectedExercise?.equipment?.toLowerCase() === "bodyweight";
    const isTimeBased = selectedExercise?.isTimeBased || false;
    
    const setsConfig = perSetConfig.map(set => {
      const config: { reps?: number; duration?: number; restPeriod: number; weight?: number } = {
        restPeriod: Math.max(0, parseInt(set.restPeriod || "90") || 90),
      };
      
      // For time-based exercises, use duration; otherwise use reps
      if (isTimeBased) {
        config.duration = parseInt(set.duration || "30") || 30;
      } else {
        config.reps = parseInt(set.reps || "10") || 10;
      }
      
      // Only include weight for non-bodyweight exercises
      if (!isBodyweight && set.weight && set.weight.trim() !== "") {
        const weightValue = parseFloat(set.weight);
        if (!isNaN(weightValue) && weightValue > 0) {
          config.weight = weightValue;
        }
      }
      
      return config;
    });
    
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
      { reps: "10", restPeriod: "90", weight: "" },
      { reps: "10", restPeriod: "90", weight: "" },
      { reps: "10", restPeriod: "90", weight: "" }
    ]);
  };

  const removeExerciseFromDay = (day: string, index: number) => {
    setExercisesByDay(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, i) => i !== index)
    }));
  };

  const toggleSuperset = (day: string, index: number) => {
    setExercisesByDay(prev => {
      const dayExercises = [...(prev[day] || [])];
      const exercise = dayExercises[index];
      
      if (exercise.supersetGroup) {
        // Remove from superset - clear this exercise's group
        const oldGroup = exercise.supersetGroup;
        exercise.supersetGroup = undefined;
        
        // Re-evaluate the remaining exercises in this group
        const remainingInGroup = dayExercises
          .map((ex, idx) => ({ ex, idx }))
          .filter(({ ex }) => ex.supersetGroup === oldGroup);
        
        if (remainingInGroup.length === 1) {
          // Only one exercise left in the group - clear its group tag
          remainingInGroup[0].ex.supersetGroup = undefined;
        } else if (remainingInGroup.length > 1) {
          // Check if remaining exercises are still contiguous (adjacent)
          const indices = remainingInGroup.map(({ idx }) => idx).sort((a, b) => a - b);
          let isContiguous = true;
          for (let i = 1; i < indices.length; i++) {
            if (indices[i] !== indices[i - 1] + 1) {
              isContiguous = false;
              break;
            }
          }
          
          // If not contiguous, clear all their group tags
          if (!isContiguous) {
            remainingInGroup.forEach(({ ex }) => {
              ex.supersetGroup = undefined;
            });
          }
        }
      } else {
        // Can only add to superset if there's a previous exercise
        if (index < 1) {
          toast({ 
            title: "Cannot create superset", 
            description: "Add at least one exercise first",
            variant: "destructive" 
          });
          return prev;
        }
        
        // Add to superset
        if (dayExercises[index - 1].supersetGroup) {
          // Join the previous exercise's existing superset
          exercise.supersetGroup = dayExercises[index - 1].supersetGroup;
        } else {
          // Create a new superset group with the previous exercise
          // Use a stable UUID that persists across edits and reordering
          const groupId = crypto.randomUUID();
          
          dayExercises[index - 1].supersetGroup = groupId;
          exercise.supersetGroup = groupId;
        }
      }
      
      return {
        ...prev,
        [day]: dayExercises
      };
    });
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

  const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCustomImage = () => {
    setCustomImageFile(null);
    setCustomImagePreview(null);
    setUploadedImageUrl(null);
  };

  const handleCreateCustomExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Explicit validation for required fields (Radix Select doesn't honor "required" attribute)
    if (!customExerciseName.trim()) {
      toast({ title: "Exercise name is required", variant: "destructive" });
      return;
    }
    if (!customMuscleGroup || customMuscleGroup.trim() === "") {
      toast({ title: "Please select a main muscle group", variant: "destructive" });
      return;
    }
    if (!customEquipment || customEquipment.trim() === "") {
      toast({ title: "Please select equipment type", variant: "destructive" });
      return;
    }
    
    // Upload image if one was selected
    let imageUrl: string | undefined = undefined;
    if (customImageFile) {
      try {
        const formData = new FormData();
        formData.append("image", customImageFile);
        
        const uploadResponse = await fetch("/api/exercises/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          toast({ 
            title: "Image upload failed", 
            description: errorData.error || "Could not upload image",
            variant: "destructive" 
          });
          return;
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
        setUploadedImageUrl(imageUrl || null);
      } catch (error) {
        toast({ 
          title: "Image upload failed", 
          description: "Could not upload image",
          variant: "destructive" 
        });
        return;
      }
    }
    
    createCustomExerciseMutation.mutate({
      name: customExerciseName.trim(),
      muscleGroup: customMuscleGroup,
      otherMuscleGroups: customOtherMuscleGroups.length > 0 ? customOtherMuscleGroups : undefined,
      equipment: customEquipment,
      isTimeBased: customIsTimeBased,
      description: customDescription.trim() || undefined,
      imageUrl: imageUrl || undefined,
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

    const routineData = {
      name,
      description,
      exercises: allExercises,
      dayTitles: Object.keys(sanitizedDayTitles).length > 0 ? sanitizedDayTitles : undefined,
    };

    if (editingRoutine) {
      updateRoutineMutation.mutate(routineData);
    } else {
      createRoutineMutation.mutate(routineData);
    }
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
                    {exercisesByDay[day].map((exercise, index) => {
                      const prevExercise = index > 0 ? exercisesByDay[day][index - 1] : null;
                      const isInSuperset = !!exercise.supersetGroup;
                      const isSupersetStart = isInSuperset && (!prevExercise || prevExercise.supersetGroup !== exercise.supersetGroup);
                      const isSupersetContinuation = isInSuperset && prevExercise && prevExercise.supersetGroup === exercise.supersetGroup;
                      
                      return (
                        <div key={index} className="relative">
                          {isSupersetContinuation && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-orange-500 rounded-full" />
                          )}
                          <Card 
                            className={`glass-surface ${isSupersetContinuation ? 'ml-3' : ''} ${isInSuperset ? 'border-primary/30' : ''}`} 
                            data-testid={`card-exercise-${day}-${index}`}
                          >
                            <CardContent className="p-3">
                              {isSupersetStart && (
                                <div className="mb-2 flex items-center gap-2">
                                  <Badge variant="default" className="text-xs glass-surface-elevated">
                                    Superset
                                  </Badge>
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-4">
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
                                            Set {i + 1}: {set.weight ? `${set.weight} lbs × ` : ''}{set.reps} reps, {set.restPeriod}s rest
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant={isInSuperset ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 px-2 text-xs"
                                    onClick={() => toggleSuperset(day, index)}
                                    data-testid={`button-toggle-superset-${day}-${index}`}
                                  >
                                    {isInSuperset ? "Remove SS" : "Superset"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeExerciseFromDay(day, index)}
                                    data-testid={`button-remove-exercise-${day}-${index}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
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
                            <Label htmlFor="custom-muscle-group">Main Muscle Group *</Label>
                            <Select value={customMuscleGroup} onValueChange={setCustomMuscleGroup} required>
                              <SelectTrigger id="custom-muscle-group" data-testid="select-custom-muscle-group">
                                <SelectValue placeholder="Select main muscle group" />
                              </SelectTrigger>
                              <SelectContent>
                                {MUSCLE_GROUPS.map((group) => (
                                  <SelectItem key={group} value={group.toLowerCase()}>
                                    {group}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Other Muscle Groups (Optional)</Label>
                            <div className="grid grid-cols-2 gap-2 glass-surface p-3 rounded-lg mt-2">
                              {MUSCLE_GROUPS.map((group) => {
                                const groupValue = group.toLowerCase();
                                const isChecked = customOtherMuscleGroups.includes(groupValue);
                                return (
                                  <div key={group} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`custom-other-muscle-${groupValue}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setCustomOtherMuscleGroups([...customOtherMuscleGroups, groupValue]);
                                        } else {
                                          setCustomOtherMuscleGroups(customOtherMuscleGroups.filter((v) => v !== groupValue));
                                        }
                                      }}
                                      data-testid={`checkbox-custom-other-muscle-${groupValue}`}
                                    />
                                    <Label
                                      htmlFor={`custom-other-muscle-${groupValue}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {group}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
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
                            <Label htmlFor="custom-is-time-based" className="flex flex-row items-center gap-3 cursor-pointer">
                              <Checkbox
                                id="custom-is-time-based"
                                checked={customIsTimeBased}
                                onCheckedChange={(checked) => setCustomIsTimeBased(checked === true)}
                                data-testid="checkbox-custom-is-time-based"
                              />
                              <span className="font-normal">Time-based exercise (duration instead of reps)</span>
                            </Label>
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
                          <div>
                            <Label htmlFor="custom-image">Exercise Image (optional)</Label>
                            <div className="space-y-2">
                              {customImagePreview ? (
                                <div className="relative">
                                  <img
                                    src={customImagePreview}
                                    alt="Exercise preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={handleRemoveCustomImage}
                                    data-testid="button-remove-custom-image"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Input
                                  id="custom-image"
                                  type="file"
                                  accept="image/jpeg,image/png,image/gif,image/webp"
                                  onChange={handleCustomImageChange}
                                  data-testid="input-custom-image"
                                />
                              )}
                              <p className="text-xs text-muted-foreground">
                                Supported: JPEG, PNG, GIF, WebP (max 5MB)
                              </p>
                            </div>
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
                              className="flex-1"
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
                    <div className="space-y-2">
                      <Input
                        placeholder="Search exercises..."
                        value={exerciseSearchQuery}
                        onChange={(e) => setExerciseSearchQuery(e.target.value)}
                        data-testid={`input-exercise-search-${day}`}
                        className="h-10"
                      />
                      <Select value={selectedExerciseId} onValueChange={(value) => {
                        setSelectedExerciseId(value);
                        setExerciseSearchQuery("");
                      }}>
                        <SelectTrigger data-testid={`select-exercise-${day}`}>
                          <SelectValue placeholder="Select exercise" />
                        </SelectTrigger>
                        <SelectContent>
                          {exercises
                            .filter((exercise) => 
                              exercise.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
                              exercise.muscleGroup.toLowerCase().includes(exerciseSearchQuery.toLowerCase())
                            )
                            .map((exercise) => (
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
                    </div>
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
                      {perSetConfig.map((set, index) => {
                        const selectedExercise = exercises.find(e => e.id === selectedExerciseId);
                        const isBodyweight = selectedExercise?.equipment?.toLowerCase() === "bodyweight";
                        
                        return (
                          <Card key={index} className="glass-surface bg-muted/30">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-medium min-w-[40px] pt-0.5">Set {index + 1}</span>
                                <div className={`flex-1 grid gap-2 ${isBodyweight ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                  {!isBodyweight && (
                                    <div className="flex flex-col gap-1">
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={set.weight || ""}
                                        onChange={(e) => updatePerSet(index, 'weight', e.target.value)}
                                        placeholder="Weight"
                                        className="h-8 text-xs"
                                        data-testid={`input-set-${day}-${index}-weight`}
                                      />
                                      {index === 0 && perSetConfig.length > 1 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs"
                                          onClick={() => copyToAllSets(index, 'weight')}
                                          data-testid={`button-copy-weight-${day}-${index}`}
                                        >
                                          Copy to all
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex flex-col gap-1">
                                    {selectedExercise?.isTimeBased ? (
                                      <>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={set.duration || ""}
                                          onChange={(e) => updatePerSet(index, 'duration', e.target.value)}
                                          placeholder="Duration (s)"
                                          className="h-8 text-xs"
                                          data-testid={`input-set-${day}-${index}-duration`}
                                        />
                                        {index === 0 && perSetConfig.length > 1 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => copyToAllSets(index, 'duration')}
                                            data-testid={`button-copy-duration-${day}-${index}`}
                                          >
                                            Copy to all
                                          </Button>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={set.reps || ""}
                                          onChange={(e) => updatePerSet(index, 'reps', e.target.value)}
                                          placeholder="Reps"
                                          className="h-8 text-xs"
                                          data-testid={`input-set-${day}-${index}-reps`}
                                        />
                                        {index === 0 && perSetConfig.length > 1 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => copyToAllSets(index, 'reps')}
                                            data-testid={`button-copy-reps-${day}-${index}`}
                                          >
                                            Copy to all
                                          </Button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1">
                                      <Timer className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                      <Input
                                        type="number"
                                        min="0"
                                        value={set.restPeriod}
                                        onChange={(e) => updatePerSet(index, 'restPeriod', e.target.value)}
                                        placeholder="Rest (s)"
                                        className="h-8 text-xs"
                                        data-testid={`input-set-${day}-${index}-rest`}
                                      />
                                    </div>
                                    {index === 0 && perSetConfig.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => copyToAllSets(index, 'restPeriod')}
                                        data-testid={`button-copy-rest-${day}-${index}`}
                                      >
                                        Copy to all
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addExerciseToDay}
                    disabled={!selectedExerciseId}
                    className="w-full"
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
          disabled={createRoutineMutation.isPending || updateRoutineMutation.isPending}
          data-testid="button-create-routine"
        >
          {editingRoutine ? "Update Routine" : "Create Routine"}
        </Button>
      </div>
    </form>
  );
}
