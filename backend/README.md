# Portfolio CMS Backend

A full-stack portfolio backend built with Node.js, Express, and PostgreSQL (Neon). This backend powers a dynamic portfolio website with an admin panel for managing profile information, skills, projects, and social links.

## Features

- ✅ RESTful API with Express.js
- ✅ PostgreSQL database with Neon
- ✅ Token-based admin authentication
- ✅ Profile management with Cloudinary image upload
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
ADMIN_SESSION_SECRET=generate_a_long_random_secret
ADMIN_SESSION_TTL_MINUTES=5

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudinary Settings
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_SITE_ICON_URL=https://res.cloudinary.com/...
CLOUDINARY_SITE_ICON_NAME=portfolio.png

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

### Authentication

The admin panel uses a login form that exchanges credentials for a short-lived token. The token stays in session storage and is cleared when the browser tab is closed.

Login endpoint:

`POST /api/admin/login`

Protected admin requests send:

`Authorization: Bearer <token>`

### File Upload

Profile images are uploaded to Cloudinary and stored as public URLs in the database.

Run `npm run upload:icon` after configuring Cloudinary to upload the portfolio favicon from `backend/images/portfolio.png`.

Maximum file size is set by `MAX_FILE_SIZE` in `.env` (default: 5MB)

Allowed image formats: JPEG, JPG, PNG, GIF, WebP

## Directory Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── middleware/
│   └── auth.js            # Admin token and credential middleware
├── routes/
│   ├── profile.js         # Profile endpoints
│   ├── skills.js          # Skills endpoints
│   ├── projects.js        # Projects endpoints
│   └── social.js          # Social links endpoints
├── scripts/
│   └── migrate.js         # Database initialization
├── uploads/               # Legacy local upload directory
├── server.js              # Main server file
├── package.json
├── .env.example
└── .gitignore
```

## Deployment

### Backend on Render

1. Create a new Render Web Service from the `backend` folder.
2. Set the build command to `npm install`.
3. Set the start command to `npm start`.
4. Set these environment variables in Render:
	- `DATABASE_URL`
	- `ADMIN_USERNAME`
	- `ADMIN_PASSWORD`
	- `ADMIN_SESSION_SECRET`
	- `FRONTEND_ORIGIN` set to your Vercel URL, for example `https://your-portfolio.vercel.app`
	- `CLOUDINARY_CLOUD_NAME`
	- `CLOUDINARY_API_KEY`
	- `CLOUDINARY_API_SECRET`
	- `CLOUDINARY_SITE_ICON_URL`
	- `ALLOW_START_WITHOUT_DB=false`

### Frontend on Vercel

1. Create a new Vercel project from the `frontend` folder.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Set these environment variables in Vercel:
	- `FRONTEND_API_BASE_URL` set to your Render backend URL, for example `https://your-backend.onrender.com`
	- `FRONTEND_SITE_ICON_URL` set to the Cloudinary favicon URL, or leave it empty to use the default development value.
5. Deploy both services and update the frontend environment with the live backend URL after Render finishes.

### Recommended Flow

1. Deploy the backend first on Render and copy its public URL.
2. Set `FRONTEND_API_BASE_URL` and `FRONTEND_ORIGIN` before deploying the frontend.
3. Deploy the frontend on Vercel and verify the API requests and favicon load from the cloud.

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
