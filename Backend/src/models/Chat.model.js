const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  allChats: [
    {
      role: { type: String, enum: ['user', 'model'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  monthlySummary: [
    {
      year: { type: Number, required: true },
      month: { type: String, required: true },
      summary: { type: String },
    },
  ],
  yearlySummary: [
    {
      year: { type: Number, required: true },
      summary: { type: String },
    },
  ],
});

chatSchema.index({ userId: 1, 'monthlySummary.year': 1, 'monthlySummary.month': 1 }, { unique: true });
chatSchema.index({ userId: 1, 'yearlySummary.year': 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
