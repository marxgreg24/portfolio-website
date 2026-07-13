const loginShell = document.getElementById('login-shell');
const dashboardShell = document.getElementById('dashboard-shell');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const statusEl = document.getElementById('status');
const notificationEl = document.getElementById('notification');

const TOKEN_STORAGE_KEY = 'adminSessionToken';
let adminToken = sessionStorage.getItem(TOKEN_STORAGE_KEY) || '';

function getApiBaseUrl() {
    return (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiBaseUrl) || '';
}

function apiUrl(path) {
    const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
}

function getAuthHeader() {
    if (!adminToken) return {};

    return {
        Authorization: `Bearer ${adminToken}`
    };
}

function persistToken(token) {
    adminToken = token;
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearToken() {
    adminToken = '';
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

function showLoginView() {
    loginShell.hidden = false;
    dashboardShell.hidden = true;
}

function showDashboardView() {
    loginShell.hidden = true;
    dashboardShell.hidden = false;
}

// Display a user-facing status message with contextual color.
let notificationTimer = null;

function normalizeErrorMessage(error) {
    if (!error) {
        return 'Something went wrong.';
    }

    if (error.name === 'AbortError') {
        return 'The request was cancelled.';
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error.message) {
        return error.message;
    }

    return 'Something went wrong.';
}

function showNotification(message, type = 'info', autoHide = true) {
    const text = normalizeErrorMessage(message);

    if (notificationTimer) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
    }

    if (notificationEl) {
        notificationEl.textContent = text;
        notificationEl.className = `notification is-${type}`;
        notificationEl.hidden = false;
    }

    if (statusEl) {
        statusEl.textContent = text;
        statusEl.style.color = type === 'error' ? '#ffb4b4' : '#baf7cf';
    }

    if (autoHide && notificationEl) {
        notificationTimer = setTimeout(() => {
            notificationEl.hidden = true;
        }, 6000);
    }
}

function setStatus(message, isError = false) {
    showNotification(message, isError ? 'error' : 'success');
}

// Small wrapper around fetch for JSON APIs and normalized error handling.
async function api(path, options = {}) {
    let response = await fetch(apiUrl(path), {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...(options.headers || {})
        },
        ...options
    });

    if (response.status === 401) {
        clearToken();
        showLoginView();
        throw new Error('Your admin session expired. Please sign in again.');
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
        ? await response.json()
        : { error: await response.text() };

    if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

// Convert form controls to a plain object payload.
function getFormData(form) {
    const formData = new FormData(form);
    const payload = {};
    for (const [key, value] of formData.entries()) {
        payload[key] = value;
    }
    return payload;
}

// Reset a form and clear hidden edit IDs to switch back to create mode.
function resetForm(form) {
    form.reset();
    const hiddenId = form.querySelector('input[name="id"]');
    if (hiddenId) {
        hiddenId.value = '';
    }
}

// Cache all major form and list nodes once for reuse.
const profileForm = document.getElementById('profile-form');
const imageForm = document.getElementById('image-form');
const currentImageUrlEl = document.getElementById('current-image-url');
const skillForm = document.getElementById('skill-form');
const skillsListEl = document.getElementById('skills-list');
const projectForm = document.getElementById('project-form');
const projectsListEl = document.getElementById('projects-list');
const socialForm = document.getElementById('social-form');
const socialListEl = document.getElementById('social-list');

// Local caches are useful if future UI features need quick in-memory access.
let skillsCache = [];
let projectsCache = [];
let socialCache = [];

// Load profile data and bind values into the profile form fields.
async function loadProfile() {
    const profile = await api('/api/profile');
    Object.entries(profile).forEach(([key, value]) => {
        const field = profileForm.elements[key];
        if (field) {
            field.value = value || '';
        }
    });

    currentImageUrlEl.textContent = `Current image: ${profile.profileImageUrl || '(none)'}`;
}

async function login(username, password) {
    const response = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Login failed.');
    }

    persistToken(data.token);
    showDashboardView();
    showNotification('Signed in successfully.', 'success');
}

async function verifySession() {
    if (!adminToken) {
        return false;
    }

    const response = await fetch(apiUrl('/api/admin/session'), {
        headers: {
            ...getAuthHeader()
        }
    });

    if (!response.ok) {
        clearToken();
        return false;
    }

    return true;
}

async function loadDashboardData() {
    await Promise.all([loadProfile(), loadSkills(), loadProjects(), loadSocialLinks()]);
}

// Render skills list with inline edit/delete controls.
function renderSkills(skills) {
    skillsListEl.innerHTML = '';

    skills.forEach((skill) => {
        const li = document.createElement('li');

        const left = document.createElement('div');
        const title = document.createElement('div');
        title.textContent = skill.name;
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = `ID: ${skill.id} | Sort: ${skill.sortOrder}`;
        left.appendChild(title);
        left.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-secondary';
        editBtn.textContent = 'Edit';
        // Populate form to edit this existing skill.
        editBtn.addEventListener('click', () => {
            skillForm.elements.id.value = skill.id;
            skillForm.elements.name.value = skill.name;
            skillForm.elements.sortOrder.value = skill.sortOrder;
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-secondary';
        deleteBtn.textContent = 'Delete';
        // Ask for confirmation before destructive actions.
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Delete this skill?')) {
                return;
            }

            await api(`/api/skills/${skill.id}`, { method: 'DELETE' });
            showNotification('Skill deleted.', 'success');
            await loadSkills();
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(left);
        li.appendChild(actions);
        skillsListEl.appendChild(li);
    });
}

// Fetch latest skills from API and refresh rendered list.
async function loadSkills() {
    skillsCache = await api('/api/skills');
    renderSkills(skillsCache);
}

// Render projects list with edit/delete actions.
function renderProjects(projects) {
    projectsListEl.innerHTML = '';

    projects.forEach((project) => {
        const li = document.createElement('li');

        const left = document.createElement('div');
        const title = document.createElement('div');
        title.textContent = project.title;
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = `ID: ${project.id} | Sort: ${project.sortOrder} | Tech: ${(project.tech || []).join(', ')}`;
        left.appendChild(title);
        left.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-secondary';
        editBtn.textContent = 'Edit';
        // Fill form fields with the selected project values.
        editBtn.addEventListener('click', () => {
            projectForm.elements.id.value = project.id;
            projectForm.elements.title.value = project.title;
            projectForm.elements.description.value = project.description;
            projectForm.elements.url.value = project.url || '';
            projectForm.elements.tech.value = (project.tech || []).join(', ');
            projectForm.elements.sortOrder.value = project.sortOrder;
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-secondary';
        deleteBtn.textContent = 'Delete';
        // Confirm deletion to avoid accidental content loss.
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Delete this project?')) {
                return;
            }

            await api(`/api/projects/${project.id}`, { method: 'DELETE' });
            showNotification('Project deleted.', 'success');
            await loadProjects();
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(left);
        li.appendChild(actions);
        projectsListEl.appendChild(li);
    });
}

// Fetch latest projects from API and refresh rendered list.
async function loadProjects() {
    projectsCache = await api('/api/projects');
    renderProjects(projectsCache);
}

// Render social links list with edit/delete actions.
function renderSocialLinks(links) {
    socialListEl.innerHTML = '';

    links.forEach((link) => {
        const li = document.createElement('li');

        const left = document.createElement('div');
        const title = document.createElement('div');
        title.textContent = `${link.platform} (${link.iconClass})`;
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = `ID: ${link.id} | Sort: ${link.sortOrder} | URL: ${link.url}`;
        left.appendChild(title);
        left.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-secondary';
        editBtn.textContent = 'Edit';
        // Load selected social-link values into the form.
        editBtn.addEventListener('click', () => {
            socialForm.elements.id.value = link.id;
            socialForm.elements.platform.value = link.platform;
            socialForm.elements.iconClass.value = link.iconClass;
            socialForm.elements.url.value = link.url;
            socialForm.elements.sortOrder.value = link.sortOrder;
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-secondary';
        deleteBtn.textContent = 'Delete';
        // Confirm before deleting this social link row.
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Delete this social link?')) {
                return;
            }

            await api(`/api/social-links/${link.id}`, { method: 'DELETE' });
            showNotification('Social link deleted.', 'success');
            await loadSocialLinks();
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(left);
        li.appendChild(actions);
        socialListEl.appendChild(li);
    });
}

// Fetch latest social links from API and refresh rendered list.
async function loadSocialLinks() {
    socialCache = await api('/api/social-links');
    renderSocialLinks(socialCache);
}

// Save profile changes.
profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        const payload = getFormData(profileForm);
        await api('/api/profile', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        showNotification('Profile saved successfully.', 'success');
        await loadProfile();
    } catch (error) {
        showNotification(`Failed to save profile: ${error.message}`, 'error');
    }
});

// Upload a new profile image using multipart/form-data.
imageForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        const fileInput = document.getElementById('profileImage');
        const file = fileInput.files[0];
        if (!file) {
            showNotification('Please choose an image file first.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await fetch(apiUrl('/api/profile-image'), {
            method: 'POST',
            body: formData,
            headers: getAuthHeader()
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Image upload failed.');
        }

        showNotification('Profile image uploaded successfully.', 'success');
        currentImageUrlEl.textContent = `Current image: ${data.imageUrl}`;
        
        // Update the profile form's input to align with the new image URL
        if (profileForm.elements.profileImageUrl) {
            profileForm.elements.profileImageUrl.value = data.imageUrl;
        }

        imageForm.reset();
    } catch (error) {
        showNotification(`Profile image upload failed: ${error.message}`, 'error');
    }
});

// Create or update a skill depending on whether an id is present.
skillForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        const payload = getFormData(skillForm);
        if (payload.id) {
            await api(`/api/skills/${payload.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: payload.name,
                    sortOrder: payload.sortOrder
                })
            });
            showNotification('Skill updated.', 'success');
        } else {
            await api('/api/skills', {
                method: 'POST',
                body: JSON.stringify({
                    name: payload.name,
                    sortOrder: payload.sortOrder
                })
            });
            showNotification('Skill added.', 'success');
        }

        resetForm(skillForm);
        await loadSkills();
    } catch (error) {
        showNotification(`Failed to save skill: ${error.message}`, 'error');
    }
});

// Manual reset switches the form back to create mode.
document.getElementById('skill-reset').addEventListener('click', () => resetForm(skillForm));

// Create or update a project depending on whether an id is present.
projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        const payload = getFormData(projectForm);
        const requestPayload = {
            title: payload.title,
            description: payload.description,
            url: payload.url,
            tech: payload.tech,
            sortOrder: payload.sortOrder
        };

        if (payload.id) {
            await api(`/api/projects/${payload.id}`, {
                method: 'PUT',
                body: JSON.stringify(requestPayload)
            });
            showNotification('Project updated.', 'success');
        } else {
            await api('/api/projects', {
                method: 'POST',
                body: JSON.stringify(requestPayload)
            });
            showNotification('Project added.', 'success');
        }

        resetForm(projectForm);
        await loadProjects();
    } catch (error) {
        showNotification(`Failed to save project: ${error.message}`, 'error');
    }
});

// Reset project form state.
document.getElementById('project-reset').addEventListener('click', () => resetForm(projectForm));

// Create or update a social link depending on whether an id is present.
socialForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        const payload = getFormData(socialForm);
        const requestPayload = {
            platform: payload.platform,
            iconClass: payload.iconClass,
            url: payload.url,
            sortOrder: payload.sortOrder
        };

        if (payload.id) {
            await api(`/api/social-links/${payload.id}`, {
                method: 'PUT',
                body: JSON.stringify(requestPayload)
            });
            showNotification('Social link updated.', 'success');
        } else {
            await api('/api/social-links', {
                method: 'POST',
                body: JSON.stringify(requestPayload)
            });
            showNotification('Social link added.', 'success');
        }

        resetForm(socialForm);
        await loadSocialLinks();
    } catch (error) {
        showNotification(`Failed to save social link: ${error.message}`, 'error');
    }
});

// Reset social-link form state.
document.getElementById('social-reset').addEventListener('click', () => resetForm(socialForm));

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        const formData = new FormData(loginForm);
        await login(formData.get('username'), formData.get('password'));
        await loadDashboardData();
    } catch (error) {
        showNotification(`Sign in failed: ${error.message}`, 'error');
    }
});

logoutButton.addEventListener('click', async () => {
    clearToken();
    loginForm.reset();
    showLoginView();
    showNotification('Signed out.', 'success');
});

// Bootstrap all dashboard data concurrently for faster initial load.
async function init() {
    try {
        const authenticated = await verifySession();

        if (!authenticated) {
            showLoginView();
            showNotification('Sign in to open the admin dashboard.', 'info');
            return;
        }

        showDashboardView();
        await loadDashboardData();
        showNotification('Admin dashboard loaded.', 'success');
    } catch (error) {
        showNotification(`Admin dashboard could not finish loading: ${error.message}`, 'error');
    }
}

// Start dashboard logic after DOM is available.
window.addEventListener('DOMContentLoaded', init);
