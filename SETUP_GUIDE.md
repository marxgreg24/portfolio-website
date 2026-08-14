# Portfolio Backend - Complete Setup Guide

## Overview

Your portfolio website is now a full-stack application with:
- **Frontend**: Dynamic HTML/CSS/JavaScript that fetches data from the backend
- **Admin Panel**: Secure interface to manage all portfolio content
- **Backend**: Node.js + Express API with PostgreSQL database
- **Database**: Neon PostgreSQL for easy cloud deployment
- **Authentication**: Basic Auth for admin-only operations

## Project Structure

```
Porfolio-website/
├── frontend/
│   ├── index.html           # Main portfolio page
│   ├── admin.html           # Admin panel
│   ├── script.js            # Frontend logic (fetches from backend)
│   ├── admin.js             # Admin panel logic
│   ├── styles.css
│   ├── admin.css
│   └── 617635.jpg          # Profile image
├── backend/
│   ├── config/
│   │   └── db.js            # Database connection
│   ├── middleware/
│   │   └── auth.js          # Basic authentication
│   ├── routes/
│   │   ├── profile.js       # Profile endpoints
│   │   ├── skills.js        # Skills endpoints
│   │   ├── projects.js      # Projects endpoints
│   │   └── social.js        # Social links endpoints
│   ├── scripts/
│   │   └── migrate.js       # Database initialization
│   ├── uploads/             # Profile image uploads directory
│   ├── server.js            # Main server file
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
```

## Quick Start (Local Development)

### Step 1: Create Neon Database

1. Go to https://neon.tech and sign up
2. Create a new project
3. Note your connection string (looks like: `postgresql://user:password@host/dbname`)

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://your_user:your_password@your_host/portfolio_db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
PORT=3000
NODE_ENV=development
```

### Step 4: Initialize Database

```bash
npm run migrate
```

This creates all tables and inserts default data.

### Step 5: Start Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on: `http://localhost:3000`

## Admin Access

### First Time Setup:
1. Go to http://localhost:3000/admin
2. Click on any admin action (edit profile, add skill, etc.)
3. Enter credentials when prompted:
   - Username: `admin`
   - Password: (whatever you set in `.env`)

### Admin Features:
- Edit profile information (name, headline, description, etc.)
- Upload new profile picture
- Manage skills (add, edit, delete, reorder)
- Manage projects (add, edit, delete, reorder)
- Manage social links (add, edit, delete, reorder)

All changes are immediately reflected on the public portfolio page.

## Deployment

### Option 1: Deploy to Railway + Neon

#### Railway Setup:
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Select "Deploy from GitHub"
5. Connect your repository

#### Environment Variables in Railway:
```
DATABASE_URL=postgresql://...@neon.tech/...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
NODE_ENV=production
PORT=3000
```

#### Add GitHub Deploy:
- Connect your GitHub repo
- Railway will auto-deploy on every push

Your app will be available at: `https://your-app.railway.app`

### Option 2: Deploy to Render + Neon

#### Render Setup:
1. Go to https://render.com
2. Sign up with GitHub
3. Create "New Web Service"
4. Connect GitHub repository
5. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

#### Add Environment Variables:
```
DATABASE_URL=postgresql://...@neon.tech/...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
NODE_ENV=production
```

### Option 3: Deploy to Vercel (With Serverless)

Not ideal for Express, but if you want to serverless-ify:
- Consider converting to Next.js API routes
- Or use Render/Railway instead (easier)

## 📊 API Reference

### Base URL: `http://localhost:5000/api`

#### Public Endpoints (No auth required):
- `GET /portfolio` - Get all portfolio data
- `GET /profile` - Get profile
- `GET /skills` - Get all skills
- `GET /projects` - Get all projects
- `GET /social-links` - Get all social links

#### Admin Endpoints (Basic Auth required):
```bash
# Profile
PUT /profile - Update profile
POST /profile-image - Upload profile image

# Skills
POST /skills - Create skill
PUT /skills/:id - Update skill
DELETE /skills/:id - Delete skill

# Projects
POST /projects - Create project
PUT /projects/:id - Update project
DELETE /projects/:id - Delete project

# Social Links
POST /social-links - Create social link
PUT /social-links/:id - Update social link
DELETE /social-links/:id - Delete social link
```

### Example Request (with authentication):
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -d '{"fullName":"New Name", "headline":"New Headline"}'
```

## Security Best Practices

### Before Going to Production:

1. **Change Admin Credentials**
   - Set strong `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
   - Never commit `.env` to git

2. **Enable HTTPS**
   - Railway and Render provide free HTTPS
   - Always use HTTPS in production

3. **Database Security**
   - Neon provides SSL connections by default
   - Never expose `DATABASE_URL` in client-side code

4. **CORS Configuration**
   - Currently allows all origins (`*`)
   - In production, set specific origins:
   ```js
   cors({
     origin: 'https://yourdomain.com',
     credentials: true
   })
   ```

5. **Rate Limiting**
   - Consider adding rate limiting to admin endpoints
   - Use `express-rate-limit` package

## Troubleshooting

### Database Connection Failed
```
Error: connect ECONNREFUSED
```
- Verify `DATABASE_URL` in `.env`
- Check if Neon project is active
- Ensure network allows PostgreSQL connections

### Migration Script Fails
```
Error: relation "profile" already exists
```
- Tables were already created
- Just start the server: `npm run dev`

### Image Upload Not Working
- Check `uploads/` directory exists and is writable
- Verify file is correct format (JPEG, PNG, GIF, WebP)
- Check `MAX_FILE_SIZE` in `.env`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3000 npm run dev
```

## Frontend Updates

The frontend is already configured to:
- Fetch all data from `/api/portfolio`
- Fall back to hardcoded data if API is unavailable
- Support the admin panel with authentication

No changes needed to `index.html`, `script.js`, or `admin.js` - they work out of the box!

## Workflow Example

### Add a New Project:

1. Go to http://localhost:3000/admin
2. Scroll to "Projects" section
3. Enter project details:
   - Title: "My New Project"
   - Description: "Project description..."
   - URL: "https://project-link.com"
   - Tech: "React, Node.js, PostgreSQL"
4. Click "Save Project"
5. Project appears immediately on the portfolio homepage!

### Edit Profile Picture:

1. Go to http://localhost:3000/admin
2. Scroll to "Profile Picture Upload"
3. Click "Choose File" and select new image
4. Click "Upload"
5. Image updates on portfolio instantly!

## Support Tips

- Check browser console for errors (F12)
- Check server logs for backend errors
- Database errors usually indicate connection issues
- File upload errors often indicate permissions or file type issues

## Next Steps

1. **Customize Admin Credentials**: Change default username/password
2. **Add Email Notifications**: Send email when contact form submitted
3. **Add Search/Filter**: Search projects or skills
4. **Add Blog Section**: Add blog posts management
5. **Add Analytics**: Track portfolio views
6. **Add Comments**: Allow comments on projects

## Resources

- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Neon Console](https://console.neon.tech/)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)

---

**Your portfolio backend is ready!**

Start the development server and begin managing your portfolio content!
