// MemoryTab.jsx
import { clearMemory } from "../utils/api";

function FreqDots({ count }) {
  return (
    <div className="freq-dots">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`dot ${i <= count ? "filled" : ""}`} />
      ))}
    </div>
  );
}

export function MemoryTab({ memories, userId, onRefresh }) {
  const handleClear = async () => {
    if (window.confirm("Clear all your bug memory? This cannot be undone.")) {
      await clearMemory(userId);
      onRefresh();
    }
  };

  if (memories.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🧠</div>
        <p>No memory yet. Analyze some code and your bug patterns will be stored here.</p>
      </div>
    );
  }

  return (
    <div className="memory-list">
      <div className="memory-header">
        <span className="section-title">Your bug memory ({memories.length} entries)</span>
        <button className="btn-ghost-sm" onClick={handleClear}>Clear all</button>
      </div>
      {memories.map((mem) => (
        <div key={mem.id} className="mem-item">
          <div className="mem-row">
            <span className="mem-type">{mem.error_type}</span>
            <span className="mem-lang">{mem.language}</span>
            <div className="mem-freq">
              <span>{mem.frequency}× seen</span>
              <FreqDots count={Math.min(mem.frequency, 5)} />
            </div>
          </div>
          <div className="mem-desc">{mem.cause}</div>
          {mem.fix && <div className="mem-fix">fix → {mem.fix}</div>}
          {mem.prevention_tip && (
            <div className="mem-tip">💡 {mem.prevention_tip}</div>
          )}
          <div className="mem-dates">
            Last seen: {new Date(mem.last_seen).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}


// ChatTab.jsx
import { useState, useRef, useEffect } from "react";

export function ChatTab({ history, onSend }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
    setSending(true);
    await onSend(msg);
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = [
    "Why do I keep making this error?",
    "Fix all bugs and explain each change",
    "What patterns do I have in my memory?",
  ];

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {history.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            <div className={`avatar ${msg.role === "assistant" ? "ai-av" : "user-av"}`}>
              {msg.role === "assistant" ? "AI" : "U"}
            </div>
            <div className={`bubble ${msg.role === "assistant" ? "ai-bubble" : "user-bubble"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="msg assistant">
            <div className="avatar ai-av">AI</div>
            <div className="bubble ai-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {history.length <= 1 && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion-btn" onClick={() => onSend(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder="Ask about a bug, request a fix, or ask about your patterns..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button className="send-btn" onClick={handleSend} disabled={!input.trim() || sending}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}


// TimelineTab.jsx
export function TimelineTab({ history }) {
  if (history.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📅</div>
        <p>No debug history yet. Analyze some code to start your timeline.</p>
      </div>
    );
  }

  const severityColor = { error: "#E24B4A", warning: "#BA7517", info: "#1D9E75" };

  return (
    <div className="timeline-list">
      <div className="section-title" style={{ marginBottom: 12 }}>Debug history</div>
      {history.map((item) => (
        <div key={item.id} className="tl-item">
          <div
            className="tl-dot"
            style={{ background: severityColor[item.severity] || "#888" }}
          />
          <div className="tl-content">
            <div className="tl-header">
              <span className={`${item.severity}-badge`}>{item.error_type}</span>
              <span className="tl-title">{item.title}</span>
              <span className="tl-time">
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="tl-desc">
              {item.language} · {item.fixed ? "auto-fixed" : "detected"}
              {item.line_number ? ` · line ${item.line_number}` : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MemoryTab;
