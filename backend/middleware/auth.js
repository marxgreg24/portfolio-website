// Basic authentication middleware
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const challenge = () => {
        res.set('WWW-Authenticate', 'Basic realm="Admin Area", charset="UTF-8"');
        return res.status(401).send('Authentication required');
    };

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return challenge();
    }

    try {
        const base64Credentials = authHeader.slice(6);
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
        const [username, password] = credentials.split(':');

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminUsername || !adminPassword) {
            return res.status(500).json({ error: 'Admin credentials are not configured' });
        }

        if (username === adminUsername && password === adminPassword) {
            next();
        } else {
            return challenge();
        }
    } catch (error) {
        return challenge();
    }
};

module.exports = auth;
