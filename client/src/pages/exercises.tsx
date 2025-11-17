import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Dumbbell } from "lucide-react";
import { Exercise } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export default function Exercises() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");

  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscleGroup = selectedMuscleGroup === "All" || 
      exercise.muscleGroup.toLowerCase() === selectedMuscleGroup.toLowerCase();
    return matchesSearch && matchesMuscleGroup;
  });

  return (
    <div className="pb-20 pt-6 max-w-6xl mx-auto">
      <div className="px-4 mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Exercise Library</h1>
        <p className="text-muted-foreground">Browse {exercises.length}+ exercises</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-exercises"
          />
        </div>
      </div>

      {/* Muscle Group Filter */}
      <ScrollArea className="w-full mb-6">
        <div className="flex gap-2 px-4 pb-2">
          {MUSCLE_GROUPS.map((group) => (
            <Badge
              key={group}
              variant={selectedMuscleGroup === group ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap"
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
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full mb-3 rounded-md" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No exercises found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search or filter</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="hover-elevate" data-testid={`card-exercise-${exercise.id}`}>
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                    <Dumbbell className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs capitalize" data-testid="badge-muscle-group">
                      {exercise.muscleGroup}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize" data-testid="badge-equipment">
                      {exercise.equipment}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-medium mb-1" data-testid="text-exercise-name">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
