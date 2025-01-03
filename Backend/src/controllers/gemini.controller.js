const {handleChat} = require('../services/gemini-chat.service');

const getGeneratedResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    const { user }= req;
    
    if (!user || !prompt) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId and message are required' 
      });
    }

    const response = await handleChat(user.id, prompt );
    res.json(response);
    
  } catch (error) {
    console.error('Error in getGeneratedResponse:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
};

module.exports = {
  getGeneratedResponse
};