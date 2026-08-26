const mainKeyboard = [
  [
    { text: '📊 Crypto Update', callback_data: 'crypto' },
    { text: '📰 News', callback_data: 'news' }
  ],
  [
    { text: '⚽ Sports', callback_data: 'sports' },
    { text: '💰 Finance', callback_data: 'finance' }
  ]
];

const buttonKeyboard = {
  crypto: { text: '📊 Crypto Update', callback_data: 'crypto' },
  news: { text: '📰 News', callback_data: 'news' },
  sports: { text: '⚽ Sports', callback_data: 'sports' },
  finance: { text: '💰 Finance', callback_data: 'finance' },
  main: { text: '🏠 Main Menu', callback_data: 'start' }
};

module.exports = {
  mainKeyboard,
  buttonKeyboard
};
