"use client";

// We need client-side React state and useEffect because this page
// fetches bookmark data from our backend after the page loads.
import { useEffect, useState } from "react";
import { BookmarkDetailDialog } from "@/components/dashboard/BookmarkDetailDialog";

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

export default function BookmarksPage() {
  // Stores the bookmarks returned by the backend.
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);

  // Tracks whether the API request is still running.
  const [loading, setLoading] = useState(true);

  // Stores an error message if fetching bookmarks fails.
  const [error, setError] = useState("");

  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkData | null>(
    null,
  );

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        // Fetch the authenticated user's bookmarks.
        const response = await fetch("/api/bookmarks");

        // Treat unsuccessful HTTP responses as errors.
        if (!response.ok) {
          throw new Error("Failed to fetch bookmarks");
        }

        // Convert the JSON response into JavaScript data.
        const data = await response.json();

        // Store the bookmarks so React can display them.
        setBookmarks(data);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);

        // Display an error message to the user.
        setError("Failed to load bookmarks");
      } finally {
        // Stop showing the loading state after the request finishes.
        setLoading(false);
      }
    }

    // Fetch bookmarks when the page first loads.
    fetchBookmarks(); //Because the dependency array is empty, the effect runs after the initial render, so we use it to fetch the bookmarks when the page loads.
  }, []);

  return (
    <div className="space-y-8">
      {/* Page heading and Add Bookmark button. */}
      <SectionHeader
        title="Bookmarks"
        subtitle="All your saved resources in one place"
        action={
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            // TODO: Connect this button to the Create Bookmark dialog.
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Bookmark
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              // TODO: Connect this button to the Create Bookmark dialog.
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
          // Replace the old bookmark with the updated bookmark in the list.
          setBookmarks((currentBookmarks) =>
            currentBookmarks.map((bookmark) =>
              bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark,
            ),
          );

          // Keep the detail dialog in sync with the updated bookmark.
          setSelectedBookmark(updatedBookmark);
        }}
      />
    </div>
  );
}

// REVISION NOTES:
//
// 1. Replaced placeholderBookmarks with real data from GET /api/bookmarks.
//
// 2. Added BookmarkData interface to describe the bookmark structure
//    returned by the backend, including its collection relationships.
//
// 3. Added loading and error states for the API request.
//
// 4. bookmarks state stores the authenticated user's actual bookmarks.
//
// 5. bookmark.favorite is passed to BookmarkCard instead of the old
//    hardcoded isFavorite value.
//
// 6. A bookmark can belong to multiple collections because of our
//    many-to-many relationship. The current BookmarkCard only accepts
//    one collection name, so the first collection is displayed temporarily.
//    BookmarkCard will be updated later to support multiple collections.
