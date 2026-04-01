/**
 * TELEDRIVE BACKEND SERVER (Optional)
 * 
 * This is an optional Node.js proxy server that handles
 * Telegram API calls. Use this for better reliability
 * and to avoid CORS issues.
 * 
 * Setup:
 * 1. npm install express
 * 2. Set BOT_TOKEN environment variable
 * 3. node server.js
 * 4. In TeleDrive settings, set API Server URL to http://localhost:3000
 */

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || '8582665455:AAE8GProeUEPhAPxzaix388lh8PeUrTSXr4';
const TELEGRAM_API = 'https://api.telegram.org';

// Detect if running on Vercel (serverless environment)
const IS_VERCEL = !!process.env.VERCEL;
console.log(`[INIT] Running on Vercel: ${IS_VERCEL}`);

// In-memory storage for Vercel (ephemeral filesystem)
const IN_MEMORY_STORAGE = {
    settings: {},
    files: {}
};

// Data storage directory (for local development only)
const DATA_DIR = path.join(__dirname, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const FILES_FILE = path.join(DATA_DIR, 'files.json');

// Create data directory if it doesn't exist (local only)
if (!IS_VERCEL && !fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created data directory: ${DATA_DIR}`);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Serve the main UI at root so the app runs directly via npm run dev
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// File upload middleware (50MB max)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB in memory, let Telegram handle 2GB
    }
});

// Helper function to get user-specific file path (local only)
function getUserDataFile(filename, username) {
    const userDir = path.join(DATA_DIR, username);
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }
    return path.join(userDir, filename);
}

// Helper function to read settings (Vercel or local)
function readSettings(username = 'default') {
    try {
        // Use in-memory storage on Vercel
        if (IS_VERCEL) {
            if (!IN_MEMORY_STORAGE.settings[username]) {
                IN_MEMORY_STORAGE.settings[username] = {
                    botToken: '8582665455:AAE8GProeUEPhAPxzaix388lh8PeUrTSXr4',
                    channelId: '-1003772832057',
                    apiUrl: '',
                    viewMode: 'grid',
                    theme: 'system'
                };
            }
            return IN_MEMORY_STORAGE.settings[username];
        }
        
        // Use file-based storage locally
        const settingsFile = getUserDataFile('settings.json', username);
        if (fs.existsSync(settingsFile)) {
            const data = fs.readFileSync(settingsFile, 'utf8');
            return JSON.parse(data);
        }
        // Return default settings if file doesn't exist
        return {
            botToken: '8582665455:AAE8GProeUEPhAPxzaix388lh8PeUrTSXr4',
            channelId: '-1003772832057',
            apiUrl: '',
            viewMode: 'grid',
            theme: 'system'
        };
    } catch (error) {
        console.error('Error reading settings:', error);
        return {
            botToken: '8582665455:AAE8GProeUEPhAPxzaix388lh8PeUrTSXr4',
            channelId: '-1003772832057',
            apiUrl: '',
            viewMode: 'grid',
            theme: 'system'
        };
    }
}

// Helper function to save settings (Vercel or local)
function saveSettings(settings, username = 'default') {
    try {
        // Use in-memory storage on Vercel
        if (IS_VERCEL) {
            IN_MEMORY_STORAGE.settings[username] = settings;
            console.log(`[SERVER] ✅ Saved settings for user "${username}" (in-memory on Vercel)`);
            return true;
        }
        
        // Use file-based storage locally
        const settingsFile = getUserDataFile('settings.json', username);
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

// Helper function to read files data (Vercel or local)
function readFilesData(username = 'default') {
    try {
        // Use in-memory storage on Vercel
        if (IS_VERCEL) {
            if (!IN_MEMORY_STORAGE.files[username]) {
                IN_MEMORY_STORAGE.files[username] = [];
            }
            const count = IN_MEMORY_STORAGE.files[username].length;
            console.log(`[SERVER] ✅ Found ${count} files for user "${username}" (in-memory on Vercel)`);
            return IN_MEMORY_STORAGE.files[username];
        }
        
        // Use file-based storage locally
        const filesFile = getUserDataFile('files.json', username);
        console.log(`[SERVER] Reading files for user "${username}" from: ${filesFile}`);
        if (fs.existsSync(filesFile)) {
            const data = fs.readFileSync(filesFile, 'utf8');
            const parsed = JSON.parse(data);
            console.log(`[SERVER] ✅ Found ${parsed.length} files for user "${username}"`);
            return parsed;
        }
        console.log(`[SERVER] 📭 No files found for user "${username}" (file does not exist)`);
        return [];
    } catch (error) {
        console.error(`[SERVER] ❌ Error reading files data for user "${username}":`, error);
        return [];
    }
}

// Helper function to save files data (Vercel or local)
function saveFilesData(filesData, username = 'default') {
    try {
        // Use in-memory storage on Vercel
        if (IS_VERCEL) {
            IN_MEMORY_STORAGE.files[username] = filesData;
            console.log(`[SERVER] ✅ Saved ${filesData.length} files for user "${username}" (in-memory on Vercel)`);
            return true;
        }
        
        // Use file-based storage locally
        const filesFile = getUserDataFile('files.json', username);
        console.log(`[SERVER] Saving ${filesData.length} files for user "${username}" to: ${filesFile}`);
        fs.writeFileSync(filesFile, JSON.stringify(filesData, null, 2), 'utf8');
        console.log(`[SERVER] ✅ Saved ${filesData.length} files for user "${username}"`);
        return true;
    } catch (error) {
        console.error(`[SERVER] ❌ Error saving files data for user "${username}":`, error);
        return false;
    }
}

// Helper function to make Telegram API requests
async function telegramAPI(method, data, file = null) {
    try {
        const url = `${TELEGRAM_API}/bot${BOT_TOKEN}/${method}`;

        let options;
        if (file) {
            // Handle file upload
            const FormData = require('form-data');
            const form = new FormData();

            // Add all data fields
            Object.keys(data).forEach(key => {
                form.append(key, data[key]);
            });

            // Add file
            form.append('document', file.buffer, file.originalname);

            options = {
                method: 'POST',
                body: form,
                headers: form.getHeaders(),
            };
        } else {
            // Regular API request
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            };
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!result.ok) {
            throw new Error(result.description || 'Telegram API error');
        }

        return result;
    } catch (error) {
        console.error('Telegram API error:', error);
        throw error;
    }
}

// ====================================
// DATA STORAGE ROUTES
// ====================================

/**
 * Get all settings
 * GET /api/settings?username=<username>
 */
app.get('/api/settings', (req, res) => {
    try {
        const username = req.query.username || 'default';
        const settings = readSettings(username);
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Save settings
 * POST /api/settings
 * Body: { username, botToken, channelId, apiUrl, viewMode, theme }
 */
app.post('/api/settings', (req, res) => {
    try {
        const { username = 'default', ...settingData } = req.body;
        const settings = readSettings(username);
        const updatedSettings = { ...settings, ...settingData };
        
        if (saveSettings(updatedSettings, username)) {
            res.json({
                success: true,
                data: updatedSettings,
                message: 'Settings saved successfully for user: ' + username
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to save settings'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get all files data
 * GET /api/files?username=<username>
 */
app.get('/api/files', (req, res) => {
    try {
        const username = req.query.username || 'default';
        console.log(`[SERVER API] GET /api/files?username=${username}`);
        const filesData = readFilesData(username);
        console.log(`[SERVER API] ✅ Returning ${filesData.length} files for user "${username}"`);
        res.json({
            success: true,
            data: filesData
        });
    } catch (error) {
        console.error('[SERVER API] ❌ Error fetching files:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Save files data
 * POST /api/files
 * Body: { username, files: [...] }
 */
app.post('/api/files', (req, res) => {
    try {
        const { username = 'default', files } = req.body;
        console.log(`[SERVER API] POST /api/files with username=${username}, files count=${files?.length || 0}`);
        
        if (!Array.isArray(files)) {
            console.error(`[SERVER API] ❌ Files is not an array for user "${username}"`);
            return res.status(400).json({
                success: false,
                error: 'Files must be an array'
            });
        }
        
        if (saveFilesData(files, username)) {
            console.log(`[SERVER API] ✅ Successfully saved ${files.length} files for user "${username}"`);
            res.json({
                success: true,
                data: files,
                message: 'Files data saved successfully for user: ' + username
            });
        } else {
            console.error(`[SERVER API] ❌ Failed to save files for user "${username}"`);
            res.status(500).json({
                success: false,
                error: 'Failed to save files data'
            });
        }
    } catch (error) {
        console.error('[SERVER API] ❌ Error saving files:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ====================================
// API ROUTES
// ====================================

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'TeleDrive server is running' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'TeleDrive server is running' });
});

/**
 * Test connection to Telegram
 * POST /api/test-connection
 * Body: { botToken, channelId }
 */
app.post('/api/test-connection', async (req, res) => {
    try {
        const { botToken, channelId } = req.body;

        if (!botToken || !channelId) {
            return res.status(400).json({
                success: false,
                error: 'Bot token and channel ID are required'
            });
        }

        // Test bot access
        const getMeUrl = `${TELEGRAM_API}/bot${botToken}/getMe`;
        const getMeResponse = await fetch(getMeUrl);
        const meData = await getMeResponse.json();

        if (!meData.ok) {
            return res.status(400).json({
                success: false,
                error: 'Invalid bot token'
            });
        }

        // Test channel access
        const getChatUrl = `${TELEGRAM_API}/bot${botToken}/getChat?chat_id=${channelId}`;
        const getChatResponse = await fetch(getChatUrl);
        const chatData = await getChatResponse.json();

        if (!chatData.ok) {
            return res.status(400).json({
                success: false,
                error: 'Cannot access channel. Ensure bot is admin.'
            });
        }

        res.json({
            success: true,
            botName: meData.result.username,
            channelTitle: chatData.result.title
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Upload file to Telegram
 * POST /api/upload
 * Body: multipart/form-data with file, chat_id, caption
 */
app.post('/api/upload', upload.single('document'), async (req, res) => {
    try {
        const { chat_id, caption } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file provided'
            });
        }

        if (!chat_id) {
            return res.status(400).json({
                success: false,
                error: 'Channel ID is required'
            });
        }

        const data = {
            chat_id: chat_id,
        };

        if (caption) {
            data.caption = caption;
        }

        const result = await telegramAPI('sendDocument', data, req.file);

        res.json({
            success: true,
            data: result.result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get file download link
 * POST /api/get-file
 * Body: { file_id }
 */
app.post('/api/get-file', async (req, res) => {
    try {
        const { file_id } = req.body;

        if (!file_id) {
            return res.status(400).json({
                success: false,
                error: 'File ID is required'
            });
        }

        const result = await telegramAPI('getFile', { file_id });
        const filePath = result.result.file_path;
        const downloadUrl = `${TELEGRAM_API}/file/bot${BOT_TOKEN}/${filePath}`;

        res.json({
            success: true,
            downloadUrl: downloadUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Delete message (file)
 * POST /api/delete
 * Body: { chat_id, message_id }
 */
app.post('/api/delete', async (req, res) => {
    try {
        const { chat_id, message_id } = req.body;

        if (!chat_id || !message_id) {
            return res.status(400).json({
                success: false,
                error: 'Chat ID and message ID are required'
            });
        }

        const result = await telegramAPI('deleteMessage', {
            chat_id: chat_id,
            message_id: message_id
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get chat history
 * POST /api/get-history
 * Body: { chat_id, limit }
 */
app.post('/api/get-history', async (req, res) => {
    try {
        const { chat_id, limit = 100 } = req.body;

        if (!chat_id) {
            return res.status(400).json({
                success: false,
                error: 'Chat ID is required'
            });
        }

        // Note: getChatHistory is not available in official API
        // This would need custom implementation or polling

        res.json({
            success: true,
            message: 'File history retrieval not available in Telegram Bot API',
            data: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get chat info
 * POST /api/get-chat
 * Body: { chat_id }
 */
app.post('/api/get-chat', async (req, res) => {
    try {
        const { chat_id } = req.body;

        if (!chat_id) {
            return res.status(400).json({
                success: false,
                error: 'Chat ID is required'
            });
        }

        const result = await telegramAPI('getChat', { chat_id });

        res.json({
            success: true,
            data: result.result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: 'Endpoint not found'
        });
    }

    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`TeleDrive Backend Server`);
        console.log(`====================================`);
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
        console.log(`Data Directory: ${DATA_DIR}`);
        console.log(`====================================`);
        console.log(`Data Storage Endpoints:`);
        console.log(`  GET  /api/settings     - Get all settings`);
        console.log(`  POST /api/settings     - Save settings`);
        console.log(`  GET  /api/files        - Get all files data`);
        console.log(`  POST /api/files        - Save files data`);
        console.log(`Telegram API Endpoints:`);
        console.log(`  GET  /health           - Health check`);
        console.log(`  GET  /api/health       - Health check (serverless)`);
        console.log(`  POST /api/test-connection`);
        console.log(`  POST /api/upload`);
        console.log(`  POST /api/get-file`);
        console.log(`  POST /api/delete`);
        console.log(`  POST /api/get-history`);
        console.log(`  POST /api/get-chat`);
    });
}

module.exports = app;
