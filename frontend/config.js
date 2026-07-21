window.__APP_CONFIG__ = {
    apiBaseUrl: '',
    siteIconUrl: '/favicon.ico'
};

(function applySiteIconFromConfig() {
    const iconUrl = window.__APP_CONFIG__.siteIconUrl;
    if (!iconUrl) {
        return;
    }

    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(function(link) {
        link.href = iconUrl;
    });
})();