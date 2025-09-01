const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    // Serve the index.html from the public directory
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;