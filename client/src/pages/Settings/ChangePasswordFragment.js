import Axios from '../../Controller/Axios';
import React from 'react';
import { DPImage } from '../../components/ImageUtils';
import { getProfile } from '../../Controller/User';
import Loading from '../../components/Loading';

export default function ChangePasswordFragment({ setAlert }) {
	const [details, setDetails] = React.useState({
		old_password: '',
		new_password: '',
		confirm_password: '',
	});

	return (
		<div className='flex flex-col '>
			<div className='w-full flex items-center mb-3'>
				<div className='w-1/4 flex justify-end px-4'>
					<DPImage src={getProfile().dp} className='w-10 rounded-full' />
				</div>
				<div className='w-3/4 text-left px-4 '>
					<div className='tracking-wide text-xl leading-4 dark:text-white'>
						{getProfile().username}
					</div>
				</div>
			</div>
			<form className='w-full flex my-2'>
				<div className='w-1/4 flex items-center justify-end text-right px-4 text-sm font-medium opacity-90 dark:text-white/90'>
					Old Password
				</div>
				<div className='w-3/4 md:w-2/3 text-left px-4 '>
					<input
						className='border border-zinc-300 dark:border-none rounded px-2 py-2 w-full outline-none dark:bg-neutral-700 dark:text-white'
						value={details.old_password}
						onChange={(e) =>
							setDetails((prev) => {
								return { ...prev, old_password: e.target.value };
							})
						}
						type='password'
						autoComplete='current-password'
						tabIndex={1}
						required={true}
					/>
				</div>
			</form>
			<div className='w-full flex my-2'>
				<div className='w-1/4 flex items-center justify-end text-right px-4 text-sm font-medium opacity-90 dark:text-white/90'>
					New Password
				</div>
				<div className='w-3/4 md:w-2/3 text-left px-4 '>
					<input
						className='border border-zinc-300 dark:border-none rounded px-2 py-2 w-full outline-none dark:bg-neutral-700 dark:text-white'
						value={details.new_password}
						onChange={(e) =>
							setDetails((prev) => {
								return { ...prev, new_password: e.target.value };
							})
						}
						type='password'
						autoComplete='new-password'
						tabIndex={2}
						required={true}
					/>
				</div>
			</div>
			<div className='w-full flex my-2'>
				<div className='w-1/4 flex items-center justify-end text-right px-4 text-sm font-medium opacity-90 dark:text-white/90'>
					Confirm New Password
				</div>
				<div className='w-3/4 md:w-2/3 text-left px-4 '>
					<input
						className='border border-zinc-300 dark:border-none rounded px-2 py-2 w-full outline-none dark:bg-neutral-700 dark:text-white'
						value={details.confirm_password}
						onChange={(e) =>
							setDetails((prev) => {
								return { ...prev, confirm_password: e.target.value };
							})
						}
						type='password'
						autoComplete='new-password'
						tabIndex={3}
						required={true}
					/>
				</div>
			</div>
			<SubmitBTN details={details} setAlert={setAlert} />
		</div>
	);
}

function SubmitBTN({ details, setAlert }) {
	const [loading, setLoading] = React.useState(false);
	const handleSubmit = async () => {
		if (!details.new_password) {
			return setAlert('New Password required.');
		} else if (!details.old_password) {
			return setAlert('Old Password required.');
		} else if (details.new_password !== details.confirm_password) {
			return setAlert('Passwords mismatched.');
		} else if (details.new_password.length < 6) {
			return setAlert('Password too short.');
		}
		try {
			setLoading(true);
			const { data } = await Axios.post('/profile/update-password', details);
			setLoading(false);
			if (data.success) {
				return setAlert(data.message);
			}
		} catch (err) {
			setLoading(false);
			if (err.response) {
				return setAlert(err.response.data.message);
			}
			return setAlert('Cannot update password. Please try again later.');
		}
	};
	return (
		<div className='flex-center flex-col w-full md:w-2/3 mt-6'>
			<div
				className='bg-primary text-white px-4 py-1 w-[200px] text-center rounded cursor-pointer select-none'
				onClick={handleSubmit}
			>
				{loading ? <Loading /> : <>Change Password</>}
			</div>
		</div>
	);
}
