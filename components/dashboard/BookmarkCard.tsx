"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ExternalLink, Globe } from "lucide-react";

interface BookmarkCardProps {
  id: string;
  title: string;
  url: string;
  domain: string;
  collection: string;
  favicon?: string | null;
  isFavorite?: boolean;
  onClick?: () => void;
}

export function BookmarkCard({
  id,
  title,
  url,
  domain,
  collection,
  favicon,
  isFavorite = false,
  onClick,
}: BookmarkCardProps) {
  // Keeps track of the current favorite state in the UI.
  const [favorite, setFavorite] = useState(isFavorite);

  // Handles clicking the favorite button.
  async function handleFavorite() {
    const newFavorite = !favorite;

    try {
      // Update the favorite value in the database.
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favorite: newFavorite,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }

      // Update the UI only after the database update succeeds.
      setFavorite(newFavorite);
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  }

  return (
    <div
      // Clicking the card body will eventually open bookmark details.
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className="group bg-background border border-border rounded-lg p-4 hover:-translate-y-0.5 hover:shadow-md hover:bg-card/50 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
    >
      <div className="flex items-start gap-4">

        {/* Favicon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--chip-background)] flex items-center justify-center overflow-hidden">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className="h-6 w-6 object-contain"
            />
          ) : (
            <Globe className="h-5 w-5 text-foreground/70" />
          )}
        </div>

        {/* Bookmark information */}
        <div className="flex-1 min-w-0">

          {/* Clicking the bookmark name opens the saved website. */}
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              // Stop the card click from also firing.
              event.stopPropagation();
            }}
            className="inline-block text-base font-medium text-foreground truncate mb-1 hover:underline"
          >
            {title}
          </Link>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 min-w-0">
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{domain}</span>
            </div>

            <span className="text-muted-foreground/40">•</span>

            {/* Currently displaying the first collection name. */}
            <span className="truncate">{collection}</span>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(event) => {
            // Stop the card click from also firing.
            event.stopPropagation();

            handleFavorite();
          }}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-[var(--chip-background)] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          aria-label={
            favorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              favorite
                ? "text-rose-400 fill-rose-400"
                : "text-foreground/40 hover:text-foreground/70"
            }`}
          />
        </button>
      </div>
    </div>
  );
}