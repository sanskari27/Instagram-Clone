import React from 'react';
import $ from 'jquery';

export default function AlertBar({ message }) {
	React.useEffect(() => {
		if (!message) return;
		$('#alert-bar').removeClass('-bottom-12').addClass('bottom-0');
		setTimeout(() => {
			$('#alert-bar').removeClass('bottom-0').addClass('-bottom-12');
		}, 5000);
	}, [message]);
	return (
		<>
			<div
				id='alert-bar'
				className='h-10 z-10 fixed -bottom-12 text-sm w-screen flex items-center bg-zinc-800 text-white py-2 px-5 transition-all'
			>
				{message}
			</div>
		</>
	);
}
