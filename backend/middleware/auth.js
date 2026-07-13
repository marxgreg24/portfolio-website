const crypto = require('crypto');

function getAdminCredentials() {
    return {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
    };
}

function getSessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'portfolio-admin-session-secret';
}

function base64UrlEncode(value) {
    return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(value) {
    const restored = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = restored + '='.repeat((4 - (restored.length % 4)) % 4);
    return Buffer.from(padded, 'base64').toString('utf8');
}

function safeEqual(left, right) {
    const leftBuffer = Buffer.from(String(left));
    const rightBuffer = Buffer.from(String(right));

    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyAdminCredentials(username, password) {
    const { username: adminUsername, password: adminPassword } = getAdminCredentials();

    if (!adminUsername || !adminPassword) {
        return false;
    }

    return safeEqual(username, adminUsername) && safeEqual(password, adminPassword);
}

function issueAdminToken(username) {
    const ttlMinutes = Number(process.env.ADMIN_SESSION_TTL_MINUTES || 180);
    const payload = {
        sub: username,
        iat: Date.now(),
        exp: Date.now() + (ttlMinutes * 60 * 1000)
    };

    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = crypto
        .createHmac('sha256', getSessionSecret())
        .update(encodedPayload)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${encodedPayload}.${signature}`;
}

function verifyAdminToken(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    const [encodedPayload, signature] = token.split('.');

    if (!encodedPayload || !signature) {
        return null;
    }

    const expectedSignature = crypto
        .createHmac('sha256', getSessionSecret())
        .update(encodedPayload)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    if (!safeEqual(signature, expectedSignature)) {
        return null;
    }

    try {
        const payload = JSON.parse(base64UrlDecode(encodedPayload));

        if (!payload.sub || !payload.exp || Date.now() > payload.exp) {
            return null;
        }

        return payload;
    } catch (error) {
        return null;
    }
}

function extractToken(req) {
    const authHeader = req.headers.authorization || '';

    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }

    if (req.headers['x-admin-token']) {
        return String(req.headers['x-admin-token']).trim();
    }

    return null;
}

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization || '';

    if (authHeader.startsWith('Basic ')) {
        try {
            const base64Credentials = authHeader.slice(6);
            const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
            const separatorIndex = credentials.indexOf(':');

            if (separatorIndex !== -1) {
                const username = credentials.slice(0, separatorIndex);
                const password = credentials.slice(separatorIndex + 1);

                if (verifyAdminCredentials(username, password)) {
                    req.admin = { username };
                    return next();
                }
            }
        } catch (error) {
            return res.status(401).json({ error: 'Admin authentication required' });
        }
    }

    const session = verifyAdminToken(extractToken(req));

    if (session) {
        req.admin = { username: session.sub };
        return next();
    }

    return res.status(401).json({ error: 'Admin authentication required' });
};

auth.verifyAdminCredentials = verifyAdminCredentials;
auth.issueAdminToken = issueAdminToken;
auth.verifyAdminToken = verifyAdminToken;

module.exports = auth;
