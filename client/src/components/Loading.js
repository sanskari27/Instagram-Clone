import LOADING from '../assets/loading.png';
import LOADING_DARK from '../assets/loading_dark.png';

export default function Loading(props) {
	return (
		<div className='h-full w-full flex-center '>
			<img
				src={props.light ? LOADING : LOADING_DARK}
				alt=''
				className={`w-4 dark:invert animate-spin ${props.className}`}
			/>
		</div>
	);
}
