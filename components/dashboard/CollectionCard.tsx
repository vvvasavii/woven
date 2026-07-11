import { FolderKanban } from "lucide-react";

interface CollectionCardProps {
  name: string;
  count: number;
  description?: string;
}

export function CollectionCard({ name, count, description }: CollectionCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-muted">
          <FolderKanban className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-medium text-foreground mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground">{count} bookmarks</p>
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      )}
    </div>
  );
}
