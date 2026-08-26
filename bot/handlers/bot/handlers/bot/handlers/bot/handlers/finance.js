const { content } = require('../../data/content.json');

module.exports = async (msg, bot) => {
  const chatId = msg.chat.id;
  
  const financeContent = content.finance[Math.floor(Math.random() * content.finance.length)];
  
  const message = `
💰 *Personal Finance & Digital Banking*

*${financeContent.title}*

${financeContent.content}

*Practical Tips:*
${financeContent.points.map(p => `• ${p}`).join('\n')}

*Financial Education:*
• Digital banking security
• Budgeting strategies
• Savings optimization
• Understanding financial terms

Educational content only. No financial advice.
  `;
  
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔄 More Finance', callback_data: 'finance' },
          { text: '📰 News', callback_data: 'news' }
        ],
        [
          { text: '🏠 Main Menu', callback_data: 'start' }
        ]
      ]
    }
  });
};
