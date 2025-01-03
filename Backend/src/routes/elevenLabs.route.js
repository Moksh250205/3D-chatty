const express = require('express');
const {textToSpeechController} = require('../controllers/elevenLabs.controller')

const router = express.Router();

router.post('/', textToSpeechController);

module.exports = router;
