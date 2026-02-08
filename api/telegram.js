// Telegram API Proxy
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { method, token, data } = req.body;

    if (!method || !token) {
        return res.status(400).json({ 
            error: 'Missing required fields: method and token' 
        });
    }

    try {
        const url = `https://api.telegram.org/bot${token}/${method}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data || {})
        });

        const result = await response.json();
        
        return res.status(response.status).json(result);
    } catch (error) {
        console.error('[API] Telegram proxy error:', error);
        return res.status(500).json({ 
            error: 'Failed to proxy request to Telegram',
            message: error.message 
        });
    }
};
