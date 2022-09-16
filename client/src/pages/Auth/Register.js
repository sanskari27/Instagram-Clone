import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LOGO from '../../assets/Instagram_logo.png';
import Axios from '../../Controller/Axios';
import { TextInput, SubmitBTN, PasswordInput } from '../../components/Input';
import DARK_MODE from '../../assets/dark-mode.png';
import LIGHT_MODE from '../../assets/light-mode.png';

export default function Register({ setTitle }) {
	const navigate = useNavigate();
	React.useEffect(() => {
		setTitle('Sign up');
	}, [setTitle]);

	const [darkMode, setDarkMode] = React.useState(localStorage.getItem('darkMode') === 'true');
	React.useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		localStorage.setItem('darkMode', darkMode);
	}, [darkMode]);

	const [loading, setLoading] = React.useState(false);
	const [email, setEmail] = React.useState('');
	const [name, setName] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState('');

	async function onSubmit() {
		if (!username || password < 6) {
			return;
		}
		setLoading(true);
		try {
			const { data } = await Axios.post('/auth/register', { name, email, username, password });
			if (data.success) {
				navigate('/');
			} else {
				setLoading(false);
				setError({ text: 'Sign Up failed. Please try again.' });
			}
		} catch (err) {
			setLoading(false);
			if (err.response) {
				const msg = err.response.data.message;
				if (msg === 'Username already taken.') {
					setError({ username: true });
				} else if (msg === 'Email already registered.') {
					setError({ email: true });
				} else {
					setError({ text: `Unable to process your request. Please try again.` });
				}
			} else {
				setError({ text: `We couldn't connect to Instagram.` });
			}
		}
	}

	return (
		<>
			<div className='flex flex-col w-screen h-screen  items-center bg-zinc-50 dark:bg-neutral-800 pt-8'>
				<div className='w-[350px] h-fit px-10 flex flex-col  align-middle justify-center bg-white dark:bg-neutral-900 border dark:border-none rounded-md py-6'>
					<img src={LOGO} alt='' className='w-[175px]  mx-auto select-none dark:invert' />
					<h2 className='w-full text-center font-semibold text-lg tracking-tight text-black/50 dark:text-white/50'>
						Sign up to see photos and videos from your friends.
					</h2>
					<hr className='w-full mt-5 border-1 border-zinc-300'></hr>
					<form className='mt-3'>
						<TextInput
							className={`mt-1 ${error.email && 'border-red-500'}`}
							placeholder={'Email'}
							onChange={setEmail}
							value={email}
							tabIndex={1}
						/>
						<TextInput
							className='mt-1'
							placeholder={'Full Name'}
							onChange={setName}
							value={name}
							tabIndex={2}
						/>
						<TextInput
							className={`mt-1 ${error.username && 'border-red-500'}`}
							placeholder={'Username'}
							onChange={setUsername}
							value={username}
							tabIndex={3}
						/>
						<PasswordInput
							className={`mt-1`}
							placeholder={'Create Password'}
							value={password}
							onChange={setPassword}
							tabIndex={4}
							autoComplete={'new-password'}
						/>

						<SubmitBTN
							className='mt-3'
							text={'Sign up'}
							loading={loading}
							tabIndex={6}
							disabled={!name || !email || !username || password.length < 6}
							onClick={onSubmit}
						/>
					</form>
					<span className='text-sm h-fit text-red-500 text-center mt-2'>{error.text}</span>
				</div>
				<div className='w-[350px] h-fit mt-3  flex items-center justify-center bg-white dark:bg-neutral-900 border  border-zinc-200  dark:border-none rounded-md text-sm p-5 dark:text-white/70'>
					Have an account?
					<Link
						to='/auth/login'
						tabIndex={6}
						className='font-semibold select-none px-1 text-primary'
					>
						Log in
					</Link>
				</div>
			</div>

			<div className='absolute right-3 bottom-3'>
				<img
					src={darkMode ? DARK_MODE : LIGHT_MODE}
					alt=''
					className='w-6 cursor-pointer dark:invert'
					onClick={(e) => {
						setDarkMode((prev) => !prev);
					}}
				/>
			</div>
		</>
	);
}
