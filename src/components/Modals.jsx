import React, { useState, useEffect } from "react";
import { CATEGORY_COLORS, SHORTCUTS } from "../constants.js";
import { getStoredApiKey } from "../api.js";
import { downloadBlob } from "../utils.js";

export function ApiKeyModal({ onClose, onSave }) {
  const [key, setKey] = useState(getStoredApiKey());

  return (
    <div className="nw-modal-backdrop" onClick={onClose}>
      <div
        className="nw-modal nw-apikey-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nw-modal-head">
          <h3>Anthropic Claude API Key</h3>
          <button className="nw-icon-btn" onClick={onClose} aria-label="Close">Γ£ò</button>
        </div>
        <p className="nw-muted">
          Your key is saved locally in your browser. Without a key, NeuroWeb
          uses its built-in offline intelligence engine.
        </p>
        <div style={{ margin: "16px 0" }}>
          <input
            className="nw-apikey-input"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-api03-ΓÇª"
          />
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {key && (
            <button
              className="nw-ghost-btn"
              onClick={() => { setKey(""); onSave(""); }}
            >
              Clear Key
            </button>
          )}
          <button className="nw-primary-btn" onClick={() => onSave(key)}>
            Save &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShortcutsOverlay({ onClose }) {
  return (
    <div className="nw-modal-backdrop" onClick={onClose}>
      <div
        className="nw-modal nw-shortcuts-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nw-modal-head">
          <h3>Keyboard shortcuts</h3>
          <button className="nw-icon-btn" onClick={onClose} aria-label="Close">Γ£ò</button>
        </div>
        <div className="nw-shortcuts-grid">
          {SHORTCUTS.map((s) => (
            <React.Fragment key={s.desc}>
              <kbd>{s.keys}</kbd>
              <span>{s.desc}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContextMenu({ x, y, node, onAction, onClose }) {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [onClose]);

  const items = [
    { id: "explain", label: "≡ƒÆ¼ Explain concept" },
    { id: "steps", label: "≡ƒ¬£ Step-by-step breakdown" },
    { id: node.expanded ? "collapse" : "expand", label: node.expanded ? "Γ₧û Collapse branch" : "Γ₧ò Expand branch" },
    { id: node.pinned ? "unpin" : "pin", label: node.pinned ? "≡ƒöô Unpin position" : "≡ƒôî Pin position" },
    { id: "root", label: "≡ƒöì Explore as new topic" },
    { id: "copy", label: "≡ƒôï Copy label" },
  ];
  if (!node.isRoot) items.push({ id: "remove", label: "≡ƒùæ Remove node", danger: true });

  return (
    <div className="nw-ctxmenu" style={{ left: x, top: y }} role="menu" onClick={(e) => e.stopPropagation()}>
      {items.map((it) => (
        <button
          key={it.id}
          role="menuitem"
          className={"nw-ctxmenu-item" + (it.danger ? " danger" : "")}
          onClick={() => { onAction(it.id, node); onClose(); }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function StepByStepModal({ topic, steps, onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="nw-modal-backdrop" onClick={onClose}>
      <div className="nw-modal nw-steps-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="nw-modal-head">
          <h3>≡ƒ¬£ Step-by-Step Breakdown ┬╖ {topic}</h3>
          <button className="nw-icon-btn" onClick={onClose} aria-label="Close">Γ£ò</button>
        </div>
        <div className="nw-steps-stepper">
          {steps.map((s, idx) => (
            <button
              key={idx}
              className={"nw-step-indicator" + (idx === activeStep ? " active" : "") + (idx < activeStep ? " completed" : "")}
              onClick={() => setActiveStep(idx)}
            >
              <span className="nw-step-num">{idx + 1}</span>
            </button>
          ))}
        </div>
        <div className="nw-step-content">
          <div className="nw-step-badge">Step {activeStep + 1} of {steps.length}</div>
          <h4 className="nw-step-title">{steps[activeStep]?.title}</h4>
          <p className="nw-step-desc">{steps[activeStep]?.description}</p>
        </div>
        <div className="nw-steps-actions">
          <button
            className="nw-ghost-btn"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          >
            ΓåÉ Previous Step
          </button>
          {activeStep < steps.length - 1 ? (
            <button className="nw-primary-btn" onClick={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}>
              Next Step ΓåÆ
            </button>
          ) : (
            <button className="nw-primary-btn" onClick={onClose}>
              Done Γ£ô
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuizModal({ questions, onClose }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[i];

  const pick = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 >= questions.length) { setDone(true); return; }
    setI((v) => v + 1);
    setPicked(null);
  };

  return (
    <div className="nw-modal-backdrop" onClick={onClose}>
      <div className="nw-modal nw-quiz-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="nw-modal-head">
          <h3>Quiz</h3>
          <button className="nw-icon-btn" onClick={onClose} aria-label="Close">Γ£ò</button>
        </div>
        {done ? (
          <div className="nw-quiz-done">
            <div className="nw-quiz-score">{score} / {questions.length}</div>
            <p className="nw-muted">Nice work exploring the graph.</p>
            <button className="nw-primary-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="nw-quiz-progress">Question {i + 1} of {questions.length}</div>
            <div className="nw-quiz-question">{q.question}</div>
            <div className="nw-quiz-options">
              {q.options.map((opt, idx) => {
                let cls = "nw-quiz-option";
                if (picked !== null) {
                  if (idx === q.correctIndex) cls += " correct";
                  else if (idx === picked) cls += " incorrect";
                }
                return (
                  <button key={idx} className={cls} onClick={() => pick(idx)} disabled={picked !== null}>{opt}</button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="nw-quiz-explain">
                <p>{q.explanation}</p>
                <button className="nw-primary-btn" onClick={next}>
                  {i + 1 >= questions.length ? "See results" : "Next question"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function FlashcardModal({ cards, onClose }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[i];

  const go = (dir) => { setFlipped(false); setI((v) => Math.max(0, Math.min(cards.length - 1, v + dir))); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") { e.preventDefault(); setFlipped((f) => !f); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cards.length]);

  return (
    <div className="nw-modal-backdrop" onClick={onClose}>
      <div className="nw-modal nw-flash-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="nw-modal-head">
          <h3>Flashcards <span className="nw-muted">{i + 1}/{cards.length}</span></h3>
          <button className="nw-icon-btn" onClick={onClose} aria-label="Close">Γ£ò</button>
        </div>
        <button
          className={"nw-flashcard" + (flipped ? " flipped" : "")}
          onClick={() => setFlipped((f) => !f)}
          aria-label="Flip card"
        >
          <div className="nw-flashcard-face nw-flashcard-front">{card.front}</div>
          <div className="nw-flashcard-face nw-flashcard-back">{card.back}</div>
        </button>
        <div className="nw-flash-controls">
          <button className="nw-ghost-btn" onClick={() => go(-1)} disabled={i === 0}>ΓåÉ Prev</button>
          <span className="nw-muted">Space to flip</span>
          <button className="nw-ghost-btn" onClick={() => go(1)} disabled={i === cards.length - 1}>Next ΓåÆ</button>
        </div>
      </div>
    </div>
  );
}

export function ReportModal({ topic, markdown, onClose }) {
  return (
    <div className="nw-modal-backdrop" onClick={onClose}>
      <div className="nw-modal nw-report-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="nw-modal-head">
          <h3>Research brief ┬╖ {topic}</h3>
          <div className="nw-modal-head-actions">
            <button
              className="nw-ghost-btn"
              onClick={() => downloadBlob(`${topic.slice(0, 40)}-report.md`, markdown, "text/markdown")}
            >Export .md</button>
            <button className="nw-ghost-btn" onClick={() => window.print()}>Print / Save PDF</button>
            <button className="nw-icon-btn" onClick={onClose} aria-label="Close">Γ£ò</button>
          </div>
        </div>
        <div className="nw-report-body" id="nw-print-area">
          {markdown.split("\n").map((line, idx) => {
            if (line.startsWith("### ")) return <h4 key={idx}>{line.slice(4)}</h4>;
            if (line.startsWith("## ")) return <h3 key={idx}>{line.slice(3)}</h3>;
            if (line.startsWith("# ")) return <h2 key={idx}>{line.slice(2)}</h2>;
            if (!line.trim()) return <br key={idx} />;
            return <p key={idx}>{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
