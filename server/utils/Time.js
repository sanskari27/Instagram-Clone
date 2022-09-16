const moment = require('moment');
module.exports.fetchDate = function () {
	return moment().format('MMMM Do YYYY, h:mm:ss a');
};
