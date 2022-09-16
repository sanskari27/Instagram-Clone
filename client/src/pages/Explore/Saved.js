import React from 'react';
import Axios from '../../Controller/Axios';
import Post from '../Post/Post';
import Loading from '../../components/Loading';

export default function Saved({ setTitle, setAlert, setLoading, loading, setPage }) {
	const ref = React.useRef(null);
	const [posts, setPosts] = React.useState([]);

	React.useEffect(() => {
		setTitle(`Saved`);
	}, [setTitle]);

	React.useEffect(() => {
		async function fetchPosts() {
			try {
				const { data } = await Axios.get('/post/saved-post');
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
			<div className='w-full h-full flex-center flex-col '>
				<div ref={ref} className='h-full w-11/12 sm:w-3/4 md:w-3/5  lg:w-6/12  mt-14 mr-4 '>
					<div className='mt-6'>
						{loading ? (
							<Loading className='w-8 h-8' />
						) : posts.length === 0 ? (
							<span className='flex-center text-lg font-medium'> No saved posts </span>
						) : (
							posts.map((post, index) => <Post key={index} id={post} setAlert={setAlert} />)
						)}
					</div>
				</div>
			</div>
		</>
	);
}
