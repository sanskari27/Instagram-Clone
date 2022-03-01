import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LOGO from '../assets/Instagram_logo.svg';
import SEARCH from '../assets/search.png';
import CROSS from '../assets/cross.png';
import HOME_OUTLINED from '../assets/home-outlined.png';
import MESSENGER_OUTLINED from '../assets/messenger-outlined.png';
import EXPLORE_OUTLINED from '../assets/explore-outlined.png';
import LIKE_OUTLINED from '../assets/like-outlined.png';
import CREATE_POST_OUTLINED from '../assets/create-post-outlined.png';
import HOME_FILLED from '../assets/home-filled.png';
import MESSENGER_FILLED from '../assets/messenger-filled.png';
import EXPLORE_FILLED from '../assets/explore-filled.png';
import LIKE_FILLED from '../assets/like-filled-black.png';
import LIKE_FILLED_LIGHT from '../assets/like-filled-light.png';
import CREATE_POST_FILLED from '../assets/create-post-filled.png';
import PROFILE from '../assets/profile.png';
import SAVED from '../assets/saved.png';
import SETTING from '../assets/settings.png';
import FRIENDS from '../assets/friends.png';
import USER from '../assets/user.png';
import $ from 'jquery';
import { getProfile } from '../Controller/User';
import Axios from '../Controller/Axios';
import { DPImage, PostImage } from './ImageUtils';
import Loading from './Loading';

export default function Navbar(props) {
	const navigate = useNavigate();
	const location = useLocation();
	const [selectedMenu, setSelectedMenu] = React.useState('');
	React.useEffect(() => {
		setSelectedMenu(parsePath(location.pathname));
	}, [location]);
	React.useEffect(() => {
		$(document).on('click', function (e) {
			if (
				selectedMenu === 'user' &&
				$(e.target).closest('#usermenu').length === 0 &&
				$(e.target).attr('id') !== 'menu-user'
			) {
				$('#usermenu').addClass('hidden').removeClass('flex');
				$('#menu-user').removeClass('border border-black p-[1px]');
				if ($(e.target).attr('id') !== 'menu-like')
					setSelectedMenu(parsePath(window.location.pathname));
			}
			if (
				selectedMenu === 'like' &&
				$(e.target).closest('#like-fragment').length === 0 &&
				$(e.target).attr('id') !== 'menu-like'
			) {
				$('#like-fragment').addClass('hidden').removeClass('flex');
				if ($(e.target).attr('id') !== 'menu-user')
					setSelectedMenu(parsePath(window.location.pathname));
			}
		});
	}, [props, selectedMenu]);

	function menuClickHandler(id, element) {
		setSelectedMenu(id);
		if (id === 'home') {
			navigate('/');
		} else if (id === 'messenger') {
			navigate('/direct/inbox/');
		} else if (id === 'explore') {
			navigate('/explore/');
		} else if (id === 'create-post') {
			navigate('/create-post/');
		} else if (id === 'like') {
			$('#like-fragment')
				.removeClass('hidden')
				.addClass('flex')
				.css({
					left:
						document.getElementById('menu-like').offsetLeft - $('#like-fragment').width() + 52.5,
				});
			try {
				Axios.post('/explore/clear-pending-notifications');
			} catch (e) {}
		} else if (id === 'user') {
			$('#usermenu')
				.removeClass('hidden')
				.addClass('flex')
				.css({
					left: document.getElementById('menu-user').offsetLeft - $('#usermenu').width() + 52.5,
				});
			$('#menu-user').addClass('border border-black rounded-full p-[1px]');
		}
	}

	async function fetchNotificationsCount() {
		try {
			const { data } = await Axios.get('/explore/pending-notifications');
			if (data.success) return data.message;
			return 0;
		} catch (e) {
			return 0;
		}
	}

	return (
		<>
			{props.loading && <div id='progressBar' />}
			<div className='fixed z-20 h-16 w-screen top-0 flex items-center justify-between bg-white dark:bg-neutral-900 border-b-[1px] dark:border-none select-none padding-nav'>
				<Link to='/'>
					<img src={LOGO} alt='' className='w-[110px] cursor-pointer dark:invert' />
				</Link>

				{getProfile().username && (
					<>
						<SearchBar />
						<div id='menu' className='flex items-center w-fit '>
							<Menu
								id='home'
								icon={selectedMenu === 'home' ? HOME_FILLED : HOME_OUTLINED}
								onClick={menuClickHandler}
							/>
							<Menu
								id='messenger'
								icon={selectedMenu === 'messenger' ? MESSENGER_FILLED : MESSENGER_OUTLINED}
								onClick={menuClickHandler}
							/>
							<Menu
								id='create-post'
								icon={selectedMenu === 'create-post' ? CREATE_POST_FILLED : CREATE_POST_OUTLINED}
								onClick={menuClickHandler}
							/>
							<Menu
								id='explore'
								icon={selectedMenu === 'explore' ? EXPLORE_FILLED : EXPLORE_OUTLINED}
								onClick={menuClickHandler}
							/>
							<Menu
								id='like'
								icon={selectedMenu === 'like' ? LIKE_FILLED : LIKE_OUTLINED}
								onClick={menuClickHandler}
								count={fetchNotificationsCount}
							/>
							<Menu
								id='user'
								className='rounded-full dark:invert-0'
								icon={getProfile().dp ? 'http://localhost:9000/images/' + getProfile().dp : USER}
								onClick={menuClickHandler}
							/>
						</div>

						<UserMenuDiv />

						<LikeFragment setAlert={props.setAlert} setLoading={props.setLoading} />
					</>
				)}
			</div>
		</>
	);
}

function SearchBar() {
	const navigate = useNavigate();
	const [resultsVisible, setResultsVisible] = React.useState(false);
	const [results, setResults] = React.useState([]);
	const [search, setSearch] = React.useState('');
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		async function searchUsers(search) {
			try {
				setLoading(true);
				const { data } = await Axios.get('/explore/search/' + search);
				setLoading(false);
				setResults(data.message);
			} catch (e) {
				setLoading(false);
				setResultsVisible(false);
				setResults([]);
			}
		}
		async function searchRecents() {
			try {
				setLoading(true);
				const { data } = await Axios.get('/explore/search-recents');
				setLoading(false);
				setResults(data.message);
			} catch (e) {
				setLoading(false);
				setResultsVisible(false);
				setResults([]);
			}
		}

		if (!search) {
			return searchRecents();
		} else {
			setResults([]);
			setResultsVisible(true);
			setLoading(true);
		}

		const delayDebounceFn = setTimeout(() => {
			if (!search) {
				return searchRecents();
			}
			searchUsers(search);
		}, 1000);
		return () => {
			clearTimeout(delayDebounceFn);
		};
	}, [search]);

	const addRecentSearch = async (username) => {
		try {
			await Axios.post('/explore/add-recent-search/' + username);
		} catch (e) {}
		navigate(`/${username}/`);
	};

	const clearAllRecents = async (e) => {
		try {
			await Axios.post('/explore/clear-recent-search');
		} catch (e) {}
		setResultsVisible(false);
		setResults([]);
	};

	return (
		<div className='relative flex justify-center'>
			<div
				id='search-bar'
				className={
					'w-[250px] h-9 bg-zinc-150 dark:bg-neutral-700 rounded-lg relative items-center overflow-hidden hidden md:flex'
				}
			>
				<img
					id='search-icon'
					src={SEARCH}
					alt=''
					className='w-6 opacity-40 absolute left-3 transition-all dark:invert'
				/>
				<input
					id='search-input'
					className='bg-transparent w-4/5 h-full absolute left-8 outline-none dark:text-white font-light px-2 opacity-70 text-ellipsis transition-all'
					placeholder='Search'
					// type='text'
					value={search}
					autoComplete='off'
					onChange={(e) => {
						setSearch(e.target.value);
					}}
					onFocus={() => {
						$('#search-icon').removeClass('left-3').addClass('-left-6');
						$('#search-input').removeClass('w-4/5 left-8').addClass('w-5/6 left-3');
						$('#search-close').removeClass('hidden');
						setResultsVisible(true);
					}}
					onBlur={() => {
						$('#search-icon').addClass('left-3').removeClass('-left-6');
						$('#search-input').addClass('w-4/5 left-8').removeClass('w-5/6 left-3');
						setTimeout(() => {
							setResultsVisible(false);
							$('#search-close').addClass('hidden');
						}, 200);
					}}
				/>
				<img
					id='search-close'
					src={CROSS}
					alt=''
					className='w-4 opacity-40 absolute right-3 cursor-pointer hidden transition-all'
					onClick={() => {
						setResultsVisible(false);
						setSearch('');
					}}
				/>
			</div>
			<div
				id='search-result'
				className={` w-[400px] h-[400px]  overflow-x-hidden overflow-y-scroll flex-col absolute top-10 bg-white dark:bg-neutral-800 border-[1px] dark:border-none  p-4 shadow-md  rounded-md ${
					resultsVisible ? 'flex' : 'hidden'
				}`}
			>
				{!loading && !search && (
					<div className='flex justify-between font-medium text-sm dark:text-white/70'>
						<span>Recent</span>
						<span className='text-primary cursor-pointer' onClick={clearAllRecents}>
							Clear All
						</span>
					</div>
				)}
				{results.map((details, index) => (
					<SearchRow key={index} details={details} isRecent={!search} />
				))}
				{results.length === 0 && !loading && search && (
					<div className='flex-center text-black/70 dark:text-white/70 text-sm font-medium'>
						No results found.
					</div>
				)}
				{results.length === 0 && !loading && !search && (
					<div className='w-full h-full flex-center text-black/70 dark:text-white/70 text-sm font-medium'>
						No recent searches.
					</div>
				)}
				{loading && <Loading />}
			</div>
		</div>
	);
	function SearchRow({ details }) {
		return (
			<div className='flex cursor-pointer my-2' onClick={(e) => addRecentSearch(details.username)}>
				<DPImage src={details.dp} className='w-10 h-10 rounded-full select-none' />
				<div className='flex flex-col justify-center ml-3'>
					<span className='text-black  leading-5 font-medium text-sm'>{details.username}</span>
					<span className='text-black/80 leading-5 text-sm'>{details.name}</span>
				</div>
			</div>
		);
	}
}

function Menu(props) {
	const mounted = React.useRef(true);
	React.useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const [count, setCount] = React.useState(0);
	const [counterVisible, setCounterVisible] = React.useState(true);
	React.useEffect(() => {
		async function fetch() {
			const val = await props.count();
			if (!mounted.current) return;
			setCount(val);
			setTimeout(() => {
				if (!mounted.current) return;
				setCounterVisible(false);
			}, 5000);
		}
		if (props.count) {
			fetch();
		}
	}, [props]);
	return (
		<div
			id={`menu-${props.id}`}
			onClick={async (e) => {
				props.onClick(props.id, e);
			}}
			className=' ml-3 mr-2 relative'
		>
			<img
				id={`menu-${props.id}`}
				src={props.icon}
				alt=''
				className={`w-6  cursor-pointer dark:invert ${props.className}`}
			/>
			{count > 0 && (
				<span className='w-1 h-1 absolute rounded -bottom-2 inset-x-1/2 bg-red-500 grow-in'></span>
			)}
			{count > 0 && counterVisible && (
				<div className='absolute h-[36px] w-[50px] flex-center -bottom-14 rounded-md bg-red-500 text-xs text-white grow-in'>
					<span className='w-4 h-4 absolute rounded  left-[16px] -top-[6px] rotate-45  bg-red-500'></span>

					<img src={LIKE_FILLED_LIGHT} alt='' className='w-4 mr-2' />
					<span>{count}</span>
				</div>
			)}
		</div>
	);
}

function UserMenuDiv() {
	const navigate = useNavigate();
	const username = getProfile().username;
	function onClick(selectedMenu) {
		if (selectedMenu === 'Profile' && username) {
			navigate(`/${username}/`);
		}
		if (selectedMenu === 'Saved') {
			navigate('/saved/');
		}
		if (selectedMenu === 'Settings') {
			navigate('/accounts/edit/');
		}
		if (selectedMenu === 'Log Out') {
			navigate('/logout/');
		}
		if (selectedMenu === 'Pending Requests') {
			navigate(`/${username}/pending-requests`);
		}
		$('#usermenu').removeClass('flex').addClass('hidden');
	}
	return (
		<>
			<div
				id='usermenu'
				className={` w-56 hidden flex-col absolute top-14 bg-white dark:bg-neutral-800 overflow:hidden border-[1px] dark:border-none shadow-md rounded-md`}
			>
				<span className='w-5 h-5 absolute rounded  right-[30px] -top-[10px] rotate-45 border-t-[1px] border-l-[1px] dark:border-none bg-white dark:bg-neutral-800'></span>
				<UserMenu onClick={onClick} icon={PROFILE} text='Profile' />
				<UserMenu onClick={onClick} icon={SAVED} text='Saved' />
				{getProfile().private && (
					<UserMenu onClick={onClick} icon={FRIENDS} text='Pending Requests' />
				)}
				<UserMenu onClick={onClick} icon={SETTING} text='Settings' />
				<div
					onClick={(e) => {
						onClick('Log Out');
					}}
					className='h-9 flex items-center px-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-neutral-900 border-t dark:border-neutral-500 rounded-b-md'
				>
					<span className='text-sm dark:text-white/70'>Log Out</span>
				</div>
			</div>
		</>
	);
}

function UserMenu(props) {
	return (
		<div
			onClick={(e) => {
				props.onClick(props.text);
			}}
			className='h-9 flex items-center px-3  cursor-pointer hover:bg-zinc-50 dark:hover:bg-neutral-900 '
		>
			<img src={props.icon} alt='' className={`w-4 mr-3 dark:invert ${props.classname}`} />
			<span className='text-sm dark:text-white/70'>{props.text}</span>
		</div>
	);
}

function LikeFragment({ setAlert, setLoading }) {
	const [notifications, setNotifications] = React.useState([]);
	const NotificationType = {
		LIKE: 'like',
		FOLLOW: 'follow',
		FOLLOW_REQUEST: 'follow request',
		COMMENT: 'commented on a post',
		LIKE_COMMENT: 'liked a comment',
	};

	React.useEffect(() => {
		async function fetchNotifications() {
			try {
				const { data } = await Axios.get('/explore/notifications');
				if (data.success) {
					setNotifications(data.message);
				}
			} catch (err) {}
		}
		fetchNotifications();
	}, []);

	return (
		<div
			id='like-fragment'
			className={` w-[450px] hidden flex-col absolute top-14 bg-white dark:bg-neutral-800 border-[1px] dark:border-none shadow-md rounded-md`}
		>
			<span className='w-5 h-5 absolute rounded  right-[30px] -top-[10px] rotate-45 border-t-[1px] border-l-[1px] dark:border-none bg-white dark:bg-neutral-800'></span>
			{notifications.map((notification, index) => (
				<Notification
					key={index}
					setAlert={setAlert}
					setLoading={setLoading}
					details={notification}
				/>
			))}
			{notifications.length === 0 && (
				<div className='flex-center  min-h-[50px] dark:text-white/70'>No new notifications</div>
			)}
		</div>
	);

	function Notification(props) {
		const navigate = useNavigate();
		const [notification, setNotification] = React.useState({ ...props.details });

		const followBackHandler = async (e) => {
			const span = $(e.target);
			if (span.text() !== 'Follow Back') return;
			try {
				const { data } = await Axios.post(
					'/explore/follow/' + notification.notification_from.username,
					{ notification: notification.id }
				);

				if (data.success) {
					span.text(data.message).removeClass('bg-primary text-white').addClass('text-black/70');
				}
			} catch (err) {
				setAlert('Unable to follow back ' + notification.notification_from.username);
			}
		};

		const acceptRequest = async (e) => {
			const parent = $(e.target).parent();
			try {
				const { data } = await Axios.post(
					'/explore/accept-request/' + notification.notification_from.username,
					{ notification: notification.id }
				);

				if (data.success) {
					parent.remove();
					setNotification((prev) => {
						return { ...prev, text: 'has started following you.' };
					});
				}
			} catch (err) {
				setAlert('Unable to accept follow request.');
			}
		};

		const rejectRequest = async (e) => {
			const parent = $(e.target).parent();
			try {
				const { data } = await Axios.post(
					'/explore/reject-request/' + notification.notification_from.username,
					{ notification: notification.id }
				);

				if (data.success) {
					parent.remove();
					setNotification((prev) => {
						return { ...prev, text: 'follow request has been rejected.' };
					});
				}
			} catch (err) {
				setAlert('Unable to reject follow request.');
			}
		};

		if (
			notification.type === NotificationType.COMMENT ||
			notification.type === NotificationType.LIKE ||
			notification.type === NotificationType.LIKE_COMMENT
		) {
			return (
				<div className='flex px-3 py-2 z-20 cursor-pointer '>
					<DPImage
						src={notification.notification_from.dp}
						className={`w-9 h-9 rounded-full bg-white cursor-pointer`}
						onClick={(e) => navigate(`/${notification.notification_from.username}/`)}
					/>
					<div className='w-full flex items-center mx-2 text-sm '>
						<div className='text-ellipsis line-clamp-2 max-h-[36px] overflow-hidden text-black/90'>
							<span
								className='text-black font-medium mr-1 cursor-pointer dark:text-white'
								onClick={(e) => navigate(`/${notification.notification_from.username}/`)}
							>
								{notification.notification_from.username}
							</span>
							<span
								onClick={(e) => navigate(`/p/${notification.post.shared_id}/`)}
								className='dark:text-white/70'
							>
								{notification.text}
							</span>
							<span className='text-black/60 ml-1 dark:text-white/70'>{notification.time}</span>
						</div>
					</div>
					<PostImage
						src={notification.post.post_image}
						className='w-9 h-9 object-contain'
						onClick={(e) => navigate(`/p/${notification.post.shared_id}/`)}
					/>
				</div>
			);
		} else if (notification.type === NotificationType.FOLLOW) {
			return (
				<div className='flex pl-3 py-2 z-20'>
					<DPImage
						src={notification.notification_from.dp}
						className={`w-9 h-9 rounded-full bg-white cursor-pointer`}
						onClick={(e) => navigate(`/${notification.notification_from.username}/`)}
					/>
					<div className='w-full flex items-center mx-2 text-sm '>
						<div className='text-ellipsis line-clamp-2 max-h-[36px] overflow-hidden text-black/90 dark:text-white/70'>
							<span
								className='text-black dark:text-white font-medium mr-1 cursor-pointer'
								onClick={(e) => navigate(`/${notification.notification_from.username}/`)}
							>
								{notification.notification_from.username}
							</span>
							<span>{notification.text}</span>
						</div>
					</div>
					{!notification.isFollowing && (
						<div className=' w-[200px]  flex-center  '>
							<span
								className='text-white bg-primary rounded px-2 py-1 text-sm font-medium cursor-pointer'
								onClick={followBackHandler}
							>
								Follow Back
							</span>
						</div>
					)}
				</div>
			);
		} else if (notification.type === NotificationType.FOLLOW_REQUEST) {
			return (
				<div className='flex pl-3 py-2 z-20'>
					<DPImage
						src={notification.notification_from.dp}
						className={`w-9 h-9 rounded-full bg-white cursor-pointer`}
						onClick={(e) => navigate(`/${notification.notification_from.username}/`)}
					/>
					<div className='w-full flex items-center mx-2 text-sm '>
						<div className='text-ellipsis line-clamp-2 max-h-[36px] overflow-hidden text-black/90 dark:text-white/70'>
							<span
								className='text-black dark:text-white font-medium mr-1 cursor-pointer '
								onClick={(e) => navigate(`/${notification.notification_from.username}/`)}
							>
								{notification.notification_from.username}
							</span>
							<span>{notification.text}</span>
						</div>
					</div>
					<div className=' w-[250px]  flex-center  '>
						<span
							className='text-white bg-primary rounded px-2 mr-2 py-1 text-sm font-medium cursor-pointer'
							onClick={acceptRequest}
						>
							Accept
						</span>
						<span
							className='text-white bg-red-400 rounded px-2 py-1 text-sm font-medium cursor-pointer'
							onClick={rejectRequest}
						>
							Reject
						</span>
					</div>
				</div>
			);
		}
	}
}

function parsePath(path) {
	if (path.includes('direct')) {
		return 'messenger';
	} else if (path.includes('explore')) {
		return 'explore';
	} else if (path === '/') {
		return 'home';
	} else if (path.includes('create-post')) {
		return 'create-post';
	}
	return '';
}
