// Settings API - GET and POST
const fs = require('fs');
const path = require('path');

// Since Vercel is read-only filesystem, we'll need to use a database
// For now, return default settings (users should use localStorage on client)
const DEFAULT_SETTINGS = {
    botToken: '',
    channelId: '',
    apiUrl: '',
    viewMode: 'grid',
    theme: 'system'
};

module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const username = req.query.username || req.body?.username || 'default';

    if (req.method === 'GET') {
        console.log(`[API] GET settings for user: ${username}`);
        // Return default settings - client should use localStorage
        return res.status(200).json({
            success: true,
            data: DEFAULT_SETTINGS,
            note: 'Using localStorage on client. Vercel serverless is stateless.'
        });
    }

    if (req.method === 'POST') {
        console.log(`[API] POST settings for user: ${username}`);
        // Accept but note that settings won't persist on serverless
        return res.status(200).json({
            success: true,
            data: req.body,
            message: 'Settings received (client should use localStorage)',
            note: 'Vercel serverless is stateless. Use localStorage for persistence.'
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
