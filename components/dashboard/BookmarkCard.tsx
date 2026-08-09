import { Heart, ExternalLink, Globe } from "lucide-react";

interface BookmarkCardProps {
  title: string;
  domain: string;
  collection: string;
  isFavorite?: boolean;
}

export function BookmarkCard({ title, domain, collection, isFavorite = false }: BookmarkCardProps) {
  return (
    <div className="group bg-background border border-border rounded-lg p-4 hover:-translate-y-0.5 hover:shadow-md hover:bg-card/50 transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Favicon/Domain Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--chip-background)] flex items-center justify-center">
          <Globe className="h-5 w-5 text-foreground/70" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-foreground line-clamp-1 mb-1">
            {title}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="truncate">{domain}</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <span className="truncate">{collection}</span>
          </div>
        </div>
        
        {/* Favorite Button */}
        <button 
          className="flex-shrink-0 p-2 rounded-lg hover:bg-[var(--chip-background)] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'text-rose-400 fill-rose-400' : 'text-foreground/40 hover:text-foreground/70'}`} />
        </button>
      </div>
    </div>
  );
}