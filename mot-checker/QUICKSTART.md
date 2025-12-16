# MOT Checker - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Get API Keys

**DVLA API Key (Required)**
1. Visit: https://documentation.history.mot.api.gov.uk/mot-history-api/register
2. Fill out the registration form
3. You'll receive your API key via email
4. This is **FREE** for personal/non-commercial use

**Generate API Secret (Required)**
Run this command to generate a secure key:
```bash
openssl rand -hex 32
```
Or use any random string generator (32+ characters recommended)

### Step 2: Configure Environment

```bash
cd mot-checker
cp .env.example .env
nano .env  # or use any text editor
```

Fill in your keys:
```env
DVLA_API_KEY=your_dvla_key_from_email
API_SECRET_KEY=the_random_key_you_generated
ALLOWED_ORIGINS=https://mot.projectnetworks.co.uk
```

### Step 3: Update Frontend API Key

Edit `frontend/app.js` line 3-4:
```javascript
const CONFIG = {
  apiUrl: '/api',
  apiKey: 'the_random_key_you_generated'  // Same as API_SECRET_KEY above
};
```

### Step 4: Deploy

**Option A: Docker Compose (Local Testing)**
```bash
docker-compose up -d
```
Access at: http://localhost:8080

**Option B: Portainer (Production)**
1. Open Portainer
2. Stacks → Add Stack
3. Name: `mot-checker`
4. Paste `docker-compose.yml` content
5. Add the 3 environment variables
6. Deploy!

### Step 5: Configure Domain (Production Only)

**DNS:**
Point `mot.projectnetworks.co.uk` to your server IP

**Reverse Proxy:**
Configure your nginx/Traefik to forward to port 8080

**SSL:**
```bash
sudo certbot --nginx -d mot.projectnetworks.co.uk
```

## ✅ Verification

Test these URLs:
- Frontend: http://localhost:8080 or https://mot.projectnetworks.co.uk
- API Health: http://localhost:8080/api/health
- Test lookup with a real UK registration

## 🔧 Common Issues

**"Invalid API key"**
→ Ensure API_SECRET_KEY matches in both `.env` and `frontend/app.js`

**"DVLA API access denied"**
→ Verify your DVLA API key is correct and active

**"Cannot connect"**
→ Check containers are running: `docker-compose ps`

**"Rate limit exceeded"**
→ Wait 1 minute, rate limit is 10 requests/minute

## 📊 Testing

Try these UK registrations (examples):
- `AB12CDE` - Standard format
- `BD51SMR` - Older format

## 🎯 Next Steps

1. **Brand the frontend**: Add your logo/favicon
2. **Monitor logs**: `docker-compose logs -f`
3. **Set up alerts**: Configure monitoring for downtime
4. **Backup config**: Save your `.env` file securely
5. **Update costs**: Edit `backend/repair_costs.py` with current prices

## 📚 Full Documentation

- Complete setup: `README.md`
- Portainer guide: `PORTAINER-DEPLOYMENT.md`
- API docs: Access backend and visit `/docs` (disabled in production)

## 💬 Support

Questions? Contact via https://benfoggon.com

**Enjoy your MOT Checker! 🚗**
