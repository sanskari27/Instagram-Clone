const { verify } = require('jsonwebtoken');
const User = require('../model/User');
const RefreshJWT = require('./RefreshJWT');

const VerifyJWT = async (req, res, next) => {
	let token = req.cookies.jwt;
	try {
		const decoded = verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			return res.status(401).json({
				success: false,
				message: 'Invalid JWT Token.',
				details: 'JWT token does not contain any payload',
			});
		}
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid Credentials.',
				details: 'JWT token does not refer to any user.',
			});
		}

		req.user = user;
		next();
	} catch (err) {
		RefreshJWT(req, res, ({ success, message, user }) => {
			if (!success) {
				return res.status(401).json({
					success: false,
					message: message,
				});
			}
			req.user = user;
			next();
		});
	}
};

module.exports = VerifyJWT;
