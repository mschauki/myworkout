import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import Home from "@/pages/home";
import Exercises from "@/pages/exercises";
import Workouts from "@/pages/workouts";
import Progress from "@/pages/progress";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/exercises" component={Exercises} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/progress" component={Progress} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen overflow-y-auto bg-background text-foreground flex flex-col">
          {/* Header with theme toggle */}
          <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-end">
            <ThemeToggle />
          </header>
          
          {/* Main content */}
          <main className="flex-1">
            <Router />
          </main>
          
          {/* Bottom nav */}
          <BottomNav />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
