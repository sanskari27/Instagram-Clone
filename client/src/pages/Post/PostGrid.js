import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PostImage } from '../../components/ImageUtils';
import LIKE_FILLED_LIGHT from '../../assets/like-filled-light.png';
import COMMENT_FILLED_LIGHT from '../../assets/comment-filled-light.png';

export default function PostGrid({ posts }) {
	if (!posts || posts.length === 0) return <></>;
	return (
		<div className='w-full flex  flex-wrap'>
			{posts.map((post, index) => (
				<GridElement
					key={index}
					file={post.filename}
					id={post.shared_id}
					likes={post.likes_count}
					comments={post.comments_count}
				/>
			))}
		</div>
	);
}

function GridElement({ file, id, likes, comments }) {
	const navigate = useNavigate();
	return (
		<div className='w-[30%] m-4 '>
			<div
				className='rounded-md overflow-hidden relative cursor-pointer'
				onClick={(e) => navigate(`/p/${id}/`)}
			>
				<PostImage src={file} className='w-full h-full object-contain' />
				<div className='w-full h-full absolute top-0 flex-center opacity-0 hover:opacity-100 hover:bg-black/30 dark:hover:bg-black/40 select-none'>
					<img src={LIKE_FILLED_LIGHT} alt='' className='w-6' />
					<span className='ml-2 text-white'>{likes}</span>
					<img src={COMMENT_FILLED_LIGHT} alt='' className='w-6 ml-4' />
					<span className='ml-2 text-white'>{comments}</span>
				</div>
			</div>
		</div>
	);
}
