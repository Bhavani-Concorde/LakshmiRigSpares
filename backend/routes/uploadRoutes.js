const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload');

router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: `/${req.file.path.replace(/\\/g, '/')}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error uploading file: ${error.message}` });
    }
});

module.exports = router;
