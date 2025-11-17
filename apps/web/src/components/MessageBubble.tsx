import { type MessageWithTag } from "db";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface MessageBubbleProps {
  message: MessageWithTag;
  showTail?: boolean;
  isFromMe?: boolean;
}

export function MessageBubble({ message, showTail = false, isFromMe = false }: MessageBubbleProps) {
  const { theme } = useTheme();
  // Format timestamp
  const formattedTime = message.created_at
    ? new Date(message.created_at).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  // Theme-based colors
  const bubbleBg = isFromMe
    ? "bg-[#007AFF]"
    : theme === "light"
    ? "bg-[#e5e5ea]"
    : "bg-[#3a3a3c]";

  const textColor = isFromMe
    ? "text-white"
    : theme === "light"
    ? "text-black"
    : "text-white";

  const timestampColor = theme === "light" ? "text-gray-500" : "text-gray-400";

  return (
    <div className={cn("flex", isFromMe ? "justify-end" : "justify-start")}>
      <div className={cn("flex flex-col max-w-[70%]", isFromMe ? "items-end" : "items-start")}>
        {/* Message bubble */}
        <div className="relative group">
          <div
            className={cn(
              "px-3.5 py-2 rounded-[18px] text-[15px] leading-[1.4] break-words whitespace-pre-wrap",
              bubbleBg,
              textColor,
              isFromMe ? "rounded-br-[4px]" : "rounded-bl-[4px]",
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
                  bubbleBg,
                  isFromMe
                    ? "-bottom-[10px] -right-[10px] rotate-[70deg] rounded-full"
                    : "-bottom-[10px] -left-[10px] -rotate-[70deg] rounded-full"
                )}
              />
            </div>
          )}

          {/* Timestamp on hover */}
          <div
            className={cn(
              "absolute top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] whitespace-nowrap",
              timestampColor,
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
