// Files API - GET and POST
// Note: Vercel has read-only filesystem, so we return empty data
// Client should use localStorage for file metadata

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
        console.log(`[API] GET files for user: ${username}`);
        // Return empty - client should use localStorage
        return res.status(200).json({
            success: true,
            data: [],
            note: 'Using localStorage on client. Vercel serverless has no persistent storage.'
        });
    }

    if (req.method === 'POST') {
        const { files } = req.body;
        console.log(`[API] POST files for user: ${username}, count: ${files?.length || 0}`);
        
        // Accept but note that files won't persist on serverless
        return res.status(200).json({
            success: true,
            data: files || [],
            message: 'Files received (client should use localStorage)',
            note: 'Vercel serverless has no persistent storage. Use localStorage.'
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
