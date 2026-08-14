"use client";

import { Search, Sun, Moon } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export function TopNav() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-10 pl-10 pr-4 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            // TODO: Implement search functionality when backend is integrated
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Placeholder */}
        <button
          className="p-2 rounded-lg hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface"
          aria-label="Toggle theme"
          // TODO: Implement theme toggle functionality
        >
          <Sun className="h-5 w-5 dark:hidden" />
          <Moon className="h-5 w-5 hidden dark:block" />
        </button>

        {/* Auth Controls */}
        {!isSignedIn ? (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        ) : (
          <UserButton />
        )}
      </div>
    </header>
  );
}
