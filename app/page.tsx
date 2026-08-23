import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6">
      <div className="max-w-2xl space-y-8 text-center">
        {/* Main product message */}
        <div className="space-y-4">
          <h1 className="font-elsie text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Welcome to Woven
          </h1>

          <p className="text-xl text-muted-foreground sm:text-2xl">
            Because “I’ll find it later” is a lie.
          </p>
        </div>

        {/* Core features */}
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Bookmarks <span className="mx-2">·</span>
          Collections <span className="mx-2">·</span>
          Favorites <span className="mx-2">·</span>
          Smart Link Preview
        </p>

        {/* Authentication actions for signed-out users */}
        <Show when="signed-out">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <SignUpButton mode="modal">
              <button className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto">
                Sign Up
              </button>
            </SignUpButton>

            <SignInButton mode="modal">
              <button className="w-full rounded-lg border border-border bg-background/70 px-6 py-3 font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto">
                Sign In
              </button>
            </SignInButton>
          </div>
        </Show>

        {/* Quick navigation for signed-in users */}
        <Show when="signed-in">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your library is waiting.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/bookmarks"
                className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
              >
                Save a Bookmark
              </Link>

              <Link
                href="/collections"
                className="w-full rounded-lg border border-border bg-background/70 px-6 py-3 font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
              >
                Browse Collections
              </Link>

              <Link
                href="/favorites"
                className="w-full rounded-lg border border-border bg-background/70 px-6 py-3 font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
              >
                View Favorites
              </Link>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}