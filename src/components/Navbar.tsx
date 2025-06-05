"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="w-full py-4 px-6 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black shadow-sm sticky top-0 z-10">
      <div className="container max-w-6xl mx-auto flex items-center justify-between">
        <div className="text-xl font-bold tracking-tight">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              YE
            </span>
            <span className="hidden sm:inline dark:text-white">You Education</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="text-sm text-gray-600 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors hidden sm:block"
          >
            Dashboard
          </Link>
          <Link 
            href="/exams" 
            className="text-sm text-gray-600 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors hidden sm:block"
          >
            Exams
          </Link>
          <Link 
            href="/profile" 
            className="text-sm text-gray-600 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors hidden sm:block"
          >
            Profile
          </Link>
          
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-full border-gray-200 dark:border-white/20"
            >
              {theme === "dark" ? 
                <Sun className="h-4 w-4" /> : 
                <Moon className="h-4 w-4" />
              }
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}