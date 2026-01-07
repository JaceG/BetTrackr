# SEO Deployment Checklist

Use this checklist when deploying Sports Betting Charts to production.

## Pre-Deployment

### Images & Assets

- [ ] **Create og-image.png** (1200x630px)
  - Place in `client/public/og-image.png`
  - Should show app screenshot or logo
  - Test preview at: https://www.opengraph.xyz/

- [ ] **Create Favicons** (if missing):
  - [ ] favicon-16x16.png
  - [ ] favicon-32x32.png
  - [ ] apple-touch-icon.png (180x180px)
  - [ ] icon-192.png (for PWA)
  - [ ] icon-512.png (for PWA)
  - Tool: https://realfavicongenerator.net/

- [ ] **Verify favicon.svg exists** in `client/public/`

### Content Review

- [ ] Review all page titles and descriptions in `client/src/lib/seo.ts`
- [ ] Ensure keywords are relevant and not overstuffed
- [ ] Check landing page content for clarity and conversion
- [ ] Verify all CTAs are working and compelling
- [ ] Proofread for typos and grammar

### Technical Setup

- [ ] Update domain in all files:
  - [ ] `client/public/sitemap.xml` (update all URLs)
  - [ ] `client/public/robots.txt` (update sitemap URL)
  - [ ] `client/src/lib/seo.ts` (update canonical URLs and og:url)
  - [ ] `client/index.html` (update canonical and og:url)

- [ ] Set correct `lastmod` dates in `sitemap.xml` to today's date

- [ ] Verify all internal links work:
  - [ ] Navigation menu links
  - [ ] Footer links
  - [ ] CTA buttons
  - [ ] Breadcrumbs (if implemented)

## Deployment Day

### Build & Deploy

- [ ] Run production build: `npm run build`
- [ ] Test production build locally: `npm start`
- [ ] Verify no console errors in browser
- [ ] Check page load speed (should be < 3s)
- [ ] Deploy to production hosting

### Testing

- [ ] **View Page Source** - Verify meta tags render correctly
  - [ ] Check each page: /, /home, /subscribe, /login, /signup
  - [ ] Verify title changes per page
  - [ ] Confirm structured data (JSON-LD) is present

- [ ] **Test Social Media Previews:**
  - [ ] Facebook: https://developers.facebook.com/tools/debug/
  - [ ] Twitter: https://cards-dev.twitter.com/validator
  - [ ] LinkedIn: https://www.linkedin.com/post-inspector/

- [ ] **Test Rich Results:**
  - [ ] Google Rich Results Test: https://search.google.com/test/rich-results
  - [ ] Schema.org Validator: https://validator.schema.org/

- [ ] **Mobile Testing:**
  - [ ] Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
  - [ ] Test on real mobile device
  - [ ] Check viewport scaling and responsiveness

- [ ] **Performance Testing:**
  - [ ] Google PageSpeed Insights: https://pagespeed.web.dev/
  - [ ] Aim for score > 90 on mobile and desktop
  - [ ] Check Core Web Vitals (LCP, FID, CLS)

### File Accessibility

- [ ] Verify files are accessible:
  - [ ] https://yourdomain.com/sitemap.xml
  - [ ] https://yourdomain.com/robots.txt
  - [ ] https://yourdomain.com/site.webmanifest
  - [ ] https://yourdomain.com/og-image.png
  - [ ] https://yourdomain.com/favicon.svg

## Post-Deployment

### Google Search Console

- [ ] **Verify Site Ownership:**
  1. Go to: https://search.google.com/search-console
  2. Add property: `https://yourdomain.com`
  3. Choose verification method:
     - [ ] HTML file upload (easiest)
     - [ ] HTML meta tag (add to index.html)
     - [ ] DNS record (most reliable)
  4. Complete verification

- [ ] **Submit Sitemap:**
  1. In Search Console, go to "Sitemaps"
  2. Enter: `sitemap.xml`
  3. Click "Submit"

- [ ] **Request Indexing for Key Pages:**
  1. Go to "URL Inspection"
  2. Enter URLs:
     - `https://yourdomain.com/`
     - `https://yourdomain.com/home`
     - `https://yourdomain.com/subscribe`
  3. Click "Request Indexing" for each

### Bing Webmaster Tools

- [ ] **Verify Site:**
  1. Go to: https://www.bing.com/webmasters
  2. Add site: `https://yourdomain.com`
  3. Get verification code
  4. Add to `client/public/BingSiteAuth.xml`
  5. Re-deploy

- [ ] **Submit Sitemap:**
  - Enter: `https://yourdomain.com/sitemap.xml`

### Analytics Setup

- [ ] **Google Analytics 4 (optional but recommended):**
  1. Create GA4 property: https://analytics.google.com/
  2. Get measurement ID (G-XXXXXXXXXX)
  3. Add GA4 script to `client/index.html`
  4. Test with GA Debug View

- [ ] **Verify Hotjar is tracking** (already installed)
  - Check dashboard for session recordings

### Monitoring Setup

- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up Google Search Console email alerts
- [ ] Schedule weekly SEO performance review

## Week 1 After Launch

### Index Status

- [ ] **Check if pages are indexed:**
  1. Search: `site:yourdomain.com`
  2. Verify key pages appear in results
  3. If not indexed after 1 week, submit URLs manually in Search Console

- [ ] **Monitor Search Console:**
  - [ ] Check "Coverage" report for errors
  - [ ] Fix any "Excluded" or "Error" pages
  - [ ] Review "Enhancements" for mobile usability issues

### Performance Tracking

- [ ] Check Google Analytics for:
  - [ ] Organic search traffic
  - [ ] Page views per page
  - [ ] Bounce rate
  - [ ] Average session duration

- [ ] Monitor PageSpeed Insights scores weekly

- [ ] Check keyword rankings (use free tools like Google Search Console or paid tools like Ahrefs)

## Ongoing SEO Tasks

### Daily
- Monitor Search Console for critical errors

### Weekly
- Review organic traffic trends
- Check keyword rankings
- Monitor Core Web Vitals
- Review user behavior (Hotjar, GA)

### Monthly
- Update content if needed
- Add new blog posts (if blog implemented)
- Check for broken links
- Update sitemap if new pages added
- Review and respond to user feedback
- Analyze competitor SEO strategies

### Quarterly
- Comprehensive SEO audit
- Update keywords based on trends
- Refresh OG images if needed
- A/B test landing page headlines
- Review and update meta descriptions

## Common Issues & Fixes

### Pages Not Indexing
- Verify robots.txt isn't blocking crawlers
- Check for `noindex` meta tag (should only be on login/signup/account)
- Submit URL for indexing in Search Console
- Ensure server returns 200 status code

### Low Click-Through Rate (CTR)
- Rewrite meta descriptions to be more compelling
- Update titles to include power words
- Add emojis to titles (use sparingly)
- Test different descriptions with keywords earlier

### Slow Page Load
- Optimize images (compress, use WebP format)
- Enable gzip compression
- Use CDN for static assets
- Minimize JavaScript bundle size
- Implement code splitting

### Poor Mobile Usability
- Test on real devices (not just DevTools)
- Ensure touch targets are at least 48x48px
- Fix any viewport issues
- Improve font sizes and spacing

## Success Metrics

Track these KPIs:

- **Organic Traffic**: Visits from search engines
- **Keyword Rankings**: Position in search results
- **CTR**: Click-through rate from search results
- **Bounce Rate**: Should be < 50% for organic traffic
- **Conversion Rate**: Sign-ups or subscriptions from organic traffic
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Page Speed**: > 90 on both mobile and desktop

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmasters-guidelines-30fba23a)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Web.dev for Performance](https://web.dev/)

---

**Remember:** SEO is a long-term strategy. Results typically take 3-6 months to materialize. Stay patient and consistent!
