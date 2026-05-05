const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Get all skills
router.get('/skills', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, sort_order FROM skills ORDER BY sort_order ASC, name ASC'
        );
        res.json(result.rows.map(row => ({
            id: row.id,
            name: row.name,
            sortOrder: row.sort_order
        })));
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

// Create skill (admin only)
router.post('/skills', auth, async (req, res) => {
    const { name, sortOrder = 0 } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Skill name is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO skills (name, sort_order) VALUES ($1, $2) RETURNING id, name, sort_order',
            [name, sortOrder]
        );
        
        res.status(201).json({
            id: result.rows[0].id,
            name: result.rows[0].name,
            sortOrder: result.rows[0].sort_order
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Skill already exists' });
        }
        console.error('Error creating skill:', error);
        res.status(500).json({ error: 'Failed to create skill' });
    }
});

// Update skill (admin only)
router.put('/skills/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { name, sortOrder } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Skill name is required' });
    }

    try {
        const result = await pool.query(
            'UPDATE skills SET name = $1, sort_order = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, sort_order',
            [name, sortOrder, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.json({
            id: result.rows[0].id,
            name: result.rows[0].name,
            sortOrder: result.rows[0].sort_order
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Skill name already exists' });
        }
        console.error('Error updating skill:', error);
        res.status(500).json({ error: 'Failed to update skill' });
    }
});

// Delete skill (admin only)
router.delete('/skills/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM skills WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ error: 'Failed to delete skill' });
    }
});

module.exports = router;
