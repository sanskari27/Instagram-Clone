const mongoose = require('mongoose');
const log = require('../utils/Logger');

exports.connect = () => {
	// Connecting to the database
	mongoose
		.connect(process.env.DATABASE_URL)
		.then(() => {
			console.log('Successfully connected to database');
		})
		.catch((error) => {
			console.log('database connection failed. exiting now...');
			console.error(error);
			log(error);
			process.exit(1);
		});
};
