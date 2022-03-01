import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Axios from '../../Controller/Axios';
import { getProfile } from '../../Controller/User';
import Navbar from '../../components/Navbar';
import AlertBar from '../../components/AlertBar';
import NotAvailable from '../extras/NotAvailable';
import Feed from './Feed';
import StoriesViewer from './StoriesViewer';
import Saved from '../Explore/Saved';
import Profile from '../Explore/Profile';
import Explore from '../Explore/Explore';
import Peoples from '../Explore/Peoples';
import CreatePost from '../Post/CreatePost';
import PostExpanded from '../Post/PostExpanded';
import Settings from '../Settings/Settings';
import Messeneger from '../Messenger/Messenger';

const PAGE = {
	SETTINGS: 'SETTINGS',
	MESSENGER: 'MESSENGER',
	POST_EXPANDED: 'POST_EXPANDED',
	STORIES_VIEWER: 'STORIES_VIEWER',
	SAVED: 'SAVED',
	EXPLORE: 'EXPLORE',
	CREATE_POST: 'CREATE_POST',
	FEED: 'FEED',
	PROFILE: 'PROFILE',
	PEOPLES: 'Peoples',
	NA: 'NA',
};
export default function Home({ setTitle }) {
	const location = useLocation();
	const navigate = useNavigate();
	const [alert, setAlert] = React.useState('');
	const [page, setPage] = React.useState('');
	const [data, setData] = React.useState('');
	const [loading, setLoading] = React.useState(false);

	const fetchProfile = React.useCallback(
		async (id) => {
			try {
				const { data } = await Axios.get('/explore/profile/' + id);
				if (data.success) {
					setData(data.message);

					let path = location.pathname;
					path = path.slice(1, path.length - 1).split('/');
					if (path.length > 1) {
						if (path[1] === 'pending-requests' && id === getProfile().username) {
							setData({ ...data.message, pendingRequests: true });
						} else {
							throw new Error('Invalid Path');
						}
					}
					setPage(PAGE.PROFILE);
					setLoading(false);
				} else {
					setLoading(false);
					navigate('/');
					setAlert('Unable to fetch profile.');
				}
			} catch (err) {
				setLoading(false);
				if (err.response) {
					if (err.response.data.message.includes('User not found')) {
						setPage(PAGE.NA);
					}
				} else if (err.message === 'Invalid Path') {
					setPage(PAGE.NA);
				} else setAlert('Unable to fetch profile.');
			}
		},
		[navigate, location.pathname]
	);

	React.useEffect(() => {
		async function isSecurityUpdated() {
			try {
				const { data } = await Axios.get('/auth/security-question');
				if (!data.message) {
					setAlert('Security Question not updated. Please update in settings.');
				}
			} catch (e) {}
		}
		isSecurityUpdated();
	}, [setAlert]);

	React.useEffect(() => {
		if (!alert) return;
		setTimeout(() => {
			setAlert('');
		}, 5000);
	}, [alert]);

	React.useEffect(() => {
		let path = location.pathname;
		if (path.charAt(path.length - 1) !== '/') {
			return navigate(location.pathname + '/');
		}

		if (path.includes('/accounts/')) {
			setPage(PAGE.SETTINGS);
		} else if (path.includes('/direct/')) {
			const details = path.slice(1, path.length - 1).split('/');
			setData(details);
			setPage(PAGE.MESSENGER);
		} else if (path.includes('/p/')) {
			const post_id = path.slice(1, path.length - 1).split('/')[1];
			setData(post_id);
			setPage(PAGE.POST_EXPANDED);
		} else if (path === '/saved/') {
			setPage(PAGE.SAVED);
		} else if (path === '/explore/') {
			setPage(PAGE.EXPLORE);
		} else if (path === '/explore/people/') {
			setPage(PAGE.PEOPLES);
		} else if (path === '/create-post/') {
			setPage(PAGE.CREATE_POST);
		} else {
			const username = path.slice(1, path.length - 1).split('/')[0];
			if (username) {
				setLoading(true);
				fetchProfile(username);
			} else {
				setPage(PAGE.FEED);
			}
		}
	}, [location, navigate, fetchProfile]);

	return (
		<div className='min-h-[100vh]'>
			<Navbar loading={loading} setAlert={setAlert} setLoading={setLoading} />
			{page === PAGE.FEED && (
				<Feed
					setAlert={setAlert}
					setTitle={setTitle}
					setLoading={setLoading}
					loading={loading}
					setPage={setPage}
				/>
			)}
			{page === PAGE.MESSENGER && (
				<Messeneger
					setAlert={setAlert}
					setTitle={setTitle}
					setLoading={setLoading}
					setPage={setPage}
					data={data}
				/>
			)}
			{page === PAGE.PROFILE && (
				<Profile
					setAlert={setAlert}
					setTitle={setTitle}
					data={data}
					setLoading={setLoading}
					loading={loading}
				/>
			)}
			{page === PAGE.EXPLORE && (
				<Explore
					setAlert={setAlert}
					setTitle={setTitle}
					setLoading={setLoading}
					loading={loading}
				/>
			)}
			{page === PAGE.PEOPLES && (
				<Peoples
					setAlert={setAlert}
					setTitle={setTitle}
					setLoading={setLoading}
					loading={loading}
				/>
			)}
			{page === PAGE.CREATE_POST && (
				<CreatePost
					setAlert={setAlert}
					setTitle={setTitle}
					setLoading={setLoading}
					loading={loading}
				/>
			)}
			{page === PAGE.POST_EXPANDED && (
				<PostExpanded
					id={data}
					setAlert={setAlert}
					setTitle={setTitle}
					setLoading={setLoading}
					loading={loading}
				/>
			)}
			{page === PAGE.STORIES_VIEWER && (
				<StoriesViewer
					data={data}
					setAlert={setAlert}
					setTitle={setTitle}
					setLoading={setLoading}
					loading={loading}
				/>
			)}
			{page === PAGE.SETTINGS && (
				<Settings
					selected={data}
					setAlert={setAlert}
					setTitle={setTitle}
					setLoading={setLoading}
					loading={loading}
				/>
			)}
			{page === PAGE.SAVED && (
				<Saved setAlert={setAlert} setTitle={setTitle} setLoading={setLoading} loading={loading} />
			)}
			{page === PAGE.NA && <NotAvailable setTitle={setTitle} />}
			<AlertBar message={alert} />
		</div>
	);
}
