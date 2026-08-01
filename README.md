# 🧠 NeuroWeb — Explorable AI Knowledge Platform

NeuroWeb is an interactive AI-powered learning and knowledge visualization platform featuring a Concept Graph Studio, Step-by-Step Learning Academy, Interactive Chatbot, and a 3D Neural Canvas background.

---

## 📁 Repository Structure

```text
NeuroWeb/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Automated GitHub Actions deployment workflow
├── public/                      # Static web assets & icons
├── server/
│   └── index.js                 # Node/Express backend API server
├── src/
│   ├── assets/                  # UI visual assets
│   ├── components/
│   │   ├── ChatWindow.jsx       # Interactive AI chat assistant component
│   │   ├── ConceptGraph.jsx     # SVG/D3 interactive knowledge graph studio
│   │   ├── ModelSelectorModal.jsx # AI Model selection modal
│   │   ├── NeuralCanvas.jsx     # 3D interactive neural background canvas
│   │   ├── Sidebar.jsx          # Mode navigation & workspace sidebar
│   │   └── StepByStepViewer.jsx # Sequential learning academy breakdown
│   ├── utils/
│   │   └── fallbackGenerator.js # Client-side offline intelligence fallback generator
│   ├── App.css                  # Custom component styling
│   ├── App.jsx                  # Main application state shell & workspace switcher
│   ├── index.css                # Global design system & theme tokens
│   └── main.jsx                 # React root entry point
├── index.html                   # HTML document root
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite build configuration
└── README.md                    # Project documentation
```

---

## ⚡ Key Features

- **Concept Graph Studio**: Interactive force-directed knowledge graph with expandable nodes, category tagging, and relationship links.
- **Step-by-Step Academy**: Structured sequential topic breakdowns for deep learning.
- **Interactive Chatbot**: AI-driven assistant with real-time domain research fallbacks.
- **3D Neural Background**: Multi-layered WebGL/Canvas visual effects.
- **Offline Intelligence Engine**: Intelligent client-side fallback system enabling full functionality even without an external API key.

---

## 🛠 Local Development Setup

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# (Optional) Start Express server
npm run server

# Build production bundle
npm run build
```

---

## 🌐 Deployed URL & Private Repository Hosting Guide

### Why did the URL stop working after making your repository Private?
Standard **GitHub Pages** hosting on GitHub Free accounts is **only available for Public repositories**. When a repository visibility is switched to **Private**, GitHub automatically unpublishes the live site.

### How to Fix Your URL:

#### Option 1: Deploy to Vercel or Netlify (Recommended for Private Repos) — FREE
Keep your GitHub repository **Private** and deploy to Vercel/Netlify for free:
1. Go to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) and log in with GitHub.
2. Click **Import Project** → Select `varunallapur3-pixel/NeuroWeb`.
3. Set Framework: **Vite**, Build Command: `npm run build`, Output Directory: `dist`.
4. Click **Deploy**. Your app will be hosted with free SSL and automatic redeployment on every `git push`.

#### Option 2: Make Repository Public (For GitHub Pages) — FREE
To reactivate standard GitHub Pages hosting (`https://varunallapur3-pixel.github.io/NeuroWeb/`):
1. Navigate to your repository: `https://github.com/varunallapur3-pixel/NeuroWeb`.
2. Go to **Settings** → **Danger Zone** → **Change repository visibility** → **Make public**.
3. Under **Settings** → **Pages**, select **GitHub Actions** as the source.

---

## 📄 License

MIT License © 2026 NeuroWeb
