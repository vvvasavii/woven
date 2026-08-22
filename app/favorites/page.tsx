"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { BookmarkDetailDialog } from "@/components/dashboard/BookmarkDetailDialog";
import { useSearchParams } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { BookmarkCard } from "@/components/dashboard/BookmarkCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Heart } from "lucide-react";

interface FavoriteBookmark {
  id: string;
  title: string;
  url: string;
  description: string | null;
  domain: string | null;
  favicon: string | null;
  previewImage: string | null;
  notes: string | null;
  favorite: boolean;

  collections: {
    collection: {
      id: string;
      name: string;
    };
  }[];
}

function FavoritesContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const [favorites, setFavorites] = useState<FavoriteBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookmark, setSelectedBookmark] =
    useState<FavoriteBookmark | null>(null); //this stores the currently selected bookmark for the detail dialog, and it is initialized to null because no bookmark is selected when the page first loads.

  useEffect(() => {
    async function fetchFavorites() {
      try {
        setLoading(true);
        setError(null);

        // Fetch the authenticated user's favorite bookmarks.
        const response = await fetch("/api/favorites");

        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const data = await response.json();

        setFavorites(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setError("Failed to load your favorites.");
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, []);

  const filteredFavorites = useMemo(() => {
  
    //use memo means that the filteredFavorites will only be recalculated when either favorites or searchQuery changes, which can improve performance by avoiding unnecessary recalculations on every render.
    if (!searchQuery) {
      return favorites;
    }

    return favorites.filter((bookmark) => {
      return (
        bookmark.title.toLowerCase().includes(searchQuery)
      );
    });
  }, [favorites, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-8">
        <SectionHeader
          title="Favorites"
          subtitle="Quick access to your most important bookmarks"
        />

        <div className="text-sm text-muted-foreground">
          Loading favorites...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <SectionHeader
          title="Favorites"
          subtitle="Quick access to your most important bookmarks"
        />

        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader
        title="Favorites"
        subtitle="Quick access to your most important bookmarks"
      />

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFavorites.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              id={bookmark.id}
              title={bookmark.title}
              url={bookmark.url}
              domain={bookmark.domain ?? bookmark.url}
              favicon={bookmark.favicon}
              collection={
                bookmark.collections[0]?.collection.name ?? "Uncategorized"
              }
              isFavorite={bookmark.favorite}
              onClick={() => setSelectedBookmark(bookmark)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="h-12 w-12" />}
          title={searchQuery ? "No matching favorites" : "No favorites yet"}
          description={
            searchQuery
              ? "Try a different search term"
              : "Mark bookmarks as favorites to access them quickly"
          }
        />
      )}

      <BookmarkDetailDialog
        bookmark={selectedBookmark}
        open={selectedBookmark !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBookmark(null);
          }
        }}
        onBookmarkUpdated={(updatedBookmark) => {
          if (!updatedBookmark) {
            return;
          }

          // Replace the updated bookmark in the favorites list.
          setFavorites((currentFavorites) =>
            currentFavorites.map((bookmark) =>
              bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark,
            ),
          );

          // Keep the dialog showing the latest data.
          setSelectedBookmark(updatedBookmark);
        }}
      />
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
      <FavoritesContent />
    </Suspense>
  );
}
