const express = require('express');
const router = express.Router();
const VerifyJWT = require('../middleware/VerifyJWT');
const { dp, file } = require('../controller/Images');

router.route('/:name').get(file);

module.exports = router;
