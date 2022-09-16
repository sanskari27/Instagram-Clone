import React from 'react';
import Axios from '../../Controller/Axios';
import PostGrid from '../Post/PostGrid';

export default function Explore({ setAlert, setTitle, setLoading, loading }) {
	const [posts, setPosts] = React.useState([]);

	React.useEffect(() => {
		async function getPosts() {
			try {
				const { data } = await Axios.get('/explore/');
				if (data.success) {
					setPosts(data.message);
					setLoading(false);
				}
			} catch (e) {}
		}
		setLoading(true);
		getPosts();
	}, [setLoading]);

	return (
		<div className='w-screen h-screen padding-app '>
			{posts.length === 0 ? (
				<div className='text-lg font-semibold flex-center dark:text-white/70'>
					No post suggestions for you.
				</div>
			) : (
				<PostGrid posts={posts} />
			)}
		</div>
	);
}
