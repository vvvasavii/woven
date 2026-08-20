"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { BookmarkCard } from "@/components/dashboard/BookmarkCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Heart } from "lucide-react";

interface FavoriteBookmark {
  id: string;
  title: string;
  url: string;
  domain: string;
  favicon?: string | null;
  favorite: boolean;
  collections: {
    collection: {
      name: string;
    };
  }[];
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        <div className="text-sm text-destructive">
          {error}
        </div>
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
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              id={bookmark.id}
              title={bookmark.title}
              url={bookmark.url}
              domain={bookmark.domain}
              favicon={bookmark.favicon}
              // BookmarkCard currently expects one collection name,
              // so display the first collection for now.
              collection={
                bookmark.collections[0]?.collection.name ?? "Uncategorized"
              }
              isFavorite={bookmark.favorite}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="h-12 w-12" />}
          title="No favorites yet"
          description="Mark bookmarks as favorites to access them quickly"
        />
      )}
    </div>
  );
}