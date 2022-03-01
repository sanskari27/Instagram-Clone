const express = require('express');
const router = express.Router();
const VerifyJWT = require('../middleware/VerifyJWT');
const {
	conversations,
	conversationSuggestions,
	findConversation,
	fetchConversation,
	createConversation,
	seenAll,
	createTextMessage,
	createImageMessage,
	sendPost,
	fetchMessages,
	deleteMessage,
	deleteChat,
} = require('../controller/Messenger');

router.route('/conversations').all(VerifyJWT).get(conversations);
router.route('/search-message-suggestion').all(VerifyJWT).get(conversationSuggestions);
router.route('/find-conversation/:username').all(VerifyJWT).get(findConversation);
router.route('/fetch-conversation/:conversationID').all(VerifyJWT).get(fetchConversation);
router.route('/fetch-messages/:conversationID').all(VerifyJWT).get(fetchMessages);

router.route('/create-conversation').all(VerifyJWT).post(createConversation);
router.route('/seen-all/:conversationID').all(VerifyJWT).post(seenAll);
router.route('/create-text-message').all(VerifyJWT).post(createTextMessage);
router.route('/create-image-message').all(VerifyJWT).post(createImageMessage);
router.route('/send-post').all(VerifyJWT).post(sendPost);
router.route('/delete-message/:messageID').all(VerifyJWT).post(deleteMessage);
router.route('/delete-chat/:conversationID').all(VerifyJWT).post(deleteChat);

module.exports = router;
