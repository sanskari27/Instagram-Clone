const emojiRegex = require('emoji-regex');
const regex = emojiRegex();
const removeEmoji = (str) => str.replaceAll(regex, '');

const isOnlyEmojis = (str) => !removeEmoji(str).trim().length;

export { removeEmoji, isOnlyEmojis };
