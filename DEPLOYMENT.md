# Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] Production build successful (`npm run build`)
- [ ] All tests pass (if applicable)

### ✅ Environment Variables
- [ ] Formspree production form ID configured
- [ ] Stripe live keys configured
- [ ] All environment variables documented

### ✅ Content Review
- [ ] All text content reviewed and approved
- [ ] Images optimized and properly sized
- [ ] Links tested and working
- [ ] Contact form tested
- [ ] Workshop dates and payment links verified

## Vercel Deployment

### 1. Repository Setup
```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Vercel Configuration
1. **Import Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select Next.js framework

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_FORMSPREE_FORM_ID=your_production_form_id
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

3. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Deploy
- Click "Deploy"
- Wait for build to complete
- Verify deployment URL works

## Post-Deployment Verification

### ✅ Functionality Tests
- [ ] Home page loads correctly
- [ ] Navigation between pages works
- [ ] Contact form submits successfully
- [ ] Workshop booking flow works
- [ ] All images load properly
- [ ] Responsive design works on mobile/desktop

### ✅ Performance Tests
- [ ] Page load times acceptable (< 3 seconds)
- [ ] Images optimized and loading quickly
- [ ] No console errors
- [ ] Lighthouse score > 90

### ✅ Security Tests
- [ ] HTTPS enabled
- [ ] Environment variables not exposed
- [ ] Form validation working
- [ ] No sensitive data in client-side code

## Custom Domain Setup (Optional)

### 1. Add Domain in Vercel
- Go to project settings
- Add custom domain
- Follow DNS configuration instructions

### 2. Configure DNS
- Add CNAME record pointing to Vercel
- Wait for DNS propagation (up to 48 hours)

### 3. SSL Certificate
- Vercel automatically provisions SSL
- Verify HTTPS works correctly

## Monitoring & Maintenance

### ✅ Post-Launch Tasks
- [ ] Set up monitoring (Vercel Analytics, Google Analytics)
- [ ] Configure error tracking
- [ ] Set up uptime monitoring
- [ ] Test backup/restore procedures

### ✅ Regular Maintenance
- [ ] Monitor Formspree usage and limits
- [ ] Check Stripe dashboard for payments
- [ ] Update dependencies monthly
- [ ] Review and update workshop dates
- [ ] Backup content and configuration

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Check build logs in Vercel dashboard
# Verify environment variables are set
# Test build locally: npm run build
```

**Environment Variables**
- Ensure all required variables are set in Vercel
- Check variable names match exactly
- Verify no typos in values

**Domain Issues**
- Check DNS propagation with `dig` or online tools
- Verify CNAME record is correct
- Wait up to 48 hours for full propagation

**Performance Issues**
- Check Vercel Analytics for insights
- Optimize images if needed
- Review bundle size and loading times

## Rollback Plan

### If Issues Occur
1. **Immediate Rollback**
   - Use Vercel's "Redeploy" feature to previous version
   - Or revert to last known good commit

2. **Investigation**
   - Check Vercel build logs
   - Review environment variables
   - Test locally with production settings

3. **Fix and Redeploy**
   - Fix issues in development
   - Test thoroughly
   - Deploy again

## Success Criteria

### ✅ Deployment Successful When
- [ ] All pages load without errors
- [ ] Contact form works in production
- [ ] Workshop booking flow functional
- [ ] Performance metrics acceptable
- [ ] SSL certificate active
- [ ] Custom domain working (if applicable)

### ✅ Go-Live Checklist
- [ ] Stakeholder approval received
- [ ] Content final and approved
- [ ] All functionality tested
- [ ] Monitoring configured
- [ ] Backup procedures in place
- [ ] Team notified of launch

## Support Contacts

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Stripe Support**: [stripe.com/support](https://stripe.com/support)
- **Formspree Support**: [formspree.io/support](https://formspree.io/support)

## Emergency Contacts

- **Primary Developer**: [Your contact info]
- **Stakeholder**: [Client contact info]
- **Hosting Provider**: Vercel support

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Status**: Ready for Production
