// Core modules and third-party dependencies used by the API server.
import path from 'path';
import fs from 'fs';
import express from 'express';
import multer from 'multer';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Force .env values to override stale shell-exported variables (e.g. old admin password).
dotenv.config({ override: true });

// Create the HTTP app and resolve runtime configuration.
const app = express();
const PORT = process.env.PORT || 3000;
const ALLOW_START_WITHOUT_DB = process.env.ALLOW_START_WITHOUT_DB === 'true';
const DB_INIT_MAX_RETRIES = Number.parseInt(process.env.DB_INIT_MAX_RETRIES || '3', 10);
const DB_INIT_BASE_DELAY_MS = Number.parseInt(process.env.DB_INIT_BASE_DELAY_MS || '1500', 10);
const DB_INIT_MAX_DELAY_MS = Number.parseInt(process.env.DB_INIT_MAX_DELAY_MS || '10000', 10);

// Recreate __dirname for ESM modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const frontendDir = path.join(projectRoot, 'frontend');

// Admin credentials and protected static assets.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PROTECTED_PATHS = new Set([
    '/admin.html',
    '/admin.js',
    '/admin.css',
    '/frontend/admin.html',
    '/frontend/admin.js',
    '/frontend/admin.css'
]);

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Add it to your .env file before starting the server.');
}

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.warn('Admin auth is not configured. Add ADMIN_USERNAME and ADMIN_PASSWORD to your .env file.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    // Allow more time for Neon wake-up and transient network slowness.
    connectionTimeoutMillis: 30000
});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// Ensure the uploads folder exists before file uploads are attempted.
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage and generate unique filenames for uploaded images.
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname) || '.jpg';
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    // Accept only image files to avoid storing unsupported content.
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Only image uploads are allowed.'));
            return;
        }

        cb(null, true);
    }
});

const DEFAULT_PROFILE = {
    fullName: 'Mark Gregory Okiror',
    headline: 'Web Developer, ML Engineer',
    heroDescription: 'I craft digital experiences that blend creativity with functionality. From stunning user interfaces to robust backend solutions, I bring ideas to life through code.',
    aboutSummary: 'I\'m a passionate developer with over 2 years of experience creating innovative digital solutions. My journey spans from crafting pixel-perfect user interfaces to architecting scalable backend systems.',
    aboutStory: 'I believe in the power of clean code, thoughtful design, and continuous learning. When I\'m not coding, you\'ll find me exploring new technologies or contributing to open-source projects.',
    location: 'Entebbe, Uganda',
    availability: 'Available for new opportunities',
    email: 'okirormarkgreg24@gmail.com',
    phone: '+256 764 476 981',
    linkedinUrl: 'https://www.linkedin.com/in/okiror-mark-gregory-3b45172a1/',
    linkedinLabel: 'Mark Gregory Okiror',
    githubUrl: 'https://github.com/marxgreg24',
    profileImageUrl: '/617635.jpg'
};

const DEFAULT_SKILLS = [
    'JavaScript',
    'HTML, EJS & CSS',
    'Node.js',
    'Python',
    'UI/UX Design',
    'SQL',
    'AWS (basics)',
    'Machine Learning & AI'
];

const DEFAULT_PROJECTS = [
    {
        title: 'MUST Accommodation Platform',
        description: 'A full-stack accommodation platform that facilitates accommodation bookings and management for students and staff at Mbarara University. The platform provides an easy-to-use interface for finding and securing accommodation on campus.',
        url: '#',
        tech: ['EJS', 'CSS', 'Node.js', 'JavaScript', 'PostgreSQL']
    }
];

const DEFAULT_SOCIAL_LINKS = [
    { platform: 'Email', iconClass: 'fas fa-envelope', url: 'mailto:okirormarkgreg24@gmail.com' },
    { platform: 'LinkedIn', iconClass: 'fab fa-linkedin', url: 'https://www.linkedin.com/in/okiror-mark-gregory-3b45172a1/' },
    { platform: 'GitHub', iconClass: 'fab fa-github', url: 'https://github.com/marxgreg24' }
];

// Return a browser-native basic-auth challenge prompt.
function sendAdminAuthChallenge(res) {
    res.set('WWW-Authenticate', 'Basic realm="Portfolio Admin"');
    res.status(401).send('Authentication required.');
}

// Basic Auth middleware for admin-facing APIs and files.
function requireAdminAuth(req, res, next) {
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        res.status(503).json({ error: 'Admin access is not configured on this server.' });
        return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        sendAdminAuthChallenge(res);
        return;
    }

    let decodedCredentials;
    try {
        decodedCredentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
    } catch {
        sendAdminAuthChallenge(res);
        return;
    }

    const separatorIndex = decodedCredentials.indexOf(':');
    if (separatorIndex === -1) {
        sendAdminAuthChallenge(res);
        return;
    }

    const username = decodedCredentials.slice(0, separatorIndex);
    const password = decodedCredentials.slice(separatorIndex + 1);

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        sendAdminAuthChallenge(res);
        return;
    }

    next();
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Protect selected admin static files with the same auth used by admin APIs.
app.use((req, res, next) => {
    if (ADMIN_PROTECTED_PATHS.has(req.path)) {
        requireAdminAuth(req, res, next);
        return;
    }

    next();
});

app.use('/frontend', express.static(frontendDir));
app.use(express.static(frontendDir));

// Keep legacy image URL working after moving backend into a subfolder.
app.get('/617635.jpg', (_req, res) => {
    res.sendFile(path.join(__dirname, '617635.jpg'));
});

app.get('/', (_req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

// Convert DB row names (snake_case) to API response names (camelCase).
function toProfileDTO(row) {
    if (!row) {
        return null;
    }

    return {
        fullName: row.full_name,
        headline: row.headline,
        heroDescription: row.hero_description,
        aboutSummary: row.about_summary,
        aboutStory: row.about_story,
        location: row.location,
        availability: row.availability,
        email: row.email,
        phone: row.phone,
        linkedinUrl: row.linkedin_url,
        linkedinLabel: row.linkedin_label,
        githubUrl: row.github_url,
        profileImageUrl: row.profile_image_url
    };
}

function toSkillDTO(row) {
    return {
        id: row.id,
        name: row.name,
        sortOrder: row.sort_order
    };
}

function toProjectDTO(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        url: row.url,
        tech: Array.isArray(row.tech) ? row.tech : [],
        sortOrder: row.sort_order
    };
}

function toSocialLinkDTO(row) {
    return {
        id: row.id,
        platform: row.platform,
        iconClass: row.icon_class,
        url: row.url,
        sortOrder: row.sort_order
    };
}

function parseSortOrder(value, fallback = 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

// Normalize "tech" input from either an array or comma-separated string.
function parseTech(techValue) {
    if (Array.isArray(techValue)) {
        return techValue.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof techValue === 'string') {
        return techValue
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

async function initDb() {
    // Create all required tables if this is the first run.
    await pool.query(`
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
            full_name TEXT NOT NULL,
            headline TEXT NOT NULL,
            hero_description TEXT NOT NULL,
            about_summary TEXT NOT NULL,
            about_story TEXT NOT NULL,
            location TEXT NOT NULL,
            availability TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            linkedin_url TEXT,
            linkedin_label TEXT,
            github_url TEXT,
            profile_image_url TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS skills (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            url TEXT,
            tech JSONB NOT NULL DEFAULT '[]'::jsonb,
            sort_order INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS social_links (
            id SERIAL PRIMARY KEY,
            platform TEXT NOT NULL,
            icon_class TEXT NOT NULL,
            url TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        );
    `);

    // Seed initial profile once so the portfolio has renderable content.
    const profileCheck = await pool.query('SELECT COUNT(*)::int AS count FROM profile');
    if (profileCheck.rows[0].count === 0) {
        await saveProfile(DEFAULT_PROFILE);
    }

    // Seed initial skills.
    const skillsCheck = await pool.query('SELECT COUNT(*)::int AS count FROM skills');
    if (skillsCheck.rows[0].count === 0) {
        for (let i = 0; i < DEFAULT_SKILLS.length; i += 1) {
            await pool.query(
                'INSERT INTO skills (name, sort_order) VALUES ($1, $2)',
                [DEFAULT_SKILLS[i], i + 1]
            );
        }
    }

    // Seed default project card(s).
    const projectsCheck = await pool.query('SELECT COUNT(*)::int AS count FROM projects');
    if (projectsCheck.rows[0].count === 0) {
        for (let i = 0; i < DEFAULT_PROJECTS.length; i += 1) {
            const project = DEFAULT_PROJECTS[i];
            await pool.query(
                'INSERT INTO projects (title, description, url, tech, sort_order) VALUES ($1, $2, $3, $4::jsonb, $5)',
                [project.title, project.description, project.url, JSON.stringify(project.tech), i + 1]
            );
        }
    }

    // Seed social links used in the contact section.
    const socialCheck = await pool.query('SELECT COUNT(*)::int AS count FROM social_links');
    if (socialCheck.rows[0].count === 0) {
        for (let i = 0; i < DEFAULT_SOCIAL_LINKS.length; i += 1) {
            const link = DEFAULT_SOCIAL_LINKS[i];
            await pool.query(
                'INSERT INTO social_links (platform, icon_class, url, sort_order) VALUES ($1, $2, $3, $4)',
                [link.platform, link.iconClass, link.url, i + 1]
            );
        }
    }
}

async function getProfile() {
    const result = await pool.query('SELECT * FROM profile WHERE id = 1 LIMIT 1');
    return toProfileDTO(result.rows[0]);
}

// Upsert profile data to keep exactly one profile row (id = 1).
async function saveProfile(payload) {
    const values = {
        fullName: payload.fullName?.trim() || DEFAULT_PROFILE.fullName,
        headline: payload.headline?.trim() || DEFAULT_PROFILE.headline,
        heroDescription: payload.heroDescription?.trim() || DEFAULT_PROFILE.heroDescription,
        aboutSummary: payload.aboutSummary?.trim() || DEFAULT_PROFILE.aboutSummary,
        aboutStory: payload.aboutStory?.trim() || DEFAULT_PROFILE.aboutStory,
        location: payload.location?.trim() || DEFAULT_PROFILE.location,
        availability: payload.availability?.trim() || DEFAULT_PROFILE.availability,
        email: payload.email?.trim() || DEFAULT_PROFILE.email,
        phone: payload.phone?.trim() || DEFAULT_PROFILE.phone,
        linkedinUrl: payload.linkedinUrl?.trim() || DEFAULT_PROFILE.linkedinUrl,
        linkedinLabel: payload.linkedinLabel?.trim() || DEFAULT_PROFILE.linkedinLabel,
        githubUrl: payload.githubUrl?.trim() || DEFAULT_PROFILE.githubUrl,
        profileImageUrl: payload.profileImageUrl?.trim() || DEFAULT_PROFILE.profileImageUrl
    };

    const result = await pool.query(
        `
        INSERT INTO profile (
            id,
            full_name,
            headline,
            hero_description,
            about_summary,
            about_story,
            location,
            availability,
            email,
            phone,
            linkedin_url,
            linkedin_label,
            github_url,
            profile_image_url
        )
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id)
        DO UPDATE SET
            full_name = EXCLUDED.full_name,
            headline = EXCLUDED.headline,
            hero_description = EXCLUDED.hero_description,
            about_summary = EXCLUDED.about_summary,
            about_story = EXCLUDED.about_story,
            location = EXCLUDED.location,
            availability = EXCLUDED.availability,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            linkedin_url = EXCLUDED.linkedin_url,
            linkedin_label = EXCLUDED.linkedin_label,
            github_url = EXCLUDED.github_url,
            profile_image_url = EXCLUDED.profile_image_url
        RETURNING *
        `,
        [
            values.fullName,
            values.headline,
            values.heroDescription,
            values.aboutSummary,
            values.aboutStory,
            values.location,
            values.availability,
            values.email,
            values.phone,
            values.linkedinUrl,
            values.linkedinLabel,
            values.githubUrl,
            values.profileImageUrl
        ]
    );

    return toProfileDTO(result.rows[0]);
}

async function getPortfolioPayload() {
    // Fetch each section independently so frontend can render all blocks from one payload.
    const profileResult = await pool.query('SELECT * FROM profile WHERE id = 1');
    const skillsResult = await pool.query('SELECT * FROM skills ORDER BY sort_order, id');
    const projectsResult = await pool.query('SELECT * FROM projects ORDER BY sort_order, id');
    const socialResult = await pool.query('SELECT * FROM social_links ORDER BY sort_order, id');

    return {
        profile: toProfileDTO(profileResult.rows[0]),
        skills: skillsResult.rows.map(toSkillDTO),
        projects: projectsResult.rows.map(toProjectDTO),
        socialLinks: socialResult.rows.map(toSocialLinkDTO)
    };
}

// Lightweight dependency check endpoint for uptime monitoring.
app.get('/api/health', async (_req, res, next) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok' });
    } catch (error) {
        next(error);
    }
});

// Public endpoint consumed by the portfolio page.
app.get('/api/portfolio', async (_req, res, next) => {
    try {
        const payload = await getPortfolioPayload();
        res.json(payload);
    } catch (error) {
        next(error);
    }
});

// Everything below this line is admin-only write/read management.
app.use('/api/profile', requireAdminAuth);
app.use('/api/profile-image', requireAdminAuth);
app.use('/api/skills', requireAdminAuth);
app.use('/api/projects', requireAdminAuth);
app.use('/api/social-links', requireAdminAuth);

app.get('/api/profile', async (_req, res, next) => {
    try {
        const profile = await getProfile();
        res.json(profile || DEFAULT_PROFILE);
    } catch (error) {
        next(error);
    }
});

app.put('/api/profile', async (req, res, next) => {
    try {
        // Merge incoming fields onto current values to support partial updates.
        const current = (await getProfile()) || DEFAULT_PROFILE;
        const updated = await saveProfile({ ...current, ...req.body });
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

app.post('/api/profile-image', upload.single('profileImage'), async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No profileImage file uploaded.' });
            return;
        }

        // Persist image URL in profile after Multer stores the file.
        const current = (await getProfile()) || DEFAULT_PROFILE;
        const imageUrl = `/uploads/${req.file.filename}`;
        const updatedProfile = await saveProfile({ ...current, profileImageUrl: imageUrl });
        res.status(201).json({ imageUrl, profile: updatedProfile });
    } catch (error) {
        next(error);
    }
});

app.get('/api/skills', async (_req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM skills ORDER BY sort_order, id');
        res.json(result.rows.map(toSkillDTO));
    } catch (error) {
        next(error);
    }
});

app.post('/api/skills', async (req, res, next) => {
    try {
        const { name, sortOrder } = req.body;
        // Minimal validation keeps API predictable for the admin UI.
        if (!name || !String(name).trim()) {
            res.status(400).json({ error: 'Skill name is required.' });
            return;
        }

        const result = await pool.query(
            'INSERT INTO skills (name, sort_order) VALUES ($1, $2) RETURNING *',
            [String(name).trim(), parseSortOrder(sortOrder, 0)]
        );

        res.status(201).json(toSkillDTO(result.rows[0]));
    } catch (error) {
        next(error);
    }
});

app.put('/api/skills/:id', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'Invalid skill id.' });
            return;
        }

        // Read first so we can keep existing values for omitted fields.
        const existingResult = await pool.query('SELECT * FROM skills WHERE id = $1', [id]);
        if (existingResult.rowCount === 0) {
            res.status(404).json({ error: 'Skill not found.' });
            return;
        }

        const existing = existingResult.rows[0];
        const updatedName = req.body.name ? String(req.body.name).trim() : existing.name;
        const updatedSortOrder = req.body.sortOrder !== undefined
            ? parseSortOrder(req.body.sortOrder, existing.sort_order)
            : existing.sort_order;

        const result = await pool.query(
            'UPDATE skills SET name = $2, sort_order = $3 WHERE id = $1 RETURNING *',
            [id, updatedName, updatedSortOrder]
        );

        res.json(toSkillDTO(result.rows[0]));
    } catch (error) {
        next(error);
    }
});

app.delete('/api/skills/:id', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'Invalid skill id.' });
            return;
        }

        const result = await pool.query('DELETE FROM skills WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Skill not found.' });
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

app.get('/api/projects', async (_req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY sort_order, id');
        res.json(result.rows.map(toProjectDTO));
    } catch (error) {
        next(error);
    }
});

app.post('/api/projects', async (req, res, next) => {
    try {
        const { title, description, url, tech, sortOrder } = req.body;
        if (!title || !String(title).trim()) {
            res.status(400).json({ error: 'Project title is required.' });
            return;
        }

        if (!description || !String(description).trim()) {
            res.status(400).json({ error: 'Project description is required.' });
            return;
        }

        // Convert tech tags to a clean JSON array before storing.
        const techList = parseTech(tech);

        const result = await pool.query(
            'INSERT INTO projects (title, description, url, tech, sort_order) VALUES ($1, $2, $3, $4::jsonb, $5) RETURNING *',
            [
                String(title).trim(),
                String(description).trim(),
                url ? String(url).trim() : '#',
                JSON.stringify(techList),
                parseSortOrder(sortOrder, 0)
            ]
        );

        res.status(201).json(toProjectDTO(result.rows[0]));
    } catch (error) {
        next(error);
    }
});

app.put('/api/projects/:id', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'Invalid project id.' });
            return;
        }

        const existingResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
        if (existingResult.rowCount === 0) {
            res.status(404).json({ error: 'Project not found.' });
            return;
        }

        const existing = toProjectDTO(existingResult.rows[0]);
        const updated = {
            title: req.body.title ? String(req.body.title).trim() : existing.title,
            description: req.body.description ? String(req.body.description).trim() : existing.description,
            url: req.body.url !== undefined ? String(req.body.url).trim() : existing.url,
            tech: req.body.tech !== undefined ? parseTech(req.body.tech) : existing.tech,
            sortOrder: req.body.sortOrder !== undefined
                ? parseSortOrder(req.body.sortOrder, existing.sortOrder)
                : existing.sortOrder
        };

        const result = await pool.query(
            'UPDATE projects SET title = $2, description = $3, url = $4, tech = $5::jsonb, sort_order = $6 WHERE id = $1 RETURNING *',
            [
                id,
                updated.title,
                updated.description,
                updated.url || '#',
                JSON.stringify(updated.tech),
                updated.sortOrder
            ]
        );

        res.json(toProjectDTO(result.rows[0]));
    } catch (error) {
        next(error);
    }
});

app.delete('/api/projects/:id', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'Invalid project id.' });
            return;
        }

        const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Project not found.' });
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

app.get('/api/social-links', async (_req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM social_links ORDER BY sort_order, id');
        res.json(result.rows.map(toSocialLinkDTO));
    } catch (error) {
        next(error);
    }
});

app.post('/api/social-links', async (req, res, next) => {
    try {
        const { platform, iconClass, url, sortOrder } = req.body;
        // Validate required link fields before insertion.
        if (!platform || !String(platform).trim()) {
            res.status(400).json({ error: 'Platform is required.' });
            return;
        }

        if (!iconClass || !String(iconClass).trim()) {
            res.status(400).json({ error: 'iconClass is required.' });
            return;
        }

        if (!url || !String(url).trim()) {
            res.status(400).json({ error: 'URL is required.' });
            return;
        }

        const result = await pool.query(
            'INSERT INTO social_links (platform, icon_class, url, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
            [
                String(platform).trim(),
                String(iconClass).trim(),
                String(url).trim(),
                parseSortOrder(sortOrder, 0)
            ]
        );

        res.status(201).json(toSocialLinkDTO(result.rows[0]));
    } catch (error) {
        next(error);
    }
});

app.put('/api/social-links/:id', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'Invalid social link id.' });
            return;
        }

        const existingResult = await pool.query('SELECT * FROM social_links WHERE id = $1', [id]);
        if (existingResult.rowCount === 0) {
            res.status(404).json({ error: 'Social link not found.' });
            return;
        }

        const existing = toSocialLinkDTO(existingResult.rows[0]);
        const updated = {
            platform: req.body.platform ? String(req.body.platform).trim() : existing.platform,
            iconClass: req.body.iconClass ? String(req.body.iconClass).trim() : existing.iconClass,
            url: req.body.url ? String(req.body.url).trim() : existing.url,
            sortOrder: req.body.sortOrder !== undefined
                ? parseSortOrder(req.body.sortOrder, existing.sortOrder)
                : existing.sortOrder
        };

        const result = await pool.query(
            'UPDATE social_links SET platform = $2, icon_class = $3, url = $4, sort_order = $5 WHERE id = $1 RETURNING *',
            [id, updated.platform, updated.iconClass, updated.url, updated.sortOrder]
        );

        res.json(toSocialLinkDTO(result.rows[0]));
    } catch (error) {
        next(error);
    }
});

app.delete('/api/social-links/:id', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'Invalid social link id.' });
            return;
        }

        const result = await pool.query('DELETE FROM social_links WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Social link not found.' });
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

app.use((error, _req, res, _next) => {
    if (error instanceof multer.MulterError) {
        res.status(400).json({ error: error.message });
        return;
    }

    // Keep error output visible in server logs while returning safe JSON.
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
});

async function start() {
    const describeStartupError = (error) => {
        if (!error) {
            return 'Unknown startup error.';
        }

        const name = error.name ? `[${error.name}] ` : '';
        const code = error.code ? ` (code: ${error.code})` : '';
        let message = error.message && error.message.trim()
            ? error.message
            : 'No error message was provided by the driver.';

        // pg may raise AggregateError with empty top-level message. Surface nested error details.
        if (
            (!error.message || !error.message.trim())
            && Array.isArray(error.errors)
            && error.errors.length > 0
        ) {
            const firstInner = error.errors[0];
            const innerCode = firstInner?.code ? ` (inner code: ${firstInner.code})` : '';
            message = `Aggregate failure: ${firstInner?.message || 'Unknown inner error'}${innerCode}`;
        }

        return `${name}${message}${code}`;
    };

    const initializeDatabaseWithRetry = async () => {
        const maxRetries = Number.isNaN(DB_INIT_MAX_RETRIES) || DB_INIT_MAX_RETRIES < 1
            ? 1
            : DB_INIT_MAX_RETRIES;

        for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
            try {
                await initDb();
                return;
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }

                const backoffDelay = Math.min(
                    DB_INIT_MAX_DELAY_MS,
                    DB_INIT_BASE_DELAY_MS * (2 ** (attempt - 1))
                );

                console.warn(
                    `Database init attempt ${attempt}/${maxRetries} failed: ${describeStartupError(error)}. Retrying in ${backoffDelay}ms...`
                );

                await sleep(backoffDelay);
            }
        }
    };

    try {
        // Ensure schema + seed data are ready before accepting requests.
        await initializeDatabaseWithRetry();
        console.log('Database connection established.');
    } catch (error) {
        console.error('Failed to initialize database:', describeStartupError(error));

        if (!ALLOW_START_WITHOUT_DB) {
            console.error('Server startup aborted. Set ALLOW_START_WITHOUT_DB=true to run without DB temporarily.');
            process.exit(1);
            return;
        }

        console.warn('Starting in degraded mode because ALLOW_START_WITHOUT_DB=true. DB-backed endpoints may fail until connectivity returns.');
    }

    app.listen(PORT, () => {
        console.log(`Portfolio app running on http://localhost:${PORT}`);
        if (ALLOW_START_WITHOUT_DB) {
            console.log('Degraded-start option is enabled via ALLOW_START_WITHOUT_DB=true.');
        }
    });

    // Ensure late DB failures in pool clients are visible in logs.
    pool.on('error', (error) => {
        console.error('PostgreSQL pool error:', describeStartupError(error));
    });
}

start();

process.on('SIGINT', async () => {
    await pool.end();
    process.exit(0);
});
