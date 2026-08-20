"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Globe, Heart, Pencil } from "lucide-react";

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
      collection: {
        id: string;
        name: string;
      };
    }[];
  } | null;

  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Sends the updated bookmark back to BookmarksPage.
  onBookmarkUpdated?: (
  bookmark: NonNullable<BookmarkDetailDialogProps["bookmark"]>
) => void; // non nullable is used here because we want to ensure that the bookmark passed to the callback is not null, as it represents a valid bookmark that has been updated.
}

export function BookmarkDetailDialog({
  bookmark,
  open,
  onOpenChange,
  onBookmarkUpdated,
}: BookmarkDetailDialogProps) {
  // Controls whether the dialog is showing details or the edit form.
  const [editing, setEditing] = useState(false);

  // Stores the values currently entered in the edit form.
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  // Tracks the save request.
  const [saving, setSaving] = useState(false);

  // Displays an error if the PATCH request fails.
  const [error, setError] = useState("");

  // Save the edited bookmark through the existing PATCH endpoint.
  async function handleSave() {
    if (!bookmark) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          url,
          description,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bookmark");
      }

      // Backend returns the complete updated bookmark.
      const updatedBookmark = await response.json();

      // Send the updated bookmark back to the page.
      onBookmarkUpdated?.(updatedBookmark);

      // Return to normal detail mode.
      setEditing(false);
    } catch (error) {
      console.error("Error updating bookmark:", error);
      setError("Failed to update bookmark");
    } finally {
      setSaving(false);
    }
  }

  if (!bookmark) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {editing ? (
          <>
            {/* Edit mode */}
            <DialogHeader>
              <DialogTitle>Edit Bookmark</DialogTitle>
              <DialogDescription>
                Update the details saved with this bookmark.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="bookmark-title" className="text-sm font-medium">
                  Title
                </label>

                <input
                  id="bookmark-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <label htmlFor="bookmark-url" className="text-sm font-medium">
                  URL
                </label>

                <input
                  id="bookmark-url"
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  htmlFor="bookmark-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="bookmark-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label htmlFor="bookmark-notes" className="text-sm font-medium">
                  My Notes
                </label>

                <textarea
                  id="bookmark-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* API error */}
              {error && <p className="text-sm text-destructive">{error}</p>}

              {/* Form actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Cancel restores the original bookmark values.
                    setTitle(bookmark.title);
                    setUrl(bookmark.url);
                    setDescription(bookmark.description ?? "");
                    setNotes(bookmark.notes ?? "");
                    setError("");
                    setEditing(false);
                  }}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !title.trim() || !url.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Detail mode */}
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
                <h3 className="text-sm font-medium mb-2">Collections</h3>

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
                  <p className="text-sm text-muted-foreground">Uncategorized</p>
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
                  {bookmark.favorite ? "Saved as a favorite" : "Not a favorite"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Load the current bookmark values when editing begins.
                    setTitle(bookmark.title);
                    setUrl(bookmark.url);
                    setDescription(bookmark.description ?? "");
                    setNotes(bookmark.notes ?? "");

                    setError("");
                    setEditing(true);
                  }}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Bookmark
                </button>

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Website
                </a>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
