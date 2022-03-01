import React from 'react';
import axios from 'axios';
import USER from '../assets/user.png';
import LOADING from '../assets/loading_dark.png';
import Loading from './Loading';

export function DPImage({ src, className, onClick }) {
	const [imgSrc, setImgSrc] = React.useState(USER);

	React.useEffect(() => {
		let mounted = true;
		if (!src) return setImgSrc(USER);
		axios.get('http://localhost:9000/images/' + src, { responseType: 'blob' }).then((response) => {
			if (mounted) setImgSrc(URL.createObjectURL(response.data));
		});
		return () => {
			mounted = false;
		};
	}, [src]);

	return <img src={imgSrc} key={Date.now()} alt='' className={className} onClick={onClick} />;
}

export function PostImage({ src, className, onClick }) {
	const [imgSrc, setImgSrc] = React.useState(null);

	React.useEffect(() => {
		let mounted = true;
		if (!src) return setImgSrc(null);
		axios.get('http://localhost:9000/images/' + src, { responseType: 'blob' }).then((response) => {
			if (mounted) setImgSrc(URL.createObjectURL(response.data));
		});
		return () => {
			mounted = false;
		};
	}, [src]);

	return imgSrc !== null ? (
		<img src={imgSrc} key={Date.now()} alt='' className={className} onClick={onClick} />
	) : (
		<div className={'min-h-[500px] flex-center'}>
			<img src={LOADING} alt='' className='w-6 z-50 animate-spin' />
		</div>
	);
}

export function MessageImage({ src, className, onClick, onLoad }) {
	const [imgSrc, setImgSrc] = React.useState(null);

	React.useEffect(() => {
		let mounted = true;
		if (!src) return setImgSrc(null);
		axios.get('http://localhost:9000/images/' + src, { responseType: 'blob' }).then((response) => {
			if (mounted) setImgSrc(URL.createObjectURL(response.data));
		});
		return () => {
			mounted = false;
		};
	}, [src]);

	if (!imgSrc)
		return (
			<div className='w-[250px] h-[250px] bg-zinc-150'>
				<Loading />
			</div>
		);
	return <img src={imgSrc} alt='' className={className} onClick={onClick} onLoad={onLoad} />;
}

export function StoryImage({ src, className, onClick, onLoad }) {
	const [imgSrc, setImgSrc] = React.useState(null);

	React.useEffect(() => {
		let mounted = true;
		if (!src) return setImgSrc(null);
		axios.get('http://localhost:9000/images/' + src, { responseType: 'blob' }).then((response) => {
			if (mounted) setImgSrc(URL.createObjectURL(response.data));
		});
		return () => {
			mounted = false;
		};
	}, [src]);

	if (!imgSrc)
		return (
			<div className='w-full h-full bg-zinc-150'>
				<Loading />
			</div>
		);
	return <img src={imgSrc} alt='' className={className} onClick={onClick} onLoad={onLoad} />;
}
