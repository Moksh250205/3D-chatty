const axios = require('axios');
const stream = require('stream');
const { promisify } = require('util');

// Text to Speech Service
const textToSpeechService = async (prompt) => {
    try {
        if (!prompt) throw new Error('Text is required');

        const voiceId = process.env.VOICE_ID;
        const apiKey = process.env.ELEVENLABS_API_KEY;

        if (!voiceId) throw new Error('Voice ID is missing');
        if (!apiKey) throw new Error('API key is missing');

        const response = await axios({
            method: 'POST',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            data: {
                text: prompt,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.99,
                    similarity_boost: 0.62, 
                }
            },
            responseType: 'stream'
        });

        console.log('Text-to-speech response stream received');

        const buffers = [];
        response.data.on('data', chunk => {
            buffers.push(chunk);
        });

        await new Promise((resolve, reject) => {
            response.data.on('end', resolve);
            response.data.on('error', reject);
        });

        const audioBuffer = Buffer.concat(buffers);
        const audioFileUrl = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;
        return audioFileUrl;

    } catch (error) {
        if (error.response) {
            console.error('API Response Error:', error.response.data);
        } else if (error.request) {
            console.error('No Response Received:', error.request);
        } else {
            console.error('Error:', error.message);
        }
        throw error;
    }
};

module.exports = { textToSpeechService };