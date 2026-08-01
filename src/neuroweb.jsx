import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";
import "./App.css";

import {
  CATEGORY_COLORS,
  RELATIONSHIP_COLORS,
  SEED_TRENDING,
} from "./constants.js";

import {
  getStoredApiKey,
  setStoredApiKey,
  generateGraph,
  generateElaboration,
  generateSteps,
  generateFollowups,
  generateCitations,
  generateSummary,
  generateQuiz,
  generateFlashcards,
  generateReport,
} from "./api.js";

import {
  linkEndId,
  downloadBlob,
  graphToMarkdown,
  svgToPngDownload,
} from "./utils.js";

import { NeuralBackground, BackgroundBoundary } from "./components/NeuralBackground.jsx";
import WaterButton from "./components/WaterButton.jsx";
import {
  ApiKeyModal,
  ShortcutsOverlay,
  ContextMenu,
  StepByStepModal,
  QuizModal,
  FlashcardModal,
  ReportModal,
} from "./components/Modals.jsx";
import {
  Toasts,
  CommandPalette,
  NodeTooltip,
  Minimap,
  FilterBar,
  ExplainPanel,
  SearchSuggestions,
} from "./components/Panels.jsx";

/* =========================================================================
   NeuroWeb ΓÇö Explorable AI Knowledge Graph
   Main Application Shell
   ========================================================================= */

class AppBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, message: "" };
  }
  static getDerivedStateFromError(err) { return { failed: true, message: err?.message || String(err) }; }
  componentDidCatch(err, info) { console.error("NeuroWeb error:", err, info); }
  render() {
    if (this.state.failed) {
      return (
        <div className="nw-crash">
          <div className="nw-crash-title">NeuroWeb Error</div>
          <div className="nw-crash-msg">{this.state.message}</div>
          <button className="nw-primary-btn" onClick={() => this.setState({ failed: false, message: "" })}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function NeuroWebApp({ initialTopic }) {
  return (
    <AppBoundary>
      <NeuroWeb initialTopic={initialTopic} />
    </AppBoundary>
  );
}

function NeuroWeb({ initialTopic }) {
  const [query, setQuery] = useState(initialTopic || "");
  const [phase, setPhase] = useState("home");
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState("");
  const [rootLabel, setRootLabel] = useState("");
  const [, setRootId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [explainMode, setExplainMode] = useState("Simplified");
  const [explainText, setExplainText] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [followups, setFollowups] = useState(null);
  const [followupsLoading, setFollowupsLoading] = useState(false);
  const [citations, setCitations] = useState(null);
  const [citationsLoading, setCitationsLoading] = useState(false);
  const [expandingId, setExpandingId] = useState(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [, forceTick] = useState(0);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false
  );
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 720);

  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => !!getStoredApiKey());
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [tooltipNode, setTooltipNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [ctxMenu, setCtxMenu] = useState(null);
  const [minimapOn, setMinimapOn] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeCats, setActiveCats] = useState(new Set(Object.keys(CATEGORY_COLORS)));
  const [activeRels, setActiveRels] = useState(new Set(Object.keys(RELATIONSHIP_COLORS)));
  const [viewMode, setViewMode] = useState("graph");
  const [, setFocusedId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [, setStoryMode] = useState(null);
  const [stepsModal, setStepsModal] = useState(null);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [flashcards, setFlashcards] = useState(null);
  const [flashLoading, setFlashLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [summaryModal, setSummaryModal] = useState(null);
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedGraphs, setSavedGraphs] = useState([]);
  const [trending] = useState(SEED_TRENDING);
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestIndex, setSuggestIndex] = useState(-1);

  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const simRef = useRef(null);
  const svgRef = useRef(null);
  const dragInfo = useRef(null);
  const activeNodeDragRef = useRef(null);
  const searchInputRef = useRef(null);

  /* ΓöÇΓöÇ Resize listener ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  useEffect(() => {
    const onResize = () => {
      setDims({ w: window.innerWidth, h: window.innerHeight });
      setIsMobile(window.innerWidth < 720);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const addToast = useCallback((message, kind = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  /* ΓöÇΓöÇ D3 force simulation ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const initSimulation = useCallback((nodes, links) => {
    if (simRef.current) simRef.current.stop();
    const sim = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance((d) => 130 - Math.min((d.strength || 40) * 0.4, 40)))
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide().radius((d) => (d.isRoot ? 60 : 45)));
    sim.on("tick", () => forceTick((t) => t + 1));
    simRef.current = sim;
  }, [forceTick]);

  /* ΓöÇΓöÇ Graph search ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const runSearch = useCallback(async (topicQuery) => {
    const qText = topicQuery.trim();
    if (!qText) return;
    setError(null);
    setPhase("loading");
    setSelected(null);
    setStoryMode(null);

    try {
      const data = await generateGraph(qText);
      const rId = "node_root_" + Math.random().toString(36).slice(2, 7);

      const newNodes = [{
        id: rId, label: qText, category: "default", isRoot: true,
        x: 0, y: 0, fx: 0, fy: 0, pinned: true,
      }];
      const newLinks = [];
      const nodeIds = [];

      data.nodes.forEach((n, idx) => {
        const nid = "node_" + idx + "_" + Math.random().toString(36).slice(2, 7);
        nodeIds.push(nid);
        newNodes.push({
          id: nid, label: n.label, category: n.category || "Concept",
          strength: n.strength || 80, explanation: n.explanation || "",
          x: (Math.random() - 0.5) * 260, y: (Math.random() - 0.5) * 260,
        });
        newLinks.push({
          source: rId, target: nid,
          relationship: n.relationship || "related", strength: n.strength || 80,
        });
      });

      // Interconnect concepts with cross-links
      if (Array.isArray(data.links) && data.links.length > 0) {
        data.links.forEach((l) => {
          const srcId = typeof l.source === "number" ? nodeIds[l.source] : l.source;
          const tgtId = typeof l.target === "number" ? nodeIds[l.target] : l.target;
          if (srcId && tgtId && srcId !== tgtId) {
            newLinks.push({
              source: srcId, target: tgtId,
              relationship: l.relationship || "dependency", strength: l.strength || 75,
            });
          }
        });
      } else if (nodeIds.length >= 3) {
        for (let i = 0; i < nodeIds.length; i++) {
          const nextIdx = (i + 2) % nodeIds.length;
          newLinks.push({
            source: nodeIds[i],
            target: nodeIds[nextIdx],
            relationship: newNodes[i + 1]?.category === "Economic" ? "cause" : "dependency",
            strength: 65,
          });
        }
      }

      nodesRef.current = newNodes;
      linksRef.current = newLinks;
      setRootLabel(qText);
      setRootId(rId);
      setSummary(data.summary || "");
      setPhase("graph");
      setView({ x: 0, y: 0, k: 1 });
      initSimulation(newNodes, newLinks);
    } catch (err) {
      setError(err.message);
      setPhase("home");
    }
  }, [initSimulation]);

  useEffect(() => {
    if (initialTopic) {
      runSearch(initialTopic);
    }
  }, [initialTopic, runSearch]);

  /* ΓöÇΓöÇ Expand node ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const expandNode = useCallback(async (node) => {
    if (!node || expandingId) return;
    setExpandingId(node.id);
    addToast(`Expanding graph around ${node.label}ΓÇª`, "info");

    try {
      const existingLabels = nodesRef.current.map((n) => n.label);
      const data = await generateGraph(node.label, existingLabels);
      const newNodes = [...nodesRef.current];
      const newLinks = [...linksRef.current];
      const addedIds = [];

      data.nodes.forEach((n, idx) => {
        const nid = "node_sub_" + idx + "_" + Math.random().toString(36).slice(2, 7);
        addedIds.push(nid);
        newNodes.push({
          id: nid, label: n.label, category: n.category || "Concept",
          strength: n.strength || 75, explanation: n.explanation || "",
          x: (node.x || 0) + (Math.random() - 0.5) * 180,
          y: (node.y || 0) + (Math.random() - 0.5) * 180,
        });
        newLinks.push({ source: node.id, target: nid, relationship: n.relationship || "related", strength: n.strength || 75 });
      });

      if (addedIds.length >= 2) {
        for (let i = 0; i < addedIds.length - 1; i++) {
          newLinks.push({
            source: addedIds[i], target: addedIds[i + 1],
            relationship: "dependency", strength: 65,
          });
        }
      }

      nodesRef.current = newNodes;
      linksRef.current = newLinks;
      node.expanded = true;

      if (simRef.current) {
        simRef.current.nodes(newNodes);
        simRef.current.force("link").links(newLinks);
        simRef.current.alpha(0.6).restart();
      }
    } catch (err) {
      addToast("Couldn't expand node: " + err.message, "warn");
    } finally {
      setExpandingId(null);
    }
  }, [expandingId, addToast]);

  /* ΓöÇΓöÇ Node click ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const onNodeClick = useCallback((node) => {
    setSelected(node);
    setExplainText("");
    setExplainLoading(true);
    setFollowups(null);
    setCitations(null);

    generateElaboration(node.label, summary || rootLabel, explainMode).then((text) => {
      setExplainText(text);
      setExplainLoading(false);
    });
    setFollowupsLoading(true);
    generateFollowups(node.label, summary || rootLabel).then((f) => {
      setFollowups(f);
      setFollowupsLoading(false);
    });
  }, [rootLabel, summary, explainMode]);

  const switchExplainMode = (mode) => {
    setExplainMode(mode);
    if (!selected) return;
    setExplainLoading(true);
    generateElaboration(selected.label, summary || rootLabel, mode).then((text) => {
      setExplainText(text);
      setExplainLoading(false);
    });
  };

  const loadCitations = (node) => {
    setCitationsLoading(true);
    generateCitations(node.label, summary || rootLabel).then((res) => {
      setCitations(res);
      setCitationsLoading(false);
    });
  };

  const saveCurrentGraph = () => {
    setSavedGraphs((prev) => [...prev, {
      id: "saved_" + Math.random().toString(36).slice(2, 7),
      topic: rootLabel, createdAt: new Date().toISOString(),
      nodes: nodesRef.current, links: linksRef.current,
    }]);
    addToast(`Saved "${rootLabel}" graph!`, "info");
  };

  /* ΓöÇΓöÇ Canvas Pan / Zoom ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const cx = dims.w / 2 + view.x;
  const cy = dims.h / 2 + view.y;

  const onBgPointerDown = (e) => {
    if (e.target.closest && e.target.closest(".nw-node")) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragInfo.current = {
      startX: clientX,
      startY: clientY,
      initialViewX: view.x || 0,
      initialViewY: view.y || 0,
    };
    try {
      if (e.pointerId !== undefined && e.currentTarget.setPointerCapture) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    } catch {}
  };

  const onPointerMove = (e) => {
    const info = dragInfo.current;
    if (!info || typeof info.initialViewX !== "number") return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? info.startX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? info.startY;
    const dx = clientX - info.startX;
    const dy = clientY - info.startY;
    const targetX = info.initialViewX + dx;
    const targetY = info.initialViewY + dy;
    setView((v) => ({ ...v, x: targetX, y: targetY }));
  };

  const onPointerUp = (e) => {
    if (dragInfo.current) {
      try {
        if (e?.pointerId !== undefined && e?.currentTarget?.releasePointerCapture) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {}
      dragInfo.current = null;
    }
  };

  const onWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setView((v) => ({ ...v, k: Math.max(0.2, Math.min(3.5, v.k * factor)) }));
  };

  /* ΓöÇΓöÇ Node Dragging ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const onNodePointerDown = (e, node) => {
    e.stopPropagation();
    try {
      if (e.pointerId !== undefined && e.currentTarget.setPointerCapture) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    } catch {}
    activeNodeDragRef.current = { node, pointerId: e.pointerId };
    node.fx = node.x;
    node.fy = node.y;
    if (simRef.current) simRef.current.alphaTarget(0.3).restart();
  };

  const onNodePointerMove = (e, node) => {
    const dragState = activeNodeDragRef.current;
    if (!dragState || !dragState.node || dragState.node.id !== node.id) return;
    e.stopPropagation();
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const mouseX = clientX - svgRect.left;
    const mouseY = clientY - svgRect.top;
    const graphX = (mouseX - cx) / (view.k || 1);
    const graphY = (mouseY - cy) / (view.k || 1);

    node.fx = graphX;
    node.fy = graphY;
    node.x = graphX;
    node.y = graphY;

    if (simRef.current) simRef.current.alpha(0.4).restart();
    forceTick((t) => t + 1);
  };

  const onNodePointerUp = (e, node) => {
    const dragState = activeNodeDragRef.current;
    if (dragState && dragState.node && dragState.node.id === node.id) {
      e.stopPropagation();
      try {
        if (e?.pointerId !== undefined && e?.currentTarget?.releasePointerCapture) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {}
      activeNodeDragRef.current = null;
      if (simRef.current) simRef.current.alphaTarget(0);
      if (!node.pinned && !node.isRoot) {
        node.fx = null;
        node.fy = null;
      }
    }
  };

  const onNodeContextMenu = (e, node) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, node }); };

  const openSteps = async (topic = rootLabel, targetNodes = nodesRef.current) => {
    setStepsLoading(true);
    try {
      const steps = await generateSteps(topic || "Domain Concept", targetNodes);
      setStepsModal({ topic: topic || "Concept Breakdown", steps });
    } catch {
      addToast("Failed to generate step-by-step breakdown", "warn");
    } finally {
      setStepsLoading(false);
    }
  };

  const handleNodeAction = (action, node) => {
    if (action === "explain") { onNodeClick(node); }
    else if (action === "steps") { openSteps(node.label, [node]); }
    else if (action === "expand") { expandNode(node); }
    else if (action === "pin" || action === "unpin") {
      node.pinned = !node.pinned;
      if (!node.pinned && !node.isRoot) { node.fx = null; node.fy = null; }
      forceTick((t) => t + 1);
    } else if (action === "root") { runSearch(node.label); }
    else if (action === "copy") {
      navigator.clipboard?.writeText(node.label);
      addToast(`Copied "${node.label}" to clipboard`, "info");
    } else if (action === "remove") {
      nodesRef.current = nodesRef.current.filter((n) => n.id !== node.id);
      linksRef.current = linksRef.current.filter(
        (l) => linkEndId(l.source) !== node.id && linkEndId(l.target) !== node.id
      );
      if (simRef.current) {
        simRef.current.nodes(nodesRef.current);
        simRef.current.force("link").links(linksRef.current);
        simRef.current.alpha(0.5).restart();
      }
    }
  };

  /* ΓöÇΓöÇ Study tools ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const openQuiz = async () => {
    setQuizLoading(true);
    try { setQuiz(await generateQuiz(rootLabel, nodesRef.current)); }
    catch { addToast("Failed to build quiz", "warn"); }
    finally { setQuizLoading(false); }
  };

  const openFlashcards = async () => {
    setFlashLoading(true);
    try { setFlashcards(await generateFlashcards(rootLabel, nodesRef.current)); }
    catch { addToast("Failed to build flashcards", "warn"); }
    finally { setFlashLoading(false); }
  };

  const openReport = async () => {
    setReportLoading(true);
    try { setReport(await generateReport(rootLabel, summary, nodesRef.current)); }
    catch { addToast("Failed to generate research brief", "warn"); }
    finally { setReportLoading(false); }
  };

  const openSummary = async () => {
    setSummaryModal({ loading: true, text: "" });
    try { setSummaryModal({ loading: false, text: await generateSummary(rootLabel, nodesRef.current) }); }
    catch { setSummaryModal(null); }
  };

  const exportPng = () => { if (svgRef.current) svgToPngDownload(svgRef.current, `${rootLabel.slice(0, 30)}-neuroweb.png`); };
  const exportMd = () => {
    const md = graphToMarkdown(rootLabel, summary, nodesRef.current, linksRef.current);
    downloadBlob(`${rootLabel.slice(0, 30)}-neuroweb.md`, md, "text/markdown");
  };

  /* ΓöÇΓöÇ Derived ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return [
      { text: query.trim(), kind: "Search" },
      { text: `What is ${query.trim()}?`, kind: "Question" },
      { text: `Future of ${query.trim()}`, kind: "Trend" },
    ];
  }, [query]);

  const visibleCategories = useMemo(
    () => Array.from(new Set(nodesRef.current.map((n) => n.category || "Concept"))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodesRef.current.length]
  );
  const visibleRelationships = useMemo(
    () => Array.from(new Set(linksRef.current.map((l) => l.relationship || "related"))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [linksRef.current.length]
  );

  /* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ RENDER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  return (
    <div className="nw-root">
      <a className="nw-skip-link" href="#nw-search-input">Skip to search</a>

      {/* Animated canvas background */}
      <BackgroundBoundary>
        <NeuralBackground reducedMotion={reducedMotion} isGraphView={phase === "graph"} />
      </BackgroundBoundary>
      <div className="nw-vignette" />

      <Toasts toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />

      {/* Modals */}
      {apiKeyModalOpen && (
        <ApiKeyModal
          onClose={() => setApiKeyModalOpen(false)}
          onSave={(key) => {
            setStoredApiKey(key);
            setHasApiKey(!!key);
            setApiKeyModalOpen(false);
            addToast(key ? "API key saved. Live Claude engine active." : "API key cleared. Offline engine active.", "info");
          }}
        />
      )}
      {shortcutsOpen && <ShortcutsOverlay onClose={() => setShortcutsOpen(false)} />}
      {cmdkOpen && <CommandPalette commands={[]} onClose={() => setCmdkOpen(false)} onRun={() => {}} />}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y} node={ctxMenu.node}
          onAction={handleNodeAction} onClose={() => setCtxMenu(null)}
        />
      )}
      {stepsModal && (
        <StepByStepModal
          topic={stepsModal.topic}
          steps={stepsModal.steps}
          onClose={() => setStepsModal(null)}
        />
      )}
      {savedOpen && (
        <div className="nw-modal-backdrop" onClick={() => setSavedOpen(false)}>
          <div className="nw-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="nw-modal-head">
              <h3>Saved Graphs</h3>
              <button className="nw-icon-btn" onClick={() => setSavedOpen(false)} aria-label="Close">Γ£ò</button>
            </div>
            {savedGraphs.length === 0 ? (
              <p className="nw-muted">No saved graphs yet.</p>
            ) : (
              <div className="nw-saved-list">
                {savedGraphs.map((g) => (
                  <div key={g.id} className="nw-saved-item">
                    <div>
                      <div className="nw-saved-title">{g.topic}</div>
                      <div className="nw-muted nw-saved-meta">{g.nodes.length} concepts ┬╖ {new Date(g.createdAt).toLocaleDateString()}</div>
                    </div>
                    <button
                      className="nw-ghost-btn"
                      onClick={() => {
                        nodesRef.current = g.nodes;
                        linksRef.current = g.links;
                        setRootLabel(g.topic);
                        setPhase("graph");
                        setSavedOpen(false);
                        initSimulation(g.nodes, g.links);
                      }}
                    >Open</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {quiz && <QuizModal questions={quiz} onClose={() => setQuiz(null)} />}
      {flashcards && <FlashcardModal cards={flashcards} onClose={() => setFlashcards(null)} />}
      {report && <ReportModal topic={rootLabel} markdown={report} onClose={() => setReport(null)} />}
      {summaryModal && (
        <div className="nw-modal-backdrop" onClick={() => setSummaryModal(null)}>
          <div className="nw-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="nw-modal-head">
              <h3>Graph summary ┬╖ {rootLabel}</h3>
              <button className="nw-icon-btn" onClick={() => setSummaryModal(null)} aria-label="Close">Γ£ò</button>
            </div>
            {summaryModal.loading
              ? <div className="nw-panel-loading"><span /><span /><span /></div>
              : <p style={{ fontSize: 14.5, lineHeight: 1.75, color: "#d4d8f0" }}>{summaryModal.text}</p>
            }
          </div>
        </div>
      )}
      {tooltipNode && !ctxMenu && <NodeTooltip node={tooltipNode} x={tooltipPos.x} y={tooltipPos.y} />}

      {/* Top Navigation Bar */}
      <div className="nw-topbar">
        <div className="nw-logo" onClick={() => setPhase("home")} style={{ cursor: "pointer" }}>
          <span className="nw-logo-dot" />
          NeuroWeb
        </div>
        <div className="nw-topbar-right">


          {phase === "graph" && !isMobile && (
            <>
              <button className="nw-icon-btn" title="Filters" onClick={() => setFiltersOpen((o) => !o)}>Γûñ</button>
              <button className="nw-icon-btn" title="Minimap" onClick={() => setMinimapOn((o) => !o)}>Γûª</button>
              <button className="nw-icon-btn" title="Timeline view" onClick={() => setViewMode((v) => v === "graph" ? "timeline" : "graph")}>ΓÅ▒</button>
            </>
          )}

          {phase !== "home" && (
            <div className="nw-searchbar-compact">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(query); }}
                placeholder="Explore topicΓÇª"
                aria-label="Search another topic"
              />
              <button type="button" onClick={() => runSearch(query)}>Search</button>
            </div>
          )}
        </div>
      </div>

      {phase === "graph" && filtersOpen && (
        <FilterBar
          categories={visibleCategories}
          relationships={visibleRelationships}
          activeCats={activeCats}
          activeRels={activeRels}
          onToggleCat={(c) => setActiveCats((prev) => { const next = new Set(prev); next.has(c) ? next.delete(c) : next.add(c); return next; })}
          onToggleRel={(r) => setActiveRels((prev) => { const next = new Set(prev); next.has(r) ? next.delete(r) : next.add(r); return next; })}
          onReset={() => { setActiveCats(new Set(Object.keys(CATEGORY_COLORS))); setActiveRels(new Set(Object.keys(RELATIONSHIP_COLORS))); }}
        />
      )}

      {/* ΓöÇΓöÇ Home ΓöÇΓöÇΓöÇ */}
      {phase === "home" && (
        <div className="nw-home">
          <div className="nw-home-inner">
            <h1 className="nw-headline">
              See how <span className="nw-grad">everything</span> connects.
            </h1>
            <p className="nw-sub">
              Ask any question or concept and watch a living explorable graph of causes,
              effects, and ideas grow in front of you.
            </p>
            <div className="nw-search-wrap">
              <div className="nw-searchbar">
                <input
                  id="nw-search-input"
                  ref={searchInputRef}
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") { e.preventDefault(); setSuggestIndex((i) => Math.min(i + 1, suggestions.length - 1)); }
                    else if (e.key === "ArrowUp") { e.preventDefault(); setSuggestIndex((i) => Math.max(i - 1, -1)); }
                    else if (e.key === "Enter") {
                      const pick = suggestIndex >= 0 ? suggestions[suggestIndex]?.text : query;
                      runSearch(pick);
                    }
                  }}
                  placeholder="What do you want to understand?"
                  role="combobox"
                  aria-expanded={searchFocused && suggestions.length > 0}
                />
                <WaterButton
                  label="Generate Graph ΓåÆ"
                  onClick={() => runSearch(query)}
                  font={{
                    variant: "Bold",
                    fontSize: "18px",
                    textAlign: "left",
                    fontFamily: "Inter",
                    fontWeight: 700,
                    lineHeight: "1.2em",
                    letterSpacing: "-0.01em",
                  }}
                  glass={{ blur: 40, tint: "rgba(0, 0, 0, 0.12)", frost: 15 }}
                  textColor="#ffffff"
                  paddingX={28}
                  paddingY={14}
                  waterAmount={69}
                  waterColor="#00EEFF"
                />
              </div>
              {searchFocused && suggestions.length > 0 && (
                <SearchSuggestions items={suggestions} activeIndex={suggestIndex} onPick={runSearch} />
              )}
            </div>
            {error && <div className="nw-error">{error}</div>}
            <div className="nw-trending">
              <span className="nw-trending-label">Trending explorations</span>
              <div className="nw-chips">
                {trending.map((t) => (
                  <button key={t} className="nw-chip" onClick={() => runSearch(t)}>{t}</button>
                ))}
              </div>
            </div>
            {savedGraphs.length > 0 && (
              <div className="nw-home-links">
                <button className="nw-ghost-btn" onClick={() => setSavedOpen(true)}>
                  Γÿå {savedGraphs.length} saved graph{savedGraphs.length === 1 ? "" : "s"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ΓöÇΓöÇ Loading ΓöÇΓöÇΓöÇ */}
      {phase === "loading" && (
        <div className="nw-loading" role="status" aria-live="polite">
          <div className="nw-pulse-node" />
          <div className="nw-loading-text">mapping <span>{query}</span>ΓÇª</div>
        </div>
      )}

      {/* ΓöÇΓöÇ Graph Canvas ΓöÇΓöÇΓöÇ */}
      {phase === "graph" && viewMode === "graph" && (
        <>
          {error && <div className="nw-error nw-error-toast">{error}</div>}
          <svg
            ref={svgRef}
            className="nw-svg"
            style={{ touchAction: "none" }}
            onPointerDown={onBgPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            role="application"
            aria-label={`Knowledge graph for ${rootLabel}`}
          >
            <defs>
              <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <g transform={`translate(${cx} ${cy}) scale(${view.k})`}>
              {linksRef.current.map((l, i) => {
                const s = typeof l.source === "object" ? l.source : nodesRef.current.find((n) => n.id === l.source);
                const t = typeof l.target === "object" ? l.target : nodesRef.current.find((n) => n.id === l.target);
                if (!s || !t) return null;
                const dimmed =
                  (l.relationship && !activeRels.has(l.relationship)) ||
                  (s.category && !activeCats.has(s.category)) ||
                  (t.category && !activeCats.has(t.category));
                const color = RELATIONSHIP_COLORS[l.relationship] || RELATIONSHIP_COLORS.default;
                const width = 0.6 + ((l.strength || 40) / 100) * 3.4;
                return (
                  <line
                    key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                    stroke={color} strokeWidth={width}
                    strokeOpacity={dimmed ? 0.08 : 0.55}
                    className="nw-edge"
                  />
                );
              })}
              {nodesRef.current.map((n) => {
                const color = CATEGORY_COLORS[n.category] || CATEGORY_COLORS.default;
                const r = n.isRoot ? 40 : 26;
                const isSel = selected && selected.id === n.id;
                const isBusy = expandingId === n.id;
                const dimmed = n.category && !activeCats.has(n.category) && !n.isRoot;
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x} ${n.y})`}
                    className="nw-node"
                    style={{ opacity: dimmed ? 0.16 : 1, cursor: "grab" }}
                    tabIndex={0}
                    role="button"
                    aria-label={n.label}
                    onFocus={() => setFocusedId(n.id)}
                    onPointerDown={(e) => onNodePointerDown(e, n)}
                    onPointerMove={(e) => onNodePointerMove(e, n)}
                    onPointerUp={(e) => onNodePointerUp(e, n)}
                    onPointerCancel={(e) => onNodePointerUp(e, n)}
                    onContextMenu={(e) => onNodeContextMenu(e, n)}
                    onClick={(e) => { e.stopPropagation(); onNodeClick(n); }}
                    onMouseEnter={(e) => { setTooltipNode(n); setTooltipPos({ x: e.clientX + 14, y: e.clientY - 10 }); }}
                    onMouseLeave={() => setTooltipNode(null)}
                  >
                    {isBusy && <circle r={r + 10} className="nw-node-ring-spin" stroke={color} fill="none" />}
                    <circle
                      r={r}
                      fill={n.isRoot ? color : "rgba(12,14,26,0.85)"}
                      stroke={color}
                      strokeWidth={isSel ? 3 : 1.6}
                      filter="url(#glow)"
                      className="nw-node-circle"
                    />
                    <text textAnchor="middle" dy={r + 16} className="nw-node-label" fill={color}>
                      {n.label.length > 20 ? n.label.slice(0, 18) + "ΓÇª" : n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {minimapOn && !isMobile && (
            <Minimap
              nodes={nodesRef.current} dims={dims} view={view}
              onJump={(wx, wy) => setView((v) => ({ ...v, x: -wx * v.k, y: -wy * v.k }))}
            />
          )}

          {!isMobile && (
            <div className="nw-hint">
              Scroll to zoom ┬╖ Drag canvas to pan ┬╖ Drag nodes to move ┬╖ Click a node to expand ┬╖ Right-click for context menu
            </div>
          )}
        </>
      )}

      {/* ΓöÇΓöÇ Timeline View ΓöÇΓöÇΓöÇ */}
      {phase === "graph" && viewMode === "timeline" && (
        <div className="nw-timeline" role="region" aria-label="Timeline view">
          <div className="nw-timeline-track">
            {nodesRef.current.map((n, i) => {
              const color = CATEGORY_COLORS[n.category] || CATEGORY_COLORS.default;
              return (
                <button
                  key={n.id}
                  className={"nw-timeline-card" + (n.isRoot ? " root" : "")}
                  style={{ "--tl-color": color }}
                  onClick={() => onNodeClick(n)}
                >
                  <div className="nw-timeline-index">{i === 0 ? "start" : i}</div>
                  <div className="nw-timeline-label">{n.label}</div>
                  <div className="nw-timeline-cat">{n.category}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ΓöÇΓöÇ Study Dock ΓöÇΓöÇΓöÇ */}
      {phase === "graph" && (
        <div className="nw-study-dock">
          <button className="nw-dock-btn" onClick={openSummary}>Γ£ª Summarize</button>
          <button className="nw-dock-btn" onClick={() => openSteps()} disabled={stepsLoading}>
            {stepsLoading ? "Generating stepsΓÇª" : "≡ƒ¬£ Step-by-step"}
          </button>
          <button className="nw-dock-btn" onClick={openQuiz} disabled={quizLoading}>
            {quizLoading ? "Building quizΓÇª" : "≡ƒºá Quiz me"}
          </button>
          <button className="nw-dock-btn" onClick={openFlashcards} disabled={flashLoading}>
            {flashLoading ? "Building cardsΓÇª" : "≡ƒùé Flashcards"}
          </button>
          <button className="nw-dock-btn" onClick={openReport} disabled={reportLoading}>
            {reportLoading ? "Writing briefΓÇª" : "≡ƒôä Research brief"}
          </button>
          <button className="nw-dock-btn" onClick={exportPng}>Γç⌐ PNG</button>
          <button className="nw-dock-btn" onClick={exportMd}>Γç⌐ Markdown</button>
        </div>
      )}

      {/* ΓöÇΓöÇ Explain Panel ΓöÇΓöÇΓöÇ */}
      {selected && (
        <ExplainPanel
          node={selected}
          summaryFallback={summary}
          explainMode={explainMode}
          explainText={explainText}
          explainLoading={explainLoading}
          onSwitchMode={switchExplainMode}
          followups={followups}
          followupsLoading={followupsLoading}
          onFollowup={(q) => { setSelected(null); runSearch(q); }}
          citations={citations}
          citationsLoading={citationsLoading}
          onLoadCitations={loadCitations}
          onClose={() => setSelected(null)}
          onSave={saveCurrentGraph}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
