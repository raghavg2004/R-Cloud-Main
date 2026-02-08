// Health check endpoint
module.exports = (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'TeleDrive server is running',
        timestamp: new Date().toISOString()
    });
};
