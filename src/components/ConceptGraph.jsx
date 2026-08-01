import React, { useState, useEffect, useRef } from 'react';
import { Network, Plus, Loader2, Sparkles, X, RefreshCw, Layers, ZoomIn, ZoomOut, Maximize2, Search, Info } from 'lucide-react';
import { generateFallbackNodeExpansion } from '../utils/fallbackGenerator';

export default function ConceptGraph({ topic, initialGraphData, onClose }) {
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandingNodeId, setExpandingNodeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pan & Zoom viewport state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Node Dragging state
  const [draggedNodeId, setDraggedNodeId] = useState(null);

  // Initialize node layout from data
  useEffect(() => {
    if (!initialGraphData?.nodes) return;

    const width = 900;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const rawNodes = initialGraphData.nodes;

    const formattedNodes = rawNodes.map((node, i) => {
      if (i === 0 || node.category === 'core') {
        return { ...node, x: centerX, y: centerY, isRoot: true };
      }
      const angle = ((i - 1) / (rawNodes.length - 1)) * 2 * Math.PI;
      const radius = 190;
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    setNodes(formattedNodes);
    setLinks(initialGraphData.links || []);
    if (formattedNodes.length > 0) {
      setSelectedNode(formattedNodes[0]);
    }
  }, [initialGraphData]);

  // Expand a specific node by fetching child concepts from API
  const handleExpandNode = async (node, e) => {
    if (e) e.stopPropagation();
    if (expandingNodeId) return;

    setExpandingNodeId(node.id);

    let newNodes = [];
    let newLinks = [];

    try {
      const response = await fetch('/api/expand-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentNodeId: node.id,
          nodeLabel: node.label,
          nodeDescription: node.description,
          topic
        })
      });

      if (response.ok) {
        const data = await response.json();
        newNodes = data.newNodes || [];
        newLinks = data.newLinks || [];
      } else {
        throw new Error('API unavailable');
      }
    } catch (apiErr) {
      // Fallback for static hosting on GitHub Pages
      const fallback = generateFallbackNodeExpansion(node.id, node.label, topic);
      newNodes = fallback.newNodes;
      newLinks = fallback.newLinks;
    }

    // Position new child nodes radially around the expanded parent node
    const parentX = node.x;
    const parentY = node.y;
    const radius = 130;

    const formattedNewNodes = newNodes.map((nn, idx) => {
      const angle = (idx / newNodes.length) * 2 * Math.PI;
      return {
        ...nn,
        x: parentX + Math.cos(angle) * radius,
        y: parentY + Math.sin(angle) * radius,
        parentId: node.id
      };
    });

    setNodes((prev) => [...prev, ...formattedNewNodes]);
    setLinks((prev) => [...prev, ...newLinks]);
    
    // Update expanded state on parent node
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, expanded: true } : n))
    );
    setExpandingNodeId(null);
  };

  // Node Mouse Drag Handlers
  const handleNodeMouseDown = (nodeId, e) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
  };

  const handleMouseMove = (e) => {
    if (draggedNodeId) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clientX = (e.clientX - rect.left - pan.x) / zoom;
      const clientY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) => (n.id === draggedNodeId ? { ...n, x: clientX, y: clientY } : n))
      );
    } else if (isDraggingBg) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsDraggingBg(false);
  };

  const handleBgMouseDown = (e) => {
    setIsDraggingBg(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  // Zoom Controls
  const handleZoomIn = () => setZoom((prev) => Math.min(2.5, prev + 0.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.4, prev - 0.2));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const categoryColors = {
    core: { bg: '#7928ca', stroke: '#00f2fe', text: '#ffffff' },
    subconcept: { bg: '#161926', stroke: '#00f2fe', text: '#e5e7eb' },
    application: { bg: '#161926', stroke: '#10b981', text: '#e5e7eb' },
    theory: { bg: '#161926', stroke: '#f59e0b', text: '#e5e7eb' },
    detail: { bg: '#0d0f18', stroke: '#a855f7', text: '#d8b4fe' }
  };

  return (
    <div className="glass-panel" style={{ width: '100%', margin: '1rem 0', padding: '1.25rem', position: 'relative', borderRadius: '24px', background: 'rgba(10, 12, 18, 0.95)' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #00f2fe, #7928ca)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Network size={22} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
              Interactive Concept Knowledge Studio
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Topic: <strong style={{ color: 'var(--accent-cyan)' }}>{topic}</strong> • Click any node directly to expand child concepts
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Zoom Toolbar */}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '10px', padding: '2px', border: '1px solid var(--border-light)' }}>
            <button onClick={handleZoomIn} style={{ padding: '6px 10px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }} title="Zoom In">
              <ZoomIn size={16} />
            </button>
            <button onClick={handleZoomOut} style={{ padding: '6px 10px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }} title="Zoom Out">
              <ZoomOut size={16} />
            </button>
            <button onClick={handleResetView} style={{ padding: '6px 10px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }} title="Reset View">
              <Maximize2 size={16} />
            </button>
          </div>

          {onClose && (
            <button className="modal-close-btn" onClick={onClose} title="Close Studio">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div style={{ display: 'flex', gap: '1rem', position: 'relative', minHeight: '560px' }}>
        {/* SVG Interactive Canvas */}
        <div
          style={{ flex: 1, position: 'relative', borderRadius: '18px', background: '#05060b', border: '1px solid var(--border-light)', overflow: 'hidden', cursor: isDraggingBg ? 'grabbing' : 'grab' }}
          onMouseDown={handleBgMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <svg
            ref={svgRef}
            style={{ width: '100%', height: '560px' }}
          >
            <defs>
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Render Links */}
              {links.map((link, idx) => {
                const source = nodes.find((n) => n.id === link.source);
                const target = nodes.find((n) => n.id === link.target);
                if (!source || !target) return null;

                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={`link-${idx}`}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="rgba(0, 242, 254, 0.35)"
                      strokeWidth="2"
                      strokeDasharray={link.relationship === 'explains' ? '4 4' : 'none'}
                    />
                    {link.relationship && (
                      <text
                        x={midX}
                        y={midY - 6}
                        fill="#9ca3af"
                        fontSize="10"
                        fontFamily="Outfit, sans-serif"
                        textAnchor="middle"
                      >
                        {link.relationship}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Render Interactive Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isRoot = node.isRoot || node.category === 'core' || node.id === '1';
                const isExpandingThis = expandingNodeId === node.id;

                const styleConfig = categoryColors[node.category] || categoryColors.subconcept;
                const nodeRadius = isRoot ? 32 : 24;

                const isSearchMatch = searchTerm && node.label.toLowerCase().includes(searchTerm.toLowerCase());

                return (
                  <g
                    key={`node-${node.id}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                  >
                    {/* Pulsing selection aura */}
                    {(isSelected || isSearchMatch) && (
                      <circle
                        r={nodeRadius + 10}
                        fill="none"
                        stroke="#00f2fe"
                        strokeWidth="2"
                        opacity="0.6"
                        filter="url(#glow-cyan)"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      r={nodeRadius}
                      fill={isRoot ? '#7928ca' : styleConfig.bg}
                      stroke={isSelected ? '#ffffff' : styleConfig.stroke}
                      strokeWidth={isSelected ? 3 : 2}
                      filter={isRoot ? 'url(#glow-purple)' : 'none'}
                    />

                    {/* Node Label inside circle */}
                    <text
                      y={4}
                      fill={styleConfig.text}
                      fontSize={isRoot ? '12' : '10'}
                      fontWeight="bold"
                      fontFamily="Outfit, sans-serif"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {node.label.length > 14 ? node.label.slice(0, 12) + '..' : node.label}
                    </text>

                    {/* Node Full Label below circle */}
                    <text
                      y={nodeRadius + 18}
                      fill={isSelected ? '#00f2fe' : '#e5e7eb'}
                      fontSize="11"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="Outfit, sans-serif"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {node.label}
                    </text>

                    {/* Direct Click-to-Expand (+) Badge Button */}
                    <g
                      transform={`translate(${nodeRadius - 4}, ${-nodeRadius + 4})`}
                      onClick={(e) => handleExpandNode(node, e)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        r="11"
                        fill="#00f2fe"
                        stroke="#000"
                        strokeWidth="1.5"
                      />
                      {isExpandingThis ? (
                        <text y="4" x="0" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">
                          ..
                        </text>
                      ) : (
                        <text y="4" x="0" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">
                          +
                        </text>
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Quick Guidance Footer Overlay */}
          <div style={{ position: 'absolute', bottom: '14px', left: '14px', background: 'rgba(15, 17, 26, 0.9)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span>Click any node's <strong>(+)</strong> badge to expand sub-concepts. Drag nodes to customize your layout.</span>
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        <div style={{ width: '320px', background: 'var(--bg-tertiary)', borderRadius: '18px', padding: '1.25rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Node Search Filter */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search concepts on graph..."
              className="custom-input"
              style={{ paddingLeft: '2.2rem', fontSize: '0.82rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {selectedNode ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.15)', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {selectedNode.category || 'Concept'}
                  </span>
                  {selectedNode.expanded && (
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
                      Expanded ✓
                    </span>
                  )}
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.4rem', color: 'var(--text-primary)' }}>
                  {selectedNode.label}
                </h4>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, overflowY: 'auto' }}>
                {selectedNode.description || 'No detailed description provided for this concept.'}
              </div>

              {/* Direct Action Button */}
              <button
                onClick={(e) => handleExpandNode(selectedNode, e)}
                disabled={expandingNodeId === selectedNode.id}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: expandingNodeId === selectedNode.id ? 'var(--bg-card)' : 'linear-gradient(135deg, #00f2fe, #4f46e5)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: expandingNodeId === selectedNode.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)'
                }}
              >
                {expandingNodeId === selectedNode.id ? <Loader2 size={16} className="spin" style={{ animation: 'spinSlow 1s linear infinite' }} /> : <Plus size={16} />}
                {expandingNodeId === selectedNode.id ? 'Expanding Sub-Concepts...' : 'Expand Concept Node (+)'}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', textAlign: 'center', gap: '0.75rem' }}>
              <Layers size={36} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.88rem' }}>Select any node on the graph studio to inspect detailed definitions & expand sub-concepts.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
