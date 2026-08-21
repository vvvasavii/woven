"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Globe, Heart } from "lucide-react";

interface Collection {
  id: string;
  name: string;
}

interface BookmarkDetailDialogProps {
  bookmark: {
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
      collection: Collection;
    }[];
  } | null;

  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Lets the parent page update its bookmark list after changes.
  onBookmarkUpdated?: (bookmark: BookmarkDetailDialogProps["bookmark"]) => void;
}

export function BookmarkDetailDialog({
  bookmark,
  open,
  onOpenChange,
  onBookmarkUpdated,
}: BookmarkDetailDialogProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    []
  );
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [savingCollections, setSavingCollections] = useState(false);
  const [collectionError, setCollectionError] = useState("");

  // Load the user's collections when the collection selector is opened.
  useEffect(() => {
    if (!showCollectionSelector) {
      return;
    }

    async function fetchCollections() {
      try {
        setLoadingCollections(true);
        setCollectionError("");

        const response = await fetch("/api/collections");

        if (!response.ok) {
          throw new Error("Failed to fetch collections");
        }

        const data = await response.json();

        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setCollectionError("Failed to load collections");
      } finally {
        setLoadingCollections(false);
      }
    }

    fetchCollections();
  }, [showCollectionSelector]);


  if (!bookmark) {
    return null;
  }

  const currentBookmark = bookmark;

  function toggleCollection(collectionId: string) {
    setSelectedCollectionIds((currentIds) => {
      if (currentIds.includes(collectionId)) {
        return currentIds.filter((id) => id !== collectionId);
      }

      return [...currentIds, collectionId];
    });
  }

  async function saveCollections() {
    try {
      setSavingCollections(true);
      setCollectionError("");

      const response = await fetch(
        `/api/bookmarks/${currentBookmark.id}/collections`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            collectionIds: selectedCollectionIds,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update collections");
      }

      const updatedBookmark = await response.json();

      // Update the local bookmark list in the parent page.
      onBookmarkUpdated?.(updatedBookmark);

      // Close the selector after a successful save.
      setShowCollectionSelector(false);
    } catch (error) {
      console.error("Error updating bookmark collections:", error);
      setCollectionError("Failed to update collections");
    } finally {
      setSavingCollections(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-8">
            {/* Favicon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--chip-background)] flex items-center justify-center overflow-hidden">
              {bookmark.favicon ? (
                <img
                  src={bookmark.favicon}
                  alt=""
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <Globe className="h-5 w-5 text-foreground/70" />
              )}
            </div>

            <div className="min-w-0">
              <DialogTitle className="break-words">
                {bookmark.title}
              </DialogTitle>

              <DialogDescription className="mt-1 break-all">
                {bookmark.domain ?? bookmark.url}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Preview image */}
          {bookmark.previewImage && (
            <div className="overflow-hidden rounded-lg border border-border">
              <img
                src={bookmark.previewImage}
                alt=""
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          {bookmark.description && (
            <div>
              <h3 className="text-sm font-medium mb-1">Description</h3>

              <p className="text-sm text-muted-foreground">
                {bookmark.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {bookmark.notes && (
            <div>
              <h3 className="text-sm font-medium mb-1">My Notes</h3>

              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {bookmark.notes}
              </p>
            </div>
          )}

          {/* Collections */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Collections</h3>

              <button
  type="button"
  onClick={() => {
    if (!showCollectionSelector) {
      // Pre-select collections that already belong to this bookmark.
      setSelectedCollectionIds(
        bookmark.collections.map(({ collection }) => collection.id)
      );

      setCollectionError("");
    }

    setShowCollectionSelector((current) => !current);
  }}
  className="text-sm text-primary hover:underline"
>
  {showCollectionSelector
    ? "Cancel"
    : "Add to Collection"}
</button>
            </div>

            {bookmark.collections.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {bookmark.collections.map(({ collection }) => (
                  <span
                    key={collection.id}
                    className="px-2.5 py-1 rounded-full bg-[var(--chip-background)] text-sm"
                  >
                    {collection.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Uncategorized
              </p>
            )}

            {/* Collection selector */}
            {showCollectionSelector && (
              <div className="mt-3 space-y-3 rounded-lg border border-border p-3">
                {loadingCollections ? (
                  <p className="text-sm text-muted-foreground">
                    Loading collections...
                  </p>
                ) : collections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    You don&apos;t have any collections yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {collections.map((collection) => (
                      <label
                        key={collection.id}
                        className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-[var(--chip-background)] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCollectionIds.includes(
                            collection.id
                          )}
                          onChange={() =>
                            toggleCollection(collection.id)
                          }
                          className="h-4 w-4"
                        />

                        <span className="text-sm">
                          {collection.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {collectionError && (
                  <p className="text-sm text-destructive">
                    {collectionError}
                  </p>
                )}

                {collections.length > 0 && (
                  <button
                    type="button"
                    onClick={saveCollections}
                    disabled={savingCollections}
                    className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {savingCollections ? "Saving..." : "Save Collections"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Favorite status */}
          <div className="flex items-center gap-2 text-sm">
            <Heart
              className={`h-4 w-4 ${
                bookmark.favorite
                  ? "text-rose-400 fill-rose-400"
                  : "text-muted-foreground"
              }`}
            />

            <span className="text-muted-foreground">
              {bookmark.favorite
                ? "Saved as a favorite"
                : "Not a favorite"}
            </span>
          </div>

          {/* Open website */}
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="h-4 w-4" />
            Open Website
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}