const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import handlers
const startHandler = require('./bot/handlers/start');
const cryptoHandler = require('./bot/handlers/crypto');
const newsHandler = require('./bot/handlers/news');
const sportsHandler = require('./bot/handlers/sports');
const financeHandler = require('./bot/handlers/finance');

// Initialize express app
const app = express();
app.use(express.json());

// Initialize bot
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is required!');
  process.exit(1);
}

const bot = new TelegramBot(token);
const webhookUrl = process.env.WEBHOOK_URL;

// Set webhook
if (webhookUrl) {
  bot.setWebHook(webhookUrl).then(() => {
    console.log('Webhook set successfully:', webhookUrl);
  }).catch(err => {
    console.error('Webhook setting error:', err);
  });
}

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    bot: 'Telegram News Bot'
  });
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.sendStatus(500);
  }
});

// Bot command handlers
bot.onText(/\/start/, (msg) => startHandler(msg, bot));
bot.onText(/\/crypto/, (msg) => cryptoHandler(msg, bot));
bot.onText(/\/news/, (msg) => newsHandler(msg, bot));
bot.onText(/\/sports/, (msg) => sportsHandler(msg, bot));
bot.onText(/\/finance/, (msg) => financeHandler(msg, bot));

// Callback query handler for inline buttons
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  
  switch(data) {
    case 'crypto':
      await cryptoHandler(msg, bot);
      break;
    case 'news':
      await newsHandler(msg, bot);
      break;
    case 'sports':
      await sportsHandler(msg, bot);
      break;
    case 'finance':
      await financeHandler(msg, bot);
      break;
    case 'start':
      await startHandler(msg, bot);
      break;
  }
  
  bot.answerCallbackQuery(callbackQuery.id);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot is running on port ${PORT}`);
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
