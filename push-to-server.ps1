# PowerShell script to push files to hrbooteh.com server
# Only uploads files without Docker modifications

Write-Host "🚀 Pushing files to hrbooteh.com server..." -ForegroundColor Green

# Server configuration
$SERVER = "85.17.55.23"
$USER = "root"
$REMOTE_PATH = "/opt/hrbooteh"

# Check if required tools are available
if (!(Get-Command "scp" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SCP not found. Please install OpenSSH client or Git Bash." -ForegroundColor Red
    exit 1
}

if (!(Get-Command "ssh" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH not found. Please install OpenSSH client or Git Bash." -ForegroundColor Red
    exit 1
}

# Create deployment archive using 7zip or tar
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Try to use tar (available in Windows 10+)
if (Get-Command "tar" -ErrorAction SilentlyContinue) {
    tar -czf hrbooteh-update.tar.gz `
        --exclude='.git' `
        --exclude='node_modules' `
        --exclude='.next' `
        --exclude='*.log' `
        --exclude='logs' `
        --exclude='ssl' `
        --exclude='.env.backup*' `
        --exclude='docker-compose.production.yml' `
        --exclude='Dockerfile.production' `
        --exclude='complete-deployment.sh' `
        --exclude='*.tar.gz' `
        .
} else {
    Write-Host "❌ TAR not found. Please run this in Git Bash or install tar." -ForegroundColor Red
    exit 1
}

if (Test-Path "hrbooteh-update.tar.gz") {
    Write-Host "✅ Package created: hrbooteh-update.tar.gz" -ForegroundColor Green
    
    # Upload to server
    Write-Host "📤 Uploading to server $SERVER..." -ForegroundColor Yellow
    scp hrbooteh-update.tar.gz root@${SERVER}:/tmp/
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
        
        # Deploy on server
        Write-Host "🔄 Deploying on server..." -ForegroundColor Yellow
        
        $deployScript = @"
cd /opt/hrbooteh

# Backup current files
echo "💾 Creating backup..."
tar -czf backup-`$(date +%Y%m%d-%H%M%S).tar.gz --exclude='node_modules' --exclude='.next' .

# Extract new files
echo "📋 Extracting new files..."
tar -xzf /tmp/hrbooteh-update.tar.gz

# Clean up
rm /tmp/hrbooteh-update.tar.gz

# Set permissions
chown -R root:root /opt/hrbooteh
chmod +x *.sh

echo "✅ Deployment completed!"
echo ""
echo "🔄 To restart the application, run:"
echo "   docker-compose restart app"
echo ""
echo "📊 To view logs:"
echo "   docker-compose logs -f app"
"@
        
        ssh root@$SERVER $deployScript
        
        Write-Host ""
        Write-Host "🎉 Push completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Cyan
        Write-Host "1. SSH to server: ssh root@85.17.55.23" -ForegroundColor White
        Write-Host "2. Restart app: docker-compose restart app" -ForegroundColor White
        Write-Host "3. Check logs: docker-compose logs -f app" -ForegroundColor White
        Write-Host ""
        Write-Host "🌐 Your site: https://hrbooteh.com" -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ Upload failed!" -ForegroundColor Red
        exit 1
    }
    
    # Clean up local file
    Remove-Item "hrbooteh-update.tar.gz" -Force
    Write-Host "🧹 Cleaned up local files" -ForegroundColor Gray
    
} else {
    Write-Host "❌ Failed to create package!" -ForegroundColor Red
    exit 1
}
