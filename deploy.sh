#!/bin/bash

echo "🚀 Deploying TeleDrive to Vercel..."
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/raghavg2004/R-Cloud.git
fi

# Stage all changes
echo "📝 Staging changes..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Deploy to Vercel - $(date +'%Y-%m-%d %H:%M:%S')"

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📌 Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Click 'Add New Project'"
echo "3. Import: raghavg2004/R-Cloud"
echo "4. Click 'Deploy'"
echo ""
echo "🎉 Your app will be live at: https://r-cloud.vercel.app"
