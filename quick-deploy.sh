#!/bin/bash

# Quick deployment script - run this manually with SSH access

echo "🚀 Quick Deploy to hrbooteh.com server"
echo "Server: 85.17.55.23:6579"
echo "Password: M83038303a"
echo ""

echo "Step 1: Upload files to server"
echo "scp -P 6579 -r . root@85.17.55.23:/opt/hrbooteh/"
echo ""

echo "Step 2: SSH to server and run deployment"
echo "ssh root@85.17.55.23 -p 6579"
echo "cd /opt/hrbooteh"
echo "chmod +x server-deploy.sh"
echo "./server-deploy.sh"
echo ""

echo "Step 3: After deployment, access your site:"
echo "http://85.17.55.23:3000"
echo ""

# Alternative: Create a single command deployment
cat << 'EOF' > /tmp/server_commands.sh
#!/bin/bash
cd /opt/hrbooteh
apt update -y
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
systemctl start docker && systemctl enable docker
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
mkdir -p ssl logs
docker-compose down 2>/dev/null || true
docker-compose up -d --build
sleep 30
docker-compose ps
echo "🎉 Deployment completed! Access at: http://85.17.55.23:3000"
EOF

echo "📋 Server deployment commands saved to /tmp/server_commands.sh"
echo "You can copy and run these commands on the server after SSH connection"
