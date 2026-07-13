require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const pool = require('./config/db');
const auth = require('./middleware/auth');
const { initializeDatabase } = require('./scripts/migrate');

// Route imports
const adminAuthRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');
const socialRoutes = require('./routes/social');

const app = express();
const PORT = process.env.PORT || 5000;
const ALLOW_START_WITHOUT_DB = process.env.ALLOW_START_WITHOUT_DB === 'true';
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

function isAllowedOrigin(origin) {
    if (!origin || allowedOrigins.length === 0) {
        return true;
    }

    return allowedOrigins.includes(origin);
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get(['/favicon.ico', '/images/portfolio.png'], (req, res) => {
    const iconUrl = process.env.CLOUDINARY_SITE_ICON_URL;

    if (!iconUrl) {
        return res.status(503).json({ error: 'Site icon is not configured' });
    }

    return res.redirect(302, iconUrl);
});

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Combined portfolio endpoint (for initial page load)
app.get('/api/portfolio', async (req, res) => {
    try {
        // Fetch all data in parallel
        const [profileResult, skillsResult, projectsResult, socialResult] = await Promise.all([
            pool.query('SELECT * FROM profile LIMIT 1'),
            pool.query('SELECT id, name, sort_order FROM skills ORDER BY sort_order ASC, name ASC'),
            pool.query('SELECT id, title, description, url, tech, sort_order FROM projects ORDER BY sort_order ASC, created_at DESC'),
            pool.query('SELECT id, platform, icon_class, url, sort_order FROM social_links ORDER BY sort_order ASC, created_at DESC')
        ]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }

        const profile = profileResult.rows[0];

        res.json({
            profile: {
                fullName: profile.full_name,
                headline: profile.headline,
                email: profile.email,
                phone: profile.phone,
                location: profile.location,
                availability: profile.availability,
                linkedinUrl: profile.linkedin_url,
                linkedinLabel: profile.linkedin_label,
                githubUrl: profile.github_url,
                profileImageUrl: profile.profile_image_url,
                heroDescription: profile.hero_description,
                aboutSummary: profile.about_summary,
                aboutStory: profile.about_story
            },
            skills: skillsResult.rows.map(row => ({
                id: row.id,
                name: row.name,
                sortOrder: row.sort_order
            })),
            projects: projectsResult.rows.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description,
                url: row.url,
                tech: row.tech ? row.tech.split(',').map(t => t.trim()) : [],
                sortOrder: row.sort_order
            })),
            socialLinks: socialResult.rows.map(row => ({
                id: row.id,
                platform: row.platform,
                iconClass: row.icon_class,
                url: row.url,
                sortOrder: row.sort_order
            }))
        });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});

// API Routes
app.use('/api', adminAuthRoutes);
app.use('/api', profileRoutes);
app.use('/api', skillsRoutes);
app.use('/api', projectsRoutes);
app.use('/api', socialRoutes);

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve admin.html for admin path
app.get(['/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Database connection test and server startup
async function startServer() {
    let dbConnected = false;

    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('✓ Database connected successfully');
        dbConnected = true;

        await initializeDatabase();
        console.log('✓ Database schema ready');
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        if (!ALLOW_START_WITHOUT_DB) {
            console.error('Make sure your DATABASE_URL is set in .env file');
            process.exit(1);
        }
        console.log('Starting in degraded mode because ALLOW_START_WITHOUT_DB=true. DB-backed endpoints may fail until connectivity returns.');
    }

    // Start server regardless of DB connection if ALLOW_START_WITHOUT_DB is true
    app.listen(PORT, () => {
        console.log(`✓ Server is running on http://localhost:${PORT}`);
        console.log(`✓ Portfolio: http://localhost:${PORT}`);
        console.log(`✓ Admin Panel: http://localhost:${PORT}/admin`);
        if (!dbConnected) {
            console.log('⚠️  Database is not connected - degraded mode active');
        }
    });
}

startServer();

module.exports = app;
