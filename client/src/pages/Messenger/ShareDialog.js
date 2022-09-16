import React from 'react';
import $ from 'jquery';
import Axios from '../../Controller/Axios';
import { DPImage } from '../../components/ImageUtils';
import { getProfile } from '../../Controller/User';
import Loading from '../../components/Loading';
import CLOSE from '../../assets/cross-dark.png';
import CLOSE_BLUE from '../../assets/cross-blue.png';
import CHECK from '../../assets/check-light.png';

export default function ShareDialog({ post, onClose, setAlert }) {
	const [selected, setSelected] = React.useState([]);
	const [search, setSearch] = React.useState('');
	const [results, setResults] = React.useState([]);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		$('.dialog-wrapper').toggleClass('opacity-0');
	}, []);
	React.useEffect(() => {
		$('.dialog-wrapper').on('click', function (e) {
			if ($(e.target).closest('.dialog').length === 0) {
				onClose();
			}
		});
	}, [onClose]);

	React.useEffect(() => {
		async function searchUsers(search) {
			setLoading(true);
			try {
				const { data } = await Axios.get('/explore/search/' + search);
				if (data.success) {
					setResults(data.message.filter((u) => u.username !== getProfile().username));
				}
			} catch (e) {
				setResults([]);
			}
			setLoading(false);
		}
		async function searchSuggestions() {
			setLoading(true);
			try {
				const { data } = await Axios.get('/messenger/search-message-suggestion');
				if (data.success) {
					setResults(data.message.filter((u) => u.username !== getProfile().username));
				}
			} catch (e) {
				setResults([]);
			}
			setLoading(false);
		}

		if (!search) {
			return searchSuggestions();
		} else {
			setResults([]);
			setLoading(true);
		}

		const delayDebounceFn = setTimeout(() => {
			if (!search) {
				return searchSuggestions();
			}
			searchUsers(search);
		}, 1000);
		return () => clearTimeout(delayDebounceFn);
	}, [search]);

	React.useEffect(() => {
		if (selected.length > 0) {
			const e = document.getElementById('create-conversation-search');
			if (e) e.scrollIntoView();
		}
	}, [selected]);

	const sendHandler = async () => {
		if (selected.length === 0) return;
		try {
			await Axios.post('/messenger/send-post', { post: post.shared_id, users: selected });
			onClose();
		} catch (e) {
			onClose();
			if (e.response) {
				setAlert(e.response.data.message);
			} else {
				setAlert('Unable to send post.');
			}
		}
	};

	return (
		<div className='dialog-wrapper w-screen h-screen z-20 fixed left-0 top-0 flex-center bg-black/50 opacity-0 transition-all'>
			<div className='dialog w-[480px] h-fit flex flex-col rounded-[12px] bg-white overflow-hidden max-70vh grow-in'>
				<div className='flex-center relative h-[40px] border-b-[1px]'>
					<span className='font-medium'>Share</span>
					<img
						src={CLOSE}
						alt=''
						className='w-9 h-9 absolute right-3  cursor-pointer'
						onClick={onClose}
					/>
				</div>
				<div className='w-full h-fit  max-h-[250px] overflow-x-hidden overflow-y-scroll p-2 flex  relative  border-b-[1px] border-zinc-200'>
					<span className='font-medium tracking-wide w-fit text-center '>To:</span>
					<div className=' overflow-x-hidden overflow-y-scroll w-full'>
						<div className='px-2 w-full flex flex-wrap  gap-1'>
							{selected.map((username, index) => (
								<Selected username={username} key={index} />
							))}
						</div>
						<div className='flex w-full h-7 items-center' id='create-conversation-search'>
							<input
								type='text'
								className='px-2 outline-none w-full  text-sm block'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder='Search...'
							/>
						</div>
					</div>
				</div>
				<div className='w-full h-fit min-h-[250px] overflow-x-hidden overflow-y-scroll p-2 flex flex-col relative  border-b-[1px] border-zinc-200'>
					{!loading && !search && (
						<div className='flex  font-medium text-sm'>
							<span>Suggested</span>
						</div>
					)}
					{results.map((details, index) => (
						<SearchRow key={index} details={details} isRecent={!search} />
					))}
					{results.length === 0 && !loading && search && (
						<div className='flex-center text-black/70 text-sm font-medium'>No results found.</div>
					)}
					{loading && <Loading />}
				</div>
				<div className='w-full py-2 px-4'>
					<div
						className={`w-full py-2 px-4 bg-primary text-center rounded-md font-medium text-white  ${
							selected.length === 0 ? 'opacity-50' : 'cursor-pointer'
						}`}
						onClick={sendHandler}
					>
						Send
					</div>
				</div>
			</div>
		</div>
	);

	function Selected({ username }) {
		return (
			<div className='w-fit p-2 bg-primary/20 rounded-md flex justify-between items-center'>
				<span className='text-primary text-sm'>{username}</span>
				<div className='w-4 h-4 ml-2 '>
					<img
						src={CLOSE_BLUE}
						alt=''
						className='w-4 h-4 cursor-pointer'
						onClick={(e) => {
							setSelected((prev) => prev.filter((u) => u !== username));
						}}
					/>
				</div>
			</div>
		);
	}

	function SearchRow({ details }) {
		return (
			<div
				className='flex cursor-pointer items-center justify-between  my-2 mx-2'
				onClick={(e) => {
					setSelected((prev) => {
						if (prev.includes(details.username)) {
							return prev.filter((u) => u !== details.username);
						} else {
							return [...prev, details.username];
						}
					});
					setSearch('');
				}}
			>
				<DPImage src={details.dp} className='w-10 h-10 rounded-full select-none' />
				<div className='w-3/4 flex flex-col justify-center ml-3'>
					<span className='text-black  leading-5 font-medium text-sm text-emphasis line-clamp-1'>
						{details.username}
					</span>
					<span className='text-black/80 leading-5 text-sm text-emphasis line-clamp-1'>
						{details.name}
					</span>
				</div>
				{selected.includes(details.username) ? (
					<img src={CHECK} alt='' className='w-6 p-1 rounded-full bg-primary float' />
				) : (
					<span className='w-6 h-6 p-1 rounded-full border-2 border-black float'></span>
				)}
			</div>
		);
	}
}
