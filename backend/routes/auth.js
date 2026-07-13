const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/admin/login', (req, res) => {
    const { username, password } = req.body || {};

    if (!auth.verifyAdminCredentials(username, password)) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = auth.issueAdminToken(username);

    return res.json({
        token,
        username,
        expiresIn: Number(process.env.ADMIN_SESSION_TTL_MINUTES || 180) * 60
    });
});

router.get('/admin/session', auth, (req, res) => {
    res.json({ username: req.admin.username });
});

router.post('/admin/logout', (req, res) => {
    res.status(204).send();
});

module.exports = router;