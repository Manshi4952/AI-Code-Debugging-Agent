#!/bin/bash
# start_backend.sh — run from the backend/ directory

echo "🧠 Starting DebugBrain Backend..."

# Check for .env
if [ ! -f .env ]; then
  echo "⚠️  No .env found. Copying from .env.example..."
  cp .env.example .env
  echo "✏️  Please edit backend/.env and add your GROQ_API_KEY, then re-run."
  exit 1
fi

# Install dependencies
pip install -r requirements.txt --quiet

# Create data directories
mkdir -p data/memory data/history

# Load .env
export $(grep -v '^#' .env | xargs)

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
