import React from 'react';
import { Link } from 'react-router-dom';

export default function NotAvailable({ setTitle }) {
	React.useEffect(() => {
		setTitle('Page Not Found');
	}, [setTitle]);
	return (
		<div className='w-screen h-screen fixed  flex flex-col items-center dark:bg-neutral-800 padding-app'>
			<span className='text-2xl font-medium dark:text-white'>
				Sorry, this page isn't available.
			</span>
			<div className='mt-6'>
				<span className='dark:text-white/70'>
					The link you followed may be broken, or the page may have been removed.
				</span>
				<Link to='/' className='text-primary ml-1 '>
					Go back to Instagram.
				</Link>
			</div>
		</div>
	);
}
