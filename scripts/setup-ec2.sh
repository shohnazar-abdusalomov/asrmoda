#!/bin/bash
set -e

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Clone repository
mkdir -p ~/asrmoda
cd ~/asrmoda
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Start services
docker compose -f compose.prod.yaml up -d

echo "Setup complete. Configure GitHub secrets and setup SSL with:"
echo "sudo certbot --nginx -d yourdomain.com"
