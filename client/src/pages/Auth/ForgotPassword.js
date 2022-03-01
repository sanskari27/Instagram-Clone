import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LOCK from '../../assets/lock.png';
import Navbar from '../../components/Navbar';
import AlertBar from '../../components/AlertBar';
import Axios from '../../Controller/Axios';
import { TextInput, SubmitBTN, PasswordInput } from '../../components/Input';
import DARK_MODE from '../../assets/dark-mode.png';
import LIGHT_MODE from '../../assets/light-mode.png';

export default function ForgotPasssword({ setTitle }) {
	const navigate = useNavigate();
	React.useEffect(() => {
		setTitle('Forgot Password');
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
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [question, setQuestion] = React.useState('');
	const [answer, setAnswer] = React.useState('');
	const [state, setState] = React.useState(0);
	const [error, setError] = React.useState('');

	async function onSubmit() {
		if (state === 0) {
			fetchSecurityQuestion();
		}
		if (state === 1) {
			verifySecurityAnswer();
		}
		if (state === 2) {
			createPassword();
		}
	}

	async function fetchSecurityQuestion() {
		if (!username) {
			return;
		}
		setLoading(true);
		try {
			const { data } = await Axios.post(`/auth/forgot-password`, {
				username: username,
			});
			if (data.success) {
				setLoading(false);
				setQuestion(data.message);
				setState(1);
			} else {
				setLoading(false);
				setState(0);
				setError('Some Error Occured. Please try again later.');
			}
		} catch (err) {
			setLoading(false);
			setState(0);
			if (err.response) {
				const msg = err.response.data.message;
				if (msg === 'User not found') {
					setError('User not found.');
				} else if (msg === 'Cannot recover this account.') {
					setError('Security question not configured. Cannot recover this account.');
				} else {
					setError('Some Error Occured. Please try again later.');
				}
			} else {
				setError(
					`We couldn't connect to Instagram. Make sure you're connected to the internet and try again.`
				);
			}
		}
	}
	async function verifySecurityAnswer() {
		if (!answer) {
			return;
		}
		setLoading(true);
		try {
			const { data } = await Axios.post(`/auth/verify-security`, {
				answer: answer,
			});
			if (data.success) {
				setLoading(false);
				setState(2);
			} else {
				setLoading(false);
				setState(0);
				setError('Some Error Occured. Please try again later.');
			}
		} catch (err) {
			setLoading(false);
			if (err.response) {
				const msg = err.response.data.message;
				if (msg === 'Password reset failed') {
					setError('Unable to verify your account. Please try again.');
				} else if (msg === 'Invalid Security Answer') {
					setError('Invalid Answer');
				} else {
					setError('Some Error Occured. Please try again later.');
				}
			} else {
				setError(
					`We couldn't connect to Instagram. Make sure you're connected to the internet and try again.`
				);
			}
		}
	}
	async function createPassword() {
		if (!password || password.length <= 6) {
			return;
		}
		setLoading(true);
		try {
			const { data } = await Axios.put(`/auth/reset-password`, {
				password: password,
			});
			if (data.success) {
				navigate('/');
			} else {
				setLoading(false);
				setState(0);
				setError('Some Error Occured. Please try again later.');
			}
		} catch (err) {
			setLoading(false);
			if (err.response) {
				const msg = err.response.data.message;
				if (msg === 'Password reset failed') {
					setError('Unable to verify your account. Please try again.');
				} else if (msg === 'Invalid Security Answer') {
					setError('Invalid Answer');
				} else {
					setError('Some Error Occured. Please try again later.');
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
			<Navbar menuHidden={true} />
			<div className='flex flex-col w-screen h-screen  items-center bg-zinc-50 dark:bg-neutral-800 mt-12 pt-8'>
				<div className='w-[350px] h-fit px-10 flex flex-col  align-middle justify-center bg-white dark:bg-neutral-900 border dark:border-none py-6 rounded-t-md'>
					<img src={LOCK} alt='' className='w-[100px]  mx-auto select-none dark:invert' />
					<span className='text-center font-semibold mt-3 text-black/80 dark:text-white/80'>
						Trouble Logging In?
					</span>
					<span className='text-center tracking-tight  text-sm  mt-3 dark:text-white/50'>
						{state === 0 && <>Enter your email, or username to get back into your account.</>}
						{state === 1 && question}
						{state === 2 && <>Create a new secured password</>}
					</span>
					<form>
						{(state === 0 || state === 1) && (
							<TextInput
								className='mt-3'
								placeholder={state === 0 ? 'Username or email' : 'Security Answer'}
								onChange={state === 0 ? setUsername : setAnswer}
								value={state === 0 ? username : answer}
								tabIndex={1}
							/>
						)}
						{state === 2 && (
							<PasswordInput
								className='mt-3'
								placeholder={'Create Password'}
								value={password}
								onChange={setPassword}
								tabIndex={1}
							/>
						)}
						<SubmitBTN
							className='mt-4'
							text={state === 0 ? 'Verify' : state === 1 ? 'Validate' : 'Save Password'}
							loading={loading}
							tabIndex={3}
							disabled={
								state === 0
									? username.length <= 0
									: state === 1
									? answer.length <= 0
									: password.length < 6
							}
							onClick={onSubmit}
						/>
					</form>
					<div className='mt-4 flex justify-between items-center '>
						<hr className='w-full mr-3 border-1 border-zinc-300'></hr>
						<span className='text-sm font-bold opacity-40  dark:text-white'>OR</span>
						<hr className='w-full ml-3 border-1 border-zinc-300'></hr>
					</div>
					<Link
						to='/auth/register'
						className='mt-2 mb-16 text-sm font-semibold text-center select-none dark:text-white/70'
						tabIndex='4'
					>
						Create New Account
					</Link>
				</div>
				<div className='w-[350px] h-fit px-10 py-3 flex align-middle justify-center bg-zinc-50 dark:bg-neutral-900 border-2 dark:border-none opacity-80 hover:opacity-70 rounded-b-md'>
					<Link
						to='/auth/login'
						tabIndex='5'
						className='font-bold text-sm  select-none dark:text-white/70'
					>
						Back To Login
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
			<AlertBar message={error} />
		</>
	);
}
