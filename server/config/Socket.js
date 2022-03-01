const { Server } = require('socket.io');
const Message = require('../model/Message');
const { MessageType } = require('../model/Message');
const Conversation = require('../model/Conversation');
const moment = require('moment');

let users = [];

module.exports = () => {
	const io = new Server(8900, {
		cors: {
			origin: 'http://localhost:3000',
		},
	});
	io.on('connection', (socket) => {
		socket.on('messenger-connect', (username) => {
			addUser(socket.id, username);
		});

		socket.on('messenger-join', (conversationID) => {
			const room = getRoomById(socket.id);
			if (room) {
				socket.leave(room);
			}
			socket.join(conversationID);
			updateRoomById(socket.id, conversationID);
		});

		socket.on('messenger-leave', (conversationID) => {
			socket.leave(conversationID);
			updateRoomById(socket.id, null);
		});

		socket.on('messenger-send', async (message) => {
			const msg = await Message.findById(message.id).populate('sender');
			const conversation = await Conversation.findById(msg.conversation_id).populate('members');
			let receiver = conversation.members.map((member) => member.username);
			receiver = receiver.filter((username) => username !== msg.sender.username);
			receiver = getUsersByUsernames(receiver);
			for (const user of receiver) {
				const message = await resolveMessage(msg);
				socket.to(user.socketId).emit('messenger-receive', message);
				socket.to(user.socketId).emit('messenger-update');
			}
		});

		//when disconnect
		socket.on('disconnect', () => {
			removeUser(socket.id);
		});
	});
};

const addUser = (socketId, username) => {
	!users.some((user) => user.username === username) && users.push({ username, socketId });
};

const removeUser = (socketId) => {
	users = users.filter((user) => user.socketId !== socketId);
};

const getUserByUsername = (username) => {
	return users.find((user) => user.username === username);
};

const getUsersByUsernames = (usernames) => {
	if (!usernames || usernames.length === 0) return [];
	return users.filter((user) => usernames.includes(user.username));
};

const getUserById = (socketId) => {
	return users.find((user) => user.socketId === socketId);
};

const getRoomById = (socketId) => {
	return getUserById(socketId)?.room;
};

const updateRoomById = (socketId, roomID) => {
	users = users.map((user) => (user.socketId !== socketId ? user : { ...user, room: roomID }));
};

const resolveMessage = async (message) => {
	const data = {
		id: message._id,
		own: false,
		username: message.sender.username,
		type: message.type,
	};
	if (moment().diff(message.time, 'year') > 0) {
		data.time = moment(message.time).format('hh:mm a MMM,DD YYYY');
	} else if (moment().diff(message.time, 'days') > 0) {
		data.time = moment(message.time).format('hh:mm a MMM,DD');
	} else {
		data.time = moment(message.time).format('hh:mm a');
	}
	if (message.type === MessageType.TEXT || message.type === MessageType.IMAGE) {
		data.text = message.text;
	} else if (message.type === MessageType.POST) {
		const post = await Post.findById(message.post).populate('posted_by');
		data.post = {
			dp: post.posted_by.dp,
			username: post.posted_by.username,
			caption: post.posted_by.caption,
			filename: post.filename,
		};
	}
	return data;
};
