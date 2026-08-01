import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const POPULAR_MODELS = [
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    description: 'Advanced reasoning, logic & step-by-step problem solving',
    badge: 'Reasoning Leader'
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'Ultra-fast general knowledge, coding & creative assistant',
    badge: 'Fast & Smart'
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Exceptional instruction following, code synthesis & analysis',
    badge: 'Top Coding'
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Versatile multimodal intelligence & rich factual answers',
    badge: 'Popular'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    description: 'State of the art open-weights language model',
    badge: 'Open Weight'
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Lightning fast generation with broad world knowledge',
    badge: 'Ultra Fast'
  }
];

// Helper to call OpenRouter API synchronously for structured JSON tasks
async function callOpenRouterJSON(messages, model = 'deepseek/deepseek-chat') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured on server.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'NeuroWeb Platform',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '{}';
  
  // Extract JSON if wrapped in markdown code blocks
  const cleanJson = rawContent.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanJson);
}

// Health check
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.OPENROUTER_API_KEY);
  res.json({ status: 'ok', hasDefaultKey: hasKey, timestamp: new Date().toISOString() });
});

// Get available models
app.get('/api/models', (req, res) => {
  res.json({ models: POPULAR_MODELS });
});

// Chat completion streaming endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = 'deepseek/deepseek-r1', temperature = 0.7, webSearchEnabled = false } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'No OpenRouter API Key configured on server env.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const formattedMessages = [...messages];
    
    if (webSearchEnabled) {
      const systemInstruction = {
        role: 'system',
        content: `You are NeuroWeb AI, powered by real-time web intelligence. Provide factual, accurate, genuine, up-to-date information.`
      };
      if (formattedMessages.length > 0 && formattedMessages[0].role === 'system') {
        formattedMessages[0].content += `\n\n${systemInstruction.content}`;
      } else {
        formattedMessages.unshift(systemInstruction);
      }
    }

    const payload = {
      model,
      messages: formattedMessages,
      temperature,
      stream: true
    };

    if (webSearchEnabled) {
      payload.plugins = [{ id: 'web' }];
    }

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'NeuroWeb Platform',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      res.write(`data: ${JSON.stringify({ error: `OpenRouter Error: ${openRouterResponse.status} - ${errorText}` })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const reader = openRouterResponse.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error in /api/chat endpoint:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

// Generate initial Concept Graph
app.post('/api/generate-graph', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const systemPrompt = `You are a Knowledge Graph Generator. Analyze the topic "${topic}" and return a JSON object representing a concept map.
JSON Schema:
{
  "topic": "${topic}",
  "nodes": [
    { "id": "1", "label": "Main Topic", "description": "Core overview of ${topic}", "category": "core", "canExpand": true },
    { "id": "2", "label": "Key Concept 1", "description": "Short explanation", "category": "subconcept", "canExpand": true },
    { "id": "3", "label": "Key Concept 2", "description": "Short explanation", "category": "subconcept", "canExpand": true },
    { "id": "4", "label": "Key Application", "description": "Practical use case", "category": "application", "canExpand": true },
    { "id": "5", "label": "Advanced Theory", "description": "Deep mechanism", "category": "theory", "canExpand": true }
  ],
  "links": [
    { "source": "1", "target": "2", "relationship": "contains" },
    { "source": "1", "target": "3", "relationship": "contains" },
    { "source": "1", "target": "4", "relationship": "applies to" },
    { "source": "1", "target": "5", "relationship": "underpinned by" }
  ]
}
Return ONLY valid JSON. Provide clear, informative labels and descriptions.`;

    const graphData = await callOpenRouterJSON([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate concept graph for: ${topic}` }
    ]);

    res.json({ graph: graphData });
  } catch (error) {
    console.error('Error generating graph:', error);
    res.status(500).json({ error: error.message });
  }
});

// Expand Node in Concept Graph
app.post('/api/expand-node', async (req, res) => {
  try {
    const { parentNodeId, nodeLabel, nodeDescription, topic } = req.body;
    if (!nodeLabel) return res.status(400).json({ error: 'Node label is required' });

    const systemPrompt = `You are an expanding Concept Graph Generator. The user wants to expand the concept "${nodeLabel}" (Context: ${topic}).
Generate 3 to 4 child sub-nodes that break down "${nodeLabel}" further.
JSON Schema:
{
  "newNodes": [
    { "id": "child_id_1", "label": "Sub-concept A", "description": "Clear explanation", "category": "detail", "canExpand": true },
    { "id": "child_id_2", "label": "Sub-concept B", "description": "Clear explanation", "category": "detail", "canExpand": true },
    { "id": "child_id_3", "label": "Sub-concept C", "description": "Clear explanation", "category": "detail", "canExpand": true }
  ],
  "newLinks": [
    { "source": "${parentNodeId}", "target": "child_id_1", "relationship": "explains" },
    { "source": "${parentNodeId}", "target": "child_id_2", "relationship": "includes" },
    { "source": "${parentNodeId}", "target": "child_id_3", "relationship": "relates to" }
  ]
}
Return ONLY valid JSON. Ensure unique IDs like "${parentNodeId}_sub1", "${parentNodeId}_sub2".`;

    const expansionData = await callOpenRouterJSON([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Expand node "${nodeLabel}": ${nodeDescription}` }
    ]);

    res.json(expansionData);
  } catch (error) {
    console.error('Error expanding node:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Step-by-Step Understanding Guide
app.post('/api/step-by-step', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const systemPrompt = `You are a Master Educator. Break down the topic "${topic}" into a clear, 5-step interactive learning sequence.
JSON Schema:
{
  "topic": "${topic}",
  "overview": "Brief overview of what the learner will master in these 5 steps.",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Fundamental Concept / Prerequisites",
      "summary": "High-level summary of step 1",
      "detail": "Comprehensive explanation with clear key terms",
      "example": "Analogy or simple code/visual snippet",
      "keyTakeaway": "Main takeaway to remember"
    },
    {
      "stepNumber": 2,
      "title": "Core Mechanism",
      "summary": "High-level summary of step 2",
      "detail": "Comprehensive explanation",
      "example": "Example or scenario",
      "keyTakeaway": "Main takeaway"
    },
    {
      "stepNumber": 3,
      "title": "Practical Application / Code Implementation",
      "summary": "High-level summary of step 3",
      "detail": "Comprehensive explanation",
      "example": "Practical snippet or real world application",
      "keyTakeaway": "Main takeaway"
    },
    {
      "stepNumber": 4,
      "title": "Edge Cases & Optimization",
      "summary": "High-level summary of step 4",
      "detail": "Comprehensive explanation",
      "example": "Best practices",
      "keyTakeaway": "Main takeaway"
    },
    {
      "stepNumber": 5,
      "title": "Advanced Mastery & Real-World Use Cases",
      "summary": "High-level summary of step 5",
      "detail": "Comprehensive explanation",
      "example": "Future directions / industry standard",
      "keyTakeaway": "Main takeaway"
    }
  ]
}
Return ONLY valid JSON. Make explanations crystal clear, engaging, and accurate.`;

    const stepData = await callOpenRouterJSON([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate step-by-step breakdown for: ${topic}` }
    ]);

    res.json({ guide: stepData });
  } catch (error) {
    console.error('Error generating step-by-step breakdown:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ NeuroWeb Server running on http://localhost:${PORT}`);
});
