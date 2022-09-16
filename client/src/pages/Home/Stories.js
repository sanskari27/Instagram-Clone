import React from 'react';
import { useNavigate } from 'react-router-dom';
import ARROW from '../../assets/arrow.png';
import Loading from '../../components/Loading';
import $ from 'jquery';
import Axios from '../../Controller/Axios';
import { DPImage } from '../../components/ImageUtils';

const SCROLL = {
	LEFT: 0,
	RIGHT: 1,
};

export default function Stories() {
	const [scrolling, setScrolling] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [stories, setStories] = React.useState([]);

	React.useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const { data } = await Axios.get('/explore/stories');
				setLoading(false);
				if (data.success) {
					const stories = [];
					const _stories = data.message;
					const keys = Object.keys(_stories);
					for (var i = 0; i < keys.length; i++) {
						const story = _stories[keys[i]][_stories[keys[i]].length - 1];
						stories.push({
							id: story.id,
							username: story.username,
							name: story.name,
							seen: story.seen,
							dp: story.dp,
						});
					}
					setStories(stories);
					scrollHandler();
				}
			} catch (err) {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	function scrollHandler() {
		const stories = $('#stories').get(0);
		if (stories.scrollLeft <= 0) {
			$('#scroll-left').addClass('hidden');
		} else {
			$('#scroll-left').removeClass('hidden');
		}
		if (stories.scrollWidth - stories.clientWidth <= stories.scrollLeft) {
			$('#scroll-right').addClass('hidden');
		} else {
			$('#scroll-right').removeClass('hidden');
		}
	}

	function scroll(scroll) {
		if (scrolling) return;
		setScrolling(true);
		const stories = $('#stories').get(0);
		const scrollWidth = scroll === SCROLL.RIGHT ? 320 : -320;
		$(stories).animate(
			{
				scrollLeft: stories.scrollLeft + scrollWidth,
			},
			500,
			() => setScrolling(false)
		);
	}

	return (
		<div className='w-full relative flex items-center '>
			<img
				id='scroll-left'
				src={ARROW}
				alt=''
				className={`w-6 z-10 rotate-180 absolute left-2 hidden cursor-pointer drop-shadow-lg select-none `}
				onClick={() => scroll(SCROLL.LEFT)}
			/>
			<div
				id='stories'
				className='w-full h-28 flex items-center bg-white dark:bg-neutral-900 border dark:border-none pl-4 overflow-hidden relative rounded-md'
				onScroll={scrollHandler}
			>
				{stories.map((story, index) => (
					<Story key={index} story={story} />
				))}
				{loading && <Loading />}
			</div>
			<img
				id='scroll-right'
				src={ARROW}
				alt=''
				className={`w-6 z-10  absolute right-2 cursor-pointer drop-shadow-lg select-none `}
				onClick={() => scroll(SCROLL.RIGHT)}
			/>
		</div>
	);
}
function Story({ story }) {
	const navigate = useNavigate();
	return (
		<div
			className={`w-20 h-28 px-2 flex flex-col items-center justify-center cursor-pointer select-none ease-in-out duration-500  `}
			onClick={(e) => {
				navigate(`/stories/`, { state: { username: story.username, id: story.id } });
			}}
		>
			<div
				className={`w-16 h-16 border rounded-full p-[2px]  flex items-center justify-center select-none ${
					story.seen ? 'border-zinc-300' : 'gradient-border'
				}`}
			>
				<DPImage
					src={story.dp}
					className={`w-full h-full rounded-full bg-white  ${!story.seen && 'p-[2.5px]'}`}
				/>
			</div>

			<span
				className={`h-4 w-full text-xs text-ellipsis tracking-wide mt-1 text-center overflow-hidden text-zinc-700 dark:text-white ${
					story.seen && 'opacity-60'
				} `}
			>
				{story.username}
			</span>
		</div>
	);
}
