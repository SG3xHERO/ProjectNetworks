"""
MOT Checker Backend API
Secure FastAPI application for checking MOT history via DVLA API
"""

from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import httpx
import os
import hashlib
import time
from collections import defaultdict
import re
import json

app = FastAPI(
    title="MOT Checker API",
    description="Secure API for MOT history checking and vehicle valuation",
    version="1.0.0",
    docs_url=None,  # Disable docs in production
    redoc_url=None
)

# Environment variables - DVLA OAuth2 Configuration
DVLA_CLIENT_ID = os.getenv("DVLA_CLIENT_ID", "")
DVLA_CLIENT_SECRET = os.getenv("DVLA_CLIENT_SECRET", "")
DVLA_API_KEY = os.getenv("DVLA_API_KEY", "")
DVLA_SCOPE_URL = os.getenv("DVLA_SCOPE_URL", "https://tapi.dvsa.gov.uk/.default")
DVLA_TOKEN_URL = os.getenv("DVLA_TOKEN_URL", "https://login.microsoftonline.com/a455b827-244f-4c97-b5b4-ce5d13b4d00c/oauth2/v2.0/token")
DVLA_API_URL = "https://history.mot.api.gov.uk/v1/trade/vehicles/registration"

API_SECRET_KEY = os.getenv("API_SECRET_KEY", "")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://mot.projectnetworks.co.uk").split(",")

# Token cache
token_cache = {
    "access_token": None,
    "expires_at": None
}

# Rate limiting storage (in production, use Redis)
rate_limit_storage = defaultdict(list)
RATE_LIMIT_REQUESTS = 10  # requests per minute
RATE_LIMIT_WINDOW = 60  # seconds

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Only allow your domains
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["mot.projectnetworks.co.uk", "api.projectnetworks.co.uk", "localhost", "127.0.0.1", "192.168.1.3"]
)


class MOTRequest(BaseModel):
    """Request model for MOT lookup"""
    registration: str = Field(..., min_length=2, max_length=8)
    
    @validator('registration')
    def validate_registration(cls, v):
        # Remove spaces and convert to uppercase
        v = v.replace(" ", "").upper()
        # Basic UK registration validation
        if not re.match(r'^[A-Z0-9]{2,8}$', v):
            raise ValueError('Invalid UK registration format')
        return v


class ValuationRequest(BaseModel):
    """Request model for vehicle valuation"""
    registration: str
    asking_price: float = Field(..., gt=0)


class RFYItem(BaseModel):
    """Reasons for rejection item"""
    type: str
    text: str
    dangerous: bool


class MOTTest(BaseModel):
    """Individual MOT test result"""
    completed_date: str
    test_result: str
    expiry_date: Optional[str]
    odometer_value: Optional[int]
    odometer_unit: Optional[str]
    mot_test_number: str
    rfrAndComments: Optional[List[RFYItem]] = []


def rate_limit_check(client_id: str) -> bool:
    """Check if client has exceeded rate limit"""
    current_time = time.time()
    
    # Clean old entries
    rate_limit_storage[client_id] = [
        timestamp for timestamp in rate_limit_storage[client_id]
        if current_time - timestamp < RATE_LIMIT_WINDOW
    ]
    
    # Check limit
    if len(rate_limit_storage[client_id]) >= RATE_LIMIT_REQUESTS:
        return False
    
    # Add current request
    rate_limit_storage[client_id].append(current_time)
    return True


def get_client_id(request: Request) -> str:
    """Generate client identifier from request"""
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    return hashlib.sha256(f"{client_ip}{user_agent}".encode()).hexdigest()


async def get_dvla_access_token() -> str:
    """Get OAuth2 access token for DVLA API"""
    # Check if we have a valid cached token
    if token_cache["access_token"] and token_cache["expires_at"]:
        if datetime.utcnow() < token_cache["expires_at"]:
            return token_cache["access_token"]
    
    # Request new token
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                DVLA_TOKEN_URL,
                data={
                    "client_id": DVLA_CLIENT_ID,
                    "client_secret": DVLA_CLIENT_SECRET,
                    "scope": DVLA_SCOPE_URL,
                    "grant_type": "client_credentials"
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout=10.0
            )
            
            response.raise_for_status()
            token_data = response.json()
            
            # Cache the token (expires_in is in seconds)
            token_cache["access_token"] = token_data["access_token"]
            # Set expiry 5 minutes before actual expiry for safety
            expires_in = token_data.get("expires_in", 3600) - 300
            token_cache["expires_at"] = datetime.utcnow() + timedelta(seconds=expires_in)
            
            return token_data["access_token"]
            
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to get DVLA access token: {str(e)}")


async def verify_api_key(x_api_key: str = Header(...)):
    """Verify API key from header"""
    if not API_SECRET_KEY:
        raise HTTPException(status_code=500, detail="API not configured")
    
    if x_api_key != API_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    
    return x_api_key


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    # Skip rate limiting for health check
    if request.url.path == "/health":
        return await call_next(request)
    
    client_id = get_client_id(request)
    
    if not rate_limit_check(client_id):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Please try again later."}
        )
    
    response = await call_next(request)
    return response


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "MOT Checker API",
        "status": "operational",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "dvla_configured": bool(DVLA_CLIENT_ID and DVLA_CLIENT_SECRET and DVLA_API_KEY)
    }


@app.post("/api/mot/lookup")
async def lookup_mot(
    mot_request: MOTRequest,
    request: Request
):
    """
    Look up MOT history for a vehicle
    """
    if not DVLA_CLIENT_ID or not DVLA_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="DVLA API not configured")
    
    try:
        # Get OAuth2 access token
        access_token = await get_dvla_access_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{DVLA_API_URL}/{mot_request.registration}",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "X-API-Key": DVLA_API_KEY,
                    "Accept": "application/json"
                },
                timeout=10.0
            )
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Vehicle not found")
            
            if response.status_code == 403:
                raise HTTPException(status_code=403, detail="DVLA API access denied")
            
            response.raise_for_status()
            mot_data = response.json()
            
            # Process and enrich the data
            return {
                "registration": mot_request.registration,
                "data": mot_data,
                "processed_at": datetime.utcnow().isoformat(),
                "last_updated": "2025-12-16"
            }
            
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching MOT data: {str(e)}")


@app.post("/api/mot/valuation")
async def calculate_valuation(
    valuation_request: ValuationRequest,
    request: Request
):
    """
    Calculate vehicle valuation based on MOT history
    Returns assessment of whether the asking price is reasonable
    """
    # First get MOT data
    mot_request = MOTRequest(registration=valuation_request.registration)
    
    try:
        # Get OAuth2 access token
        access_token = await get_dvla_access_token()
        
        # Get MOT history
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{DVLA_API_URL}/{valuation_request.registration}",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "X-API-Key": DVLA_API_KEY,
                    "Accept": "application/json"
                },
                timeout=10.0
            )
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Vehicle not found")
            
            response.raise_for_status()
            mot_data = response.json()
        
        # Calculate valuation metrics
        from valuation_engine import ValuationEngine
        engine = ValuationEngine()
        valuation_result = engine.calculate_valuation(
            mot_data,
            valuation_request.asking_price
        )
        
        return {
            "registration": valuation_request.registration,
            "asking_price": valuation_request.asking_price,
            "valuation": valuation_result,
            "processed_at": datetime.utcnow().isoformat(),
            "last_updated": "2025-12-16"
        }
        
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error calculating valuation: {str(e)}")


@app.get("/api/repair-costs")
async def get_repair_costs():
    """
    Get average repair costs for common MOT failures
    """
    from repair_costs import get_all_repair_costs
    
    costs = get_all_repair_costs()
    return {
        "repair_costs": costs,
        "last_updated": "2025-12-16",
        "currency": "GBP",
        "disclaimer": "Prices are estimates and may vary by location and vehicle type"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
