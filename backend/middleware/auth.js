// Basic authentication middleware
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const base64Credentials = authHeader.slice(6);
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'password';

        if (username === adminUsername && password === adminPassword) {
            next();
        } else {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        return res.status(401).json({ error: 'Invalid authorization header' });
    }
};

module.exports = auth;
