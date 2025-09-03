@echo off
chcp 65001 >nul
echo 🚀 Initializing Git and pushing to repository...
echo.

:: Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Initialize git repository if not exists
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

:: Add all files
echo 📦 Adding files to git...
git add .

:: Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% neq 0 (
    :: Commit changes
    echo 💾 Committing changes...
    git commit -m "Update hrbooteh.com - %date% %time%"
    echo ✅ Changes committed
) else (
    echo ℹ️  No changes to commit
)

:: Check if remote exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  No remote repository configured
    echo.
    echo Please add a remote repository:
    echo Example: git remote add origin https://github.com/username/hrbooteh.git
    echo.
    set /p REMOTE_URL="Enter your Git repository URL: "
    if not "!REMOTE_URL!"=="" (
        git remote add origin !REMOTE_URL!
        echo ✅ Remote repository added
    ) else (
        echo ❌ No remote URL provided
        pause
        exit /b 1
    )
)

:: Push to remote
echo 🚀 Pushing to remote repository...
git push -u origin main 2>nul
if %errorlevel% neq 0 (
    echo 🔄 Trying to push to master branch...
    git push -u origin master
    if %errorlevel% neq 0 (
        echo ❌ Push failed. Please check your repository settings.
        echo.
        echo Common solutions:
        echo 1. Make sure you have access to the repository
        echo 2. Check if the repository exists
        echo 3. Verify your Git credentials
        pause
        exit /b 1
    )
)

echo.
echo 🎉 Successfully pushed to Git repository!
echo.
echo 📋 Repository status:
git status --short

echo.
echo ✅ All done! Your code is now on Git.
pause
