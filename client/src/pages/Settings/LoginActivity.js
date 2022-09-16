import Axios from '../../Controller/Axios';
import React from 'react';
import $ from 'jquery';
import LOCATION from '../../assets/location.png';

export default function LoginActivity({ setAlert, loading, setLoading }) {
	const [devices, setDevices] = React.useState([]);
	React.useEffect(() => {
		const fetchDevices = async () => {
			try {
				setLoading(true);
				const { data } = await Axios.get('/profile/login-activity');
				setLoading(false);
				if (data.success) {
					setDevices(data.message);
				}
			} catch (err) {
				setLoading(false);
				if (err.response) {
					return setAlert(err.response.data.message);
				}
				return setAlert('Unable to fetch login activity.');
			}
		};
		fetchDevices();
	}, [setAlert, setLoading]);

	return (
		<div className='flex flex-col w-full md:w-4/5 mx-auto'>
			<span className='text-2xl font-thin dark:text-white'>Login Activity</span>
			<span className=' dark:text-white/70'>Where You're Logged in</span>
			{devices.map((device, index) => (
				<Device key={index} details={device} />
			))}
		</div>
	);
}
function Device({ details }) {
	const removeHandler = async (e) => {
		try {
			await Axios.post('/profile/remove-device/' + details.id);
		} catch (err) {}
		$(e.target).parent().remove();
	};
	const logoutHandler = async (e) => {
		try {
			await Axios.post('/profile/logout-device/' + details.id);
		} catch (err) {}
		$(e.target).remove();
	};
	return (
		<div className='flex items-center px-2 my-2 border-t-[1px] pt-4'>
			<img
				src={LOCATION}
				alt=''
				className={`w-6 select-none dark:invert ${details.location && 'cursor-pointer'}`}
				onClick={(e) => {
					if (details.location) {
						window.open(`http://maps.google.com/?q=${details.location}`, '_blank');
					}
				}}
			/>
			<div className='w-full flex flex-col ml-3'>
				<span className='leading-4 text-sm opacity-80 dark:text-white/70'>
					{details.platform} · {details.browser}
				</span>
				<div className='leading-4 text-sm opacity-80'>
					<span
						className={`${
							details.last_login === 'Active now' ? 'text-green-500/95' : 'dark:text-white/70'
						}`}
					>
						{details.last_login}
					</span>
				</div>
			</div>
			{!details.isLoggedOut && details.last_login !== 'Active now' && (
				<div
					className='w-[100px] flex-center px-2 py-1 bg-primary/80 rounded cursor-pointer select-none text-white text-sm fontt-medium mx-1'
					onClick={logoutHandler}
				>
					Log Out
				</div>
			)}
			{details.last_login !== 'Active now' && (
				<div
					className='w-[100px] flex-center px-2 py-1 bg-red-400 rounded cursor-pointer select-none text-white text-sm fontt-medium mx-1'
					onClick={removeHandler}
				>
					Remove
				</div>
			)}
		</div>
	);
}
