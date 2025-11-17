import { useTags, useMessages } from "@/lib/api/queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import type { MessageWithTag } from "db";

interface TagSidebarProps {
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
}

// Helper to get most recent message for a tag
function getMostRecentMessage(messages: MessageWithTag[], tagId: string | null) {
  const filtered = messages.filter((msg) => {
    if (!msg.display) return false;
    if (tagId === null) {
      return msg.tag_id === null;
    } else {
      return msg.tag_id === tagId;
    }
  });

  if (filtered.length === 0) return null;

  return filtered.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA; // Most recent first
  })[0];
}

export function TagSidebar({ selectedTagId, onSelectTag }: TagSidebarProps) {
  const { data: tags, isLoading: tagsLoading, error: tagsError } = useTags();
  const { data: messages, isLoading: messagesLoading } = useMessages();
  const { theme } = useTheme();

  const isLoading = tagsLoading || messagesLoading;
  const error = tagsError;

  const bgColor = theme === "light" ? "bg-[#f9f9f9]" : "bg-[#1c1c1e]";
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-800";
  const textColor = theme === "light" ? "text-black" : "text-white";
  const mutedTextColor = theme === "light" ? "text-gray-500" : "text-gray-400";
  const hoverBg = theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-800";
  const selectedBg = theme === "light" ? "bg-gray-200" : "bg-gray-800";

  if (isLoading) {
    return (
      <div className={`w-80 border-r ${borderColor} ${bgColor} p-4 shrink-0`}>
        <div className={`text-sm ${mutedTextColor}`}>Loading tags...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-80 border-r ${borderColor} ${bgColor} p-4 shrink-0`}>
        <div className="text-sm text-red-500">Error loading tags</div>
      </div>
    );
  }

  // Get untagged recent message
  const untaggedRecentMessage = messages ? getMostRecentMessage(messages, null) : null;

  return (
    <div className={`w-80 border-r ${borderColor} ${bgColor} flex flex-col shrink-0`}>
      <div className={`p-4 border-b ${borderColor}`}>
        <h2 className={`font-semibold text-lg ${textColor}`}>Notes</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1">
          {/* Untagged messages option */}
          <button
            onClick={() => onSelectTag(null)}
            className={cn(
              "w-full text-left px-3 py-3 transition-colors flex items-center gap-3",
              hoverBg,
              selectedTagId === null && selectedBg
            )}
          >
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarFallback className={cn(
                "text-base font-medium",
                theme === "light" ? "bg-gray-300 text-gray-700" : "bg-gray-700 text-gray-300"
              )}>
                C
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <span className={cn("font-semibold text-[15px]", textColor)}>caden</span>
                {untaggedRecentMessage?.created_at && (
                  <span className={cn("text-[13px]", mutedTextColor)}>
                    {new Date(untaggedRecentMessage.created_at).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "2-digit",
                    })}
                  </span>
                )}
              </div>
              {untaggedRecentMessage && (
                <p className={cn("text-[14px] truncate", mutedTextColor)}>
                  {untaggedRecentMessage.text}
                </p>
              )}
            </div>
          </button>

          {/* Tag list */}
          {tags?.map((tag) => {
            const recentMessage = messages ? getMostRecentMessage(messages, tag.id) : null;
            const initial = tag.name.charAt(0).toUpperCase();

            return (
              <button
                key={tag.id}
                onClick={() => onSelectTag(tag.id)}
                className={cn(
                  "w-full text-left px-3 py-3 transition-colors flex items-center gap-3",
                  hoverBg,
                  selectedTagId === tag.id && selectedBg
                )}
              >
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarFallback className={cn(
                    "text-base font-medium",
                    theme === "light" ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
                  )}>
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span className={cn("font-semibold text-[15px]", textColor)}>{tag.name}</span>
                    {recentMessage?.created_at && (
                      <span className={cn("text-[13px]", mutedTextColor)}>
                        {new Date(recentMessage.created_at).toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  {recentMessage && (
                    <p className={cn("text-[14px] truncate", mutedTextColor)}>
                      {recentMessage.text}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
