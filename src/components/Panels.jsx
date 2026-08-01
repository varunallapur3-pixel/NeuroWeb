import React, { useState, useEffect, useRef, useMemo } from "react";
import { CATEGORY_COLORS, RELATIONSHIP_COLORS, EXPLAIN_MODES, PANEL_TABS } from "../constants.js";
import { fuzzyMatch } from "../utils.js";

export function Toasts({ toasts, onDismiss }) {
  return (
    <div className="nw-toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={"nw-toast nw-toast-" + (t.kind || "info")}>
          <span>{t.message}</span>
          <button aria-label="Dismiss" onClick={() => onDismiss(t.id)}>Γ£ò</button>
        </div>
      ))}
    </div>
  );
}

export function CommandPalette({ commands, onClose, onRun }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const filtered = useMemo(
    () => commands.filter((c) => fuzzyMatch(q, c.label + " " + (c.group || ""))),
    [q, commands]
  );

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => setIdx(0), [q]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[idx]) onRun(filtered[idx]); }
    else if (e.key === "Escape") { onClose(); }
  };

  return (
    <div className="nw-modal-backdrop" onClick={onClose}>
      <div className="nw-cmdk" role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a command or search a nodeΓÇª"
          aria-label="Command palette input"
        />
        <div className="nw-cmdk-list" role="listbox">
          {filtered.length === 0 && <div className="nw-cmdk-empty">No matching commands.</div>}
          {filtered.map((c, i) => (
            <div
              key={c.id}
              role="option"
              aria-selected={i === idx}
              className={"nw-cmdk-item" + (i === idx ? " active" : "")}
              onMouseEnter={() => setIdx(i)}
              onClick={() => onRun(c)}
            >
              <span className="nw-cmdk-icon">{c.icon || "ΓåÆ"}</span>
              <span>{c.label}</span>
              {c.group && <span className="nw-cmdk-group">{c.group}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NodeTooltip({ node, x, y }) {
  if (!node) return null;
  const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.default;
  return (
    <div className="nw-tooltip" style={{ left: x, top: y }} role="tooltip">
      <div className="nw-tooltip-cat" style={{ color }}>{node.category || "Concept"}</div>
      <div className="nw-tooltip-label">{node.label}</div>
      {node.explanation && <div className="nw-tooltip-body">{node.explanation}</div>}
    </div>
  );
}

export function Minimap({ nodes, dims, view, onJump }) {
  const W = 160, H = 110;
  if (!nodes.length) return null;
  const xs = nodes.map((n) => n.x || 0);
  const ys = nodes.map((n) => n.y || 0);
  const minX = Math.min(...xs, -200), maxX = Math.max(...xs, 200);
  const minY = Math.min(...ys, -140), maxY = Math.max(...ys, 140);
  const spanX = maxX - minX || 1, spanY = maxY - minY || 1;
  const pad = 10;
  const scale = Math.min((W - pad * 2) / spanX, (H - pad * 2) / spanY);
  const toMap = (x, y) => [pad + (x - minX) * scale, pad + (y - minY) * scale];

  const halfW = dims.w / 2 / view.k, halfH = dims.h / 2 / view.k;
  const cx = -view.x / view.k, cy = -view.y / view.k;
  const [rx, ry] = toMap(cx - halfW, cy - halfH);
  const rw = halfW * 2 * scale, rh = halfH * 2 * scale;

  return (
    <svg
      className="nw-minimap"
      width={W}
      height={H}
      role="img"
      aria-label="Graph minimap"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        onJump(minX + (mx - pad) / scale, minY + (my - pad) / scale);
      }}
    >
      <rect x={0} y={0} width={W} height={H} className="nw-minimap-bg" />
      {nodes.map((n) => {
        const [mx, my] = toMap(n.x || 0, n.y || 0);
        const color = CATEGORY_COLORS[n.category] || CATEGORY_COLORS.default;
        return <circle key={n.id} cx={mx} cy={my} r={n.isRoot ? 3.2 : 2} fill={color} />;
      })}
      <rect
        x={Math.max(0, rx)} y={Math.max(0, ry)}
        width={Math.min(rw, W)} height={Math.min(rh, H)}
        className="nw-minimap-viewport"
      />
    </svg>
  );
}

export function FilterBar({ categories, relationships, activeCats, activeRels, onToggleCat, onToggleRel, onReset }) {
  return (
    <div className="nw-filterbar" role="group" aria-label="Graph filters">
      <div className="nw-filter-row">
        <span className="nw-filter-label">Category</span>
        {categories.map((c) => (
          <button
            key={c}
            className={"nw-filter-chip" + (activeCats.has(c) ? " active" : "")}
            style={{ "--chip-color": CATEGORY_COLORS[c] || CATEGORY_COLORS.default }}
            onClick={() => onToggleCat(c)}
            aria-pressed={activeCats.has(c)}
          >{c}</button>
        ))}
      </div>
      <div className="nw-filter-row">
        <span className="nw-filter-label">Relationship</span>
        {relationships.map((r) => (
          <button
            key={r}
            className={"nw-filter-chip" + (activeRels.has(r) ? " active" : "")}
            style={{ "--chip-color": RELATIONSHIP_COLORS[r] || RELATIONSHIP_COLORS.default }}
            onClick={() => onToggleRel(r)}
            aria-pressed={activeRels.has(r)}
          >{r}</button>
        ))}
      </div>
      <button className="nw-ghost-btn nw-filter-reset" onClick={onReset}>Reset filters</button>
    </div>
  );
}

export function ConfidenceBar({ value }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="nw-confidence" aria-label={`Confidence ${v} out of 100`}>
      <div className="nw-confidence-track">
        <div className="nw-confidence-fill" style={{ width: v + "%" }} />
      </div>
      <span>{v}/100</span>
    </div>
  );
}

export function ExplainPanel({
  node, summaryFallback, explainMode, explainText, explainLoading,
  onSwitchMode, followups, followupsLoading, onFollowup,
  citations, citationsLoading, onLoadCitations, onClose, onSave, isMobile,
}) {
  const [tab, setTab] = useState("Explain");
  const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.default;

  return (
    <div className={"nw-panel" + (isMobile ? " mobile" : "")} role="dialog" aria-modal="true" aria-label={node.label}>
      {isMobile && <div className="nw-panel-handle" />}
      <button className="nw-panel-close" onClick={onClose} aria-label="Close panel">Γ£ò</button>
      <div className="nw-panel-eyebrow" style={{ color }}>{node.category || "Concept"}</div>
      <h2 className="nw-panel-title">{node.label}</h2>
      <p className="nw-panel-relation">{node.explanation || summaryFallback}</p>
      {typeof node.strength === "number" && <ConfidenceBar value={node.strength} />}

      <div className="nw-tabs" role="tablist">
        {PANEL_TABS.map((t) => (
          <button
            key={t} role="tab" aria-selected={tab === t}
            className={"nw-tab" + (tab === t ? " active" : "")}
            onClick={() => { setTab(t); if (t === "Sources" && !citations) onLoadCitations(node); }}
          >{t}</button>
        ))}
      </div>

      {tab === "Explain" && (
        <>
          <div className="nw-tabs nw-tabs-sub">
            {EXPLAIN_MODES.map((m) => (
              <button key={m} className={"nw-tab" + (explainMode === m ? " active" : "")} onClick={() => onSwitchMode(m)}>{m}</button>
            ))}
          </div>
          <div className="nw-panel-body">
            {explainLoading
              ? <div className="nw-panel-loading"><span /><span /><span /></div>
              : <p>{explainText}</p>
            }
          </div>
        </>
      )}

      {tab === "Follow-ups" && (
        <div className="nw-panel-body">
          {followupsLoading
            ? <div className="nw-panel-loading"><span /><span /><span /></div>
            : followups?.length
              ? <div className="nw-followups">{followups.map((q) => (
                  <button key={q} className="nw-followup-chip" onClick={() => onFollowup(q)}>{q} ΓåÆ</button>
                ))}</div>
              : <p className="nw-muted">No follow-up questions available.</p>
          }
        </div>
      )}

      {tab === "Sources" && (
        <div className="nw-panel-body">
          <p className="nw-muted nw-sources-note">AI-grounded synthesis. Always verify critical facts independently.</p>
          {citationsLoading
            ? <div className="nw-panel-loading"><span /><span /><span /></div>
            : citations?.text
              ? <>
                  <p>{citations.text}</p>
                  {citations.citations?.length > 0 && (
                    <ul className="nw-source-list">
                      {citations.citations.map((c, i) => (
                        <li key={i}><a href={c.url} target="_blank" rel="noopener noreferrer">{c.title}</a></li>
                      ))}
                    </ul>
                  )}
                </>
              : <p className="nw-muted">No external sources loaded.</p>
          }
        </div>
      )}

      <button className="nw-ghost-btn nw-panel-save" onClick={() => onSave(node)}>Γÿå Save this graph</button>
    </div>
  );
}

export function SearchSuggestions({ items, onPick, activeIndex }) {
  if (!items.length) return null;
  return (
    <ul className="nw-suggest-list" role="listbox">
      {items.map((s, i) => (
        <li
          key={s.text + i}
          role="option"
          aria-selected={i === activeIndex}
          className={"nw-suggest-item" + (i === activeIndex ? " active" : "")}
          onMouseDown={(e) => { e.preventDefault(); onPick(s.text); }}
        >
          <span className="nw-suggest-kind">{s.kind}</span>
          {s.text}
        </li>
      ))}
    </ul>
  );
}
