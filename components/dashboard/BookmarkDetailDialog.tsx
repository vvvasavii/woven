"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  ExternalLink,
  Globe,
  Heart,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

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

  // Lets the parent page remove the bookmark after deletion.
  onBookmarkDeleted?: (bookmarkId: string) => void;
}

type EditableField = "title" | "description" | "notes" | null;

export function BookmarkDetailDialog({
  bookmark,
  open,
  onOpenChange,
  onBookmarkUpdated,
  onBookmarkDeleted,
}: BookmarkDetailDialogProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    [],
  );
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [savingCollections, setSavingCollections] = useState(false);
  const [collectionError, setCollectionError] = useState("");

  // Keeps the detail view uncluttered until the user explicitly chooses to edit.
  const [isEditMode, setIsEditMode] = useState(false);

  // Tracks which field is currently being edited.
  const [editingField, setEditingField] = useState<EditableField>(null);

  // Temporary values used while editing the bookmark.
  const [editValue, setEditValue] = useState("");

  // Tracks whether the bookmark field is currently being saved.
  const [savingField, setSavingField] = useState(false);

  // Stores errors from bookmark field updates.
  const [editError, setEditError] = useState("");

  // Tracks whether the bookmark is currently being deleted.
  const [deleting, setDeleting] = useState(false);

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

  function startEditing(field: Exclude<EditableField, null>) {
    // Load the current value into the temporary edit field.
    const currentValue =
      field === "title"
        ? currentBookmark.title
        : field === "description"
          ? (currentBookmark.description ?? "")
          : (currentBookmark.notes ?? "");

    setEditingField(field);
    setEditValue(currentValue);
    setEditError("");
  }

  function cancelEditing() {
    // Discard unsaved changes and return to display mode.
    setEditingField(null);
    setEditValue("");
    setEditError("");
  }

  function toggleEditMode() {
    if (isEditMode) {
      cancelEditing();
    }

    setIsEditMode((current) => !current);
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setIsEditMode(false);
      cancelEditing();
    }

    onOpenChange(nextOpen);
  }

  async function saveField() {
    if (!editingField) {
      return;
    }

    // Title cannot be empty.
    if (editingField === "title" && !editValue.trim()) {
      setEditError("Title cannot be empty");
      return;
    }

    try {
      setSavingField(true);
      setEditError("");

      const response = await fetch(`/api/bookmarks/${currentBookmark.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [editingField]:
            editingField === "title"
              ? editValue.trim()
              : editValue.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bookmark");
      }

      const updatedBookmark = await response.json();

      // Update the bookmark in the parent page immediately.
      onBookmarkUpdated?.(updatedBookmark);

      // Exit edit mode after the server confirms the update.
      setEditingField(null);
      setEditValue("");
    } catch (error) {
      console.error("Error updating bookmark:", error);
      setEditError("Failed to update bookmark");
    } finally {
      setSavingField(false);
    }
  }

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
        },
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

  async function deleteBookmark() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bookmark?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(`/api/bookmarks/${currentBookmark.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete bookmark");
      }

      // Tell the parent page to remove this bookmark from its local list.
      onBookmarkDeleted?.(currentBookmark.id);

      // Close the detail dialog after successful deletion.
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      setEditError("Failed to delete bookmark");
    } finally {
      setDeleting(false);
    }
  }

  function renderEditActions() {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={saveField}
          disabled={savingField}
          aria-label="Save changes"
          className="p-1 rounded-md text-primary hover:bg-[var(--chip-background)] disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={cancelEditing}
          disabled={savingField}
          aria-label="Cancel editing"
          className="p-1 rounded-md text-muted-foreground hover:bg-[var(--chip-background)] disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-[500px] gap-5 overflow-y-auto border-border/60 bg-popover p-5 shadow-xl sm:p-6 max-h-[90vh] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <DialogHeader className="space-y-3 pb-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {/* Favicon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
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

              <div className="min-w-0 flex-1">
                {/* Title */}
                {editingField === "title" ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editValue}
                      onChange={(event) => setEditValue(event.target.value)}
                      autoFocus
                      maxLength={200}
                      className="min-w-0 flex-1 rounded-lg border-2 border-border/60 bg-card/40 px-3 py-2 text-base font-medium text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                    />

                    {renderEditActions()}
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <DialogTitle className="min-w-0 flex-1 break-all text-xl font-semibold text-foreground">
                      {" "}
                      {bookmark.title}
                    </DialogTitle>

                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => startEditing("title")}
                        aria-label="Edit title"
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-card/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}

                <DialogDescription className="mt-1 break-all text-sm text-muted-foreground">
                  {bookmark.domain ?? bookmark.url}
                </DialogDescription>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={toggleEditMode}
                aria-pressed={isEditMode}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <Pencil className="h-4 w-4" />
                {isEditMode ? "Done" : "Edit"}
              </button>

              <button
                type="button"
                onClick={() => handleDialogOpenChange(false)}
                aria-label="Close bookmark details"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-primary/30 via-border/40 to-transparent" />
        </DialogHeader>

        <div className="min-w-0 space-y-6">
          {/* Preview image */}
          {bookmark.previewImage && (
            <div className="overflow-hidden rounded-lg border border-border/60 bg-card/40">
              <img
                src={bookmark.previewImage}
                alt=""
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-sm font-medium text-foreground/90">
                Description
              </h3>

              {isEditMode && editingField !== "description" && (
                <button
                  type="button"
                  onClick={() => startEditing("description")}
                  aria-label="Edit description"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-card/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}

              {editingField === "description" && renderEditActions()}
            </div>

            {editingField === "description" ? (
              <textarea
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
                autoFocus
                maxLength={1000}
                rows={4}
                className="w-full resize-none rounded-lg border-2 border-border/60 bg-card/40 px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                placeholder="Add a description..."
              />
            ) : (
              <p className="break-all text-sm leading-6 text-muted-foreground">
                {bookmark.description || "No description added."}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-sm font-medium text-foreground/90">
                My Notes
              </h3>

              {isEditMode && editingField !== "notes" && (
                <button
                  type="button"
                  onClick={() => startEditing("notes")}
                  aria-label="Edit notes"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-card/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}

              {editingField === "notes" && renderEditActions()}
            </div>

            {editingField === "notes" ? (
              <textarea
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
                autoFocus
                maxLength={5000}
                rows={5}
                className="w-full resize-none rounded-lg border-2 border-border/60 bg-card/40 px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                placeholder="Add your notes..."
              />
            ) : (
              <p className="break-all text-sm leading-6 text-muted-foreground">
                {" "}
                {bookmark.notes || "No notes added."}
              </p>
            )}
          </div>

          {/* Edit error */}
          {editError && <p className="text-sm text-destructive">{editError}</p>}

          {/* Collections */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-foreground/90">
                Collections
              </h3>

              <button
                type="button"
                onClick={() => {
                  if (!showCollectionSelector) {
                    // Pre-select collections that already belong to this bookmark.
                    setSelectedCollectionIds(
                      bookmark.collections.map(
                        ({ collection }) => collection.id,
                      ),
                    );

                    setCollectionError("");
                  }

                  setShowCollectionSelector((current) => !current);
                }}
                className="rounded-md px-1 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10 hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {showCollectionSelector ? "Cancel" : "Add to Collection"}
              </button>
            </div>

            {bookmark.collections.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {bookmark.collections.map(({ collection }) => (
                  <span
                    key={collection.id}
                    className="rounded-full bg-[var(--chip-background)] px-2.5 py-1 text-sm"
                  >
                    {collection.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Uncategorized</p>
            )}

            {/* Collection selector */}
            {showCollectionSelector && (
              <div className="mt-3 space-y-3 rounded-lg border border-border/60 bg-card/40 p-3">
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
                            collection.id,
                          )}
                          onChange={() => toggleCollection(collection.id)}
                          className="h-4 w-4"
                        />

                        <span className="text-sm">{collection.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                {collectionError && (
                  <p className="text-sm text-destructive">{collectionError}</p>
                )}

                {collections.length > 0 && (
                  <button
                    type="button"
                    onClick={saveCollections}
                    disabled={savingCollections}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-popover"
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
              {bookmark.favorite ? "Saved as a favorite" : "Not a favorite"}
            </span>
          </div>

          {/* Open website */}
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-popover"
          >
            <ExternalLink className="h-4 w-4" />
            Open Website
          </a>

          {/* Delete bookmark */}
          <button
            type="button"
            onClick={deleteBookmark}
            disabled={deleting}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-destructive/30"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete Bookmark"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
