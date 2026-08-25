"use client";

// We need client-side React state and useEffect because this page
// fetches bookmark data from our backend after the page loads.
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookmarkDetailDialog } from "@/components/dashboard/BookmarkDetailDialog";
import { CreateBookmarkDialog } from "@/components/dashboard/CreateBookmarkDialog";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { BookmarkCard } from "@/components/dashboard/BookmarkCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Bookmark, Plus } from "lucide-react";

// Describes the bookmark shape returned by GET /api/bookmarks.
interface BookmarkData {
  // actyally this what we intend to use from the get api,and even if there were some extra fields in get api,we dont need to use them all,,,so alli mean is that we can ignore any extra fields that we dont need to use in our frontend.
  id: string;
  title: string;
  url: string;
  description: string | null;
  domain: string | null;
  favicon: string | null;
  previewImage: string | null;
  notes: string | null;
  favorite: boolean;

  // A bookmark can belong to multiple collections.
  collections: {
    collection: {
      id: string;
      name: string;
    };
  }[];
}

function BookmarksContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";

  // Stores the bookmarks returned by the backend.
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);

  // Tracks whether the API request is still running.
  const [loading, setLoading] = useState(true);

  // Stores an error message if fetching bookmarks fails.
  const [error, setError] = useState("");

  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkData | null>(
    null,
  );

  // Controls whether the Create Bookmark dialog is open.
  const [createBookmarkOpen, setCreateBookmarkOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookmarks() {
      try {
        const response = await fetch(
          `/api/bookmarks${search ? `?q=${encodeURIComponent(search)}` : ""}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bookmarks");
        }

        const data = await response.json();

        if (!cancelled) {
          setBookmarks(data);
          setError("");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching bookmarks:", error);

        if (!cancelled) {
          setError("Failed to load bookmarks");
          setLoading(false);
        }
      }
    }

    fetchBookmarks();

    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <div className="space-y-8">
      {/* Page heading and Add Bookmark button. */}
      <SectionHeader
        title="Bookmarks"
        subtitle="All your saved resources in one place"
        action={
          <button
            type="button"
            onClick={() => setCreateBookmarkOpen(true)}
            className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Bookmark</span>
              <span className="sm:hidden">Add</span>
            </span>
          </button>
        }
      />

      {/* Show loading, error, bookmarks, or empty state. */}
      {loading ? (
        // Displayed while GET /api/bookmarks is running.
        <p className="text-muted-foreground">Loading bookmarks...</p>
      ) : error ? (
        // Displayed if the API request fails.
        <p className="text-destructive">{error}</p>
      ) : bookmarks.length > 0 ? (
        // Display the real bookmarks returned by the backend.
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((bookmark) => (
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
        // Displayed when the authenticated user has no bookmarks.
        <EmptyState
          icon={<Bookmark className="h-12 w-12" />}
          title="No bookmarks yet"
          description="Save your first bookmark to start building your knowledge library"
          action={
            <button
              type="button"
              onClick={() => setCreateBookmarkOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Add Bookmark
            </button>
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
          // Ignore the update if the dialog did not return a bookmark.
          if (!updatedBookmark) {
            return;
          }

          // Replace the edited bookmark in the page's local bookmark list.
          setBookmarks((currentBookmarks) =>
            currentBookmarks.map((bookmark) =>
              bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark,
            ),
          );

          // Keep the detail dialog showing the latest bookmark data.
          setSelectedBookmark(updatedBookmark);
        }}
        onBookmarkDeleted={(deletedBookmarkId) => {
          // Remove the deleted bookmark from the page immediately.
          setBookmarks((currentBookmarks) =>
            currentBookmarks.filter(
              (bookmark) => bookmark.id !== deletedBookmarkId,
            ),
          );

          // Close the detail dialog after deletion.
          setSelectedBookmark(null);
        }}
      />

      <CreateBookmarkDialog
        open={createBookmarkOpen}
        onOpenChange={setCreateBookmarkOpen}
        onBookmarkCreated={async () => {
          // Re-fetch bookmarks so the newly created bookmark appears immediately.
          const response = await fetch("/api/bookmarks");

          if (!response.ok) {
            throw new Error("Failed to refresh bookmarks");
          }

          const data = await response.json();
          setBookmarks(data);
        }}
      />
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <Suspense
      fallback={<div className="text-muted-foreground">Loading...</div>}
    >
      <BookmarksContent />
    </Suspense>
  );
}
