require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const pool = require('./config/db');

// Route imports
const profileRoutes = require('./routes/profile');
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');
const socialRoutes = require('./routes/social');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api', profileRoutes);
app.use('/api', skillsRoutes);
app.use('/api', projectsRoutes);
app.use('/api', socialRoutes);

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve admin.html for admin path
app.get('/admin', (req, res) => {
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
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('✓ Database connected successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`✓ Server is running on http://localhost:${PORT}`);
            console.log(`✓ Portfolio: http://localhost:${PORT}`);
            console.log(`✓ Admin Panel: http://localhost:${PORT}/admin`);
        });
    } catch (error) {
        console.error('✗ Failed to start server:', error.message);
        console.error('Make sure your DATABASE_URL is set in .env file');
        process.exit(1);
    }
}

startServer();

module.exports = app;
