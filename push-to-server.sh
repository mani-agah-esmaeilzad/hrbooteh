#!/bin/bash

# Simple push script for hrbooteh.com
# Only uploads files without Docker modifications

echo "🚀 Pushing files to hrbooteh.com server..."

# Server configuration
SERVER="85.17.55.23"
USER="root"
PASSWORD="M83038303a"
REMOTE_PATH="/opt/hrbooteh"

# Create deployment archive
echo "📦 Creating deployment package..."
tar -czf hrbooteh-update.tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='*.log' \
    --exclude='logs' \
    --exclude='ssl' \
    --exclude='.env.backup*' \
    --exclude='docker-compose.production.yml' \
    --exclude='Dockerfile.production' \
    --exclude='complete-deployment.sh' \
    --exclude='*.tar.gz' \
    .

echo "✅ Package created: hrbooteh-update.tar.gz"

# Upload to server
echo "📤 Uploading to server ${SERVER}..."
scp hrbooteh-update.tar.gz root@${SERVER}:/tmp/

if [ $? -eq 0 ]; then
    echo "✅ Files uploaded successfully"
    
    # Deploy on server
    echo "🔄 Deploying on server..."
    ssh root@${SERVER} << 'ENDSSH'
        cd /opt/hrbooteh
        
        # Backup current files
        echo "💾 Creating backup..."
        tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz --exclude='node_modules' --exclude='.next' .
        
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
ENDSSH

    echo ""
    echo "🎉 Push completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. SSH to server: ssh root@85.17.55.23"
    echo "2. Restart app: docker-compose restart app"
    echo "3. Check logs: docker-compose logs -f app"
    echo ""
    echo "🌐 Your site: https://hrbooteh.com"
    
else
    echo "❌ Upload failed!"
    exit 1
fi

# Clean up local file
rm hrbooteh-update.tar.gz
echo "🧹 Cleaned up local files"
