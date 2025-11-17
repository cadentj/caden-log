import { useTags } from "@/lib/api/queries";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TagSidebarProps {
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
}

export function TagSidebar({ selectedTagId, onSelectTag }: TagSidebarProps) {
  const { data: tags, isLoading, error } = useTags();

  if (isLoading) {
    return (
      <div className="w-64 border-r border-border bg-muted/10 p-4">
        <div className="text-sm text-muted-foreground">Loading tags...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 border-r border-border bg-muted/10 p-4">
        <div className="text-sm text-destructive">Error loading tags</div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-muted/10 flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Notes</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Untagged messages option */}
          <button
            onClick={() => onSelectTag(null)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md transition-colors",
              "hover:bg-muted flex items-center gap-2",
              selectedTagId === null && "bg-muted font-medium"
            )}
          >
            <Badge variant={selectedTagId === null ? "default" : "outline"}>
              Untagged
            </Badge>
          </button>

          {/* Tag list */}
          {tags?.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onSelectTag(tag.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md transition-colors",
                "hover:bg-muted flex items-center gap-2",
                selectedTagId === tag.id && "bg-muted font-medium"
              )}
            >
              <Badge variant={selectedTagId === tag.id ? "default" : "outline"}>
                {tag.name}
              </Badge>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
