"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, User, LogOut, Settings, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="w-full py-4 px-6 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black shadow-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="text-xl font-bold tracking-tight">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              YE
            </span>
            <span className="hidden sm:inline dark:text-white">You Education</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {session && (
            <>
              <Link 
                href="/" 
                className="text-sm text-gray-600 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors hidden sm:block"
              >
                Dashboard
              </Link>
            </>
          )}
          
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
          
          {session && (
             <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Profile menu"
                className="h-9 w-9 rounded-full border-gray-200 dark:border-white/20"
              >
                <UserCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              { (
                <>
                  <div className="px-2 py-2 mb-2">
                    <div className="font-medium">{session.user?.name || "User"}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session.user?.email}
                    </div>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-800 my-1"></div>
                  <div className="grid gap-1">
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      href="/settings" 
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <div className="h-px bg-gray-200 dark:bg-gray-800 my-1"></div>
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </PopoverContent>
          </Popover>
          )}
         
        </div>
      </div>
    </nav>
  );
}