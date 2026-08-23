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
  // Keeps the favorite state in sync with the UI.
  const [favorite, setFavorite] = useState(isFavorite);

  // Updates the favorite state in the database.
  async function handleFavorite() {
    const newFavorite = !favorite;

    try {
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

      // Only update the UI after the database update succeeds.
      setFavorite(newFavorite);
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  }

  return (
    <div
      // Clicking anywhere on the card body opens the bookmark details.
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className="group bg-background/70 shadow-sm shadow-amber-950 border-border rounded-lg p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md hover:bg-card/80 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Favicon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className="h-6 w-6 object-contain"
            />
          ) : (
            <Globe className="h-5 w-5 text-foreground/80 group-hover:text-fuchsia-100 "  />
          )}
        </div>

        {/* Bookmark information */}
        <div className="flex-1 min-w-0">
          {/* ONLY the bookmark title opens the saved website. */}
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              // Prevent the card's onClick from running.
              event.stopPropagation();
            }}
            className="inline-block max-w-full text-sm sm:text-base font-medium text-foreground break-words mb-1 group-hover:text-fuchsia-100 hover:underline"
          >
            {title}
          </Link>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground group-hover:text-fuchsia-100 ">
            <div className="flex items-center gap-1.5 min-w-0">
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{domain}</span>
            </div>

            <span className="text-muted-foreground/40 flex-shrink-0 group-hover:text-fuchsia-100 ">
              •
            </span>

            {/* Collection information is part of the card body. */}
            <span className="truncate">{collection}</span>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(event) => {
            // Prevent the card click from opening bookmark details.
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
            className={`h-4 sm:h-5 w-4 sm:w-5 transition-colors ${
              favorite
                ? "text-rose-700 fill-rose-700"
                : "text-foreground/40 hover:text-foreground/70"
            }`}
          />
        </button>
      </div>
    </div>
  );
}