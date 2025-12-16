# MOT Checker - Pre-Launch Checklist

## 📋 Before You Deploy

### 1. Prerequisites ✓
- [ ] Docker installed and running
- [ ] Docker Compose available
- [ ] Portainer access (if using)
- [ ] Domain DNS configured
- [ ] Server with sufficient resources (1GB RAM minimum)

### 2. API Keys & Configuration 🔑
- [ ] DVLA API key obtained from https://documentation.history.mot.api.gov.uk/mot-history-api/register
- [ ] API secret key generated (`openssl rand -hex 32`)
- [ ] `.env` file created from `.env.example`
- [ ] DVLA_API_KEY set in `.env`
- [ ] API_SECRET_KEY set in `.env`
- [ ] ALLOWED_ORIGINS updated in `.env`
- [ ] Frontend `app.js` updated with API_SECRET_KEY

### 3. Build & Test Locally 🧪
- [ ] Run `docker-compose build` successfully
- [ ] Run `docker-compose up -d` successfully
- [ ] Access http://localhost:8080 - frontend loads
- [ ] Access http://localhost:8080/api/health - returns healthy
- [ ] Test MOT lookup with real UK registration
- [ ] Test valuation with real data
- [ ] Verify repair costs display
- [ ] Check mobile responsive design
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify rate limiting works (10 requests/minute)
- [ ] Check logs for errors (`docker-compose logs`)

### 4. Security Review 🔒
- [ ] API keys not exposed in frontend code
- [ ] `.env` file in `.gitignore`
- [ ] API authentication working
- [ ] Rate limiting functional
- [ ] CORS properly configured
- [ ] Security headers present
- [ ] HTTPS/SSL ready for production

### 5. Production Deployment 🚀
- [ ] DNS points to production server
- [ ] Firewall configured (port 8080 or reverse proxy port)
- [ ] Deployed via Portainer or Docker Compose
- [ ] Environment variables set in Portainer
- [ ] Containers running and healthy
- [ ] Reverse proxy configured (nginx/Traefik)
- [ ] SSL certificate installed
- [ ] HTTPS working at mot.projectnetworks.co.uk
- [ ] Health check passing in production

### 6. Post-Deployment Testing 🧪
- [ ] Frontend accessible via domain
- [ ] API health check responds
- [ ] MOT lookup works with real data
- [ ] Valuation calculation accurate
- [ ] Repair costs display correctly
- [ ] Error handling graceful
- [ ] Performance acceptable (page load < 3s)
- [ ] Mobile experience good
- [ ] SEO meta tags correct

### 7. Monitoring & Maintenance 📊
- [ ] Container logs reviewed
- [ ] No errors in logs
- [ ] Health checks monitored
- [ ] Performance metrics tracked
- [ ] Backup of `.env` file created
- [ ] Documentation reviewed
- [ ] Update schedule planned (monthly repair costs)

### 8. Documentation Review 📚
- [ ] README.md read
- [ ] QUICKSTART.md reviewed
- [ ] PORTAINER-DEPLOYMENT.md understood
- [ ] OVERVIEW.md checked
- [ ] Contact/support info correct

## 🎯 Quick Test Script

Run this after deployment:

```bash
# Health check
curl https://mot.projectnetworks.co.uk/api/health

# Frontend loads
curl -I https://mot.projectnetworks.co.uk

# Test MOT lookup (replace with your API key and real registration)
curl -X POST https://mot.projectnetworks.co.uk/api/mot/lookup \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"registration": "AB12CDE"}'
```

## 🚨 Common Issues & Solutions

### Issue: "Invalid API key"
**Solution:** Ensure API_SECRET_KEY matches in `.env` and `frontend/app.js`

### Issue: "DVLA API access denied"
**Solution:** Verify DVLA_API_KEY is correct and active

### Issue: "Cannot access website"
**Solution:** Check DNS, firewall, and reverse proxy configuration

### Issue: "Rate limit exceeded"
**Solution:** Normal behavior - wait 1 minute between requests

### Issue: "Vehicle not found"
**Solution:** Try different UK registration or check format

## ✅ Launch Criteria

All items must be checked before going live:

- ✅ All prerequisites met
- ✅ Configuration complete
- ✅ Local testing passed
- ✅ Security verified
- ✅ Production deployed
- ✅ Post-deployment tests passed
- ✅ Monitoring active
- ✅ Documentation reviewed

## 🎉 You're Ready When...

1. ✅ You can access https://mot.projectnetworks.co.uk
2. ✅ Health check returns "healthy"
3. ✅ You can look up a real UK vehicle
4. ✅ Valuation provides sensible recommendations
5. ✅ No errors in Docker logs
6. ✅ SSL certificate is valid
7. ✅ Mobile experience is smooth
8. ✅ You're confident in the setup

## 📞 Need Help?

If stuck on any item:
1. Check relevant documentation (README, QUICKSTART, etc.)
2. Review Docker logs: `docker-compose logs -f`
3. Verify environment variables
4. Test API endpoints directly
5. Contact: https://benfoggon.com

---

## 🚀 Final Steps

Once all boxes are checked:

1. **Announce the launch** to your community
2. **Share the link** on your main Project Networks site
3. **Monitor usage** in the first few days
4. **Gather feedback** from users
5. **Update repair costs** monthly
6. **Maintain documentation** as needed

**Good luck with your MOT Checker launch! 🚗✨**

---

**Checklist Version**: 1.0  
**Last Updated**: 16/12/2025  
**Project**: Project Networks MOT Checker
