import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Globe, Sparkles, Copy, Check, Code, Cpu, BookOpen, RefreshCw, Network, Layers, Loader2 } from 'lucide-react';
import ConceptGraph from './ConceptGraph';
import StepByStepViewer from './StepByStepViewer';

const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : 'code';
  const rawCode = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ margin: '0.75rem 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
      <div className="code-block-header">
        <span>{lang}</span>
        <button className="copy-code-btn" onClick={handleCopy}>
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy code'}</span>
        </button>
      </div>
      <pre style={{ margin: 0, padding: '1rem', background: '#07090e', overflowX: 'auto' }}>
        <code>{rawCode}</code>
      </pre>
    </div>
  );
};

export default function ChatWindow({
  messages,
  isGenerating,
  onSendMessage,
  onRegenerate,
  selectedModelName,
  webSearchEnabled,
  onToggleWebSearch,
  activeTopic,
  graphData,
  isGraphLoading,
  onGenerateGraph,
  onCloseGraph,
  stepGuideData,
  isStepLoading,
  onGenerateStepGuide,
  onCloseStepGuide
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating, graphData, stepGuideData]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const starterPrompts = [
    {
      icon: <Network size={18} />,
      title: 'Generate Concept Node Graph',
      desc: 'Visualize topic connections with expandable nodes.',
      prompt: 'Quantum Entanglement and Super-dense Coding',
      action: 'graph'
    },
    {
      icon: <BookOpen size={18} />,
      title: 'Step-by-Step Understanding',
      desc: 'Master complex subjects in 5 interactive steps.',
      prompt: 'How Transformers & Attention Mechanisms Work',
      action: 'step'
    },
    {
      icon: <Globe size={18} />,
      title: 'Real-Time Web Intelligence',
      desc: 'Fetch current factual knowledge and true data.',
      prompt: 'Fetch genuine real-time facts about fusion energy breakthroughs.',
      action: 'chat'
    },
    {
      icon: <Code size={18} />,
      title: 'Full-Stack Code Architecture',
      desc: 'Build scalable APIs and system implementations.',
      prompt: 'Write a high-performance Express & SSE streaming server.',
      action: 'chat'
    }
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', position: 'relative' }}>
      <div className="chat-view">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="welcome-hero">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>POWERED BY OPENROUTER & NEURAL INTELLIGENCE</span>
            </div>
            <h1 className="hero-title">
              Explore, Visualize & Master with <span className="gradient-text">NeuroWeb</span>
            </h1>
            <p className="hero-subtitle">
              Fetch genuine, true data, generate expandable concept node graphs, and learn any topic step-by-step.
            </p>

            <div className="quick-prompts-grid">
              {starterPrompts.map((p, i) => (
                <div
                  key={i}
                  className="quick-prompt-card"
                  onClick={() => {
                    if (p.action === 'graph') {
                      onSendMessage(p.prompt);
                      onGenerateGraph(p.prompt);
                    } else if (p.action === 'step') {
                      onSendMessage(p.prompt);
                      onGenerateStepGuide(p.prompt);
                    } else {
                      onSendMessage(p.prompt);
                    }
                  }}
                >
                  <div className="prompt-icon">{p.icon}</div>
                  <div className="prompt-title">{p.title}</div>
                  <div className="prompt-desc">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Messages List & Interactive Views */
          <div className="chat-view-inner">
            {messages.map((msg, index) => (
              <div key={index} className="message-row">
                <div className={`message-avatar ${msg.role === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                  {msg.role === 'user' ? 'U' : <Sparkles size={18} />}
                </div>

                <div className="message-content-wrapper">
                  <div className="message-author">
                    <span>{msg.role === 'user' ? 'You' : 'NeuroWeb AI'}</span>
                    {msg.role === 'assistant' && (
                      <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)' }}>
                        {selectedModelName}
                      </span>
                    )}
                  </div>

                  <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                    <div className="markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            if (inline) {
                              return <code className={className} {...props}>{children}</code>;
                            }
                            return <CodeBlock className={className}>{children}</CodeBlock>;
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {msg.role === 'assistant' && isGenerating && index === messages.length - 1 && (
                      <span className="cursor-blink" />
                    )}

                    {/* Interactive Action Shortcuts for Assistant Messages */}
                    {msg.role === 'assistant' && !isGenerating && (
                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                        <button
                          onClick={() => onGenerateGraph(messages[index - 1]?.content || 'Current Topic')}
                          disabled={isGraphLoading}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '10px',
                            background: 'rgba(0, 242, 254, 0.1)',
                            border: '1px solid var(--accent-cyan)',
                            color: 'var(--accent-cyan)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          {isGraphLoading ? <Loader2 size={14} className="spin" style={{ animation: 'spinSlow 1s linear infinite' }} /> : <Network size={14} />}
                          Generate Concept Graph
                        </button>

                        <button
                          onClick={() => onGenerateStepGuide(messages[index - 1]?.content || 'Current Topic')}
                          disabled={isStepLoading}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '10px',
                            background: 'rgba(121, 40, 202, 0.15)',
                            border: '1px solid var(--accent-purple)',
                            color: '#d8b4fe',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          {isStepLoading ? <Loader2 size={14} className="spin" style={{ animation: 'spinSlow 1s linear infinite' }} /> : <BookOpen size={14} />}
                          Step-by-Step Understanding
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Render Concept Graph view if generated */}
            {graphData && (
              <ConceptGraph
                topic={activeTopic}
                initialGraphData={graphData}
                onClose={onCloseGraph}
              />
            )}

            {/* Render Step-by-Step view if generated */}
            {stepGuideData && (
              <StepByStepViewer
                topic={activeTopic}
                stepGuideData={stepGuideData}
                onClose={onCloseStepGuide}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Box Footer */}
      <div className="input-area-container">
        <div className="input-box-wrapper">
          <textarea
            className="input-textarea"
            placeholder={webSearchEnabled ? "Ask anything (Web Search Enabled for genuine & verified facts)..." : "Ask NeuroWeb anything..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />

          <div className="input-actions-row">
            <div className="input-features">
              <button
                type="button"
                className={`web-search-toggle ${webSearchEnabled ? 'active' : ''}`}
                onClick={onToggleWebSearch}
                title="Toggle Web Search for verified facts"
              >
                <Globe size={16} />
                <span>Web Search</span>
              </button>

              {inputText.trim() && (
                <>
                  <button
                    type="button"
                    style={{
                      background: 'rgba(0, 242, 254, 0.1)',
                      border: '1px solid var(--border-glow)',
                      color: 'var(--accent-cyan)',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                    onClick={() => {
                      const topic = inputText.trim();
                      onSendMessage(topic);
                      onGenerateGraph(topic);
                      setInputText('');
                    }}
                  >
                    <Network size={14} />
                    <span>Graph View</span>
                  </button>

                  <button
                    type="button"
                    style={{
                      background: 'rgba(121, 40, 202, 0.15)',
                      border: '1px solid rgba(121, 40, 202, 0.3)',
                      color: '#d8b4fe',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                    onClick={() => {
                      const topic = inputText.trim();
                      onSendMessage(topic);
                      onGenerateStepGuide(topic);
                      setInputText('');
                    }}
                  >
                    <BookOpen size={14} />
                    <span>Step-by-Step</span>
                  </button>
                </>
              )}

              {messages.length > 0 && !isGenerating && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem'
                  }}
                  title="Regenerate last response"
                >
                  <RefreshCw size={14} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>

            <button
              type="button"
              className="send-btn"
              onClick={handleSubmit}
              disabled={!inputText.trim() || isGenerating}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
