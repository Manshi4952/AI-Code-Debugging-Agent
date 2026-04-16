# 🧠 DebugBrain — AI Code Debugging Agent with Memory

An AI-powered debugging assistant that **remembers your past bugs**, detects recurring patterns, and gives smarter fixes over time. Unlike generic AI tools, DebugBrain becomes a personalized debugging brain for each developer.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 Bug Detection | Detects syntax errors, logic bugs, runtime errors, edge cases |
| 🛠️ Auto-fix Suggestions | Corrected code with step-by-step explanations |
| 🧠 Memory Engine | Stores every bug you encounter — persists across sessions |
| ↻ Recurring Detection | "You made this IndexError 3 times this month" |
| 💬 AI Chat Assistant | Ask questions about your code in natural language |
| 📅 Debug Timeline | Full searchable history of past debugging sessions |
| 🌍 Multi-language | Python, JavaScript, Java, C++ |
| 📊 Quality Score | Code quality score (1–10) with personalized tips |

---

## 🗂️ Project Structure

```
debugbrain/
├── backend/
│   ├── main.py          # FastAPI app — all API endpoints
│   ├── analyzer.py      # Groq LLM integration
│   ├── memory.py        # Bug memory manager (JSON + Hindsight hooks)
│   ├── requirements.txt
│   ├── .env.example
│   └── start.sh
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component + state
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── EditorPanel.jsx  # Monaco Editor + language picker
│   │   │   ├── ResultsPanel.jsx # Tab router
│   │   │   ├── BugsTab.jsx      # Bug cards with fix suggestions
│   │   │   └── Tabs.jsx         # Memory, Chat, Timeline tabs
│   │   ├── utils/api.js         # Backend API calls
│   │   └── styles/App.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── render.yaml          # Render backend deployment config
└── README.md
```

---

## 🚀 Quick Start (Local)

### 1. Get a free Groq API key
Go to [https://console.groq.com](https://console.groq.com) → Sign up → Create API key (free tier is generous).

### 2. Start the backend

```bash
cd backend

# Copy and fill in your env
cp .env.example .env
# Edit .env and paste your GROQ_API_KEY

# Install dependencies
pip install -r requirements.txt

# Create data directories
mkdir -p data/memory data/history

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`.  
Visit `http://localhost:8000/docs` for the interactive Swagger UI.

### 3. Start the frontend

```bash
cd frontend

# Copy env
cp .env.example .env

# Install and run
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```
GROQ_API_KEY=gsk_...          # Required — get from console.groq.com
HINDSIGHT_API_KEY=...         # Optional — for cloud memory (see below)
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000
```

---

## 🧠 Memory System

By default, DebugBrain uses **local JSON file storage** — no extra accounts needed. Bug memory is saved to `backend/data/memory/<user_id>.json`.

### Upgrading to Hindsight Cloud (optional)

For production use with vector search and persistent cloud memory:

1. Sign up at [https://hindsight.dev](https://hindsight.dev) and get an API key
2. Add to `backend/.env`: `HINDSIGHT_API_KEY=your_key`
3. In `backend/requirements.txt`, uncomment: `hindsight-sdk`
4. In `backend/memory.py`, uncomment the Hindsight sections (marked with comments) and comment out the JSON sections

---

## 🌐 Deployment

### Backend → Render (free tier)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set root directory to `backend`
4. Add environment variable: `GROQ_API_KEY`
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

Or use the included `render.yaml` with Render's Blueprint feature.

### Frontend → Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your repo, set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy — Vercel auto-detects Vite

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/analyze` | POST | Analyze code for bugs + cross-reference memory |
| `/chat` | POST | Conversational AI debug assistant |
| `/memory/{user_id}` | GET | Fetch all stored bug memories |
| `/history/{user_id}` | GET | Fetch debug timeline |
| `/memory/{user_id}` | DELETE | Clear all memories for a user |

### Example: Analyze code
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "for i in range(len(arr)+1): print(arr[i])",
    "language": "python",
    "user_id": "dev_123"
  }'
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| AI / LLM | Groq (`llama-3.1-70b-versatile`) |
| Memory | JSON files (local) / Hindsight SDK (cloud) |
| Backend | Python, FastAPI, Uvicorn |
| Frontend | React 18, Vite |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Deploy | Vercel (frontend) + Render (backend) |

---

## 📝 License

MIT — free to use, modify, and deploy.
