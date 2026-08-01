// ΓöÇΓöÇΓöÇ Category node colors ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const CATEGORY_COLORS = {
  Company:      "#4fd1ff",
  Person:       "#ff7ad9",
  Technology:   "#9b6bff",
  Economic:     "#3ddc97",
  Scientific:   "#ffd166",
  Event:        "#ff8a5c",
  Concept:      "#7dd3fc",
  Location:     "#5eead4",
  Organization: "#c4b5fd",
  default:      "#8b93b8",
};

// ΓöÇΓöÇΓöÇ Relationship edge colors ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const RELATIONSHIP_COLORS = {
  cause:      "#ff5c5c",
  effect:     "#ff8a5c",
  dependency: "#ffd166",
  competition:"#ff7ad9",
  ownership:  "#9b6bff",
  investment: "#3ddc97",
  technology: "#4fd1ff",
  research:   "#7aa2ff",
  historical: "#8b93b8",
  social:     "#5eead4",
  default:    "#5b6280",
};

// ΓöÇΓöÇΓöÇ Seed trending topics shown on the home screen ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const SEED_TRENDING = [
  "Why are EV stocks falling?",
  "How does the immune system work?",
  "What is causing global inflation?",
  "How did the internet start?",
  "Why is CRISPR controversial?",
  "What powers a large language model?",
];

// ΓöÇΓöÇΓöÇ Explain-panel modes and tabs ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const EXPLAIN_MODES = ["Simplified", "Step-by-Step", "Expert", "Real World Impact", "ELI5"];
export const PANEL_TABS    = ["Explain", "Follow-ups", "Sources"];

// ΓöÇΓöÇΓöÇ Keyboard shortcuts shown in the shortcuts overlay ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const SHORTCUTS = [
  { keys: "Γîÿ/Ctrl K", desc: "Open command palette" },
  { keys: "/",         desc: "Focus search" },
  { keys: "Γîÿ/Ctrl Z", desc: "Undo last graph change" },
  { keys: "Γîÿ/Ctrl Γçº Z", desc: "Redo" },
  { keys: "F",         desc: "Toggle relationship & category filters" },
  { keys: "M",         desc: "Toggle minimap" },
  { keys: "T",         desc: "Toggle timeline view" },
  { keys: "G",         desc: "Toggle story mode" },
  { keys: "Tab",       desc: "Move focus between nodes" },
  { keys: "Enter",     desc: "Open the focused node" },
  { keys: "Esc",       desc: "Close panel / palette / overlay" },
  { keys: "?",         desc: "Show shortcuts list" },
];
