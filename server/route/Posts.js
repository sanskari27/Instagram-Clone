const express = require('express');
const router = express.Router();
const VerifyJWT = require('../middleware/VerifyJWT');
const {
	feed_post,
	saved_post,
	getPost,
	getComments,
	getComment,
	create_post,
	create_story,
	delete_post,
	likepost,
	savepost,
	create_comment,
	create_reply,
	likeComment,
	delete_comment,
	delete_reply,
} = require('../controller/Posts');

router.route('/feed-post').all(VerifyJWT).get(feed_post);
router.route('/saved-post').all(VerifyJWT).get(saved_post);
router.route('/get-post/:id').all(VerifyJWT).get(getPost);
router.route('/get-comments/:post_id').all(VerifyJWT).get(getComments);
router.route('/get-comment/:comment_id').all(VerifyJWT).get(getComment);

router.route('/create-post').all(VerifyJWT).post(create_post);
router.route('/create-story').all(VerifyJWT).post(create_story);
router.route('/delete-post/:id').all(VerifyJWT).post(delete_post);
router.route('/like-post/:id').all(VerifyJWT).post(likepost);
router.route('/save-post/:id').all(VerifyJWT).post(savepost);
router.route('/create-comment/:post_id').all(VerifyJWT).post(create_comment);
router.route('/create-reply/:comment_id').all(VerifyJWT).post(create_reply);
router.route('/like-comment/:post_id/:comment_id').all(VerifyJWT).post(likeComment);

module.exports = router;
