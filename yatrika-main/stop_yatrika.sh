#!/bin/bash

echo "🛑 Stopping Yatrika..."

fuser -k 5000/tcp 2>/dev/null && echo "✅ Main Backend stopped"
fuser -k 5001/tcp 2>/dev/null && echo "✅ AI Engine stopped"
fuser -k 5002/tcp 2>/dev/null && echo "✅ Police Backend stopped"
fuser -k 3000/tcp 2>/dev/null && echo "✅ Frontend stopped"

pkill mongod 2>/dev/null && echo "✅ MongoDB stopped"

echo "Done."
