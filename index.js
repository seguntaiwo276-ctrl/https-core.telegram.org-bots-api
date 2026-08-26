const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Healthcheck must work even if bot fails
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.status(200).send('Bot is running');
});

// Start server first - this ensures healthcheck works immediately
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Healthcheck: http://localhost:${PORT}/health`);
});

// Now initialize bot (with error handling)
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('❌ BOT_TOKEN environment variable is missing!');
  console.log('⚠️  Bot will not start, but server is running for healthcheck');
} else {
  try {
    // Use polling mode
    const bot = new TelegramBot(token, { 
      polling: true,
      // Add retry logic
      request: {
        timeout: 30000,
        agent: null
      }
    });

    console.log('🤖 Bot initialized successfully');

    // Simple commands
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        await bot.sendMessage(chatId, 
          '📰 *Welcome to News Bot!*\n\nUse the buttons below or commands:\n/crypto - Crypto news\n/news - General news\n/sports - Sports news\n/finance - Finance tips',
          {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: [
                ['📊 Crypto', '📰 News'],
                ['⚽ Sports', '💰 Finance']
              ],
              resize_keyboard: true
            }
          }
        );
      } catch (err) {
        console.error('Start command error:', err.message);
      }
    });

    bot.onText(/\/crypto/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        await bot.sendMessage(chatId,
          '📊 *Cryptocurrency Update*\n\nBitcoin trading at $65,000. Ethereum $3,500.\n\n*Key Points:*\n• Market cap: $2.5T\n• 24h volume: $80B\n• BTC dominance: 52%\n\nEducational content only.',
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        console.error('Crypto command error:', err.message);
      }
    });

    bot.onText(/\/news/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        await bot.sendMessage(chatId,
          '📰 *Global News Summary*\n\n• Digital banking adoption grows 40%\n• New blockchain regulations proposed\n• FinTech investment reaches $50B in Q2\n\nStay informed with daily updates.',
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        console.error('News command error:', err.message);
      }
    });

    bot.onText(/\/sports/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        await bot.sendMessage(chatId,
          '⚽ *Sports Highlights*\n\n• Premier League season review\n• Champions League standings updated\n• Player transfer news\n\nSports analysis and updates.',
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        console.error('Sports command error:', err.message);
      }
    });

    bot.onText(/\/finance/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        await bot.sendMessage(chatId,
          '💰 *Finance Education*\n\n• Digital banking security tips\n• Budgeting strategies for 2024\n• Understanding interest rates\n\nEducational content only. No financial advice.',
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        console.error('Finance command error:', err.message);
      }
    });

    // Handle button clicks
    bot.on('callback_query', async (query) => {
      try {
        const msg = query.message;
        await bot.answerCallbackQuery(query.id);
        
        const data = query.data;
        if (data === 'crypto') {
          await bot.sendMessage(msg.chat.id, '📊 Crypto update: Bitcoin stable at $65K');
        } else if (data === 'start') {
          await bot.sendMessage(msg.chat.id, '🏠 Main menu - use /start');
        }
      } catch (err) {
        console.error('Callback error:', err.message);
      }
    });

    // Error handling
    bot.on('error', (err) => {
      console.error('Bot error:', err.message);
    });

    bot.on('polling_error', (err) => {
      console.error('Polling error:', err.message);
    });

    console.log('✅ Bot commands registered successfully');

  } catch (error) {
    console.error('❌ Failed to initialize bot:', error.message);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  // Don't exit, keep server running
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
