import { useMessages, useTags } from "@/lib/api/queries";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { useMemo } from "react";
import type { MessageWithTag } from "db";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

interface MessageListProps {
  selectedTagId: string | null;
}

// Helper to group messages by date
function groupMessagesByDate(messages: MessageWithTag[]) {
  const groups: { date: string; messages: MessageWithTag[] }[] = [];

  messages.forEach((message) => {
    if (!message.created_at) return;

    const messageDate = new Date(message.created_at);
    const dateKey = messageDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const existingGroup = groups.find((g) => g.date === dateKey);
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({ date: dateKey, messages: [message] });
    }
  });

  return groups;
}

export function MessageList({ selectedTagId }: MessageListProps) {
  const { data: messages, isLoading, error } = useMessages();
  const { data: tags } = useTags();
  const { theme, toggleTheme } = useTheme();

  // Get the display name for the header
  const displayName = useMemo(() => {
    if (selectedTagId === null) return "caden";
    const selectedTag = tags?.find((tag) => tag.id === selectedTagId);
    return selectedTag?.name || "Unknown";
  }, [selectedTagId, tags]);

  // Filter and sort messages
  const filteredMessages = useMemo(() => {
    if (!messages) return [];

    // Filter by selected tag and display field
    const filtered = messages.filter((msg) => {
      // Only show messages where display = true
      if (!msg.display) return false;

      // Filter by tag
      if (selectedTagId === null) {
        // Show untagged messages (tag_id is null)
        return msg.tag_id === null;
      } else {
        // Show messages with the selected tag
        return msg.tag_id === selectedTagId;
      }
    });

    // Sort oldest first (chronological order)
    return filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateA - dateB;
    });
  }, [messages, selectedTagId]);

  // Group messages by date
  const messageGroups = useMemo(() => {
    return groupMessagesByDate(filteredMessages);
  }, [filteredMessages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-destructive">Error: {error.message}</div>
      </div>
    );
  }

  const bgColor = theme === "light" ? "bg-white" : "bg-[#1c1c1e]";
  const headerBg = theme === "light" ? "bg-[#f9f9f9]" : "bg-[#2c2c2e]";
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-800";
  const textColor = theme === "light" ? "text-black" : "text-white";
  const mutedTextColor = theme === "light" ? "text-gray-500" : "text-gray-400";

  if (filteredMessages.length === 0) {
    return (
      <div className={`flex-1 flex flex-col ${bgColor}`}>
        {/* Header */}
        <div className={`h-14 border-b ${borderColor} flex items-center justify-center ${headerBg} backdrop-blur supports-[backdrop-filter]:${headerBg}/60 relative`}>
          <h1 className={`font-semibold text-base ${textColor}`}>{displayName}</h1>
          <button
            onClick={toggleTheme}
            className={`absolute right-4 p-2 rounded-full hover:bg-gray-200 ${theme === "dark" ? "hover:bg-gray-700" : ""} transition-colors`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-gray-600" />
            ) : (
              <Sun className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-sm ${mutedTextColor}`}>
            No messages to display
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${bgColor}`}>
      {/* Header */}
      <div className={`h-14 border-b ${borderColor} flex items-center justify-center ${headerBg} backdrop-blur supports-[backdrop-filter]:${headerBg}/60 shrink-0 relative`}>
        <h1 className={`font-semibold text-base ${textColor}`}>{displayName}</h1>
        <button
          onClick={toggleTheme}
          className={`absolute right-4 p-2 rounded-full hover:bg-gray-200 ${theme === "dark" ? "hover:bg-gray-700" : ""} transition-colors`}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-gray-600" />
          ) : (
            <Sun className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4 space-y-6">
          {messageGroups.map((group, groupIndex) => (
            <div key={group.date}>
              {/* Date header */}
              <div className="flex justify-center mb-4">
                <div className={`text-xs ${mutedTextColor} px-3 py-1 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-gray-800"}`}>
                  {group.date}
                </div>
              </div>

              {/* Messages for this date */}
              <div className="space-y-1">
                {group.messages.map((message, index) => {
                  const isLastInGroup = index === group.messages.length - 1;
                  const isLastOverall = groupIndex === messageGroups.length - 1 && isLastInGroup;
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      showTail={isLastOverall}
                      isFromMe={selectedTagId === null}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
