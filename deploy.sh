#!/bin/bash

# Deployment script for hrbooteh.com
# This script helps deploy the MBTI/Independence assessment platform

echo "🚀 Starting deployment for hrbooteh.com..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p ssl

# Check if SSL certificates exist
if [ ! -f "ssl/hrbooteh.com.crt" ] || [ ! -f "ssl/hrbooteh.com.key" ]; then
    echo "⚠️  SSL certificates not found in ssl/ directory"
    echo "Please add your SSL certificates:"
    echo "  - ssl/hrbooteh.com.crt"
    echo "  - ssl/hrbooteh.com.key"
    echo ""
    echo "You can get free SSL certificates from Let's Encrypt or your hosting provider"
    read -p "Do you want to continue without SSL? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found"
    echo "Please create .env.production with your production environment variables"
    exit 1
fi

# Check if Google API key is set
if grep -q "your_google_ai_api_key_here" .env.production; then
    echo "⚠️  Please update your Google AI API key in .env.production"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional)
read -p "Do you want to remove old Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing old images..."
    docker system prune -f
fi

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Test database connection
echo "🗄️  Testing database connection..."
docker-compose exec mysql mysql -u hrbooteh_user -phrbooteh_secure_password_2024 -e "SELECT 1;" hrbooteh_db

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
fi

# Test application
echo "🌐 Testing application..."
sleep 10
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Application is responding"
else
    echo "❌ Application is not responding"
    echo "Check logs with: docker-compose logs app"
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Point your domain hrbooteh.com to this server's IP"
echo "2. Make sure ports 80 and 443 are open in your firewall"
echo "3. Test your application at https://hrbooteh.com"
echo ""
echo "📊 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Restart: docker-compose restart"
echo "  Stop: docker-compose down"
echo "  Update: ./deploy.sh"
echo ""
echo "🔧 Troubleshooting:"
echo "  - Check logs: docker-compose logs app"
echo "  - Check database: docker-compose logs mysql"
echo "  - Check nginx: docker-compose logs nginx"
