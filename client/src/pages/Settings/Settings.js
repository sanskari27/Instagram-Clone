import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EditProfileFragment from './EditProfileFragment';
import ChangePasswordFragment from './ChangePasswordFragment';
import PrivacyFragment from './PrivacyFragment';
import LoginActivity from './LoginActivity';

const MENU = {
	EDIT_PROFILE: 'Edit Profile',
	CHANGE_PASSWORD: 'Change Password',
	PRIVACY_SECURITY: 'Privacy and Security',
	LOGIN_ACTIVITY: 'Login Activity',
};

const PAGE = {
	EDIT_PROFILE: 'edit',
	CHANGE_PASSWORD: 'change-password',
	PRIVACY_SECURITY: 'privacy-security',
	LOGIN_ACTIVITY: 'login-activity',
};

export default function Settings({ setTitle, setAlert, setLoading, loading }) {
	const navigate = useNavigate();
	const location = useLocation();
	const [page, setPage] = React.useState(MENU.EDIT_PROFILE);

	React.useEffect(() => {
		let path = location.pathname;
		path = path.slice(1, path.length - 1).split('/')[1];
		setPage(path);
	}, [location, navigate]);

	React.useEffect(() => {
		if (page === PAGE.EDIT_PROFILE) setTitle(MENU.EDIT_PROFILE);
		else if (page === PAGE.CHANGE_PASSWORD) setTitle(MENU.CHANGE_PASSWORD);
		else if (page === PAGE.PRIVACY_SECURITY) setTitle(MENU.PRIVACY_SECURITY);
		else if (page === PAGE.LOGIN_ACTIVITY) setTitle(MENU.LOGIN_ACTIVITY);
	}, [page, setTitle]);

	return (
		<div className='min-w-screen min-h-screen'>
			<div className='w-full h-fit flex-center pb-24  padding-app'>
				<div className=' w-full relative flex rounded-md border flex-col md:flex-row border-zinc-200 dark:border-none bg-white dark:bg-neutral-900 overflow-hidden '>
					<div className='w-full md:w-1/4 flex md:flex-col justify-center md:justify-start relative border-r-[1px] border-b-[1px] md:border-b-0 overflow-hidden'>
						<Menu text='Edit Profile' selectedPage={page} menu='edit' />
						<Menu text='Change Password' selectedPage={page} menu='change-password' />
						<Menu text='Privacy and Security' selectedPage={page} menu='privacy-security' />
						<Menu text='Login Activity' selectedPage={page} menu='login-activity' />
					</div>
					<div className='w-full md:w-3/4 py-6'>
						{page === PAGE.EDIT_PROFILE && (
							<EditProfileFragment setAlert={setAlert} loading={loading} setLoading={setLoading} />
						)}
						{page === PAGE.CHANGE_PASSWORD && (
							<ChangePasswordFragment
								setAlert={setAlert}
								loading={loading}
								setLoading={setLoading}
							/>
						)}
						{page === PAGE.PRIVACY_SECURITY && (
							<PrivacyFragment setAlert={setAlert} loading={loading} setLoading={setLoading} />
						)}
						{page === PAGE.LOGIN_ACTIVITY && (
							<LoginActivity setAlert={setAlert} loading={loading} setLoading={setLoading} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function Menu(props) {
	const navigate = useNavigate();

	return (
		<div
			className={`py-4 px-4 md:pl-6 text-sm cursor-pointer text-center md:text-left dark:text-white ${
				props.selectedPage === props.menu
					? 'border-b-[2px] md:border-l-[2px] md:border-b-0 border-black/90 font-medium '
					: 'hover:bg-zinc-50 md:hover:border-l-[2px] hover:border-black/30 dark:hover:bg-neutral-800'
			}`}
			onClick={(e) => navigate(`/accounts/${props.menu}/`)}
		>
			{props.text}
		</div>
	);
}
