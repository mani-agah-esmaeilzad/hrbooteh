# 🚀 Deployment Guide for hrbooteh.com

This guide will help you deploy the MBTI/Independence Assessment Platform to your server using Docker.

## 📋 Prerequisites

- Docker and Docker Compose installed on your server
- Domain `hrbooteh.com` pointing to your server's IP address
- SSL certificates for your domain
- Google AI API key

## 🔧 Quick Setup

1. **Upload files to your server:**
   ```bash
   scp -r . user@your-server:/path/to/hrbooteh/
   ```

2. **Set up SSL certificates:**
   ```bash
   mkdir ssl/
   # Add your SSL certificates:
   # ssl/hrbooteh.com.crt
   # ssl/hrbooteh.com.key
   ```

3. **Configure environment variables:**
   ```bash
   # Edit .env.production and add your Google AI API key
   nano .env.production
   ```

4. **Deploy:**
   ```bash
   ./deploy.sh
   ```

## 📁 File Structure

```
├── Dockerfile              # Next.js application container
├── docker-compose.yml      # Multi-container orchestration
├── nginx.conf              # Nginx reverse proxy configuration
├── .env.production         # Production environment variables
├── deploy.sh               # Deployment script
└── ssl/                    # SSL certificates directory
    ├── hrbooteh.com.crt
    └── hrbooteh.com.key
```

## 🌐 Services

### Application (Port 3000)
- Next.js 14 application with MBTI and Independence assessments
- Persian language interface
- AI-powered personality analysis

### Database (Port 3306)
- MySQL 8.0 with persistent data storage
- Automatic schema initialization
- User authentication and assessment data

### Nginx (Ports 80/443)
- SSL termination and HTTPS redirect
- Static file caching
- API rate limiting
- Security headers

## 🔐 Security Features

- **SSL/TLS encryption** with modern cipher suites
- **Rate limiting** on API endpoints (10 requests/second)
- **Security headers** (XSS protection, CSRF, etc.)
- **Non-root user** in application container
- **Environment variable isolation**

## 📊 Monitoring & Maintenance

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mysql
docker-compose logs -f nginx
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Update Application
```bash
# Pull latest changes and rebuild
git pull
./deploy.sh
```

### Database Backup
```bash
# Create backup
docker-compose exec mysql mysqldump -u hrbooteh_user -phrbooteh_secure_password_2024 hrbooteh_db > backup.sql

# Restore backup
docker-compose exec -i mysql mysql -u hrbooteh_user -phrbooteh_secure_password_2024 hrbooteh_db < backup.sql
```

## 🔧 Troubleshooting

### Application Not Starting
```bash
# Check application logs
docker-compose logs app

# Common issues:
# - Missing Google API key
# - Database connection failed
# - Port conflicts
```

### Database Connection Issues
```bash
# Test database connection
docker-compose exec mysql mysql -u hrbooteh_user -phrbooteh_secure_password_2024 hrbooteh_db

# Reset database
docker-compose down
docker volume rm arta-persia-conversations-insight_mysql_data
docker-compose up -d
```

### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/hrbooteh.com.crt -text -noout

# Test SSL connection
openssl s_client -connect hrbooteh.com:443
```

### Performance Optimization
```bash
# Monitor resource usage
docker stats

# Clean up unused resources
docker system prune -f
```

## 🌟 Features Available

### MBTI Personality Test
- 12 comprehensive questions covering all 4 MBTI dimensions
- AI-powered response analysis
- Detailed personality reports with strengths and career suggestions
- Available at: `https://hrbooteh.com/mbti`

### Independence Assessment
- 6-dimension evaluation system
- Scenario-based chat interactions
- Detailed scoring and analysis
- Available at: `https://hrbooteh.com/independence`

### User Management
- Secure registration and login
- JWT-based authentication
- Personal assessment history

## 📞 Support

For technical support or questions about deployment:
1. Check the logs first: `docker-compose logs -f`
2. Verify all environment variables are set correctly
3. Ensure domain DNS is pointing to your server
4. Check firewall settings for ports 80 and 443

## 🔄 Updates

To update the application:
1. Pull the latest code changes
2. Run `./deploy.sh` to rebuild and restart containers
3. The deployment script will handle database migrations automatically

---

**🎯 Your MBTI and Independence Assessment Platform is now ready at https://hrbooteh.com!**
