const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { uploadBufferToCloudinary } = require('../services/cloudinary');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 5242880) },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get profile
router.get('/profile', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM profile LIMIT 1'
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profile = result.rows[0];
        res.json({
            id: profile.id,
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
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update profile (admin only)
router.put('/profile', auth, async (req, res) => {
    const {
        fullName,
        headline,
        email,
        phone,
        location,
        availability,
        linkedinUrl,
        linkedinLabel,
        githubUrl,
        profileImageUrl,
        heroDescription,
        aboutSummary,
        aboutStory
    } = req.body;

    try {
        const currentResult = await pool.query('SELECT * FROM profile WHERE id = 1 LIMIT 1');

        if (currentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const current = currentResult.rows[0];
        const nextFullName = fullName ?? current.full_name;
        const nextHeadline = headline ?? current.headline;
        const nextEmail = email ?? current.email;
        const nextPhone = phone ?? current.phone;
        const nextLocation = location ?? current.location;
        const nextAvailability = availability ?? current.availability;
        const nextLinkedinUrl = linkedinUrl ?? current.linkedin_url;
        const nextLinkedinLabel = linkedinLabel ?? current.linkedin_label;
        const nextGithubUrl = githubUrl ?? current.github_url;
        const nextProfileImageUrl = profileImageUrl ?? current.profile_image_url;
        const nextHeroDescription = heroDescription ?? current.hero_description;
        const nextAboutSummary = aboutSummary ?? current.about_summary;
        const nextAboutStory = aboutStory ?? current.about_story;

        const result = await pool.query(
            `UPDATE profile 
             SET full_name = $1, headline = $2, email = $3, phone = $4, 
                 location = $5, availability = $6, linkedin_url = $7, 
                 linkedin_label = $8, github_url = $9, profile_image_url = $10,
                 hero_description = $11, about_summary = $12, about_story = $13,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $14
             RETURNING *`,
            [
                nextFullName,
                nextHeadline,
                nextEmail,
                nextPhone,
                nextLocation,
                nextAvailability,
                nextLinkedinUrl,
                nextLinkedinLabel,
                nextGithubUrl,
                nextProfileImageUrl,
                nextHeroDescription,
                nextAboutSummary,
                nextAboutStory,
                current.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profile = result.rows[0];
        res.json({
            id: profile.id,
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
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Upload profile image (admin only)
router.post('/profile-image', auth, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const uploaded = await uploadBufferToCloudinary({
            buffer: req.file.buffer,
            folder: 'portfolio/profile-images',
            originalName: req.file.originalname
        });
        const imageUrl = uploaded.secureUrl;

        // Update profile with new image URL
        await pool.query(
            'UPDATE profile SET profile_image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
            [imageUrl]
        );

        res.json({ imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

module.exports = router;
