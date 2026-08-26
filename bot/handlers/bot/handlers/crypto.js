const { content } = require('../../data/content.json');

module.exports = async (msg, bot) => {
  const chatId = msg.chat.id;
  
  // Get today's crypto content from our curated database
  const todayContent = content.crypto[Math.floor(Math.random() * content.crypto.length)];
  
  const message = `
📊 *Cryptocurrency & Blockchain Update*

*${todayContent.title}*

${todayContent.content}

*Key Points:*
${todayContent.points.map(p => `• ${p}`).join('\n')}

*Learn More:*
Use /crypto again for another topic
Visit our channel for daily updates

*Important:* All information is for educational purposes only. Always do your own research.
  `;
  
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔄 More Updates', callback_data: 'crypto' },
          { text: '📰 News', callback_data: 'news' }
        ],
        [
          { text: '🏠 Main Menu', callback_data: 'start' }
        ]
      ]
    }
  });
};
