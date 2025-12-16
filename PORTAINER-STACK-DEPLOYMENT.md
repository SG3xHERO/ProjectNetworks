# Portainer Stack Deployment Guide

This guide covers deploying the **complete Project Networks stack** (main site + MOT checker) via Portainer.

## Quick Deploy

### 1. In Portainer

1. Navigate to **Stacks** → **Add Stack**
2. Name: `projectnetworks-stack`
3. Build method: **Repository**
4. Repository URL: `https://github.com/SG3xHERO/ProjectNetworks`
5. Repository reference: `refs/heads/main`
6. Compose path: `docker-compose.yml`

### 2. Environment Variables

Add these environment variables in Portainer:

```env
DVLA_CLIENT_ID=e9dd0fe3-3fb5-4add-964a-c1d1950f3ccb
DVLA_CLIENT_SECRET=your_actual_client_secret
DVLA_API_KEY=your_actual_api_key
DVLA_SCOPE_URL=https://tapi.dvsa.gov.uk/.default
DVLA_TOKEN_URL=https://login.microsoftonline.com/a455b827-244f-4c97-b5b4-ce5d13b4d00c/oauth2/v2.0/token
API_SECRET_KEY=generate_a_32_character_random_string_here
ALLOWED_ORIGINS=https://mot.projectnetworks.co.uk,https://projectnetworks.co.uk
```

### 3. Deploy

Click **Deploy the stack**

## Services Deployed

The stack will create 3 services:

1. **projectnetworks-site** - Main website (port 8083)
2. **mot-checker-backend** - MOT checker API (internal)
3. **mot-checker-nginx** - MOT checker frontend (port 8080)

## Port Mappings

- **8083** → Main Project Networks site
- **8080** → MOT Checker application

## Accessing Applications

### Via Reverse Proxy (Recommended)

If using nginx or Traefik as a reverse proxy:

**Main Site:**
```nginx
server {
    listen 80;
    server_name projectnetworks.co.uk www.projectnetworks.co.uk;
    
    location / {
        proxy_pass http://localhost:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**MOT Checker:**
```nginx
server {
    listen 80;
    server_name mot.projectnetworks.co.uk;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Via Traefik Labels (Alternative)

If using Traefik, you can add these labels to docker-compose.yml:

```yaml
services:
  projectnetworks-site:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.main-site.rule=Host(`projectnetworks.co.uk`)"
      - "traefik.http.routers.main-site.entrypoints=websecure"
      - "traefik.http.routers.main-site.tls.certresolver=letsencrypt"
      
  mot-checker-nginx:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.mot-checker.rule=Host(`mot.projectnetworks.co.uk`)"
      - "traefik.http.routers.mot-checker.entrypoints=websecure"
      - "traefik.http.routers.mot-checker.tls.certresolver=letsencrypt"
```

## Troubleshooting

### Stack only deploys projectnetworks-site

**Problem:** Only the main site service is created, MOT checker services are missing.

**Solution:**
1. Ensure the updated `docker-compose.yml` is committed to your repository
2. In Portainer, delete the old stack completely
3. Redeploy using the repository method
4. Verify all environment variables are set

### Services fail to build

**Problem:** Build errors in Portainer logs.

**Check:**
1. Repository URL is correct and accessible
2. Branch name is `main` (or your default branch)
3. Compose path is exactly `docker-compose.yml`
4. Build context paths in docker-compose.yml are correct

### Cannot access services

**Problem:** Services are running but not accessible.

**Check:**
1. Port 8083 and 8080 are not blocked by firewall
2. Services are healthy: `docker ps` should show "healthy" status
3. Check logs: Portainer → Containers → View logs
4. Verify reverse proxy configuration if using one

## Health Checks

Both services have health checks configured:

- **Backend**: Checks `/health` endpoint every 30s
- **Frontend**: Checks nginx every 30s

View health status: `docker ps` or in Portainer container list.

## Updating the Stack

1. Push changes to your repository
2. In Portainer: Stacks → projectnetworks-stack → **Pull and redeploy**
3. Check "Re-pull image and redeploy"
4. Click **Update the stack**

## Logs

View logs in Portainer:
- Stacks → projectnetworks-stack → Container list
- Click on container name → Logs

Or via CLI:
```bash
docker logs projectnetworks-site
docker logs mot-checker-backend
docker logs mot-checker-nginx
```

## Security Notes

1. **Never commit .env file** - It's in .gitignore
2. **Use Portainer's environment variables** - More secure than .env in repository
3. **Rotate API keys regularly** - Update in Portainer environment variables
4. **Enable HTTPS** - Use Let's Encrypt with reverse proxy
5. **Keep secrets in Portainer** - Use Portainer's built-in secrets management

## Network Architecture

```
Internet
    ↓
[Reverse Proxy - nginx/Traefik]
    ↓
    ├─→ :8083 → projectnetworks-site
    └─→ :8080 → mot-checker-nginx → mot-checker-backend:8000
```

All services communicate on the `web` bridge network.
