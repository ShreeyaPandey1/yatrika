#!/bin/bash

PROJECT="$HOME/Programming/uni/Yatrika"

echo "🚀 Starting Yatrika..."

# 1. MongoDB

# 2. AI Engine
echo "🔄 Starting AI Engine on port 5001..."
cd "$PROJECT/backend/ai_engines"
source .venv/bin/activate
nohup uvicorn main:app --port 5001 > /tmp/ai_engine.log 2>&1 &
deactivate
sleep 2
echo "✅ AI Engine started (logs: /tmp/ai_engine.log)"

# --------- hardmask -------------
cd ~/Programming/uni/Yatrika/backend
npx hardhat node > /tmp/hardhat.log 2>&1 &
sleep 3

# 3. Main Backend
echo "🔄 Starting Main Backend on port 5000..."
cd "$PROJECT/backend"
nohup npm start > /tmp/backend.log 2>&1 &
sleep 2
echo "✅ Main Backend started (logs: /tmp/backend.log)"

# 4. Police Backend
echo "🔄 Starting Police Backend on port 5002..."
cd "$PROJECT/police_backend"
nohup npm start > /tmp/police.log 2>&1 &
sleep 2
echo "✅ Police Backend started (logs: /tmp/police.log)"

# 5. Frontend
echo "🔄 Starting Frontend..."
cd "$PROJECT/frontend"
nohup npx serve . > /tmp/frontend.log 2>&1 &
sleep 3
echo "✅ Frontend started (logs: /tmp/frontend.log)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Yatrika is up!"
echo "   Tourist app → http://localhost:3000/tourist"
echo "   Admin panel → http://localhost:3000/admin"
echo "   Main API    → http://localhost:5000"
echo "   Police API  → http://localhost:5002"
echo "   AI Engine   → http://localhost:5001"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To stop everything: bash stop_tourchain.sh"
