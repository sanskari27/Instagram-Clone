const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
	members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	lastMessage: { type: String },
	time: { type: Date },
	title: { type: String },
});

ConversationSchema.pre('save', async function (next) {
	if (!this.time) {
		this.time = Date.now();
		next();
	}
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
