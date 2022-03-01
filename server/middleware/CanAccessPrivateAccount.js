const { verify } = require('jsonwebtoken');
const User = require('../model/User');
const RefreshJWT = require('./RefreshJWT');

const CanAccessPrivateAccount = async (req, res, next) => {
	const user = req.user;
	try {
	} catch (err) {
		return res.status(401).json({
			success: false,
			message: 'Cannot access private account',
		});
	}
};

module.exports = CanAccessPrivateAccount;
