const express = require('express');
const router = express.Router();

const {
	login,
	register,
	forgotPassword,
	verifySecurity,
	resetPassword,
	validateUsername,
	validateEmail,
	isLoggedIn,
	isSecurityUpdated,
	securityQuestion,
	updateSecurityQuestion,
	logout,
} = require('../controller/Auth');

const VerifyJWT = require('../middleware/VerifyJWT');

router.route('/security-question').all(VerifyJWT).get(securityQuestion);
router.route('/security-updated').all(VerifyJWT).get(isSecurityUpdated);

router.route('/login').post(login);
router.route('/register').post(register);
router.route('/forgot-password').post(forgotPassword);
router.route('/verify-security').post(verifySecurity);
router.route('/validate-username').post(validateUsername);
router.route('/validate-email').post(validateEmail);
router.route('/update-security').all(VerifyJWT).post(updateSecurityQuestion);
router.route('/loggedin').post(isLoggedIn);
router.route('/logout').post(logout);

router.route('/reset-password').put(resetPassword);

module.exports = router;
