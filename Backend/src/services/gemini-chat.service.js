const Chat = require('../models/Chat.model');
const User = require('../models/User.model'); 
const { generateResponse } = require('./gemini.service');

const { textToSpeechService } = require('../services/elevenLabs.service');

async function handleChat(userId, userMessage) {
  try {

    let chatHistory = await Chat.findOne({ userId }).populate('userId');
    if (!chatHistory) {
      chatHistory = new Chat({
        userId,
        allChats: [],
        monthlySummary: [],
        yearlySummary: []
      });
    }

    chatHistory.allChats.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    const user = await User.findById(userId);
    const { name, age, gender } = user;

    const relevantChats = {
      ...chatHistory.toObject(),
      allChats: chatHistory.allChats.slice(-80)
    };
    const contextualHistory = await enrichChatContext(relevantChats);

    const response = await generateResponse(userMessage, contextualHistory, age, name, gender);

    chatHistory.allChats.push({
      role: 'model',
      content: response.AIresponse,
      timestamp: new Date()
    });

    chatHistory.save(); 

    if (chatHistory.allChats.length % 20 === 0) {
      handlePeriodicUpdates(userId, chatHistory).catch(error =>
        console.error('Periodic update error:', error)
      );
    }

    const audioFileUrl = await textToSpeechService(response.TextForTTS);

    return {
      message: response.AIresponse,
      function: response.functionCall,
      audioUrl: audioFileUrl
    };
  } catch (error) {
    console.error('Error in handleChat:', error);
    throw error;
  }
}

module.exports = { handleChat };


async function enrichChatContext(chatHistory) {
  try {
    const user = await User.findById(chatHistory.userId);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const formattedHistory = chatHistory.allChats.map(chat => ({
      role: chat.role.toLowerCase() === 'model' ? 'model' : 'user',
      parts: [{ text: chat.content || '' }]
    }));

    if (user?.humanAnalysis || (chatHistory.monthlySummary || []).length || (chatHistory.yearlySummary || []).length) {
      const currentMonthSummary = (chatHistory.monthlySummary || []).find(
        s => s.year === currentYear && s.month === currentMonth
      );
      
      const currentYearSummary = (chatHistory.yearlySummary || []).find(
        s => s.year === currentYear
      );

      formattedHistory.push({
        role: 'user',
        parts: [{
          text: `System Context Update:\n${
            user?.humanAnalysis ? `User Profile: ${user.humanAnalysis}\n` : ''
          }${
            currentMonthSummary ? `Monthly Overview: ${currentMonthSummary.summary}\n` : ''
          }${
            currentYearSummary ? `Yearly Progress: ${currentYearSummary.summary}` : ''
          }`
        }]
      });
    }

    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.unshift({
        role: 'user',
        parts: [{ text: 'Start chat' }]
      });
    }

    return formattedHistory;
  } catch (error) {
    console.error('Error enriching chat context:', error);
    return [{
      role: 'user',
      parts: [{ text: 'Start chat' }]
    }].concat(chatHistory.allChats.map(chat => ({
      role: chat.role.toLowerCase() === 'model' ? 'model' : 'user',
      parts: [{ text: chat.content || '' }]
    })));
  }
}

async function handlePeriodicUpdates(userId, chatHistory) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  try {
    const [monthlySummary, yearlySummary, humanAnalysis] = await Promise.all([
      generateMonthlySummary(userId, year, month),
      generateYearlySummary(userId, year),
      updateHumanAnalysis(userId, chatHistory)
    ]);

  } catch (error) {
    console.error('Error in periodic updates:', error);
    throw error;
  }
}

async function generateMonthlySummary(userId, year, month) {
  try {
    const chat = await Chat.findOne({ userId });
    if (!chat?.allChats?.length) return null;

    const monthlyChats = chat.allChats.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      return msgDate.getFullYear() === year && msgDate.getMonth() === month;
    });

    if (!monthlyChats.length) return null;

    const formattedChats = monthlyChats.map(msg => ({
      role: msg.role.toLowerCase() === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content || '' }]
    }));

    const summaryPrompt = {
      text: `Please analyze these conversations and provide a detailed monthly summary focusing on:
        1. Main discussion themes and patterns
        2. Emotional trends and significant moments
        3. Growth areas and progress
        4. Key interests and recurring topics
        5. Communication style evolution`
    };

    const summary = await generateResponse(summaryPrompt.text, formattedChats);

    const existingSummary = await Chat.findOne({
      userId,
      'monthlySummary': { 
        $elemMatch: { 
          year, 
          month 
        } 
      }
    });

    if (existingSummary) {
      await Chat.findOneAndUpdate(
        { userId },
        {
          $set: { 
            'monthlySummary.$[elem].summary': summary.AIresponse 
          }
        },
        {
          arrayFilters: [{ 'elem.year': year, 'elem.month': month }],
          new: true
        }
      );
    } else {
      // Add new summary
      await Chat.findOneAndUpdate(
        { userId },
        {
          $push: {
            monthlySummary: {
              year,
              month,
              summary: summary.AIresponse
            }
          }
        }
      );
    }
    console.log(summary.AIresponse); 
    return summary.AIresponse;
  } catch (error) {
    console.error('Error generating monthly summary:', error);
    throw error;
  }
}

async function generateYearlySummary(userId, year) {
  try {
    const chat = await Chat.findOne({ userId });
    if (!chat?.allChats?.length) return null;

    const yearlyChats = chat.allChats.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      return msgDate.getFullYear() === year;
    });

    if (!yearlyChats.length) return null;

    const formattedChats = yearlyChats.map(msg => ({
      role: msg.role.toLowerCase() === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content || '' }]
    }));

    const summaryPrompt = {
      text: `Please provide a comprehensive yearly summary analyzing:
        1. Overall communication patterns
        2. Major themes and developments
        3. Personal growth trajectory
        4. Key milestones and insights
        5. Long-term trends and changes`
    };

    const summary = await generateResponse(summaryPrompt.text, formattedChats);

    const existingSummary = await Chat.findOne({
      userId,
      'yearlySummary': { 
        $elemMatch: { 
          year 
        } 
      }
    });

    if (existingSummary) {
      await Chat.findOneAndUpdate(
        { userId },
        {
          $set: { 
            'yearlySummary.$[elem].summary': summary.AIresponse 
          }
        },
        {
          arrayFilters: [{ 'elem.year': year }],
          new: true
        }
      );
    } else {
      await Chat.findOneAndUpdate(
        { userId },
        {
          $push: {
            yearlySummary: {
              year,
              summary: summary.AIresponse
            }
          }
        }
      );
    }

    return summary.AIresponse;
  } catch (error) {
    console.error('Error generating yearly summary:', error);
    throw error;
  }
}

async function updateHumanAnalysis(userId, existingChat = null) {
  try {
    const chat = existingChat || await Chat.findOne({ userId });
    if (!chat?.allChats?.length) return null;

    const user = await User.findById(userId);
    if (!user) return null;

    const formattedChats = chat.allChats.map(msg => ({
      role: msg.role.toLowerCase() === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content || '' }]
    }));

    const analysisPrompt = {
      text: `Based on these conversations, provide a comprehensive user analysis focusing on:
        1. Communication style and preferences
        2. Emotional patterns and expression
        3. Problem-solving approaches
        4. Learning style and adaptability
        5. Interests and motivations
        6. Interaction patterns and relationship building
        Please provide specific examples where relevant.`
    };

    const analysis = await generateResponse(analysisPrompt.text, formattedChats);

    await User.findByIdAndUpdate(
      userId,
      { $set: { humanAnalysis: analysis.AIresponse } },
      { new: true }
    );

    return analysis.AIresponse;
  } catch (error) {
    console.error('Error updating human analysis:', error);
    throw error;
  }
}

async function getChatHistory(userId, limit = 50) {
  try {
    const chat = await Chat.findOne({ userId });
    if (!chat) return [];

    return chat.allChats
      .slice(-limit)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
}

module.exports = {
  handleChat,
  generateMonthlySummary,
  generateYearlySummary,
  updateHumanAnalysis,
  getChatHistory
};