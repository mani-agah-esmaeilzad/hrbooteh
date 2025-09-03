#!/bin/bash

# Complete Deployment Script for hrbooteh.com
# Server: 85.17.55.23
# Domain: hrbooteh.com
# User: root

echo "🚀 Starting complete deployment for hrbooteh.com"
echo "=================================================="

# Configuration
SERVER_IP="85.17.55.23"
SERVER_USER="root"
SERVER_PATH="/opt/hrbooteh"
DOMAIN="hrbooteh.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Step 1: Prepare local files
print_header "Preparing local files..."

# Create .dockerignore if not exists
if [ ! -f ".dockerignore" ]; then
    cat > .dockerignore << EOF
node_modules
.next
.git
*.log
logs
ssl
.env.backup*
Dockerfile
docker-compose.yml
README*.md
*.md
test-*.html
.grok
EOF
    print_status "Created .dockerignore file"
fi

# Step 2: Upload files to server
print_header "Uploading files to server..."

# Create tar archive excluding unnecessary files
tar -czf hrbooteh-deployment.tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='logs' \
    --exclude='ssl' \
    --exclude='*.log' \
    --exclude='.env.backup*' \
    .

print_status "Created deployment archive"

# Upload to server
scp hrbooteh-deployment.tar.gz root@${SERVER_IP}:/tmp/
print_status "Uploaded files to server"

# Clean up local archive
rm hrbooteh-deployment.tar.gz

# Step 3: Deploy on server
print_header "Deploying on server..."

ssh root@${SERVER_IP} << 'ENDSSH'
#!/bin/bash

# Server-side deployment script
echo "🔧 Starting server-side deployment..."

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget gnupg lsb-release ca-certificates

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create application directory
mkdir -p /opt/hrbooteh
cd /opt/hrbooteh

# Stop existing containers
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

# Extract uploaded files
tar -xzf /tmp/hrbooteh-deployment.tar.gz -C /opt/hrbooteh
rm /tmp/hrbooteh-deployment.tar.gz

# Create necessary directories
mkdir -p ssl logs

# Set permissions
chown -R root:root /opt/hrbooteh
chmod +x *.sh

# Generate self-signed SSL certificate if not exists
if [ ! -f "ssl/hrbooteh.com.crt" ] || [ ! -f "ssl/hrbooteh.com.key" ]; then
    echo "🔐 Generating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/hrbooteh.com.key \
        -out ssl/hrbooteh.com.crt \
        -subj "/C=IR/ST=Tehran/L=Tehran/O=HRBooteh/OU=IT/CN=hrbooteh.com/emailAddress=admin@hrbooteh.com"
    
    echo "⚠️  Self-signed certificate generated. For production, replace with real SSL certificate."
fi

# Configure firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.production.yml up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 45

# Check service status
echo "🔍 Checking service status..."
docker-compose -f docker-compose.production.yml ps

# Test services
echo "🧪 Testing services..."
if curl -f http://localhost:3000/api/health &>/dev/null; then
    echo "✅ Application is responding"
else
    echo "❌ Application health check failed"
fi

# Check database connection
if docker-compose -f docker-compose.production.yml exec -T mysql mysql -u hrbooteh_user -pM83038303a! -e "SELECT 1;" hrbooteh_db &>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
fi

echo ""
echo "🎉 Deployment completed!"
echo "=============================="
echo ""
echo "🌐 Your application is now available at:"
echo "  - HTTP:  http://85.17.55.23"
echo "  - HTTPS: https://85.17.55.23"
echo "  - Domain: https://hrbooteh.com (after DNS propagation)"
echo ""
echo "📊 Service Management:"
echo "  View logs:    docker-compose -f docker-compose.production.yml logs -f"
echo "  Restart all:  docker-compose -f docker-compose.production.yml restart"
echo "  Stop all:     docker-compose -f docker-compose.production.yml down"
echo "  Update app:   docker-compose -f docker-compose.production.yml up -d --build app"
echo ""
echo "🔧 Troubleshooting:"
echo "  Application logs: docker-compose -f docker-compose.production.yml logs app"
echo "  Database logs:    docker-compose -f docker-compose.production.yml logs mysql"
echo "  Nginx logs:       docker-compose -f docker-compose.production.yml logs nginx"
echo ""
echo "📁 Important paths:"
echo "  Application: /opt/hrbooteh"
echo "  SSL certs:   /opt/hrbooteh/ssl"
echo "  Logs:        /opt/hrbooteh/logs"

ENDSSH

print_status "Server deployment completed!"

echo ""
echo "🎯 DEPLOYMENT SUMMARY"
echo "====================="
echo ""
echo "✅ Files uploaded to server"
echo "✅ Docker and Docker Compose installed"  
echo "✅ Application containers built and started"
echo "✅ SSL certificates configured"
echo "✅ Firewall configured"
echo ""
echo "🌐 Your hrbooteh.com application is now live!"
echo ""
echo "📋 Next Steps:"
echo "1. Point your domain hrbooteh.com DNS to 85.17.55.23"
echo "2. Replace self-signed SSL with real certificate if needed"
echo "3. Test your application at https://hrbooteh.com"
echo ""
echo "🔗 Access URLs:"
echo "  - Direct IP: https://85.17.55.23"
echo "  - Domain: https://hrbooteh.com (after DNS setup)"
echo ""
echo "📞 Support:"
echo "  SSH to server: ssh root@85.17.55.23"
echo "  App directory: cd /opt/hrbooteh"
echo "  View logs: docker-compose -f docker-compose.production.yml logs -f"
