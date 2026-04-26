# ✨ LuminAI: The Omniscient Learning Agent
*Built by Vikas Kumar Singh*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-success?style=for-the-badge)](https://luminai-734405091711.us-central1.run.app/)
[![Powered by Gemini](https://img.shields.io/badge/Powered_by-Gemini_3_Flash-blue?style=for-the-badge)](https://ai.google.dev/)
[![Built with React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)

**LuminAI** (formerly UALE) is a premium, AI-driven adaptive learning platform. Enter absolutely any subject, and LuminAI will instantly craft a highly personalized curriculum, visually map it out into a knowledge graph, and guide you through an interactive mastery journey.

🔗 **Try it live:** [luminai-734405091711.us-central1.run.app](https://luminai-734405091711.us-central1.run.app/)

---

## 🌟 Key Features

- **Dynamic Adaptive Curriculum** — Tell LuminAI what you want to learn, and it generates a structured, node-based curriculum with mapped prerequisites and time estimates.
- **Interactive Tutor (4 Modes)** — The chat agent streams answers using LaTeX mathematical parsing and Markdown. Switch seamlessly between *Simple, Technical, Analogy,* or *Real World* explanations.
- **Intelligent Evaluation Engine** — No multiple-choice fluff. Answer questions in plain English, and LuminAI will categorize your mistakes (e.g., conceptual vs. calculation errors) and update your mastery percentage in real-time.
- **Knowledge Graph Visualization** — Watch your progress visually map out in real-time as a connected spatial graph of learning nodes.
- **Continuous Adaptive Quizzing** — LuminAI creates bespoke exams dynamically assembled based directly on your weakest links.

---

## 🚀 Local Development

Want to run this cutting-edge application locally?

### 1. Install Dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment variables
Navigate to the `server` directory and create a `.env` file with your Google Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...
```

### 3. Run the Application
Start the backend API server:
```bash
cd server
npm run dev
# Server binds to http://localhost:3001
```

Start the Vite React frontend:
```bash
cd client
npm run dev
# Client runs at http://localhost:5173
```

---

## 🏗️ Architecture

LuminAI leverages an independent frontend/backend architecture that bundles into a single container for seamless edge deployments safely protecting API keys.

```text
lumin-ai/
├── client/                 # React + Vite (Glassmorphic Light Theme)
│   └── src/
│       ├── api/         
│       │   └── uale.js        # REST client & Gemini SSE streaming receiver
│       ├── components/        # ChatPanel, CurriculumPanel, Dashboard, QuizMode 
│       ├── store/       
│       │   └── learningStore  # Zustand global state manager
│       └── utils/       
│           └── adaptiveEngine # Frontend mastery mathematics and progression
│
└── server/                 # Express API + Google Gen AI SDK
    ├── src/
    │   ├── routes/          # /generate, /learning, /quiz
    │   └── index.js         # Unified deployment gateway & static asset serving
    └── package.json         # Container target
```

---

*Designed and Built for the Next Generation of Autonomous Learning by Vikas Kumar Singh.*
