module.exports = async (msg, bot) => {
  const chatId = msg.chat.id;
  
  try {
    const messages = [
      {
        title: "Understanding Blockchain Technology",
        content: "Blockchain represents a fundamental shift in how data is stored and verified. This distributed ledger technology enables secure, transparent transactions without central authority.",
        points: [
          "Decentralized verification systems",
          "Immutable record keeping",
          "Smart contract applications",
          "Real-world use cases beyond cryptocurrency"
        ]
      },
      {
        title: "Digital Wallet Security Best Practices",
        content: "Protecting digital assets requires understanding security fundamentals. Proper wallet management includes private key protection, multi-factor authentication, and regular security audits.",
        points: [
          "Use hardware wallets for major holdings",
          "Enable two-factor authentication",
          "Regular backup of private keys",
          "Avoid sharing sensitive information"
        ]
      },
      {
        title: "Decentralized Finance (DeFi) Overview",
        content: "DeFi represents a paradigm shift in financial services, enabling peer-to-peer lending, borrowing, and trading without traditional intermediaries.",
        points: [
          "Permissionless financial services",
          "Smart contract automation",
          "Liquidity pool mechanics",
          "Risk management considerations"
        ]
      }
    ];
    
    const selected = messages[Math.floor(Math.random() * messages.length)];
    
    const message = `
📊 *Cryptocurrency & Blockchain Update*

*${selected.title}*

${selected.content}

*Key Points:*
${selected.points.map(p => `• ${p}`).join('\n')}

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
            { text: '⚽ Sports', callback_data: 'sports' },
            { text: '💰 Finance', callback_data: 'finance' }
          ],
          [
            { text: '🏠 Main Menu', callback_data: 'start' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Crypto handler error:', error);
    await bot.sendMessage(chatId, 'Sorry, an error occurred. Please try again later.');
  }
};
