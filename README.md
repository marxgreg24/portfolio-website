# 🎯 Portfolio Website - Full Stack

A modern, full-stack portfolio website with a CMS admin panel. Built with Node.js, Express, PostgreSQL, and dynamic frontend.

## ✨ Features

- **Dynamic Portfolio**: All content managed through admin panel
- **Secure Admin Panel**: Only you can make changes
- **Profile Management**: Edit name, headline, bio, profile picture
- **Skills Management**: Add, edit, delete, and reorder skills
- **Projects Portfolio**: Showcase your projects with descriptions and tech stack
- **Social Links**: Link to your social profiles
- **Responsive Design**: Beautiful on desktop and mobile
- **Database-Driven**: All data stored in PostgreSQL
- **Image Upload**: Upload profile pictures directly
- **Easy Deployment**: Deploy to Railway, Render, or your own server

## 🏗️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Fetch API for backend communication
- Responsive and animated UI

### Backend
- Node.js + Express.js
- PostgreSQL database
- Basic Authentication
- Multer for file uploads

### Database
- PostgreSQL with Neon (cloud-hosted)
- Automatic backups
- Easy scaling

## 📂 Project Structure

```
├── frontend/                    # Frontend files
│   ├── index.html              # Main portfolio page
│   ├── admin.html              # Admin control panel
│   ├── script.js               # Portfolio page logic
│   ├── admin.js                # Admin panel logic
│   ├── styles.css              # Portfolio styling
│   ├── admin.css               # Admin panel styling
│   └── 617635.jpg              # Profile image
│
├── backend/                     # Backend API
│   ├── server.js               # Main server
│   ├── package.json            # Dependencies
│   ├── .env.example            # Environment template
│   ├── config/
│   │   └── db.js               # Database connection
│   ├── middleware/
│   │   └── auth.js             # Authentication
│   ├── routes/
│   │   ├── profile.js          # Profile endpoints
│   │   ├── skills.js           # Skills endpoints
│   │   ├── projects.js         # Projects endpoints
│   │   └── social.js           # Social links endpoints
│   ├── scripts/
│   │   └── migrate.js          # Database setup
│   └── uploads/                # Profile image uploads
│
├── SETUP_GUIDE.md              # Detailed setup instructions
├── DEPLOYMENT.md               # Production deployment guide
└── QUICK_REFERENCE.md          # Common tasks reference
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm or yarn
- PostgreSQL or Neon account

### Installation

1. **Clone/Download** this repository

2. **Create Neon Database**
   - Go to https://neon.tech
   - Create a project and note connection string

3. **Install Backend**
   ```bash
   cd backend
   npm install
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and admin credentials
   ```

5. **Initialize Database**
   ```bash
   npm run migrate
   ```

6. **Start Server**
   ```bash
   npm run dev
   ```

7. **Open in Browser**
   - Portfolio: http://localhost:5000
   - Admin Panel: http://localhost:5000/admin

## 🔑 Admin Panel

### Access
1. Go to http://localhost:5000/admin
2. Click any admin action
3. Enter credentials when prompted:
   - Username: `admin` (or your custom username)
   - Password: (from .env)

### What You Can Do
- ✏️ Edit profile information
- 📸 Upload profile picture
- 🏆 Manage skills
- 🎯 Manage projects
- 🔗 Manage social links

All changes appear instantly on the public portfolio!

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Common tasks
- **[backend/README.md](./backend/README.md)** - Backend API documentation

## 🌐 Deployment

### One-Click Deployment (Recommended)

#### Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Import repository
4. Add environment variables
5. Deploy!

**[Detailed Railway Guide →](./DEPLOYMENT.md)**

#### Render
1. Go to https://render.com
2. Create Web Service
3. Connect GitHub
4. Add environment variables
5. Deploy!

**[Detailed Render Guide →](./DEPLOYMENT.md)**

### Your App Will Be Live At
```
https://your-app.railway.app
https://your-custom-domain.com (with custom domain)
```

## 🔐 Security

- ✅ Basic Authentication for admin
- ✅ SSL/HTTPS in production
- ✅ Secure password storage
- ✅ Database security from Neon
- ⚠️ Change default credentials before deployment

## 📝 API Endpoints

### Public Endpoints
- `GET /api/portfolio` - Get all portfolio data
- `GET /api/profile` - Get profile
- `GET /api/skills` - Get all skills
- `GET /api/projects` - Get all projects
- `GET /api/social-links` - Get social links

### Admin Endpoints (Requires Authentication)
- `PUT /api/profile` - Update profile
- `POST /api/profile-image` - Upload image
- `POST /api/skills` - Add skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill
- `POST /api/projects` - Add project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/social-links` - Add social link
- `PUT /api/social-links/:id` - Update social link
- `DELETE /api/social-links/:id` - Delete social link

**[Full API Reference →](./backend/README.md)**

## 🎓 Example Workflow

### Add a New Project

1. **Go to Admin Panel**
   ```
   http://localhost:5000/admin
   ```

2. **Find Projects Section**
   - Scroll down to "Projects" section

3. **Enter Project Details**
   - Title: "Ecommerce Platform"
   - Description: "Built with React and Node.js..."
   - URL: "https://my-project.com"
   - Tech: "React, Node.js, PostgreSQL, Stripe"
   - Sort Order: "0"

4. **Click Save**
   - Project appears on portfolio instantly!

5. **See It Live**
   - Go to http://localhost:5000
   - Scroll to Projects section
   - Your project is there!

## 🛠️ Development

### Run in Development Mode
```bash
cd backend
npm run dev
```
- Auto-restarts on file changes
- Detailed error messages
- Development database

### Build for Production
```bash
cd backend
npm run build  # (if you add a build step)
```

### Reset Database
See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-database)

## 🐛 Troubleshooting

### Can't Connect to Database
- Check DATABASE_URL in .env
- Verify Neon project is active
- Check network connection

### Admin Password Not Working
- Verify credentials in .env
- Restart server
- Check for typos (case-sensitive)

### Image Upload Not Working
- Ensure uploads directory exists
- Check file format (JPEG, PNG, GIF, WebP)
- Verify file size < 5MB

**[More Troubleshooting →](./QUICK_REFERENCE.md#-common-issues--fixes)**

## 📞 Support Resources

- [Setup Guide](./SETUP_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Backend README](./backend/README.md)
- [Express.js Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Railway Docs](https://docs.railway.app)

## 🎯 Next Steps

1. **Local Setup**: Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. **Customize**: Edit profile, add your projects
3. **Test Admin**: Make changes and verify they appear
4. **Deploy**: Use [DEPLOYMENT.md](./DEPLOYMENT.md) for production
5. **Connect Domain**: Add custom domain (optional)

## 📝 File Descriptions

| File | Purpose |
|------|---------|
| `index.html` | Main portfolio page |
| `admin.html` | Admin control panel |
| `script.js` | Frontend logic - fetches from backend |
| `admin.js` | Admin panel logic - communicates with API |
| `server.js` | Express server - handles all requests |
| `package.json` | Dependencies and scripts |
| `migrate.js` | Database initialization script |

## 🚀 Going Live

### Before Deployment
- [ ] Change admin credentials
- [ ] Test all features locally
- [ ] Verify database is working
- [ ] Set up Neon database
- [ ] Update portfolio content

### Deploy
- [ ] Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] Test production environment
- [ ] Set up custom domain
- [ ] Monitor logs

### After Deployment
- [ ] Share your portfolio!
- [ ] Monitor for errors
- [ ] Keep content updated

## 📄 License

MIT

## 👤 Author

Mark Gregory Okiror

---

## 🎉 You're Ready!

Your full-stack portfolio system is ready to use. Start by reading [SETUP_GUIDE.md](./SETUP_GUIDE.md) and get your portfolio online!

**Questions?** Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) or the documentation files.
