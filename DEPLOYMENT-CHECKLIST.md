# 🚀 Deployment Checklist for Project Networks

## Pre-Deployment Tasks

### 📸 Assets & Content
- [ ] Copy all images from original `/assets/images/` to `/update/assets/images/`
- [ ] Add a high-quality `og-image.jpg` (1200x630px) for social media
- [ ] Copy `assets/cobble.mrpack` to `/update/assets/`
- [ ] Optimize all images (use TinyPNG or similar)
- [ ] Add favicon in multiple sizes (16x16, 32x32, 180x180)
- [ ] Create Apple touch icon (180x180)

### 📁 Vendor Files
- [ ] Copy `/vendor/jquery/` folder to `/update/vendor/jquery/`
- [ ] Copy `/vendor/bootstrap/` folder to `/update/vendor/bootstrap/`
- [ ] Verify all vendor files are present and working

### 🔗 Configuration Updates
- [ ] Replace all `projectnetworks.co.uk` with your actual domain
  - [ ] index.html (meta tags, schema, canonical)
  - [ ] contact.html (meta tags, canonical)
  - [ ] download.html (meta tags, canonical)
  - [ ] sitemap.xml (all URLs)
  - [ ] robots.txt (sitemap URL)

- [ ] Update sitemap.xml dates to current date
- [ ] Verify all Discord invite links are current
- [ ] Check all external links work (benfoggon.com, photos.benfoggon.com, etc.)
- [ ] Update email address if different from contact@projectnetworks.co.uk

### 🧪 Testing

#### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

#### Functionality Testing
- [ ] All navigation links work
- [ ] Smooth scrolling to sections works
- [ ] Mobile menu opens/closes properly
- [ ] Download links work
- [ ] External links open in new tabs
- [ ] Back to top button appears on scroll
- [ ] All hover effects work
- [ ] Animations play smoothly

#### Page Testing
- [ ] Homepage loads correctly
- [ ] Contact page displays properly
- [ ] Download page functions correctly
- [ ] All images load
- [ ] No console errors
- [ ] No 404 errors

#### Responsive Testing
- [ ] Desktop (1920px)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)
- [ ] Test landscape/portrait orientations

### ⚡ Performance Optimization

#### Image Optimization
- [ ] Compress all PNG/JPG images
- [ ] Consider converting to WebP format
- [ ] Ensure images have width/height attributes
- [ ] Add loading="lazy" to below-fold images

#### Code Optimization
- [ ] Minify CSS (styles.css)
- [ ] Minify JavaScript (main.js)
- [ ] Remove unused CSS/JS
- [ ] Combine CSS files if multiple exist

#### Caching Setup
- [ ] Upload .htaccess file
- [ ] Test browser caching is working
- [ ] Test GZIP compression
- [ ] Verify cache headers

### 🔒 Security

- [ ] Test HTTPS redirect works (if .htaccess uploaded)
- [ ] Verify security headers are set
- [ ] Test CSP doesn't block needed resources
- [ ] Remove any sensitive information from code
- [ ] Check robots.txt blocks admin areas (if any)

## SEO Setup

### Search Engine Registration
- [ ] Create Google Search Console account
- [ ] Verify site ownership
- [ ] Submit sitemap.xml
- [ ] Check for crawl errors

- [ ] Create Bing Webmaster Tools account
- [ ] Verify site ownership
- [ ] Submit sitemap.xml

### Analytics Setup
- [ ] Set up Google Analytics 4
- [ ] Add tracking code to all pages
- [ ] Test analytics is receiving data
- [ ] Set up goals/conversions

### Social Media
- [ ] Test Open Graph tags with Facebook Debugger
- [ ] Test Twitter Card with Twitter Card Validator
- [ ] Share on social media to verify appearance
- [ ] Update social media profiles with website link

## Post-Deployment

### Initial Checks (First 24 Hours)
- [ ] Verify site is live and accessible
- [ ] Check all pages load correctly
- [ ] Monitor for any errors
- [ ] Test from different locations/networks
- [ ] Verify mobile version works
- [ ] Check analytics is tracking

### SEO Monitoring (First Week)
- [ ] Check Google Search Console for issues
- [ ] Monitor indexing status
- [ ] Check for crawl errors
- [ ] Review search appearance
- [ ] Monitor page speed

### Performance Testing
- [ ] Run Google PageSpeed Insights
  - Target: Performance 90+, SEO 100
- [ ] Run GTmetrix test
- [ ] Test on WebPageTest.org
- [ ] Check mobile speed

### Ongoing Maintenance
- [ ] Update sitemap when adding pages
- [ ] Monitor analytics monthly
- [ ] Check for broken links monthly
- [ ] Update content regularly
- [ ] Review SEO performance quarterly

## Launch Day Checklist

### Final Steps Before Going Live
1. [ ] Backup original website
2. [ ] Upload all files to server
3. [ ] Test site on staging URL (if available)
4. [ ] Get approval from stakeholders
5. [ ] Schedule launch time

### Launch Sequence
1. [ ] Upload files to production
2. [ ] Clear server cache
3. [ ] Test immediately after upload
4. [ ] Submit sitemap to search engines
5. [ ] Announce on Discord
6. [ ] Share on social media
7. [ ] Monitor for first hour

## Tools & Resources

### Testing Tools
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator

### SEO Tools
- **Google Search Console**: https://search.google.com/search-console
- **Bing Webmaster**: https://www.bing.com/webmasters
- **Google Analytics**: https://analytics.google.com/

### Image Optimization
- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **ImageOptim**: https://imageoptim.com/

## Quick Command Reference

### Upload to Server (via FTP/SFTP)
```
1. Connect to your server
2. Navigate to public_html or www directory
3. Upload entire /update/ folder contents
4. Ensure proper permissions (755 for folders, 644 for files)
```

### Test Locally (optional)
```
# If using Python
cd "Project Networks/update"
python -m http.server 8000
# Open http://localhost:8000

# If using PHP
cd "Project Networks/update"
php -S localhost:8000
# Open http://localhost:8000
```

## Common Issues & Solutions

### Images Not Loading
- Check file paths are correct
- Verify images exist in /assets/images/
- Check file permissions
- Clear browser cache

### Styles Not Applied
- Check styles.css path in HTML
- Verify vendor CSS files copied
- Clear browser cache
- Check for CSS errors in console

### Scripts Not Working
- Verify jQuery is loaded first
- Check script paths in HTML
- Look for JavaScript errors in console
- Ensure vendor JS files copied

### Mobile Menu Not Working
- Check jQuery is loaded
- Verify main.js is loaded
- Test on actual mobile device, not just browser resize

## Success Metrics

### Week 1 Goals
- [ ] Site fully functional
- [ ] No critical errors
- [ ] Mobile working perfectly
- [ ] Analytics tracking

### Month 1 Goals
- [ ] Google indexing main pages
- [ ] Search Console shows no errors
- [ ] PageSpeed score 90+
- [ ] Mobile score 90+

### Month 3 Goals
- [ ] Ranking for "Project Networks"
- [ ] Growing organic traffic
- [ ] Good Core Web Vitals
- [ ] Positive user feedback

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Review this checklist
3. Test in different browsers
4. Clear cache and try again
5. Check file paths and permissions

---

**Good luck with your launch! 🚀**

*Remember: Test everything twice, launch once!*
