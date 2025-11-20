import { Home, Dumbbell, Library, TrendingUp, User } from "lucide-react";
import { useLocation, Link } from "wouter";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/workouts", icon: Dumbbell, label: "Workouts" },
    { path: "/exercises", icon: Library, label: "Exercises" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 glass-surface-elevated z-50 safe-area-padding-bottom">
      <div className="flex items-center justify-around h-full max-w-6xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`link-nav-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[56px] px-3 rounded-lg transition-all relative ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground hover-elevate"
              }`}
            >
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r from-[hsl(210,85%,52%)] to-[hsl(25,85%,55%)]" data-testid={`indicator-active-${item.label.toLowerCase()}`} />
              )}
              <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-xs font-medium mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
