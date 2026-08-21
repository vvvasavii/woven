"use client";

// Dashboard needs client-side state because it fetches real data
// and opens the create/detail dialogs.
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CollectionImageUpload } from "@/components/collections/CollectionImageUpload";

import {
  Plus,
  Search,
  Bookmark as BookmarkIcon,
  LayoutDashboard,
  Heart,
  FolderKanban,
} from "lucide-react";

import { BookmarkCard } from "@/components/dashboard/BookmarkCard";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { BookmarkDetailDialog } from "@/components/dashboard/BookmarkDetailDialog";
import { CreateBookmarkDialog } from "@/components/dashboard/CreateBookmarkDialog";

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

export default function DashboardPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkData | null>(
    null,
  );

  const [createBookmarkOpen, setCreateBookmarkOpen] = useState(false);

  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);

  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionCoverImage, setCollectionCoverImage] = useState<
    string | null
  >(null);
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

  async function handleCreateCollection(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setCreatingCollection(true);
    setCreateCollectionError("");

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: collectionName,
          description: collectionDescription || undefined,
          coverImage: collectionCoverImage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create collection");
      }

      const newCollection: CollectionData = {
        ...data,
        _count: {
          bookmarks: 0,
        },
      };

      setCollections((currentCollections) => [
        newCollection,
        ...currentCollections,
      ]);

      setCollectionName("");
      setCollectionDescription("");
      setCollectionCoverImage(null);

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

  const recentBookmarks = bookmarks.slice(0, 6);
  const recentCollections = collections.slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Library Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Your library
          </h1>

          <p className="text-lg text-muted-foreground">
            {bookmarks.length} resources across {collections.length} collections
          </p>
        </div>

        {/* Compact Statistics */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
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

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Search className="h-4 w-4" />
            Search Resources
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
              <p className="text-sm text-muted-foreground">No bookmarks yet.</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                No collections yet.
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

      <Dialog
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Create a collection to organize your bookmarks.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCollection} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="dashboard-collection-name"
                className="text-sm font-medium"
              >
                Name
              </label>

              <input
                id="dashboard-collection-name"
                value={collectionName}
                onChange={(event) => setCollectionName(event.target.value)}
                placeholder="e.g. Frontend"
                maxLength={100}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dashboard-collection-description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="dashboard-collection-description"
                value={collectionDescription}
                onChange={(event) =>
                  setCollectionDescription(event.target.value)
                }
                placeholder="What is this collection for?"
                maxLength={500}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>

              <CollectionImageUpload
                value={collectionCoverImage}
                onChange={setCollectionCoverImage}
              />
            </div>

            {createCollectionError && (
              <p className="text-sm text-destructive">
                {createCollectionError}
              </p>
            )}

            <DialogFooter>
              <button
                type="button"
                onClick={() => setCreateCollectionOpen(false)}
                disabled={creatingCollection}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creatingCollection}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {creatingCollection ? "Creating..." : "Create"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
