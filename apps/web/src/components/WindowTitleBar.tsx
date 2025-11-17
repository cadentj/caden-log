import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Minimize2, Maximize2, X } from "lucide-react";

interface WindowTitleBarProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: boolean;
}

export function WindowTitleBar({
  onMinimize,
  onMaximize,
  onClose,
  isMaximized = false,
}: WindowTitleBarProps) {
  const { theme } = useTheme();

  const bgColor = theme === "light" ? "bg-[#f6f6f6]" : "bg-[#2c2c2e]";
  const borderColor = theme === "light" ? "border-gray-300" : "border-gray-700";

  return (
    <div
      className={cn(
        "h-10 flex items-center justify-between px-3 border-b rounded-t-lg",
        bgColor,
        borderColor,
        "select-none cursor-move"
      )}
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Left side - Traffic lights (macOS style) */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff4136] transition-colors"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          aria-label="Close"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize?.();
          }}
          className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#ffb700] transition-colors"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          aria-label="Minimize"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMaximize?.();
          }}
          className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#1fb135] transition-colors"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          aria-label={isMaximized ? "Restore" : "Maximize"}
        />
      </div>

      {/* Center - Title */}
      <div className={cn(
        "text-sm font-medium",
        theme === "light" ? "text-gray-700" : "text-gray-300"
      )}>
        Messages
      </div>

      {/* Right side - Optional controls */}
      <div className="flex items-center gap-1 opacity-0">
        {/* Spacer to balance the layout */}
        <div className="w-3 h-3" />
        <div className="w-3 h-3" />
        <div className="w-3 h-3" />
      </div>
    </div>
  );
}
