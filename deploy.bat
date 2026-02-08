@echo off
echo 🚀 Deploying TeleDrive to Vercel...
echo.

REM Check if git is initialized
if not exist .git (
    echo 📦 Initializing Git repository...
    git init
)

REM Check if remote exists
git remote | findstr /C:"origin" >nul
if errorlevel 1 (
    echo 🔗 Adding GitHub remote...
    git remote add origin https://github.com/raghavg2004/R-Cloud.git
)

REM Stage all changes
echo 📝 Staging changes...
git add .

REM Commit
echo 💾 Committing changes...
git commit -m "Deploy to Vercel - %date% %time%"

REM Push to GitHub
echo ⬆️ Pushing to GitHub...
git push -u origin main

echo.
echo ✅ Code pushed to GitHub!
echo.
echo 📌 Next steps:
echo 1. Go to https://vercel.com
echo 2. Click 'Add New Project'
echo 3. Import: raghavg2004/R-Cloud
echo 4. Click 'Deploy'
echo.
echo 🎉 Your app will be live at: https://r-cloud.vercel.app
echo.
pause
