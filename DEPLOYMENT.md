# Deployment Guide for Digital Ocean

## Prerequisites

1. Digital Ocean Droplet (2GB RAM minimum)
2. Docker and Docker Compose installed on the server
3. Git repository with GitHub Actions configured
4. MySQL database (can be on same server or separate)

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group (replace $USER with your username)
sudo usermod -aG docker $USER

# Logout and login again for group changes to take effect
```

### 2. Application Directory Setup

```bash
# Create application directory
sudo mkdir -p /var/www/nouella
sudo chown $USER:$USER /var/www/nouella
cd /var/www/nouella

# Clone repository
git clone https://github.com/kaytee124/Nouella.git .

# Create uploads directory
mkdir -p uploads/products
chmod -R 755 uploads
```

### 3. Environment Variables

Create `.env` file in `/var/www/nouella`:

```env
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=nouella
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# Payment Gateway
APP_ID=your-app-id
APP_KEY=your-app-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

- `DO_HOST`: Your Digital Ocean droplet IP or domain
- `DO_USERNAME`: SSH username (usually `root` or your user)
- `DO_SSH_KEY`: Your private SSH key
- `DO_PORT`: SSH port (usually `22`)
- `DO_APP_PATH`: Application path (e.g., `/var/www/nouella`)
- `DOCKER_USERNAME`: (Optional) Docker Hub username
- `DOCKER_PASSWORD`: (Optional) Docker Hub password

### 5. Manual Deployment (First Time)

```bash
cd /var/www/nouella

# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health
curl http://localhost:3000/health
```

### 6. Automated Deployment

After configuring GitHub Actions secrets, every push to `main` or `master` branch will automatically:
1. Run tests
2. Build Docker image
3. Deploy to Digital Ocean server

## Monitoring

### Check Container Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

### Check Resource Usage
```bash
docker stats nouella-app
```

### Restart Application
```bash
docker-compose -f docker-compose.prod.yml restart app
```

## Optimization for 2GB RAM Server

The Dockerfile and docker-compose are optimized for a 2GB RAM server:

- **Node.js memory limit**: 1.5GB (reserves 512MB for system)
- **Container memory limit**: 1.5GB
- **Container memory reservation**: 512MB
- **CPU limit**: 1.0 core
- **CPU reservation**: 0.5 core

## Troubleshooting

### Out of Memory Issues
```bash
# Check memory usage
free -h
docker stats

# Clean up Docker resources
docker system prune -a -f
```

### Database Connection Issues
- Verify database credentials in `.env`
- Check if database is accessible from server
- Verify firewall rules allow MySQL connections

### Application Not Starting
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs app

# Check if container is running
docker ps -a

# Restart container
docker-compose -f docker-compose.prod.yml restart app
```

## Security Recommendations

1. **Firewall Configuration**
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Use Nginx Reverse Proxy** (Recommended)
   - Install Nginx on the server
   - Configure SSL with Let's Encrypt
   - Proxy requests to `http://localhost:3000`

3. **Database Security**
   - Use strong passwords
   - Restrict database access to application server only
   - Regular backups

4. **Environment Variables**
   - Never commit `.env` file
   - Use strong JWT secrets
   - Rotate secrets regularly

## Backup Strategy

### Database Backup
```bash
# Create backup script
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d).sql
```

### Uploads Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

## Scaling Considerations

When the project grows:
1. Upgrade server RAM (4GB, 8GB)
2. Use separate database server
3. Implement load balancing
4. Use CDN for static files
5. Consider container orchestration (Kubernetes)

