import { useState } from "react";
import { TagSidebar } from "./components/TagSidebar";
import { MessageList } from "./components/MessageList";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  return (
    <ThemeProvider>
      <div className="h-screen flex">
        <TagSidebar selectedTagId={selectedTagId} onSelectTag={setSelectedTagId} />
        <MessageList selectedTagId={selectedTagId} />
      </div>
    </ThemeProvider>
  );
}

export default App;
