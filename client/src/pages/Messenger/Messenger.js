import React from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../../Controller/User';
import { DPImage } from '../../components/ImageUtils';
import Loading from '../../components/Loading';
import Axios from '../../Controller/Axios';
import ChatBox from './ChatBox';
import CREATE from '../../assets/create_message.png';
import CLOSE from '../../assets/cross-dark.png';
import CLOSE_BLUE from '../../assets/cross-blue.png';
import START_CONVERSATION from '../../assets/messenger-outlined.png';
import CHECK from '../../assets/check-light.png';

const DIALOG = {
	VIEW_IMAGE: 3,
	DELETE: 2,
	OPEN: 1,
	CLOSE: 0,
};

export default function Messenger({ setTitle, setAlert, data }) {
	const navigate = useNavigate();
	const [conversations, setConversations] = React.useState([]);
	const [conversationID, setConversationId] = React.useState(null);
	const socket = React.useRef();
	const mounted = React.useRef(false);
	const [dialog, openDialog] = React.useState(DIALOG.CLOSE);
	const windowOffset = React.useRef(0);

	React.useEffect(() => {
		if (dialog === DIALOG.CLOSE) {
			document.body.setAttribute('style', '');
			window.scrollTo(0, windowOffset.current);
		} else {
			windowOffset.current = window.scrollY;
			document.body.setAttribute(
				'style',
				`position:fixed; top: -${windowOffset.current}px; left: 0;right:0 `
			);
		}
	}, [dialog]);
	React.useEffect(() => {
		mounted.current = true;
		return () => (mounted.current = false);
	});
	const conversationListUpdated = React.useCallback(async () => {
		try {
			const { data } = await Axios.get('/messenger/conversations');
			if (mounted.current) {
				setConversations(data.message);
			}
		} catch (e) {
			if (e.response) {
				setAlert(e.response.data.message);
			} else {
				setAlert('Unable to fetch conversations list');
			}
		}
	}, [setAlert]);

	React.useEffect(() => {
		socket.current = io('ws://localhost:8900');
		socket.current?.emit('messenger-connect', getProfile().username);
		return () => socket.current?.close();
	}, []);
	React.useEffect(() => {
		socket.current?.on('messenger-update', () => conversationListUpdated());
		return () => socket.current?.close();
	}, [conversationListUpdated]);

	React.useEffect(() => {
		async function fetchConversation(username) {
			if (!username) return;
			try {
				const { data } = await Axios.get('/messenger/find-conversation/' + username);
				if (data.success) {
					navigate('/direct/t/' + data.message);
				}
			} catch (e) {
				if (e.response) {
					setAlert(e.response.data.message);
				} else {
					setAlert('Unable to fetch conversations list');
				}
			}
		}

		if (data[1] === 'inbox') {
			setTitle('Inbox');
			setConversationId(null);
		} else if (data[1] === 'u') {
			fetchConversation(data[2]);
		} else if (data[1] === 't') {
			setConversationId(data[2]);
		}
		conversationListUpdated();
	}, [setAlert, setTitle, data, navigate, conversationListUpdated]);

	React.useEffect(() => {
		if (!conversationID) return setTitle('Inbox');
		if (conversations.length > 0) {
			const conversation = conversations.find((c) => c.id === conversationID);
			if (conversation) {
				setTitle(`Chat (@${conversation.title})`);
			} else {
				navigate('/direct/inbox/');
			}
		}
	}, [conversationID, setTitle, conversations, navigate]);

	return (
		<>
			<div className='min-w-screen min-h-screen flex-center  padding-app overflow-hidden'>
				<div className='flex w-full relative  rounded-md border  border-zinc-200 dark:border-none bg-white dark:bg-neutral-900  overflow-hidden '>
					<div className='w-[300px]'>
						<div className='h-[60px] w-[300px] bg-white dark:bg-neutral-900 flex-center relative border-b-[1px] dark:border-neutral-500'>
							<span className='font-medium dark:text-white'>{getProfile().username}</span>
							<div className='flex-center'>
								<img
									src={CREATE}
									alt=''
									className='w-6 absolute right-3 cursor-pointer dark:invert'
									onClick={(e) => openDialog(DIALOG.OPEN)}
								/>
							</div>
						</div>
						<div
							className='overflow-x-hidden overflow-y-scroll '
							style={{ height: 'calc(100vh - 160px)' }}
						>
							{conversations.map((conversation, index) => (
								<ConversationRow
									details={conversation}
									key={index}
									selected={conversationID === conversation.id}
								/>
							))}
						</div>
					</div>
					<div className='flex-grow min-w-[100px] border-l-[1px] dark:border-neutral-500'>
						{!conversationID && <SelectConversation openDialog={openDialog} />}
						{conversationID && (
							<ChatBox
								conversationID={conversationID}
								setAlert={setAlert}
								conversationUpdated={conversationListUpdated}
								socket={socket}
							/>
						)}
					</div>
				</div>
			</div>
			{dialog === DIALOG.OPEN && (
				<StartConversation
					openDialog={openDialog}
					setAlert={setAlert}
					onUpdate={conversationListUpdated}
				/>
			)}
		</>
	);
}

function ConversationRow({ details, selected }) {
	const navigate = useNavigate();
	return (
		<div
			className={`w-full h-[70px] px-4 py-2 flex-center relative overflow-hidden cursor-pointer ${
				selected && 'bg-zinc-100 cursor-text dark:bg-neutral-700'
			}`}
			onClick={(e) => {
				if (!selected) navigate(`/direct/t/${details.id}/`);
			}}
		>
			<DPImage src={details.dp} className='w-14 h-14 rounded-full select-none' />
			<div className='w-3/4 flex flex-col justify-center ml-3'>
				<span
					className={`text-black/90  leading-4 text-sm  text-emphasis line-clamp-1 ${
						details.unseen && !selected
							? 'text-black font-medium dark:text-white'
							: 'text-black/70 dark:text-white/70'
					}`}
				>
					{details.title}
				</span>
				{details.text && (
					<div className='flex w-full text-sm  '>
						<span
							className={`max-w-[80%] text-light text-emphasis line-clamp-1  leading-5  ${
								details.unseen && !selected
									? 'text-black font-medium dark:text-white'
									: 'text-black/70 dark:text-white/60'
							}`}
						>
							{details.text}
						</span>
						<span className='text-black/60  dark:text-white/50'>{' · ' + details.time}</span>
					</div>
				)}
			</div>
		</div>
	);
}

function StartConversation({ openDialog, setAlert, onUpdate }) {
	const [selected, setSelected] = React.useState([]);
	const [search, setSearch] = React.useState('');
	const [results, setResults] = React.useState([]);
	const [loading, setLoading] = React.useState(false);

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

	const createConversationHandler = async (e) => {
		if (selected.length === 0) return;
		setLoading(true);
		try {
			await Axios.post('/messenger/create-conversation', { users: selected });
			onUpdate();
		} catch (e) {
			if (e.response) {
				setAlert(e.response.data.message);
			}
			setAlert('Unable to start conversation. Please try again.');
		}
		setLoading(false);
		openDialog(DIALOG.CLOSE);
	};

	return (
		<div className='dialog-wrapper w-screen h-screen z-20 fixed top-0 flex-center bg-black/80 '>
			<div className='dialog w-[400px] h-fit flex flex-col rounded-[12px] bg-white dark:bg-neutral-900 overflow-hidden max-70vh grow-in'>
				<div className='w-full h-fit py-2 px-4 flex relative items-center justify-between select-none  border-b-[1px] border-zinc-200 dark:border-neutral-500'>
					<img
						src={CLOSE}
						alt=''
						className='w-8 dark:invert'
						onClick={(e) => openDialog(DIALOG.CLOSE)}
					/>
					<span className='font-medium tracking-wide  text-center dark:text-white'>
						New Message
					</span>
					<span
						className={`font-medium tracking-wide text-center  ${
							selected.length === 0 ? 'text-primary/60 ' : 'text-primary cursor-pointer'
						}`}
						onClick={createConversationHandler}
					>
						Next
					</span>
				</div>
				<div className='w-full h-fit  max-h-[250px] overflow-x-hidden overflow-y-scroll p-2 flex  relative  border-b-[1px] border-zinc-200 dark:border-neutral-500'>
					<span className='font-medium tracking-wide w-fit text-center dark:text-white'>To:</span>
					<div className=' overflow-x-hidden overflow-y-scroll w-full'>
						<div className='px-2 w-full flex flex-wrap  gap-1'>
							{selected.map((username, index) => (
								<Selected username={username} key={index} />
							))}
						</div>
						<div className='flex w-full h-7 items-center' id='create-conversation-search'>
							<input
								type='text'
								className='px-2 outline-none w-full  text-sm block dark:bg-neutral-900 dark:text-white/80'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder='Search...'
							/>
						</div>
					</div>
				</div>
				<div className='w-full h-fit min-h-[200px] overflow-x-hidden overflow-y-scroll p-2 flex flex-col relative  border-b-[1px] border-zinc-200 dark:border-neutral-500'>
					{!loading && !search && (
						<div className='flex  font-medium text-sm dark:text-white/70'>
							<span>Suggested</span>
						</div>
					)}
					{results.map((details, index) => (
						<SearchRow key={index} details={details} isRecent={!search} />
					))}
					{results.length === 0 && !loading && search && (
						<div className='flex-center text-black/70 dark:text-white/70 text-sm font-medium'>
							No results found.
						</div>
					)}
					{loading && <Loading />}
				</div>
			</div>
		</div>
	);

	function Selected({ username }) {
		return (
			<div className='w-fit p-2 bg-primary/20  rounded-md flex justify-between items-center'>
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
					<span className='text-black dark:text-white/80 leading-5 font-medium text-sm text-emphasis line-clamp-1'>
						{details.username}
					</span>
					<span className='text-black/80 dark:text-white/60 leading-5 text-sm text-emphasis line-clamp-1'>
						{details.name}
					</span>
				</div>
				{selected.includes(details.username) ? (
					<img src={CHECK} alt='' className='w-6 p-1 rounded-full bg-primary float' />
				) : (
					<span className='w-6 h-6 p-1 rounded-full border-2 border-black dark:border-white float'></span>
				)}
			</div>
		);
	}
}

function SelectConversation({ openDialog }) {
	return (
		<div className='h-full flex-center flex-col select-none'>
			<div className='w-28 rounded-full  p-4 relative'>
				<img className='w-20 dark:invert' alt='' src={START_CONVERSATION} />
			</div>
			<span className='font-light text-2xl mt-3 text-black/80 dark:text-white/80'>
				Your Messages
			</span>
			<span className='font-medium  mt-1 text-black/50 dark:text-white/50'>
				Send private photos and messages to a friend or group.
			</span>
			<span
				className='font-medium text-sm bg-primary px-3 py-1  rounded-md cursor-pointer mt-3 text-white'
				onClick={(e) => openDialog(DIALOG.OPEN)}
			>
				Send Message
			</span>
		</div>
	);
}
