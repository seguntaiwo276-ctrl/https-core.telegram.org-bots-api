const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

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
  console.error('❌ BOT_TOKEN is required!');
  process.exit(1);
}

// Create bot instance with polling (more reliable than webhook for Railway)
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Bot started with polling mode');

// Health check endpoint for Railway - MUST return 200 OK
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    bot: 'Telegram News Bot'
  });
});

// Root endpoint for basic check
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'online', 
    message: 'Telegram News Bot is running',
    version: '1.0.0'
  });
});

// Command handlers
bot.onText(/\/start/, (msg) => startHandler(msg, bot));
bot.onText(/\/crypto/, (msg) => cryptoHandler(msg, bot));
bot.onText(/\/news/, (msg) => newsHandler(msg, bot));
bot.onText(/\/sports/, (msg) => sportsHandler(msg, bot));
bot.onText(/\/finance/, (msg) => financeHandler(msg, bot));

// Handle callback queries
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  
  try {
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
    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.error('Callback error:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { 
      text: 'Error processing request' 
    });
  }
});

// Error handling for bot
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`✅ Healthcheck available at: http://localhost:${PORT}/health`);
  console.log(`🤖 Bot username: @${bot.getMe ? 'checking...' : 'unknown'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM signal, shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT signal, shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});
