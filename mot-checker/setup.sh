#!/bin/bash
# MOT Checker Setup Script
# This script helps you set up the MOT Checker application

set -e

echo "=========================================="
echo "  MOT Checker - Setup Assistant"
echo "  Project Networks"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Check for .env file
if [ -f .env ]; then
    echo "⚠️  Warning: .env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping .env creation"
        ENV_EXISTS=true
    fi
fi

if [ -z "$ENV_EXISTS" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # Generate API secret key
    API_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "GENERATE_YOUR_OWN_KEY_HERE")
    
    echo ""
    echo "=========================================="
    echo "  Configuration Required"
    echo "=========================================="
    echo ""
    echo "1. DVLA API Key"
    echo "   Get yours at: https://documentation.history.mot.api.gov.uk/mot-history-api/register"
    echo ""
    read -p "Enter your DVLA API Key: " DVLA_KEY
    
    echo ""
    echo "2. API Secret Key"
    echo "   Generated: $API_SECRET"
    echo ""
    read -p "Use this generated key? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        read -p "Enter your own API Secret Key: " API_SECRET
    fi
    
    echo ""
    echo "3. Allowed Origins"
    echo "   Current: https://mot.projectnetworks.co.uk"
    echo ""
    read -p "Enter domain (or press Enter to keep default): " DOMAIN
    if [ -z "$DOMAIN" ]; then
        DOMAIN="https://mot.projectnetworks.co.uk"
    fi
    
    # Update .env file
    sed -i.bak "s|your_dvla_api_key_here|$DVLA_KEY|g" .env
    sed -i.bak "s|your_secure_random_key_here|$API_SECRET|g" .env
    sed -i.bak "s|https://mot.projectnetworks.co.uk|$DOMAIN|g" .env
    rm .env.bak
    
    echo ""
    echo "✅ .env file created"
fi

# Update frontend API key
echo ""
echo "=========================================="
echo "  Updating Frontend Configuration"
echo "=========================================="
echo ""

if [ -f frontend/app.js ]; then
    # Read API key from .env
    API_KEY=$(grep API_SECRET_KEY .env | cut -d '=' -f2)
    
    # Update app.js
    sed -i.bak "s|apiKey: '.*'|apiKey: '$API_KEY'|g" frontend/app.js
    rm frontend/app.js.bak
    
    echo "✅ Frontend API key updated"
else
    echo "⚠️  Warning: frontend/app.js not found"
fi

echo ""
echo "=========================================="
echo "  Building Docker Containers"
echo "=========================================="
echo ""

echo "Building images... (this may take a few minutes)"
docker-compose build

echo ""
echo "=========================================="
echo "  Starting Services"
echo "=========================================="
echo ""

docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "=========================================="
    echo "  ✅ Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Your MOT Checker is now running!"
    echo ""
    echo "Access points:"
    echo "  - Frontend: http://localhost:8080"
    echo "  - API Health: http://localhost:8080/api/health"
    echo ""
    echo "Next steps:"
    echo "  1. Open http://localhost:8080 in your browser"
    echo "  2. Try searching for a UK vehicle registration"
    echo "  3. Set up your domain and SSL (see PORTAINER-DEPLOYMENT.md)"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop: docker-compose down"
    echo "  - Restart: docker-compose restart"
    echo ""
    echo "Documentation:"
    echo "  - README.md - Complete guide"
    echo "  - QUICKSTART.md - Quick reference"
    echo "  - PORTAINER-DEPLOYMENT.md - Production deployment"
    echo ""
else
    echo ""
    echo "⚠️  Warning: Services may not have started correctly"
    echo "Check logs with: docker-compose logs"
fi

echo "=========================================="
