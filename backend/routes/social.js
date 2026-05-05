const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Get all social links
router.get('/social-links', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, platform, icon_class, url, sort_order FROM social_links ORDER BY sort_order ASC, created_at DESC'
        );
        res.json(result.rows.map(row => ({
            id: row.id,
            platform: row.platform,
            iconClass: row.icon_class,
            url: row.url,
            sortOrder: row.sort_order
        })));
    } catch (error) {
        console.error('Error fetching social links:', error);
        res.status(500).json({ error: 'Failed to fetch social links' });
    }
});

// Create social link (admin only)
router.post('/social-links', auth, async (req, res) => {
    const { platform, iconClass, url, sortOrder = 0 } = req.body;

    if (!platform || !iconClass || !url) {
        return res.status(400).json({ error: 'Platform, icon class, and URL are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO social_links (platform, icon_class, url, sort_order) VALUES ($1, $2, $3, $4) RETURNING id, platform, icon_class, url, sort_order',
            [platform, iconClass, url, sortOrder]
        );

        const link = result.rows[0];
        res.status(201).json({
            id: link.id,
            platform: link.platform,
            iconClass: link.icon_class,
            url: link.url,
            sortOrder: link.sort_order
        });
    } catch (error) {
        console.error('Error creating social link:', error);
        res.status(500).json({ error: 'Failed to create social link' });
    }
});

// Update social link (admin only)
router.put('/social-links/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { platform, iconClass, url, sortOrder } = req.body;

    if (!platform || !iconClass || !url) {
        return res.status(400).json({ error: 'Platform, icon class, and URL are required' });
    }

    try {
        const result = await pool.query(
            'UPDATE social_links SET platform = $1, icon_class = $2, url = $3, sort_order = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, platform, icon_class, url, sort_order',
            [platform, iconClass, url, sortOrder, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Social link not found' });
        }

        const link = result.rows[0];
        res.json({
            id: link.id,
            platform: link.platform,
            iconClass: link.icon_class,
            url: link.url,
            sortOrder: link.sort_order
        });
    } catch (error) {
        console.error('Error updating social link:', error);
        res.status(500).json({ error: 'Failed to update social link' });
    }
});

// Delete social link (admin only)
router.delete('/social-links/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM social_links WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Social link not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting social link:', error);
        res.status(500).json({ error: 'Failed to delete social link' });
    }
});

module.exports = router;
