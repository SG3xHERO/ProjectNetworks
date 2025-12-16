# Portainer Stack Deployment Guide

## Option 1: Deploy via Portainer UI

1. **Navigate to Portainer**
   - Open your Portainer instance
   - Go to **Stacks** > **Add Stack**

2. **Configure Stack**
   - **Name**: `mot-checker`
   - **Build method**: Select "Web editor"
   - Paste the contents of `docker-compose.yml` into the editor

3. **Set Environment Variables**
   Click "Add environment variable" for each:
   
   | Variable | Description | Example |
   |----------|-------------|---------|
   | `DVLA_API_KEY` | Your DVLA MOT API key | `abc123def456...` |
   | `API_SECRET_KEY` | Random secure key for API auth | `generate with: openssl rand -hex 32` |
   | `ALLOWED_ORIGINS` | Allowed domains (comma-separated) | `https://mot.projectnetworks.co.uk` |

4. **Deploy**
   - Click **Deploy the stack**
   - Wait for containers to start

5. **Verify Deployment**
   - Check container logs in Portainer
   - Visit: http://your-server-ip:8080
   - Test API health: http://your-server-ip:8080/api/health

## Option 2: Deploy via Portainer API

Using curl:

```bash
curl -X POST "https://your-portainer-url/api/stacks?type=2&method=string&endpointId=1" \
  -H "X-API-Key: your-portainer-api-key" \
  -H "Content-Type: application/json" \
  -d @portainer-stack.json
```

## Option 3: Deploy from Git Repository

1. **Push to Git**
   ```bash
   cd mot-checker
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **In Portainer**
   - Go to **Stacks** > **Add Stack**
   - Select **Repository**
   - Repository URL: Your git repo URL
   - Repository reference: `main`
   - Compose path: `docker-compose.yml`
   - Add environment variables
   - Click **Deploy the stack**

## Setting up Domain and SSL

### With Traefik (Recommended)

If you're using Traefik as a reverse proxy, add these labels to `docker-compose.yml`:

```yaml
services:
  nginx:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.mot-checker.rule=Host(`mot.projectnetworks.co.uk`)"
      - "traefik.http.routers.mot-checker.entrypoints=websecure"
      - "traefik.http.routers.mot-checker.tls=true"
      - "traefik.http.routers.mot-checker.tls.certresolver=letsencrypt"
      - "traefik.http.services.mot-checker.loadbalancer.server.port=80"
```

### With Nginx Reverse Proxy

Create a new nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/mot.projectnetworks.co.uk
```

```nginx
server {
    listen 80;
    server_name mot.projectnetworks.co.uk;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mot.projectnetworks.co.uk;

    # SSL certificates (Let's Encrypt recommended)
    ssl_certificate /etc/letsencrypt/live/mot.projectnetworks.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mot.projectnetworks.co.uk/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/mot.projectnetworks.co.uk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Get SSL Certificate with Certbot

```bash
sudo certbot --nginx -d mot.projectnetworks.co.uk
```

## Post-Deployment Configuration

### 1. Update Frontend API Configuration

Before accessing the site, you need to update the frontend API key:

```bash
# Access the nginx container
docker exec -it mot-checker-nginx sh

# Edit the app.js file
vi /usr/share/nginx/html/app.js

# Or update locally and rebuild
```

Update this section in `frontend/app.js`:
```javascript
const CONFIG = {
  apiUrl: '/api',
  apiKey: 'YOUR_API_SECRET_KEY_HERE' // Same as in .env
};
```

Then rebuild:
```bash
docker-compose down
docker-compose build nginx
docker-compose up -d
```

### 2. Verify Everything Works

Test the API:
```bash
# Health check
curl http://localhost:8080/api/health

# Test MOT lookup (requires API key)
curl -X POST http://localhost:8080/api/mot/lookup \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_SECRET_KEY" \
  -d '{"registration": "AB12CDE"}'
```

## Monitoring

### View Logs in Portainer
1. Go to **Containers**
2. Click on container name
3. Click **Logs**
4. Select "Auto-refresh logs"

### Command Line Monitoring
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f nginx

# View last 100 lines
docker-compose logs --tail=100 backend
```

## Updating the Application

### Method 1: Via Portainer UI
1. Go to **Stacks**
2. Click your stack name
3. Click **Editor**
4. Make changes
5. Click **Update the stack**

### Method 2: Via Command Line
```bash
# Pull latest changes (if using git)
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Method 3: Update Single Service
```bash
# Update backend only
docker-compose up -d --build backend

# Update nginx only
docker-compose up -d --build nginx
```

## Backup and Restore

### Backup Environment Variables
```bash
cp .env .env.backup
```

### Export Stack Configuration
In Portainer:
1. Go to your stack
2. Click **Editor**
3. Copy the full configuration
4. Save to a file

### Restore
1. Create new stack in Portainer
2. Paste saved configuration
3. Add environment variables
4. Deploy

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Missing environment variables
# - Invalid DVLA API key
# - Port conflicts (8080 already in use)
```

### API Returns 403 Forbidden
- Check `API_SECRET_KEY` matches in both `.env` and `frontend/app.js`
- Verify `X-API-Key` header is being sent

### DVLA API Errors
- Verify API key is valid
- Check you haven't exceeded rate limits
- Ensure API key has correct permissions

### Cannot Access Website
- Check port 8080 is accessible
- Verify firewall rules
- Check reverse proxy configuration
- Ensure DNS points to correct server

## Performance Optimization

### Enable Nginx Caching
Already configured in `nginx.conf` with:
- Static file caching (1 year)
- API rate limiting
- Gzip compression

### Scale Backend
To run multiple backend instances:

```yaml
services:
  backend:
    deploy:
      replicas: 3
```

### Resource Limits
Add resource limits to prevent issues:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Security Best Practices

✅ **Completed:**
- API key authentication
- Rate limiting
- CORS protection
- Input validation
- Secure headers

🔒 **Additional Recommendations:**
1. Use strong, unique API keys
2. Enable HTTPS/SSL
3. Keep DVLA API key secret
4. Regular updates to dependencies
5. Monitor logs for suspicious activity
6. Use firewall to restrict access
7. Regular backups of configuration

## Support

For issues:
1. Check container logs
2. Verify environment variables
3. Review this guide
4. Contact: https://benfoggon.com

---

**Ready to deploy?** Follow Option 1 above to get started! 🚀
