import { useState } from "react";
import { TagSidebar } from "./components/TagSidebar";
import { MessageList } from "./components/MessageList";
import { ChatWindow } from "./components/ChatWindow";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./contexts/ThemeContext";

function AppContent() {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const { theme } = useTheme();

  const bgColor = theme === "light"
    ? "bg-gradient-to-br from-blue-50 to-indigo-100"
    : "bg-gradient-to-br from-gray-900 to-gray-800";

  return (
    <div className={`h-screen w-screen relative ${bgColor} transition-colors duration-300`}>
      <ChatWindow>
        <TagSidebar selectedTagId={selectedTagId} onSelectTag={setSelectedTagId} />
        <MessageList selectedTagId={selectedTagId} />
      </ChatWindow>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
