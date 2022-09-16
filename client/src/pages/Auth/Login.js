import React from 'react';
import $ from 'jquery';
import { Link, useNavigate } from 'react-router-dom';
import LOGO from '../../assets/Instagram_logo.png';
import Axios from '../../Controller/Axios';
import { TextInput, SubmitBTN, PasswordInput } from '../../components/Input';
import DARK_MODE from '../../assets/dark-mode.png';
import LIGHT_MODE from '../../assets/light-mode.png';

export default function Login({ setTitle }) {
	const navigate = useNavigate();
	React.useEffect(() => {
		setTitle('Login');
	}, [setTitle]);

	const [loading, setLoading] = React.useState(false);
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState('');

	const [darkMode, setDarkMode] = React.useState(localStorage.getItem('darkMode') === 'true');
	React.useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		localStorage.setItem('darkMode', darkMode);
	}, [darkMode]);

	async function onSubmit() {
		if (!username || password < 6) {
			return;
		}
		setLoading(true);
		try {
			const { data } = await Axios.post('/auth/login', { username, password });
			if (data.success) {
				navigate('/');
			} else {
				setLoading(false);
				setError('Login failed. Please try again.');
			}
		} catch (err) {
			setLoading(false);
			if (err.response) {
				const msg = err.response.data.message;
				if (msg === 'User not found') {
					setError(
						`The username you entered doesn't belong to an account. Please check your username and try again.`
					);
				} else if (msg === 'Invalid Credentials') {
					setError(`Sorry, your password was incorrect. Please double-check your password.`);
				} else {
					setError('Login failed. Please try again.');
				}
			} else {
				setError(
					`We couldn't connect to Instagram. Make sure you're connected to the internet and try again.`
				);
			}
		}
	}

	return (
		<>
			<div className='flex flex-col w-screen h-screen  items-center bg-zinc-50 dark:bg-neutral-800 pt-8'>
				<div className='w-[350px] h-fit px-10 flex flex-col rounded-md align-middle justify-center bg-white dark:bg-neutral-900 border dark:border-none py-6'>
					<img src={LOGO} alt='' className='w-[175px]  mx-auto select-none dark:invert' />

					<form className='mt-6'>
						<TextInput
							className='mt-3'
							placeholder={'Username or email'}
							onChange={setUsername}
							value={username}
							tabIndex={1}
						/>
						<PasswordInput
							className='mt-2'
							placeholder={'Create Password'}
							value={password}
							onChange={setPassword}
							tabIndex={2}
						/>

						<SubmitBTN
							className='mt-3'
							text={'Log In'}
							loading={loading}
							tabIndex={4}
							disabled={username.length <= 0 || password.length < 6}
							onClick={onSubmit}
						/>
					</form>
					<div className='mt-4 flex justify-between items-center '>
						<hr className='w-full mr-3 border-1 border-zinc-300'></hr>
						<span className='text-sm font-bold opacity-40  dark:text-white'>OR</span>
						<hr className='w-full ml-3 border-1 border-zinc-300'></hr>
					</div>
					<span className='text-sm h-16 text-red-500 text-center mt-2'>{error}</span>
					<Link
						to='/auth/forgot-password'
						className='mt-2 text-xs text-center select-none text-primary'
						tabIndex={5}
					>
						Forgot Password?
					</Link>
				</div>
				<div className='w-[350px] h-fit mt-3  flex items-center justify-center bg-white dark:bg-neutral-900 border  border-zinc-200  dark:border-none rounded-md text-sm p-5 dark:text-white/70'>
					Don't have an account?
					<Link
						to='/auth/register'
						tabIndex={6}
						className='font-semibold select-none px-1 text-primary'
					>
						Sign up
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
