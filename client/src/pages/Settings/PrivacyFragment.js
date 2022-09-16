import Axios from '../../Controller/Axios';
import React from 'react';
import { getProfile, setProfile } from '../../Controller/User';
import CHECK from '../../assets/check.png';
import Loading from '../../components/Loading';

export default function PrivacyFragment({ setAlert, loading, setLoading }) {
	const [privateAccount, setPrivateAccount] = React.useState(getProfile().private);
	const [security, setSecurity] = React.useState({
		question: '',
		answer: '',
	});
	const switchPrivateAccount = async (privateAccount) => {
		try {
			setLoading(true);
			const { data } = await Axios.post('/profile/update-privacy', {
				privateAccount: privateAccount,
			});
			setLoading(false);
			if (data.success) {
				setAlert(data.message);
				setProfile((prev) => {
					return { ...prev, private: data.private };
				});
			}
		} catch (err) {
			setLoading(false);
			if (err.response) {
				return setAlert(err.response.data.message);
			}
			return setAlert('Unable to update account privacy.');
		}
	};
	React.useEffect(() => {
		async function fetchSecurityQuestion() {
			try {
				const { data } = await Axios.get('/auth/security-question');
				setSecurity((prev) => {
					return { ...prev, question: data.message };
				});
			} catch (e) {
				setAlert('Unable to fetch Security Question');
			}
		}
		fetchSecurityQuestion();
	}, [setAlert]);
	return (
		<div className='flex-center'>
			<div className='flex flex-col  w-4/5'>
				<span className='text-2xl dark:text-white'>Account Privacy</span>
				<div className='mt-3 ml-2 flex'>
					<div
						className='w-[20px] h-[20px] border border-zinc-300 flex-center rounded select-none'
						onClick={(e) => {
							if (loading) return;
							switchPrivateAccount(!privateAccount);
							setPrivateAccount((prev) => !prev);
						}}
					>
						{privateAccount ? <img src={CHECK} alt='' className='w-[12px] dark:invert' /> : <></>}
					</div>
					<span className='ml-3 dark:text-white/80'>Private Account</span>
				</div>
				<div className='mt-4 opacity-80 text-sm leading-5 dark:text-white/70'>
					When your account is private, only people you approve can see your photos and videos on
					Instagram. Your existing followers won't be affected.
				</div>
				<span className='text-2xl mt-6 dark:text-white'>Security</span>
				<form className='mt-3 ml-2 flex flex-col'>
					<Input
						placeholder='Question'
						type='text'
						tabIndex={1}
						required={true}
						value={security.question}
						onChange={(value) => {
							setSecurity((prev) => {
								return { ...prev, question: value };
							});
						}}
					/>
					<Input
						placeholder='Answer'
						type='password'
						tabIndex={2}
						required={true}
						value={security.answer}
						onChange={(value) => {
							setSecurity((prev) => {
								return { ...prev, answer: value };
							});
						}}
					/>

					<SubmitBTN details={security} setAlert={setAlert} />
				</form>
			</div>
		</div>
	);
}

function Input({ placeholder, type, tabIndex, required, max, value, onChange }) {
	return (
		<div className='w-full flex my-2'>
			<div className='w-[120px] flex items-center pr-4 font-medium opacity-90 dark:text-white/80'>
				{placeholder}
			</div>
			<div className='w-full text-left px-4 '>
				<input
					className='border border-zinc-300 dark:border-none rounded px-2 py-1 w-full outline-none  font-light dark:bg-neutral-700 dark:text-white'
					autoComplete='new-password'
					value={value}
					onChange={(e) => onChange(e.target.value)}
					type={type}
					tabIndex={tabIndex}
					required={required || false}
					max={max || null}
				/>
			</div>
		</div>
	);
}

function SubmitBTN({ details, setAlert }) {
	const [loading, setLoading] = React.useState(false);
	const handleSubmit = async () => {
		if (loading) return;
		if (!details.question) {
			return setAlert('Security Question Required.');
		} else if (!details.answer) {
			return setAlert('Security Answer Required.');
		}
		try {
			setLoading(true);
			const { data } = await Axios.post('/auth/update-security', details);
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
				{loading ? <Loading /> : <>Update Security</>}
			</div>
		</div>
	);
}
