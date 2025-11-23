import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Dumbbell, Plus, Pencil, ListPlus, Timer, Trash2 } from "lucide-react";
import { Exercise, insertExerciseSchema, WorkoutRoutine } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Upper Legs", "Lower Legs", "Shoulders", "Arms", "Core", "Biceps", "Triceps", "Glutes", "Abs", "Calves", "Forearms", "Cardio", "Full Body"];
const EQUIPMENT_OPTIONS = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight", "Resistance Band", "Other"];
const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "any"] as const;

export default function Exercises() {
  const [selectedTab, setSelectedTab] = useState<"all" | "custom">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isAddToRoutineDialogOpen, setIsAddToRoutineDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [numberOfSets, setNumberOfSets] = useState(3);
  const [perSetConfig, setPerSetConfig] = useState<Array<{ reps: number; restPeriod: number; weight?: number }>>([
    { reps: 10, restPeriod: 90, weight: undefined },
    { reps: 10, restPeriod: 90, weight: undefined },
    { reps: 10, restPeriod: 90, weight: undefined },
  ]);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [editUploadedImageUrl, setEditUploadedImageUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const { toast } = useToast();

  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: routines = [] } = useQuery<WorkoutRoutine[]>({
    queryKey: ["/api/workout-routines"],
  });

  const form = useForm({
    resolver: zodResolver(insertExerciseSchema),
    defaultValues: {
      name: "",
      description: "",
      muscleGroup: "",
      otherMuscleGroups: [],
      equipment: "",
      isTimeBased: false,
    },
  });

  const editForm = useForm({
    resolver: zodResolver(insertExerciseSchema),
    defaultValues: {
      name: "",
      description: "",
      muscleGroup: "",
      otherMuscleGroups: [],
      equipment: "",
      isTimeBased: false,
    },
  });

  const createExerciseMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/exercises", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({ title: "Exercise created successfully" });
      setIsCreateDialogOpen(false);
      form.reset();
      setUploadedImageUrl("");
    },
    onError: () => {
      toast({ title: "Failed to create exercise", variant: "destructive" });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "File too large", 
        description: "Please select an image smaller than 5MB",
        variant: "destructive" 
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Invalid file type", 
        description: "Please select an image file",
        variant: "destructive" 
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-exercise-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadedImageUrl(result.imageUrl);
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      toast({ 
        title: "Upload failed", 
        description: "Failed to upload image. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateExercise = (data: any) => {
    const exerciseData = {
      ...data,
      imageUrl: uploadedImageUrl || undefined,
    };
    createExerciseMutation.mutate(exerciseData);
  };

  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/exercises/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({ title: "Exercise updated successfully" });
      setIsEditDialogOpen(false);
      setEditingExercise(null);
      setEditUploadedImageUrl("");
      editForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update exercise", variant: "destructive" });
    },
  });

  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    // Set the current image URL and track original
    const currentImageUrl = exercise.imageUrl || "";
    setEditUploadedImageUrl(currentImageUrl);
    setOriginalImageUrl(currentImageUrl);
    // Normalize muscle groups to lowercase for consistent comparison with form options
    const normalizedOtherMuscleGroups = (exercise.otherMuscleGroups || []).map((g) => g.toLowerCase());
    editForm.reset({
      name: exercise.name,
      description: exercise.description || "",
      muscleGroup: exercise.muscleGroup?.toLowerCase() || "",
      otherMuscleGroups: normalizedOtherMuscleGroups as any,
      equipment: exercise.equipment?.toLowerCase() || "",
      isTimeBased: exercise.isTimeBased || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "File too large", 
        description: "Please select an image smaller than 5MB",
        variant: "destructive" 
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Invalid file type", 
        description: "Please select an image file",
        variant: "destructive" 
      });
      return;
    }

    setIsUploadingEditImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-exercise-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setEditUploadedImageUrl(result.imageUrl);
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      toast({ 
        title: "Upload failed", 
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsUploadingEditImage(false);
    }
  };

  const handleUpdateExercise = (data: any) => {
    if (editingExercise) {
      // Only include imageUrl if it has changed from original
      const imageChanged = editUploadedImageUrl !== originalImageUrl;
      const exerciseData = {
        ...data,
        // If image changed, use new value (empty string to clear, or new URL)
        // If not changed, don't include it (undefined means no change)
        ...(imageChanged && { imageUrl: editUploadedImageUrl || null }),
      };
      updateExerciseMutation.mutate({ id: editingExercise.id, data: exerciseData });
    }
  };

  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({ title: "Exercise deleted successfully" });
      setDeletingExercise(null);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to delete exercise";
      toast({ 
        title: errorMessage.includes("used in")
          ? "Cannot delete exercise"
          : "Failed to delete exercise",
        description: errorMessage.includes("used in")
          ? errorMessage
          : undefined,
        variant: "destructive" 
      });
      setDeletingExercise(null);
    },
  });

  const handleDeleteExercise = () => {
    if (deletingExercise) {
      deleteExerciseMutation.mutate(deletingExercise.id);
    }
  };

  const addToRoutineMutation = useMutation({
    mutationFn: async ({ routineId, exerciseId, days, setsConfig }: { 
      routineId: string; 
      exerciseId: string; 
      days: string[]; 
      setsConfig: Array<{ reps: number; restPeriod: number }> 
    }) => {
      return apiRequest("POST", `/api/workout-routines/${routineId}/add-exercise`, {
        exerciseId,
        days,
        setsConfig,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-routines"] });
      toast({ title: "Exercise added to routine successfully" });
      setIsAddToRoutineDialogOpen(false);
      resetAddToRoutineDialog();
    },
    onError: () => {
      toast({ title: "Failed to add exercise to routine", variant: "destructive" });
    },
  });

  const handleOpenAddToRoutine = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsAddToRoutineDialogOpen(true);
  };

  const resetAddToRoutineDialog = () => {
    setSelectedExercise(null);
    setSelectedRoutineId("");
    setSelectedDays([]);
    setNumberOfSets(3);
    setPerSetConfig([
      { reps: 10, restPeriod: 90, weight: undefined },
      { reps: 10, restPeriod: 90, weight: undefined },
      { reps: 10, restPeriod: 90, weight: undefined },
    ]);
  };

  const handleAddToRoutine = () => {
    if (!selectedRoutineId || selectedDays.length === 0 || !selectedExercise) {
      toast({ title: "Please select a routine and at least one day", variant: "destructive" });
      return;
    }

    addToRoutineMutation.mutate({
      routineId: selectedRoutineId,
      exerciseId: selectedExercise.id,
      days: selectedDays,
      setsConfig: perSetConfig,
    });
  };

  const updateSetCount = (newCount: number) => {
    const count = Math.max(1, Math.min(10, newCount));
    setNumberOfSets(count);
    
    const currentConfig = [...perSetConfig];
    if (count > perSetConfig.length) {
      const lastSet = perSetConfig[perSetConfig.length - 1] || { reps: 10, restPeriod: 90 };
      for (let i = perSetConfig.length; i < count; i++) {
        currentConfig.push({ ...lastSet });
      }
    } else if (count < perSetConfig.length) {
      currentConfig.splice(count);
    }
    setPerSetConfig(currentConfig);
  };

  const updatePerSet = (index: number, field: 'reps' | 'restPeriod' | 'weight', value: string) => {
    const newConfig = [...perSetConfig];
    if (field === 'weight') {
      const weightValue = parseFloat(value);
      newConfig[index] = { 
        ...newConfig[index], 
        weight: isNaN(weightValue) || weightValue <= 0 ? undefined : weightValue 
      };
    } else {
      const numValue = parseInt(value) || (field === 'reps' ? 1 : 30);
      newConfig[index] = { ...newConfig[index], [field]: numValue };
    }
    setPerSetConfig(newConfig);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exercise.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesMuscleGroup = selectedMuscleGroup === "All" || 
      exercise.muscleGroup.toLowerCase() === selectedMuscleGroup.toLowerCase();
    const matchesTab = selectedTab === "all" || (selectedTab === "custom" && exercise.isCustom);
    return matchesSearch && matchesMuscleGroup && matchesTab;
  });

  return (
    <div className="pb-24 pt-8 max-w-6xl mx-auto">
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-4xl font-bold text-foreground" data-testid="text-page-title">Exercise Library</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="bg-primary text-primary-foreground hover-elevate" data-testid="button-create-exercise">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border border-card-border max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create Custom Exercise</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateExercise)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Bulgarian Split Squat"
                            data-testid="input-exercise-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="muscleGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Muscle Group</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-muscle-group">
                              <SelectValue placeholder="Select main muscle group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MUSCLE_GROUPS.filter(g => g !== "All").map((group) => (
                              <SelectItem key={group} value={group.toLowerCase()}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otherMuscleGroups"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Muscle Groups (Optional)</FormLabel>
                        <div className="grid grid-cols-2 gap-2 bg-card border border-card-border p-3 rounded-lg">
                          {MUSCLE_GROUPS.filter(g => g !== "All").map((group) => {
                            const groupValue = group.toLowerCase();
                            const currentValue = (field.value || []) as string[];
                            const isChecked = currentValue.includes(groupValue);
                            return (
                              <div key={group} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`other-muscle-${groupValue}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...currentValue, groupValue]);
                                    } else {
                                      field.onChange(currentValue.filter((v: string) => v !== groupValue));
                                    }
                                  }}
                                  data-testid={`checkbox-other-muscle-${groupValue}`}
                                />
                                <Label
                                  htmlFor={`other-muscle-${groupValue}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {group}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="exercise-image">Exercise Image (Optional)</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="exercise-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        data-testid="input-exercise-image"
                        className="cursor-pointer"
                      />
                      {isUploadingImage && (
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                      )}
                      {uploadedImageUrl && (
                        <div className="space-y-2">
                          <div className="relative w-full h-32 bg-card border border-card-border rounded-lg overflow-hidden">
                            <img
                              src={uploadedImageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setUploadedImageUrl("")}
                            data-testid="button-remove-uploaded-image"
                            className="w-full"
                          >
                            Remove Image
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-equipment">
                              <SelectValue placeholder="Select equipment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EQUIPMENT_OPTIONS.map((equipment) => (
                              <SelectItem key={equipment} value={equipment.toLowerCase()}>
                                {equipment}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isTimeBased"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="is-time-based"
                            data-testid="checkbox-is-time-based"
                          />
                        </FormControl>
                        <FormLabel htmlFor="is-time-based" className="font-normal cursor-pointer">
                          Time-based exercise (duration instead of reps)
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe how to perform this exercise..."
                            data-testid="input-exercise-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createExerciseMutation.isPending}
                    data-testid="button-save-exercise"
                  >
                    {createExerciseMutation.isPending ? "Creating..." : "Create Exercise"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-base text-muted-foreground">Browse {exercises.length}+ exercises</p>
      </div>

      {/* Edit Exercise Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border border-card-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Exercise</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateExercise)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Bulgarian Split Squat"
                        data-testid="input-edit-exercise-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="muscleGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Muscle Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-muscle-group">
                          <SelectValue placeholder="Select main muscle group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MUSCLE_GROUPS.filter(g => g !== "All").map((group) => (
                          <SelectItem key={group} value={group.toLowerCase()}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="otherMuscleGroups"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Muscle Groups (Optional)</FormLabel>
                    <div className="grid grid-cols-2 gap-2 bg-card border border-card-border p-3 rounded-lg">
                      {MUSCLE_GROUPS.filter(g => g !== "All").map((group) => {
                        const groupValue = group.toLowerCase();
                        const currentValue = (field.value || []) as string[];
                        const isChecked = currentValue.includes(groupValue);
                        return (
                          <div key={group} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-other-muscle-${groupValue}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...currentValue, groupValue]);
                                } else {
                                  field.onChange(currentValue.filter((v: string) => v !== groupValue));
                                }
                              }}
                              data-testid={`checkbox-edit-other-muscle-${groupValue}`}
                            />
                            <Label
                              htmlFor={`edit-other-muscle-${groupValue}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {group}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label htmlFor="edit-exercise-image">Exercise Image (Optional)</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="edit-exercise-image"
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    disabled={isUploadingEditImage}
                    data-testid="input-edit-exercise-image"
                    className="cursor-pointer"
                  />
                  {isUploadingEditImage && (
                    <p className="text-sm text-muted-foreground">Uploading image...</p>
                  )}
                  {editUploadedImageUrl && (
                    <div className="space-y-2">
                      <div className="relative w-full h-32 bg-card border border-card-border rounded-lg overflow-hidden">
                        <img
                          src={editUploadedImageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setEditUploadedImageUrl("")}
                        data-testid="button-remove-edit-uploaded-image"
                        className="w-full"
                      >
                        Remove Image
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
              </div>
              <FormField
                control={editForm.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-equipment">
                          <SelectValue placeholder="Select equipment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EQUIPMENT_OPTIONS.map((equipment) => (
                          <SelectItem key={equipment} value={equipment.toLowerCase()}>
                            {equipment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isTimeBased"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="edit-is-time-based"
                        data-testid="checkbox-edit-is-time-based"
                      />
                    </FormControl>
                    <FormLabel htmlFor="edit-is-time-based" className="font-normal cursor-pointer">
                      Time-based exercise (duration instead of reps)
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe how to perform this exercise..."
                        data-testid="input-edit-exercise-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={updateExerciseMutation.isPending}
                data-testid="button-update-exercise"
              >
                {updateExerciseMutation.isPending ? "Updating..." : "Update Exercise"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "all" | "custom")} className="w-full">
        <div className="px-4 mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-card border border-card-border">
            <TabsTrigger value="all" data-testid="tab-all-exercises">
              All Exercises
            </TabsTrigger>
            <TabsTrigger value="custom" data-testid="tab-custom-exercises">
              Custom Exercises
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={selectedTab} className="mt-0">
          {/* Search */}
          <div className="px-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-input border border-input rounded-md h-12 text-base"
                data-testid="input-search-exercises"
              />
            </div>
          </div>

          {/* Muscle Group Filter */}
          <ScrollArea className="w-full mb-8">
            <div className="flex gap-2 px-4 pb-3">
              {MUSCLE_GROUPS.map((group) => (
                <Badge
                  key={group}
                  variant={selectedMuscleGroup === group ? "default" : "secondary"}
                  className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm ${
                    selectedMuscleGroup === group 
                      ? "bg-card border border-card-border text-primary-foreground" 
                      : "bg-card border border-card-border"
                  }`}
                  onClick={() => setSelectedMuscleGroup(group)}
                  data-testid={`badge-filter-${group.toLowerCase()}`}
                >
                  {group}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Exercise Grid */}
          <div className="px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-card border border-card-border">
                    <CardContent className="p-5">
                      <Skeleton className="h-40 w-full mb-4 rounded-lg" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredExercises.length === 0 ? (
              <Card className="bg-card border border-card-border">
                <CardContent className="p-12 text-center">
                  <Dumbbell className="w-16 h-16 mx-auto mb-4 text-primary/40" />
                  <p className="text-muted-foreground text-lg font-medium">No exercises found</p>
                  <p className="text-sm text-muted-foreground mt-2">Try a different search or filter</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="bg-card border border-card-border hover:scale-[1.02] transition-transform relative" data-testid={`card-exercise-${exercise.id}`}>
                <CardContent className="p-5 relative">
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 bg-card border border-card-border"
                      onClick={() => handleEditExercise(exercise)}
                      data-testid={`button-edit-exercise-${exercise.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 bg-card border border-card-border"
                      onClick={() => setDeletingExercise(exercise)}
                      data-testid={`button-delete-exercise-${exercise.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  {exercise.imageUrl && (
                    <div className="aspect-video bg-card border border-card-border rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br from-primary/10 to-purple-500/10 overflow-hidden">
                      <img 
                        src={exercise.imageUrl} 
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                        data-testid="img-exercise"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs capitalize bg-card border border-card-border" data-testid="badge-muscle-group">
                      {exercise.muscleGroup}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize" data-testid="badge-equipment">
                      {exercise.equipment}
                    </Badge>
                    {exercise.isCustom && (
                      <Badge variant="default" className="text-xs bg-card border border-card-border" data-testid="badge-custom">
                        Custom
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2" data-testid="text-exercise-name">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{exercise.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 bg-card border border-card-border"
                    onClick={() => handleOpenAddToRoutine(exercise)}
                    data-testid={`button-add-to-routine-${exercise.id}`}
                  >
                    <ListPlus className="w-4 h-4 mr-2" />
                    Add to Routine
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add to Routine Dialog */}
      <Dialog 
        open={isAddToRoutineDialogOpen} 
        onOpenChange={(open) => {
          setIsAddToRoutineDialogOpen(open);
          if (!open) {
            resetAddToRoutineDialog();
          }
        }}
      >
        <DialogContent className="bg-card border border-card-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Add {selectedExercise?.name} to Routine
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Select Routine */}
            <div>
              <Label className="text-base font-medium mb-2 block">Select Routine</Label>
              {routines.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No routines found. Create a routine first in the Workouts tab.
                </p>
              ) : (
                <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId}>
                  <SelectTrigger data-testid="select-routine">
                    <SelectValue placeholder="Choose a routine..." />
                  </SelectTrigger>
                  <SelectContent>
                    {routines.map((routine) => (
                      <SelectItem key={routine.id} value={routine.id}>
                        {routine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Select Days */}
            <div>
              <Label className="text-base font-medium mb-3 block">Select Days</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={selectedDays.includes(day)}
                      onCheckedChange={() => toggleDay(day)}
                      data-testid={`checkbox-day-${day}`}
                    />
                    <Label
                      htmlFor={`day-${day}`}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {day === "any" ? "Any Day" : day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Configure Sets */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">Configure Sets</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateSetCount(numberOfSets - 1)}
                    disabled={numberOfSets <= 1}
                    data-testid="button-decrease-sets"
                  >
                    -
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">{numberOfSets}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateSetCount(numberOfSets + 1)}
                    disabled={numberOfSets >= 10}
                    data-testid="button-increase-sets"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {perSetConfig.map((set, index) => {
                  const isBodyweight = selectedExercise?.equipment?.toLowerCase() === "bodyweight";
                  
                  return (
                    <Card key={index} className="bg-card border border-card-border bg-muted/30">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium min-w-[40px]">Set {index + 1}</span>
                          <div className={`flex-1 grid gap-2 ${isBodyweight ? 'grid-cols-2' : 'grid-cols-3'}`}>
                            {!isBodyweight && (
                              <div>
                                <Label htmlFor={`weight-${index}`} className="text-xs text-muted-foreground mb-1 block">
                                  Weight (lbs)
                                </Label>
                                <Input
                                  id={`weight-${index}`}
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={set.weight || ""}
                                  onChange={(e) => updatePerSet(index, 'weight', e.target.value)}
                                  placeholder="Weight"
                                  className="h-9 text-sm"
                                  data-testid={`input-set-${index}-weight`}
                                />
                              </div>
                            )}
                            <div>
                              <Label htmlFor={`reps-${index}`} className="text-xs text-muted-foreground mb-1 block">
                                Reps
                              </Label>
                              <Input
                                id={`reps-${index}`}
                                type="number"
                                min="1"
                                value={set.reps}
                                onChange={(e) => updatePerSet(index, 'reps', e.target.value)}
                                placeholder="Reps"
                                className="h-9 text-sm"
                                data-testid={`input-set-${index}-reps`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`rest-${index}`} className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                Rest (s)
                              </Label>
                              <Input
                                id={`rest-${index}`}
                                type="number"
                                min="30"
                                max="300"
                                value={set.restPeriod}
                                onChange={(e) => updatePerSet(index, 'restPeriod', e.target.value)}
                                placeholder="Rest (s)"
                                className="h-9 text-sm"
                                data-testid={`input-set-${index}-rest`}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsAddToRoutineDialogOpen(false)}
                data-testid="button-cancel-add-to-routine"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddToRoutine}
                disabled={addToRoutineMutation.isPending || !selectedRoutineId || selectedDays.length === 0}
                data-testid="button-confirm-add-to-routine"
              >
                {addToRoutineMutation.isPending ? "Adding..." : "Add to Routine"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingExercise} onOpenChange={(open) => !open && setDeletingExercise(null)}>
        <AlertDialogContent className="bg-card border border-card-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingExercise?.name}"? This action cannot be undone.
              {deletingExercise && !deletingExercise.isCustom && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-500 font-medium">
                  Note: This is a seeded exercise. It will still be deleted if not in use.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExercise}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteExerciseMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteExerciseMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
