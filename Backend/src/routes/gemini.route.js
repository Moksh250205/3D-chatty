const express = require('express');
const geminiController = require('../controllers/gemini.controller');

const router = express.Router();

router.post('/', geminiController.getGeneratedResponse);

module.exports = router;
