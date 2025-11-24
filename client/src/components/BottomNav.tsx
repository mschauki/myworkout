import { Home, Dumbbell, Library, TrendingUp, User, Settings } from "lucide-react";
import { useLocation, Link } from "wouter";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/workouts", icon: Dumbbell, label: "Workouts" },
    { path: "/exercises", icon: Library, label: "Exercises" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-padding-bottom">
      {/* Background */}
      <div className="absolute inset-0 h-20 bg-background border-t border-border" />
      
      {/* Content */}
      <div className="relative flex items-center justify-around h-20 max-w-6xl mx-auto px-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                data-testid={`link-nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center justify-center gap-1 min-h-[56px] min-w-[56px] px-3 rounded-md transition-smooth relative group ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground hover-elevate"
                }`}
              >
                {/* Background pulse on active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-md bg-primary/5" />
                )}
                
                {/* Icon container */}
                <div className={`relative transition-smooth ${isActive ? "scale-110" : "scale-100"}`}>
                  <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                </div>
                
                {/* Label */}
                <span className="text-xs font-semibold tracking-tight">{item.label}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" data-testid={`indicator-active-${item.label.toLowerCase()}`} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
