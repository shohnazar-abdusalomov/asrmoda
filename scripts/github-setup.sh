#!/bin/bash
set -e

echo "=== AsrModa Deployment Setup ==="

# Check if gh is authenticated
if ! gh auth status &>/dev/null; then
    echo "Authenticating with GitHub..."
    gh auth login
fi

# Initialize git if needed
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: AsrModa platform"
fi

# Get repository name
read -p "Enter GitHub repository name (default: asrmoda): " REPO_NAME
REPO_NAME=${REPO_NAME:-asrmoda}

# Create GitHub repository
echo "Creating GitHub repository..."
gh repo create $REPO_NAME --private --source=. --remote=origin --push || echo "Repository might already exist"

# Get EC2 details
read -p "Enter EC2 IP address: " EC2_IP
read -p "Enter EC2 SSH key path (e.g., ~/key.pem): " KEY_PATH
read -p "Enter EC2 user (default: ubuntu): " EC2_USER
EC2_USER=${EC2_USER:-ubuntu}

# Set GitHub secrets
echo "Setting GitHub secrets..."
gh secret set EC2_SSH_KEY < "$KEY_PATH"
gh secret set EC2_HOST -b "$EC2_IP"
gh secret set EC2_USER -b "$EC2_USER"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy setup script to EC2:"
echo "   scp -i $KEY_PATH scripts/setup-ec2.sh $EC2_USER@$EC2_IP:~"
echo ""
echo "2. SSH into EC2 and run setup:"
echo "   ssh -i $KEY_PATH $EC2_USER@$EC2_IP"
echo "   chmod +x setup-ec2.sh"
echo "   ./setup-ec2.sh"
echo ""
echo "3. Configure .env on EC2 with production values"
echo ""
echo "4. Push changes to deploy:"
echo "   git push origin main"
