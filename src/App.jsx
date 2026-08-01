import React, { useState, useEffect } from 'react';
import NeuralCanvas from './components/NeuralCanvas';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ConceptGraph from './components/ConceptGraph';
import StepByStepViewer from './components/StepByStepViewer';
import ModelSelectorModal from './components/ModelSelectorModal';
import { Menu, Cpu, Globe, MessageSquare, Network, GraduationCap, Search, Sparkles, Send, Loader2 } from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' | 'graph' | 'step'
  
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('neuroweb_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(null);
  
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-r1');
  const [models, setModels] = useState([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [serverStatus, setServerStatus] = useState({ hasDefaultKey: true });
  
  // Topic inputs for Studio modes
  const [studioTopicInput, setStudioTopicInput] = useState('');
  const [activeTopic, setActiveTopic] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [stepGuideData, setStepGuideData] = useState(null);
  const [isStepLoading, setIsStepLoading] = useState(false);

  // Modals state
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('neuroweb_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch((err) => console.error('Failed to reach backend server:', err));

    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => setModels(data.models || []))
      .catch((err) => console.error('Failed to fetch models:', err));
  }, []);

  const currentChat = chats.find((c) => c.id === currentChatId) || { messages: [] };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString()
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
    setActiveMode('chat');
  };

  const handleDeleteChat = (id) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  };

  const handleSendMessage = async (text) => {
    let activeChatId = currentChatId;
    let activeMessages = currentChat.messages || [];

    if (!activeChatId) {
      const newChat = {
        id: Date.now().toString(),
        title: text.length > 30 ? text.slice(0, 30) + '...' : text,
        messages: [],
        createdAt: new Date().toISOString()
      };
      activeChatId = newChat.id;
      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(activeChatId);
    } else if (activeMessages.length === 0) {
      const title = text.length > 30 ? text.slice(0, 30) + '...' : text;
      setChats((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, title } : c))
      );
    }

    setActiveTopic(text);

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...activeMessages, userMsg];
    const assistantMsgPlaceholder = { role: 'assistant', content: '' };
    const messagesForState = [...updatedMessages, assistantMsgPlaceholder];

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, messages: messagesForState } : c
      )
    );

    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel,
          temperature: 0.7,
          webSearchEnabled
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.replace(/^data:\s*/, '');

          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              accumulatedContent += `\n\n⚠️ **Error**: ${parsed.error}`;
            } else {
              const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text || '';
              accumulatedContent += delta;
            }

            setChats((prev) =>
              prev.map((c) => {
                if (c.id !== activeChatId) return c;
                const newMsgs = [...c.messages];
                newMsgs[newMsgs.length - 1] = {
                  role: 'assistant',
                  content: accumulatedContent
                };
                return { ...c, messages: newMsgs };
              })
            );
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Streaming Chat Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (!currentChatId || currentChat.messages.length === 0) return;
    const msgs = currentChat.messages;
    const lastUserIndex = [...msgs].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;

    const actualIndex = msgs.length - 1 - lastUserIndex;
    const lastUserPrompt = msgs[actualIndex].content;

    const truncated = msgs.slice(0, actualIndex);
    setChats((prev) =>
      prev.map((c) => (c.id === currentChatId ? { ...c, messages: truncated } : c))
    );

    handleSendMessage(lastUserPrompt);
  };

  // Generate Concept Graph Handler
  const handleGenerateGraph = async (topicToUse) => {
    const topic = topicToUse || studioTopicInput.trim();
    if (!topic) return;
    setIsGraphLoading(true);
    setActiveTopic(topic);
    setActiveMode('graph');

    try {
      const res = await fetch('/api/generate-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      if (!res.ok) throw new Error('Failed to generate graph');
      const data = await res.json();
      setGraphData(data.graph);
    } catch (err) {
      console.error('Graph Generation Error:', err);
    } finally {
      setIsGraphLoading(false);
    }
  };

  // Generate Step-by-Step Breakdown Handler
  const handleGenerateStepGuide = async (topicToUse) => {
    const topic = topicToUse || studioTopicInput.trim();
    if (!topic) return;
    setIsStepLoading(true);
    setActiveTopic(topic);
    setActiveMode('step');

    try {
      const res = await fetch('/api/step-by-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      if (!res.ok) throw new Error('Failed to generate step guide');
      const data = await res.json();
      setStepGuideData(data.guide);
    } catch (err) {
      console.error('Step Guide Generation Error:', err);
    } finally {
      setIsStepLoading(false);
    }
  };

  const selectedModelObj = models.find((m) => m.id === selectedModel) || { name: selectedModel };

  return (
    <div className="app-container">
      <NeuralCanvas />

      <Sidebar
        isOpen={sidebarOpen}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onOpenModelModal={() => setIsModelModalOpen(true)}
        selectedModelName={selectedModelObj.name || selectedModel}
        serverStatus={serverStatus}
      />

      <div className="main-content">
        {/* Top Navbar Header with Learning Mode Tabs */}
        <header className="top-navbar">
          <div className="navbar-left">
            <button
              className="toggle-sidebar-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Navigation Sidebar"
            >
              <Menu size={18} />
            </button>

            {/* LEARNING MODE SWITCHER TABS */}
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
              <button
                onClick={() => setActiveMode('chat')}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '20px',
                  background: activeMode === 'chat' ? 'linear-gradient(135deg, #00f2fe, #4f46e5)' : 'transparent',
                  border: 'none',
                  color: activeMode === 'chat' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <MessageSquare size={15} />
                <span>AI Chatbot</span>
              </button>

              <button
                onClick={() => setActiveMode('graph')}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '20px',
                  background: activeMode === 'graph' ? 'linear-gradient(135deg, #00f2fe, #7928ca)' : 'transparent',
                  border: 'none',
                  color: activeMode === 'graph' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Network size={15} />
                <span>Concept Graph Studio</span>
              </button>

              <button
                onClick={() => setActiveMode('step')}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '20px',
                  background: activeMode === 'step' ? 'linear-gradient(135deg, #7928ca, #ff007f)' : 'transparent',
                  border: 'none',
                  color: activeMode === 'step' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <GraduationCap size={15} />
                <span>Step-by-Step Academy</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="model-pill-button"
              onClick={() => setIsModelModalOpen(true)}
            >
              <Cpu size={16} color="var(--accent-cyan)" />
              <span>{selectedModelObj.name}</span>
            </button>

            <button
              className={`web-search-toggle ${webSearchEnabled ? 'active' : ''}`}
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            >
              <Globe size={16} />
              <span>{webSearchEnabled ? 'Web Search: ON' : 'Web Search: OFF'}</span>
            </button>
          </div>
        </header>

        {/* MODE CONTENT VIEWPORT */}
        {activeMode === 'chat' && (
          <ChatWindow
            messages={currentChat.messages || []}
            isGenerating={isGenerating}
            onSendMessage={handleSendMessage}
            onRegenerate={handleRegenerate}
            selectedModelName={selectedModelObj.name}
            webSearchEnabled={webSearchEnabled}
            onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
            activeTopic={activeTopic}
            graphData={graphData}
            isGraphLoading={isGraphLoading}
            onGenerateGraph={handleGenerateGraph}
            onCloseGraph={() => setGraphData(null)}
            stepGuideData={stepGuideData}
            isStepLoading={isStepLoading}
            onGenerateStepGuide={handleGenerateStepGuide}
            onCloseStepGuide={() => setStepGuideData(null)}
          />
        )}

        {activeMode === 'graph' && (
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Topic Input Bar for Concept Graph */}
              <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Network size={24} color="var(--accent-cyan)" />
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Enter any topic to build an interactive concept graph... (e.g. Quantum Computing, Neural Networks, Macroeconomics)"
                  value={studioTopicInput}
                  onChange={(e) => setStudioTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateGraph()}
                  style={{ flex: 1, fontSize: '1rem' }}
                />
                <button
                  onClick={() => handleGenerateGraph()}
                  disabled={!studioTopicInput.trim() || isGraphLoading}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #00f2fe, #7928ca)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
                  }}
                >
                  {isGraphLoading ? <Loader2 size={18} className="spin" style={{ animation: 'spinSlow 1s linear infinite' }} /> : <Sparkles size={18} />}
                  Build Concept Graph
                </button>
              </div>

              {/* Render Graph Visualizer */}
              {graphData ? (
                <ConceptGraph
                  topic={activeTopic || studioTopicInput}
                  initialGraphData={graphData}
                  onClose={() => setGraphData(null)}
                />
              ) : (
                <div className="welcome-hero">
                  <Network size={48} color="var(--accent-cyan)" />
                  <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Concept Knowledge Graph Studio</h2>
                  <p className="hero-subtitle">
                    Type any subject above to generate an interactive visual map with expandable sub-concept nodes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeMode === 'step' && (
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Topic Input Bar for Step-by-Step Academy */}
              <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <GraduationCap size={24} color="var(--accent-purple)" />
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Enter any topic for a step-by-step masterclass guide... (e.g. Building REST APIs, Organic Chemistry, General Relativity)"
                  value={studioTopicInput}
                  onChange={(e) => setStudioTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateStepGuide()}
                  style={{ flex: 1, fontSize: '1rem' }}
                />
                <button
                  onClick={() => handleGenerateStepGuide()}
                  disabled={!studioTopicInput.trim() || isStepLoading}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7928ca, #ff007f)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 0 15px rgba(121, 40, 202, 0.4)'
                  }}
                >
                  {isStepLoading ? <Loader2 size={18} className="spin" style={{ animation: 'spinSlow 1s linear infinite' }} /> : <Sparkles size={18} />}
                  Start Masterclass
                </button>
              </div>

              {/* Render Step-by-Step Guide Viewer */}
              {stepGuideData ? (
                <StepByStepViewer
                  topic={activeTopic || studioTopicInput}
                  stepGuideData={stepGuideData}
                  onClose={() => setStepGuideData(null)}
                />
              ) : (
                <div className="welcome-hero">
                  <GraduationCap size={48} color="var(--accent-purple)" />
                  <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Step-by-Step Learning Academy</h2>
                  <p className="hero-subtitle">
                    Enter any complex topic to break it down into 5 sequential, easy-to-understand interactive steps.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ModelSelectorModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={(id) => setSelectedModel(id)}
      />
    </div>
  );
}
