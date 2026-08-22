"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollectionImageUpload } from "@/components/collections/CollectionImageUpload";
import { FolderKanban, X } from "lucide-react";

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCollection: (data: {
    name: string;
    description: string;
    coverImage: string | null;
  }) => Promise<void>;
  isCreating?: boolean;
  error?: string;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  onCreateCollection,
  isCreating = false,
  error = "",
}: CreateCollectionDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateCollection({
      name,
      description,
      coverImage,
    });
    // Reset form after successful creation
    setName("");
    setDescription("");
    setCoverImage(null);
  }

  function handleClose() {
    if (!isCreating) {
      onOpenChange(false);
      // Reset form when closing
      setName("");
      setDescription("");
      setCoverImage(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[680px] bg-popover border-border/60 shadow-xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" showCloseButton={false}>
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Create Collection
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm text-muted-foreground pl-12">
                Create a collection to organize your bookmarks
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="rounded-lg p-2 text-muted-foreground hover:bg-card/50 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          {/* Subtle accent line */}
          <div className="h-px w-full bg-gradient-to-r from-primary/30 via-border/40 to-transparent" />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="collection-name"
                className="text-sm font-medium text-foreground/90"
              >
                Name
              </label>
              <input
                id="collection-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Frontend"
                maxLength={100}
                required
                disabled={isCreating}
                className="w-full rounded-lg border-2 border-border/60 bg-card/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label
                htmlFor="collection-description"
                className="text-sm font-medium text-foreground/90"
              >
                Description
              </label>
              <textarea
                id="collection-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this collection for?"
                maxLength={500}
                rows={4}
                disabled={isCreating}
                className="w-full resize-none rounded-lg border-2 border-border/60 bg-card/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Cover Image Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/90">
                Cover Image
              </label>
              <CollectionImageUpload
                value={coverImage}
                onChange={setCoverImage}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="w-full sm:w-auto rounded-lg border-2 border-border/60 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-card/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-popover"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="w-full sm:w-auto rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-popover"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
