// Static fallback content used when the backend API is unavailable.
const FALLBACK_PORTFOLIO = {
    profile: {
        fullName: 'Mark Gregory Okiror',
        headline: 'Full Stack, ML, Smart Contracts',
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
        profileImageUrl: './617635.jpg'
    },
    skills: [
        { name: 'JavaScript' },
        { name: 'HTML, EJS & CSS' },
        { name: 'Node.js' },
        { name: 'Python' },
        { name: 'UI/UX Design' },
        { name: 'SQL' },
        { name: 'AWS (basics)' },
        { name: 'Machine Learning & AI' }
    ],
    projects: [
        {
            title: 'Portfolio Website',
            description: 'A dynamic, full-stack portfolio website built with Node.js, Express, PostgreSQL, and Supabase. Features a CMS admin panel for managing projects, skills, and profile information with real-time updates.',
            url: '/',
            tech: ['Node.js', 'Express', 'PostgreSQL', 'Supabase', 'JavaScript', 'CSS']
        },
        {
            title: 'MUST Accommodation Platform',
            description: 'A full-stack accommodation platform that facilitates bookings and management for students and staff at Mbarara University.',
            url: '#',
            tech: ['EJS', 'CSS', 'Node.js', 'JavaScript', 'PostgreSQL']
        }
    ],
    socialLinks: [
        { platform: 'Email', iconClass: 'fas fa-envelope', url: 'mailto:okirormarkgreg24@gmail.com' },
        { platform: 'LinkedIn', iconClass: 'fab fa-linkedin', url: 'https://www.linkedin.com/in/okiror-mark-gregory-3b45172a1/' },
        { platform: 'GitHub', iconClass: 'fab fa-github', url: 'https://github.com/marxgreg24' }
    ]
};

// Reused observer reference so dynamically added elements can be observed too.
let fadeInObserver;

// Typewriter animation for the hero title text.
function typeWriter(element, text, speed = 80) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i += 1;
            setTimeout(type, speed);
        }
    }

    type();
}

// Smooth-scroll in-page navigation links.
function setupSmoothScroll() {
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) {
                return;
            }

            const targetSection = document.querySelector(targetId);
            if (!targetSection) {
                return;
            }

            e.preventDefault();
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// Keep nav items in sync with the section currently near the viewport top.
function setupNavHighlighting() {
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        let current = '';

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 300) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Build decorative floating particles for background motion.
function createParticles() {
    const particleCount = 50;
    const particles = [];

    for (let i = 0; i < particleCount; i += 1) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.width = `${Math.random() * 4 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.animationDelay = `${Math.random() * 6}s`;
        particle.style.animationDuration = `${Math.random() * 3 + 3}s`;
        document.body.appendChild(particle);
        particles.push(particle);
    }

    return particles;
}

// Apply subtle particle translation based on pointer position.
function setupParticleMouseEffect(particles) {
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        particles.forEach((particle, index) => {
            const speed = (index % 5 + 1) * 0.5;
            particle.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
        });
    });
}

// Reveal elements marked with .fade-in as they enter the viewport.
function setupFadeInObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach((el) => {
        fadeInObserver.observe(el);
    });
}

// Re-observe newly rendered DOM nodes (for example project cards from API data).
function observeDynamicFadeInElements() {
    if (!fadeInObserver) {
        return;
    }

    document.querySelectorAll('.fade-in').forEach((el) => {
        fadeInObserver.observe(el);
    });
}

// Change navbar appearance once the user scrolls away from the hero.
function setupNavbarScrollState() {
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (!navbar) {
            return;
        }

        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 15, 35, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.1)';
            navbar.style.backdropFilter = 'blur(20px)';
        }
    });
}

// Add a 3D tilt reaction on project cards for hover depth.
function setupProjectCardTilt() {
    document.querySelectorAll('.project-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
}

// Add pointer-based tilt effect on the hero profile image.
function setupHeroImageTilt() {
    const heroImage = document.querySelector('.hero-image');
    if (!heroImage) {
        return;
    }

    heroImage.addEventListener('mousemove', (e) => {
        const rect = heroImage.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltAmount = 15;
        const rotateX = (y / rect.height) * tiltAmount;
        const rotateY = -(x / rect.width) * tiltAmount;
        heroImage.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroImage.addEventListener('mouseleave', () => {
        heroImage.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
}

// Fetch the full portfolio payload from the backend, with a safe fallback.
async function fetchPortfolio() {
    try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) {
            throw new Error(`Failed to fetch portfolio: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn('Using fallback data because API request failed:', error.message);
        return FALLBACK_PORTFOLIO;
    }
}

// Helper to assign text only when target element exists.
function setText(id, value) {
    const element = document.getElementById(id);
    if (element && typeof value === 'string') {
        element.textContent = value;
    }
}

// Render skill tags in the About section.
function renderSkills(skills = []) {
    const skillsContainer = document.getElementById('skills-list');
    if (!skillsContainer) {
        return;
    }

    skillsContainer.innerHTML = '';
    skills.forEach((skill) => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.textContent = skill.name;
        skillsContainer.appendChild(tag);
    });
}

// Render project cards in the Projects section.
function renderProjects(projects = []) {
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) {
        return;
    }

    projectGrid.innerHTML = '';
    projects.forEach((project) => {
        const card = document.createElement('div');
        card.className = 'project-card fade-in';

        const title = document.createElement('h3');
        title.textContent = project.title;

        const description = document.createElement('p');
        description.textContent = project.description;

        const techContainer = document.createElement('div');
        techContainer.className = 'project-tech';
        (project.tech || []).forEach((techItem) => {
            const techTag = document.createElement('span');
            techTag.className = 'tech-tag';
            techTag.textContent = techItem;
            techContainer.appendChild(techTag);
        });

        const link = document.createElement('a');
        link.className = 'btn btn-secondary';
        link.textContent = 'View Project';
        link.href = project.url || '#';
        if (project.url && project.url !== '#') {
            link.target = '_blank';
            link.rel = 'noreferrer';
        }

        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(techContainer);
        card.appendChild(link);
        projectGrid.appendChild(card);
    });
}

// Render social icons, with email fallback if no links are configured.
function renderSocialLinks(socialLinks = [], email) {
    const socialLinksContainer = document.getElementById('social-links');
    if (!socialLinksContainer) {
        return;
    }

    socialLinksContainer.innerHTML = '';
    socialLinks.forEach((social) => {
        const link = document.createElement('a');
        link.className = `social-link ${social.iconClass}`;
        link.href = social.url;
        link.title = social.platform;
        if (!social.url.startsWith('mailto:')) {
            link.target = '_blank';
            link.rel = 'noreferrer';
        }

        const span = document.createElement('span');
        link.appendChild(span);
        socialLinksContainer.appendChild(link);
    });

    if (socialLinks.length === 0 && email) {
        const fallbackEmail = document.createElement('a');
        fallbackEmail.className = 'social-link fas fa-envelope';
        fallbackEmail.href = `mailto:${email}`;
        fallbackEmail.title = 'Email';
        fallbackEmail.appendChild(document.createElement('span'));
        socialLinksContainer.appendChild(fallbackEmail);
    }
}

// Push API data into DOM nodes and then re-bind visual enhancements.
function applyPortfolioData(data) {
    const profile = data.profile || FALLBACK_PORTFOLIO.profile;
    const skills = Array.isArray(data.skills) ? data.skills : FALLBACK_PORTFOLIO.skills;
    const projects = Array.isArray(data.projects) ? data.projects : FALLBACK_PORTFOLIO.projects;
    const socialLinks = Array.isArray(data.socialLinks) ? data.socialLinks : FALLBACK_PORTFOLIO.socialLinks;

    const heroName = document.getElementById('hero-name');
    if (heroName) {
        heroName.textContent = `Hi, I'm ${profile.fullName}`;
    }
    setText('hero-headline', profile.headline);
    setText('hero-description', profile.heroDescription);

    setText('about-summary', profile.aboutSummary);
    setText('about-story', profile.aboutStory);
    setText('contact-location', profile.location);
    setText('availability-text', profile.availability);

    const profileImage = document.getElementById('profile-image');
    if (profileImage && profile.profileImageUrl) {
        profileImage.src = profile.profileImageUrl;
        profileImage.alt = profile.fullName;
    }

    const emailLink = document.getElementById('contact-email');
    if (emailLink) {
        emailLink.textContent = profile.email;
        emailLink.href = `mailto:${profile.email}`;
    }

    const phoneLink = document.getElementById('contact-phone');
    if (phoneLink) {
        phoneLink.textContent = profile.phone;
        phoneLink.href = `tel:${profile.phone.replace(/\s+/g, '')}`;
    }

    const linkedinLink = document.getElementById('linkedin-link');
    if (linkedinLink) {
        linkedinLink.textContent = profile.linkedinLabel || profile.fullName;
        linkedinLink.href = profile.linkedinUrl || '#';
    }

    renderSkills(skills);
    renderProjects(projects);
    renderSocialLinks(socialLinks, profile.email);
    observeDynamicFadeInElements();
    setupProjectCardTilt();

    if (heroName) {
        typeWriter(heroName, heroName.textContent, 60);
    }
}

// Entry point that wires effects first, then loads data-driven content.
async function initializePortfolioPage() {
    setupSmoothScroll();
    setupNavHighlighting();

    const particles = createParticles();
    setupParticleMouseEffect(particles);

    setupFadeInObserver();
    setupNavbarScrollState();
    setupHeroImageTilt();

    const portfolioData = await fetchPortfolio();
    applyPortfolioData(portfolioData);
}

// Start when the initial HTML document is ready.
window.addEventListener('DOMContentLoaded', initializePortfolioPage);




