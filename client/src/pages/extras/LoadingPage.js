import React from 'react';
import LOADING from '../../assets/loading.svg';

export default function Login() {
	return (
		<React.Fragment>
			<div className='h-full w-full fixed top-0 left-0 flex justify-center align-middle bg-slate-200 dark:bg-neutral-700'>
				<img src={LOADING} alt='' className='w-16 animate-pulse' />
			</div>
		</React.Fragment>
	);
}
