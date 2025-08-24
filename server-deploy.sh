#!/bin/bash

# Server deployment script for hrbooteh.com
# Run this script on the server after uploading files

echo "🚀 Starting server deployment for hrbooteh.com..."

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Navigate to application directory
cd /opt/hrbooteh

# Create SSL directory (you'll need to add certificates manually)
mkdir -p ssl
mkdir -p logs

# Set proper permissions
chown -R root:root /opt/hrbooteh
chmod +x deploy.sh

# Check if Google API key is set
if grep -q "your_google_ai_api_key_here" .env.production; then
    echo "⚠️  WARNING: Please update your Google AI API key in .env.production"
    echo "Edit the file: nano .env.production"
fi

echo "📋 SSL Certificate Setup Required:"
echo "Please add your SSL certificates to:"
echo "  - /opt/hrbooteh/ssl/hrbooteh.com.crt"
echo "  - /opt/hrbooteh/ssl/hrbooteh.com.key"
echo ""
echo "You can get free SSL certificates from Let's Encrypt:"
echo "  certbot certonly --standalone -d hrbooteh.com"
echo ""

# Install Node.js for local development/testing if needed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Add SSL certificates to /opt/hrbooteh/ssl/"
echo "2. Update Google API key in .env.production"
echo "3. Point domain hrbooteh.com to this server (85.17.55.23)"
echo "4. Open firewall ports 80 and 443"
echo ""
echo "📊 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Restart: docker-compose restart"
echo "  Stop: docker-compose down"
echo ""
echo "🌐 Test your application:"
echo "  http://85.17.55.23:3000 (direct access)"
echo "  https://hrbooteh.com (after DNS setup)"
