import React from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from '../../Controller/Axios';
import LOADING_DARK from '../../assets/loading_dark.png';
import Cropper from 'react-easy-crop';
import { getProfile } from '../../Controller/User';
import { DPImage } from '../../components/ImageUtils';
import IMAGE_GALLERY from '../../assets/image-gallery.png';
import IMAGE_GALLERY_BLUE from '../../assets/image-gallery-blue.png';
import IMAGE_WARNING from '../../assets/warning.png';
import CLOSE from '../../assets/cross-light.png';
import ARROW from '../../assets/arrow-dark.png';
import getCroppedImg, { getCroppedImgFile, getAspectRatio } from '../extras/cropImage';

const SHARE = {
	POST: 0,
	STORY: 1,
};
export default function CreatePost({ setTitle, setAlert }) {
	const navigate = useNavigate();
	const [file, setFile] = React.useState({ preview: '', raw: '' });
	const [stage, setStage] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [croppedAreaPixels, setCroppedAreaPixels] = React.useState(null);
	const [croppedImage, setCroppedImage] = React.useState(null);
	const [caption, setCaption] = React.useState('');
	const [header, setHeader] = React.useState('Create new post');
	const [shareType, setShareType] = React.useState(SHARE.POST);

	React.useEffect(() => {
		setTitle('Create Post');
		setLoading(false);
	}, [setTitle]);
	React.useEffect(() => {
		if (file.raw) {
			setHeader('Crop');
			setStage(1);
		} else {
			setStage(0);
			setHeader('Create new post');
		}
	}, [file]);

	async function cropHandler() {
		try {
			const croppedImage = await getCroppedImg(file.preview, croppedAreaPixels, 0);
			setCroppedImage(croppedImage);
			setStage(2);
		} catch (e) {
			setStage(0);
			setAlert('Unable to crop image');
		}
	}
	React.useEffect(() => {
		if (stage === 0) {
			setHeader('Create new post');
		}
		if (stage === 1) {
			setHeader('Crop');
		}
		if (stage === 2) {
			setHeader('Preview');
		}
		if (stage === 3) {
			setHeader('Caption');
		} else {
			setCaption('');
		}
	}, [stage]);

	async function submit() {
		setLoading(true);
		const croppedImage = await getCroppedImgFile(file.preview, croppedAreaPixels, 0);
		const formdata = new FormData();
		formdata.append('file', croppedImage, file.raw.name);
		formdata.append('caption', caption);
		try {
			if (shareType === SHARE.POST) {
				const { data } = await Axios.post(`/post/create-post`, formdata);
				if (data.success) {
					setAlert(`Post created successfully`);
				}
			} else if (shareType === SHARE.STORY) {
				const { data } = await Axios.post(`/post/create-story`, formdata);
				if (data.success) {
					setAlert(`Story created successfully`);
				}
			}
		} catch (err) {
			setAlert('Upload failed. Please try again later');
		}
		setTimeout(() => {
			setLoading(false);
			navigate('/');
		}, 500);
	}

	return (
		<>
			{loading ? (
				<Loading />
			) : (
				<div className='dialog-wrapper w-screen h-screen z-20 fixed top-0 flex-center bg-black/80 '>
					<img
						src={CLOSE}
						alt=''
						className='absolute w-5 right-6 top-6 cursor-pointer'
						onClick={(e) => navigate('/')}
					/>
					<div className='dialog w-fit h-fit flex flex-col rounded-[12px] bg-white dark:bg-neutral-900 overflow-hidden max-70vh'>
						<div className='w-[400px] h-fit py-2 flex relative items-center  border-b-[1px] border-zinc-200 dark:border-neutral-500'>
							<span className='font-medium tracking-wide w-full text-center dark:text-white/90 '>
								{header}
							</span>
							{stage >= 1 && (
								<>
									<img
										src={ARROW}
										alt=''
										className='w-6 h-6 absolute left-3 rotate-90 cursor-pointer dark:invert'
										onClick={(e) => setStage((current) => current - 1)}
									/>
									<span
										className='text-primary select-none cursor-pointer absolute right-4 '
										onClick={(e) => {
											if (stage === 1) cropHandler();
											else if (stage <= 2) setStage((current) => current + 1);
											else if (stage === 3) {
												submit();
											}
										}}
									>
										{stage === 3 ? 'Share' : 'Next'}
									</span>
								</>
							)}
						</div>
						{stage === 0 && <FileInput setFile={setFile} file={file} stage={stage} />}
						{stage === 1 && <CropWindow file={file} setCroppedAreaPixels={setCroppedAreaPixels} />}
						{stage === 2 && <PreviewWindow file={croppedImage} />}
						{stage === 3 && (
							<CaptionWindow
								caption={caption}
								setCaption={setCaption}
								shareType={shareType}
								setShareType={setShareType}
							/>
						)}
					</div>
				</div>
			)}
		</>
	);
	function Loading() {
		return (
			<div className='dialog-wrapper w-screen h-screen flex-center flex-col'>
				<img
					className={`w-8 h-8  animate-spin ${!loading && 'hidden'} dark:invert`}
					src={LOADING_DARK}
					alt=''
				/>
				<span className='text-sm font-medium mt-5 animate-bounce dark:text-white'>
					Upload in progress...
				</span>
			</div>
		);
	}
}

function FileInput({ setFile }) {
	const dropRef = React.useRef();
	const dragCounter = React.useRef(0);
	const [dragging, setDragging] = React.useState(false);
	const [error, setError] = React.useState('');

	React.useEffect(() => {
		const handleDrag = (e) => {
			e.preventDefault();
			e.stopPropagation();
		};
		const handleDragIn = (e) => {
			e.preventDefault();
			e.stopPropagation();
			dragCounter.current = dragCounter.current + 1;
			if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
				setDragging(true);
			}
		};
		const handleDragOut = (e) => {
			e.preventDefault();
			e.stopPropagation();

			dragCounter.current = dragCounter.current - 1;
			if (dragCounter.current === 0) {
				setDragging(false);
			}
		};
		const handleDrop = (e) => {
			e.preventDefault();
			e.stopPropagation();
			if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
				const file = e.dataTransfer.files[0];
				if (file['type'].split('/')[0] === 'image') {
					setFile({ preview: URL.createObjectURL(file), raw: file });
				} else {
					setError(file.name);
				}
				e.dataTransfer.clearData();
				dragCounter.current = 0;
			}
		};

		let div = dropRef.current;
		div.addEventListener('dragenter', handleDragIn);
		div.addEventListener('dragleave', handleDragOut);
		div.addEventListener('dragover', handleDrag);
		div.addEventListener('drop', handleDrop);

		return () => {
			div.removeEventListener('dragenter', handleDragIn);
			div.removeEventListener('dragleave', handleDragOut);
			div.removeEventListener('dragover', handleDrag);
			div.removeEventListener('drop', handleDrop);
		};
	}, [setFile]);

	function handleChange(e) {
		const file = e.target.files[0];
		if (!file) return;
		if (file['type'].split('/')[0] === 'image') {
			setFile({ preview: URL.createObjectURL(file), raw: file });
		} else {
			setError(file.name);
			e.target.value = null;
		}
	}
	return (
		<>
			<div ref={dropRef} className='w-[400px] h-[400px] flex-center flex-col'>
				<img
					src={error ? IMAGE_WARNING : dragging ? IMAGE_GALLERY_BLUE : IMAGE_GALLERY}
					alt=''
					className='w-20 dark:invert'
				/>
				<span className='mt-5 font-light tracking-wider dark:text-white'>
					{!error ? 'Drag your image here' : 'This file is not supported'}
				</span>
				{error && (
					<div className='mt-5'>
						<span className='text-sm font-medium'>{error}</span>
						<span className='text-sm ml-1'>could not be uploaded.</span>
					</div>
				)}
				<label
					htmlFor='upload-button'
					className='bg-primary px-3 mt-5 py-1.5 rounded text-white text-sm font-medium tracking-wide cursor-pointer'
				>
					{!error ? 'Select from device' : 'Select other file'}
				</label>
			</div>
			<input
				type='file'
				id='upload-button'
				style={{ display: 'none' }}
				accept='image/*'
				onChange={handleChange}
			/>
		</>
	);
}

function CropWindow({ file, setCroppedAreaPixels }) {
	let aspectRatios = [
		{ x: 1, y: 1 },
		{ x: 4, y: 5 },
		{ x: 16, y: 9 },
	];
	const [crop, setCrop] = React.useState({ x: 0, y: 0 });
	const [zoom, setZoom] = React.useState(1);
	const [aspectRatio, setAspectRatio] = React.useState({ x: 1, y: 1, counter: 0 });
	const [originalAspectRatio, setOriginalAspectRatio] = React.useState({ x: 1, y: 1 });

	const onCropComplete = React.useCallback(
		(croppedArea, croppedAreaPixels) => {
			setCroppedAreaPixels(croppedAreaPixels);
		},
		[setCroppedAreaPixels]
	);

	return (
		<>
			<div className='w-[400px] h-[400px] relative'>
				<Cropper
					image={file.preview}
					crop={crop}
					zoom={zoom}
					aspect={aspectRatio.x / aspectRatio.y}
					showGrid={false}
					onCropChange={setCrop}
					onCropComplete={onCropComplete}
					onZoomChange={setZoom}
					onMediaLoaded={(mediaSize) => {
						setOriginalAspectRatio(getAspectRatio(mediaSize.naturalWidth, mediaSize.naturalHeight));
					}}
				/>
				<div>
					{aspectRatio.counter < 3 && (
						<div className='w-[200px] bg-black/60 absolute left-1/2 -translate-x-1/2 bottom-4 rounded-md h-[35px] px-3 flex-center'>
							<input
								type='range'
								className='h-[1px] w-full bg-black  outline-none appearance-none'
								value={zoom}
								min={1}
								max={2.5}
								step={0.01}
								onChange={(e) => setZoom(e.target.value)}
							/>
						</div>
					)}
					<div
						className='bg-black/60 w-[35px] h-[35px] absolute left-4 bottom-4 p-2 text-sm font-medium rounded-full flex-center text-white select-none cursor-pointer'
						onClick={(e) => {
							const count = (aspectRatio.counter + 1) % 4;
							if (count < 3) {
								setAspectRatio({ ...aspectRatios[count], counter: count });
							} else {
								setAspectRatio({ ...originalAspectRatio, counter: count });
							}
						}}
					>
						{aspectRatio.counter < 3 ? aspectRatio.x + ':' + aspectRatio.y : '®'}
					</div>
				</div>
			</div>
		</>
	);
}

function PreviewWindow({ file }) {
	return (
		<>
			<div className='w-[400px] h-[400px] flex-center flex-col'>
				<div className='w-[400px] h-[400px]'>
					<img src={file} alt='' className='w-full h-full object-contain' />
				</div>
			</div>
		</>
	);
}

function CaptionWindow({ caption, setCaption, shareType, setShareType }) {
	return (
		<>
			<div className='w-[400px] h-[400px] relative flex flex-col'>
				<div className='w-full px-2 py-1 border-b-[1px] dark:border-neutral-500 flex items-center justify-between'>
					<DPImage src={getProfile().dp} className='w-10 h-10 rounded-full select-none' />
					<div className='w-full ml-2 mr-5 font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap dark:text-white'>
						{getProfile().name}
					</div>
					<div
						className={`w-fit flex justify-between mx-3 dot text-sm font-medium ${
							shareType === SHARE.STORY ? 'dot-left' : 'dot-right'
						}`}
					>
						<span
							onClick={(e) => setShareType(SHARE.STORY)}
							className={`${shareType === SHARE.STORY ? 'text-primary' : 'dark:text-white/80'}`}
						>
							Story
						</span>
						<span
							className={`ml-2 ${shareType === SHARE.POST ? 'text-primary' : 'dark:text-white/80'}`}
							onClick={(e) => setShareType(SHARE.POST)}
						>
							Post
						</span>
					</div>
				</div>
				<textarea
					className='w-full h-full outline-none p-2 overflow-x-hidden overflow-y-auto dark:bg-neutral-900 dark:text-white/70'
					placeholder='Write a Caption...'
					value={caption}
					disabled={shareType !== SHARE.POST}
					onChange={(e) => {
						let value = e.target.value;
						value = value.slice(0, Math.min(value.length, 2000));
						setCaption(value);
					}}
				/>
				<div className='w-fit h-[35px] fixed right-4 bottom-4 p-2  text-white/80'>
					{caption.length} / 2000
				</div>
			</div>
		</>
	);
}
