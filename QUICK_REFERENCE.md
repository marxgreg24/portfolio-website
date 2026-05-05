# Quick Reference - Common Tasks

## 🚀 Starting the Server

### Local Development
```bash
cd backend
npm run dev
```
Auto-restarts on file changes.

### Production
```bash
cd backend
npm start
```

## 🗄️ Database

### Initialize Database (First Time)
```bash
cd backend
npm run migrate
```

### Reset Database (Delete All Data)
```bash
# Connect to database and run:
psql $DATABASE_URL

# Inside psql:
DROP TABLE IF EXISTS social_links CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS profile CASCADE;

\q  # Exit psql

# Then reinitialize:
npm run migrate
```

## 🔐 Admin Access

### First Login
1. Go to `/admin`
2. Try any admin action
3. Enter username/password when prompted

### Change Admin Credentials
Edit `.env`:
```env
ADMIN_USERNAME=newusername
ADMIN_PASSWORD=newsecurepassword
```

**Must restart server for changes to take effect**

## 📸 Profile Management

### Update Profile Information
1. Go to Admin → Profile section
2. Fill in fields
3. Click "Save Profile"

### Upload New Profile Image
1. Go to Admin → Profile Picture Upload
2. Click "Choose File"
3. Select image (JPEG, PNG, GIF, WebP)
4. Click "Upload"
5. Image URL shows as confirmation

## 🏆 Manage Skills

### Add Skill
1. Go to Admin → Skills section
2. Enter skill name
3. Enter sort order (0 is first)
4. Click "Save Skill"

### Edit Skill
1. Click "Edit" on any skill
2. Form populates with skill data
3. Make changes
4. Click "Save Skill"

### Delete Skill
1. Click "Delete" on any skill
2. Confirm deletion
3. Skill removed

### Reorder Skills
- Change "Sort Order" value
- Lower numbers appear first
- Skills with same order sort alphabetically

## 🎯 Manage Projects

### Add Project
1. Go to Admin → Projects section
2. Fill fields:
   - Title: Project name
   - Description: What project does
   - URL: Project link (or leave blank)
   - Tech: Comma-separated list (Node.js, React, etc.)
   - Sort Order: Display order
3. Click "Save Project"

### Edit Project
1. Click "Edit" on any project
2. Modify fields
3. Click "Save Project"

### Delete Project
1. Click "Delete" on any project
2. Confirm deletion

## 🔗 Manage Social Links

### Add Social Link
1. Go to Admin → Social Links
2. Fill fields:
   - Platform: "GitHub", "Twitter", etc.
   - Icon Class: FontAwesome class (e.g., `fab fa-github`)
   - URL: Link to profile
   - Sort Order: Display order
3. Click "Save Social Link"

### Common Icon Classes
```
fab fa-github       # GitHub
fab fa-linkedin     # LinkedIn
fab fa-twitter      # Twitter
fab fa-facebook     # Facebook
fas fa-envelope     # Email
fab fa-instagram    # Instagram
fas fa-globe        # Website
```

### Find Icon Classes
1. Go to https://fontawesome.com/icons
2. Search for icon
3. Copy class name
4. Use in admin panel

## 🌐 API Endpoints Reference

### Get All Portfolio Data (Public)
```bash
curl http://localhost:5000/api/portfolio
```

### Get Profile (Public)
```bash
curl http://localhost:5000/api/profile
```

### Update Profile (Admin)
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -d '{
    "fullName": "New Name",
    "headline": "New Headline",
    "email": "newemail@example.com"
  }'
```

### Create Skill (Admin)
```bash
curl -X POST http://localhost:5000/api/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -d '{
    "name": "React",
    "sortOrder": 0
  }'
```

### Get All Skills (Public)
```bash
curl http://localhost:5000/api/skills
```

### Create Project (Admin)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -d '{
    "title": "My Project",
    "description": "Project description",
    "url": "https://project-link.com",
    "tech": "React, Node.js",
    "sortOrder": 0
  }'
```

## 🐛 Common Issues & Fixes

### Port Already in Use
```bash
# Find process on port 5000
lsof -ti:5000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

### Cannot Connect to Database
```bash
# Check .env file exists
cat .env

# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection locally
psql $DATABASE_URL

# If connection fails, check:
# 1. Database URL is correct
# 2. Neon project is active
# 3. Network allows PostgreSQL (port 5432)
```

### Image Upload Fails
```bash
# Ensure uploads directory exists
mkdir -p backend/uploads

# Check permissions
chmod 755 backend/uploads

# Restart server
```

### Admin Password Not Working
1. Check credentials in `.env`
2. Restart server
3. Clear browser localStorage
4. Try incognito window
5. Verify credentials are exact (case-sensitive)

### Frontend Shows Fallback Data
- Backend is not running or API is down
- Check server logs for errors
- Verify `fetch('/api/portfolio')` works
- Check browser console for errors

## 📝 Environment Variables Explained

```env
# Your PostgreSQL connection string from Neon
DATABASE_URL=postgresql://user:password@host:5432/portfolio_db

# Admin panel username (any string)
ADMIN_USERNAME=admin

# Admin panel password (should be strong/long)
ADMIN_PASSWORD=your_secure_password_here

# Server port
PORT=5000

# Mode (development or production)
NODE_ENV=development

# Max file upload size (in bytes, 5MB = 5242880)
MAX_FILE_SIZE=5242880

# Directory for uploaded files
UPLOAD_DIR=./uploads
```

## 📊 Data Structure

### Profile
```json
{
  "fullName": "Mark Gregory Okiror",
  "headline": "Full Stack Developer",
  "email": "email@example.com",
  "phone": "+256 764 476 981",
  "location": "Entebbe, Uganda",
  "availability": "Available",
  "linkedinUrl": "https://linkedin.com/in/...",
  "linkedinLabel": "Full Name",
  "githubUrl": "https://github.com/...",
  "profileImageUrl": "/uploads/profile-123.jpg",
  "heroDescription": "I build...",
  "aboutSummary": "I'm a developer...",
  "aboutStory": "My journey..."
}
```

### Skill
```json
{
  "id": 1,
  "name": "JavaScript",
  "sortOrder": 0
}
```

### Project
```json
{
  "id": 1,
  "title": "Project Name",
  "description": "What the project does",
  "url": "https://project-link.com",
  "tech": ["React", "Node.js", "PostgreSQL"],
  "sortOrder": 0
}
```

### Social Link
```json
{
  "id": 1,
  "platform": "GitHub",
  "iconClass": "fab fa-github",
  "url": "https://github.com/username",
  "sortOrder": 0
}
```

## 🔍 Debugging Tips

### Check Server Logs
```bash
# Terminal shows all requests and errors
# Look for ERROR, Failed, or unusual messages
```

### Check Browser Console
```javascript
// Press F12 or right-click → Inspect
// Console tab shows frontend errors
// Network tab shows API requests/responses
```

### Test API Directly
```bash
# Use curl or Postman to test endpoints
curl http://localhost:5000/api/portfolio

# Should return JSON with all portfolio data
```

### Database Query Testing
```bash
# Connect to database
psql $DATABASE_URL

# View profile
SELECT * FROM profile;

# View skills
SELECT * FROM skills ORDER BY sort_order;

# View projects
SELECT * FROM projects ORDER BY sort_order;

# Exit
\q
```

---

**Need help? Check SETUP_GUIDE.md for more details!**
