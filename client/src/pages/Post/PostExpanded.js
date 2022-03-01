import React from 'react';
import $ from 'jquery';
import { useNavigate } from 'react-router-dom';
import Picker from 'emoji-picker-react';
import Axios from '../../Controller/Axios';
import { DPImage, PostImage } from '../../components/ImageUtils';
import ShareDialog from '../Messenger/ShareDialog';
import EMOJI from '../../assets/emoji.png';
import MENU from '../../assets/menu.png';
import SHARE from '../../assets/share.png';
import CLOSE from '../../assets/cross-dark.png';
import LIKE_OUTLINED from '../../assets/like-outlined.png';
import SAVED_OUTLINED from '../../assets/saved-outlined.png';
import LIKE_FILLED from '../../assets/like-filled.png';
import LIKE_FILLED_LIGHT from '../../assets/like-filled-light.png';
import SAVED_FILLED from '../../assets/saved-filled.png';
import { getProfile } from '../../Controller/User';

const DIALOG = {
	CLOSE: 0,
	OPEN: 1,
	SHARE: 2,
};
const OPTIONS = {
	LIKE: 0,
	COMMENT: 1,
	SHARE: 2,
	SAVED: 3,
	RELIKE: 4,
	COMMENT_UPDATED: 5,
};

export default function PostExpanded({ id, setAlert, setTitle }) {
	const ref = React.useRef();
	const postImg = React.useRef();
	const likeRef = React.useRef();
	const windowOffset = React.useRef(0);
	const [dialog, openDialog] = React.useState(DIALOG.CLOSE);
	const [comments, setComments] = React.useState([]);
	const [replyTo, setReplyTo] = React.useState({ username: '', id: '' });
	const [post, setPost] = React.useState({
		hasStories: false,
		storiesSeen: false,
		dp: '',
		username: '',
		name: '',
		filename: '',
		caption: '',
		liked: false,
		time: '',
		shared_id: '',
		likes: [],
		comments: [],
	});

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
		async function fetchPost() {
			if (typeof id === 'object') return;
			try {
				const { data } = await Axios.get('/post/get-post/' + id);
				if (data.success) {
					$(ref.current).removeClass('hidden');
					setPost(data.message);

					if (data.message.caption) {
						setTitle(`${data.message.username} on Instagram-Clone "${data.message.caption}"`);
					} else setTitle(`${data.message.username} on Instagram-Clone`);

					const { data: comments } = await Axios.get('/post/get-comments/' + id);
					if (comments.success) {
						setComments(comments.message);
					}
					return;
				}
			} catch (err) {}
			$(ref.current).remove();
		}

		$(ref.current).addClass('hidden');
		fetchPost();
	}, [id, setTitle]);

	const handleOptionsClick = async (optionClicked) => {
		if (optionClicked === OPTIONS.LIKE) {
			const like = $(likeRef.current);
			if (like.hasClass('scale-0') && !post.liked) {
				$(likeRef.current).toggleClass('grow-in scale-0');
				setTimeout(() => {
					$(likeRef.current).toggleClass('grow-in scale-0');
				}, 1500);
			}
			setPost((prev) => {
				return { ...prev, liked: !prev.liked };
			});

			try {
				await Axios.post('/post/like-post/' + post.shared_id);
				const { data } = await Axios.get('/post/get-post/' + id);
				if (data.success) {
					setPost(data.message);
				} else {
					$(ref.current).remove();
				}
			} catch (err) {}
		}
		if (optionClicked === OPTIONS.RELIKE) {
			const like = $(likeRef.current);
			if (like.hasClass('scale-0')) {
				$(likeRef.current).toggleClass('grow-in scale-0');
				setTimeout(() => {
					$(likeRef.current).toggleClass('grow-in scale-0');
				}, 1500);
			}
			if (!post.liked) {
				setPost((prev) => {
					return { ...prev, liked: true };
				});
				try {
					await Axios.post('/post/like-post/' + post.shared_id);
					const { data } = await Axios.get('/post/get-post/' + id);
					if (data.success) {
						setPost(data.message);
					} else {
						$(ref.current).remove();
					}
				} catch (err) {}
			}
		}

		if (optionClicked === OPTIONS.SAVED) {
			setPost((prev) => {
				return { ...prev, saved: !prev.saved };
			});

			try {
				await Axios.post('/post/save-post/' + post.shared_id);
				const { data } = await Axios.get('/post/get-post/' + id);
				if (data.success) {
					setPost(data.message);
				}
			} catch (err) {}
		}
		if (optionClicked === OPTIONS.SHARE) {
		}
		if (optionClicked === OPTIONS.COMMENT_UPDATED) {
			try {
				const { data } = await Axios.get('/post/get-comments/' + id);
				if (data.success) {
					setComments(data.message);
				}
			} catch (err) {}
		}
	};
	return (
		<div className='w-full h-full flex-center pt-20 pb-24 padding-app '>
			<div
				ref={ref}
				className=' w-full relative flex flex-col md:flex-row rounded-md border border-zinc-200 dark:border-none bg-white dark:bg-neutral-900 overflow-hidden '
			>
				<div
					ref={postImg}
					className='w-full md:w-2/3 flex flex-col relative bg-zinc-100 dark:bg-neutral-700'
				>
					<TopBox className='md:hidden p-1 px-2' post={post} openDialog={openDialog} />
					<PostImage src={post.filename} className='w-full object-contain' />
					<div
						className='w-full h-full absolute flex-center select-none'
						onClick={(e) => {
							if (e.detail === 2) {
								handleOptionsClick(OPTIONS.RELIKE);
							}
						}}
					>
						<img
							ref={likeRef}
							src={LIKE_FILLED_LIGHT}
							alt=''
							className='w-20 scale-0 transition-all select-none'
						/>
					</div>
				</div>
				<div className='w-full md:w-1/3 flex justify-between flex-col relative dark:bg-neutral-800'>
					<TopBox post={post} openDialog={openDialog} className='hidden md:flex' />
					<div
						className='w-full hidden md:flex flex-col px-4 py-2 absolute top-[60px] border-none overflow-y-scroll '
						style={{ height: 'calc(100% - 210px)' }}
					>
						{comments.map((comment, index) => (
							<Comment
								key={index}
								id={comment}
								replyID={comment}
								setReplyTo={setReplyTo}
								post_id={id}
							/>
						))}
					</div>
					<BottomBox
						post={post}
						optionClicked={handleOptionsClick}
						setAlert={setAlert}
						replyTo={replyTo}
						setReplyTo={setReplyTo}
					/>
				</div>
			</div>
			{dialog === DIALOG.OPEN && <Dialog openDialog={openDialog} setAlert={setAlert} post={post} />}
			{dialog === DIALOG.SHARE && (
				<ShareDialog post={post} onClose={(e) => openDialog(DIALOG.CLOSE)} setAlert={setAlert} />
			)}
		</div>
	);
}

function TopBox({ className, post, openDialog }) {
	const navigate = useNavigate();
	return (
		<div
			className={`w-full p-3 border-b-[1px] dark:border-neutral-500 flex items-center bg-white dark:bg-neutral-900 ${className}`}
		>
			<div
				className={`rounded-full flex-center select-none cursor-pointer ${
					post.hasStories &&
					(post.storiesSeen ? 'border-zinc-200 border-[1.5px]' : 'gradient-border p-[1px] ')
				}`}
				onClick={(e) => navigate('/' + post.username + '/')}
			>
				<DPImage
					src={post.dp}
					className={`w-12 rounded-full bg-white  ${
						!post.storiesSeen && post.hasStories && 'p-[1px]'
					}`}
				/>
			</div>
			<div className='w-full ml-2 mr-5 font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap'>
				<span
					className='cursor-pointer dark:text-white/90'
					onClick={(e) => navigate('/' + post.username + '/')}
				>
					{post.username}
				</span>
			</div>
			<div onClick={(e) => openDialog(DIALOG.OPEN)}>
				<img src={MENU} alt='' className='w-6 cursor-pointer dark:invert' />
			</div>
		</div>
	);
}

function BottomBox({ className, post, optionClicked, setAlert, replyTo, setReplyTo }) {
	const navigate = useNavigate();
	return (
		<div
			className={`w-full flex flex-col items-center border-t-[1px] dark:border-neutral-500 z-10 bg-white dark:bg-neutral-900 ${className}`}
		>
			<div className='w-full p-3  flex items-center'>
				<div className='w-full flex justify-between '>
					<div className='flex justify-between w-[60px]'>
						<Option
							src={post.liked ? LIKE_FILLED : LIKE_OUTLINED}
							className={`${!post.liked && 'dark:invert'}`}
							option={OPTIONS.LIKE}
						/>
						<Option src={SHARE} option={OPTIONS.SHARE} className='dark:invert' />
					</div>
					<div className='flex w-fit'>
						<Option
							src={post.saved ? SAVED_FILLED : SAVED_OUTLINED}
							className='dark:invert'
							option={OPTIONS.SAVED}
						/>
					</div>
				</div>
			</div>
			<div className='w-full flex flex-col px-3 '>
				<div className='w-full text-sm font-medium tracking-wider dark:text-white/70'>
					{post.likes.length > 0 && post.likes.length + ' likes'}
				</div>
				<div
					className='w-full mt-1 text-sm text-ellipsis overflow-hidden whitespace-nowrap dark:text-white/70'
					onClick={(e) => {
						$(e.target).toggleClass('whitespace-nowrap');
					}}
				>
					<div
						className='text-sm font-medium inline-block mr-2 cursor-pointer dark:text-white'
						onClick={(e) => navigate('/' + post.username + '/')}
					>
						{post.username}
					</div>
					{post.caption}
				</div>
				<div className='w-full my-2 text-xs text-zinc-400  font-light'>{post.time}</div>
			</div>
			<div className='w-full  border-t-[1px] dark:border-neutral-500'>
				<CreateComment
					optionClicked={optionClicked}
					setAlert={setAlert}
					post={post}
					replyTo={replyTo}
					setReplyTo={setReplyTo}
				/>
			</div>
		</div>
	);

	function Option({ src, option, className }) {
		return (
			<img
				src={src}
				alt=''
				className={`w-6 hover:opacity-80 cursor-pointer ${className}`}
				onClick={(e) => optionClicked(option)}
			/>
		);
	}
}

function CreateComment({ optionClicked, setAlert, post, replyTo, setReplyTo }) {
	const navigate = useNavigate();
	const [commentText, setCommentText] = React.useState('');
	const [emojiSelectorVisible, setEmojiSelectorVisible] = React.useState(false);
	const onEmojiClick = (event, emojiObject) => {
		setCommentText((prev) => prev + emojiObject.emoji);
	};
	React.useEffect(() => {
		$(document).on('click', function (e) {
			if (
				$(e.target).closest('#emoji-picker').length === 0 &&
				$(e.target).attr('id') !== 'emoji-picker-btn'
			) {
				$('.emoji-picker').addClass('opacity-0 hidden');
			}
		});
	}, []);
	React.useEffect(() => {
		$('textarea')
			.each(function () {
				this.setAttribute(
					'style',
					'height:' + Math.max(Math.min(100, this.scrollHeight), 18) + 'px;'
				);
			})
			.on('input', function () {
				this.style.height = 'auto';
				this.style.height = Math.max(Math.min(100, this.scrollHeight), 18) + 'px';
			});
	}, []);

	const sendComment = async () => {
		if (!commentText) return;
		try {
			let result;
			if (replyTo.id) {
				const { data } = await Axios.post('/post/create-reply/' + replyTo.id, {
					comment: commentText,
				});
				result = data;
				setReplyTo({});
			} else {
				const { data } = await Axios.post('/post/create-comment/' + post.shared_id, {
					comment: commentText,
				});
				result = data;
			}
			if (result.success) {
				setCommentText('');
				return optionClicked(OPTIONS.COMMENT_UPDATED);
			}
		} catch (err) {}
		setAlert(`Couldn't post comment.`);
	};

	return (
		<>
			{replyTo.id && (
				<div className='w-full text-sm flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-neutral-800 border-b-[1px] dark:border-neutral-500'>
					<span className='w-1/6 dark:text-white/70'>reply to</span>
					<span
						className='w-4/6 text-primary overflow-hidden cursor-pointer'
						onClick={(e) => navigate('/' + replyTo.username + '/')}
					>
						@{replyTo.username}
					</span>
					<span className='w-1/5 cursor-pointer' onClick={(e) => setReplyTo({})}>
						<img src={CLOSE} alt='' className='w-6 float-right dark:invert' />
					</span>
				</div>
			)}
			<div className={`relative flex items-end p-3 dark:bg-neutral-900`}>
				<img
					id='emoji-picker-btn'
					src={EMOJI}
					alt=''
					className='w-4 h-4 cursor-pointer select-none dark:invert'
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
					className='w-full mx-4 resize-none outline-none word text-xs bg-transparent dark:text-white'
					type='text'
					tabIndex={1}
					value={commentText}
					onChange={(e) => {
						setCommentText(e.target.value);
					}}
					rows={1}
					placeholder='Add a comment...'
				/>

				<span
					tabIndex={2}
					className={`w-fit text-primary text-sm font-semibold select-none ${
						commentText.trim().length === 0 ? 'opacity-60' : 'cursor-pointer'
					}`}
					onClick={sendComment}
				>
					Post
				</span>

				{emojiSelectorVisible && (
					<div
						id='emoji-picker'
						className='emoji-picker absolute bottom-10 opacity-0 hidden transition-all'
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
		</>
	);
}

function Comment({ id, replyID, setReplyTo, post_id }) {
	const navigate = useNavigate();
	const [comment, setComment] = React.useState({});
	const [repliesVisible, setRepliesVisibility] = React.useState(false);
	const likeClickhandler = async (e) => {
		try {
			try {
				const { data } = await Axios.post(`/post/like-comment/${post_id}/${id}`);
				if (data.success) {
					setComment((prev) => {
						return { ...prev, liked: data.liked };
					});
				}
			} catch (err) {}
		} catch (err) {}
	};

	React.useEffect(() => {
		async function fetchComment() {
			const { data } = await Axios.get('/post/get-comment/' + id);
			if (data.success) {
				setComment(data.message);
			}
		}
		fetchComment();
	}, [id]);

	return (
		<div className='flex my-4'>
			<div className='w-fit select-none'>
				<DPImage
					src={comment.dp}
					className='w-9 rounded-full bg-white cursor-pointer'
					onClick={(e) => navigate('/' + comment.username + '/')}
				/>
			</div>
			<div className='w-full px-4 text-sm leading-4 dark:text-white/70'>
				<span
					className='font-medium mr-2 cursor-pointer dark:text-white'
					onClick={(e) => navigate('/' + comment.username + '/')}
				>
					{comment.username}
				</span>
				{comment.text}
				<div className='mt-2 text-xs opacity-60 select-none flex items-center '>
					<span>{comment.time}</span>
					<span
						className='ml-3 font-medium cursor-pointer'
						onClick={(e) => setReplyTo({ username: comment.username, id: replyID })}
					>
						Reply
					</span>
					<span className='pl-3 opacity-0 hover:opacity-100 transition-all hover:cursor-pointer'>
						<img src={MENU} alt='' className='w-4 dark:invert' />
					</span>
				</div>
				{comment.replies && comment.replies.length > 0 && (
					<>
						<div className='flex items-center mt-2 text-xs opacity-60'>
							<hr className='w-1/4 border-1 border-zinc-300'></hr>
							<span
								className='ml-3 font-medium cursor-pointer select-none'
								onClick={(e) => setRepliesVisibility((prev) => !prev)}
							>{`${repliesVisible ? 'Hide' : 'View'} replies (${comment.replies.length})`}</span>
						</div>
						{repliesVisible &&
							comment.replies.map((reply, index) => (
								<Comment
									key={index}
									id={reply}
									replyID={id}
									setReplyTo={setReplyTo}
									post_id={post_id}
								/>
							))}
					</>
				)}
			</div>
			<div className='w-fit absolute right-3 select-none'>
				<img
					src={comment.liked ? LIKE_FILLED : LIKE_OUTLINED}
					className={`w-3 mt-2 ${!comment.liked && 'dark:invert'}`}
					alt=''
					onClick={likeClickhandler}
				/>
			</div>
		</div>
	);
}

function Dialog({ setAlert, openDialog, post }) {
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

	const unfollowHandler = async (e) => {
		openDialog(DIALOG.CLOSE);
		try {
			const { data } = await Axios.post(`/explore/unfollow/${post.username}`);
			if (data.success) {
				return setAlert(`Unfollowed ${post.username}`);
			}
		} catch (err) {}
		setAlert(`Unable to unfollow ${post.username}`);
	};

	const deleteHandler = async (e) => {
		openDialog(DIALOG.CLOSE);
		try {
			const { data } = await Axios.post(`/post/delete-post/${post.shared_id}`);
			if (data.success) {
				setAlert(`Post deleted`);
				return navigate('/' + post.username + '/');
			}
		} catch (err) {}
		setAlert(`Unable to delete post`);
	};

	return (
		<>
			<div>
				<div className='dialog-wrapper w-screen h-screen z-20 fixed left-0 top-0 flex-center bg-black/50 opacity-0 transition-all'>
					<div className='dialog w-[400px] h-fit flex-center flex-col rounded-[12px] bg-white overflow-hidden max-70vh'>
						{getProfile().username === post.username ? (
							<div
								className='w-full p-3 flex-center text-sm font-semibold text-red-500 cursor-pointer hover:bg-zinc-100'
								onClick={deleteHandler}
							>
								Delete
							</div>
						) : (
							<div
								className='w-full p-3 flex-center text-sm font-semibold text-red-500 cursor-pointer hover:bg-zinc-100'
								onClick={unfollowHandler}
							>
								Unfollow
							</div>
						)}
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
