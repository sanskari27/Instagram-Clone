import React from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import Axios from '../../Controller/Axios';
import { getProfile } from '../../Controller/User';
import { DPImage } from '../../components/ImageUtils';
import LOADING_DARK from '../../assets/loading_dark.png';

export default function Suggestions({ setAlert }) {
	const navigate = useNavigate();
	const [suggestions, setSuggestions] = React.useState([]);

	React.useState(() => {
		async function fetchData() {
			try {
				const { data } = await Axios.get(`/explore/people`);
				if (data.success) {
					setSuggestions(getRandom(data.message, 5));
				} else {
					setAlert('Cannot fetch your suggestions');
				}
			} catch (err) {
				setAlert('Cannot fetch your suggestions');
			}
		}
		fetchData();
	}, []);
	return (
		<>
			<div className='flex mt-3 items-center'>
				<DPImage
					src={getProfile().dp}
					className='w-14 rounded-full cursor-pointer select-none'
					onClick={(e) => navigate(`/${getProfile().username}/`)}
				/>
				<div className=' w-full flex flex-col ml-4 justify-center'>
					<span
						className='text-sm font-semibold leading-4 w-2/3 text-ellipsis overflow-hidden cursor-pointer select-none dark:text-white'
						onClick={(e) => navigate(`/${getProfile().username}/`)}
					>
						{getProfile().username}
					</span>
					<span
						className='w-2/3 opacity-50 tracking-tighter cursor-pointer select-none dark:text-white'
						onClick={(e) => navigate(`/${getProfile().username}/`)}
					>
						{getProfile().name}
					</span>
				</div>
			</div>
			<div className='flex mt-4 justify-between'>
				<span className='text-sm font-semibold opacity-60 dark:text-white'>
					Suggestions For You
				</span>
				{suggestions.length > 0 && (
					<span
						className='text-xs font-medium cursor-pointer dark:text-white/70'
						onClick={(e) => navigate('/explore/people/')}
					>
						See All
					</span>
				)}
			</div>
			{suggestions.length === 0 && (
				<div className='mt-2 flex-center dark:text-white/60'>No new suggestions</div>
			)}
			{suggestions.map((suggestion, index) => {
				return (
					<div key={index} className='flex mt-4 items-center'>
						<DPImage
							src={suggestion.dp}
							className='w-8 rounded-full cursor-pointer'
							onClick={(e) => {
								navigate(`/${suggestion.username}/`);
							}}
						/>
						<div className='w-3/4 flex flex-col ml-4 justify-center'>
							<span
								className='text-sm font-semibold leading-4 w-full text-ellipsis overflow-hidden cursor-pointer hover:underline dark:text-white'
								onClick={(e) => {
									navigate(`/${suggestion.username}/`);
								}}
							>
								{suggestion.username}
							</span>
							<span
								className='text-xs opacity-50 leading-4 w-full line-clamp-1 cursor-pointer tracking-tight dark:text-white'
								onClick={(e) => {
									navigate(`/${suggestion.username}/`);
								}}
							>
								{suggestion.name}
							</span>
						</div>
						<div className='w-full'>
							<div
								className='text-xs font-semibold text-primary float-right cursor-pointer'
								onClick={async (e) => {
									const span = $(e.target);
									const text = span.text();
									const loading = $(e.target).parent().find('img');
									span.text('').removeClass('text-primary').addClass('text-zinc-500');
									loading.removeClass('hidden');
									if (text === 'Follow') {
										try {
											const { data } = await Axios.post('/explore/follow/' + suggestion.username);
											loading.addClass('hidden');
											if (data.success) {
												span.text(data.message);
											} else {
												span.text(text).removeClass('text-zinc-500').addClass('text-primary');
											}
										} catch (err) {
											span.text(text).removeClass('text-zinc-500').addClass('text-primary');
										}
									} else if (text === 'Following') {
										try {
											const { data } = await Axios.post('/explore/unfollow/' + suggestion.username);
											loading.addClass('hidden');
											if (data.success) {
												span.text('Follow').removeClass('text-zinc-500').addClass('text-primary');
											} else {
												span.text(text);
											}
										} catch (err) {
											span.text(text);
										}
									} else if (text === 'Requested') {
										try {
											const { data } = await Axios.post(
												'/explore/remove-request/' + suggestion.username
											);
											loading.addClass('hidden');
											if (data.success) {
												span.text('Follow').removeClass('text-zinc-500').addClass('text-primary');
											} else {
												span.text(text);
											}
										} catch (err) {
											span.text(text);
										}
									}
								}}
							>
								<span>Follow</span>
								<img
									className='w-4 h-4 animate-spin hidden dark:invert'
									src={LOADING_DARK}
									alt=''
								/>
							</div>
						</div>
					</div>
				);
			})}
		</>
	);
}

function getRandom(arr, n) {
	let x = Math.min(arr.length, n); // x is the number of elemet to return
	const len = arr.length;
	const result = new Array(x);
	const taken = [];
	while (x--) {
		let rand = Math.floor(Math.random() * len);
		if (taken.includes(rand)) {
			x++;
			continue;
		}
		taken.push(rand);
		result[x] = arr[rand];
	}
	return result;
}
