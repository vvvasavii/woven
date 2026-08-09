import { Plus, Search, Bookmark as BookmarkIcon, LayoutDashboard, Heart, FolderKanban } from "lucide-react";
import { BookmarkCard } from "@/components/dashboard/BookmarkCard";
import { CollectionCard } from "@/components/dashboard/CollectionCard";

// TODO: Replace with actual data from backend
const placeholderBookmarks = [
  {
    id: "1",
    title: "Understanding React Server Components",
    domain: "react.dev",
    collection: "React",
    isFavorite: true,
  },
  {
    id: "2",
    title: "Modern CSS Techniques",
    domain: "css-tricks.com",
    collection: "Design",
    isFavorite: false,
  },
  {
    id: "3",
    title: "TypeScript Best Practices",
    domain: "typescriptlang.org",
    collection: "React",
    isFavorite: true,
  },
  {
    id: "4",
    title: "Building Accessible UI Components",
    domain: "web.dev",
    collection: "Design",
    isFavorite: false,
  },
  {
    id: "5",
    title: "State Management Patterns",
    domain: "dev.to",
    collection: "React",
    isFavorite: false,
  },
  {
    id: "6",
    title: "Color Theory for Developers",
    domain: "smashingmagazine.com",
    collection: "Design",
    isFavorite: true,
  },
];

// TODO: Replace with actual data from backend
const placeholderCollections = [
  {
    id: "1",
    name: "DSA",
    count: 24,
    description: "Data structures and algorithms resources",
  },
  {
    id: "2",
    name: "React",
    count: 18,
    description: "React ecosystem and best practices",
  },
  {
    id: "3",
    name: "Design Inspiration",
    count: 12,
    description: "UI/UX patterns and design systems",
  },
  {
    id: "4",
    name: "System Design",
    count: 8,
    description: "Architecture and scalability concepts",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Library Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Your library</h1>
          <p className="text-lg text-muted-foreground">54 resources across 8 collections</p>
        </div>
        
        {/* Compact Statistics */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Bookmarks:</span>
            <span className="font-medium text-foreground">54</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Collections:</span>
            <span className="font-medium text-foreground">8</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Favorites:</span>
            <span className="font-medium text-foreground">12</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
            <Plus className="h-4 w-4" />
            Create Collection
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
            <BookmarkIcon className="h-4 w-4" />
            Save Bookmark
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
            <Search className="h-4 w-4" />
            Search Resources
          </button>
        </div>
      </div>

      {/* Recent Bookmarks - Primary Content */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recently saved</h2>
        </div>
        <div className="space-y-3">
          {placeholderBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              title={bookmark.title}
              domain={bookmark.domain}
              collection={bookmark.collection}
              isFavorite={bookmark.isFavorite}
            />
          ))}
        </div>
      </section>

      {/* Collections - Secondary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Collections</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {placeholderCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              name={collection.name}
              count={collection.count}
              description={collection.description}
            />
          ))}
        </div>
      </section>
    </div>
  );
}