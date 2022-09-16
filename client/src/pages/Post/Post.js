import React from 'react';
import $ from 'jquery';
import { useNavigate } from 'react-router-dom';
import Axios from '../../Controller/Axios';
import { DPImage, PostImage } from '../../components/ImageUtils';
import ShareDialog from '../Messenger/ShareDialog';
import MENU from '../../assets/menu.png';
import SHARE from '../../assets/share.png';
import COMMENT from '../../assets/comment.png';
import LIKE_OUTLINED from '../../assets/like-outlined.png';
import SAVED_OUTLINED from '../../assets/saved-outlined.png';
import LIKE_FILLED from '../../assets/like-filled.png';
import LIKE_FILLED_LIGHT from '../../assets/like-filled-light.png';
import SAVED_FILLED from '../../assets/saved-filled.png';

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
};

export default function Post({ id, setAlert }) {
	const ref = React.useRef();
	const postImg = React.useRef();
	const likeRef = React.useRef();
	const windowOffset = React.useRef(0);
	const navigate = useNavigate();
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
	const [dialog, openDialog] = React.useState(DIALOG.CLOSE);

	React.useEffect(() => {
		async function fetchPost() {
			try {
				const { data } = await Axios.get('/post/get-post/' + id);
				if (data.success) {
					$(ref.current).removeClass('hidden');
					return setPost(data.message);
				}
			} catch (err) {}
			$(ref.current).remove();
		}

		$(ref.current).addClass('hidden');
		fetchPost();
	}, [id]);

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
		} else if (optionClicked === OPTIONS.RELIKE) {
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
		} else if (optionClicked === OPTIONS.SAVED) {
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
		} else if (optionClicked === OPTIONS.COMMENT) {
			navigate('/p/' + post.shared_id + '/');
		} else if (optionClicked === OPTIONS.SHARE) {
			openDialog(DIALOG.SHARE);
		}
	};
	return (
		<>
			<div
				ref={ref}
				className='w-full relative flex items-center flex-col mt-6 rounded-md border border-zinc-200 dark:border-none bg-white dark:bg-neutral-900'
			>
				<div className='w-full px-3 py-3 border-b-[1px] dark:border-neutral-500 flex items-center'>
					<div
						className={`rounded-full flex-center select-none cursor-pointer ${
							post.hasStories &&
							(post.storiesSeen ? 'border-zinc-200 border-[1.5px]' : 'gradient-border p-[1px] ')
						}`}
						onClick={(e) => navigate('/' + post.username + '/')}
					>
						<DPImage
							src={post.dp}
							className={`w-10 rounded-full bg-white  ${
								!post.storiesSeen && post.hasStories && 'p-[1px]'
							}`}
						/>
					</div>
					<div className='w-full ml-2 mr-5 font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap'>
						<span
							className='cursor-pointer dark:text-white'
							onClick={(e) => navigate('/' + post.username + '/')}
						>
							{post.username}
						</span>
					</div>
					<div onClick={(e) => openDialog(DIALOG.OPEN)}>
						<img src={MENU} alt='' className='w-6 cursor-pointer dark:invert' />
					</div>
				</div>
				<div
					ref={postImg}
					className='w-full border-b-[1px] dark:border-neutral-500 flex-center relative'
					onClick={(e) => {
						if (e.detail === 2) {
							handleOptionsClick(OPTIONS.RELIKE);
						}
					}}
				>
					<PostImage src={post.filename} className='w-full object-contain' />
					<img
						ref={likeRef}
						src={LIKE_FILLED_LIGHT}
						alt=''
						className='w-20 absolute scale-0 transition-all'
					/>
				</div>
				<div className='w-full pr-4  mt-6 '>
					<div className='w-full flex justify-between '>
						<div className='flex w-fit ml-2'>
							<Option
								src={post.liked ? LIKE_FILLED : LIKE_OUTLINED}
								className={!post.liked && 'dark:invert'}
								option={OPTIONS.LIKE}
							/>
							<Option src={COMMENT} option={OPTIONS.COMMENT} className={'dark:invert'} />
							<Option src={SHARE} option={OPTIONS.SHARE} className={'dark:invert'} />
						</div>
						<div className='flex w-fit'>
							<Option
								src={post.saved ? SAVED_FILLED : SAVED_OUTLINED}
								className={'dark:invert'}
								option={OPTIONS.SAVED}
							/>
						</div>
					</div>
				</div>
				<div className='w-full px-4 mt-4 mb-4'>
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
					<div
						className='w-full mt-1 text-sm text-zinc-400 cursor-pointer'
						onClick={(e) => navigate('/p/' + post.shared_id + '/')}
					>
						{post.comments > 0 && `View ${post.comments} comment`}
					</div>
					<div className='w-full mt-2 text-xs text-zinc-400 font-light'>{post.time}</div>
				</div>
			</div>
			{dialog === DIALOG.OPEN && <Dialog openDialog={openDialog} setAlert={setAlert} post={post} />}
			{dialog === DIALOG.SHARE && (
				<ShareDialog post={post} onClose={(e) => openDialog(DIALOG.CLOSE)} setAlert={setAlert} />
			)}
		</>
	);
	function Option({ src, option, className }) {
		return (
			<img
				src={src}
				alt=''
				className={`w-6 ml-2 hover:opacity-80 cursor-pointer ${className}`}
				onClick={(e) => handleOptionsClick(option)}
			/>
		);
	}
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
	}, [openDialog]);

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

	return (
		<>
			<div>
				<div className='dialog-wrapper w-screen h-screen z-20 fixed left-0 top-0 flex-center bg-black/50 opacity-0 transition-all'>
					<div className='dialog w-[400px] h-fit flex-center flex-col rounded-[12px] bg-white overflow-hidden max-70vh'>
						<div
							className='w-full p-3 flex-center text-sm font-semibold text-red-500 cursor-pointer hover:bg-zinc-100'
							onClick={unfollowHandler}
						>
							Unfollow
						</div>
						<div
							className='w-full p-3 border-t-[1px] flex-center text-sm font-light cursor-pointer hover:bg-zinc-100'
							onClick={(e) => navigate('/p/' + post.shared_id + '/')}
						>
							Go to post
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
