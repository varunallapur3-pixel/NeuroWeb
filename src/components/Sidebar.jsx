import React from 'react';
import { Plus, MessageSquare, Trash2, Cpu, Zap } from 'lucide-react';

export default function Sidebar({
  isOpen,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenModelModal,
  selectedModelName,
  serverStatus
}) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Zap size={20} color="#fff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="sidebar-title gradient-text">NeuroWeb</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>VERIFIED INTELLIGENCE</span>
        </div>
      </div>

      {/* New Chat Button */}
      <button className="new-chat-btn" onClick={onNewChat}>
        <Plus size={18} />
        New Intelligence Session
      </button>

      {/* History List */}
      <div className="history-list">
        <div style={{ padding: '0.5rem 0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
          RECENT CHATS
        </div>

        {chats.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recent sessions. Start a new topic!
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`history-item ${chat.id === currentChatId ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare size={16} style={{ flexShrink: 0 }} />
              <span className="history-item-title">{chat.title || 'New Conversation'}</span>
              <button
                className="history-delete-btn"
                title="Delete chat"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Sidebar Footer Controls */}
      <div className="sidebar-footer">
        {/* Model Selection Shortcut */}
        <button
          onClick={onOpenModelModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.66rem 0.85rem',
            borderRadius: '12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Cpu size={16} color="var(--accent-cyan)" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, overflow: 'hidden' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ACTIVE MODEL</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedModelName}
            </span>
          </div>
        </button>

        {/* Server Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', padding: '0 0.25rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            NeuroWeb Intelligence Active
          </span>
        </div>
      </div>
    </aside>
  );
}
