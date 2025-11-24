import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: "light" | "dark";
};

const initialState: ThemeProviderState = {
  theme: "system",
  effectiveTheme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Guard against SSR/test environments
    if (typeof window === "undefined") {
      return defaultTheme;
    }
    return (localStorage.getItem("theme") as Theme) || defaultTheme;
  });

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    
    // If theme is explicitly set, use it
    const storedTheme = localStorage.getItem("theme") as Theme;
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
    
    // Otherwise check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  // Apply the effective theme to the DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
  }, [effectiveTheme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setEffectiveTheme(e.matches ? "dark" : "light");
    };

    // Set initial value
    handleChange(mediaQuery);

    // Listen for changes - use addListener for Safari compatibility
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older Safari versions
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        // Fallback for older Safari versions
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);

  // Update effective theme when theme preference changes
  useEffect(() => {
    if (theme === "light" || theme === "dark") {
      setEffectiveTheme(theme);
    } else if (theme === "system" && typeof window !== "undefined") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setEffectiveTheme(isDark ? "dark" : "light");
    }
  }, [theme]);

  const value = {
    theme,
    effectiveTheme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", newTheme);
      }
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
