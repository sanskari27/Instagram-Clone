const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: 'Email required',
		unique: true,
		trim: true,
		lowercase: true,
		index: true,
	},
	username: {
		type: String,
		required: 'Username required',
		unique: true,
		trim: true,
		index: true,
	},
	password: {
		type: String,
		required: 'Password required',
		minlength: 6,
		select: false,
	},
	name: { type: String },
	website: { type: String },
	bio: { type: String },
	dp: { type: String },
	gender: { type: String },
	dob: { type: String },
	private: { type: Boolean },
	darkMode: { type: Boolean },
	followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	pending: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	requested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	recent_searches: {
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		select: false,
	},
	resetToken: { type: String, select: false },
	security_question: { type: String, select: false },
	security_answer: { type: String, select: false },
});

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(Number(process.env.SALT_FACTOR));
		this.password = await bcrypt.hash(this.password, salt);
		return next();
	} catch (err) {
		return next(err);
	}
});

UserSchema.methods.getSignedToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

UserSchema.methods.generateResetToken = function () {
	const token = nanoid();
	this.resetToken = token;
	this.save();
	return token;
};

UserSchema.methods.verifyPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
