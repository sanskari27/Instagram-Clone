const mongoose = require('mongoose');
const moment = require('moment');
const { MessageType } = require('../model/Message');
const Message = require('../model/Message');
const Post = require('../model/Post');

exports.toObjectId = (ids) => {
	if (ids.constructor === Array) {
		return ids.map(mongoose.Types.ObjectId);
	}

	return mongoose.Types.ObjectId(ids);
};

exports.resolveLastMessage = (user, msg) => {
	if (!msg) return '';
	if (msg.type === MessageType.TEXT) {
		return msg.text;
	} else if (msg.type === MessageType.IMAGE) {
		if (msg.sender.toString() === user._id.toString()) {
			return 'You sent an image';
		} else {
			return 'Sent you an image';
		}
	} else if (msg.type === MessageType.POST) {
		if (msg.sender.toString() === user._id.toString()) {
			return 'You sent an post';
		} else {
			return 'Sent you an post';
		}
	} else if (msg.type === MessageType.STORY) {
		if (msg.sender.toString() === user._id.toString()) {
			return 'You sent an story';
		} else {
			return 'Sent you an story';
		}
	} else if (msg.type === MessageType.STORY_REPLIED || msg.type === MessageType.STORY_REACTED) {
		if (msg.sender.toString() === user._id.toString()) {
			return 'You replied to their story';
		} else {
			return 'Replied to your story: ' + msg.text;
		}
	}
};

exports.resolveMessage = async (username, message) => {
	const data = {
		id: message._id,
		own: message.sender.username === username,
		username: message.sender.username,
		type: message.type,
	};
	if (!moment(message.time).isSame(moment(), 'year')) {
		data.time = moment(message.time).format('hh:mm a MMM,DD YYYY');
	} else if (!moment(message.time).isSame(moment(), 'day')) {
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
			caption: post.caption,
			src: post.filename,
			shared_id: post.shared_id,
		};
	}
	return data;
};
