const ttsService = require("../services/elevenLabs.service");

const textToSpeechController = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const audioStream = await ttsService.textToSpeechService(prompt);
        
        res.setHeader('Content-Type', 'audio/mpeg');
        audioStream.pipe(res);
    } catch (error) {
        console.error('Error in text-to-speech conversion:', error);
        res.status(500).json({ 
            success: false,
            error: 'An error occurred during text-to-speech conversion.' 
        });
    }
};

module.exports = { textToSpeechController };