const express = require('express');
const router = express.Router();
const VerifyJWT = require('../middleware/VerifyJWT');
const {
	explore,
	people,
	stories,
	my_stories,
	notifications,
	blocked,
	pendingRequests,
	pendingNotifications,
	followers,
	following,
	search,
	searchRecents,
	follow,
	unfollow,
	block,
	unblock,
	removeRequest,
	removeFollower,
	acceptRequest,
	deleteRequest,
	fetchProfile,
	clearPendingNotifications,
	addRecentSearch,
	clearRecentSearch,
	storySeen,
} = require('../controller/Explore');

router.route('/people').all(VerifyJWT).get(people);
router.route('/profile/:username').all(VerifyJWT).get(fetchProfile);
router.route('/stories').all(VerifyJWT).get(stories);
router.route('/my-stories').all(VerifyJWT).get(my_stories);
router.route('/notifications').all(VerifyJWT).get(notifications);
router.route('/blocked').all(VerifyJWT).get(blocked);
router.route('/pending-requests').all(VerifyJWT).get(pendingRequests);
router.route('/pending-notifications').all(VerifyJWT).get(pendingNotifications);
router.route('/followers/:id').all(VerifyJWT).get(followers);
router.route('/following/:id').all(VerifyJWT).get(following);
router.route('/search/:text').all(VerifyJWT).get(search);
router.route('/search-recents').all(VerifyJWT).get(searchRecents);

router.route('/follow/:id').all(VerifyJWT).post(follow);
router.route('/unfollow/:id').all(VerifyJWT).post(unfollow);
router.route('/block/:id').all(VerifyJWT).post(block);
router.route('/unblock/:id').all(VerifyJWT).post(unblock);
router.route('/remove-follower/:id').all(VerifyJWT).post(removeFollower);
router.route('/remove-request/:id').all(VerifyJWT).post(removeRequest);
router.route('/accept-request/:id').all(VerifyJWT).post(acceptRequest);
router.route('/delete-request/:id').all(VerifyJWT).post(deleteRequest);
router.route('/clear-pending-notifications').all(VerifyJWT).post(clearPendingNotifications);
router.route('/add-recent-search/:user').all(VerifyJWT).post(addRecentSearch);
router.route('/clear-recent-search').all(VerifyJWT).post(clearRecentSearch);
router.route('/clear-recent-search/:removedUser').all(VerifyJWT).post(clearRecentSearch);
router.route('/story-seen/:storyID').all(VerifyJWT).post(storySeen);

router.route('/').all(VerifyJWT).get(explore);

module.exports = router;
