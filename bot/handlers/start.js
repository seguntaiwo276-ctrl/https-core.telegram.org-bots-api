const { mainKeyboard } = require('../keyboard');

module.exports = async (msg, bot) => {
  const chatId = msg.chat.id;
  
  const welcomeMessage = `
📰 *Telegram News & Information Bot*

Welcome to your daily information hub!

*Available Services:*
• 🔹 Daily market updates & analysis
• 📰 Global news without filter
• ⚽ Sports news and highlights
• 💰 Personal finance education
• 🔐 No data collection or tracking

*How this bot helps:*
- Daily curated content on multiple topics
- Educational, ad-friendly information
- No sign-ups or personal data required
- Complete privacy and transparency

*Start exploring:*
Use the buttons below or commands:
/crypto - Market updates
/news - Global news
/sports - Sports information
/finance - Finance education

*Support:* Questions or suggestions? Send a message here and we'll respond within 24 hours.

Made with ❤️ for informed communities
  `;
  
  await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: mainKeyboard,
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
};
