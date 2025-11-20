import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Dumbbell, Plus, Pencil } from "lucide-react";
import { Exercise, insertExerciseSchema } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
const EQUIPMENT_OPTIONS = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight", "Resistance Band", "Other"];

export default function Exercises() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const { toast } = useToast();

  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const form = useForm({
    resolver: zodResolver(insertExerciseSchema),
    defaultValues: {
      name: "",
      description: "",
      muscleGroup: "",
      equipment: "",
    },
  });

  const editForm = useForm({
    resolver: zodResolver(insertExerciseSchema),
    defaultValues: {
      name: "",
      description: "",
      muscleGroup: "",
      equipment: "",
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
    },
    onError: () => {
      toast({ title: "Failed to create exercise", variant: "destructive" });
    },
  });

  const handleCreateExercise = (data: any) => {
    createExerciseMutation.mutate(data);
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
      editForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update exercise", variant: "destructive" });
    },
  });

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    editForm.reset({
      name: exercise.name,
      description: exercise.description || "",
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateExercise = (data: any) => {
    if (editingExercise) {
      updateExerciseMutation.mutate({ id: editingExercise.id, data });
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscleGroup = selectedMuscleGroup === "All" || 
      exercise.muscleGroup.toLowerCase() === selectedMuscleGroup.toLowerCase();
    return matchesSearch && matchesMuscleGroup;
  });

  return (
    <div className="pb-24 pt-8 max-w-6xl mx-auto">
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h1 className="text-4xl font-bold gradient-text" data-testid="text-page-title">Exercise Library</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="glass-button" data-testid="button-create-exercise">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-surface-elevated">
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
                        <FormLabel>Muscle Group</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-muscle-group">
                              <SelectValue placeholder="Select muscle group" />
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
        <p className="text-base text-foreground/70">Browse {exercises.length}+ exercises</p>
      </div>

      {/* Edit Exercise Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-surface-elevated">
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
                    <FormLabel>Muscle Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-muscle-group">
                          <SelectValue placeholder="Select muscle group" />
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

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
          <Input
            type="search"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 glass-input h-12 text-base"
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
                  ? "glass-surface-elevated text-primary-foreground" 
                  : "glass-surface"
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
              <Card key={i} className="glass-surface">
                <CardContent className="p-5">
                  <Skeleton className="h-40 w-full mb-4 rounded-lg" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <Card className="glass-surface">
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-primary/40" />
              <p className="text-foreground/70 text-lg font-medium">No exercises found</p>
              <p className="text-sm text-foreground/50 mt-2">Try a different search or filter</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="glass-surface hover:scale-[1.02] transition-transform relative" data-testid={`card-exercise-${exercise.id}`}>
                <CardContent className="p-5">
                  {exercise.isCustom && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8 glass-surface"
                      onClick={() => handleEditExercise(exercise)}
                      data-testid={`button-edit-exercise-${exercise.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="aspect-video glass-surface rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br from-primary/10 to-purple-500/10 overflow-hidden">
                    {exercise.imageUrl ? (
                      <img 
                        src={exercise.imageUrl} 
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                        data-testid="img-exercise"
                      />
                    ) : (
                      <Dumbbell className="w-14 h-14 text-primary/50" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs capitalize glass-surface" data-testid="badge-muscle-group">
                      {exercise.muscleGroup}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize" data-testid="badge-equipment">
                      {exercise.equipment}
                    </Badge>
                    {exercise.isCustom && (
                      <Badge variant="default" className="text-xs glass-surface-elevated" data-testid="badge-custom">
                        Custom
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2" data-testid="text-exercise-name">{exercise.name}</h3>
                  <p className="text-sm text-foreground/60 line-clamp-2">{exercise.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
