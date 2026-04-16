import Editor from "@monaco-editor/react";

const LANGUAGES = ["python", "javascript", "java", "cpp"];

export default function EditorPanel({
  code,
  language,
  bugs,
  onCodeChange,
  onLanguageChange,
  onAnalyze,
  isAnalyzing,
}) {
  const monacoLang = language === "cpp" ? "cpp" : language === "javascript" ? "javascript" : language;

  const handleEditorMount = (editor, monaco) => {
    // Add error markers for detected bugs
    if (bugs.length > 0) {
      const model = editor.getModel();
      const markers = bugs
        .filter((b) => b.line_number)
        .map((b) => ({
          severity: b.severity === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
          startLineNumber: b.line_number,
          startColumn: 1,
          endLineNumber: b.line_number,
          endColumn: 200,
          message: `${b.error_type}: ${b.title}`,
          source: "DebugBrain",
        }));
      monaco.editor.setModelMarkers(model, "debugbrain", markers);
    }
  };

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <div className="file-name">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1.5" y="0.5" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1"/>
            <path d="M4 4h5M4 6.5h5M4 9h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <span>
            solution.{language === "python" ? "py" : language === "javascript" ? "js" : language === "java" ? "java" : "cpp"}
          </span>
        </div>
        <div className="lang-picker">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              className={`lang-btn ${language === lang ? "active" : ""}`}
              onClick={() => onLanguageChange(lang)}
            >
              {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="editor-wrapper">
        <Editor
          key={language}
          height="100%"
          language={monacoLang}
          value={code}
          onChange={(val) => onCodeChange(val || "")}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "line",
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
          }}
        />
      </div>

      <div className="analyze-bar">
        <button
          className="btn-primary"
          onClick={onAnalyze}
          disabled={isAnalyzing || !code.trim()}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner white" />
              Analyzing...
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="white" strokeWidth="1.2"/>
                <path d="M6.5 3.5v3.2l2 1.1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Analyze Code
            </>
          )}
        </button>
        <button className="btn-secondary" onClick={() => onCodeChange("")}>
          Clear
        </button>
        <div className="analyze-stats">
          {bugs.length > 0 && (
            <>
              <span className="stat error">{bugs.filter((b) => b.severity === "error").length} errors</span>
              <span className="stat warn">{bugs.filter((b) => b.severity === "warning").length} warnings</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
