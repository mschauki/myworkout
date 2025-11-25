import { useState } from "react";
import { Home, Dumbbell, Library, TrendingUp, User, Settings } from "lucide-react";
import { useLocation } from "wouter";
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

const ACTIVE_WORKOUT_STORAGE_KEY = "jefit-active-workout";

interface NavItemProps {
  path: string;
  icon: typeof Home;
  label: string;
  isActive: boolean;
  onNavigate: (path: string) => void;
}

function NavItem({ path, icon: Icon, label, isActive, onNavigate }: NavItemProps) {
  return (
    <button
      onClick={() => onNavigate(path)}
      data-testid={`link-nav-${label.toLowerCase()}`}
      className={`flex flex-col items-center justify-center gap-1 min-h-[56px] min-w-[56px] px-3 rounded-md transition-smooth relative group ${
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground hover-elevate"
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 rounded-md bg-primary/5" />
      )}
      
      <div className={`relative transition-smooth ${isActive ? "scale-110" : "scale-100"}`}>
        <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
      </div>
      
      <span className="text-xs font-semibold tracking-tight">{label}</span>
      
      {isActive && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" data-testid={`indicator-active-${label.toLowerCase()}`} />
      )}
    </button>
  );
}

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/workouts", icon: Dumbbell, label: "Workouts" },
    { path: "/exercises", icon: Library, label: "Exercises" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const hasActiveWorkout = () => {
    try {
      const stored = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
      return stored !== null;
    } catch {
      return false;
    }
  };

  const clearActiveWorkout = () => {
    try {
      localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear active workout:", error);
    }
  };

  const handleNavigate = (path: string) => {
    if (path === location) return;
    
    if (location === "/workouts" && hasActiveWorkout() && path !== "/workouts") {
      setPendingNavigation(path);
      setShowExitDialog(true);
    } else {
      setLocation(path);
    }
  };

  const handleDiscardAndNavigate = () => {
    clearActiveWorkout();
    setShowExitDialog(false);
    if (pendingNavigation) {
      setLocation(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-padding-bottom">
        <div className="absolute inset-0 h-20 glass-card-lg border-t" style={{ background: "rgba(255,255,255,0.1)" }} />
        
        <div className="relative flex items-center justify-around h-20 max-w-6xl mx-auto px-2">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              path={item.path}
              icon={item.icon}
              label={item.label}
              isActive={location === item.path}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      </nav>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="glass-modal" data-testid="dialog-nav-exit-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Active Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              You have a workout in progress. If you leave now, your unsaved progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancelNavigation}
              className="glass-button"
              data-testid="button-nav-stay"
            >
              Stay
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDiscardAndNavigate}
              data-testid="button-nav-leave"
            >
              Leave Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
