#!/bin/bash
# Script to restart Next.js dev server
# Use this when you need code changes to take effect

echo "🔄 Stopping old dev server..."
pkill -f "next dev" 2>/dev/null

echo "⏳ Waiting..."
sleep 2

echo "🚀 Starting dev server..."
cd "$(dirname "$0")/web-app"
npm run dev
