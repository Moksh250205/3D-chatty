const geminiService = require('../services/gemini.services');

exports.getGeneratedResponse = async (req, res) => {
  try {
    const { prompt, chatHistory } = req.body; 

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const history = Array.isArray(chatHistory) ? chatHistory : [];

    const response = await geminiService.generateResponse(prompt, history);

    res.status(200).json( response );
  } catch (error) {
    res.status(500).json({ message: "Failed to generate response", error: error.message });
  }
};
