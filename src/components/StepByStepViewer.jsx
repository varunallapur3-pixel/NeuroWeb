import React, { useState } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, CheckCircle2, Copy, Check, Sparkles, X, Code } from 'lucide-react';

export default function StepByStepViewer({ topic, stepGuideData, onClose }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const steps = stepGuideData?.steps || [];
  const overview = stepGuideData?.overview || '';
  const currentStep = steps[currentStepIndex];

  if (steps.length === 0) return null;

  const handleCopyExample = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ width: '100%', margin: '1rem 0', padding: '1.5rem', borderRadius: '20px' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <BookOpen size={22} color="var(--accent-cyan)" />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Step-by-Step Learning Guide</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Topic: {topic}</span>
          </div>
        </div>

        {onClose && (
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Progress Bar & Step Tracker */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--accent-cyan)' }}>Step {currentStepIndex + 1} of {steps.length}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Mastered</span>
        </div>

        {/* Progress Bar Track */}
        <div style={{ height: '6px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #00f2fe, #7928ca)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Interactive Step Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setCurrentStepIndex(i)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                background: i === currentStepIndex ? 'rgba(0, 242, 254, 0.15)' : 'var(--bg-tertiary)',
                border: i === currentStepIndex ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                color: i === currentStepIndex ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {i < currentStepIndex ? <CheckCircle2 size={13} color="#10b981" /> : null}
              Step {step.stepNumber}: {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Active Step Detail Card */}
      {currentStep && (
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #00f2fe, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
              {currentStep.stepNumber}
            </div>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentStep.title}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                {currentStep.summary}
              </p>
            </div>
          </div>

          {/* Detailed Explanation */}
          <div style={{ background: 'var(--bg-card)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text-primary)' }}>
            {currentStep.detail}
          </div>

          {/* Code / Practical Example Snippet if available */}
          {currentStep.example && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              <div className="code-block-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Code size={14} color="var(--accent-cyan)" />
                  PRACTICAL EXAMPLE / CODE SNIPPET
                </span>
                <button className="copy-code-btn" onClick={() => handleCopyExample(currentStep.example)}>
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre style={{ margin: 0, padding: '1rem', background: '#05060a', overflowX: 'auto', fontSize: '0.88rem', color: '#e5e7eb' }}>
                <code>{currentStep.example}</code>
              </pre>
            </div>
          )}

          {/* Key Takeaway Banner */}
          {currentStep.keyTakeaway && (
            <div style={{ padding: '0.85rem 1.1rem', borderRadius: '12px', background: 'rgba(121, 40, 202, 0.12)', border: '1px solid rgba(121, 40, 202, 0.3)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={18} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: '#d8b4fe' }}>Key Takeaway: </strong>
                <span style={{ color: 'var(--text-primary)' }}>{currentStep.keyTakeaway}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
        <button
          onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentStepIndex === 0}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-light)',
            color: currentStepIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            fontSize: '0.85rem',
            cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <ChevronLeft size={16} />
          Previous Step
        </button>

        <button
          onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
          disabled={currentStepIndex === steps.length - 1}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            background: currentStepIndex === steps.length - 1 ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #00f2fe, #4f46e5)',
            border: 'none',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: currentStepIndex === steps.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          Next Step
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
