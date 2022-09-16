import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import $ from 'jquery';
import LOGO from '../../assets/Instagram_logo_light.png';
import CLOSE from '../../assets/cross-light.png';
import ARROW from '../../assets/arrow.png';
import Axios from '../../Controller/Axios';
import { StoryImage } from '../../components/ImageUtils';

export default function StoriesViewer({ setTitle, setAlert, data }) {
	const mounted = React.useRef(true);
	const { state } = useLocation();
	const { username } = state || { username: null };
	React.useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const navigate = useNavigate();
	const [stories, setStories] = React.useState([]);
	const [selected, setSelected] = React.useState(0);
	React.useEffect(() => {
		setTitle('Stories');
	}, [setTitle]);

	const fetchStories = React.useCallback(async () => {
		try {
			const { data } = await Axios.get('/explore/stories');
			if (!mounted.current) return;
			const stories = [];
			let index = -1;
			for (const _username in data.message) {
				index += 1;
				stories.push(data.message[_username]);
				if (_username === username) setSelected(index);
			}
			setStories(stories);
		} catch (e) {
			console.log(e);
			if (e.response) {
				setAlert(e.response.data?.message);
			} else {
				setAlert('Unable to fetch stories');
				setTimeout(() => {
					if (!mounted.current) return;
					navigate('/');
				}, [2000]);
			}
		}
	}, [setAlert, navigate, username]);

	React.useEffect(() => fetchStories(), [fetchStories]);

	return (
		<>
			<div className='w-full h-full flex items-center absolute overflow-hidden bg-black/90 '>
				<img
					src={LOGO}
					alt=''
					className='z-10 p-4 cursor-pointer absolute left-0 top-0'
					onClick={(e) => navigate('/')}
				/>
				<img
					src={CLOSE}
					alt=''
					className='z-10 absolute w-5 right-6 top-6'
					onClick={(e) => navigate('/')}
				/>
				<div className='flex overflow-hidden items-center w-full h-full  '>
					{stories.map((story, index) => (
						<Story
							key={index}
							stories={story}
							selected={selected}
							index={index}
							prev={() => {
								if (index >= 0) {
									setSelected((prev) => Math.max(prev - 1, 0));
								}
							}}
							next={() => {
								if (index < stories.length - 1) {
									setSelected((prev) => Math.min(prev + 1, stories.length - 1));
								}
							}}
							prevAvailable={index > 0}
							nextAvailable={index < stories.length - 1}
						/>
					))}
				</div>
			</div>
		</>
	);
}

function Story({ stories, index, selected, prev, next, prevAvailable, nextAvailable }) {
	const div = React.useRef();
	const timer = React.useRef();
	const updated = React.useRef(0);
	const [current, setCurrent] = React.useState(0);
	const [progress, setProgress] = React.useState({});

	React.useEffect(() => {
		if (!div.current) return;
		$(div.current).animate(
			{
				left: `${(index - selected) * 100}vw`,
				translate: `scale(${index === selected ? '1' : '0.4'})`,
			},
			$(div.current).hasClass('hidden') ? 0 : 500,
			function () {
				$(div.current).removeClass('hidden');
			}
		);
	}, [index, selected]);

	React.useEffect(() => {
		for (let i = 0; i < stories.length; i++) {
			if (!stories[i].seen && !updated.current) {
				setCurrent(i);
				updated.current = true;
			}
			setProgress((prev) => {
				return { ...prev, [i]: 0 };
			});
		}
	}, [stories]);

	const startTimer = React.useCallback(() => {
		clearInterval(timer.current);
		setProgress((p) => {
			for (const index in p) {
				if (index > current) {
					p[index] = 0;
				} else if (index < current) {
					p[index] = 100;
				} else {
					p[index] = 0;
				}
			}
			return p;
		});
		timer.current = setInterval(() => {
			setProgress((prev) => {
				if (prev[current] + 1 / 15 >= 100) {
					clearInterval(timer.current);
					if (current + 1 >= stories.length) {
						next();
					} else {
						setCurrent(current + 1);
					}
				}
				return { ...prev, [current]: Math.min(prev[current] + 1 / 15, 100) };
			});
		}, 10);
	}, [current, stories, next]);

	const storySeen = React.useCallback(async (id) => {
		try {
			await Axios.post(`/explore/story-seen/${id}`);
		} catch (e) {}
	}, []);

	React.useEffect(() => {
		startTimer();
	}, [selected, current, startTimer]);

	React.useEffect(() => {
		if (selected === index) {
			storySeen(stories[current]?.id);
		}
	}, [selected, current, index, storySeen, stories]);

	return (
		<div ref={div} className={`mx-4 w-screen flex-center  absolute hidden`}>
			<div
				className='w-1/4  relative  flex-center bg-white/10 rounded-md'
				style={{ height: '95vh' }}
			>
				<div className='absolute flex left-0 top-3 w-full h-[2px] px-1'>
					{Object.entries(progress).map((e, index) => (
						<div key={index} className='relative bg-white/40 w-full  h-[2px] mr-1'>
							<span
								className='h-full absolute bg-white '
								style={{ width: `${progress[index]}%` }}
							/>
						</div>
					))}
				</div>

				<img
					src={ARROW}
					className={`w-6 z-10 rotate-180 absolute -left-9  opacity-50 hover:opacity-100 ${
						current > 0 || prevAvailable ? 'inline-block' : 'hidden'
					}`}
					alt=''
					onClick={(e) => {
						if (current - 1 < 0) {
							prev();
						} else {
							setCurrent((prev) => prev - 1);
						}
					}}
				/>
				<StoryImage
					src={stories[current]?.filename}
					className='object-cover h-full rounded-md'
					onLoad={() => {
						startTimer();
					}}
				/>

				<img
					src={ARROW}
					className={`w-6 z-10 absolute -right-9  opacity-50 hover:opacity-100 ${
						current < stories.length - 1 || nextAvailable ? 'inline-block' : 'hidden'
					}`}
					alt=''
					onClick={(e) => {
						if (current + 1 >= stories.length) {
							next();
						} else {
							setCurrent((prev) => prev + 1);
						}
					}}
				/>
			</div>
		</div>
	);
}
