const { content } = require('../../data/content.json');

module.exports = async (msg, bot) => {
  const chatId = msg.chat.id;
  
  const newsContent = content.news[Math.floor(Math.random() * content.news.length)];
  
  const message = `
📰 *Global News Summary*

*${newsContent.title}*

${newsContent.content}

*Key Developments:*
${newsContent.points.map(p => `• ${p}`).join('\n')}

*Stay Informed:*
• Fact-checked information
• Multiple perspectives
• No political bias
• Educational content only

Use /news for more updates
  `;
  
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔄 More News', callback_data: 'news' },
          { text: '⚽ Sports', callback_data: 'sports' }
        ],
        [
          { text: '🏠 Main Menu', callback_data: 'start' }
        ]
      ]
    }
  });
};
