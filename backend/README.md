# Portfolio CMS Backend

A full-stack portfolio backend built with Node.js, Express, and PostgreSQL (Neon). This backend powers a dynamic portfolio website with an admin panel for managing profile information, skills, projects, and social links.

## Features

- ✅ RESTful API with Express.js
- ✅ PostgreSQL database with Neon
- ✅ Basic Authentication for admin panel
- ✅ Profile management with image upload
- ✅ Dynamic skills, projects, and social links management
- ✅ CORS enabled for frontend communication
- ✅ Compression and security headers (Helmet)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (or Neon account for managed PostgreSQL)
- npm or yarn package manager

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your database URL and admin credentials:

```env
# PostgreSQL/Neon Database URL
DATABASE_URL=postgresql://user:password@host:port/portfolio_db

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Settings
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### 3. Set Up Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Get your connection string and add it to `.env` as `DATABASE_URL`

### 4. Initialize Database Schema

Run the migration script to create all tables and insert default data:

```bash
npm run migrate
```

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Portfolio (Public)
- `GET /api/portfolio` - Get all portfolio data (profile, skills, projects, social links)

### Profile
- `GET /api/profile` - Get profile information
- `PUT /api/profile` - Update profile (admin only)
- `POST /api/profile-image` - Upload profile image (admin only)

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill (admin only)
- `PUT /api/skills/:id` - Update skill (admin only)
- `DELETE /api/skills/:id` - Delete skill (admin only)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (admin only)
- `PUT /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)

### Social Links
- `GET /api/social-links` - Get all social links
- `POST /api/social-links` - Create social link (admin only)
- `PUT /api/social-links/:id` - Update social link (admin only)
- `DELETE /api/social-links/:id` - Delete social link (admin only)

## Authentication

The admin endpoints use Basic Authentication. Include credentials in request headers:

```
Authorization: Basic base64(username:password)
```

The frontend admin panel handles this automatically when you enter credentials.

## File Upload

Profile images are uploaded to the `/uploads` directory and served statically at `/uploads/filename`.

Maximum file size is set by `MAX_FILE_SIZE` in `.env` (default: 5MB)

Allowed image formats: JPEG, JPG, PNG, GIF, WebP

## Directory Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── middleware/
│   └── auth.js            # Basic auth middleware
├── routes/
│   ├── profile.js         # Profile endpoints
│   ├── skills.js          # Skills endpoints
│   ├── projects.js        # Projects endpoints
│   └── social.js          # Social links endpoints
├── scripts/
│   └── migrate.js         # Database initialization
├── uploads/               # Profile image uploads
├── server.js              # Main server file
├── package.json
├── .env.example
└── .gitignore
```

## Deployment

### To Neon + Railway/Render:

1. Create accounts on [railway.app](https://railway.app) or [render.com](https://render.com)
2. Connect your GitHub repository
3. Set environment variables in the deployment platform
4. Deploy!

## Security Considerations

- ⚠️ Change default admin credentials in `.env`
- ⚠️ Use HTTPS in production
- ⚠️ Set strong `ADMIN_PASSWORD`
- ⚠️ Use environment variables for sensitive data
- ⚠️ Enable CORS only for trusted origins in production

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` in `.env`
- Check if your Neon database is active
- Ensure network allows connection to PostgreSQL

### Migration Script Fails
- Run: `npm run migrate` again
- Check database credentials
- Ensure tables don't already exist

### Image Upload Fails
- Verify `uploads/` directory exists and is writable
- Check `MAX_FILE_SIZE` setting
- Verify file format is allowed (JPEG, PNG, GIF, WebP)

## License

MIT

## Author

Mark Gregory Okiror
