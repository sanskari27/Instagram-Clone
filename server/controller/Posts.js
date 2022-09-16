const User = require('../model/User');
const Post = require('../model/Post');
const Story = require('../model/Story');
const Comment = require('../model/Comment');
const Notification = require('../model/Notification');
const { NotificationType } = require('../model/Notification');
const log = require('../utils/Logger');
const moment = require('moment');
const FileUpload = require('../utils/FileUpload');

exports.feed_post = async (req, res) => {
	const user = req.user;
	const following = user.following;
	try {
		const posts = await Post.aggregate([
			{ $match: { posted_by: { $in: following } } },
			{ $sort: { posted_at: -1 } },
			{
				$project: {
					_id: 0,
					shared_id: 1,
				},
			},
		]);
		return res.status(200).json({
			success: true,
			message: posts.map((post) => post.shared_id),
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.saved_post = async (req, res) => {
	try {
		const posts = await Post.find({ saved_by: req.user._id })
			.sort({ posted_at: -1 })
			.select('shared_id');
		return res.status(200).json({
			success: true,
			message: posts.map((post) => post.shared_id),
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.getPost = async (req, res) => {
	const user = req.user;
	const post = {
		hasStories: false,
		storiesSeen: false,
		dp: '',
		username: '',
		name: '',
		filename: '',
		caption: '',
		liked: false,
		time: '',
		shared_id: req.params.id,
		likes: [],
		comments: [],
	};

	try {
		const _post = await Post.findOne({ shared_id: req.params.id }).populate('posted_by liked_by');
		if (!_post) {
			return res.status(400).json({
				success: false,
				message: 'Post not found',
			});
		}
		const _user = await User.findOne({ username: _post.posted_by.username });
		if (!_user) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		const _stories = await Story.findOne({ posted_by: _user })
			.gte('posted_at', new Date(Date.now() - 24 * 60 * 60 * 1000))
			.sort({ posted_at: -1 })
			.limit(1);
		post.shared_id = _post.shared_id;
		post.filename = _post.filename;
		post.caption = _post.caption;
		post.username = _user.username;
		post.name = _user.name;
		post.dp = _user.dp;
		post.time = moment(_post.posted_at).fromNow();
		post.hasStories = _stories && _stories.seen_by && _stories.seen_by.length > 0 ? true : false;
		post.storiesSeen =
			post.hasStories &&
			_stories.seen_by.map((user) => user._id.toString()).includes(user._id.toString())
				? true
				: false;
		post.saved =
			_post.saved_by &&
			_post.saved_by.map((user) => user._id.toString()).includes(user._id.toString())
				? true
				: false;

		post.comments = _post.comments.length;
		if (_post.liked_by) {
			_post.liked_by.forEach((user_) => {
				if (user_.username === user.username) {
					post.liked = true;
				}
				post.likes.push({
					username: user.username,
					dp: user.dp,
					name: user.name,
				});
			});
		}
		return res.status(200).json({
			success: true,
			message: post,
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.getComments = async (req, res) => {
	const user = req.user;
	const project = {
		_id: 1,
	};

	try {
		const post_comments = await Post.findOne(
			{ shared_id: req.params.post_id },
			{ _id: 0, comments: 1 }
		);

		const comments = await Comment.aggregate([
			{ $match: { _id: { $in: post_comments.comments } } },
			{ $addFields: { likes: '$liked_by' } },
			{ $sort: { comment_at: -1 } },
			{ $project: project },
		]);

		return res.status(200).json({
			success: true,
			message: comments.map((comment) => comment._id.toString()),
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.getComment = async (req, res) => {
	const user = req.user;

	try {
		const comment = await Comment.findOne({ _id: req.params.comment_id }).populate('comment_by');
		const _comment = {
			username: comment.comment_by.username,
			dp: comment.comment_by.dp,
			time: moment(comment.comment_at).fromNow(),
			likes: comment.liked_by,
			text: comment.text,
			liked:
				comment.liked_by &&
				comment.liked_by.map((_user) => _user._id.toString()).includes(user._id.toString())
					? true
					: false,

			replies: comment.replies,
		};

		return res.status(200).json({
			success: true,
			message: _comment,
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.likepost = async (req, res) => {
	const user = req.user;
	try {
		const _post = await Post.findOne({ shared_id: req.params.id });
		if (!_post) {
			return res.status(400).json({
				success: false,
				message: 'Post not found',
			});
		}
		const contains =
			_post.liked_by &&
			_post.liked_by.map((_user) => _user._id.toString()).includes(user._id.toString())
				? true
				: false;
		if (contains) {
			_post.liked_by.pull(user);
		} else {
			_post.liked_by.push(user);
			if (req.user !== _post.posted_by) {
				await Notification.notify({
					type: NotificationType.LIKE,
					notification_to: _post.posted_by,
					notification_from: req.user,
					text: 'liked your photo.',
					post: _post,
				});
			}
		}
		await _post.save();

		return res.status(200).json({
			success: true,
			message: contains ? 'Un-Liked' : 'Liked',
			liked: !contains,
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.savepost = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.user.username });
		const _post = await Post.findOne({ shared_id: req.params.id });
		if (!_post) {
			return res.status(400).json({
				success: false,
				message: 'Post not found',
			});
		}
		const contains =
			_post.saved_by &&
			_post.saved_by.map((user) => user._id.toString()).includes(user._id.toString())
				? true
				: false;
		if (contains) {
			_post.saved_by.pull(user);
		} else {
			_post.saved_by.push(user);
		}
		await _post.save();
		return res.status(200).json({
			success: true,
			message: contains ? 'Un-Saved' : 'Saved',
			saved: !contains,
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.create_post = async (req, res) => {
	const type = req.params.type;
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

	try {
		await Post.create({
			filename: filename,
			posted_by: req.user,
			caption: req.body.caption,
		});
		return res.status(200).json({
			success: true,
			message: 'Post created successfully',
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.create_story = async (req, res) => {
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

	try {
		await Story.create({
			filename: filename,
			posted_by: req.user,
		});
		return res.status(200).json({
			success: true,
			message: 'Story created successfully',
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.delete_post = async (req, res) => {
	try {
		await Post.remove({ shared_id: req.params.id });
		return res.status(200).json({
			success: true,
			message: 'Post created successfully',
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.create_comment = async (req, res) => {
	try {
		const post = await Post.findOne({ shared_id: req.params.post_id });
		const comment = await Comment.create({
			text: req.body.comment,
			comment_by: req.user,
		});
		post.comments.push(comment);
		await post.save();

		if (req.user._id !== post.posted_by) {
			await Notification.notify({
				type: NotificationType.COMMENT,
				notification_to: post.posted_by,
				notification_from: req.user,
				text: 'commented: ' + comment.text + '.',
				comment: comment,
				post: post,
			});
		}
		return res.status(200).json({
			success: true,
			message: 'Comment created successfully',
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.delete_comment = async (req, res) => {
	try {
		const post = await Post.findOne({ shared_id: req.params.post_id });
		const comment = await Comment.findOne({ _id: req.params.comment_id });
		if (!post || !comment) {
			return res.status(400).json({
				success: false,
				message: 'Unable to delete comment',
			});
		}
		if (post.comments && post.comments.length > 0) {
			post.comments.pull(comment);
			await post.save();
			return res.status(200).json({
				success: true,
				message: 'Comment deleted successfully',
			});
		} else {
			return res.status(400).json({
				success: false,
				message: 'Unable to delete comment',
			});
		}
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.create_reply = async (req, res) => {
	try {
		const comment = await Comment.findOne({ _id: req.params.comment_id });
		if (!comment) {
			return res.status(400).json({
				success: false,
				message: 'Unable to create reply',
			});
		}
		const reply = await Comment.create({
			text: req.body.comment,
			comment_by: req.user,
		});
		comment.replies.push(reply);
		await comment.save();

		if (req.user !== comment.comment_by) {
			await Notification.notify({
				type: NotificationType.COMMENT,
				notification_to: comment.comment_by,
				notification_from: req.user,
				text: 'commented: ' + reply.text + '.',
				comment: reply,
			});
		}
		return res.status(200).json({
			success: true,
			message: 'Reply created successfully',
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.delete_reply = async (req, res) => {
	try {
		const comment = await Comment.findOne({ _id: req.params.comment_id });
		const reply = await Comment.findOne({ _id: req.params.reply_id });
		if (!comment || !reply) {
			return res.status(400).json({
				success: false,
				message: 'Unable to delete reply',
			});
		}
		if (comment.replies && pocommentst.replies.length > 0) {
			comment.replies.pull(comment);
			await comment.save();
			await Comment.deleteOne({ _id: reply._id });
			return res.status(200).json({
				success: true,
				message: 'Reply deleted successfully',
			});
		} else {
			return res.status(400).json({
				success: false,
				message: 'Unable to delete reply',
			});
		}
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.likeComment = async (req, res) => {
	const user = req.user;
	try {
		const comment = await Comment.findOne({ _id: req.params.comment_id });
		const post = await Post.findOne({ shared_id: req.params.post_id });
		if (!comment || !post) {
			return res.status(400).json({
				success: false,
				message: 'Unable like comment',
			});
		}
		const contains =
			comment.liked_by &&
			comment.liked_by.map((_user) => _user.toString()).includes(user._id.toString())
				? true
				: false;
		if (contains) {
			comment.liked_by.pull(user);
		} else {
			comment.liked_by.push(user);
		}
		await comment.save();
		if (req.user._id !== comment.comment_by) {
			await Notification.notify({
				type: NotificationType.LIKE_COMMENT,
				notification_to: comment.comment_by,
				notification_from: req.user,
				text: 'liked your comment: ' + comment.text + '.',
				comment: comment,
				post: post,
			});
		}
		return res.status(200).json({
			success: true,
			message: contains ? 'Un-Liked' : 'Liked',
			liked: !contains,
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};
