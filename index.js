const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

const app = express();
app.use(express.json());

// Healthcheck - ALWAYS works
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    bot_initialized: global.botInitialized || false
  });
});

app.get('/', (req, res) => {
  res.status(200).send('Telegram Bot is running');
});

// Start server first
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Healthcheck: http://localhost:${PORT}/health`);
});

// Function to validate token before starting bot
async function validateToken(token) {
  return new Promise((resolve) => {
    const url = `https://api.telegram.org/bot${token}/getMe`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.ok) {
            console.log(`✅ Token valid! Bot: @${json.result.username}`);
            resolve(true);
          } else {
            console.error(`❌ Invalid token: ${json.description}`);
            resolve(false);
          }
        } catch (e) {
          console.error('❌ Failed to validate token:', e.message);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error('❌ Network error during validation:', err.message);
      resolve(false);
    });
  });
}

// Initialize bot with token
async function initBot() {
  const token = process.env.BOT_TOKEN;
  
  if (!token) {
    console.error('❌ BOT_TOKEN environment variable is missing!');
    console.log('⚠️  Add BOT_TOKEN to Railway environment variables');
    return;
  }

  // Validate token first
  const isValid = await validateToken(token);
  if (!isValid) {
    console.error('❌ Bot token is invalid. Please check your BOT_TOKEN');
    console.log('📝 Get a new token from @BotFather on Telegram');
    return;
  }

  try {
    // Create bot with polling
    const bot = new TelegramBot(token, { 
      polling: true,
      request: {
        timeout: 30000
      }
    });

    global.botInitialized = true;
    console.log('🤖 Bot initialized successfully');

    // Start command
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        await bot.sendMessage(chatId, 
          '📰 *Welcome to News Bot!*\n\nUse the buttons below:\n📊 Crypto - Market updates\n📰 News - Global news\n⚽ Sports - Sports updates\n💰 Finance - Finance tips\n\n*Commands:*\n/crypto - Crypto news\n/news - General news\n/sports - Sports news\n/finance - Finance tips',
          {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: [
                ['📊 Crypto Update', '📰 Global News'],
                ['⚽ Sports News', '💰 Finance Tips']
              ],
              resize_keyboard: true,
              one_time_keyboard: false
            }
          }
        );
      } catch (err) {
        console.error('Start command error:', err.message);
        await bot.sendMessage(chatId, 'Sorry, an error occurred. Please try again.');
      }
    });

    // Crypto handler
    bot.onText(/\/crypto|📊 Crypto Update/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        const messages = [
          {
            title: "Bitcoin Market Update",
            content: "Bitcoin continues to show strong fundamentals with institutional adoption growing steadily."
          },
          {
            title: "Ethereum Development",
            content: "Ethereum network upgrades continue to improve scalability and reduce transaction costs."
          }
        ];
        const selected = messages[Math.floor(Math.random() * messages.length)];
        await bot.sendMessage(chatId,
          `📊 *${selected.title}*\n\n${selected.content}\n\n*Key Points:*\n• Educational content only\n• Not financial advice\n• Always do your own research`,
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        console.error('Crypto error:', err.message);
        await bot.sendMessage(chatId, 'Unable to fetch crypto data. Please try again.');
      }
    });

    // News handler
    bot.onText(/\/news|📰 Global News/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        await bot.sendMessage(chatId,
          '📰 *Global News Summary*\n\n*Technology:*\n• Digital banking adoption grows 40% worldwide\n• AI integration in financial services increases\n\n*Economy:*\n• Global markets show steady growth\n• FinTech investment reaches new highs\n\n*Stay informed with daily updates.*',
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        console.error('News error:', err.message);
        await bot.sendMessage(chatId, 'Unable to fetch news. Please try again.');
      }
    });

    // Sports handler
    bot.onText(/\/sports|⚽ Sports News/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        await bot.sendMessage(chatId,
          '⚽ *Sports Update*\n\n*Football (Soccer):*\n• Premier League season in full swing\n• Champions League standings updated\n\n*Other Sports:*\n• Tennis Grand Slam schedule\n• Basketball league updates\n\n*Sports analysis and highlights.*',
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        console.error('Sports error:', err.message);
        await bot.sendMessage(chatId, 'Unable to fetch sports data. Please try again.');
      }
    });

    // Finance handler
    bot.onText(/\/finance|💰 Finance Tips/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        await bot.sendMessage(chatId,
          '💰 *Financial Education*\n\n*Digital Banking:*\n• Use strong passwords and 2FA\n• Monitor your accounts regularly\n\n*Savings Tips:*\n• Budget 50/30/20 rule\n• Build emergency fund\n\n*Educational content only.*',
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        console.error('Finance error:', err.message);
        await bot.sendMessage(chatId, 'Unable to fetch finance data. Please try again.');
      }
    });

    // Handle button clicks
    bot.on('callback_query', async (query) => {
      try {
        await bot.answerCallbackQuery(query.id);
        const msg = query.message;
        
        if (query.data === 'crypto') {
          await bot.sendMessage(msg.chat.id, '📊 Crypto: Bitcoin $65,000, ETH $3,500');
        } else if (query.data === 'news') {
          await bot.sendMessage(msg.chat.id, '📰 Latest news: Digital banking grows 40%');
        } else if (query.data === 'start') {
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

    console.log('✅ All commands registered');

  } catch (error) {
    console.error('❌ Failed to initialize bot:', error.message);
    global.botInitialized = false;
  }
}

// Start the bot
initBot();

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

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
