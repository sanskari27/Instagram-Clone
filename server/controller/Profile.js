const User = require('../model/User');
const Device = require('../model/Device');
const log = require('../utils/Logger');
const moment = require('moment');
const FileUpload = require('../utils/FileUpload');

exports.saveProfile = async (req, res) => {
	const user = req.user;
	const { username, name, email, website, bio, gender, dob } = req.body;

	if (!username) {
		return res.status(400).json({
			success: false,
			message: 'Username Cannot be empty',
		});
	} else if (!name) {
		return res.status(400).json({
			success: false,
			message: 'Name Cannot be empty',
		});
	} else if (!email) {
		return res.status(400).json({
			success: false,
			message: 'Email Cannot be empty',
		});
	} else if (!gender) {
		return res.status(400).json({
			success: false,
			message: 'Gender Cannot be empty',
		});
	}

	try {
		if (user.username !== username) {
			const user = await User.findOne({ username });
			if (user) {
				return res.status(400).json({
					success: false,
					message: 'Username already taken.',
				});
			}
		}
		if (user.email !== email) {
			const user = await User.findOne({ email });
			if (user) {
				return res.status(400).json({
					success: false,
					message: 'Email already taken.',
				});
			}
		}
		user.username = username;
		user.name = name;
		user.email = email;
		user.website = website;
		user.bio = bio;
		user.gender = gender;
		user.dob = moment(dob).format('YYYY-MM-DD');
		await user.save();
		return res.status(200).json({
			success: true,
			message: 'Profile Saved',
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.darkMode = async (req, res) => {
	const user = req.user;
	const { darkMode } = req.body;

	try {
		user.darkMode = darkMode;
		await user.save();
		return res.status(200).json({
			success: true,
			message: 'Dark Mode Updated',
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.updateDP = async (req, res) => {
	const user = req.user;
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
	if (!filename) {
		return res.status(400).json({
			success: false,
			message: 'File upload failed',
		});
	}
	try {
		user.dp = filename;
		await user.save();
		return res.status(200).json({
			success: true,
			message: 'DP updated',
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.updatePassword = async (req, res) => {
	const { old_password, new_password } = req.body;

	try {
		const user = await User.findOne({ username: req.user.username }).select('password');

		const passwordMatched = await user.verifyPassword(old_password);
		if (!passwordMatched) {
			return res.status(400).json({
				success: false,
				message: 'Your old password was entered incorrectly. Please enter it again.',
			});
		}
		user.password = new_password;
		await user.save();
		return res.status(200).json({
			success: true,
			message: 'Password Updated',
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.updatePrivacy = async (req, res) => {
	const { privateAccount } = req.body;
	try {
		const user = req.user;
		user.private = privateAccount;
		await user.save();
		return res.status(200).json({
			success: true,
			message: 'Privacy Updated',
			private: privateAccount,
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.loginActivity = async (req, res) => {
	try {
		let devices = await Device.find({ user: req.user }).sort({ isLoggedOut: 1, last_login: -1 });
		devices = await Promise.all(
			devices.map(async (device) => {
				let last_login = moment(device.last_login, 'MMMM Do YYYY, h:mm:ss a').fromNow();
				if (req.cookies && req.cookies.refresh_token === device.token) {
					last_login = 'Active now';
				}
				let location = undefined;
				if (device.latitude && device.longitude) {
					location = device.latitude + ',' + device.longitude;
				}
				return {
					id: device._id,
					platform: device.platform,
					browser: device.browser,
					isLoggedOut: device.isLoggedOut,
					last_login: last_login,
					location,
				};
			})
		);
		return res.status(200).json({
			success: true,
			message: devices,
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.removeDevice = async (req, res) => {
	try {
		const device = await Device.findById(req.params.id);
		if (!device) {
			return res.status(400).json({
				success: false,
				message: 'Invalid device id',
			});
		}
		await device.remove();
		return res.status(200).json({
			success: true,
			message: device,
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.logoutDevice = async (req, res) => {
	try {
		const device = await Device.findById(req.params.id);
		if (!device) {
			return res.status(400).json({
				success: false,
				message: 'Invalid device id',
			});
		}
		device.logout();
		return res.status(200).json({
			success: true,
			message: 'Logged out.',
		});
	} catch (err) {
		log(err);
		return res.status(400).json({
			success: false,
			message: 'Server Error',
		});
	}
};
