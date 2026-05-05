const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Get all projects
router.get('/projects', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, title, description, url, tech, sort_order FROM projects ORDER BY sort_order ASC, created_at DESC'
        );
        res.json(result.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            url: row.url,
            tech: row.tech ? row.tech.split(',').map(t => t.trim()) : [],
            sortOrder: row.sort_order
        })));
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Create project (admin only)
router.post('/projects', auth, async (req, res) => {
    const { title, description, url = '', tech = '', sortOrder = 0 } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO projects (title, description, url, tech, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, description, url, tech, sort_order',
            [title, description, url, tech, sortOrder]
        );

        const project = result.rows[0];
        res.status(201).json({
            id: project.id,
            title: project.title,
            description: project.description,
            url: project.url,
            tech: project.tech ? project.tech.split(',').map(t => t.trim()) : [],
            sortOrder: project.sort_order
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Update project (admin only)
router.put('/projects/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { title, description, url = '', tech = '', sortOrder } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    try {
        const result = await pool.query(
            'UPDATE projects SET title = $1, description = $2, url = $3, tech = $4, sort_order = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, title, description, url, tech, sort_order',
            [title, description, url, tech, sortOrder, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = result.rows[0];
        res.json({
            id: project.id,
            title: project.title,
            description: project.description,
            url: project.url,
            tech: project.tech ? project.tech.split(',').map(t => t.trim()) : [],
            sortOrder: project.sort_order
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// Delete project (admin only)
router.delete('/projects/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM projects WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;
