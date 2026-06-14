# SSL Setup with Certbot

Once you have a domain pointing to your EC2 instance (16.170.222.232), follow these steps to enable HTTPS:

## 1. Stop Docker nginx temporarily

```bash
ssh -i ~/Downloads/asrmoda.pem ubuntu@16.170.222.232
cd ~/asrmoda
docker compose -f compose.prod.yaml stop nginx
```

## 2. Run certbot

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to get your SSL certificates.

## 3. Update nginx.conf for HTTPS

Add this server block to `nginx.conf`:

```nginx
http {
    # ... existing upstream blocks ...

    # HTTP redirect to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location /api {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

## 4. Update .env CLIENT_ORIGIN

```bash
nano ~/asrmoda/.env
# Change CLIENT_ORIGIN=http://16.170.222.232 to https://yourdomain.com
```

## 5. Restart services

```bash
docker compose -f compose.prod.yaml up -d
```

## 6. Test auto-renewal

```bash
sudo certbot renew --dry-run
```

Certbot will automatically renew certificates before they expire.
