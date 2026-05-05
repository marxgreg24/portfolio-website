# Deployment Guide - Production Ready

## 🚀 Recommended Deployment Stack

- **Frontend + Backend**: Railway.app (Recommended)
- **Database**: Neon PostgreSQL
- **File Storage**: Local (or S3 for advanced)
- **Domain**: Custom domain via Railway

## Step-by-Step: Deploy to Railway + Neon

### 1. Prepare Your Repository

Make sure your project structure is correct:
```
.
├── frontend/
│   ├── index.html
│   ├── admin.html
│   ├── script.js
│   ├── admin.js
│   ├── styles.css
│   ├── admin.css
│   └── 617635.jpg
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── [other backend files]
└── SETUP_GUIDE.md
```

### 2. Create Neon Database

1. Go to https://neon.tech
2. Sign up (free tier available)
3. Create new project
4. Copy connection string (Format: `postgresql://user:password@host/dbname`)
5. Save for later

### 3. Set Up Railway Project

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "Create New Project"
4. Select "Deploy from GitHub repo"
5. Connect and authorize GitHub
6. Select your portfolio repository
7. Railway will auto-detect Node.js project

### 4. Configure Environment Variables in Railway

In Railway dashboard:
1. Go to your project
2. Click "Variables"
3. Add these variables:

```
DATABASE_URL=postgresql://user:password@host/portfolio_db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_very_secure_password_here
NODE_ENV=production
PORT=5000
```

**Important**: Keep credentials secure! Use strong passwords.

### 5. Configure Build and Start Commands

In Railway settings:
- **Build Command**: Leave empty (default)
- **Start Command**: `npm start` (or leave default)
- **Root Directory**: `backend` (if not auto-detected)

### 6. Deploy

1. Click "Deploy"
2. Railway builds and deploys automatically
3. Check build logs for errors
4. Once deployed, you'll get a URL like: `https://portfolio-abc123.railway.app`

### 7. Initialize Database on Railway

After successful deployment:

```bash
# SSH into Railway container
railway shell

# Run migration
npm run migrate

# Exit
exit
```

Or run migration from local terminal:
```bash
DATABASE_URL=postgresql://prod-user:prod-pass@host/dbname npm run migrate
```

### 8. Test Your Deployment

- Portfolio: `https://your-railway-app.railway.app`
- Admin Panel: `https://your-railway-app.railway.app/admin`

## Custom Domain Setup

### Connect Custom Domain on Railway

1. In Railway project settings
2. Go to "Domain"
3. Click "Add Custom Domain"
4. Enter your domain (e.g., `portfolio.yourname.com`)
5. Railway provides DNS records to add to your registrar
6. Update DNS at your domain registrar (GoDaddy, Namecheap, etc.)
7. Wait for propagation (5-30 mins)

### Example: GoDaddy DNS Setup

1. Log in to GoDaddy
2. Go to DNS Management for your domain
3. Add CNAME record:
   - Name: `portfolio`
   - Value: `railway.app` or Railway's provided DNS

## 📦 Alternative: Deploy to Render

If you prefer Render over Railway:

### 1. Create Render Web Service

1. Go to https://render.com
2. Sign up with GitHub
3. Click "Create +" → "Web Service"
4. Connect GitHub repository
5. Select repository

### 2. Configure Render Service

- **Name**: `portfolio-backend`
- **Environment**: Node
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Plan**: Free (or Starter paid)

### 3. Add Environment Variables

Same as Railway:
```
DATABASE_URL=postgresql://...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=...
NODE_ENV=production
```

### 4. Deploy

- Click "Create Web Service"
- Render builds and deploys
- Get your URL: `https://portfolio-abc123.onrender.com`

## 🔒 Production Security Checklist

- [ ] Changed default admin credentials
- [ ] Using strong password (16+ chars, mixed case, numbers, symbols)
- [ ] DATABASE_URL uses HTTPS/SSL
- [ ] Enabled HTTPS on custom domain
- [ ] Set `NODE_ENV=production`
- [ ] Tested all endpoints
- [ ] Verified file uploads work
- [ ] Checked database backups (Neon provides auto-backups)
- [ ] Set up monitoring/alerts

## 📊 Monitor Your Deployment

### Railway Monitoring

1. Dashboard shows:
   - Deployment status
   - Build logs
   - Runtime logs
   - Memory/CPU usage
   - Recent deployments

2. Check logs for errors:
   - Click "Logs" tab
   - Search for "error" or "failed"

### Neon Database Monitoring

1. Go to Neon dashboard
2. Monitor:
   - Connection count
   - Query performance
   - Storage usage
   - Backup status

## 🔄 Continuous Deployment

### Automatic Deployments

Both Railway and Render support auto-deployment:

1. Make changes locally
2. Commit to GitHub
3. Push to main branch
4. Railway/Render automatically:
   - Pulls latest code
   - Runs build command
   - Deploys new version
   - Takes ~2-5 minutes

### Manual Redeployment

**Railway**: Click "Redeploy" in dashboard
**Render**: Click "Manual Deploy"

## 🐛 Troubleshooting Deployment

### Build Fails

**Common Error**: `npm: not found`
- Solution: Ensure `package.json` in root or backend directory

**Common Error**: `Module not found`
- Solution: Run `npm install` and commit `node_modules` (not recommended)
- Better: Let deployment run `npm install`

### Database Connection Fails

**Error**: `ECONNREFUSED`
- Check DATABASE_URL is correct
- Verify Neon project is active
- Test connection locally first

**Error**: `ENOTFOUND`
- DNS issue with Neon host
- Copy exact connection string from Neon dashboard

### Admin Panel 401 Unauthorized

- Verify credentials are correct
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in production env
- Credentials are case-sensitive

### Image Uploads Fail

On Railway/Render, `/uploads` directory is ephemeral (resets on reboot).

**Solution**: Implement S3 storage
- Create AWS S3 bucket
- Update upload handler to use S3
- Store URL in database

Or for now:
- Upload to free services like Cloudinary
- Update profile image URL to external link

## 💾 Backup & Recovery

### Database Backups

Neon provides:
- Daily automatic backups
- Point-in-time recovery
- Go to Neon console → Branches → Backups

### Code Backups

GitHub is your backup:
```bash
# Ensure all code is pushed
git push origin main

# Your code is now backed up on GitHub
```

## 📈 Scaling for Growth

### When Traffic Increases

1. **Railway**:
   - Upgrade plan from Free → Starter → Pro
   - Railway auto-scales within plan

2. **Neon Database**:
   - Free tier supports many concurrent connections
   - Upgrade to paid for higher limits
   - Consider read replicas

3. **File Storage**:
   - Implement S3 or similar for uploaded images
   - Not all platforms support persistent local uploads

## 🎯 Final Checklist Before Production

- [ ] Database initialized and seeded
- [ ] Admin credentials changed and secure
- [ ] All environment variables set
- [ ] Admin panel tested
- [ ] Profile image upload tested
- [ ] All API endpoints working
- [ ] Frontend loads correctly
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Backup strategy confirmed

## 📞 Deployment Support

- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Neon Docs**: https://neon.tech/docs

---

**Your portfolio is production-ready! 🎉**

Deploy with confidence and start sharing your work with the world!
