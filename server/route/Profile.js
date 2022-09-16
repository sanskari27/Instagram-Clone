const express = require('express');
const router = express.Router();
const VerifyJWT = require('../middleware/VerifyJWT');
const {
	loginActivity,
	saveProfile,
	darkMode,
	updateDP,
	updatePassword,
	updatePrivacy,
	logoutDevice,
	removeDevice,
} = require('../controller/Profile');

router.route('/login-activity').all(VerifyJWT).get(loginActivity);

router.route('/save-profile').all(VerifyJWT).post(saveProfile);
router.route('/update-dp').all(VerifyJWT).post(updateDP);
router.route('/update-password').all(VerifyJWT).post(updatePassword);
router.route('/update-privacy').all(VerifyJWT).post(updatePrivacy);
router.route('/remove-device/:id').all(VerifyJWT).post(removeDevice);
router.route('/logout-device/:id').all(VerifyJWT).post(logoutDevice);

router.route('/dark-mode').all(VerifyJWT).put(darkMode);

module.exports = router;
