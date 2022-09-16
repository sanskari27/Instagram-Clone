import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DPImage, MessageImage } from '../../components/ImageUtils';
import Loading from '../../components/Loading';
import $ from 'jquery';
import Picker from 'emoji-picker-react';
import Axios from '../../Controller/Axios';
import { isOnlyEmojis } from '../../components/TextUtils';
import CLOSE_LIGHT from '../../assets/cross-light.png';
import INFO from '../../assets/info.png';
import INFO_FILLED from '../../assets/info-filled.png';
import EMOJI from '../../assets/emoji.png';
import GALLARY from '../../assets/image-gallery-small.png';
import LIKE from '../../assets/like-outlined.png';
import DELETE from '../../assets/delete.png';

const DIALOG = {
	VIEW_IMAGE: 3,
	DELETE: 2,
	OPEN: 1,
	CLOSE: 0,
};

const MessageType = {
	TEXT: 'text',
	IMAGE: 'image',
	POST: 'post',
	STORY: 'story',
};

export default function ChatBox({ conversationID, setAlert, conversationUpdated, socket }) {
	const navigate = useNavigate();
	const [details, setDetails] = React.useState();
	const [messages, setMesaages] = React.useState([]);
	const [detailsVisible, setDetailsVisible] = React.useState(false);
	const scrollRef = React.useRef();

	React.useEffect(() => {
		socket.current?.emit('messenger-join', conversationID);
		socket.current?.on('messenger-receive', async (data) => {
			setMesaages((prev) => {
				return [...prev, data];
			});
			try {
				await Axios.post('/messenger/seen-all/' + conversationID);
			} catch (e) {}
		});
	}, [conversationID, socket]);

	React.useEffect(() => {
		async function fetchConversation() {
			if (!conversationID) return;
			try {
				const { data } = await Axios.get('/messenger/fetch-conversation/' + conversationID);
				if (data.success) {
					setDetails(data.message);
				}
			} catch (e) {
				if (e.response) {
					setAlert(e.response.data.message);
				} else {
					setAlert('Unable to open Chat Box');
				}
			}
		}
		async function fetchMessages() {
			if (!conversationID) return;
			try {
				const { data } = await Axios.get('/messenger/fetch-messages/' + conversationID);
				if (data.success) {
					setMesaages(data.message);
				}
			} catch (e) {
				if (e.response) {
					setAlert(e.response.data.message);
				} else {
					setAlert('Unable to fetch messages');
				}
			}
		}
		fetchConversation();
		fetchMessages();
		setDetailsVisible(false);
	}, [conversationID, setAlert]);

	React.useEffect(() => {
		scrollRef.current?.scrollIntoView();
	}, [messages]);

	const deleteChat = async (e) => {
		try {
			await Axios.post('/messenger/delete-chat/' + conversationID);
			conversationUpdated();
		} catch (e) {
			if (e.response) {
				setAlert(e.response.data.message);
			} else setAlert('Unable to delete conversation');
		}
	};

	if (!details) return <Loading />;
	if (!detailsVisible) {
		return (
			<>
				<TopBox
					details={details}
					detailsVisible={detailsVisible}
					setDetailsVisible={setDetailsVisible}
				/>
				<div
					id='message-box'
					className='overflow-x-hidden overflow-y-scroll relative mt-2'
					style={{ height: 'calc(100vh - 220px)' }}
				>
					{messages.map((message, index) => {
						const next = index + 1 < messages.length ? messages[index + 1] : null;
						if (message.type === MessageType.TEXT) {
							return (
								<TextMessage
									key={index}
									details={message}
									nextOwned={next ? message.own === next.own : false}
								/>
							);
						} else if (message.type === MessageType.IMAGE) {
							return (
								<ImageMessage
									key={index}
									details={message}
									onLoad={() => {
										scrollRef.current?.scrollIntoView();
									}}
								/>
							);
						} else if (message.type === MessageType.POST) {
							return (
								<PostMessage
									key={index}
									details={message}
									onLoad={() => {
										scrollRef.current?.scrollIntoView();
									}}
								/>
							);
						}
						return <></>;
					})}
					<div ref={scrollRef} />
				</div>
				<MessageBox />
			</>
		);
	} else {
		return (
			<>
				<TopBox
					details={details}
					detailsVisible={detailsVisible}
					setDetailsVisible={setDetailsVisible}
				/>
				<div className='relative mt-6 border-b-[1px] border-zinc-200 dark:border-neutral-500'>
					<span className='px-6 font-medium text-lg text-black/70 dark:text-white/70'>Members</span>
					{details.members?.map((member, index) => (
						<div
							key={index}
							className='px-6 w-full h-[70px] py-2 flex items-center relative overflow-hidden'
						>
							<DPImage src={member.dp} className='w-14 h-14 rounded-full select-none' />
							<div className='w-3/4 flex flex-col justify-center ml-3'>
								<span
									className={`text-black dark:text-white/80 text-sm font-medium leading-4 hover:underline cursor-pointer`}
									onClick={(e) => navigate(`/${member.username}/`)}
								>
									{member.username}
								</span>
								<div className='flex w-full'>
									<span
										className={`max-w-[80%] text-black/60 dark:text-white/50 leading-5 text-sm`}
									>
										{member.name}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>

				{details.members?.length === 1 && (
					<div className='relative py-3 border-b-[1px] border-zinc-200 dark:border-neutral-500'>
						<span
							className='px-6 text-sm text-red-500 cursor-pointer select-none'
							onClick={deleteChat}
						>
							Delete Chat
						</span>
					</div>
				)}
			</>
		);
	}

	function TextMessage({ details, nextOwned }) {
		const [timeVisible, setTimeVisibility] = React.useState(false);
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
		const deleteMessage = async (e) => {
			try {
				await Axios.post('/messenger/delete-message/' + details.id);
				setMesaages((prev) => prev.filter((msg) => msg.id !== details.id));
				conversationUpdated();
			} catch (e) {
				setAlert('Unable to delete message');
			}
		};
		return (
			<>
				<div
					className={`w-full flex my-1 px-4  ${details.own ? 'justify-end ' : 'justify-start'}`}
					onMouseEnter={(e) => setTimeVisibility(true)}
					onMouseLeave={(e) => setTimeVisibility(false)}
				>
					{timeVisible && details.own && (
						<div className='select-none flex items-end text-black/70 dark:text-white/60'>
							<img
								src={DELETE}
								alt=''
								className='w-4 opacity-70 mr-2 cursor-pointer'
								onClick={(e) => openDialog(DIALOG.OPEN)}
							/>
							<span className={`text-xs  mr-2 `}>{details.time}</span>
						</div>
					)}
					<div
						className={`w-fit border  px-4 py-1 flex rounded-t-xl dark:text-white/80 ${
							nextOwned ? 'rounded-b-xl' : details.own ? 'rounded-l-xl ' : 'rounded-r-xl'
						} ${details.own && 'bg-zinc-50 dark:bg-zinc-800'} ${
							isOnlyEmojis(details.text) &&
							'border-0 bg-transparent dark:bg-transparent text-5xl opacity-90 px-0 '
						}`}
					>
						{details.text}
					</div>
					{timeVisible && !details.own && (
						<span
							className={`text-xs select-none items-end text-black/70 dark:text-white/60 ml-2 flex`}
						>
							{details.time}
						</span>
					)}
				</div>
				{dialog === DIALOG.OPEN && (
					<DeleteMessage onClick={deleteMessage} openDialog={openDialog} />
				)}
			</>
		);
	}

	function ImageMessage({ details, onLoad }) {
		const [timeVisible, setTimeVisibility] = React.useState(false);
		const [dialog, openDialog] = React.useState(DIALOG.CLOSE);
		const deleteMessage = async (e) => {
			try {
				await Axios.post('/messenger/delete-message/' + details.id);
				setMesaages((prev) => prev.filter((msg) => msg.id !== details.id));
				conversationUpdated();
			} catch (e) {
				setAlert('Unable to delete message');
			}
		};
		return (
			<>
				<div
					className={`w-full flex my-1 px-4  ${details.own ? 'justify-end ' : 'justify-start'}`}
					onMouseEnter={(e) => setTimeVisibility(true)}
					onMouseLeave={(e) => setTimeVisibility(false)}
				>
					{timeVisible && details.own && (
						<div className='select-none flex items-end text-black/70 dark:text-white/60 '>
							<img
								src={DELETE}
								alt=''
								className='w-4 opacity-70 mr-2 cursor-pointer'
								onClick={(e) => openDialog(DIALOG.DELETE)}
							/>
							<span className={`text-xs  mr-2 `}>{details.time}</span>
						</div>
					)}
					<div className={`w-fit flex  rounded-xl max-w-[70%] overflow-hidden`}>
						<MessageImage
							src={details.text}
							onLoad={onLoad}
							onClick={(e) => openDialog(DIALOG.VIEW_IMAGE)}
						/>
					</div>
					{timeVisible && !details.own && (
						<span
							className={`text-xs select-none items-end text-black/70 dark:text-white/60 ml-2 flex`}
						>
							{details.time}
						</span>
					)}
				</div>
				{dialog === DIALOG.DELETE && (
					<DeleteMessage onDelete={deleteMessage} openDialog={openDialog} />
				)}
				{dialog === DIALOG.VIEW_IMAGE && (
					<ViewImage imageID={details.text} openDialog={openDialog} />
				)}
			</>
		);
	}

	function PostMessage({ details, onLoad }) {
		const [timeVisible, setTimeVisibility] = React.useState(false);
		const [dialog, openDialog] = React.useState(DIALOG.CLOSE);
		const deleteMessage = async (e) => {
			try {
				await Axios.post('/messenger/delete-message/' + details.id);
				setMesaages((prev) => prev.filter((msg) => msg.id !== details.id));
				conversationUpdated();
			} catch (e) {
				setAlert('Unable to delete message');
			}
		};
		return (
			<>
				<div
					className={`w-full flex my-1 px-4  ${details.own ? 'justify-end ' : 'justify-start'}`}
					onMouseEnter={(e) => setTimeVisibility(true)}
					onMouseLeave={(e) => setTimeVisibility(false)}
				>
					{timeVisible && details.own && (
						<div className='select-none flex items-end text-black/70 dark:text-white/60 '>
							<img
								src={DELETE}
								alt=''
								className='w-4 opacity-70 mr-2 cursor-pointer'
								onClick={(e) => openDialog(DIALOG.DELETE)}
							/>
							<span className={`text-xs  mr-2 `}>{details.time}</span>
						</div>
					)}
					<div
						className={`w-fit flex flex-col rounded-xl max-w-[70%] overflow-hidden bg-zinc-150 dark:bg-neutral-800 cursor-pointer`}
						onClick={(e) => navigate(`/p/${details.post.shared_id}/`)}
					>
						<div className='p-2 flex items-center'>
							<DPImage src={details.post.dp} className='w-9' />
							<span className='text-sm text-primary ml-2'>{details.post.username}</span>
						</div>
						<MessageImage src={details.post.src} onLoad={onLoad} />

						<div className='p-3 flex items-center text-xs text-ellipsis overflow-hidden whitespace-nowrap dark:text-white/80'>
							<div className='text-sm font-medium inline-block mr-2 cursor-pointer dark:text-white'>
								{details.post.username}
							</div>
							{details.post.caption?.substring(0, Math.min(50, details.post.caption.length - 1))}
							{details.post.caption?.length > 40 ? '...' : ''}
						</div>
					</div>
					{timeVisible && !details.own && (
						<span
							className={`text-xs select-none items-end text-black/70 dark:text-white/60 ml-2 flex`}
						>
							{details.time}
						</span>
					)}
				</div>
				{dialog === DIALOG.DELETE && (
					<DeleteMessage onDelete={deleteMessage} openDialog={openDialog} />
				)}
			</>
		);
	}

	function MessageBox() {
		const [emojiSelectorVisible, setEmojiSelectorVisible] = React.useState(false);
		const [message, setMessage] = React.useState('');

		React.useEffect(() => {
			$('#create-message').on('input', function () {
				this.style.height = 'auto';

				if (this.scrollHeight > 160) {
					this.style.height = '160px';
					$('#message-box').css({ height: `calc(100vh - ${360}px)` });
				} else {
					this.style.height = this.scrollHeight + 'px';
					$('#message-box').css({ height: `calc(100vh - ${200 + this.scrollHeight}px)` });
				}
			});
		}, []);

		const onEmojiClick = (event, emojiObject) => {
			setMessage((prev) => prev + emojiObject.emoji);
		};

		const sendTextMessage = async (message) => {
			try {
				const { data } = await Axios.post('/messenger/create-text-message', {
					conversation_id: conversationID,
					message: message,
				});
				if (data.success) {
					setMesaages((prev) => {
						return [...prev, data.message];
					});
					socket.current?.emit('messenger-send', data.message);
					conversationUpdated();
				}
			} catch (e) {
				if (e.response) {
					setAlert(e.response.data.message);
				} else {
					setAlert('Unable to send message');
				}
			}
		};

		async function handleImageUpload(e) {
			const file = e.target.files[0];

			if (!file) return;

			if (file['type'].split('/')[0] !== 'image') {
				return setAlert('Invalid Image File');
			}

			const formdata = new FormData();
			formdata.append('file', file, file.name);
			formdata.append('conversation_id', conversationID);
			try {
				const { data } = await Axios.post('/messenger/create-image-message', formdata);
				if (data.success) {
					setMesaages((prev) => {
						return [...prev, data.message];
					});
					socket.current?.emit('messenger-send', data.message);
					conversationUpdated();
				}
			} catch (err) {
				setAlert('Upload failed. Please try again later');
			}
		}

		return (
			<div className='w-full min-h-[60px]  flex-center px-4 '>
				<div className='w-full py-[10px] rounded-2xl border flex items-end px-3'>
					<img
						id='emoji-picker-btn'
						src={EMOJI}
						alt=''
						className='w-6 h-6 cursor-pointer select-none dark:invert'
						onClick={(e) => {
							if (!emojiSelectorVisible) {
								setEmojiSelectorVisible(true);
								setTimeout(() => {
									$('.emoji-picker').toggleClass('opacity-0 hidden');
								}, 500);
							} else $('.emoji-picker').toggleClass('opacity-0 hidden');
						}}
					/>
					<textarea
						className='w-full h-full mx-4 resize-none outline-none word text-sm bg-transparent dark:text-white'
						type='text'
						id='create-message'
						autoFocus
						value={message}
						onChange={(e) => {
							setMessage(e.target.value);
						}}
						onKeyDown={async (e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								$('#create-message').css({ height: `100%` });
								$('#message-box').css({ height: `calc(100vh - 220px)` });
								sendTextMessage(message);
								setMessage('');
							}
						}}
						rows={1}
						placeholder='Message...'
					/>
					<div className='flex min-w-[60px] mr-1 justify-between items-center'>
						<label htmlFor='upload-button' className=' w-6 h-6 '>
							<img src={GALLARY} alt='' className=' cursor-pointer select-none dark:invert' />
						</label>

						<img
							src={LIKE}
							alt=''
							className='w-6 h-6  cursor-pointer select-none dark:invert'
							onClick={(e) => {
								sendTextMessage('❤️');
							}}
						/>
					</div>

					<input
						type='file'
						id='upload-button'
						style={{ display: 'none' }}
						accept='image/*'
						onChange={handleImageUpload}
					/>
					{emojiSelectorVisible && (
						<div
							id='emoji-picker'
							className='emoji-picker absolute bottom-12 opacity-0 hidden transition-all'
						>
							<Picker
								disableSearchBar={true}
								disableSkinTonePicker={true}
								disableAutoFocus={true}
								onEmojiClick={onEmojiClick}
							/>
						</div>
					)}
				</div>
			</div>
		);
	}
}

function TopBox({ details, detailsVisible, setDetailsVisible }) {
	const navigate = useNavigate();
	return (
		<div className='h-[60px]  bg-white dark:bg-neutral-900 flex sm:justify-between justify-center items-center   border-b-[1px] dark:border-neutral-500 p-4'>
			{!detailsVisible && (
				<div className='flex items-center overflow-hidden select-none'>
					<DPImage
						src={details.dp}
						className='w-8 h-8 rounded-full select-none cursor-pointer'
						onClick={(e) => navigate(`/${details.members[0]?.username}/`)}
					/>
					<span
						className='font-medium text-black/80 dark:text-white/80 sm:block hidden ml-2 cursor-pointer'
						onClick={(e) => navigate(`/${details.members[0]?.username}/`)}
					>
						{details.title}
					</span>
				</div>
			)}
			{detailsVisible && (
				<div className=' w-full flex items-center overflow-hidden select-none'>
					<span className='w-full text-center font-medium text-black/80 dark:text-white/60 sm:block hidden ml-2  '>
						Details
					</span>
				</div>
			)}
			<img
				src={detailsVisible ? INFO_FILLED : INFO}
				alt=''
				className='w-6 sm:block hidden cursor-pointer dark:invert'
				onClick={(e) => setDetailsVisible((prev) => !prev)}
			/>
		</div>
	);
}

function DeleteMessage({ onDelete, openDialog }) {
	const navigate = useNavigate();

	React.useEffect(() => {
		$('.dialog-wrapper').toggleClass('opacity-0');
	}, []);

	React.useEffect(() => {
		$('.dialog-wrapper').on('click', function (e) {
			if ($(e.target).closest('.dialog').length === 0) {
				openDialog(DIALOG.CLOSE);
			}
		});
	}, [openDialog, navigate]);

	return (
		<>
			<div>
				<div className='dialog-wrapper w-screen h-screen z-20 fixed left-0 top-0 flex-center bg-black/50 opacity-0 transition-all'>
					<div className='dialog w-[400px] h-fit flex-center flex-col rounded-[12px] bg-white overflow-hidden max-70vh'>
						<span className='mt-6 text-xl font-medium'>Unsend Message?</span>
						<span className='mt-3 w-3/4 text-sm text-center tracking-wide '>
							Unsending will remove the message for everyone. People may have seen it already.
						</span>
						<div
							className='w-full mt-4 p-3 flex-center text-sm font-semibold text-red-500 cursor-pointer border-t-[1px] hover:bg-zinc-100'
							onClick={onDelete}
						>
							Delete
						</div>
						<div
							className='w-full p-3 border-t-[1px] flex-center text-sm font-light cursor-pointer hover:bg-zinc-100'
							onClick={(e) => openDialog(DIALOG.NONE)}
						>
							Cancel
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function ViewImage({ imageID, openDialog }) {
	const navigate = useNavigate();

	React.useEffect(() => {
		$('.dialog-wrapper').toggleClass('opacity-0');
	}, []);

	React.useEffect(() => {
		$('.dialog-wrapper').on('click', function (e) {
			if ($(e.target).closest('.dialog').length === 0) {
				openDialog(DIALOG.CLOSE);
			}
		});
	}, [openDialog, navigate]);

	return (
		<>
			<div className='dialog-wrapper w-screen h-screen z-20 fixed left-0 top-0 flex-center bg-black/50 opacity-0 transition-all'>
				<div className='dialog max-w-[80%] h-fit flex-center flex-col rounded-[12px] bg-white overflow-hidden max-70vh'>
					<img
						src={CLOSE_LIGHT}
						alt=''
						className='absolute w-5 right-6 top-6 cursor-pointer'
						onClick={(e) => openDialog(DIALOG.CLOSE)}
					/>
					<MessageImage src={imageID} className='object-scale-down' />
				</div>
			</div>
		</>
	);
}
