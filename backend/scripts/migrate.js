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

-- Insert default profile if it doesn't exist
INSERT INTO profile (full_name, headline, email, phone, location, availability, linkedin_url, linkedin_label, github_url, hero_description, about_summary, about_story)
VALUES (
    'Mark Gregory Okiror',
    'Full Stack, ML, Smart Contracts',
    'okirormarkgreg24@gmail.com',
    '+256 764 476 981',
    'Entebbe, Uganda',
    'Available for new opportunities',
    'https://www.linkedin.com/in/okiror-mark-gregory-3b45172a1/',
    'Mark Gregory Okiror',
    'https://github.com/marxgreg24',
    'I craft digital experiences that blend creativity with functionality. From stunning user interfaces to robust backend solutions, I bring ideas to life through code.',
    'I''m a passionate developer with about 3 years of experience creating innovative digital solutions. My journey spans from crafting pixel-perfect user interfaces to architecting scalable backend systems.',
    'I believe in the power of clean code, thoughtful design, and continuous learning. When I''m not coding, you''ll find me exploring new technologies or contributing to open-source projects.'
)
ON CONFLICT DO NOTHING;

-- Insert default skills if they don't exist
INSERT INTO skills (name, sort_order) VALUES
('JavaScript', 0),
('HTML, EJS & CSS', 1),
('Node.js', 2),
('Python', 3),
('UI/UX Design', 4),
('SQL', 5),
('AWS (basics)', 6),
('Machine Learning & AI', 7)
ON CONFLICT (name) DO NOTHING;

-- Insert default projects if they don't exist
INSERT INTO projects (title, description, url, tech, sort_order) VALUES
('Portfolio Website', 'A dynamic, full-stack portfolio website built with Node.js, Express, PostgreSQL, and Neon. Features a CMS admin panel for managing projects, skills, and profile information with real-time updates.', '/', 'Node.js, Express, PostgreSQL, Neon, JavaScript, CSS', 0),
('MUST Accommodation Platform', 'A full-stack accommodation platform that facilitates bookings and management for students and staff at Mbarara University.', '#', 'EJS, CSS, Node.js, JavaScript, PostgreSQL', 1)
ON CONFLICT DO NOTHING;

-- Insert default social links if they don't exist
INSERT INTO social_links (platform, icon_class, url, sort_order) VALUES
('Email', 'fas fa-envelope', 'mailto:okirormarkgreg24@gmail.com', 0),
('LinkedIn', 'fab fa-linkedin', 'https://www.linkedin.com/in/okiror-mark-gregory-3b45172a1/', 1),
('GitHub', 'fab fa-github', 'https://github.com/marxgreg24', 2)
ON CONFLICT DO NOTHING;
`;

async function initializeDatabase() {
    try {
        console.log('Initializing database schema...');
        await pool.query(schema);
        console.log('Database schema initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
