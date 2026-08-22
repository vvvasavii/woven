"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, X } from "lucide-react";

interface DeleteCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteCollection: () => Promise<void>;
  collectionName: string;
  isDeleting?: boolean;
  error?: string;
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  onDeleteCollection,
  collectionName,
  isDeleting = false,
  error = "",
}: DeleteCollectionDialogProps) {
  async function handleDelete() {
    await onDeleteCollection();
  }

  function handleClose() {
    if (!isDeleting) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[500px] w-full mx-4 sm:mx-auto bg-popover border-border/60 shadow-xl p-6" showCloseButton={false}>
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Delete Collection
                </DialogTitle>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="rounded-lg p-2 text-muted-foreground hover:bg-card/50 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          {/* Subtle accent line in destructive color */}
          <div className="h-px w-full bg-gradient-to-r from-destructive/30 via-border/40 to-transparent" />
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{collectionName}"</span>?
            </p>
            <p className="text-sm text-muted-foreground">
              The bookmarks inside this collection will not be deleted.
            </p>
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
              disabled={isDeleting}
              className="w-full sm:w-auto rounded-lg border-2 border-border/60 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-card/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-popover"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto rounded-lg bg-destructive px-5 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:ring-offset-2 focus:ring-offset-popover"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}