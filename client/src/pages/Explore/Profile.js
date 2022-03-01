import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import $ from 'jquery';
import { DPImage } from '../../components/ImageUtils';
import { getProfile } from '../../Controller/User';
import FRIENDS from '../../assets/friends.png';
import ARROW from '../../assets/arrow-dark.png';
import CLOSE from '../../assets/cross-dark.png';
import SETTING from '../../assets/settings.png';
import Axios from '../../Controller/Axios';
import PostGrid from '../Post/PostGrid';

const DIALOG = {
	NONE: -1,
	UPDATED: -2,
	RELATIONSHIP: 0,
	EXTRAS: 1,
	SETTING: 2,
	FOLLOWERS: 3,
	FOLLOWING: 4,
	PENDING_REQUESTS: 5,
};
const RELATION = {
	FOLLOW: 'follow',
	UNFOLLOW: 'unfollow',
	BLOCK: 'block',
	UNBLOCK: 'unblock',
	REMOVE_REQUEST: 'remove-request',
};

export default function Profile({ data, setTitle, setAlert, setLoading }) {
	const navigate = useNavigate();
	const location = useLocation();
	const [dialog, openDialog] = React.useState(DIALOG.NONE);
	const [details, setDetails] = React.useState({});
	const windowOffset = React.useRef(0);

	React.useEffect(() => {
		if (dialog === DIALOG.NONE) {
			document.body.setAttribute('style', '');
			window.scrollTo(0, windowOffset.current);
		} else {
			windowOffset.current = window.scrollY;
			document.body.setAttribute(
				'style',
				`position:fixed; top: -${windowOffset.current}px; left: 0;right:0 `
			);
		}
	}, [dialog]);

	React.useEffect(() => {
		setTitle(`${data.name} (@${data.username})`);
		setDetails(data);
		if (data.pendingRequests) {
			openDialog(DIALOG.PENDING_REQUESTS);
		} else {
			openDialog(DIALOG.NONE);
		}
	}, [setTitle, data, location]);
	const refresh = React.useCallback(async () => {
		try {
			const { data } = await Axios.get('/explore/profile/' + details.username);
			if (data.success) {
				setDetails(data.message);
			}
		} catch (ignored) {}
	}, [details.username]);
	React.useEffect(() => {
		$('.dialog-wrapper').toggleClass('opacity-0');
		if (dialog === DIALOG.UPDATED) {
			refresh();
			openDialog(DIALOG.NONE);
		}
	}, [dialog, refresh]);

	const switchRelation = async (type) => {
		openDialog(DIALOG.NONE);
		setLoading(true);
		try {
			const { data } = await Axios.post(`/explore/${type}/${details.username}`);
			if (data.success) {
				const { data } = await Axios.get('/explore/profile/' + details.username);
				if (data.success) {
					setDetails(data.message);
				} else {
					setLoading(false);
					setAlert(`Unable to ${type} ${details.username}`);
				}
			} else {
				setLoading(false);
				setAlert(`Unable to ${type} ${details.username}`);
			}
		} catch (err) {
			setAlert(`Unable to ${type} ${details.username}`);
		}
		setLoading(false);
	};

	return (
		<>
			<div className='min-w-screen min-h-screen flex flex-col padding-app '>
				<div className='profile-details flex flex-col items-center mt-12'>
					<div
						className={`w-20 sm:w-40 rounded-full flex items-center justify-center select-none ${
							details.hasStories &&
							(details.storiesSeen ? 'border-zinc-200 border-[3px]' : 'gradient-border p-[2px] ')
						}`}
						onClick={(e) => {
							if (details.hasStories && getProfile().username !== details.username) {
								navigate(`/stories/`, { state: { username: details.username } });
							}
						}}
					>
						<DPImage
							src={details.dp}
							className={`w-full h-full rounded-full bg-white  ${
								!details.seen && details.hasStories && 'p-[2.5px]'
							}`}
						/>
					</div>

					<div className='mt-3 text-2xl font-light tracking-wide dark:text-white'>
						{details.username}
					</div>

					<div>
						{details.username === getProfile().username ? (
							<div className='flex items-center mt-3'>
								<div
									className='w-24 px-3 py-1.5  border border-zinc-300  rounded text-sm font-medium flex justify-center cursor-pointer dark:text-white/70'
									onClick={(e) => navigate('/accounts/edit/')}
								>
									Edit Profile
								</div>

								<div
									className='w-10 px-2 py-2.5 ml-2 border border-zinc-300 rounded flex justify-center items-center cursor-pointer'
									onClick={(e) => {
										openDialog(DIALOG.BLOCKEDLIST);
									}}
								>
									<img src={ARROW} alt='' className='w-3 dark:invert' />
								</div>
								<div
									className='w-fit px-3 py-1.5 ml-1 rounded cursor-pointer'
									onClick={(e) => openDialog(DIALOG.SETTING)}
								>
									<img src={SETTING} alt='' className='w-6 dark:invert' />
								</div>
							</div>
						) : (
							<div className='mt-3 flex select-none'>
								{details.isBlocked ? (
									<div
										className='w-24 py-2 bg-primary text-white rounded text-sm flex justify-center font-medium cursor-pointer'
										onClick={(e) => switchRelation(RELATION.UNBLOCK)}
									>
										Unblock
									</div>
								) : details.isFollowing ? (
									<>
										<div
											className='w-fit px-3 py-1.5 ml-2 border border-zinc-300 rounded text-sm font-medium cursor-pointer dark:text-white/70'
											onClick={(e) => {
												navigate(`/direct/u/${details.username}/`);
											}}
										>
											Message
										</div>
										<div
											className='w-20 px-1 py-1.5 ml-2 border border-zinc-300 rounded flex justify-center items-center cursor-pointer'
											onClick={(e) => {
												openDialog(DIALOG.RELATIONSHIP);
											}}
										>
											<img src={FRIENDS} alt='' className='w-4 dark:invert' />
										</div>
										<div
											className='w-10 px-2 py-1.5 ml-2 border border-zinc-300 rounded flex justify-center items-center cursor-pointer'
											onClick={(e) => {
												openDialog(DIALOG.EXTRAS);
											}}
										>
											<img src={ARROW} alt='' className='w-3 dark:invert' />
										</div>
									</>
								) : details.requestedFollow ? (
									<div
										className='w-24 py-2 border border-zinc-300 text-zinc-600 dark:text-white/80 rounded text-sm flex justify-center font-medium cursor-pointer'
										onClick={(e) => switchRelation(RELATION.REMOVE_REQUEST)}
									>
										Requested
									</div>
								) : (
									<>
										<div
											className='w-24 py-2 bg-primary text-white rounded text-sm flex justify-center font-medium cursor-pointer'
											onClick={(e) => switchRelation(RELATION.FOLLOW)}
										>
											Follow
										</div>
										<div
											className='w-10 px-2 py-1.5 ml-2 border border-zinc-300 rounded flex justify-center items-center cursor-pointer'
											onClick={(e) => {
												openDialog(DIALOG.EXTRAS);
											}}
										>
											<img src={ARROW} alt='' className='w-3 dark:invert' />
										</div>
									</>
								)}
							</div>
						)}
					</div>

					<div className='h-[1px] w-[450px] mt-3 bg-zinc-200 dark:bg-neutral-500' />
					<div className='mt-2 text-lg font-medium text-zinc-800 dark:text-white'>
						{details.name}
					</div>
					<div className='mt-1 w-[400px] flex justify-center'>
						<div className='text-justify text-black/60 dark:text-white/70'>{details.bio}</div>
					</div>
					{details.website && (
						<div className='mt-1 w-[450px] text-center text-primary'>
							<a href={details.website} className='mt-1 text-justify'>
								{details.website}
							</a>
						</div>
					)}
					<div className='w-[450px] mt-3 pt-3  flex border-t-[1px] border-zinc-200 dark:border-neutral-500 text-black/80 dark:text-white/90 justify-around'>
						<div>
							<span className='mr-1 font-medium'>{details.postCount}</span>
							<span>posts</span>
						</div>
						<div
							className={` ${(!details.privateAccount || details.isFollowing) && 'cursor-pointer'}`}
							onClick={(e) => {
								if (!details.privateAccount || details.isFollowing) openDialog(DIALOG.FOLLOWERS);
							}}
						>
							<span className='mr-1 font-medium'>{details.followersCount}</span>
							<span>followers</span>
						</div>
						<div
							className={` ${(!details.privateAccount || details.isFollowing) && 'cursor-pointer'}`}
							onClick={(e) => {
								if (!details.privateAccount || details.isFollowing) openDialog(DIALOG.FOLLOWING);
							}}
						>
							<span className='mr-1 font-medium'>{details.followingCount}</span>
							<span>following</span>
						</div>
					</div>

					{!details.isBlocked && (
						<>
							{!details.privateAccount && details.isFollowing ? (
								<div className='flex-center flex-col w-full h-36 my-6 bg-white dark:bg-neutral-900 rounded-md border-t-[2px] border-r-[1px] border-b-[1px] border-l-[1px] dark:border-none '>
									<span className='font-medium text-sm dark:text-white/70'>
										This Account is private
									</span>
									<span className='mt-3 text-sm dark:text-white/70'>
										Follow to see their photos and videos.
									</span>
								</div>
							) : (
								<Posts posts={details.posts} />
							)}
						</>
					)}
				</div>
			</div>
			<Dialog
				type={dialog}
				openDialog={openDialog}
				details={details}
				switchRelation={switchRelation}
				setLoading={setLoading}
			/>
		</>
	);
}

function Dialog({ type, openDialog, details, switchRelation, setLoading }) {
	const navigate = useNavigate();
	const [blocked, setBlocked] = React.useState([]);
	const [followers, setFollowers] = React.useState([]);
	const [following, setFollowing] = React.useState([]);
	const [pending, setPending] = React.useState([]);

	React.useEffect(() => {
		async function fetchBlocked() {
			const { data } = await Axios.get(`/explore/blocked`);
			if (data.success) {
				setBlocked(data.message);
			}
			setLoading(false);
		}
		async function fetchFollowers() {
			const { data } = await Axios.get(`/explore/followers/${details.username}`);
			if (data.success) {
				setFollowers(data.message);
			}
			setLoading(false);
		}
		async function fetchFollowing() {
			const { data } = await Axios.get(`/explore/following/${details.username}`);
			if (data.success) {
				setFollowing(data.message);
			}
			setLoading(false);
		}
		async function fetchPending() {
			const { data } = await Axios.get(`/explore/pending-requests`);
			if (data.success) {
				setPending(data.message);
			}
			setLoading(false);
		}

		if (type === DIALOG.BLOCKEDLIST) {
			setLoading(true);
			fetchBlocked();
		}
		if (type === DIALOG.FOLLOWERS) {
			setLoading(true);
			fetchFollowers();
		}
		if (type === DIALOG.FOLLOWING) {
			setLoading(true);
			fetchFollowing();
		}
		if (type === DIALOG.PENDING_REQUESTS) {
			setLoading(true);
			fetchPending();
		}
	}, [type, setLoading, details.username]);

	React.useEffect(() => {
		$('.dialog-wrapper').on('click', function (e) {
			if (type !== DIALOG.NONE && $(e.target).closest('.dialog').length === 0) {
				if (type === DIALOG.PENDING_REQUESTS) {
					navigate('/' + getProfile().username + '/');
				} else openDialog(DIALOG.NONE);
			}
		});
	}, [openDialog, type, navigate]);

	return (
		<>
			{type !== DIALOG.NONE && (
				<div>
					<div className='dialog-wrapper w-screen h-screen z-20 fixed top-0 flex-center bg-black/50 opacity-0 transition-all'>
						{type === DIALOG.RELATIONSHIP && <RelationDialog />}
						{type === DIALOG.EXTRAS && <ExtrasDialog />}
						{type === DIALOG.BLOCKEDLIST && <BlockedListDialog />}
						{type === DIALOG.SETTING && <SettingDialog />}
						{type === DIALOG.FOLLOWERS && <FollowersListDialog />}
						{type === DIALOG.FOLLOWING && <FollowingListDialog />}
						{type === DIALOG.PENDING_REQUESTS && <PendingListDialog />}
					</div>
				</div>
			)}
		</>
	);

	function RelationDialog() {
		return (
			<>
				<div className='dialog w-[400px] h-fit flex-center flex-col pt-6 rounded-[12px] bg-white overflow-hidden max-70vh'>
					<DPImage src={details.dp} className={`w-20 h-20 rounded-full bg-white `} />
					<span className='mt-3 text-sm tracking-wide '>Unfollow @{details.username}?</span>
					<div
						className='mt-2 w-full p-3 border-t-[1px] flex-center text-sm font-semibold text-red-500 cursor-pointer hover:bg-zinc-100'
						onClick={(e) => switchRelation(RELATION.UNFOLLOW)}
					>
						Unfollow
					</div>
					<div
						className='w-full p-3 border-t-[1px] flex-center text-sm font-light cursor-pointer hover:bg-zinc-100'
						onClick={(e) => openDialog(DIALOG.NONE)}
					>
						Cancel
					</div>
				</div>
			</>
		);
	}

	function ExtrasDialog() {
		return (
			<>
				<div className='dialog w-[400px] h-fit flex-center flex-col rounded-[12px] bg-white overflow-hidden max-70vh'>
					<div
						className='w-full p-4 border-t-[1px] flex-center text-sm font-semibold text-red-500 cursor-pointer hover:bg-zinc-100'
						onClick={(e) => switchRelation(RELATION.BLOCK)}
					>
						Block
					</div>
					<div
						className='w-full p-4 border-t-[1px] flex-center text-sm font-light cursor-pointer hover:bg-zinc-100'
						onClick={(e) => openDialog(DIALOG.NONE)}
					>
						Cancel
					</div>
				</div>
			</>
		);
	}

	function BlockedListDialog() {
		const [unblocked, setUnblocked] = React.useState(0);

		return (
			<>
				<div className='dialog w-[400px] h-fit flex-center flex-col rounded-[12px] bg-white overflow-hidden'>
					<div className='w-full p-4 border-t-[1px] flex-center relative'>
						<span className='text-sm font-semibold text-red-500 '>
							Blocked : {blocked.length - unblocked}
						</span>
						<img
							src={CLOSE}
							alt=''
							className='w-6 absolute  right-3 rounded-full hover:bg-zinc-200 hover:cursor-pointer transition-all'
							onClick={(e) => openDialog(DIALOG.NONE)}
						/>
					</div>
					{blocked && blocked.length > 0 && (
						<div className='w-full flex flex-col border-t-[1px] overflow-x-hidden overflow-y-scroll max-70vh'>
							{blocked.map((user, index) => (
								<div key={index} id={`blocked-user-${index}`} className={`flex m-2 items-center `}>
									<div className='w-12 flex-center'>
										<DPImage src={user.dp} className='w-10 rounded-full select-none ' />
									</div>
									<div className='flex flex-col w-full ml-3 overflow-hidden'>
										<span className='line-clamp-1 text-sm leading-4 font-medium'>
											{user.username}
										</span>
										<span className='line-clamp-1 text-sm leading-4 opacity-60'>{user.name}</span>
									</div>
									<div
										className='w-24 h-fit py-1.5 bg-primary text-white rounded text-sm flex-center font-medium cursor-pointer'
										onClick={async (e) => {
											if ($(e.target).text() === 'Unblocked') {
												return;
											}
											try {
												const { data } = await Axios.post(`/explore/unblock/${user.username}`);
												if (data.success) {
													setUnblocked((prev) => prev + 1);
													$(e.target)
														.text('Unblocked')
														.removeClass('bg-primary text-white')
														.addClass('opacity-80 text-zinc-500');
												}
											} catch (ignored) {}
										}}
									>
										Unblock
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</>
		);
	}

	function FollowersListDialog() {
		const [updated, setUpdated] = React.useState(false);
		return (
			<>
				<div className='dialog w-[400px] h-fit flex-center flex-col rounded-[12px] bg-white overflow-hidden'>
					<div className='w-full p-4 border-t-[1px] flex-center relative'>
						<span className='text-sm font-semibold  '>Followers</span>
						<img
							src={CLOSE}
							alt=''
							className='w-6 absolute  right-3 rounded-full hover:bg-zinc-200  transition-all'
							onClick={(e) => openDialog(!updated ? DIALOG.NONE : DIALOG.UPDATED)}
						/>
					</div>
					{followers && followers.length > 0 && (
						<div className='w-full flex flex-col border-t-[1px]  pb-2 overflow-x-hidden overflow-y-scroll max-70vh'>
							{followers.map((user, index) => (
								<div key={index} className='flex mx-4 my-2 items-center'>
									<div className='w-12 flex-center'>
										<DPImage src={user.dp} className='w-10 rounded-full select-none ' />
									</div>
									<div className='flex flex-col w-full ml-3 overflow-hidden'>
										<span className='line-clamp-1 text-sm leading-4 font-medium '>
											<span
												className=' cursor-pointer hover:underline'
												onClick={(e) => navigate(`/${user.username}/`)}
											>
												{user.username}
											</span>
											{getProfile().username === details.username && !user.i_am_following && (
												<span
													className='text-primary ml-1 cursor-pointer'
													onClick={async (e) => {
														if (!$(e.target).text()) {
															return;
														}
														try {
															const { data } = await Axios.post(`/explore/follow/${user.username}`);
															if (data.success) {
																$(e.target).text('');
																setUpdated(true);
															}
														} catch (ignored) {}
													}}
												>
													· Follow
												</span>
											)}
										</span>
										<span
											className='line-clamp-1 text-sm leading-4 opacity-60 cursor-pointer '
											onClick={(e) => navigate(`/${user.username}/`)}
										>
											{user.name}
										</span>
									</div>
									{getProfile().username === details.username && (
										<div
											className='w-24 h-fit py-1.5 text-red-500/90 rounded text-sm flex-center font-medium cursor-pointer'
											onClick={async (e) => {
												if ($(e.target).text() === 'Unblocked') {
													return;
												}
												try {
													const { data } = await Axios.post(
														`/explore/remove-follower/${user.username}`
													);
													if (data.success) {
														setUpdated(true);
														$(e.target)
															.text('Removed')
															.removeClass('text-red-500/80')
															.addClass(' text-zinc-500/80');
													}
												} catch (ignored) {}
											}}
										>
											Remove
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</>
		);
	}

	function FollowingListDialog() {
		const [updated, setUpdated] = React.useState(false);
		return (
			<>
				<div className='dialog w-[400px] h-fit flex-center flex-col rounded-[12px] bg-white overflow-hidden'>
					<div className='w-full p-4 border-t-[1px] flex-center relative'>
						<span className='text-sm font-semibold  '>Following</span>
						<img
							src={CLOSE}
							alt=''
							className='w-6 absolute  right-3 rounded-full hover:bg-zinc-200 hover:cursor-pointer transition-all'
							onClick={(e) => openDialog(!updated ? DIALOG.NONE : DIALOG.UPDATED)}
						/>
					</div>
					{following && following.length > 0 && (
						<div className='w-full flex flex-col border-t-[1px] pb-2 overflow-x-hidden overflow-y-scroll max-70vh'>
							{following.map((user, index) => (
								<div key={index} className='flex mx-4 my-2 items-center'>
									<div className='w-12 flex-center'>
										<DPImage src={user.dp} className='w-10 rounded-full select-none ' />
									</div>
									<div
										className='flex flex-col w-full ml-3 overflow-hidden'
										onClick={(e) => navigate(`/${user.username}/`)}
									>
										<span className='line-clamp-1 text-sm leading-4 font-medium cursor-pointer hover:underline'>
											{user.username}
										</span>
										<span className='line-clamp-1 text-sm leading-4 opacity-60 cursor-pointer '>
											{user.name}
										</span>
									</div>
									{getProfile().username === details.username && (
										<div
											className='w-24 h-fit py-1.5 text-red-500/90 rounded text-sm flex-center font-medium cursor-pointer'
											onClick={async (e) => {
												if ($(e.target).text() === 'Unfollowed') {
													return;
												}
												try {
													const { data } = await Axios.post(`/explore/unfollow/${user.username}`);
													if (data.success) {
														setUpdated(true);
														$(e.target)
															.text('Unfollowed')
															.removeClass('text-red-500/90')
															.addClass(' text-zinc-500/80');
													}
												} catch (ignored) {}
											}}
										>
											Unfollow
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</>
		);
	}

	function PendingListDialog() {
		return (
			<>
				<div className='dialog w-[400px] h-fit flex-center flex-col rounded-[12px] bg-white overflow-hidden'>
					<div className='w-full p-4 border-t-[1px] flex-center relative'>
						<span className='text-sm font-semibold  '>Pending Requests</span>
						<img
							src={CLOSE}
							alt=''
							className='w-6 absolute  right-3 rounded-full hover:bg-zinc-200 hover:cursor-pointer transition-all'
							onClick={(e) => navigate('/' + getProfile().username + '/')}
						/>
					</div>
					{pending && pending.length > 0 && (
						<div className='w-full flex flex-col border-t-[1px] pb-2 overflow-x-hidden overflow-y-scroll max-70vh'>
							{pending.map((user, index) => (
								<div key={index} className='flex mx-4 my-2 items-center'>
									<div className='w-12 flex-center'>
										<DPImage src={user.dp} className='w-10 rounded-full select-none' />
									</div>
									<div
										className='flex flex-col w-full ml-3 overflow-hidden'
										onClick={(e) => navigate('/' + user.username + '/')}
									>
										<span className='line-clamp-1 text-sm leading-4 font-medium cursor-pointer hover:underline'>
											{user.username}
										</span>
										<span className='line-clamp-1 text-sm leading-4 opacity-60 cursor-pointer '>
											{user.name}
										</span>
									</div>
									<div className='w-min h-fit flex'>
										<div
											className='w-fit h-fit py-1.5 px-2 mr-1 bg-primary text-white/90 rounded text-sm flex-center font-medium cursor-pointer'
											onClick={async (e) => {
												try {
													const { data } = await Axios.post(
														`/explore/accept-request/${user.username}`
													);
													if (data.success) {
														$(e.target).parent().empty();
													}
												} catch (ignored) {}
											}}
										>
											Accept
										</div>
										<div
											className='w-fit h-fit py-1.5 px-2 mr-1 text-red-500/90 rounded text-sm flex-center font-medium cursor-pointer'
											onClick={async (e) => {
												try {
													const { data } = await Axios.post(
														`/explore/delete-request/${user.username}`
													);
													if (data.success) {
														$(e.target).parent().empty();
													}
												} catch (ignored) {}
											}}
										>
											Reject
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</>
		);
	}

	function SettingDialog() {
		const navigate = useNavigate();
		return (
			<>
				<div className='dialog w-[400px] h-fit flex-center flex-col rounded-[12px] bg-white overflow-hidden'>
					<div
						className='w-full p-4 border-t-[1px] flex-center text-sm  cursor-pointer hover:bg-zinc-100'
						onClick={(e) => navigate('accounts/change-password/')}
					>
						Change Password
					</div>
					<div
						className='w-full p-4 border-t-[1px] flex-center text-sm  cursor-pointer hover:bg-zinc-100'
						onClick={(e) => navigate('accounts/privacy-security/')}
					>
						Privacy
					</div>
				</div>
			</>
		);
	}
}

function Posts({ posts }) {
	return (
		<>
			<div className='mt-3 w-full pt-3 pb-3 border-t-[1px] border-zinc-200 flex-center select-none'>
				<div>
					<PostGrid posts={posts} />
				</div>
			</div>
		</>
	);
}
