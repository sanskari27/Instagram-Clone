import React from 'react';
import Axios from '../../Controller/Axios';
import Stories from './Stories';
import Suggestions from './Suggestions';
import Post from '../Post/Post';
import Dimension from '../extras/Dimension';
import Loading from '../../components/Loading';

export default function Feed({ setTitle, setAlert, setLoading, loading, setPage }) {
	const ref = React.useRef(null);
	const { width, left } = Dimension(ref);
	const [posts, setPosts] = React.useState([]);

	React.useEffect(() => {
		setTitle('');
	}, [setTitle]);

	React.useEffect(() => {
		async function fetchPosts() {
			try {
				const { data } = await Axios.get('/post/feed-post');
				if (data.success) {
					setLoading(false);
					return setPosts(data.message);
				}
			} catch (err) {}
			setLoading(false);
			setAlert('Unable to load your feed');
		}
		setLoading(true);
		fetchPosts();
	}, [setAlert, setLoading]);

	return (
		<>
			<div className='w-full h-full min-w-full flex justify-center  pt-8 px-4'>
				<div ref={ref} className='h-full w-11/12 sm:w-3/4 md:w-3/5  lg:w-6/12  mt-14 mr-4 '>
					<Stories />
					<div className='mt-6'>
						{loading ? (
							<Loading className='w-8 h-8' />
						) : posts.length === 0 ? (
							<span className='flex-center text-lg font-medium'> No new posts </span>
						) : (
							posts.map((post, index) => <Post key={index} id={post} setAlert={setAlert} />)
						)}
					</div>
				</div>
				<div className='lg:w-72 '></div>
			</div>
			<div
				style={{ left: width + left + 40 + 'px' }}
				className='h-fit w-72 hidden lg:flex flex-col top-24 fixed '
			>
				<Suggestions setAlert={setAlert} />
			</div>
		</>
	);
}
