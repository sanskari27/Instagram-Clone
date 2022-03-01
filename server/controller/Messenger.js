const User = require('../model/User');
const Conversation = require('../model/Conversation');
const Message = require('../model/Message');
const Post = require('../model/Post');
const { MessageType } = require('../model/Message');
const log = require('../utils/Logger');
const { toObjectId, resolveMessage, resolveLastMessage } = require('../utils/MonogooseUtil');
const FileUpload = require('../utils/FileUpload');

const moment = require('moment');
moment.updateLocale('en', {
	relativeTime: {
		future: 'in %s',
		past: '%s ',
		s: '1s',
		m: '1m',
		mm: '%dm',
		h: '1h',
		hh: '%dh',
		d: '1d',
		dd: '%dd',
		M: '1m',
		MM: '%dm',
		y: '1y',
		yy: '%dy',
	},
});

exports.conversations = async (req, res) => {
	const user = req.user;

	try {
		const _conversation = await Conversation.find({ members: { $eq: user._id } })
			.sort({ time: -1 })
			.populate('members');

		const conversations = [];
		for (const conversation of _conversation) {
			let _members = conversation.members;
			let title = '';
			let dp = '';
			for (const member of _members) {
				if (member.username !== user.username) {
					if (title) {
						title += ' and ' + member.name;
					} else {
						title += member.name;
					}
					dp = member.dp;
				}
			}
			if (_members.length > 2) {
				dp = '';
			}
			const details = {
				id: conversation._id,
				title: title,
				time: moment(conversation.time).fromNow(true),
				dp: dp,
			};
			const message = await Message.findOne({ conversation_id: conversation._id }).sort({
				time: -1,
			});

			const lastMessage = await resolveLastMessage(req.user, message);
			if (message) {
				details.text = lastMessage;
				details.unseen = !message.seen_by?.map((id) => id.toString()).includes(user._id.toString());
			}
			conversations.push(details);
		}

		return res.status(200).json({
			success: true,
			message: conversations,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.findConversation = async (req, res) => {
	const user = req.user;
	if (!req.params.username) {
		return res.status(400).json({
			success: false,
			message: 'Invalid username.',
		});
	}
	let _users = [req.params.username, user.username];
	try {
		const users = await User.aggregate([{ $match: { username: { $in: _users } } }]);
		if (users.length !== _users.length) {
			return res.status(400).json({
				success: false,
				message: 'Invalid username.',
			});
		}
		let conversation = await Conversation.findOne({ members: users });
		const createdNow = conversation ? false : true;
		if (!conversation) {
			conversation = await Conversation.create({ members: users });
		}

		return res.status(200).json({
			success: true,
			message: conversation._id,
			createdNow,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.conversationSuggestions = async (req, res) => {
	const user = req.user;

	try {
		const members = [];
		const usernames = [];
		let conversations = await Conversation.find({ members: { $eq: user._id } })
			.sort({ time: -1 })
			.populate('members');

		for (const conversation of conversations) {
			for (const member of conversation.members) {
				if (member.username !== user.username && !usernames.includes(member.username)) {
					members.push({ username: member.username, dp: member.dp, name: member.name });
					usernames.push(member.username);
				}
			}
		}

		const friends = await User.findOne({ username: user.username }).populate('following followers');

		for (const follower of friends.followers) {
			if (follower.username !== user.username && !usernames.includes(follower.username)) {
				members.push({ username: follower.username, dp: follower.dp, name: follower.name });
				usernames.push(follower.username);
			}
		}
		for (const following of friends.following) {
			if (following.username !== user.username && !usernames.includes(following.username)) {
				members.push({ username: following.username, dp: following.dp, name: following.name });
				usernames.push(following.username);
			}
		}

		return res.status(200).json({
			success: true,
			message: members,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.fetchConversation = async (req, res) => {
	const user = req.user;
	const conversationID = req.params.conversationID;
	if (!conversationID) {
		return res.status(400).json({
			success: false,
			message: 'Invalid conversationID.',
		});
	}
	try {
		let conversation = await Conversation.findById(conversationID).populate('members');
		if (!conversation) {
			return res.status(400).json({
				success: false,
				message: 'Conversation not exists.',
			});
		}
		const members = [];
		let title = '';
		let dp = '';
		for (const member of conversation.members) {
			if (member.username !== user.username) {
				if (conversation.title) {
					title = conversation.title;
				} else if (title) {
					title += ' and ' + member.name;
				} else {
					title += member.name;
				}
				dp = member.dp;
				members.push({ username: member.username, name: member.name, dp: member.dp });
			}
		}
		if (members.length > 1) {
			dp = '';
			members.push({ username: user.username, name: user.name, dp: user.dp });
		}
		const details = {
			title: title,
			dp: dp,
			members,
		};

		return res.status(200).json({
			success: true,
			message: details,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.fetchMessages = async (req, res) => {
	const user = req.user;
	const conversationID = req.params.conversationID;
	if (!conversationID) {
		return res.status(400).json({
			success: false,
			message: 'Invalid conversationID.',
		});
	}
	try {
		let messages = await Message.find({ conversation_id: toObjectId(conversationID) })
			.sort('time')
			.populate('sender');

		await Message.updateMany(
			{ conversation_id: conversationID },
			{
				$addToSet: {
					seen_by: user,
				},
			}
		);
		messages = await Promise.all(
			messages.map(async (message) => {
				const msg = await resolveMessage(user.username, message);
				return msg;
			})
		);

		return res.status(200).json({
			success: true,
			message: messages,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.createConversation = async (req, res) => {
	let _users = req.body.users;
	if (!_users) {
		return res.status(400).json({
			success: false,
			message: 'Members cannot be empty.',
		});
	}
	if (_users.includes(req.user.username)) {
		return res.status(400).json({
			success: false,
			message: 'Cannot create conversation with self.',
		});
	} else {
		_users.push(req.user.username);
	}
	try {
		const users = await User.aggregate([{ $match: { username: { $in: _users } } }]);
		if (users.length !== _users.length) {
			return res.status(400).json({
				success: false,
				message: 'Invalid username.',
			});
		}
		let conversation = await Conversation.findOne({ members: users });

		if (conversation) {
			conversation.time = Date.now();
			conversation.save();
			return res.status(200).json({
				success: true,
				message: 'Conversation already exists.',
				conversation: conversation._id,
			});
		} else {
			conversation = await Conversation.create({ members: users });
			return res.status(200).json({
				success: true,
				message: 'Conversation created successfully.',
				conversation: conversation._id,
			});
		}
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.seenAll = async (req, res) => {
	const conversationID = req.params.conversationID;
	const user = req.user;
	try {
		await Message.updateMany(
			{ conversation_id: conversationID },
			{
				$addToSet: {
					seen_by: user,
				},
			}
		);
		return res.status(200).json({
			success: true,
			message: 'Conversation Seen',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.createTextMessage = async (req, res) => {
	const { conversation_id, message } = req.body;
	if (!conversation_id) {
		return res.status(400).json({
			success: false,
			message: 'Conversation Id cannot be empty.',
		});
	} else if (!message) {
		return res.status(400).json({
			success: false,
			message: 'Message cannot be empty.',
		});
	}

	try {
		const conversation = await Conversation.findById(conversation_id);
		if (!conversation) {
			return res.status(400).json({
				success: false,
				message: 'Invalid Conversation Id.',
			});
		}
		const msg = await Message.create({
			conversation_id: conversation,
			sender: req.user,
			type: MessageType.TEXT,
			text: message,
			seen_by: [req.user],
		});
		conversation.time = Date.now();
		await conversation.save();
		const result = await resolveMessage(req.user.username, msg);
		return res.status(200).json({
			success: true,
			message: result,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.createImageMessage = async (req, res) => {
	let filename;
	try {
		filename = await FileUpload(req, res);
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'File upload failed',
		});
	}

	const conversation_id = req.body.conversation_id;
	if (!conversation_id) {
		return res.status(400).json({
			success: false,
			message: 'Conversation Id cannot be empty.',
		});
	}
	try {
		const conversation = await Conversation.findById(conversation_id);
		if (!conversation) {
			return res.status(400).json({
				success: false,
				message: 'Invalid Conversation Id.',
			});
		}
		const msg = await Message.create({
			conversation_id: conversation,
			sender: req.user,
			type: MessageType.IMAGE,
			text: filename,
			seen_by: [req.user],
		});
		conversation.time = Date.now();
		await conversation.save();

		const result = await resolveMessage(req.user.username, msg);
		return res.status(200).json({
			success: true,
			message: result,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.sendPost = async (req, res) => {
	let post = req.body.post;
	if (!post) {
		return res.status(400).json({
			success: false,
			message: 'Post cannot be empty.',
		});
	}
	try {
		post = await Post.findOne({ shared_id: post });
		if (!post) {
			return res.status(400).json({
				success: false,
				message: 'Invalid post shared id.',
			});
		}

		for (const user of req.body.users) {
			const _users = [req.user.username, user];
			const users = await User.aggregate([{ $match: { username: { $in: _users } } }]);
			let conversation = await Conversation.findOne({ members: users });
			const msg = await Message.create({
				conversation_id: conversation,
				sender: req.user,
				type: MessageType.POST,
				post: post,
				seen_by: [req.user],
			});
			conversation.time = Date.now();
			await conversation.save();
		}

		return res.status(200).json({
			success: true,
			message: 'Post message sent',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.deleteMessage = async (req, res) => {
	const messageID = req.params.messageID;
	if (!messageID) {
		return res.status(400).json({
			success: false,
			message: 'Message id cannot be empty.',
		});
	}

	try {
		const message = await Message.findById(messageID);
		if (message.sender.toString() !== req.user._id.toString()) {
			return res.status(400).json({
				success: false,
				message: 'Message is sent by other user',
			});
		}
		await Message.findByIdAndDelete(messageID);
		const conversation_id = message.conversation_id;
		const messages = await Message.find({ conversation_id }).sort({ time: -1 });
		if (messages.length > 0) {
			const conversation = await Conversation.findById(conversation_id);
			conversation.time = Date.now();
			await conversation.save();
		}
		return res.status(200).json({
			success: true,
			message: 'Message deleted',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.deleteChat = async (req, res) => {
	const conversationID = req.params.conversationID;
	if (!conversationID) {
		return res.status(400).json({
			success: false,
			message: 'Message id cannot be empty.',
		});
	}

	try {
		const conversation = await Conversation.findById(conversationID);
		if (conversation.members?.length > 2) {
			return res.status(400).json({
				success: false,
				message: 'Unable to delete group conversation',
			});
		}
		await Conversation.findByIdAndDelete(conversationID);
		await Message.deleteMany({ conversation_id: conversationID });
		return res.status(200).json({
			success: true,
			message: 'Conversation deleted',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};
