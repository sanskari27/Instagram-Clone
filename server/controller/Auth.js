const User = require('../model/User');
const Device = require('../model/Device');
const log = require('../utils/Logger');
const RefreshJWT = require('../middleware/RefreshJWT');
addDays = function (days) {
	var date = new Date();
	date.setDate(date.getDate() + days);
	return date;
};
exports.login = async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({
			success: false,
			message: 'Missing Credentials. Username, Password required.',
		});
	}
	try {
		const user = await User.findOne({
			$or: [{ email: username }, { username: username }],
		}).select('username dp name password private');
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		const passwordMatched = await user.verifyPassword(password);

		if (!passwordMatched) {
			return res.status(404).json({
				success: false,
				message: 'Invalid Credentials',
			});
		}

		const accessToken = user.getSignedToken();
		await user.save();

		const device = await Device.create({ user: user });
		const refreshToken = await device.parseInformation(req);

		res.cookie('jwt', accessToken, {
			sameSite: 'strict',
			expires: new Date(Date.now() + 3 * 60 * 1000),
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});
		res.cookie('refresh_token', refreshToken, {
			sameSite: 'strict',
			expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});
		res.status(200).json({
			success: true,
			message: 'Authentication Successful',
			details: fetchDetails(user),
		});
	} catch (err) {
		log(err);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.register = async (req, res) => {
	const { name, email, username, password } = req.body;
	if (!email || !password || !username || !name) {
		return res.status(400).json({
			success: false,
			message: 'name, email, username, password required.',
		});
	}
	try {
		let _userExists = await User.findOne({ username });
		if (_userExists) {
			return res.status(400).json({
				success: false,
				message: 'Username already taken.',
			});
		}
		_userExists = await User.findOne({ email });
		if (_userExists) {
			return res.status(400).json({
				success: false,
				message: 'Email already registered.',
			});
		}

		const user = await User.create({
			name,
			email,
			username,
			password,
		});

		const accessToken = user.getSignedToken();
		await user.save();

		const device = await Device.create({ user: user });
		const refreshToken = await device.parseInformation(req);

		res.cookie('jwt', accessToken, {
			sameSite: 'strict',
			expires: new Date(Date.now() + 3 * 60 * 1000),
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});
		res.cookie('refresh_token', refreshToken, {
			sameSite: 'strict',
			expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});

		res.status(201).json({
			success: true,
			message: 'User Registered',
			details: fetchDetails(user),
		});
	} catch (error) {
		log(error);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.forgotPassword = async (req, res) => {
	const { username } = req.body;
	if (!username) {
		return res.status(400).json({
			success: false,
			message: 'Missing Credentials. Username required.',
		});
	}
	try {
		const user = await User.findOne({
			$or: [{ email: username }, { username: username }],
		}).select('security_question');
		if (!user) {
			return res.status(400).json({
				success: false,
				message: 'User not found',
			});
		}
		if (!user.security_question) {
			return res.status(400).json({
				success: false,
				message: 'Cannot recover this account.',
			});
		}

		res.cookie('reset_token', user.generateResetToken(), {
			sameSite: 'strict',
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});
		res.status(200).json({
			success: true,
			message: user.security_question,
		});
	} catch (error) {
		log(error);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.verifySecurity = async (req, res) => {
	const { answer } = req.body;
	const resetToken = req.cookies.reset_token;
	if (!answer || !resetToken) {
		return res.status(400).json({
			success: false,
			message: 'Security Answer & Pass required.',
		});
	}
	try {
		const user = await User.findOne({ resetToken }).select('security_answer');
		if (!user) {
			return res.status(400).json({
				success: false,
				message: 'Password reset failed',
			});
		}

		if (user.security_answer !== answer) {
			return res.status(400).json({
				success: false,
				message: 'Invalid Security Answer',
			});
		}

		res.clearCookie('reset_token');
		res.cookie('reset_token', user.generateResetToken(), {
			sameSite: 'strict',
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});
		res.status(201).json({
			success: true,
			message: `Verification Successful`,
		});
	} catch (error) {
		log(error);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
			details: 'Internal Server Error!!!',
		});
	}
};

exports.resetPassword = async (req, res) => {
	const { password } = req.body;
	const resetToken = req.cookies.reset_token;
	if (!resetToken || !password) {
		return res.status(400).json({
			success: false,
			message: 'Security Answer & Pass required.',
		});
	}
	try {
		const user = await User.findOne({ resetToken });
		if (!user) {
			return res.status(400).json({
				success: false,
				message: 'Password reset failed',
			});
		}

		user.password = password;
		user.resetToken = undefined;
		const accessToken = user.getSignedToken();
		await user.save();

		res.clearCookie('reset_token');

		const device = await Device.create({ user: user });
		const refreshToken = await device.parseInformation(req);

		res.cookie('jwt', accessToken, {
			sameSite: 'strict',
			expires: new Date(Date.now() + 3 * 60 * 1000),
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});
		res.cookie('refresh_token', refreshToken, {
			sameSite: 'strict',
			expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});

		res.status(201).json({
			success: true,
			message: `Password Reset Successful`,
		});
	} catch (error) {
		log(error);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
			details: 'Internal Server Error!!!',
		});
	}
};

exports.validateUsername = async (req, res) => {
	const { username } = req.body;
	if (!username) {
		return res.status(400).json({
			success: false,
			message: 'Username required.',
		});
	}
	try {
		const user = await User.findOne({ username });
		res.status(200).json({
			success: true,
			username_taken: user !== null,
		});
	} catch (error) {
		log(error);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};
exports.validateEmail = async (req, res) => {
	const { email } = req.body;
	if (!email) {
		return res.status(400).json({
			success: false,
			message: 'Email required.',
		});
	}
	try {
		const user = await User.findOne({ email });
		res.status(200).json({
			success: true,
			email_taken: user !== null,
		});
	} catch (error) {
		log(error);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.isLoggedIn = async (req, res) => {
	RefreshJWT(req, res, ({ success, message, user }) => {
		const details = fetchDetails(user);
		return res.status(success ? 200 : 400).json({
			success,
			message,
			details,
		});
	});
};

exports.securityQuestion = async (req, res) => {
	const user = await User.findOne({ username: req.user.username }).select('security_question');
	return res.status(200).json({
		success: true,
		message: user.security_question,
	});
};

exports.isSecurityUpdated = async (req, res) => {
	const user = await User.findOne({ username: req.user.username }).select('security_question');
	return res.status(200).json({
		success: true,
		message: user.security_question ? true : false,
	});
};

exports.updateSecurityQuestion = async (req, res) => {
	const { question, answer } = req.body;
	if (!question || !answer) {
		return res.status(400).json({
			success: true,
			message: 'Invalid security question and answer',
		});
	}
	try {
		const user = await User.findOne({ username: req.user.username });
		user.security_question = question;
		user.security_answer = answer;
		await user.save();
		return res.status(200).json({
			success: true,
			message: 'Security Updated',
		});
	} catch (error) {
		log(error);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

exports.logout = async (req, res) => {
	const refreshToken = req.cookies.refresh_token;
	if (!refreshToken) {
		return res.status(200).json({
			success: true,
			message: 'Token not found',
		});
	}
	try {
		const device = await Device.findOne({ token: refreshToken });
		if (!device) {
			return res.status(200).json({
				success: true,
				message: 'Device not registered.',
			});
		}

		device.logout();

		res.status(200).json({
			success: true,
			message: 'Logged Out Successfully.',
		});
	} catch (error) {
		log(error);
		return res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
};

const fetchDetails = (user) =>
	user
		? {
				username: user.username,
				name: user.name,
				dp: user.dp,
				private: user.private ? true : false,
				email: user.email,
				website: user.website,
				bio: user.bio,
				gender: user.gender,
				dob: user.dob,
				darkMode: user.darkMode ? true : false,
		  }
		: null;
