const mongoose = require('mongoose');
const moment = require('../utils/Time');
const { nanoid } = require('nanoid');

const DeviceSchema = new mongoose.Schema({
	token: {
		type: String,
		unique: true,
		index: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	browser: { type: String },
	platform: { type: String },
	last_login: { type: String },
	latitude: { type: String },
	longitude: { type: String },
	isLoggedOut: { type: Boolean },
});

DeviceSchema.pre('save', async function (next) {
	if (this.token || this.isLoggedOut) {
		return next();
	}
	this.token = nanoid();
	return next();
});

DeviceSchema.methods.parseInformation = async function (req) {
	this.browser = req.useragent.browser;
	this.platform = req.useragent.platform;
	this.isLoggedOut = false;
	this.last_login = moment.fetchDate();
	await this.save();
	return this.token;
};

DeviceSchema.methods.logout = async function () {
	this.isLoggedOut = true;
	this.last_login = moment.fetchDate();
	this.token = this.token + '_' + this.last_login;
	await this.save();
};

const Device = mongoose.model('Device', DeviceSchema);

module.exports = Device;
