"use client";

// Dashboard needs client-side state because it fetches real data
// and opens the create/detail dialogs.
import { useEffect, useState, useMemo, Suspense } from "react";

import {
  Plus, Bookmark as BookmarkIcon,
  LayoutDashboard,
  Heart,
  FolderKanban,
} from "lucide-react";

import { useSearchParams } from "next/navigation";

import { BookmarkCard } from "@/components/dashboard/BookmarkCard";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { BookmarkDetailDialog } from "@/components/dashboard/BookmarkDetailDialog";
import { CreateBookmarkDialog } from "@/components/dashboard/CreateBookmarkDialog";
import { CreateCollectionDialog } from "@/components/collections/CreateCollectionDialog";

interface BookmarkData {
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

interface CollectionData {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  _count: {
    bookmarks: number;
  };
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkData | null>(
    null,
  );

  const [createBookmarkOpen, setCreateBookmarkOpen] = useState(false);

  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);

  const [creatingCollection, setCreatingCollection] = useState(false);
  const [createCollectionError, setCreateCollectionError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch bookmarks and collections from the backend.
        const [bookmarksResponse, collectionsResponse] = await Promise.all([
          fetch("/api/bookmarks"),
          fetch("/api/collections"),
        ]);

        if (!bookmarksResponse.ok || !collectionsResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [bookmarksData, collectionsData] = await Promise.all([
          bookmarksResponse.json(),
          collectionsResponse.json(),
        ]);

        setBookmarks(bookmarksData);
        setCollections(collectionsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  async function handleCreateCollection(data: {
    name: string;
    description: string;
    coverImage: string | null;
  }) {
    setCreatingCollection(true);
    setCreateCollectionError("");

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || undefined,
          coverImage: data.coverImage || undefined,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create collection");
      }

      const newCollection: CollectionData = {
        ...responseData,
        _count: {
          bookmarks: 0,
        },
      };

      setCollections((currentCollections) => [
        newCollection,
        ...currentCollections,
      ]);

      setCreateCollectionOpen(false);
    } catch (error) {
      console.error("Error creating collection:", error);

      setCreateCollectionError(
        error instanceof Error ? error.message : "Failed to create collection",
      );
    } finally {
      setCreatingCollection(false);
    }
  }

  const favoriteCount = bookmarks.filter(
    (bookmark) => bookmark.favorite,
  ).length;

  // Dashboard search only checks bookmark titles and collection names.
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) {
      return bookmarks;
    }

    return bookmarks.filter((bookmark) =>
      bookmark.title.toLowerCase().includes(searchQuery),
    );
  }, [bookmarks, searchQuery]);

  const filteredCollections = useMemo(() => {
    if (!searchQuery) {
      return collections;
    }

    return collections.filter((collection) =>
      collection.name.toLowerCase().includes(searchQuery),
    );
  }, [collections, searchQuery]);

  // Dashboard shows only the six most recent bookmarks and collections.
  const recentBookmarks = filteredBookmarks.slice(0, 6);
  const recentCollections = filteredCollections.slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Library Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
            Your library
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground">
            {bookmarks.length} resources across {collections.length} collections
          </p>
        </div>

        {/* Compact Statistics */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Bookmarks:</span>
            <span className="font-medium text-foreground">
              {bookmarks.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Collections:</span>
            <span className="font-medium text-foreground">
              {collections.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Favorites:</span>
            <span className="font-medium text-foreground">{favoriteCount}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCreateCollectionOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Collection
          </button>

          <button
            type="button"
            onClick={() => setCreateBookmarkOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <BookmarkIcon className="h-4 w-4" />
            Save Bookmark
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <p className="text-muted-foreground">Loading your library...</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <>
          {/* Recent Bookmarks */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Recently saved
              </h2>
            </div>

            {recentBookmarks.length > 0 ? (
              <div className="space-y-3">
                {recentBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    id={bookmark.id}
                    title={bookmark.title}
                    url={bookmark.url}
                    domain={bookmark.domain ?? bookmark.url}
                    favicon={bookmark.favicon}
                    collection={
                      bookmark.collections[0]?.collection.name ??
                      "Uncategorized"
                    }
                    isFavorite={bookmark.favorite}
                    onClick={() => setSelectedBookmark(bookmark)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No bookmarks match your search."
                  : "No bookmarks yet."}
              </p>
            )}
          </section>

          {/* Collections */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Collections
              </h2>
            </div>

            {collections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {recentCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    id={collection.id}
                    name={collection.name}
                    count={collection._count.bookmarks}
                    description={collection.description ?? ""}
                    coverImage={collection.coverImage}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No collections match your search."
                  : "No collections yet."}
              </p>
            )}
          </section>
        </>
      )}

      {/* Bookmark detail dialog */}
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

          setBookmarks((currentBookmarks) =>
            currentBookmarks.map((bookmark) =>
              bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark,
            ),
          );

          setSelectedBookmark(updatedBookmark);
        }}
      />

      {/* Create bookmark dialog */}
      <CreateBookmarkDialog
        open={createBookmarkOpen}
        onOpenChange={setCreateBookmarkOpen}
        onBookmarkCreated={async () => {
          // Refresh dashboard data after creating a bookmark.
          const response = await fetch("/api/bookmarks");

          if (!response.ok) {
            throw new Error("Failed to refresh bookmarks");
          }

          const data = await response.json();
          setBookmarks(data);
        }}
      />

      <CreateCollectionDialog
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
        onCreateCollection={handleCreateCollection}
        isCreating={creatingCollection}
        error={createCollectionError}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
