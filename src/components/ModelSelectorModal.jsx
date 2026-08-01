import React from 'react';
import { X, Cpu, Check, Sparkles } from 'lucide-react';

export default function ModelSelectorModal({
  isOpen,
  onClose,
  models,
  selectedModel,
  onSelectModel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={22} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Select Intelligence Model</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Choose an AI model for your current session. All models process requests via OpenRouter API with high speed & verified response accuracy.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto' }}>
          {models.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <div
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  onClose();
                }}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(0, 242, 254, 0.1)' : 'var(--bg-tertiary)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{model.name}</span>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                      {model.provider}
                    </span>
                    {model.badge && (
                      <span className="model-badge">
                        {model.badge}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {model.description}
                  </span>
                </div>

                {isSelected && (
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={16} color="#000" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
