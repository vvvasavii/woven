import { FolderKanban, ChevronRight } from "lucide-react";

interface CollectionCardProps {
  name: string;
  count: number;
  description?: string;
}

export function CollectionCard({ name, count, description }: CollectionCardProps) {
  return (
    <div className="group bg-background border border-border rounded-lg p-4 hover:-translate-y-0.5 hover:shadow-md hover:bg-card/50 transition-all duration-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-[var(--chip-background)]">
            <FolderKanban className="h-4 w-4 text-foreground/70" />
          </div>
          <h3 className="text-base font-medium text-foreground">
            {name}
          </h3>
        </div>
        <ChevronRight className="h-4 w-4 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
      </div>
      
      <div className="pl-8">
        <p className="text-sm text-muted-foreground mb-1">{count} bookmarks</p>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
        )}
      </div>
    </div>
  );
}
