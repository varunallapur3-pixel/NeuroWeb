import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Network, Plus, Loader2, Sparkles, X, ZoomIn, ZoomOut, Maximize2, Search, Layers } from 'lucide-react';
import { generateFallbackNodeExpansion } from '../utils/fallbackGenerator';

export default function ConceptGraph({ topic, initialGraphData, onClose }) {
  const svgRef = useRef(null);
  const animRef = useRef(null);
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

  // Responsive state
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize node layout from data
  useEffect(() => {
    if (!initialGraphData?.nodes) return;

    const width = 900;
    const height = 560;
    const centerX = width / 2;
    const centerY = height / 2;
    const rawNodes = initialGraphData.nodes;

    const formattedNodes = rawNodes.map((node, i) => {
      if (i === 0 || node.category === 'core') {
        return { ...node, x: centerX, y: centerY, vx: 0, vy: 0, isRoot: true };
      }
      const angle = ((i - 1) / (rawNodes.length - 1)) * 2 * Math.PI;
      const radius = isMobile ? 130 : 190;
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      };
    });

    setNodes(formattedNodes);
    setLinks(initialGraphData.links || []);
    if (formattedNodes.length > 0) {
      setSelectedNode(formattedNodes[0]);
    }
  }, [initialGraphData, isMobile]);

  // Organic Physics Force Simulation for Smooth Layout & Elastic Movement
  useEffect(() => {
    if (nodes.length === 0) return;

    let running = true;
    const simulate = () => {
      if (!running) return;

      setNodes((prevNodes) => {
        if (prevNodes.length === 0) return prevNodes;

        const updated = prevNodes.map((n) => ({ ...n }));
        const kRepel = 24000;
        const kLink = 0.04;
        const targetLinkDist = isMobile ? 110 : 160;
        const damping = 0.82;

        // 1. Repulsion between all nodes
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const n1 = updated[i];
            const n2 = updated[j];
            let dx = n2.x - n1.x;
            let dy = n2.y - n1.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 1;

            if (dist < 320) {
              const force = kRepel / (dist * dist);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (!n1.isRoot && n1.id !== draggedNodeId) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (!n2.isRoot && n2.id !== draggedNodeId) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // 2. Spring attraction along links
        links.forEach((l) => {
          const s = updated.find((n) => n.id === l.source);
          const t = updated.find((n) => n.id === l.target);
          if (s && t) {
            let dx = t.x - s.x;
            let dy = t.y - s.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 1;
            let delta = dist - targetLinkDist;
            let fx = (dx / dist) * delta * kLink;
            let fy = (dy / dist) * delta * kLink;

            if (!s.isRoot && s.id !== draggedNodeId) {
              s.vx += fx;
              s.vy += fy;
            }
            if (!t.isRoot && t.id !== draggedNodeId) {
              t.vx -= fx;
              t.vy -= fy;
            }
          }
        });

        // 3. Apply velocity & friction
        return updated.map((n) => {
          if (n.id === draggedNodeId) return n;

          n.vx = (n.vx || 0) * damping;
          n.vy = (n.vy || 0) * damping;

          // Cap velocity
          const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
          if (speed > 8) {
            n.vx = (n.vx / speed) * 8;
            n.vy = (n.vy / speed) * 8;
          }

          if (Math.abs(n.vx) > 0.05 || Math.abs(n.vy) > 0.05) {
            return {
              ...n,
              x: n.x + n.vx,
              y: n.y + n.vy
            };
          }
          return n;
        });
      });

      animRef.current = requestAnimationFrame(simulate);
    };

    animRef.current = requestAnimationFrame(simulate);
    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [links, draggedNodeId, isMobile]);

  // Expand a specific node
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
      const fallback = generateFallbackNodeExpansion(node.id, node.label, topic);
      newNodes = fallback.newNodes;
      newLinks = fallback.newLinks;
    }

    const parentX = node.x;
    const parentY = node.y;
    const radius = isMobile ? 90 : 130;

    const formattedNewNodes = newNodes.map((nn, idx) => {
      const angle = (idx / newNodes.length) * 2 * Math.PI;
      return {
        ...nn,
        x: parentX + Math.cos(angle) * radius,
        y: parentY + Math.sin(angle) * radius,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        parentId: node.id
      };
    });

    setNodes((prev) => [...prev, ...formattedNewNodes]);
    setLinks((prev) => [...prev, ...newLinks]);
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, expanded: true } : n))
    );
    setExpandingNodeId(null);
  };

  // Node Drag Handlers (Mouse & Touch)
  const getEventCoords = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handleNodeStart = (nodeId, e) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    setDraggedNodeId(nodeId);
  };

  const handleMove = useCallback((e) => {
    const coords = getEventCoords(e);
    if (draggedNodeId) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clientX = (coords.clientX - rect.left - pan.x) / zoom;
      const clientY = (coords.clientY - rect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) => (n.id === draggedNodeId ? { ...n, x: clientX, y: clientY, vx: 0, vy: 0 } : n))
      );
    } else if (isDraggingBg) {
      setPan({
        x: coords.clientX - dragStart.x,
        y: coords.clientY - dragStart.y
      });
    }
  }, [draggedNodeId, isDraggingBg, pan, zoom, dragStart]);

  const handleEnd = useCallback(() => {
    setDraggedNodeId(null);
    setIsDraggingBg(false);
  }, []);

  const handleBgStart = (e) => {
    const coords = getEventCoords(e);
    setIsDraggingBg(true);
    setDragStart({
      x: coords.clientX - pan.x,
      y: coords.clientY - pan.y
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
    <div className="glass-panel" style={{ width: '100%', margin: '0.5rem 0', padding: isMobile ? '0.85rem' : '1.25rem', position: 'relative', borderRadius: '24px', background: 'rgba(10, 12, 18, 0.95)' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #00f2fe, #7928ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Network size={20} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: isMobile ? '1.05rem' : '1.2rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
              Concept Knowledge Studio
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Topic: <strong style={{ color: 'var(--accent-cyan)' }}>{topic}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Zoom Controls */}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '10px', padding: '2px', border: '1px solid var(--border-light)' }}>
            <button onClick={handleZoomIn} style={{ padding: '5px 8px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }} title="Zoom In">
              <ZoomIn size={15} />
            </button>
            <button onClick={handleZoomOut} style={{ padding: '5px 8px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }} title="Zoom Out">
              <ZoomOut size={15} />
            </button>
            <button onClick={handleResetView} style={{ padding: '5px 8px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }} title="Reset View">
              <Maximize2 size={15} />
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
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1rem', position: 'relative', minHeight: isMobile ? '380px' : '540px' }}>
        {/* SVG Interactive Canvas */}
        <div
          style={{ flex: 1, position: 'relative', borderRadius: '18px', background: '#05060b', border: '1px solid var(--border-light)', overflow: 'hidden', touchAction: 'none', cursor: isDraggingBg ? 'grabbing' : 'grab' }}
          onMouseDown={handleBgStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleBgStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          <svg
            ref={svgRef}
            style={{ width: '100%', height: isMobile ? '380px' : '540px' }}
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
                      stroke="rgba(0, 242, 254, 0.4)"
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
                const nodeRadius = isRoot ? (isMobile ? 26 : 32) : (isMobile ? 20 : 24);

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
                    onMouseDown={(e) => handleNodeStart(node.id, e)}
                    onTouchStart={(e) => handleNodeStart(node.id, e)}
                  >
                    {(isSelected || isSearchMatch) && (
                      <circle
                        r={nodeRadius + 8}
                        fill="none"
                        stroke="#00f2fe"
                        strokeWidth="2"
                        opacity="0.7"
                        filter="url(#glow-cyan)"
                      />
                    )}

                    <circle
                      r={nodeRadius}
                      fill={isRoot ? '#7928ca' : styleConfig.bg}
                      stroke={isSelected ? '#ffffff' : styleConfig.stroke}
                      strokeWidth={isSelected ? 3 : 2}
                      filter={isRoot ? 'url(#glow-purple)' : 'none'}
                    />

                    <text
                      y={4}
                      fill={styleConfig.text}
                      fontSize={isRoot ? '11' : '9'}
                      fontWeight="bold"
                      fontFamily="Outfit, sans-serif"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {node.label.length > 12 ? node.label.slice(0, 10) + '..' : node.label}
                    </text>

                    <text
                      y={nodeRadius + 16}
                      fill={isSelected ? '#00f2fe' : '#e5e7eb'}
                      fontSize="10"
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
                      onTouchEnd={(e) => handleExpandNode(node, e)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        r="10"
                        fill="#00f2fe"
                        stroke="#000"
                        strokeWidth="1.5"
                      />
                      {isExpandingThis ? (
                        <text y="3" x="0" fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle">
                          ..
                        </text>
                      ) : (
                        <text y="4" x="0" fill="#000" fontSize="11" fontWeight="bold" textAnchor="middle">
                          +
                        </text>
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Guidance Footer */}
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', background: 'rgba(15, 17, 26, 0.9)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <Sparkles size={14} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <span>Tap (+) to expand sub-concepts. Drag nodes to adjust layout.</span>
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        <div style={{ width: isMobile ? '100%' : '320px', background: 'var(--bg-tertiary)', borderRadius: '18px', padding: '1.1rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Node Search Filter */}
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search concepts..."
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
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.15)', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {selectedNode.category || 'Concept'}
                  </span>
                  {selectedNode.expanded && (
                    <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
                      Expanded ✓
                    </span>
                  )}
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                  {selectedNode.label}
                </h4>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, flex: 1, overflowY: 'auto', maxHeight: isMobile ? '160px' : 'none' }}>
                {selectedNode.description || 'No detailed description provided for this concept.'}
              </div>

              <button
                onClick={(e) => handleExpandNode(selectedNode, e)}
                disabled={expandingNodeId === selectedNode.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: expandingNodeId === selectedNode.id ? 'var(--bg-card)' : 'linear-gradient(135deg, #00f2fe, #4f46e5)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: expandingNodeId === selectedNode.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)'
                }}
              >
                {expandingNodeId === selectedNode.id ? <Loader2 size={16} className="spin" style={{ animation: 'spinSlow 1s linear infinite' }} /> : <Plus size={16} />}
                {expandingNodeId === selectedNode.id ? 'Expanding...' : 'Expand Concept Node (+)'}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', textAlign: 'center', gap: '0.5rem', padding: '1rem 0' }}>
              <Layers size={32} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.82rem' }}>Select any concept node to inspect definitions & expand sub-concepts.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
