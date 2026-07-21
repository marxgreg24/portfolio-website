const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..');
const distDir = path.join(sourceDir, 'dist');

function ensureDistDir() {
    fs.rmSync(distDir, { recursive: true, force: true });
    fs.mkdirSync(distDir, { recursive: true });
}

function copyFile(fileName) {
    fs.copyFileSync(path.join(sourceDir, fileName), path.join(distDir, fileName));
}

function writeRuntimeConfig() {
    const apiBaseUrl = (process.env.FRONTEND_API_BASE_URL || '').replace(/\/+$/, '');
    const siteIconUrl = process.env.FRONTEND_SITE_ICON_URL || process.env.CLOUDINARY_SITE_ICON_URL || '/favicon.ico';

    const config = [
        'window.__APP_CONFIG__ = {',
        `    apiBaseUrl: ${JSON.stringify(apiBaseUrl)},`,
        `    siteIconUrl: ${JSON.stringify(siteIconUrl)}`,
        '};',
        '',
        '(function applySiteIconFromConfig() {',
        '    const iconUrl = window.__APP_CONFIG__.siteIconUrl;',
        '    if (!iconUrl) {',
        '        return;',
        '    }',
        '',
        '    document.querySelectorAll(\'link[rel="icon"], link[rel="apple-touch-icon"]\').forEach(function(link) {',
        '        link.href = iconUrl;',
        '    });',
        '})();',
        ''
    ].join('\n');

    fs.writeFileSync(path.join(distDir, 'config.js'), config, 'utf8');
}

function build() {
    ensureDistDir();

    ['index.html', 'admin.html', 'admin-login.html', 'styles.css', 'admin.css', 'script.js', 'admin.js'].forEach(copyFile);
    writeRuntimeConfig();

    console.log('Frontend build complete. Output written to frontend/dist.');
}

build();