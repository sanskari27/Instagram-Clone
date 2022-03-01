import { initProfile } from './Controller/User';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { LoginRoute, HomeRoute, StoriesRoute, LogoutRoute } from './Controller/Route';
import React from 'react';
import $ from 'jquery';

export default function App() {
	const profile = initProfile();
	const setTitle = (title) => {
		if (title) {
			document.title = title + ' • Instagram-Clone';
		} else {
			document.title = 'Instagram-Clone';
		}
	};

	React.useEffect(() => {
		if (profile?.darkMode || localStorage.getItem('darkMode') === 'true') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, [profile]);

	return (
		<div className='app-container'>
			<Router>
				<Routes>
					<Route exact path='/auth/:auth_path' element={<LoginRoute setTitle={setTitle} />} />
					<Route exact path='/logout' element={<LogoutRoute setTitle={setTitle} />} />
					<Route exact path='/stories/' element={<StoriesRoute setTitle={setTitle} />} />
					<Route path='/*' element={<HomeRoute setTitle={setTitle} />} />

					<Route render={() => <Navigate to={`/`} />} />
				</Routes>
			</Router>
		</div>
	);
}
