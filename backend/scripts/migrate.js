// Database initialization script - creates all necessary tables
const pool = require('../config/db');

const schema = `
-- Profile table
CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL DEFAULT 'Mark Gregory Okiror',
    headline VARCHAR(255) NOT NULL DEFAULT 'Full Stack, ML, Smart Contracts',
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    availability VARCHAR(255) NOT NULL,
    linkedin_url VARCHAR(500),
    linkedin_label VARCHAR(255),
    github_url VARCHAR(500),
    profile_image_url VARCHAR(500),
    hero_description TEXT,
    about_summary TEXT,
    about_story TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    url VARCHAR(500),
    tech TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social links table
CREATE TABLE IF NOT EXISTS social_links (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    icon_class VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const defaultProfile = {
    fullName: 'Mark Gregory Okiror',
    headline: 'Full Stack, ML, Smart Contracts',
    email: 'okirormarkgreg24@gmail.com',
    phone: '+256 764 476 981',
    location: 'Entebbe, Uganda',
    availability: 'Available for new opportunities',
    linkedinUrl: 'https://www.linkedin.com/in/okiror-mark-gregory-3b45172a1/',
    linkedinLabel: 'Mark Gregory Okiror',
    githubUrl: 'https://github.com/marxgreg24',
    heroDescription: 'I craft digital experiences that blend creativity with functionality. From stunning user interfaces to robust backend solutions, I bring ideas to life through code.',
    aboutSummary: "I'm a passionate developer with about 3 years of experience creating innovative digital solutions. My journey spans from crafting pixel-perfect user interfaces to architecting scalable backend systems.",
    aboutStory: "I believe in the power of clean code, thoughtful design, and continuous learning. When I'm not coding, you will find me exploring new technologies and improving my skills through projects."
};

const defaultSkills = [
    { name: 'JavaScript', sortOrder: 0 },
    { name: 'HTML, EJS & CSS', sortOrder: 1 },
    { name: 'Node.js', sortOrder: 2 },
    { name: 'Python', sortOrder: 3 },
    { name: 'UI/UX Design', sortOrder: 4 },
    { name: 'SQL', sortOrder: 5 },
    { name: 'AWS (basics)', sortOrder: 6 },
    { name: 'Machine Learning & AI', sortOrder: 7 }
];

const defaultProjects = [
    {
        title: 'Portfolio Website',
        description: 'A dynamic, full-stack portfolio website built with Node.js, Express, PostgreSQL, and Neon. Features a CMS admin panel for managing projects, skills, and profile information with real-time updates.',
        url: '/',
        tech: 'Node.js, Express, PostgreSQL, Neon, JavaScript, CSS',
        sortOrder: 0
    },
    {
        title: 'MUST Accommodation Platform',
        description: 'A full-stack accommodation platform that facilitates bookings and management for students and staff at Mbarara University.',
        url: '#',
        tech: 'EJS, CSS, Node.js, JavaScript, PostgreSQL',
        sortOrder: 1
    }
];

const defaultSocialLinks = [
    { platform: 'Email', iconClass: 'fas fa-envelope', url: 'mailto:okirormarkgreg24@gmail.com', sortOrder: 0 },
    { platform: 'LinkedIn', iconClass: 'fab fa-linkedin', url: 'https://www.linkedin.com/in/okiror-mark-gregory-3b45172a1/', sortOrder: 1 },
    { platform: 'GitHub', iconClass: 'fab fa-github', url: 'https://github.com/marxgreg24', sortOrder: 2 }
];

async function seedTableIfEmpty(tableName, insertSql, values) {
    const existing = await pool.query(`SELECT 1 FROM ${tableName} LIMIT 1`);

    if (existing.rows.length > 0) {
        return false;
    }

    await pool.query(insertSql, values);
    return true;
}

async function seedInitialData() {
    const profileSeeded = await seedTableIfEmpty(
        'profile',
        `INSERT INTO profile (
            full_name, headline, email, phone, location, availability,
            linkedin_url, linkedin_label, github_url, hero_description,
            about_summary, about_story
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
            defaultProfile.fullName,
            defaultProfile.headline,
            defaultProfile.email,
            defaultProfile.phone,
            defaultProfile.location,
            defaultProfile.availability,
            defaultProfile.linkedinUrl,
            defaultProfile.linkedinLabel,
            defaultProfile.githubUrl,
            defaultProfile.heroDescription,
            defaultProfile.aboutSummary,
            defaultProfile.aboutStory
        ]
    );

    const skillsSeeded = await seedTableIfEmpty(
        'skills',
        'INSERT INTO skills (name, sort_order) VALUES ' + defaultSkills.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`).join(', '),
        defaultSkills.flatMap(skill => [skill.name, skill.sortOrder])
    );

    const projectsSeeded = await seedTableIfEmpty(
        'projects',
        'INSERT INTO projects (title, description, url, tech, sort_order) VALUES ' + defaultProjects.map((_, index) => `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`).join(', '),
        defaultProjects.flatMap(project => [project.title, project.description, project.url, project.tech, project.sortOrder])
    );

    const socialSeeded = await seedTableIfEmpty(
        'social_links',
        'INSERT INTO social_links (platform, icon_class, url, sort_order) VALUES ' + defaultSocialLinks.map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(', '),
        defaultSocialLinks.flatMap(link => [link.platform, link.iconClass, link.url, link.sortOrder])
    );

    return { profileSeeded, skillsSeeded, projectsSeeded, socialSeeded };
}

async function initializeDatabase() {
    try {
        console.log('Initializing database schema...');
        await pool.query(schema);
        await seedInitialData();
        console.log('Database schema initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = {
    initializeDatabase
};
