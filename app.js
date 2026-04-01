// =====================================================
// TELEGRAM FILE MANAGER - MAIN APPLICATION
// =====================================================

// =====================================================
// USER AUTHENTICATION SYSTEM
// =====================================================

const USERS = {
    'raghav': { password: 'raghavg1212', email: 'user1@example.com' },
    'admin': { password: 'admin123', email: 'admin@example.com' }
};

let currentUser = null; // Track logged-in user

/**
 * Initialize authentication - check if user is already logged in
 */
function initializeAuth() {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        hideLoginModal();
        initializeApp();
    } else {
        showLoginModal();
    }
}

/**
 * Show login modal
 */
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Hide login modal
 */
function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * Handle user login
 */
function handleLogin(username, password) {
    if (USERS[username] && USERS[username].password === password) {
        currentUser = username;
        console.log(`✅ User logged in: ${username}`);
        sessionStorage.setItem('currentUser', username);
        document.getElementById('loginError').style.display = 'none';
        hideLoginModal();
        initializeApp();
        showToast(`Welcome ${username}! 👋`, 'success');
        return true;
    } else {
        const errorEl = document.getElementById('loginError');
        errorEl.textContent = '❌ Invalid username or password';
        errorEl.style.display = 'block';
        return false;
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear current user's localStorage data
        localStorage.removeItem(getUserDataKey('teledriveFiles'));
        localStorage.removeItem(getUserDataKey('botToken'));
        localStorage.removeItem(getUserDataKey('channelId'));
        localStorage.removeItem(getUserDataKey('apiUrl'));
        localStorage.removeItem(getUserDataKey('viewMode'));
        localStorage.removeItem(getUserDataKey('theme'));
        
        // Clear appState
        appState.files = [];
        
        // Clear session
        currentUser = null;
        sessionStorage.removeItem('currentUser');
        
        // Show login screen
        showLoginModal();
        showToast('Logged out successfully', 'info');
    }
}

/**
 * Get current user's data key (for storage isolation)
 */
function getUserDataKey(key) {
    return currentUser ? `${key}_${currentUser}` : key;
}

// =====================================================
// CONSTANTS & CONFIGURATION
// =====================================================

const APP_CONFIG = {
    apiBase: 'https://api.telegram.org',
    maxFileSize: 2000 * 1024 * 1024, // 2GB (Telegram limit)
    supportedTypes: {
        images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        documents: ['application/pdf', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/zip', 'application/x-rar-compressed'],
        videos: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    }
};

// =====================================================
// STATE MANAGEMENT
// =====================================================

let appState = {
    files: [],
    currentView: 'all',
    searchQuery: '',
    botToken: '8582665455:AAE8GProeUEPhAPxzaix388lh8PeUrTSXr4',
    channelId: '-1003772832057',
    apiUrl: '',
    viewMode: 'grid',
    currentPreviewFile: null,
    theme: 'system',
    useServerStorage: false, // Flag to track if server storage is enabled
    currentUser: null, // Current logged-in user
};

// Server configuration
const SERVER_URL = window.location.origin;
let serverAvailable = false;

// =====================================================
// SERVER DATA SYNC FUNCTIONS
// =====================================================

/**
 * Check if server is available
 */
async function isServerAvailable() {
    try {
        const response = await fetch(`${SERVER_URL}/api/health`, { 
            method: 'GET',
            cache: 'no-cache'
        });
        if (response.ok) {
            console.log('[SERVER CHECK] ✅ Server is available');
            return true;
        }
    } catch (error) {
        console.warn('[SERVER CHECK] ⚠️ Server not available:', error.message);
    }
    return false;
}

/**
 * Load settings from server
 */
async function loadSettingsFromServer() {
    try {
        const response = await fetch(`${SERVER_URL}/api/settings?username=${currentUser}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`[${currentUser}] ⚙️ Settings loaded from server`);
            appState.botToken = result.data.botToken || appState.botToken;
            appState.channelId = result.data.channelId || appState.channelId;
            appState.apiUrl = result.data.apiUrl || appState.apiUrl;
            appState.viewMode = result.data.viewMode || 'grid';
            appState.theme = result.data.theme || 'system';
            appState.useServerStorage = true;
            
            applyTheme(appState.theme);
            return true;
        }
    } catch (error) {
        console.warn(`[${currentUser}] ⚠️ Failed to load settings from server:`, error.message);
    }
    return false;
}

/**
 * Save settings to server
 */
async function saveSettingsToServer(settings) {
    try {
        const response = await fetch(`${SERVER_URL}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, ...settings })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            console.log(`[${currentUser}] ✅ Settings saved to server`);
            return true;
        }
    } catch (error) {
        console.warn(`[${currentUser}] ⚠️ Failed to save settings to server:`, error.message);
    }
    return false;
}

/**
 * Load files data from server
 */
async function loadFilesFromServer() {
    try {
        const response = await fetch(`${SERVER_URL}/api/files?username=${currentUser}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
            appState.files = result.data;
            console.log(`[${currentUser}] 📂 Loaded ${result.data.length} files from server`);
            return true;
        }
    } catch (error) {
        console.warn(`[${currentUser}] ⚠️ Failed to load files from server:`, error.message);
    }
    return false;
}

/**
 * Save files data to server
 */
async function saveFilesToServer(files) {
    try {
        const response = await fetch(`${SERVER_URL}/api/files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, files })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            console.log(`[${currentUser}] ✅ Saved ${files.length} files to server`);
            return true;
        }
    } catch (error) {
        console.warn(`[${currentUser}] ⚠️ Failed to save files to server:`, error.message);
    }
    return false;
}

/**
 * Initialize local storage as fallback (for when server is not available)
 */
function initializeLocalStorageFallback() {
    appState.botToken = localStorage.getItem(getUserDataKey('botToken')) || appState.botToken;
    appState.channelId = localStorage.getItem(getUserDataKey('channelId')) || appState.channelId;
    appState.apiUrl = localStorage.getItem(getUserDataKey('apiUrl')) || appState.apiUrl;
    appState.viewMode = localStorage.getItem(getUserDataKey('viewMode')) || 'grid';
    appState.theme = localStorage.getItem(getUserDataKey('theme')) || 'system';
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Get file type category
 */
function getFileCategory(mimeType) {
    if (APP_CONFIG.supportedTypes.images.includes(mimeType)) return 'images';
    if (APP_CONFIG.supportedTypes.documents.includes(mimeType)) return 'documents';
    if (APP_CONFIG.supportedTypes.videos.includes(mimeType)) return 'videos';
    return 'other';
}

/**
 * Get file icon based on type
 */
function getFileIcon(mimeType, fileName = '') {
    const type = getFileCategory(mimeType);
    switch (type) {
        case 'images':
            return '🖼️';
        case 'documents':
            if (fileName.endsWith('.pdf')) return '📄';
            return '📋';
        case 'videos':
            return '🎥';
        default:
            return '📦';
    }
}

/**
 * Get thumbnail URL for image files
 * Note: Due to CORS restrictions, we'll use data URLs for uploaded images
 */
function getThumbnailUrl(file) {
    const type = getFileCategory(file.type);
    
    // Only generate thumbnails for images
    if (type !== 'images') {
        return null;
    }
    
    // For images, return existing preview if available
    if (file.thumbUrl || file.previewUrl) {
        return file.thumbUrl || file.previewUrl;
    }
    
    // For uploaded images with fileId, construct Telegram file URL
    // Using file_id in getFile endpoint to retrieve the file path
    if (file.fileId && appState.botToken) {
        // We'll need to fetch the file path asynchronously and cache it
        // For now, return a data attribute that will be processed in renderFiles
        return null; // Will be handled in renderFiles with async fetch
    }
    
    return null;
}

/**
 * Get image URL from Telegram file ID (async)
 */
async function getImageUrlFromTelegram(fileId) {
    try {
        if (!appState.botToken || !fileId) return null;
        
        const response = await fetch(`${getTelegramApiUrl()}/getFile?file_id=${fileId}`);
        const data = await response.json();
        
        if (data.ok && data.result.file_path) {
            // Construct the direct file URL
            return `${APP_CONFIG.apiBase}/file/bot${appState.botToken}/${data.result.file_path}`;
        }
    } catch (error) {
        console.error('Failed to get image URL:', error);
    }
    
    return null;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => toast.remove());

    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, duration);
}

/**
 * Deep copy object
 */
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Normalize fileId from DOM dataset (string) to number when possible
 */
function normalizeFileId(fileId) {
    const num = Number(fileId);
    return Number.isNaN(num) ? fileId : num;
}

/**
 * Theme handling
 */
function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    document.body.setAttribute('data-theme', resolved);
}

function setTheme(theme) {
    appState.theme = theme;
    applyTheme(theme);
    
    // Always save to server first (it's the source of truth)
    if (serverAvailable) {
        saveSettingsToServer({ theme });
    } else {
        // Only fall back to localStorage if server isn't available
        localStorage.setItem(getUserDataKey('theme'), theme);
        console.warn(`[${currentUser}] ⚠️ Theme saved locally only - won't sync to other devices`);
    }
}

// =====================================================
// TELEGRAM API FUNCTIONS
// =====================================================

/**
 * Get Telegram API URL
 */
function getTelegramApiUrl() {
    if (appState.apiUrl) {
        return appState.apiUrl;
    }
    return `${APP_CONFIG.apiBase}/bot${appState.botToken}`;
}

/**
 * Upload file to Telegram
 */
async function uploadFileToTelegram(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const formData = new FormData();
                formData.append('chat_id', appState.channelId);
                formData.append('document', file);
                formData.append('caption', JSON.stringify({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploadedAt: Date.now(),
                }));

                const response = await fetch(`${getTelegramApiUrl()}/sendDocument`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (!data.ok) {
                    reject(new Error(data.description || 'Upload failed'));
                } else {
                    // Extract file_id from response - try document, photo, or video
                    let fileId = '';
                    let thumbFileId = ''; // For storing thumbnail file ID
                    
                    if (data.result.document) {
                        fileId = data.result.document.file_id;
                        // If document has a thumbnail, store it
                        if (data.result.document.thumbnail) {
                            thumbFileId = data.result.document.thumbnail.file_id;
                        }
                    } else if (data.result.photo && data.result.photo.length > 0) {
                        fileId = data.result.photo[data.result.photo.length - 1].file_id; // Get largest photo
                        // Use smaller photo as thumbnail
                        if (data.result.photo.length > 1) {
                            thumbFileId = data.result.photo[0].file_id;
                        } else {
                            thumbFileId = fileId; // Use same as fileId if only one
                        }
                    } else if (data.result.video) {
                        fileId = data.result.video.file_id;
                        // If video has a thumbnail, store it
                        if (data.result.video.thumbnail) {
                            thumbFileId = data.result.video.thumbnail.file_id;
                        }
                    }
                    
                    const fileData = {
                        id: data.result.message_id,
                        fileId: fileId,
                        thumbFileId: thumbFileId, // Store thumbnail file ID
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        uploadedAt: Date.now(),
                        category: getFileCategory(file.type),
                        deleted: false,
                        messageId: data.result.message_id,
                    };
                    resolve(fileData);
                }
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Download file from Telegram
 */
async function downloadFileFromTelegram(fileId, fileName) {
    try {
        const response = await fetch(`${getTelegramApiUrl()}/getFile?file_id=${fileId}`);
        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.description || 'Download failed');
        }

        const filePath = data.result.file_path;
        const fileUrl = `${APP_CONFIG.apiBase}/file/bot${appState.botToken}/${filePath}`;

        // Try blob download first (may fail due to CORS), then fallback to direct URL
        try {
            const fileResponse = await fetch(fileUrl);
            const blob = await fileResponse.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
            showToast(`Downloaded: ${fileName}`, 'success');
        } catch (err) {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Opened download in new tab', 'info');
        }
    } catch (error) {
        showToast(`Download failed: ${error.message}`, 'error');
    }
}

/**
 * Delete file from Telegram
 */
async function deleteFileFromTelegram(messageId) {
    try {
        const usingProxy = Boolean(appState.apiUrl);
        const url = usingProxy
            ? `${appState.apiUrl.replace(/\/$/, '')}/api/delete`
            : `${getTelegramApiUrl()}/deleteMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: appState.channelId,
                message_id: messageId,
            }),
        });

        const data = await response.json();

        if (!data.ok && !(data.error && String(data.error).includes('message to delete not found'))) {
            throw new Error(data.description || data.error || 'Delete failed');
        }

        return true;
    } catch (error) {
        if (String(error.message).includes('message to delete not found')) {
            showToast('Message already deleted. Removing from list.', 'info');
            return true;
        }
        showToast(`Delete failed: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Get file from Telegram for preview
 */
async function getFileFromTelegram(fileId) {
    try {
        const response = await fetch(`${getTelegramApiUrl()}/getFile?file_id=${fileId}`);
        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.description || 'Get file failed');
        }

        const filePath = data.result.file_path;
        const fileUrl = `${APP_CONFIG.apiBase}/file/bot${appState.botToken}/${filePath}`;

        return fileUrl;
    } catch (error) {
        showToast(`Failed to get file: ${error.message}`, 'error');
        return null;
    }
}

/**
 * Test Telegram connection
 */
async function testTelegramConnection() {
    try {
        const response = await fetch(`${getTelegramApiUrl()}/getMe`);
        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.description || 'Connection failed');
        }

        // Test channel access - await was missing!
        const chatResponse = await fetch(`${getTelegramApiUrl()}/getChat?chat_id=${appState.channelId}`);
        const chatData = await chatResponse.json();

        if (!chatData.ok) {
            // Don't fail if we can't get chat - uploads might still work
            console.warn('Cannot verify channel access, but uploads may still work');
        }

        return { success: true, botName: data.result.username };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Fetch all files from Telegram channel
 */
async function fetchFilesFromTelegram() {
    try {
        const response = await fetch(`${getTelegramApiUrl()}/getChatHistory?chat_id=${appState.channelId}&limit=100`);

        // Note: getChatHistory is not available in official API
        // This is a workaround - we'll manage files locally
        return appState.files;
    } catch (error) {
        console.error('Fetch files error:', error);
        return appState.files;
    }
}

// =====================================================
// FILE MANAGEMENT
// =====================================================

/**
 * Add file to state
 */
async function addFileToState(fileData) {
    console.log(`[${currentUser}] Adding file to state:`, fileData.name);
    appState.files.unshift(fileData);
    await saveFilesToLocalStorage();
    updateStorageStats();
    renderFiles();
}

/**
 * Remove file from state
 */
async function removeFileFromState(fileId) {
    console.log(`[${currentUser}] Removing file from state, fileId:`, fileId);
    const normalizedId = normalizeFileId(fileId);
    appState.files = appState.files.filter(f => f.id !== normalizedId);
    updateStorageStats();
    await saveFilesToLocalStorage();
    renderFiles();
}

/**
 * Rename file
 */
async function renameFile(fileId, newName) {
    const file = appState.files.find(f => f.id === fileId);
    if (file) {
        file.name = newName;
        await saveFilesToLocalStorage();
        renderFiles();
    }
}

/**
 * Save files to storage (server or localStorage)
 */
/**
 * Save files to storage - always tries server first, NEVER falls back to localStorage for files
 */
async function saveFilesToLocalStorage() {
    console.log(`[${currentUser}] 💾 Saving ${appState.files.length} files...`);
    
    // Always try to save to server
    try {
        const saved = await saveFilesToServer(appState.files);
        if (saved) {
            console.log(`[${currentUser}] ✅ Files saved to server`);
            return;
        }
    } catch (error) {
        console.error(`[${currentUser}] ❌ Failed to save to server:`, error);
    }
    
    // Fallback: warn user that data can't sync across devices
    console.warn(`[${currentUser}] ⚠️ Could not save to server! Data will NOT sync to other devices.`);
}

/**
 * Load files from storage - always tries server first
 */
async function loadFilesFromLocalStorage() {
    console.log(`[${currentUser}] 📂 Loading files...`);
    
    // Always try server first
    try {
        const loaded = await loadFilesFromServer();
        if (loaded && appState.files.length > 0) {
            console.log(`[${currentUser}] ✅ Loaded ${appState.files.length} files from server`);
            return;
        } else if (loaded) {
            console.log(`[${currentUser}] ✅ Server has no files (starting fresh)`);
            appState.files = [];
            return;
        }
    } catch (error) {
        console.error(`[${currentUser}] ⚠️ Failed to load from server:`, error);
    }
    
    // Fallback: check localStorage for old data (but inform user)
    const key = getUserDataKey('teledriveFiles');
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            appState.files = JSON.parse(saved);
            console.warn(`[${currentUser}] ⚠️ Loaded files from browser storage (old device data - NOT synced). These won't sync to other devices.`);
            // Try to push this to server
            const synced = await saveFilesToServer(appState.files);
            if (synced) {
                console.log(`[${currentUser}] ✅ Local data synced to server for future devices`);
            }
        } catch (parseError) {
            console.error(`[${currentUser}] Error parsing localStorage:`, parseError);
            appState.files = [];
        }
    } else {
        console.log(`[${currentUser}] 📭 No files found - starting fresh`);
        appState.files = [];
    }
}

/**
 * Get filtered files based on view and search
 */
function getFilteredFiles() {
    let filtered = appState.files;

    // Filter by category
    if (appState.currentView === 'media') {
        // Media includes both images and videos
        filtered = filtered.filter(f => f.category === 'images' || f.category === 'videos');
    } else if (appState.currentView === 'documents') {
        filtered = filtered.filter(f => f.category === 'documents');
    } else if (appState.currentView === 'trash') {
        filtered = filtered.filter(f => f.deleted === true);
    } else if (appState.currentView !== 'all') {
        filtered = filtered.filter(f => f.category === appState.currentView);
    }

    // Filter by search query
    if (appState.searchQuery) {
        filtered = filtered.filter(f =>
            f.name.toLowerCase().includes(appState.searchQuery.toLowerCase())
        );
    }

    return filtered;
}

// =====================================================
// UI RENDERING
// =====================================================

/**
 * Render files in the container
 */
function renderFiles() {
    const container = document.getElementById('filesContainer');
    const emptyState = document.getElementById('emptyState');
    const filtered = getFilteredFiles();
    
    console.log(`[${currentUser}] Rendering files - Total in state: ${appState.files.length}, Filtered: ${filtered.length}`, filtered.map(f => f.name));

    if (filtered.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    container.innerHTML = filtered.map(file => {
        const icon = getFileIcon(file.type, file.name);
        const sizeText = formatFileSize(file.size);
        const dateText = formatDate(file.uploadedAt / 1000);
        const type = getFileCategory(file.type);
        
        // For images, prepare to load the thumbnail; for others, show emoji icon
        const previewContent = (type === 'images' && (file.thumbFileId || file.fileId)) ? 
            `<img class="file-thumbnail" data-file-id="${file.thumbFileId || file.fileId}" alt="${file.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">` 
            : `<span style="font-size: 3rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${icon}</span>`;

        return `
            <div class="file-item" data-file-id="${file.id}">
                <div class="file-preview">
                    ${previewContent}
                    <div class="file-actions">
                        <button class="file-action-btn" data-action="preview" title="Preview">👁️</button>
                        <button class="file-action-btn" data-action="download" title="Download">⬇️</button>
                        <button class="file-action-btn" data-action="delete" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-meta">
                        <span>${sizeText}</span>
                        <span>${dateText}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    attachFileItemListeners();
    loadImageThumbnails(); // Load image URLs asynchronously
    updateStorageStats();
}

/**
 * Attach event listeners to file items
 */
function attachFileItemListeners() {
    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, item.dataset.fileId);
        });

        item.querySelectorAll('.file-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const fileId = item.dataset.fileId;
                handleFileAction(action, fileId);
            });
        });

        item.addEventListener('click', (e) => {
            if (!e.target.closest('.file-action-btn')) {
                const fileId = item.dataset.fileId;
                openFilePreview(fileId);
            }
        });
    });
}

/**
 * Load image thumbnails asynchronously
 */
async function loadImageThumbnails() {
    const thumbnails = document.querySelectorAll('.file-thumbnail');
    
    for (const img of thumbnails) {
        const fileId = img.dataset.fileId;
        if (!fileId) continue;
        
        try {
            const url = await getImageUrlFromTelegram(fileId);
            if (url) {
                img.src = url;
            }
        } catch (error) {
            console.warn(`Failed to load thumbnail for ${fileId}:`, error);
        }
    }
}

/**
 * Show context menu
 */
function showContextMenu(event, fileId) {
    const menu = document.getElementById('contextMenu');
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    menu.classList.add('active');
    menu.dataset.fileId = fileId;
}

/**
 * Handle file actions
 */
function handleFileAction(action, fileId) {
    const normalizedId = normalizeFileId(fileId);
    const file = appState.files.find(f => f.id === normalizedId);
    if (!file) return;

    switch (action) {
        case 'preview':
            openFilePreview(normalizedId);
            break;
        case 'download':
            downloadFileFromTelegram(file.fileId, file.name);
            break;
        case 'delete':
            if (confirm(`Delete "${file.name}"?`)) {
                deleteFileHandler(normalizedId);
            }
            break;
        case 'rename':
            renameFileHandler(normalizedId);
            break;
        case 'share':
            shareFile(normalizedId);
            break;
    }
}

/**
 * Delete file handler
 */
async function deleteFileHandler(fileId) {
    const normalizedId = normalizeFileId(fileId);
    const file = appState.files.find(f => f.id === normalizedId);
    if (!file) return;

    try {
        const deleted = await deleteFileFromTelegram(file.id);
        if (deleted) {
            await removeFileFromState(normalizedId);
            showToast(`"${file.name}" deleted successfully`, 'success');
            closePreviewModal();
        }
    } catch (error) {
        showToast(`Failed to delete file: ${error.message}`, 'error');
    }
}

/**
 * Rename file handler
 */
function renameFileHandler(fileId) {
    const normalizedId = normalizeFileId(fileId);
    const file = appState.files.find(f => f.id === normalizedId);
    if (!file) return;

    const newName = prompt('Enter new file name:', file.name);
    if (newName && newName !== file.name) {
        renameFile(normalizedId, newName);
        showToast(`File renamed to "${newName}"`, 'success');
    }
}

/**
 * Share file (copy link to clipboard)
 */
function shareFile(fileId) {
    const normalizedId = normalizeFileId(fileId);
    const file = appState.files.find(f => f.id === normalizedId);
    if (!file) return;

    const shareUrl = `${window.location.href}?file=${normalizedId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Share link copied to clipboard', 'success');
    }).catch(() => {
        showToast('Failed to copy link', 'error');
    });
}

/**
 * Open file preview modal
 */
async function openFilePreview(fileId) {
    const normalizedId = normalizeFileId(fileId);
    const file = appState.files.find(f => f.id === normalizedId);
    if (!file) return;

    appState.currentPreviewFile = file;
    const modal = document.getElementById('previewModal');
    const title = document.getElementById('previewTitle');
    const content = document.getElementById('previewContent');

    title.textContent = file.name;

    // Show loading state
    content.innerHTML = '<p>Loading...</p>';

    // Show modal first for better UX
    modal.classList.add('active');

    try {
        const fileUrl = await getFileFromTelegram(file.fileId);
        if (!fileUrl) {
            content.innerHTML = '<p>Failed to load preview</p>';
            return;
        }

        // Display preview based on file type
        const type = getFileCategory(file.type);
        if (type === 'images') {
            content.innerHTML = `<img src="${fileUrl}" alt="${file.name}" style="max-width: 100%; height: auto;">`;
        } else if (type === 'videos') {
            content.innerHTML = `<video controls style="max-width: 100%; height: auto;"><source src="${fileUrl}" type="${file.type}"></video>`;
        } else {
            content.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">${getFileIcon(file.type, file.name)}</div>
                    <p>${file.name}</p>
                    <p style="color: #999; font-size: 0.9rem;">Size: ${formatFileSize(file.size)}</p>
                    <p style="color: #999; font-size: 0.85rem; margin-top: 0.5rem;">Preview not available for this file type</p>
                </div>
            `;
        }
    } catch (error) {
        content.innerHTML = `<p>Error loading preview: ${error.message}</p>`;
    }
}

/**
 * Close preview modal
 */
function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    modal.classList.remove('active');
    appState.currentPreviewFile = null;
}

/**
 * Update storage statistics
 */
function updateStorageStats() {
    const totalSize = appState.files.filter(f => !f.deleted).reduce((sum, f) => sum + f.size, 0);
    const usedMB = (totalSize / (1024 * 1024)).toFixed(2);
    const fileCount = appState.files.filter(f => !f.deleted).length;

    document.getElementById('usedSpace').textContent = usedMB;
    
    // Visual indicator: 1% per 100MB, max 100%
    const percentUsed = Math.min((totalSize / (100 * 1024 * 1024)) * 100, 100);
    const storageUsedEl = document.getElementById('storageUsed');
    if (storageUsedEl) {
        storageUsedEl.style.width = percentUsed + '%';
    }

    // Show file count and "Free" as total space
    document.getElementById('totalSpace').textContent = `∞ (${fileCount} files)`;
}

// =====================================================
// SETTINGS & CONFIGURATION
// =====================================================

/**
 * Open settings modal
 */
function openSettings() {
    const modal = document.getElementById('settingsModal');
    document.getElementById('botToken').value = appState.botToken;
    document.getElementById('channelId').value = appState.channelId;
    document.getElementById('apiUrl').value = appState.apiUrl;
    // Update active theme button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === appState.theme) {
            btn.classList.add('active');
        }
    });
    document.getElementById('connectionStatus').textContent = '';
    document.getElementById('connectionStatus').className = 'connection-status';
    modal.classList.add('active');
}

/**
 * Close settings modal
 */
function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('active');
}

/**
 * Save settings
 */
function saveSettings() {
    const botToken = document.getElementById('botToken').value.trim();
    const channelId = document.getElementById('channelId').value.trim();
    const apiUrl = document.getElementById('apiUrl').value.trim();

    if (!botToken || !channelId) {
        showToast('Bot token and channel ID are required', 'error');
        return;
    }

    appState.botToken = botToken;
    appState.channelId = channelId;
    appState.apiUrl = apiUrl;

    // Save to server if available, otherwise to localStorage
    if (appState.useServerStorage) {
        saveSettingsToServer({
            botToken,
            channelId,
            apiUrl,
            viewMode: appState.viewMode,
            theme: appState.theme
        });
    } else {
        localStorage.setItem(getUserDataKey('botToken'), botToken);
        localStorage.setItem(getUserDataKey('channelId'), channelId);
        localStorage.setItem(getUserDataKey('apiUrl'), apiUrl);
    }

    showToast('Settings saved successfully', 'success');
    closeSettings();
}

/**
 * Test connection to Telegram
 */
async function testConnection() {
    const botToken = document.getElementById('botToken').value.trim();
    const channelId = document.getElementById('channelId').value.trim();

    if (!botToken || !channelId) {
        showToast('Please enter bot token and channel ID', 'error');
        return;
    }

    const statusEl = document.getElementById('connectionStatus');
    statusEl.textContent = 'Testing connection...';
    statusEl.className = 'connection-status';

    const oldToken = appState.botToken;
    const oldChannelId = appState.channelId;

    appState.botToken = botToken;
    appState.channelId = channelId;

    const result = await testTelegramConnection();

    if (result.success) {
        statusEl.textContent = `✓ Connected! Bot: @${result.botName}`;
        statusEl.classList.add('success');
    } else {
        statusEl.textContent = `✗ Connection failed: ${result.error}`;
        statusEl.classList.add('error');
        appState.botToken = oldToken;
        appState.channelId = oldChannelId;
    }
}

// =====================================================
// FILE UPLOAD
// =====================================================

/**
 * Handle file upload
 */
async function handleFileUpload(files) {
    if (!appState.botToken || !appState.channelId) {
        showToast('Please configure Telegram settings first', 'error');
        openSettings();
        return;
    }

    for (const file of files) {
        if (file.size > APP_CONFIG.maxFileSize) {
            showToast(`File "${file.name}" exceeds maximum size (2GB)`, 'error');
            continue;
        }

        await uploadSingleFile(file);
    }
}

/**
 * Upload single file
 */
async function uploadSingleFile(file) {
    const progressEl = document.getElementById('uploadProgress');
    const fileNameEl = document.getElementById('uploadFileName');
    const statusEl = document.getElementById('uploadStatus');
    const progressFill = document.getElementById('progressFill');

    fileNameEl.textContent = file.name;
    progressFill.style.width = '0%';
    progressEl.style.display = 'block';

    try {
        statusEl.textContent = 'Uploading...';
        const fileData = await uploadFileToTelegram(file);

        addFileToState(fileData);

        statusEl.textContent = 'Upload complete!';
        progressFill.style.width = '100%';

        showToast(`"${file.name}" uploaded successfully`, 'success');

        setTimeout(() => {
            progressEl.style.display = 'none';
        }, 2000);
    } catch (error) {
        statusEl.textContent = `Error: ${error.message}`;
        showToast(`Upload failed: ${error.message}`, 'error');
        progressEl.style.display = 'none';
    }
}

// =====================================================
// VIEW MANAGEMENT
// =====================================================

/**
 * Switch view mode (grid/list)
 */
function switchViewMode(mode) {
    appState.viewMode = mode;
    localStorage.setItem(getUserDataKey('viewMode'), mode);

    const container = document.getElementById('filesContainer');
    if (mode === 'list') {
        container.classList.add('list-view');
    } else {
        container.classList.remove('list-view');
    }

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.view-btn[data-view="${mode}"]`).classList.add('active');

    renderFiles();
}

/**
 * Switch file category view
 */
function switchView(view) {
    appState.currentView = view;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-view="${view}"]`).classList.add('active');

    // Update section title based on view
    const viewTitles = {
        'all': 'All Files',
        'media': 'Photos & Videos',
        'documents': 'Documents'
    };
    document.getElementById('sectionTitle').textContent = viewTitles[view] || 'Files';

    renderFiles();
}

// =====================================================
// APPLICATION INITIALIZATION
// =====================================================

/**
 * Initialize the main application (called after successful login)
 */
async function initializeApp() {
    console.log(`\n🚀 Initializing app for user: ${currentUser}`);
    
    // Clear previous user's data
    appState.files = [];
    appState.currentView = 'all';
    appState.searchQuery = '';
    
    // Set current user in appState
    appState.currentUser = currentUser;
    
    // Initialize storage: try server first, fall back to localStorage
    serverAvailable = await isServerAvailable();
    
    if (serverAvailable) {
        console.log(`✅ Server storage available for user: ${currentUser}`);
        appState.useServerStorage = true;
        const loaded = await loadSettingsFromServer();
        if (!loaded) {
            // Fall back to defaults, but still use server for saving
            initializeLocalStorageFallback();
        }
    } else {
        console.warn(`⚠️ Server NOT available for user: ${currentUser} - using localStorage (won't sync across devices)`);
        appState.useServerStorage = false;
        initializeLocalStorageFallback();
    }

    // Update header with current user
    updateUserDisplay();

    // Initialize theme
    applyTheme(appState.theme);
    const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemQuery.addEventListener('change', () => {
        if (appState.theme === 'system') {
            applyTheme('system');
        }
    });

    // Load files from storage for this user
    await loadFilesFromLocalStorage();

    // Set up periodic sync to server (every 10 seconds)
    setInterval(async () => {
        if (serverAvailable && appState.files.length > 0) {
            try {
                // Silently sync in background
                await saveFilesToServer(appState.files);
            } catch (error) {
                console.debug('[BACKGROUND SYNC] Failed:', error.message);
            }
        }
    }, 10000);

    // Set up periodic polling to load files from server (every 5 seconds)
    // This ensures changes from other devices are reflected in real-time
    setInterval(async () => {
        if (!serverAvailable) return;
        
        try {
            const response = await fetch(`${SERVER_URL}/api/files?username=${currentUser}`);
            if (!response.ok) return;
            
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                // Check if files have changed
                const oldFileCount = appState.files.length;
                const newFileCount = result.data.length;
                const fileCountChanged = oldFileCount !== newFileCount;
                
                // Deep comparison: check if files are different
                const filesChanged = fileCountChanged || 
                    JSON.stringify(appState.files) !== JSON.stringify(result.data);
                
                if (filesChanged) {
                    console.log(`🔄 [${currentUser}] Files updated on another device. Old: ${oldFileCount}, New: ${newFileCount}`);
                    appState.files = result.data;
                    
                    // Re-render UI to show new files
                    renderFiles(appState.files);
                    
                    // Show notification if files were added or deleted
                    if (newFileCount > oldFileCount) {
                        const added = newFileCount - oldFileCount;
                        showToast(`📤 ${added} file(s) uploaded on another device`, 'info');
                    } else if (newFileCount < oldFileCount) {
                        const deleted = oldFileCount - newFileCount;
                        showToast(`🗑️ ${deleted} file(s) deleted on another device`, 'info');
                    }
                }
            }
        } catch (error) {
            console.debug('[POLLING] Failed to fetch updates:', error.message);
        }
    }, 5000); // Poll every 5 seconds for real-time sync

    // Upload area
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        handleFileUpload(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFileUpload(files);
        fileInput.value = '';
    });

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    document.getElementById('cancelSettings').addEventListener('click', closeSettings);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('testConnection').addEventListener('click', testConnection);
    // Theme buttons - apply changes immediately without saving
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.closest('.theme-btn').dataset.theme;
            setTheme(theme);
            // Update active state
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            e.target.closest('.theme-btn').classList.add('active');
        });
    });

    // Preview modal
    document.getElementById('closePreview').addEventListener('click', closePreviewModal);
    document.getElementById('closePreviewBtn').addEventListener('click', closePreviewModal);
    document.getElementById('downloadFile').addEventListener('click', () => {
        if (appState.currentPreviewFile) {
            downloadFileFromTelegram(appState.currentPreviewFile.fileId, appState.currentPreviewFile.name);
        }
    });
    document.getElementById('deleteFile').addEventListener('click', () => {
        if (appState.currentPreviewFile) {
            if (confirm(`Delete "${appState.currentPreviewFile.name}"?`)) {
                deleteFileHandler(appState.currentPreviewFile.id);
            }
        }
    });

    // View switching
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.dataset.view);
        });
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchViewMode(btn.dataset.view);
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        appState.searchQuery = e.target.value;
        renderFiles();
    });

    // Filter button
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            showToast('Advanced filters coming soon!', 'info');
        });
    }

    // Context menu
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.querySelectorAll('.context-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const action = item.dataset.action;
            const fileId = contextMenu.dataset.fileId;
            handleFileAction(action, fileId);
            contextMenu.classList.remove('active');
        });
    });

    // Close context menu on click outside
    document.addEventListener('click', () => {
        contextMenu.classList.remove('active');
    });

    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Initialize view mode
    switchViewMode(appState.viewMode);

    // Render files
    renderFiles();

    // Update storage stats
    updateStorageStats();
}

/**
 * Update user display in header
 */
function updateUserDisplay() {
    const userDisplay = document.getElementById('currentUser');
    if (userDisplay && currentUser) {
        userDisplay.textContent = `👤 ${currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}`;
    }
}

// =====================================================
// EVENT LISTENERS
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize authentication first
    initializeAuth();

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            handleLogin(username, password);
        });
    }

    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Mobile menu toggle handler
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (mobileMenuToggle && sidebar && sidebarOverlay) {
        mobileMenuToggle.addEventListener('click', () => {
            const isActive = mobileMenuToggle.classList.toggle('active');
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            
            // Prevent body scroll when sidebar is open on mobile
            if (isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close sidebar when clicking overlay
        sidebarOverlay.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close sidebar when clicking a nav item on mobile
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    mobileMenuToggle.classList.remove('active');
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Handle window resize - close menu if resizing to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                mobileMenuToggle.classList.remove('active');
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

// =====================================================
// HANDLE SHARED FILES (via URL query params)
// =====================================================

window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const fileId = params.get('file');
    if (fileId) {
        const file = appState.files.find(f => f.id === parseInt(fileId));
        if (file) {
            openFilePreview(parseInt(fileId));
        }
    }
});
