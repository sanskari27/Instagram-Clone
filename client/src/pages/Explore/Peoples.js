import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DPImage } from '../../components/ImageUtils';
import $ from 'jquery';
import Axios from '../../Controller/Axios';
import LOADING_DARK from '../../assets/loading_dark.png';
export default function Peoples({ setTitle, setAlert, loading, setLoading }) {
	const [peoples, setPeoples] = React.useState([]);
	React.useEffect(() => {
		setTitle('');
	}, [setTitle]);
	React.useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const { data } = await Axios.get(`/explore/people`);
				if (data.success) {
					setPeoples(data.message);
				} else {
					setAlert('Cannot fetch your suggestions');
				}
			} catch (err) {
				setAlert('Cannot fetch your suggestions');
			}
			setLoading(false);
		}
		fetchData();
	}, [setAlert, setLoading]);
	return (
		<>
			<div className='w-screen h-screen flex items-center flex-col   padding-app '>
				<div className='w-[500px] h-fit '>
					<div className='font-medium tracking-wide dark:text-white'>Suggested</div>
					<div className='mt-2 p-3 bg-white dark:bg-neutral-900 rounded-md border border-zinc-100 dark:border-none '>
						{peoples.map((people, index) => {
							return <Row key={index} people={people} className={loading && 'hidden'} />;
						})}
						{peoples.length === 0 && (
							<>
								<span className={`flex-center dark:text-white/90 ${loading && 'hidden'}`}>
									No new suggestions.
								</span>
							</>
						)}

						<img
							className={`w-8 h-8 m-auto animate-spin dark:invert ${!loading && 'hidden'}`}
							src={LOADING_DARK}
							alt=''
						/>
					</div>
				</div>
			</div>
		</>
	);
}

function Row({ people, className }) {
	const navigate = useNavigate();
	return (
		<>
			<div className={`flex mx-4 my-4 items-center ${className}`}>
				<div className='w-12 flex-center'>
					<DPImage src={people.dp} className='w-10 rounded-full select-none ' />
				</div>
				<div
					className='flex flex-col w-full ml-3 overflow-hidden '
					onClick={(e) => navigate('/' + people.username + '/')}
				>
					<span className='line-clamp-1 text-sm font-medium cursor-pointer hover:underline dark:text-white'>
						{people.username}
					</span>
					<span className='line-clamp-1 text-sm opacity-60 cursor-pointer dark:text-white/70'>
						{people.name}
					</span>
				</div>
				<div
					className='text-xs font-semibold flex-center float-right cursor-pointer'
					onClick={async (e) => {
						const span = $(e.target);
						const text = span.text();
						const loading = $(e.target).parent().find('img');
						span.addClass('hidden');
						loading.removeClass('hidden');
						try {
							if (text === 'Follow') {
								const { data } = await Axios.post('/explore/follow/' + people.username);
								if (data.success) {
									span
										.text(data.message)
										.removeClass('bg-primary text-white')
										.addClass('text-black/70');
								}
							} else if (text === 'Following') {
								const { data } = await Axios.post('/explore/unfollow/' + people.username);
								if (data.success) {
									span
										.text('Follow')
										.removeClass('text-black/70')
										.addClass('bg-primary text-white');
								}
							} else if (text === 'Requested') {
								const { data } = await Axios.post('/explore/remove-request/' + people.username);
								if (data.success) {
									span
										.text('Follow')
										.removeClass('text-black/70')
										.addClass('bg-primary text-white');
								}
							}
						} catch (err) {}

						loading.addClass('hidden');
						span.removeClass('hidden');
					}}
				>
					<span className='px-3 py-2 rounded text-white bg-primary'>Follow</span>
					<img className='w-4 h-4 animate-spin hidden dark:invert' src={LOADING_DARK} alt='' />
				</div>
			</div>
		</>
	);
}
