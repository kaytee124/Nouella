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
    exit 1
fi

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main || git pull origin master

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Clean up old images (keep last 2)
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

# Build new image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Start containers
echo -e "${YELLOW}▶️  Starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for health check
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 15

# Health check
echo -e "${YELLOW}🏥 Checking application health...${NC}"
for i in {1..5}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for health check... ($i/5)${NC}"
        sleep 5
    fi
done

# Show container status
echo -e "${YELLOW}📊 Container status:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Clean up unused resources
echo -e "${YELLOW}🧹 Cleaning up unused Docker resources...${NC}"
docker system prune -f

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

