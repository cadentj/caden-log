import { type MessageWithTag } from "db";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: MessageWithTag;
  showTail?: boolean;
  isFromMe?: boolean;
}

export function MessageBubble({ message, showTail = false, isFromMe = false }: MessageBubbleProps) {
  // Format timestamp
  const formattedTime = message.created_at
    ? new Date(message.created_at).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <div className={cn("flex", isFromMe ? "justify-end" : "justify-start")}>
      <div className={cn("flex flex-col max-w-[70%]", isFromMe ? "items-end" : "items-start")}>
        {/* Message bubble */}
        <div className="relative group">
          <div
            className={cn(
              "px-3.5 py-2 rounded-[18px] text-[15px] leading-[1.4] break-words whitespace-pre-wrap",
              isFromMe
                ? "bg-[#007AFF] text-white rounded-br-[4px]"
                : "bg-[#e5e5ea] dark:bg-[#3a3a3c] text-black dark:text-white rounded-bl-[4px]",
              showTail && isFromMe && "rounded-br-sm",
              showTail && !isFromMe && "rounded-bl-sm"
            )}
          >
            {message.text}
          </div>

          {/* Tail */}
          {showTail && (
            <div
              className={cn(
                "absolute bottom-0 w-5 h-5 overflow-hidden",
                isFromMe ? "-right-1" : "-left-1"
              )}
            >
              <div
                className={cn(
                  "absolute w-5 h-5 transform",
                  isFromMe
                    ? "bg-[#007AFF] -bottom-[10px] -right-[10px] rotate-[70deg] rounded-full"
                    : "bg-[#e5e5ea] dark:bg-[#3a3a3c] -bottom-[10px] -left-[10px] -rotate-[70deg] rounded-full"
                )}
              />
            </div>
          )}

          {/* Timestamp on hover */}
          <div
            className={cn(
              "absolute top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-muted-foreground whitespace-nowrap",
              isFromMe ? "right-0" : "left-0"
            )}
          >
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
}
