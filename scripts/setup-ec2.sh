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

# Clone repository will be done by GitHub Actions on first deploy
mkdir -p ~/asrmoda

echo "Setup complete!"
echo "Next: Push code to GitHub to trigger deployment"

echo "Setup complete. Configure GitHub secrets and setup SSL with:"
echo "sudo certbot --nginx -d yourdomain.com"
