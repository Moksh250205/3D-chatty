const express = require('express');
const geminiController = require('../controllers/gemini.controller');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.post('/', authenticateToken,  geminiController.getGeneratedResponse);

module.exports = router;
