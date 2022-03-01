const mongoose = require('mongoose');
const moment = require('../utils/Time');
const { nanoid } = require('nanoid');
const Post = require('./Post');

const NotificationType = {
	LIKE: 'like',
	FOLLOW: 'follow',
	FOLLOW_REQUEST: 'follow request',
	COMMENT: 'commented on a post',
	LIKE_COMMENT: 'liked a comment',
};
const NotificationStatus = {
	SEEN: true,
	UNSEEN: false,
};

const NotificationSchema = new mongoose.Schema({
	notification_to: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	notification_from: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	text: { type: String },
	type: {
		type: String,
		enum: Object.values(NotificationType),
		default: NotificationType.LIKE,
	},
	seenStatus: {
		type: Boolean,
		enum: Object.values(NotificationStatus),
		default: NotificationStatus.UNSEEN,
	},
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post',
	},
	comment: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Comment',
	},
	date: { type: Date },
});

NotificationSchema.pre('save', async function (next) {
	if (!this.date) {
		this.date = Date.now();
	}
	if (this.type === NotificationType.LIKE) {
		const notified = await Notification.findOne({
			type: NotificationType.LIKE,
			post: this.post,
			notification_from: this.notification_from,
			notification_to: this.notification_to,
		});
		if (notified) {
			next(new Error('Notification already created'));
		}
	} else if (this.type === NotificationType.FOLLOW) {
		const notified = await Notification.findOne({
			type: NotificationType.FOLLOW,
			notification_from: this.notification_from,
			notification_to: this.notification_to,
		});

		if (notified) {
			next(new Error('Notification already created'));
		}
	} else if (this.type === NotificationType.FOLLOW_REQUEST) {
		const notified = await Notification.findOne({
			type: NotificationType.FOLLOW_REQUEST,
			notification_from: this.notification_from,
			notification_to: this.notification_to,
		});
		if (notified) {
			next(new Error('Notification already created'));
		}
	} else if (this.type === NotificationType.LIKE_COMMENT) {
		const notified = await Notification.findOne({
			type: NotificationType.LIKE_COMMENT,
			comment: this.comment,
			post: this.post,
			notification_from: this.notification_from,
			notification_to: this.notification_to,
		});
		if (notified) {
			next(new Error('Notification already created'));
		}
	} else if (this.type === NotificationType.COMMENT) {
		const notified = await Notification.findOne({
			type: NotificationType.COMMENT,
			comment: this.comment,
			notification_from: this.notification_from,
			notification_to: this.notification_to,
		});
		if (notified) {
			next(new Error('Notification already created'));
		}
	} else if (this.type === NotificationType.LIKE_COMMENT) {
		const notified = await Notification.findOne({
			type: NotificationType.LIKE_COMMENT,
			comment: this.comment,
			notification_from: this.notification_from,
			notification_to: this.notification_to,
		});
		if (notified) {
			next(new Error('Notification already created'));
		}
	}
});

NotificationSchema.statics.notify = async function (details) {
	try {
		await Notification.create({
			...details,
		});
	} catch (err) {}
};

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;

module.exports.NotificationType = NotificationType;
module.exports.NotificationStatus = NotificationStatus;
