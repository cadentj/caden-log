import { useState } from "react";
import { TagSidebar } from "./components/TagSidebar";
import { MessageList } from "./components/MessageList";

function App() {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  return (
    <div className="h-screen flex">
      <TagSidebar selectedTagId={selectedTagId} onSelectTag={setSelectedTagId} />
      <MessageList selectedTagId={selectedTagId} />
    </div>
  );
}

export default App;
