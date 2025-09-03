#!/bin/bash

# Upload script for hrbooteh.com deployment
# This script uploads all files to the server

SERVER="85.17.55.23"
PORT="22"
USER="root"
REMOTE_PATH="/opt/hrbooteh"

echo "🚀 Uploading files to server $SERVER..."

# Create remote directory
echo "📁 Creating remote directory..."
ssh -p $PORT $USER@$SERVER "mkdir -p $REMOTE_PATH"

# Upload files using rsync
echo "📤 Uploading files..."
rsync -avz -e "ssh -p $PORT" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='logs' \
  --exclude='ssl' \
  --progress \
  . $USER@$SERVER:$REMOTE_PATH/

echo "✅ Files uploaded successfully!"
echo ""
echo "📋 Next steps:"
echo "1. SSH to server: ssh root@$SERVER -p $PORT"
echo "2. Navigate to: cd $REMOTE_PATH"
echo "3. Run deployment: ./server-deploy.sh"
echo ""
echo "🔗 Server details:"
echo "  IP: $SERVER"
echo "  Port: $PORT"
echo "  Path: $REMOTE_PATH"
