const authService = require("../services/auth.service");

exports.login = async (req, res) => {
  const userData = req.body;

  try {
    const response = await authService.loginUser(userData);
    res.status(200).json(response); 
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.register = async (req, res) => {
    const userData = req.body;
    try {
      const response = await authService.registerUser(userData);
      res.status(200).json(response); 
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };