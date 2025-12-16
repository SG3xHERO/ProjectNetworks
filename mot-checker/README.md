# MOT Checker

A comprehensive vehicle MOT history checker with intelligent valuation analysis. Built for Project Networks UK.

## Features

- 🔍 **MOT History Lookup** - Complete vehicle MOT test history from official DVLA records
- 💰 **Smart Valuation** - AI-powered vehicle valuation based on MOT history
- 🔧 **Repair Cost Estimates** - Average repair costs for common MOT failures
- 📊 **Risk Assessment** - Detailed risk analysis for used car purchases
- 🔒 **Secure API** - Rate-limited, authenticated API with DVLA integration
- 🎨 **Modern UI** - Matches Project Networks design theme with animations
- 🐳 **Docker Ready** - Fully containerized for easy deployment

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: FastAPI (Python)
- **Web Server**: Nginx
- **Containerization**: Docker & Docker Compose
- **Data Source**: DVLA MOT History API

## Prerequisites

- Docker and Docker Compose
- DVLA MOT History API key ([Get one here](https://documentation.history.mot.api.gov.uk/mot-history-api/register))
- Portainer (optional, for deployment)

## Quick Start

### 1. Clone and Setup

```bash
cd mot-checker
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your credentials:

```env
DVLA_API_KEY=your_dvla_api_key_here
API_SECRET_KEY=your_secure_random_api_key_here
ALLOWED_ORIGINS=https://mot.projectnetworks.co.uk
```

**Important**: 
- Get your DVLA API key from: https://documentation.history.mot.api.gov.uk/mot-history-api/register
- Generate a secure API key: `openssl rand -hex 32`

### 3. Build and Run with Docker Compose

```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api

### 4. Configure Frontend API Key

Edit `frontend/app.js` and update the API key:

```javascript
const CONFIG = {
  apiUrl: '/api',
  apiKey: 'your_secure_random_api_key_here' // Same as API_SECRET_KEY in .env
};
```

## Deployment to Portainer

### Method 1: Using Portainer Stacks

1. Log in to Portainer
2. Navigate to **Stacks** > **Add Stack**
3. Name it: `mot-checker`
4. Copy the contents of `docker-compose.yml`
5. Add environment variables in the **Environment variables** section:
   - `DVLA_API_KEY`
   - `API_SECRET_KEY`
   - `ALLOWED_ORIGINS`
6. Click **Deploy the stack**

### Method 2: Using Git Repository

1. In Portainer, go to **Stacks** > **Add Stack**
2. Select **Git Repository**
3. Repository URL: Your git repo URL
4. Repository reference: `main`
5. Compose path: `mot-checker/docker-compose.yml`
6. Add environment variables
7. Click **Deploy the stack**

### Setting up Reverse Proxy (Recommended)

If you're using nginx or Traefik as a reverse proxy, configure it to route `mot.projectnetworks.co.uk` to your container.

**Example nginx configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name mot.projectnetworks.co.uk;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Project Structure

```
mot-checker/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── repair_costs.py      # Repair cost database
│   ├── valuation_engine.py  # Valuation algorithm
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── .env.example        # Backend environment template
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── style.css           # Project Networks theme CSS
│   └── app.js              # Frontend application logic
├── nginx/
│   ├── Dockerfile          # Nginx container
│   └── nginx.conf          # Nginx configuration
├── docker-compose.yml      # Docker Compose configuration
├── .env.example           # Environment template
└── README.md              # This file
```

## API Endpoints

### Backend API

- `GET /` - API information
- `GET /health` - Health check
- `POST /api/mot/lookup` - Look up MOT history
  - Body: `{"registration": "AB12CDE"}`
  - Headers: `X-API-Key: your_api_key`
- `POST /api/mot/valuation` - Calculate valuation
  - Body: `{"registration": "AB12CDE", "asking_price": 5000}`
  - Headers: `X-API-Key: your_api_key`
- `GET /api/repair-costs` - Get repair cost database
  - Headers: `X-API-Key: your_api_key`

## Security Features

- ✅ Rate limiting (10 requests per minute per IP)
- ✅ API key authentication
- ✅ CORS protection
- ✅ Input validation
- ✅ Secure headers
- ✅ No exposed API keys in frontend
- ✅ DVLA API key never exposed to client

## How It Works

### 1. MOT History Lookup
- User enters vehicle registration
- Frontend sends request to backend API with authentication
- Backend fetches data from DVLA API securely
- Results displayed with full MOT test history

### 2. Valuation Analysis
The valuation algorithm considers:
- **MOT History** (25%) - Pass/fail rate over time
- **Recent Failures** (30%) - Issues in last 3 tests
- **Dangerous Defects** (20%) - Safety-critical issues
- **Mileage Consistency** (15%) - Odometer accuracy
- **Age Factor** (10%) - Vehicle age and test frequency

### 3. Repair Cost Estimation
- Pattern matching against comprehensive repair database
- Costs based on UK market averages (updated 16/12/2025)
- Min/max/average estimates provided
- Includes 15+ categories of common repairs

### 4. Purchase Recommendation
Based on overall score:
- **80-100**: Highly Recommended ✅
- **70-79**: Recommended ✅
- **60-69**: Acceptable with Caution ⚠️
- **40-59**: Risky Purchase ⚠️
- **0-39**: Not Recommended ❌

## Maintenance

### Updating Repair Costs

Edit `backend/repair_costs.py` to update the `REPAIR_COSTS` dictionary with current market prices.

### Monitoring

Check logs:
```bash
docker-compose logs -f
```

Check health:
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/health
```

### Rebuilding

After code changes:
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

## Important Disclaimers

⚠️ **Data Accuracy**: MOT data is sourced from official DVLA records but should not be the sole basis for purchasing decisions.

⚠️ **Repair Costs**: Cost estimates are averages and can vary significantly by:
- Geographic location
- Vehicle make/model
- Parts availability
- Labor rates
- Garage selection

⚠️ **Professional Inspection**: Always get a professional mechanic inspection before purchasing a used vehicle.

⚠️ **Last Updated**: Repair cost data last updated 16/12/2025

## Troubleshooting

### DVLA API Key Issues
- Ensure your API key is valid and active
- Check you haven't exceeded rate limits
- Verify the key has correct permissions

### Container Issues
```bash
# View logs
docker-compose logs backend
docker-compose logs nginx

# Restart containers
docker-compose restart

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### API Key Authentication Failures
- Ensure `API_SECRET_KEY` matches between `.env` and `frontend/app.js`
- Check CORS settings allow your domain
- Verify headers are being sent correctly

## Contributing

This is part of Project Networks. For questions or contributions, contact:
- Website: https://projectnetworks.co.uk
- Contact: https://benfoggon.com

## License

© 2024 Project Networks. All rights reserved.

Built by [Ben Foggon](https://benfoggon.com)

---

## Support

For issues or questions:
1. Check this README
2. Review Docker logs
3. Verify environment variables
4. Contact via [benfoggon.com](https://benfoggon.com)
