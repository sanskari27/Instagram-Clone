const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const PostSchema = new mongoose.Schema({
	shared_id: { type: String, unique: true },
	filename: { type: String, unique: true },
	posted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	caption: { type: String },
	liked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
	posted_at: { type: Date },
	saved_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

PostSchema.pre('save', async function (next) {
	if (!this.posted_at) {
		this.posted_at = Date.now();
	}
	if (!this.shared_id) {
		this.shared_id = nanoid(8);
	}
	next();
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
