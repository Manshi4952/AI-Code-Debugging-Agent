import { useEffect } from "react";
import BugsTab from "./BugsTab";
import MemoryTab from "./MemoryTab";
import ChatTab from "./ChatTab";
import TimelineTab from "./TimelineTab";
import { fetchMemory, fetchHistory } from "../utils/api";

const TABS = [
  { id: "bugs", label: "Bugs" },
  { id: "memory", label: "Memory" },
  { id: "chat", label: "AI Chat" },
  { id: "timeline", label: "Timeline" },
];

export default function ResultsPanel({
  result,
  activeTab,
  onTabChange,
  chatHistory,
  onChat,
  userId,
  memories,
  setMemories,
  history,
  setHistory,
}) {
  const bugCount = result?.bugs?.length ?? 0;

  useEffect(() => {
    if (activeTab === "memory") {
      fetchMemory(userId).then((d) => setMemories(d.memories || []));
    }
    if (activeTab === "timeline") {
      fetchHistory(userId).then((d) => setHistory(d.history || []));
    }
  }, [activeTab, userId]);

  return (
    <div className="results-panel">
      <div className="results-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`rtab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.id === "bugs" && bugCount > 0 && (
              <span className="tab-count">{bugCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="results-body">
        {activeTab === "bugs" && <BugsTab result={result} />}
        {activeTab === "memory" && <MemoryTab memories={memories} userId={userId} onRefresh={() => fetchMemory(userId).then((d) => setMemories(d.memories || []))} />}
        {activeTab === "chat" && <ChatTab history={chatHistory} onSend={onChat} />}
        {activeTab === "timeline" && <TimelineTab history={history} />}
      </div>
    </div>
  );
}
