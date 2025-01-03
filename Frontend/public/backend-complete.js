// models/conversation.model.js
const mongoose = require('mongoose');

const ConversationSummarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  summary: { type: String, required: true },
  keyTopics: [String],
  emotionalContext: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ConversationSummary', ConversationSummarySchema);

// models/chat.model.js
const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['user', 'ai'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);

// models/user.model.js
const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  gender: String,
  lastActive: Date,
  personalityInsights: {
    interests: [String],
    emotionalPatterns: Object,
    preferredTopics: [String]
  }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);

// services/gemini.service.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const DEFAULT_FUNCTION = "Idle";
const VALID_FUNCTIONS = [
  "StandingGreeting", "Bashful", "Clap", "SillyDance",
  "BellyDance", "FlyingKiss", "Kiss", "Idle",
  "Thinking", "Agreeing", "Singing"
];

const generateResponse = async (prompt, chatHistory = [], conversationState = {}) => {
  try {
    conversationState = {
      emotionalContext: conversationState.emotionalContext || null,
      sadnessAttempts: conversationState.sadnessAttempts || 0,
      lastUserMessage: prompt
    };

    const isSadnessContext =
      prompt.toLowerCase().includes('upset') ||
      prompt.toLowerCase().includes('sad') ||
      prompt.toLowerCase().includes('not talk about it');

    const isResistance =
      prompt.toLowerCase().includes('nevermind') ||
      prompt.toLowerCase().includes('lets not talk about it') ||
      prompt.toLowerCase().includes('lets not talk');

    if (isSadnessContext) {
      conversationState.emotionalContext = 'sadness';
      conversationState.sadnessAttempts = (conversationState.sadnessAttempts || 0) + 1;
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: `You are an emotionally intelligent female human who is 24 years old...`  // Your existing system instruction here
    });

    const chat = model.startChat({
      history: chatHistory
    });

    const result = await chat.sendMessage(prompt);
    const aiResponse = result.response.text();
    
    let functionCall = DEFAULT_FUNCTION;
    let responseText = aiResponse;

    const lines = aiResponse.split('\n');
    if (lines.length > 0) {
      const possibleFunction = lines[0].trim();
      if (VALID_FUNCTIONS.includes(possibleFunction)) {
        functionCall = possibleFunction;
        responseText = lines.slice(1).join('\n').trim();
      }
    }

    if (functionCall === DEFAULT_FUNCTION && !VALID_FUNCTIONS.includes(lines[0].trim())) {
      responseText = aiResponse.trim();
    }

    if (conversationState.sadnessAttempts > 2) {
      conversationState.emotionalContext = null;
      conversationState.sadnessAttempts = 0;
    }

    return {
      functionCall,
      AIresponse: responseText,
      conversationState
    };
  } catch (error) {
    console.error("Error generating response:", error);
    return {
      functionCall: DEFAULT_FUNCTION,
      AIresponse: "I apologize, but I encountered an error. Could you please try again?",
      conversationState
    };
  }
};

const generateSummary = async (messages) => {
  const prompt = `Summarize this conversation concisely, identify key topics and emotional context. 
    Focus on important details that might be relevant for future conversations: ${JSON.stringify(messages)}`;
  
  const result = await generateResponse(prompt, [], {});
  
  return {
    text: result.AIresponse,
    topics: extractKeyTopics(result.AIresponse),
    emotion: result.conversationState.emotionalContext
  };
};

const extractKeyTopics = (summary) => {
  const commonTopics = ['greeting', 'personal', 'technical', 'emotional', 'casual'];
  const topics = [];
  
  commonTopics.forEach(topic => {
    if (summary.toLowerCase().includes(topic)) {
      topics.push(topic);
    }
  });
  
  return topics;
};

module.exports = {
  generateResponse,
  generateSummary
};

// services/session.service.js
const ConversationSummary = require('../models/conversation.model');
const { generateSummary } = require('./gemini.service');

const activeSessions = new Map();
const MESSAGE_THRESHOLD = 15;
const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const handleMessage = async (userId, sessionId, message, type) => {
  let session = activeSessions.get(sessionId);
  
  if (!session) {
    session = {
      userId,
      messages: [],
      lastActive: Date.now(),
      timeoutId: null
    };
    activeSessions.set(sessionId, session);
  }

  session.messages.push({ message, type, timestamp: Date.now() });
  session.lastActive = Date.now();

  if (session.timeoutId) {
    clearTimeout(session.timeoutId);
  }
  session.timeoutId = setTimeout(() => handleInactiveSession(sessionId), INACTIVE_TIMEOUT);

  if (session.messages.length >= MESSAGE_THRESHOLD) {
    await generateAndStoreSummary(session);
    session.messages = [];
  }
};

const handleInactiveSession = async (sessionId) => {
  const session = activeSessions.get(sessionId);
  if (session && session.messages.length > 0) {
    await generateAndStoreSummary(session);
  }
  activeSessions.delete(sessionId);
};

const generateAndStoreSummary = async (session) => {
  const summary = await generateSummary(session.messages);
  await ConversationSummary.create({
    userId: session.userId,
    summary: summary.text,
    keyTopics: summary.topics,
    emotionalContext: summary.emotion
  });
};

module.exports = {
  handleMessage,
  handleInactiveSession
};

// services/context.service.js
const UserProfile = require('../models/user.model');
const ConversationSummary = require('../models/conversation.model');
const ChatMessage = require('../models/chat.model');

const getContextForUser = async (userId) => {
  const user = await UserProfile.findById(userId);
  
  const recentSummaries = await ConversationSummary
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(5);
  
  const currentSession = await ChatMessage
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(15);

  return buildContextPrompt(user, recentSummaries, currentSession);
};

const buildContextPrompt = (user, summaries, currentSession) => {
  return `User Context:
    Name: ${user.name}
    Age: ${user.age}
    Gender: ${user.gender}
    Interests: ${user.personalityInsights.interests.join(', ')}
    
    Recent Conversation History:
    ${summaries.map(s => `- ${s.summary}`).join('\n')}
    
    Current Session Context:
    ${currentSession.map(m => `${m.type}: ${m.message}`).join('\n')}`;
};

module.exports = {
  getContextForUser
};

// controllers/gemini.controller.js
const { generateResponse } = require('../services/gemini.service');
const { handleMessage } = require('../services/session.service');
const { getContextForUser } = require('../services/context.service');

const handleChat = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const sessionId = req.sessionID;

    const context = await getContextForUser(userId);
    const response = await generateResponse(message, [], { context });
    
    await handleMessage(userId, sessionId, message, 'user');
    await handleMessage(userId, sessionId, response.AIresponse, 'ai');
    
    res.json({
      success: true,
      data: {
        response: response.AIresponse,
        function: response.functionCall
      }
    });
  } catch (error) {
    console.error('Chat handler error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  handleChat
};

// routes/gemini.route.js
const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/gemini.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/chat', authMiddleware, handleChat);

module.exports = router;

// middlewares/auth.middleware.js
const authMiddleware = async (req, res, next) => {
  try {
    // Add your authentication logic here
    // For example, verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    // Verify token and attach user to request
    // req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

module.exports = authMiddleware;

// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const geminiRoutes = require('./routes/gemini.route');

const app = express();

app.use(express.json());
app.use('/api/gemini', geminiRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
