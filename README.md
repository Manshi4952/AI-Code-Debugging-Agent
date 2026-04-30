# 🧠 DebugBrain — AI Code Debugging Agent with Vector Memory

> **DebugBrain** is a next-generation AI-powered debugging assistant that doesn't just find bugs — it *remembers* them. By leveraging a hybrid memory engine combining Local JSON persistence and Hindsight Cloud vector storage, DebugBrain learns your unique coding patterns and delivers personalized, context-aware fixes based on your own debugging history.

---

## 📌 Table of Contents

- [Features](#-features)
- [Project Structure](#️-project-structure)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start-local)
- [Environment Variables](#️-environment-variables)
- [Hybrid Memory System](#-hybrid-memory-system)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Team](#-team)

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 🔍 **Vector Memory** | Powered by Hindsight 2.0 to recall similar bugs via semantic search across all your past sessions. |
| 🛠️ **Auto-Fix Engine** | Generates corrected code with step-by-step logic explanations powered by Groq (Llama 3.1). |
| 🔁 **Pattern Recognition** | Detects recurring errors and alerts you (e.g., *"This is your 4th `KeyError` this week"*). |
| 🧵 **Thread-Safe Sync** | Non-blocking cloud synchronization using FastAPI concurrency — zero latency on your UI. |
| 📊 **Quality Scoring** | Provides a 1–10 code quality score with actionable, prioritized improvement tips. |
| 📅 **Debug Timeline** | Searchable history of every debugging session, stored locally and synced to the cloud. |

---

## 🗂️ Project Structure

```
debugbrain/
├── backend/
│   ├── main.py              # FastAPI application & API routing
│   ├── analyzer.py          # Groq LLM logic & prompt engineering
│   ├── memory.py            # Hybrid Memory Manager (JSON + Hindsight 2.0)
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # API keys and cloud URLs (not committed)
│
├── frontend/
│   └── src/
│       ├── App.jsx           # Application state & core logic
│       ├── components/       # Monaco Editor & Results panel components
│       └── utils/api.js      # Axios config for backend communication
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **LLM** | Llama 3.1 via [Groq](https://console.groq.com) |
| **Vector Memory** | [Hindsight 2.0](https://hindsight.vectorize.io) |
| **Local Memory** | JSON flat-file persistence |
| **Backend** | FastAPI, Uvicorn, Pydantic v2 |
| **Frontend** | React 18, Vite, Monaco Editor |
| **Backend Hosting** | [Render](https://render.com) |
| **Frontend Hosting** | [Vercel](https://vercel.com) |

---

## ✅ Prerequisites

Make sure you have the following installed before running DebugBrain:

- **Python** 3.9+
- **Node.js** 18+ and **npm**
- A **Groq API Key** → [console.groq.com](https://console.groq.com)
- A **Hindsight API Key** → [hindsight.vectorize.io](https://hindsight.vectorize.io)

---

## 🚀 Quick Start (Local)

### 1. Clone the Repository

```bash
git clone https://github.com/Manshi4952/AI-Code-Debugging-Agent.git
cd AI-Code-Debugging-Agent
```

### 2. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in your keys:

```env
GROQ_API_KEY=gsk_your_groq_key_here
HINDSIGHT_API_KEY=hsk_your_hindsight_key_here
HINDSIGHT_API_URL=https://api.hindsight.vectorize.io
```

### 3. Setup & Run the Backend

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python3 main.py
```

The backend will be available at `http://localhost:8000`.

### 4. Setup & Run the Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## ⚙️ Environment Variables

All backend configuration is handled through environment variables. Set these in `backend/.env`:

| Variable | Description | Example |
|:---|:---|:---|
| `GROQ_API_KEY` | Your Groq secret key for LLM access | `gsk_...` |
| `HINDSIGHT_API_KEY` | Your Hindsight Personal Access Token | `hsk_...` |
| `HINDSIGHT_API_URL` | Hindsight cloud endpoint | `https://api.hindsight.vectorize.io` |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore` by default.

---

## 🧠 Hybrid Memory System

DebugBrain uses a **dual-layer memory architecture** to ensure your debugging context is always fast, persistent, and intelligent.

```
                        ┌──────────────────────────┐
  User submits code ──► │   FastAPI /analyze route  │
                        └────────────┬─────────────┘
                                     │
               ┌─────────────────────┴──────────────────────┐
               ▼                                             ▼
  ┌────────────────────────┐              ┌──────────────────────────────┐
  │  Local Layer (JSON)     │              │  Cloud Layer (Hindsight 2.0)  │
  │  - Frequency counting   │              │  - Semantic vector search     │
  │  - UI debug timeline    │              │  - .retain() to store memory  │
  │  data/memory/<uid>.json │              │  - .recall() to find matches  │
  └────────────────────────┘              └──────────────────────────────┘
```

**Layer 1 — Local JSON:**
High-speed persistence used for frequency counting (pattern detection) and rendering the debug timeline in the UI. Stored at `data/memory/<user_id>.json`.

**Layer 2 — Hindsight 2.0 (Vector DB):**
Enables semantic search across all past debug sessions. The AI can surface matches like: *"I remember you had a similar `NullPointerException` in a different project two weeks ago..."*

**Thread Safety:**
The memory engine uses `fastapi.concurrency.run_in_threadpool` to ensure cloud uploads are always non-blocking, keeping API responses snappy regardless of cloud latency.

---

## 🔌 API Reference

Base URL (local): `http://localhost:8000`

| Endpoint | Method | Description |
|:---|:---|:---|
| `/analyze` | `POST` | Submit code for analysis. Syncs to Hindsight and recalls semantically similar past fixes. |
| `/history/{user_id}` | `GET` | Fetch the visual debug timeline for a specific user. |
| `/memories/{user_id}` | `GET` | Retrieve the most frequent bug patterns from the user's memory bank. |
| `/clear/{user_id}` | `DELETE` | Wipe all local and cloud memory for a user — clean slate mode. |

### Example Request — `/analyze`

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "code": "def divide(a, b):\n    return a / b\n\ndivide(10, 0)",
    "language": "python"
  }'
```

---

## ☁️ Deployment

### Backend — Render

1. Push your code to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set the build command to `pip install -r requirements.txt`.
4. Set the start command to `python3 main.py`.
5. Add all environment variables (`GROQ_API_KEY`, `HINDSIGHT_API_KEY`, `HINDSIGHT_API_URL`) in the Render dashboard under **Environment**.

### Frontend — Vercel

1. Import the repository on [Vercel](https://vercel.com).
2. Set the root directory to `frontend/`.
3. Update `frontend/src/utils/api.js` to point to your Render backend URL.
4. Deploy — Vercel handles everything else automatically.

## 🚀 [Live Demo](https://ai-code-debugging-agent-eight.vercel.app)


---

## 🤝 Team

| Name | Role |
|:---|:---|
| **Manshi Kumari Shaw** | Team Leader & Full-Stack Lead |
| **Nandani** | Contributor |
| **Laxmi** | Contributor |
| **Manisha** | Contributor |

---

## 📄 License

This project is open source. Feel free to use, modify, and distribute it. Contributions via pull requests are welcome!

---

<div align="center">
  <sub>Built with ❤️ by Team DebugBrain</sub>
</div>
