require('dotenv').config();

const express = require('express');
const app = express();
require('./config/DB').connect();
const cors = require('cors');

const log = require('./utils/Logger');
const moment = require('./utils/Time');
const cookieParser = require('cookie-parser');
const useragent = require('express-useragent');

global.__basedir = __dirname;

//-----------------------------------------------------------------------------------------

app.use(express.json());
app.use(cookieParser());
app.use(useragent.express());
app.use(express.static(__basedir + 'static/dp'));

//-----------------------------------------------------------------------------------------
// const allowlist = [process.env.WEBPAGE_URL];

const corsOptionsDelegate = (req, callback) => {
	let corsOptions;

	// let isDomainAllowed = allowlist.indexOf(req.header('Origin')) !== -1;

	// if (isDomainAllowed) {
	// 	// Enable CORS for this request
	// 	corsOptions = { origin: true, credentials: true };
	// } else {
	// 	// Disable CORS for this request
	// 	corsOptions = { origin: false };
	// }
	corsOptions = { origin: true, credentials: true };
	callback(null, corsOptions);
};
app.use(cors(corsOptionsDelegate));

//----------------------------------------------------------------------------------
app.get('/api', async (req, res) => {
	res.send('API RUNNING');
});

app.use('/auth', require('./route/Auth'));
app.use('/explore', require('./route/Explore'));
app.use('/post', require('./route/Posts'));
app.use('/profile', require('./route/Profile'));
app.use('/messenger', require('./route/Messenger'));
app.use('/images', require('./route/Images'));

const server = app.listen(process.env.PORT, () =>
	console.log(`Server running at ${moment.fetchDate()} on port ${process.env.PORT}`)
);

require('./config/Socket')();

process.on('unhandledRejection', (err, promise) => {
	console.log(`Logged Error at ${moment.fetchDate()}: ${err.message}`);
	log(err);
	server.close(() => process.exit(1));
});
