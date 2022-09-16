const Device = require('../model/Device');
const User = require('../model/User');
const log = require('../utils/Logger');

const RefreshJWT = async (req, res, callback) => {
	const refreshToken = req.cookies.refresh_token;
	if (!refreshToken) {
		res.clearCookie('jwt');
		res.clearCookie('refresh_token');
		return callback({
			success: false,
			message: 'Token Refresh Failed',
		});
	}
	try {
		const device = await Device.findOne({ token: refreshToken });

		if (!device) {
			res.clearCookie('jwt');
			res.clearCookie('refresh_token');
			return callback({
				success: false,
				message: 'Invalid Refresh Token.',
			});
		}
		if (device.isLoggedOut) {
			res.clearCookie('jwt');
			res.clearCookie('refresh_token');
			return callback({
				success: false,
				message: 'Refresh Token Expired',
			});
		}
		const user = await User.findById(device.user);
		const accessToken = user.getSignedToken();
		await user.save();
		device.latitude = req.body.latitude;
		device.longitude = req.body.longitude;
		device.last_login = require('../utils/Time').fetchDate();
		await device.save();

		res.cookie('jwt', accessToken, {
			sameSite: 'strict',
			expires: new Date(Date.now() + 3 * 60 * 1000),
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});
		callback({
			success: true,
			message: 'Token Refresh Successful',
			user: user,
		});
	} catch (error) {
		log(error);
		return callback({
			success: false,
			message: 'Server Error',
		});
	}
};

module.exports = RefreshJWT;
