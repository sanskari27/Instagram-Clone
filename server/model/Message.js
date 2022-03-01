const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const MessageType = {
	TEXT: 'text',
	IMAGE: 'image',
	POST: 'post',
	STORY_REPLIED: 'replied to story',
};

const MessageSchema = new mongoose.Schema({
	conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
	sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	seen_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	time: { type: Date },
	type: {
		type: String,
		enum: Object.values(MessageType),
		default: MessageType.TEXT,
	},
	text: { type: String },
	post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
	story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
});

MessageSchema.pre('save', async function (next) {
	if (!this.time) {
		this.time = Date.now();
	}
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;

module.exports.MessageType = MessageType;
