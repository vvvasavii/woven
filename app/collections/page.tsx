import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { FolderKanban, Plus } from "lucide-react";

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
];

export default function CollectionsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader
        title="Collections"
        subtitle="Organize your bookmarks by topic"
        action={
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            // TODO: Implement create collection functionality
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Collection
            </span>
          </button>
        }
      />

      {/* Collections Grid */}
      {placeholderCollections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {placeholderCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              name={collection.name}
              count={collection.count}
              description={collection.description}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderKanban className="h-12 w-12" />}
          title="No collections yet"
          description="Create your first collection to start organizing your bookmarks"
          action={
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              // TODO: Implement create collection functionality
            >
              Create Collection
            </button>
          }
        />
      )}
    </div>
  );
}