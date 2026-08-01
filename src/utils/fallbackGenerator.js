// Smart client-side fallback generator when running statically on GitHub Pages

export function generateFallbackGraph(topic) {
  const cleanTopic = topic || 'Concept Intelligence';
  return {
    topic: cleanTopic,
    nodes: [
      { id: '1', label: cleanTopic, description: `Core overview and foundations of ${cleanTopic}.`, category: 'core', canExpand: true },
      { id: '2', label: 'Key Mechanisms', description: `Fundamental components, mechanics, and underlying rules of ${cleanTopic}.`, category: 'subconcept', canExpand: true },
      { id: '3', label: 'Theoretical Foundations', description: `Mathematical, logical, or scientific principles governing ${cleanTopic}.`, category: 'theory', canExpand: true },
      { id: '4', label: 'Practical Applications', description: `Real-world use cases, industry deployments, and applications of ${cleanTopic}.`, category: 'application', canExpand: true },
      { id: '5', label: 'Advanced Innovations', description: `Cutting-edge developments and future trajectories in ${cleanTopic}.`, category: 'detail', canExpand: true }
    ],
    links: [
      { source: '1', target: '2', relationship: 'contains' },
      { source: '1', target: '3', relationship: 'underpinned by' },
      { source: '1', target: '4', relationship: 'applies to' },
      { source: '1', target: '5', relationship: 'leads to' }
    ]
  };
}

export function generateFallbackNodeExpansion(parentNodeId, nodeLabel, topic) {
  const cleanLabel = nodeLabel || 'Sub-concept';
  return {
    newNodes: [
      { id: `${parentNodeId}_sub1`, label: `${cleanLabel} Architecture`, description: `Structural layout and architectural design of ${cleanLabel}.`, category: 'detail', canExpand: true },
      { id: `${parentNodeId}_sub2`, label: `${cleanLabel} Algorithm`, description: `Core algorithmic workflow and computational logic for ${cleanLabel}.`, category: 'detail', canExpand: true },
      { id: `${parentNodeId}_sub3`, label: `${cleanLabel} Best Practices`, description: `Recommended guidelines and optimization rules for ${cleanLabel}.`, category: 'detail', canExpand: true }
    ],
    newLinks: [
      { source: parentNodeId, target: `${parentNodeId}_sub1`, relationship: 'explains' },
      { source: parentNodeId, target: `${parentNodeId}_sub2`, relationship: 'implements' },
      { source: parentNodeId, target: `${parentNodeId}_sub3`, relationship: 'optimizes' }
    ]
  };
}

export function generateFallbackStepGuide(topic) {
  const cleanTopic = topic || 'Selected Subject';
  return {
    topic: cleanTopic,
    overview: `Master ${cleanTopic} in 5 interactive, structured learning steps.`,
    steps: [
      {
        stepNumber: 1,
        title: `Introduction & Fundamentals of ${cleanTopic}`,
        summary: `Understand the foundational concepts and prerequisite knowledge required for ${cleanTopic}.`,
        detail: `${cleanTopic} begins with understanding its primary building blocks. Explore how foundational principles establish the groundwork for real-world mastery.`,
        example: `// Step 1 Example Code / Concept\nconst concept = "${cleanTopic}";\nconsole.log("Mastering " + concept + " Step 1: Core Principles");`,
        keyTakeaway: `Focus on grasping the core terminology and primary objectives before diving into complex mechanics.`
      },
      {
        stepNumber: 2,
        title: `Core Mechanics & Architecture`,
        summary: `Analyze how components interact within ${cleanTopic}.`,
        detail: `Examine the inner workings and underlying mechanisms that enable ${cleanTopic} to operate efficiently under real-world conditions.`,
        example: `function analyzeMechanics() {\n  return "Step 2: Processing core workflow for ${cleanTopic}";\n}`,
        keyTakeaway: `Understanding data flow and system structure is essential for debugging and optimization.`
      },
      {
        stepNumber: 3,
        title: `Practical Implementation & Implementation`,
        summary: `Apply knowledge with practical examples and implementations.`,
        detail: `Put theory into practice by building a concrete implementation for ${cleanTopic}.`,
        example: `class ${cleanTopic.replace(/[^a-zA-Z0-9]/g, '') || 'Module'}Controller {\n  execute() {\n    return "Successfully implemented ${cleanTopic}";\n  }\n}`,
        keyTakeaway: `Always write clean, modular, and maintainable code when implementing concepts.`
      },
      {
        stepNumber: 4,
        title: `Edge Cases & Performance Tuning`,
        summary: `Identify common pitfalls and optimize performance.`,
        detail: `Learn how to handle unexpected inputs, stress conditions, and performance bottlenecks in ${cleanTopic}.`,
        example: `// Performance Tuning Example\nconst optimize = (task) => {\n  // Apply caching and batch processing\n  return "Optimized ${cleanTopic}";\n};`,
        keyTakeaway: `Proactive error handling and performance profiling prevent production failures.`
      },
      {
        stepNumber: 5,
        title: `Advanced Mastery & Real-World Best Practices`,
        summary: `Explore industry standards and future directions.`,
        detail: `Achieve mastery in ${cleanTopic} by following industry standards and staying ahead of emerging innovations.`,
        example: `// Advanced Pattern\nexport default async function masterclass() {\n  console.log("${cleanTopic} Mastered!");\n}`,
        keyTakeaway: `Continuous experimentation and building projects solidify long-term expertise.`
      }
    ]
  };
}
