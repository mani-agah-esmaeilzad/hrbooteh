# PowerShell script to initialize Git and push hrbooteh.com code
param(
    [string]$Message = "Update hrbooteh.com - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    [string]$RemoteUrl = ""
)

Write-Host "🚀 Initializing Git and pushing to repository..." -ForegroundColor Green
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version 2>$null
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Initialize git repository if not exists
if (!(Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Git repository initialized" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to initialize Git repository" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Configure git user if not set
$userName = git config user.name 2>$null
$userEmail = git config user.email 2>$null

if (!$userName) {
    $inputName = Read-Host "Enter your Git username"
    if ($inputName) {
        git config user.name $inputName
        Write-Host "✅ Git username set to: $inputName" -ForegroundColor Green
    }
}

if (!$userEmail) {
    $inputEmail = Read-Host "Enter your Git email"
    if ($inputEmail) {
        git config user.email $inputEmail
        Write-Host "✅ Git email set to: $inputEmail" -ForegroundColor Green
    }
}

# Add all files
Write-Host "📦 Adding files to git..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Files added to staging area" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add files" -ForegroundColor Red
    exit 1
}

# Check if there are changes to commit
$changes = git diff --cached --name-only
if ($changes) {
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    Write-Host "Files to commit:" -ForegroundColor Cyan
    $changes | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
    
    git commit -m $Message
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Changes committed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to commit changes" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  No changes to commit" -ForegroundColor Blue
}

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if (!$remoteExists) {
    Write-Host "⚠️  No remote repository configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please add a remote repository:" -ForegroundColor Cyan
    Write-Host "Example: https://github.com/username/hrbooteh.git" -ForegroundColor White
    Write-Host ""
    
    if (!$RemoteUrl) {
        $RemoteUrl = Read-Host "Enter your Git repository URL"
    }
    
    if ($RemoteUrl) {
        git remote add origin $RemoteUrl
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Remote repository added: $RemoteUrl" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to add remote repository" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ No remote URL provided" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "✅ Remote repository exists: $remoteExists" -ForegroundColor Green
}

# Get current branch
$currentBranch = git branch --show-current 2>$null
if (!$currentBranch) {
    $currentBranch = "main"
    git checkout -b main 2>$null
}

Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

# Push to remote
Write-Host "🚀 Pushing to remote repository..." -ForegroundColor Yellow

# Try to push to current branch first
git push -u origin $currentBranch 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to $currentBranch branch" -ForegroundColor Green
} else {
    # Try pushing to main
    Write-Host "🔄 Trying to push to main branch..." -ForegroundColor Yellow
    git push -u origin main 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to main branch" -ForegroundColor Green
    } else {
        # Try pushing to master
        Write-Host "🔄 Trying to push to master branch..." -ForegroundColor Yellow
        git push -u origin master 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully pushed to master branch" -ForegroundColor Green
        } else {
            Write-Host "❌ Push failed. Please check your repository settings." -ForegroundColor Red
            Write-Host ""
            Write-Host "Common solutions:" -ForegroundColor Yellow
            Write-Host "1. Make sure you have access to the repository" -ForegroundColor White
            Write-Host "2. Check if the repository exists" -ForegroundColor White
            Write-Host "3. Verify your Git credentials" -ForegroundColor White
            Write-Host "4. Try: git push --set-upstream origin main --force" -ForegroundColor White
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
}

Write-Host ""
Write-Host "🎉 Successfully pushed to Git repository!" -ForegroundColor Green
Write-Host ""

# Show repository status
Write-Host "📋 Repository status:" -ForegroundColor Cyan
$status = git status --porcelain
if ($status) {
    git status --short
} else {
    Write-Host "Working tree clean ✅" -ForegroundColor Green
}

# Show remote info
Write-Host ""
Write-Host "🔗 Remote repository:" -ForegroundColor Cyan
git remote -v

Write-Host ""
Write-Host "✅ All done! Your code is now on Git." -ForegroundColor Green
Read-Host "Press Enter to exit"
