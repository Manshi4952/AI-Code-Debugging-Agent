import { useState } from "react";

function SeverityBadge({ severity }) {
  const cls = severity === "error" ? "err-badge" : severity === "warning" ? "warn-badge" : "info-badge";
  return <span className={cls}>{severity}</span>;
}

function BugCard({ bug }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bug-card">
      <div className="bug-header" onClick={() => setExpanded((e) => !e)}>
        <SeverityBadge severity={bug.severity} />
        <span className="bug-title">{bug.title || bug.error_type}</span>
        {bug.line_number && <span className="line-ref">line {bug.line_number}</span>}
        {bug.is_recurring && (
          <span className="recurring-badge">↻ recurring</span>
        )}
        <span className="expand-icon">{expanded ? "▾" : "▸"}</span>
      </div>

      {expanded && (
        <div className="bug-body">
          <p className="bug-explain">{bug.description}</p>

          {bug.buggy_code && (
            <div className="code-block bad">
              <div className="code-block-label">✗ Buggy code</div>
              <pre>{bug.buggy_code}</pre>
            </div>
          )}

          {bug.fixed_code && (
            <div className="code-block good">
              <div className="code-block-label">✓ Fixed code</div>
              <pre>{bug.fixed_code}</pre>
            </div>
          )}

          {bug.explanation && (
            <p className="bug-explain" style={{ marginTop: 8 }}>
              <strong>Why: </strong>{bug.explanation}
            </p>
          )}

          {bug.prevention_tip && (
            <div className="tip-block">
              <span className="tip-icon">💡</span>
              <span>{bug.prevention_tip}</span>
            </div>
          )}

          {bug.is_recurring && (
            <div className="memory-tag">
              <span className="memory-dot" />
              Recurring pattern · seen {bug.frequency}×
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BugsTab({ result }) {
  if (!result) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <p>Paste your code and click <strong>Analyze Code</strong> to detect bugs.</p>
        <p className="empty-sub">DebugBrain will remember your patterns and help you fix them faster over time.</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="error-state">
        <p>Error: {result.error}</p>
        <p className="empty-sub">Make sure your backend is running and GROQ_API_KEY is set.</p>
      </div>
    );
  }

  const { bugs = [], summary, overall_tips = [], code_quality_score } = result;
  const recurringBugs = bugs.filter((b) => b.is_recurring);

  return (
    <div className="bugs-list">
      {summary && (
        <div className="summary-card">
          <div className="summary-row">
            <span className="summary-text">{summary}</span>
            {code_quality_score && (
              <span className="quality-score" style={{ color: code_quality_score >= 7 ? "var(--green)" : code_quality_score >= 4 ? "var(--amber)" : "var(--red)" }}>
                Score: {code_quality_score}/10
              </span>
            )}
          </div>
        </div>
      )}

      {recurringBugs.length > 0 && (
        <div className="recurring-banner">
          <div className="rb-icon">⚠️</div>
          <div>
            <strong>Memory match — </strong>
            You've made {recurringBugs.length === 1 ? "this pattern" : "these patterns"} before:{" "}
            {recurringBugs.map((b) => b.error_type).join(", ")}.
          </div>
        </div>
      )}

      {bugs.length === 0 ? (
        <div className="no-bugs">
          <div className="empty-icon">✅</div>
          <p>No bugs detected! Your code looks clean.</p>
        </div>
      ) : (
        bugs.map((bug) => <BugCard key={bug.id} bug={bug} />)
      )}

      {overall_tips.length > 0 && (
        <div className="tips-section">
          <div className="tips-title">General tips for you</div>
          {overall_tips.map((tip, i) => (
            <div key={i} className="tip-item">
              <span className="tip-num">{i + 1}</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
