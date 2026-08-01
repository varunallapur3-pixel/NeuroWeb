// ΓöÇΓöÇΓöÇ localStorage helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export function getStoredApiKey() {
  try { return window.localStorage.getItem("neuroweb_api_key") || ""; }
  catch { return ""; }
}

export function setStoredApiKey(key) {
  try {
    key ? window.localStorage.setItem("neuroweb_api_key", key.trim())
        : window.localStorage.removeItem("neuroweb_api_key");
  } catch (e) { console.warn("localStorage unavailable", e); }
}

// ΓöÇΓöÇΓöÇ JSON extraction helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function extractJson(text) {
  let cleaned = text.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
  const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
  if (s !== -1 && e > s) cleaned = cleaned.slice(s, e + 1);
  return JSON.parse(cleaned);
}

function extractJsonArray(text) {
  let cleaned = text.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
  const s = cleaned.indexOf("["), e = cleaned.lastIndexOf("]");
  if (s !== -1 && e > s) cleaned = cleaned.slice(s, e + 1);
  return JSON.parse(cleaned);
}

// ΓöÇΓöÇΓöÇ Intelligent offline fallback graph generator ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Returns a domain-aware interconnected graph so every feature works even without an API key.

export function getDomainFallbackGraph(topic) {
  const t = topic.toLowerCase();

  if (t.includes("ev") || t.includes("electric vehicle") || t.includes("tesla")) {
    return {
      summary: "EV markets are navigating high interest rates, battery supply-chain hurdles, and shifting government subsidy landscapes.",
      nodes: [
        { label: "Battery Metal Prices",    category: "Economic",     relationship: "cause",      strength: 88, explanation: "Lithium, nickel and cobalt cost swings directly dictate EV margins." },
        { label: "High Interest Rates",     category: "Economic",     relationship: "effect",     strength: 92, explanation: "Elevated borrowing costs reduce consumer purchasing power for EVs." },
        { label: "Solid-State Batteries",   category: "Technology",   relationship: "technology", strength: 85, explanation: "Next-gen chemistry promises higher density and safety." },
        { label: "Charging Infrastructure", category: "Concept",      relationship: "dependency", strength: 90, explanation: "Fast-charger availability is essential for mainstream EV adoption." },
        { label: "Legacy Automakers",       category: "Company",      relationship: "competition",strength: 82, explanation: "Traditional makers now compete aggressively with EV-native startups." },
        { label: "Government Subsidies",    category: "Economic",     relationship: "investment", strength: 86, explanation: "Tax incentives heavily influence consumer purchase decisions." },
      ],
      links: [
        { source: 0, target: 2, relationship: "technology", strength: 85 },
        { source: 1, target: 4, relationship: "competition", strength: 80 },
        { source: 3, target: 4, relationship: "dependency", strength: 88 },
        { source: 5, target: 1, relationship: "cause", strength: 84 },
      ],
    };
  }

  if (t.includes("llm") || t.includes("large language") || t.includes("gpt") || t.includes("neural network") || t.includes("ai ")) {
    return {
      summary: "Large Language Models rely on transformer architectures, massive GPU clusters, high-quality datasets, and RLHF alignment.",
      nodes: [
        { label: "Transformer Architecture", category: "Technology",   relationship: "dependency", strength: 95, explanation: "Self-attention enables efficient context processing across long sequences." },
        { label: "GPU Compute Clusters",     category: "Technology",   relationship: "investment", strength: 94, explanation: "Massive parallel GPU infra powers intensive pre-training." },
        { label: "RLHF Alignment",           category: "Scientific",   relationship: "research",   strength: 89, explanation: "Reinforcement Learning from Human Feedback makes models safer." },
        { label: "Data Quality & Curation",  category: "Concept",      relationship: "cause",      strength: 88, explanation: "Dataset breadth and quality determine factual reasoning capability." },
        { label: "AI Safety & Governance",   category: "Organization", relationship: "social",     strength: 85, explanation: "Institutions establish guidelines to mitigate bias and hallucination." },
        { label: "Context Window Expansion", category: "Scientific",   relationship: "effect",     strength: 87, explanation: "Longer contexts let models process whole repos and documents." },
      ],
      links: [
        { source: 0, target: 1, relationship: "dependency", strength: 92 },
        { source: 3, target: 2, relationship: "cause", strength: 88 },
        { source: 4, target: 2, relationship: "social", strength: 85 },
        { source: 5, target: 0, relationship: "research", strength: 90 },
      ],
    };
  }

  if (t.includes("crispr") || t.includes("gene edit") || t.includes("dna") || t.includes("genome")) {
    return {
      summary: "CRISPR-Cas9 is a precision gene-editing tool derived from bacterial immune systems, revolutionising medicine and agriculture.",
      nodes: [
        { label: "Cas9 Enzyme",               category: "Scientific", relationship: "dependency", strength: 96, explanation: "Acts as molecular scissors guided by RNA to cut target DNA." },
        { label: "Guide RNA (gRNA)",           category: "Scientific", relationship: "technology", strength: 93, explanation: "Matches target sequences, directing the enzyme to specific locations." },
        { label: "Genetic Disease Cures",      category: "Technology", relationship: "effect",     strength: 91, explanation: "Enables curative treatments for inherited conditions like sickle-cell." },
        { label: "Bioethics & Human Editing",  category: "Concept",    relationship: "social",     strength: 90, explanation: "Raises profound ethical debates on germline modification." },
        { label: "Bacterial Immunity Origins", category: "Scientific", relationship: "historical", strength: 84, explanation: "CRISPR evolved in bacteria to destroy invading viral DNA." },
      ],
      links: [
        { source: 0, target: 1, relationship: "technology", strength: 95 },
        { source: 0, target: 2, relationship: "effect", strength: 92 },
        { source: 2, target: 3, relationship: "social", strength: 88 },
        { source: 4, target: 0, relationship: "historical", strength: 85 },
      ],
    };
  }

  // Generic fallback with interconnected concept links
  const title = topic.charAt(0).toUpperCase() + topic.slice(1);
  return {
    summary: `${title} is an interconnected domain shaped by technology, market dynamics, and human innovation.`,
    nodes: [
      { label: `${title} Fundamentals`, category: "Concept",      relationship: "cause",      strength: 90, explanation: `Core principles underpinning ${topic}.` },
      { label: "Technological Drivers",  category: "Technology",   relationship: "dependency", strength: 86, explanation: `Innovations accelerating adoption of ${topic}.` },
      { label: "Economic Dynamics",      category: "Economic",     relationship: "investment", strength: 84, explanation: `Financial incentives and valuation mechanisms involved.` },
      { label: "Key Institutions",       category: "Organization", relationship: "ownership",  strength: 80, explanation: `Leading organisations and regulatory bodies shaping policy.` },
      { label: "Societal Impact",        category: "Event",        relationship: "effect",     strength: 88, explanation: `Broader consequences on communities and culture.` },
      { label: "Future Horizons",        category: "Scientific",   relationship: "research",   strength: 82, explanation: `Next-generation research trends and long-term trajectory.` },
    ],
    links: [
      { source: 0, target: 1, relationship: "dependency", strength: 88 },
      { source: 1, target: 2, relationship: "investment", strength: 84 },
      { source: 2, target: 3, relationship: "ownership", strength: 80 },
      { source: 3, target: 4, relationship: "effect", strength: 85 },
      { source: 4, target: 5, relationship: "research", strength: 82 },
    ],
  };
}

// ΓöÇΓöÇΓöÇ Error parser ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function describeApiError(status, data) {
  if (data?.error?.message) return `AI engine error (${status}): ${data.error.message}`;
  if (status === 401) return "Invalid API Key ΓÇö please check your key in Settings.";
  if (status === 429) return "Rate limit reached. Switched to offline engine.";
  return `AI engine unavailable (${status}). Switched to offline engine.`;
}

// ΓöÇΓöÇΓöÇ Core Claude fetch ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

async function callClaude(system, user, { maxTokens = 1200, tools } = {}) {
  const apiKey = getStoredApiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  let response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
        ...(tools ? { tools } : {}),
      }),
    });
  } catch (networkErr) {
    throw new Error("NETWORK_ERROR: " + networkErr.message);
  }

  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); }
  catch { throw new Error(`Non-JSON response (${response.status})`); }

  if (!response.ok) throw new Error(describeApiError(response.status, data));

  const blocks = data.content || [];
  const text   = blocks.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const citations = [];
  blocks.forEach((b) => {
    if (b.type === "text" && Array.isArray(b.citations))
      b.citations.forEach((c) => { if (c.url) citations.push({ url: c.url, title: c.title || c.url }); });
  });

  if (!text) throw new Error("AI engine returned an empty response.");
  return { text, citations };
}

// ΓöÇΓöÇΓöÇ Public API functions (each falls back gracefully) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export async function generateGraph(topic, existingLabels = []) {
  try {
    const system = `You are NeuroWeb's reasoning engine. Given a topic, produce 6-8 directly related concepts as a JSON knowledge graph with cross-links between connected concepts.
Respond ONLY with valid JSON ΓÇö no markdown, no commentary:
{
  "summary": "1-2 sentence overview",
  "nodes": [{"label":"1-4 words","category":"Company|Person|Technology|Economic|Scientific|Event|Concept|Location|Organization","relationship":"cause|effect|dependency|competition|ownership|investment|technology|research|historical|social","strength":1-100,"explanation":"one sentence"}],
  "links": [{"source": 0, "target": 1, "relationship": "cause|effect|dependency|competition|ownership|investment|technology|research|historical|social", "strength": 70-95}]
}
Do not repeat: ${existingLabels.join(", ") || "(none)"}`;
    const { text } = await callClaude(system, `Topic: ${topic}`);
    const parsed  = extractJson(text);
    if (!parsed.nodes?.length) return getDomainFallbackGraph(topic);
    return parsed;
  } catch {
    return getDomainFallbackGraph(topic);
  }
}

export async function generateElaboration(label, context, mode) {
  try {
    const system = `Write a 3-5 sentence plain-text elaboration about the concept in ${mode} mode. No markdown, no headers.`;
    const { text } = await callClaude(system, `Concept: "${label}"\nContext: "${context}"\nMode: ${mode}`, { maxTokens: 400 });
    return text.trim();
  } catch {
    const fallbacks = {
      "ELI5":             `Think of ${label} like a key piece in a puzzle. When it fits with ${context || "related things"}, everything clicks into place!`,
      "Step-by-Step":     `1. Begin with ${label} as the core driver. 2. Observe how it triggers dependent processes across ${context || "the domain"}. 3. Notice its feedback loops on surrounding components. 4. Achieve overall systemic stability.`,
      "Expert":           `${label} acts as a pivotal structural component within ${context || "the system"}, exhibiting direct feedback loops that affect systemic efficiency and throughput.`,
      "Real World Impact":`${label} directly shapes daily operations. It influences strategic decision-making and resource allocation for organisations and end-users alike.`,
    };
    return fallbacks[mode] ?? `${label} is a core driver within ${context || "this domain"}, connecting structural dependencies that influence downstream outcomes.`;
  }
}

export async function generateSteps(topic, nodes) {
  try {
    const system = `Break down "${topic}" into a logical 4-6 step sequential explanation. Reply ONLY with valid JSON:
{"steps":[{"step":1,"title":"1-4 word step title","description":"1-2 sentence step breakdown explanation"}]}`;
    const { text } = await callClaude(system, `Topic: "${topic}"\nConcepts: ${nodes.map((n) => n.label).join(", ")}`, { maxTokens: 1400 });
    const parsed = extractJson(text);
    if (!parsed.steps?.length) throw new Error("empty");
    return parsed.steps;
  } catch {
    const t = topic.toLowerCase();
    if (t.includes("ev") || t.includes("electric vehicle") || t.includes("tesla")) {
      return [
        { step: 1, title: "Supply Chain & Battery Metals", description: "Lithium, nickel, and cobalt cost swings dictate battery production economics and EV profit margins." },
        { step: 2, title: "Manufacturing & Scale", description: "Automakers retool production lines to build high-voltage battery packs and dedicated EV platforms." },
        { step: 3, title: "Economic & Rate Pressures", description: "Elevated interest rates increase vehicle financing costs, directly impacting consumer purchase decisions." },
        { step: 4, title: "Charging Network Expansion", description: "Widespread fast-charging infrastructure is deployed to remove range anxiety and enable long-distance travel." },
        { step: 5, title: "Market Adoption & Subsidies", description: "Government incentives and competitive pressures drive mainstream transition from ICE to electric vehicles." },
      ];
    }
    if (t.includes("llm") || t.includes("large language") || t.includes("ai")) {
      return [
        { step: 1, title: "Dataset Curation", description: "Massive text corpora are cleaned, deduplicated, and tokenized to create training data." },
        { step: 2, title: "Transformer Pre-training", description: "GPU clusters process trillions of tokens in parallel, learning language patterns and context." },
        { step: 3, title: "RLHF & Safety Alignment", description: "Human feedback and instruction tuning align predictions for safety, factual accuracy, and tone." },
        { step: 4, title: "Context Window Scaling", description: "Advanced attention mechanisms extend context windows to process long documents and entire codebases." },
        { step: 5, title: "Inference Deployment", description: "Quantized weights are served via high-throughput APIs for user queries and application integration." },
      ];
    }
    return (nodes && nodes.length > 0 ? nodes : [{ label: topic }]).slice(0, 5).map((n, idx) => ({
      step: idx + 1,
      title: `Step ${idx + 1}: ${n.label || "Core Concept"}`,
      description: n.explanation || `Understand how ${n.label || topic} operates and drives key systemic outcomes.`,
    }));
  }
}

export async function generateFollowups(label, context) {
  try {
    const system = `Propose 3 genuinely interesting follow-up questions for "${label}". Reply ONLY with a JSON array of 3 strings.`;
    const { text } = await callClaude(system, `Concept: "${label}"\nContext: "${context}"`, { maxTokens: 300 });
    const arr = extractJsonArray(text);
    return arr.filter((s) => typeof s === "string").slice(0, 3);
  } catch {
    return [
      `What are the major breakthroughs in ${label}?`,
      `How does ${label} compare with alternatives?`,
      `What is the long-term impact of ${label}?`,
    ];
  }
}

export async function generateCitations(label, context) {
  try {
    const system = `Summarise 2-4 independent sources about "${label}" in plain text sentences.`;
    const { text, citations } = await callClaude(system, `Concept: "${label}"\nContext: "${context}"`, { maxTokens: 500 });
    return { text: text.trim(), citations };
  } catch {
    return {
      text: `Independent research highlights ${label} as a primary operational catalyst driving systemic transformation and technical scalability.`,
      citations: [{ title: `Wikipedia: ${label}`, url: "https://wikipedia.org" }],
    };
  }
}

export async function generateSummary(topic, nodes) {
  try {
    const system = `Write a tight 3-4 sentence plain-text synthesis overview tying the listed concepts to the topic.`;
    const { text } = await callClaude(system, `Topic: "${topic}"\nConcepts: ${nodes.map((n) => n.label).join(", ")}`, { maxTokens: 400 });
    return text.trim();
  } catch {
    return `${topic} is a multi-faceted domain. Key elements ΓÇö ${nodes.slice(0, 3).map((n) => n.label).join(", ")} ΓÇö work together in an interconnected network of cause, effect, and mutual reinforcement.`;
  }
}

export async function generateQuiz(topic, nodes) {
  try {
    const system = `Write 5 multiple-choice quiz questions. Reply ONLY with valid JSON:\n{"questions":[{"question":"...","options":["a","b","c","d"],"correctIndex":0,"explanation":"..."}]}`;
    const { text } = await callClaude(system, `Topic: "${topic}"\nConcepts: ${nodes.map((n) => n.label).join(", ")}`, { maxTokens: 1400 });
    const parsed = extractJson(text);
    if (!parsed.questions?.length) throw new Error("empty");
    return parsed.questions;
  } catch {
    return [
      { question: `Which concept is central to understanding ${topic}?`, options: [nodes[0]?.label || "Primary Driver","Unrelated Factor","Static Variable","External Noise"], correctIndex: 0, explanation: `${nodes[0]?.label || "Primary Driver"} forms a foundational pillar in this knowledge network.` },
      { question: `How do structural nodes in ${topic} primarily interact?`, options: ["Through cause-and-effect relationships","They remain fully isolated","By random alignment","Only through manual intervention"], correctIndex: 0, explanation: "Knowledge graphs depict causal, dependency, and investment connections." },
    ];
  }
}

export async function generateFlashcards(topic, nodes) {
  try {
    const system = `Write concise flashcards as JSON:\n{"cards":[{"front":"...","back":"..."}]}`;
    const { text } = await callClaude(system, `Topic: "${topic}"\nConcepts: ${nodes.map((n) => n.label).join(", ")}`, { maxTokens: 1400 });
    const parsed = extractJson(text);
    if (!parsed.cards?.length) throw new Error("empty");
    return parsed.cards;
  } catch {
    return nodes.slice(0, 6).map((n) => ({
      front: `What is the significance of ${n.label} in ${topic}?`,
      back:  n.explanation || `${n.label} is a key ${n.category || "concept"} driving outcomes within ${topic}.`,
    }));
  }
}

export async function generateReport(topic, summary, nodes) {
  try {
    const system = `Write a research brief in Markdown (400-600 words) synthesising the topic and related concepts. Include an Open Questions section.`;
    const { text } = await callClaude(system, `Topic: "${topic}"\nSummary: "${summary}"\nConcepts: ${nodes.map((n) => n.label).join(", ")}`, { maxTokens: 2000 });
    return text.trim();
  } catch {
    return `# Research Brief: ${topic}\n\n## Overview\n${summary}\n\n## Key Concepts\n${nodes.map((n) => `### ${n.label}\n- **Category**: ${n.category}\n- ${n.explanation || "Core constituent node."}\n`).join("\n")}\n\n## Open Questions\n- How will ${nodes[0]?.label || "this field"} evolve over the next decade?\n- What systemic risks are underappreciated?\n`;
  }
}
