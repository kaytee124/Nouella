#!/bin/bash

# Deployment script for Digital Ocean
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create a .env file with your configuration."
    echo "Example:"
    echo "NODE_ENV=production"
    echo "PORT=3000"
    echo "DB_HOST=host.docker.internal"
    echo "DB_PORT=3306"
    echo "DB_NAME=nouella"
    echo "DB_USER=nouella_user"
    echo "DB_PASSWORD=your_password"
    echo "JWT_SECRET=your_jwt_secret"
    exit 1
fi

# Check if docker-compose.prod.yml exists
if [ ! -f docker-compose.prod.yml ]; then
    echo -e "${YELLOW}⚠️  docker-compose.prod.yml not found, using docker-compose.yml${NC}"
    COMPOSE_FILE="docker-compose.yml"
else
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo -e "${YELLOW}Using compose file: $COMPOSE_FILE${NC}"

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main || git pull origin master

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f $COMPOSE_FILE down || true

# Clean up old images (keep last 2)
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

# Build new image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker-compose -f $COMPOSE_FILE build --no-cache

# Start containers
echo -e "${YELLOW}▶️  Starting containers...${NC}"
docker-compose -f $COMPOSE_FILE up -d

# Wait for health check
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 20

# Health check
echo -e "${YELLOW}🏥 Checking application health...${NC}"
HEALTH_CHECK_PASSED=false
for i in {1..10}; do
    if curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        HEALTH_CHECK_PASSED=true
        break
    else
        echo -e "${YELLOW}⏳ Waiting for health check... ($i/10)${NC}"
        sleep 10
    fi
done

if [ "$HEALTH_CHECK_PASSED" = false ]; then
    echo -e "${RED}❌ Health check failed after 10 attempts${NC}"
    echo -e "${YELLOW}📋 Checking container logs...${NC}"
    docker-compose -f $COMPOSE_FILE logs app --tail=50
    exit 1
fi

# Show container status
echo -e "${YELLOW}📊 Container status:${NC}"
docker-compose -f $COMPOSE_FILE ps

# Clean up unused resources
echo -e "${YELLOW}🧹 Cleaning up unused Docker resources...${NC}"
docker system prune -f

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"