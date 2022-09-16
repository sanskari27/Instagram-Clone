import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import Home from '../pages/Home/Home';
import LoadingPage from '../pages/extras/LoadingPage';
import Axios from './Axios';
import { setProfile, clearProfile } from '../Controller/User';
import StoriesViewer from '../pages/Home/StoriesViewer';

export function LoginRoute({ setTitle, ...rest }) {
	const [loggedIn, setLoggedIn] = useState(false);
	const [loading, setLoading] = useState(true);
	const { auth_path } = useParams();
	useEffect(() => {
		let isMounted = true;
		async function fetchData() {
			try {
				const location = await getCurrentLatLong();
				const { data } = await Axios.post(`/auth/loggedin`, location);
				if (isMounted) {
					setLoggedIn(data.success);
					setProfile(data.details);
					setLoading(false);
				}
			} catch (err) {
				if (isMounted) {
					setLoggedIn(false);
					clearProfile();
					setLoading(false);
				}
			}
		}
		fetchData();
		return () => {
			isMounted = false;
		};
	}, []);

	if (loading) {
		return (
			<>
				<LoadingPage></LoadingPage>
			</>
		);
	}

	if (loggedIn) {
		return <Navigate to={`/`} />;
	}
	if (auth_path === 'login') return <Login {...rest} setTitle={setTitle} />;
	else if (auth_path === 'register') return <Register {...rest} setTitle={setTitle} />;
	else if (auth_path === 'forgot-password') return <ForgotPassword {...rest} setTitle={setTitle} />;
}

export function HomeRoute({ setTitle, ...rest }) {
	const [loggedIn, setLoggedIn] = useState(false);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		let isMounted = true;
		async function fetchData() {
			try {
				const location = await getCurrentLatLong();
				const { data } = await Axios.post(`/auth/loggedin`, location);
				if (isMounted) {
					setLoggedIn(data.success);
					setProfile(data.details);
					setLoading(false);
				}
			} catch (err) {
				if (isMounted) {
					setLoggedIn(false);
					clearProfile();
					setLoading(false);
				}
			}
		}
		fetchData();
		return () => {
			isMounted = false;
		};
	}, []);

	if (loading) {
		return (
			<>
				<LoadingPage />
			</>
		);
	}

	if (!loggedIn) {
		return <Navigate to={`/auth/login/`} />;
	}
	return <Home {...rest} setTitle={setTitle} />;
}

export function StoriesRoute({ setTitle, ...rest }) {
	const [loggedIn, setLoggedIn] = useState(false);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		let isMounted = true;
		async function fetchData() {
			try {
				const location = await getCurrentLatLong();
				const { data } = await Axios.post(`/auth/loggedin`, location);
				if (isMounted) {
					setLoggedIn(data.success);
					setProfile(data.details);
					setLoading(false);
				}
			} catch (err) {
				if (isMounted) {
					setLoggedIn(false);
					clearProfile();
					setLoading(false);
				}
			}
		}
		fetchData();
		return () => {
			isMounted = false;
		};
	}, []);

	if (loading) {
		return (
			<>
				<LoadingPage />
			</>
		);
	}

	if (!loggedIn) {
		return <Navigate to={`/auth/login/`} />;
	}
	return <StoriesViewer {...rest} setTitle={setTitle} />;
}

export function LogoutRoute({ setTitle, ...rest }) {
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		let isMounted = true;
		async function fetchData() {
			try {
				await Axios.post(`/auth/logout`);
				if (isMounted) {
					setLoading(false);
					clearProfile();
				}
			} catch (err) {
				if (isMounted) {
					setLoading(false);
					clearProfile();
				}
			}
		}
		fetchData();
		return () => {
			isMounted = false;
		};
	}, []);

	if (loading) {
		return (
			<>
				<LoadingPage></LoadingPage>
			</>
		);
	}

	return <Navigate to={`/auth/login/`} />;
}

const getCurrentLatLong = async () => {
	const opt = {
		// timeout:INFINITY,
		// maximumAge:INFINITY,
		// accuracy: { ios: "hundredMeters", android: "balanced" },
		// enableHighAccuracy: false,
		// distanceFilter:0,
		showLocationDialog: true,
		forceRequestLocation: true,
	};
	const getCurrentPosition = () =>
		new Promise((resolve, error) => navigator.geolocation.getCurrentPosition(resolve, error, opt));

	try {
		const Data = await getCurrentPosition();

		return { latitude: Data?.coords?.latitude, longitude: Data?.coords?.longitude };
	} catch (error) {
		return { latitude: null, longitude: null };
	}
};
