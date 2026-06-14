# Deployment Setup

## 1. Authenticate with GitHub

```bash
gh auth login
```

## 2. Configure AWS credentials

```bash
aws configure
```

## 3. Launch EC2 instance

- Ubuntu 22.04 LTS
- t3.medium or larger
- Open ports: 22, 80, 443
- Create/download SSH key pair

## 4. Initial EC2 setup

```bash
# Copy setup script to EC2
scp -i your-key.pem scripts/setup-ec2.sh ubuntu@YOUR_EC2_IP:~

# SSH into EC2 and run setup
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
chmod +x setup-ec2.sh
./setup-ec2.sh
```

## 5. Initialize git repository

```bash
git init
git add .
git commit -m "Initial commit"
```

## 6. Create GitHub repository

```bash
gh repo create asrmoda --private --source=. --remote=origin --push
```

## 7. Configure GitHub secrets

```bash
# Get your EC2 SSH key content
cat your-key.pem

# Set secrets
gh secret set EC2_SSH_KEY < your-key.pem
gh secret set EC2_HOST -b "YOUR_EC2_IP"
gh secret set EC2_USER -b "ubuntu"
```

## 8. Deploy

Push to main branch to trigger deployment:

```bash
git push origin main
```

## 9. Setup SSL (after domain is configured)

SSH into EC2:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 10. Update nginx.conf for SSL

After certbot, update nginx.conf to redirect HTTP to HTTPS and configure SSL certificates.
