const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
	comment_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	liked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
	text: { type: String },
	comment_at: { type: Date },
});

CommentSchema.pre('save', async function (next) {
	if (!this.comment_at) {
		this.comment_at = Date.now();
		next();
	}
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
