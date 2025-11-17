import { useMessages, useTags } from "@/lib/api/queries";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { useMemo } from "react";
import type { MessageWithTag } from "db";

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

  if (filteredMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="font-semibold text-base">{displayName}</h1>
        </div>
        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">
            No messages to display
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#1c1c1e]">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <h1 className="font-semibold text-base">{displayName}</h1>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4 space-y-6">
          {messageGroups.map((group, groupIndex) => (
            <div key={group.date}>
              {/* Date header */}
              <div className="flex justify-center mb-4">
                <div className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted/50">
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
