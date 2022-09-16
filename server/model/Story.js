const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
	filename: { type: String, unique: true },
	posted_by: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	seen_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	posted_at: { type: Date },
});

StorySchema.pre('save', async function (next) {
	if (!this.posted_at) {
		this.posted_at = Date.now();
		next();
	}
});

const Story = mongoose.model('Story', StorySchema);

module.exports = Story;
