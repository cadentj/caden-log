import { useState, useEffect, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import { WindowTitleBar } from "./WindowTitleBar";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  children: ReactNode;
}

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
}

const STORAGE_KEY = "chat-window-state";

export function ChatWindow({ children }: ChatWindowProps) {
  const { theme } = useTheme();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Store window state before maximizing
  const [previousState, setPreviousState] = useState<WindowState>({
    x: 100,
    y: 80,
    width: 1000,
    height: 700,
  });

  const [currentState, setCurrentState] = useState<WindowState>(previousState);

  // Load saved window state or calculate centered position on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setCurrentState(parsed);
        setPreviousState(parsed);
        return;
      }
    } catch (e) {
      console.error("Failed to load window state:", e);
    }

    // Default: center the window
    const centerX = (window.innerWidth - 1000) / 2;
    const centerY = (window.innerHeight - 700) / 2;
    const initialState = {
      x: Math.max(0, centerX),
      y: Math.max(0, centerY),
      width: 1000,
      height: 700,
    };
    setCurrentState(initialState);
    setPreviousState(initialState);
  }, []);

  // Save window state to localStorage
  useEffect(() => {
    if (!isMaximized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      } catch (e) {
        console.error("Failed to save window state:", e);
      }
    }
  }, [currentState, isMaximized]);

  const handleMaximize = () => {
    if (isMaximized) {
      // Restore to previous state
      setCurrentState(previousState);
      setIsMaximized(false);
    } else {
      // Save current state and maximize
      setPreviousState(currentState);
      setCurrentState({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setIsMaximized(true);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    // Could implement a dock/taskbar here
    setTimeout(() => {
      setIsMinimized(false);
    }, 300);
  };

  const handleClose = () => {
    setIsClosed(true);
  };

  if (isClosed) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <button
          onClick={() => setIsClosed(false)}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            theme === "light"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          Reopen Window
        </button>
      </div>
    );
  }

  const bgColor = theme === "light" ? "bg-white" : "bg-[#1c1c1e]";
  const shadowColor = theme === "light"
    ? "shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
    : "shadow-[0_10px_40px_rgba(0,0,0,0.5)]";

  return (
    <>
      <Rnd
        position={{ x: currentState.x, y: currentState.y }}
        size={{ width: currentState.width, height: currentState.height }}
        onDragStart={() => setIsDragging(true)}
        onDragStop={(_e, d) => {
          setIsDragging(false);
          if (!isMaximized) {
            setCurrentState((prev) => ({ ...prev, x: d.x, y: d.y }));
          }
        }}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={(_e, _direction, ref, _delta, position) => {
          setIsResizing(false);
          if (!isMaximized) {
            setCurrentState({
              x: position.x,
              y: position.y,
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
            });
          }
        }}
        minWidth={600}
        minHeight={400}
        bounds="parent"
        dragHandleClassName="cursor-move"
        disableDragging={isMaximized}
        enableResizing={!isMaximized}
        className={cn(
          !isDragging && !isResizing && "transition-all duration-300 ease-in-out",
          isMinimized && "opacity-0 scale-95"
        )}
        style={{
          zIndex: 100,
          transition: isMaximized && !isDragging && !isResizing ? "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          willChange: isDragging || isResizing ? "transform" : "auto",
        }}
      >
        <div
          className={cn(
            "h-full w-full flex flex-col overflow-hidden",
            !isDragging && !isResizing && "transition-all duration-300",
            bgColor,
            !isDragging && !isResizing && shadowColor,
            isMaximized ? "rounded-none" : "rounded-lg",
            !isMaximized && "border",
            theme === "light" ? "border-gray-300" : "border-gray-700"
          )}
          style={{
            willChange: isDragging || isResizing ? "transform" : "auto",
          }}
        >
          <WindowTitleBar
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onClose={handleClose}
            isMaximized={isMaximized}
          />
          <div className="flex-1 flex overflow-hidden">
            {children}
          </div>
        </div>
      </Rnd>
    </>
  );
}
