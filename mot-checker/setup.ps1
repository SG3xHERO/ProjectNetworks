# MOT Checker Setup Script for Windows PowerShell
# Run with: .\setup.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  MOT Checker - Setup Assistant" -ForegroundColor Cyan
Write-Host "  Project Networks" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
}

# Check if Docker Compose is installed
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker Compose is not installed" -ForegroundColor Red
    Write-Host "Docker Compose should come with Docker Desktop"
    exit 1
}

Write-Host "✅ Docker and Docker Compose found" -ForegroundColor Green
Write-Host ""

# Check for .env file
$envExists = $false
if (Test-Path .env) {
    Write-Host "⚠️  Warning: .env file already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Skipping .env creation"
        $envExists = $true
    }
}

if (-not $envExists) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    
    # Generate API secret key
    $apiSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  Configuration Required" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. DVLA API Key" -ForegroundColor Yellow
    Write-Host "   Get yours at: https://documentation.history.mot.api.gov.uk/mot-history-api/register"
    Write-Host ""
    $dvlaKey = Read-Host "Enter your DVLA API Key"
    
    Write-Host ""
    Write-Host "2. API Secret Key" -ForegroundColor Yellow
    Write-Host "   Generated: $apiSecret"
    Write-Host ""
    $useGenerated = Read-Host "Use this generated key? (Y/n)"
    if ($useGenerated -eq "n" -or $useGenerated -eq "N") {
        $apiSecret = Read-Host "Enter your own API Secret Key"
    }
    
    Write-Host ""
    Write-Host "3. Allowed Origins" -ForegroundColor Yellow
    Write-Host "   Current: https://mot.projectnetworks.co.uk"
    Write-Host ""
    $domain = Read-Host "Enter domain (or press Enter to keep default)"
    if ([string]::IsNullOrWhiteSpace($domain)) {
        $domain = "https://mot.projectnetworks.co.uk"
    }
    
    # Update .env file
    $envContent = Get-Content .env
    $envContent = $envContent -replace 'your_dvla_api_key_here', $dvlaKey
    $envContent = $envContent -replace 'your_secure_random_key_here', $apiSecret
    $envContent = $envContent -replace 'https://mot.projectnetworks.co.uk', $domain
    $envContent | Set-Content .env
    
    Write-Host ""
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Update frontend API key
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Updating Frontend Configuration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path frontend/app.js) {
    # Read API key from .env
    $envContent = Get-Content .env
    $apiKeyLine = $envContent | Where-Object { $_ -match 'API_SECRET_KEY=' }
    $apiKey = $apiKeyLine -replace 'API_SECRET_KEY=', ''
    
    # Update app.js
    $appJsContent = Get-Content frontend/app.js
    $appJsContent = $appJsContent -replace "apiKey: '.*'", "apiKey: '$apiKey'"
    $appJsContent | Set-Content frontend/app.js
    
    Write-Host "✅ Frontend API key updated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: frontend/app.js not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Building Docker Containers" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Building images... (this may take a few minutes)" -ForegroundColor Yellow
docker-compose build

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Starting Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

docker-compose up -d

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if services are running
$services = docker-compose ps
if ($services -match "Up") {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your MOT Checker is now running!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Access points:" -ForegroundColor Yellow
    Write-Host "  - Frontend: http://localhost:8080"
    Write-Host "  - API Health: http://localhost:8080/api/health"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Open http://localhost:8080 in your browser"
    Write-Host "  2. Try searching for a UK vehicle registration"
    Write-Host "  3. Set up your domain and SSL (see PORTAINER-DEPLOYMENT.md)"
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Yellow
    Write-Host "  - View logs: docker-compose logs -f"
    Write-Host "  - Stop: docker-compose down"
    Write-Host "  - Restart: docker-compose restart"
    Write-Host ""
    Write-Host "Documentation:" -ForegroundColor Yellow
    Write-Host "  - README.md - Complete guide"
    Write-Host "  - QUICKSTART.md - Quick reference"
    Write-Host "  - PORTAINER-DEPLOYMENT.md - Production deployment"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  Warning: Services may not have started correctly" -ForegroundColor Yellow
    Write-Host "Check logs with: docker-compose logs"
}

Write-Host "==========================================" -ForegroundColor Cyan
