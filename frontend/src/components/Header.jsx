export default function Header({ bugCount, memoryCount, isAnalyzing }) {
  return (
    <header className="topbar">
      <div className="logo">
        <div className="logo-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.5" />
            <circle cx="7" cy="7" r="2" fill="white" />
          </svg>
        </div>
        <span className="logo-text">DebugBrain</span>
        <span className="logo-sub">AI Memory Debugger</span>
      </div>

      <div className="header-badges">
        {isAnalyzing && (
          <span className="badge analyzing">
            <span className="spinner" /> Analyzing...
          </span>
        )}
        {bugCount > 0 && !isAnalyzing && (
          <span className="badge error">{bugCount} bug{bugCount !== 1 ? "s" : ""} found</span>
        )}
        {memoryCount > 0 && (
          <span className="badge memory">Memory: {memoryCount} entries</span>
        )}
        <a
          href="https://console.groq.com"
          target="_blank"
          rel="noreferrer"
          className="badge link"
        >
          Powered by Groq
        </a>
      </div>
    </header>
  );
}
