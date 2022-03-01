const log = require('../utils/Logger');
var path = require('path');
const fs = require('fs');

exports.file = async (req, res) => {
	const name = req.params.name;
	const path = __basedir + '/static/uploads/' + name;
	try {
		stats = fs.statSync(path);
		return res.sendFile(path);
	} catch (e) {
		return res.status(400).json({ success: false, message: 'Filename undefined' });
	}
};
