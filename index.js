const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

const app = express();
app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    bot_initialized: global.botInitialized || false,
    token_set: !!process.env.BOT_TOKEN
  });
});

app.get('/', (req, res) => {
  res.status(200).send('Telegram Bot is running');
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Healthcheck: http://localhost:${PORT}/health`);
});

// Function to validate token
async function validateToken(token) {
  // Log token length (safe to log)
  console.log(`📝 Token length: ${token.length} characters`);
  console.log(`📝 Token starts with: ${token.substring(0, 10)}...`);
  
  return new Promise((resolve) => {
    const url = `https://api.telegram.org/bot${token}/getMe`;
    console.log(`🔍 Validating token with URL: ${url.substring(0, 50)}...`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`📡 API Response:`, json);
          
          if (json.ok) {
            console.log(`✅ Token valid! Bot: @${json.result.username}`);
            global.botUsername = json.result.username;
            resolve(true);
          } else {
            console.error(`❌ Invalid token: ${json.description}`);
            console.error(`❌ Error code: ${json.error_code}`);
            resolve(false);
          }
        } catch (e) {
          console.error('❌ Failed to parse response:', e.message);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error('❌ Network error:', err.message);
      resolve(false);
    });
  });
}

// Initialize bot
async function initBot() {
  const token = process.env.BOT_TOKEN;
  
  console.log('🔍 Checking BOT_TOKEN...');
  console.log(`📝 Token raw value: "${token}"`);
  console.log(`📝 Token exists: ${!!token}`);
  
  if (!token) {
    console.error('❌ BOT_TOKEN environment variable is missing!');
    console.log('📝 To fix: Add BOT_TOKEN to Railway environment variables');
    console.log('📝 Format: BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    return;
  }

  // Remove any accidental whitespace
  const cleanToken = token.trim();
  if (cleanToken !== token) {
    console.log('⚠️  Token had whitespace, cleaned it up');
  }

  // Validate format
  if (!cleanToken.includes(':')) {
    console.error('❌ Token format is invalid! Should contain a colon ":"');
    console.log('📝 Correct format: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    return;
  }

  const isValid = await validateToken(cleanToken);
  if (!isValid) {
    console.error('❌ Bot token is invalid. Please check your BOT_TOKEN');
    console.log('📝 Steps to fix:');
    console.log('   1. Go to Telegram and message @BotFather');
    console.log('   2. Send /newbot to create a new bot');
    console.log('   3. Copy the token (looks like: 1234567890:ABCdef...)');
    console.log('   4. In Railway, go to Variables, set BOT_TOKEN');
    console.log('   5. Click Save and Redeploy');
    return;
  }

  try {
    const bot = new TelegramBot(cleanToken, { 
      polling: true,
      request: { timeout: 30000 }
    });

    global.botInitialized = true;
    console.log('🤖 Bot initialized successfully!');
    console.log(`👤 Bot username: @${global.botUsername}`);

    // Basic commands
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        await bot.sendMessage(chatId, 
          '📰 *Welcome to News Bot!*\n\n*Available Commands:*\n📊 /crypto - Crypto updates\n📰 /news - Global news\n⚽ /sports - Sports news\n💰 /finance - Finance tips\n\n*Or use the buttons below:*',
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
        console.error('Start error:', err.message);
      }
    });

    bot.onText(/\/crypto|📊 Crypto/, async (msg) => {
      const chatId = msg.chat.id;
      await bot.sendMessage(chatId,
        '📊 *Cryptocurrency Update*\n\nBitcoin: $65,000\nEthereum: $3,500\n\n*Market Stats:*\n• 24h Volume: $80B\n• BTC Dominance: 52%\n\n*Educational content only.*',
        { parse_mode: 'Markdown' }
      );
    });

    bot.onText(/\/news|📰 News/, async (msg) => {
      const chatId = msg.chat.id;
      await bot.sendMessage(chatId,
        '📰 *Global News*\n\n*Technology:*\n• Digital banking grows 40%\n• AI in finance expands\n\n*Business:*\n• FinTech investment up 25%\n• New regulations proposed\n\n*Daily updates available.*',
        { parse_mode: 'Markdown' }
      );
    });

    bot.onText(/\/sports|⚽ Sports/, async (msg) => {
      const chatId = msg.chat.id;
      await bot.sendMessage(chatId,
        '⚽ *Sports Update*\n\n*Football:*\n• Premier League highlights\n• Champions League updates\n\n*Other Sports:*\n• Tennis results\n• Basketball news\n\n*Sports analysis.*',
        { parse_mode: 'Markdown' }
      );
    });

    bot.onText(/\/finance|💰 Finance/, async (msg) => {
      const chatId = msg.chat.id;
      await bot.sendMessage(chatId,
        '💰 *Finance Education*\n\n*Digital Banking:*\n• Security best practices\n• 2FA recommendations\n\n*Personal Finance:*\n• Budgeting tips\n• Savings strategies\n\n*Educational content only.*',
        { parse_mode: 'Markdown' }
      );
    });

    bot.on('polling_error', (err) => {
      console.error('Polling error:', err.message);
    });

    bot.on('error', (err) => {
      console.error('Bot error:', err.message);
    });

  } catch (error) {
    console.error('❌ Failed to start bot:', error.message);
    global.botInitialized = false;
  }
}

// Start the bot
initBot();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down...');
  server.close(() => process.exit(0));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});
