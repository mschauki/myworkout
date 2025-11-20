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
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-card-border z-50 safe-area-padding-bottom">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="flex items-center justify-around h-full max-w-6xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`link-nav-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center justify-center gap-1 min-h-[56px] min-w-[56px] px-3 rounded-lg transition-all relative ${
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover-elevate"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] rounded-b-full bg-gradient-to-r from-primary to-accent" data-testid={`indicator-active-${item.label.toLowerCase()}`} />
              )}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg" />
              )}
              <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5] gradient-text" : ""} relative z-10`} />
              <span className={`text-[10px] font-semibold uppercase tracking-wider relative z-10 ${isActive ? "gradient-text" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
