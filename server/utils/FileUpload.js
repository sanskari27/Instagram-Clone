const multer = require('multer');
const { nanoid } = require('nanoid');
var path = require('path');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'static/uploads');
	},
	filename: (req, file, cb) => {
		cb(null, nanoid() + path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage }).single('file');

const FileUpload = (req, res) => {
	return new Promise((resolve, reject) => {
		upload(req, res, (err) => {
			if (err) {
				reject(err);
			}
			resolve(req.file.filename);
		});
	});
};
module.exports = FileUpload;
