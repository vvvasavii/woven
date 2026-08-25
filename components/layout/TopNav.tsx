"use client";

import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect, useRef } from "react";

function TopNavContent() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 sm:px-6">
        {" "}
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-hover text-neutral-200 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Search Bar - hidden on home page */}
        {pathname !== "/" && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                defaultValue={searchParams.get("q") ?? ""}
                onChange={(event) => {
                  const value = event.target.value;

                  const params = new URLSearchParams(searchParams.toString());

                  if (value) {
                    params.set("q", value);
                  } else {
                    params.delete("q");
                  }

                  router.push(`${pathname}?${params.toString()}`);
                }}
                className="w-full h-10 pl-10 pr-4 bg-slate-950 border border-input rounded-lg text-sm text-gray-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}
        {/* Right Actions */}
        <div className={`flex items-center gap-3 ${pathname === "/" ? "ml-auto" : ""}`}>
          {/* Auth Controls */}
          {!isSignedIn ? (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="px-3 sm:px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-3 sm:px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          ) : (
            <UserButton
              appearance={{
                variables: {
                  colorForeground: "#ffffff",
                  colorMutedForeground: "#d6c5b8",
                  colorDanger: "#ff2400",
                },

                elements: {
                  userButtonAvatarBox: {
                    width: "35px",
                    height: "35px",
                    border: "2px solid rgba(255, 255, 255, 0.4)",
                    borderRadius: "9999px",
                  },
                },
              }}
              userProfileProps={{
                appearance: {
                  variables: {
                    colorForeground: "#ffffff",
                    colorMutedForeground: "#d6c5b8",
                    colorDanger: "#ff2400",
                  },
                },
              }}
            />
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[75vw] bg-sidebar border-r border-sidebar-border"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <span className="font-elsie text-xl font-semibold text-sidebar-foreground">
                Woven
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <X className="h-5 w-5 text-sidebar-foreground" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <a
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
              >
                Dashboard
              </a>
              <Link
                href="/collections"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
              >
                Collections
              </Link>
              <a
                href="/bookmarks"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
              >
                Bookmarks
              </a>
              <a
                href="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
              >
                Favorites
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export function TopNav() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-30 h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6">
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
          </div>
        </header>
      }
    >
      <TopNavContent />
    </Suspense>
  );
}
