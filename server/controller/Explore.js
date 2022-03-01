const User = require('../model/User');
const Story = require('../model/Story');
const Post = require('../model/Post');
const Notification = require('../model/Notification');
const { NotificationType, NotificationStatus } = require('../model/Notification');
const log = require('../utils/Logger');

const moment = require('moment');
moment.updateLocale('en', {
	relativeTime: {
		future: 'in %s',
		past: '%s ',
		s: 'few seconds ago',
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

exports.explore = async (req, res) => {
	const user = req.user;
	const filtered = user.blocked;
	filtered.push(user);
	const project = {
		_id: 0,
		shared_id: 1,
		filename: 1,
		likes_count: { $size: '$liked_by' },
		comments_count: { $size: '$comments' },
		privateAccount: 1,
	};
	try {
		const posts = await Post.aggregate([
			{ $match: { posted_by: { $nin: filtered } } },
			{
				$lookup: {
					from: User.collection.name,
					localField: 'posted_by',
					foreignField: '_id',
					as: 'user',
				},
			},
			{ $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
			{ $addFields: { privateAccount: '$user.private' } },
			{ $match: { privateAccount: { $nin: [true] } } },
			{ $sort: { posted_at: -1 } },
			{ $project: project },
		]);

		return res.status(200).json({
			success: true,
			message: posts,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.people = async (req, res) => {
	const user = req.user;
	const filtered = user.following;
	filtered.push(user._id);
	filtered.push(...user.requested);
	filtered.push(...user.blocked);
	const project = {
		_id: 0,
		dp: 1,
		username: 1,
		name: 1,
	};
	try {
		const peoples = await User.aggregate([
			{ $match: { _id: { $nin: filtered } } },
			{ $match: { blocked: { $ne: user._id } } },
			{ $limit: 30 },
			{ $project: project },
		]);

		return res.status(200).json({
			success: true,
			message: peoples,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.fetchProfile = async (req, res) => {
	const username = req.params.username;

	try {
		const _user = await User.findOne({ username });
		if (!_user) {
			return res.status(400).json({
				success: false,
				message: 'User not found.',
			});
		}
		const _stories = await Story.find({
			posted_by: _user,
			posted_at: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
		}).sort({ posted_at: -1 });
		if (_user.blocked && _user.blocked.map((e) => e.toString()).includes(req.user._id.toString())) {
			return res.status(400).json({
				success: false,
				message: 'User not found.',
			});
			// if _user has blocked the requester
		}
		const user = {
			name: _user.name,
			username: username,
			dp: _user.dp,
			website: _user.website,
			bio: _user.bio,
			followersCount: _user.followers ? _user.followers.length : 0,
			followingCount: _user.following ? _user.following.length : 0,
		};
		user.isBlocked =
			req.user.blocked && req.user.blocked.map((e) => e.toString()).includes(_user._id.toString())
				? true
				: false;
		if (!user.blocked) {
			user.isFollowing =
				_user.followers &&
				_user.followers.map((e) => e.toString()).includes(req.user._id.toString())
					? true
					: false;
			user.privateAccount =
				_user.private &&
				user.username !== req.user.username &&
				!_user.followers.map((u) => u.toString()).includes(req.user._id.toString());
			user.hasStories = !user.privateAccount && _stories && _stories.length > 0;
			user.storiesSeen =
				user.hasStories &&
				_stories[0].seen_by &&
				_stories[0].seen_by.map((e) => e.toString()).includes(req.user._id.toString())
					? true
					: false;
			user.requestedFollow =
				req.user.requested &&
				req.user.requested.map((e) => e.toString()).includes(_user._id.toString())
					? true
					: false;
			user.posts = await Post.aggregate([
				{ $match: { posted_by: _user._id } },
				{ $sort: { posted_at: -1 } },
				{
					$project: {
						_id: 0,
						shared_id: 1,
						filename: 1,
						likes_count: { $size: '$liked_by' },
						comments_count: { $size: '$comments' },
						privateAccount: 1,
					},
				},
			]);
			user.postCount = user.posts ? user.posts.length : 0;
		}
		return res.status(200).json({
			success: true,
			message: user,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.search = async (req, res) => {
	const text = req.params.text;

	try {
		let users = await User.find({
			$or: [{ username: { $regex: '^' + text } }, { name: { $regex: '^' + text } }],
		});
		users = users.map((user) => {
			return {
				username: user.username,
				name: user.name,
				dp: user.dp,
			};
		});

		return res.status(200).json({
			success: true,
			message: users,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.searchRecents = async (req, res) => {
	try {
		let users = await User.findOne({ username: req.user.username })
			.select('recent_searches')
			.populate('recent_searches');
		users = users.recent_searches.map((user) => {
			return {
				username: user.username,
				name: user.name,
				dp: user.dp,
			};
		});

		return res.status(200).json({
			success: true,
			message: users,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.my_stories = async (req, res) => {
	const user = req.user;
	const following = user.following;
	const project = {
		id: '$_id',
		_id: 0,
		filename: 1,
		posted_by: 1,
		posted_at: 1,
		username: 1,
		name: 1,
		dp: 1,
		seen: '$seen_by',
	};

	try {
		const _stories = await Story.aggregate([
			{ $match: { posted_by: user._id } },
			{
				$match: {
					posted_at: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // TODO change stores greater than
				},
			},
			{
				$lookup: {
					from: User.collection.name,
					localField: 'posted_by',
					foreignField: '_id',
					as: 'user',
				},
			},
			{ $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
			{ $addFields: { username: '$user.username' } },
			{ $addFields: { name: '$user.name' } },
			{ $addFields: { dp: '$user.dp' } },
			{ $sort: { posted_at: 1 } },
			{ $project: project },
		]);

		const stories = _stories.map((story) => {
			return { ...story, seen: story.seen ? story.seen : [] };
		});

		return res.status(200).json({
			success: true,
			message: stories,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.stories = async (req, res) => {
	const user = req.user;
	const following = user.following;
	const project = {
		id: '$_id',
		_id: 0,
		filename: 1,
		posted_by: 1,
		posted_at: 1,
		username: 1,
		name: 1,
		dp: 1,
		seen: {
			$map: {
				input: '$seen_by',
				as: 'a',
				in: {
					$convert: {
						input: '$$a',
						to: 'string',
					},
				},
			},
		},
	};

	try {
		const stories = {};
		const _stories = await Story.aggregate([
			{ $match: { posted_by: { $in: following } } },
			{
				$match: {
					posted_at: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // TODO change stores greater than
				},
			},
			{
				$lookup: {
					from: User.collection.name,
					localField: 'posted_by',
					foreignField: '_id',
					as: 'user',
				},
			},
			{ $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
			{ $addFields: { username: '$user.username' } },
			{ $addFields: { name: '$user.name' } },
			{ $addFields: { dp: '$user.dp' } },
			{ $sort: { posted_at: 1 } },
			{ $project: project },
		]);
		_stories.forEach((story) => {
			if (!stories[story.username]) {
				stories[story.username] = [];
			}
			stories[story.username].push({
				...story,
				seen: story.seen && story.seen.includes(user._id.toString()) ? true : false,
			});
		});

		return res.status(200).json({
			success: true,
			message: stories,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.notifications = async (req, res) => {
	const user = req.user;
	try {
		let notifications = await Notification.find({ notification_to: user })
			.sort({ date: -1 })
			.populate('notification_from post');
		notifications = notifications.map((notification) => {
			const extras = {};
			if (
				notification.type === NotificationType.COMMENT ||
				notification.type === NotificationType.LIKE ||
				notification.type === NotificationType.LIKE_COMMENT
			) {
				extras.post = {
					shared_id: notification.post.shared_id,
					post_image: notification.post.filename,
				};
			} else if (notification.type === NotificationType.FOLLOW) {
				extras.isFollowing =
					user.following &&
					user.following
						.map((_user) => _user.toString())
						.includes(notification.notification_from._id.toString())
						? true
						: false;
			} else if (notification.type === NotificationType.FOLLOW_REQUEST) {
				extras.id = notification._id;
			}
			return {
				notification_from: {
					username: notification.notification_from.username,
					dp: notification.notification_from.dp,
				},
				message: notification.message,
				time: moment(notification.date).fromNow(true),
				type: notification.type,
				text: notification.text,
				...extras,
			};
		});

		return res.status(200).json({
			success: true,
			message: notifications,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.blocked = async (req, res) => {
	const user = req.user;

	try {
		const _blockedUsers = await User.findOne({ username: user.username })
			.populate('blocked')
			.select('blocked');
		const blocked = _blockedUsers.blocked.map((user) => {
			return { username: user.username, name: user.name, dp: user.dp };
		});
		return res.status(200).json({
			success: true,
			message: blocked,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.followers = async (req, res) => {
	const user = req.user;
	const username = req.params.id;
	try {
		const _following = user.following ? user.following.map((user) => user._id.toString()) : [];
		const _followersUsers = await User.findOne({ username })
			.populate('followers')
			.select('followers private');
		if (!_followersUsers) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		if (
			_followersUsers._id.toString() !== user._id.toString() &&
			_followersUsers.private &&
			!_following.includes(_followersUsers._id.toString())
		) {
			return res.status(400).json({
				success: false,
				message: 'Private Account',
			});
		}
		const followers = _followersUsers.followers.map((user) => {
			const _ = { username: user.username, name: user.name, dp: user.dp };
			if (username === req.user.username) {
				_.i_am_following = _following.includes(user._id.toString());
			}
			return _;
		});
		return res.status(200).json({
			success: true,
			message: followers,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.following = async (req, res) => {
	const username = req.params.id;

	try {
		const _following = req.user.following
			? req.user.following.map((user) => user._id.toString())
			: [];
		const _followingUsers = await User.findOne({ username })
			.populate('following')
			.select('following');
		if (!_followingUsers) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		if (
			_followingUsers._id.toString() !== req.user._id.toString() &&
			_followingUsers.private &&
			!_following.includes(_followingUsers._id.toString())
		) {
			return res.status(400).json({
				success: false,
				message: 'Private Account',
			});
		}
		const following = _followingUsers.following.map((user) => {
			return { username: user.username, name: user.name, dp: user.dp };
		});
		return res.status(200).json({
			success: true,
			message: following,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.pendingRequests = async (req, res) => {
	try {
		const _pendingUsers = await User.findOne({ username: req.user.username })
			.populate('pending')
			.select('pending');
		const pending = _pendingUsers.pending.map((user) => {
			return { username: user.username, name: user.name, dp: user.dp };
		});
		return res.status(200).json({
			success: true,
			message: pending,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.pendingNotifications = async (req, res) => {
	try {
		const notificationCount = await Notification.find({
			notification_to: req.user,
			seenStatus: NotificationStatus.UNSEEN,
		}).count();
		return res.status(200).json({
			success: true,
			message: notificationCount,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.follow = async (req, res) => {
	const user1 = req.user;
	const id = req.params.id;
	if (id === user1.username) {
		return res.status(400).json({
			success: false,
			message: 'User not found',
		});
	}
	try {
		const user2 = await User.findOne({ username: id });
		if (!user2) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}

		if (
			user2.followers &&
			user2.followers.map((user) => user.toString()).includes(user1._id.toString())
		) {
			return res.status(400).json({
				success: false,
				message: 'Cannot refollow user',
			});
		}

		let message = '';
		if (user2.private) {
			user2.pending.push(user1);
			user1.requested.push(user2);
			message = 'Requested';

			await Notification.notify({
				type: NotificationType.FOLLOW_REQUEST,
				notification_to: user2,
				notification_from: user1,
				text: 'requested to follow you.',
			});
		} else {
			user1.following.push(user2);
			user2.followers.push(user1);
			message = 'Following';
			await Notification.notify({
				type: NotificationType.FOLLOW,
				notification_to: user2,
				notification_from: user1,
				text: 'has stated following you.',
			});
		}
		await user1.save();
		await user2.save();
		try {
			await Notification.deleteOne({ _id: req.body.notification });
		} catch (err) {}
		return res.status(200).json({
			success: true,
			message: message,
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.unfollow = async (req, res) => {
	const user1 = req.user;
	const id = req.params.id;
	if (id === user1.username) {
		return res.status(400).json({
			success: false,
			message: 'User not found',
		});
	}
	try {
		const user2 = await User.findOne({ username: id });
		if (!user2) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		if (user2.followers && user2.followers.length) user2.followers.pull(user1);
		if (user1.following && user1.following.length) user1.following.pull(user2);
		await user1.save();
		await user2.save();
		return res.status(200).json({
			success: true,
			message: 'Unfollowed',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.block = async (req, res) => {
	const user1 = req.user;
	const id = req.params.id;
	if (id === user1.username) {
		return res.status(400).json({
			success: false,
			message: 'User not found',
		});
	}
	try {
		const user2 = await User.findOne({ username: id });
		if (!user2) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		user1.blocked.push(user2);
		if (user1.following && user1.following.length) user1.following.pull(user2);
		if (user1.followers && user1.followers.length) user1.followers.pull(user2);
		if (user2.following && user2.following.length) user2.following.pull(user1);
		if (user2.followers && user2.followers.length) user2.followers.pull(user1);
		await user1.save();
		await user2.save();
		return res.status(200).json({
			success: true,
			message: 'Blocked',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.unblock = async (req, res) => {
	const user1 = req.user;
	const id = req.params.id;
	if (id === user1.username) {
		return res.status(400).json({
			success: false,
			message: 'User not found',
		});
	}
	try {
		const user2 = await User.findOne({ username: id });
		if (!user2) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		if (user1.blocked && user1.blocked.length) user1.blocked.pull(user2);
		await user1.save();
		return res.status(200).json({
			success: true,
			message: 'Unblocked',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.removeRequest = async (req, res) => {
	const user1 = req.user;
	const id = req.params.id;
	if (id === user1.username) {
		return res.status(400).json({
			success: false,
			message: 'User not found',
		});
	}
	try {
		const user2 = await User.findOne({ username: id });
		if (!user2) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		if (user1.requested && user1.requested.length) user1.requested.pull(user2);
		if (user2.pending && user2.pending.length) user2.pending.pull(user1);
		await user1.save();
		await user2.save();
		return res.status(200).json({
			success: true,
			message: 'Unblocked',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.removeFollower = async (req, res) => {
	const user1 = req.user;
	const id = req.params.id;
	if (id === user1.username) {
		return res.status(400).json({
			success: false,
			message: 'User not found',
		});
	}
	try {
		const user2 = await User.findOne({ username: id });
		if (!user2) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		if (user1.followers && user1.followers.length) user1.followers.pull(user2);
		if (user2.following && user2.following.length) user2.following.pull(user1);
		await user1.save();
		await user2.save();
		return res.status(200).json({
			success: true,
			message: 'Follower Removed',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.acceptRequest = async (req, res) => {
	const user1 = req.user;
	const id = req.params.id;
	if (id === user1.username) {
		return res.status(400).json({
			success: false,
			message: 'User not found',
		});
	}
	try {
		const user2 = await User.findOne({ username: id });
		if (!user2) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		if (user2.requested && user2.requested.length) user2.requested.pull(user1);
		if (user1.pending && user1.pending.length) user1.pending.pull(user2);
		user1.followers.push(user2);
		user2.following.push(user1);
		await user1.save();
		await user2.save();
		try {
			await Notification.deleteOne({ _id: req.body.notification });
		} catch (err) {}
		return res.status(200).json({
			success: true,
			message: 'Follow Request Accepted',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.deleteRequest = async (req, res) => {
	const user1 = req.user;
	const id = req.params.id;
	if (id === user1.username) {
		return res.status(400).json({
			success: false,
			message: 'User not found',
		});
	}
	try {
		const user2 = await User.findOne({ username: id });
		if (!user2) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		if (user2.requested && user2.requested.length) user2.requested.pull(user1);
		if (user1.pending && user1.pending.length) user1.pending.pull(user2);
		await user1.save();
		await user2.save();
		try {
			await Notification.deleteOne({ _id: req.body.notification });
		} catch (err) {}
		return res.status(200).json({
			success: true,
			message: 'Unblocked',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.clearPendingNotifications = async (req, res) => {
	const user = req.user;

	try {
		await Notification.updateMany(
			{ notification_to: user._id },
			{ seenStatus: NotificationStatus.SEEN }
		);
		return res.status(200).json({
			success: true,
			message: 'Notifications Cleared',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.addRecentSearch = async (req, res) => {
	let username = req.params.user;
	if (!username) {
		return res.status(400).json({
			success: false,
			message: 'Invalid username',
		});
	}
	try {
		const user = await User.findOne({ username: req.user.username }).select('recent_searches');
		const search = await User.findOne({ username });
		const includes = user.recent_searches
			.map((user) => user._id.toString())
			.includes(search._id.toString());
		if (!includes) {
			user.recent_searches.push(search);
			await user.save();
		}
		return res.status(200).json({
			success: true,
			message: 'Recent search added',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.clearRecentSearch = async (req, res) => {
	let user = req.user;
	let removedUser = req.params.removedUser;
	try {
		if (!removedUser) {
			await User.updateMany({ username: user.username }, { recent_searches: [] });
		} else {
			user = await User.findOne({ username: user.username }).select('recent_searches');
			removedUser = await User.findOne({ username: removedUser });
			if (user.recent_searches && user.recent_searches.length > 0) {
				user.pull(removedUser);
				await user.save();
			}
		}
		return res.status(200).json({
			success: true,
			message: 'Recent search Cleared',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.storySeen = async (req, res) => {
	let user = req.user;
	let storyID = req.params.storyID;
	try {
		const story = await Story.findById(storyID);
		story.seen_by.push(user);
		await story.save();
		return res.status(200).json({
			success: true,
			message: 'Recent search Cleared',
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};
