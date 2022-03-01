import Axios from '../../Controller/Axios';
import React from 'react';
import Cropper from 'react-easy-crop';
import { DPImage } from '../../components/ImageUtils';
import Loading from '../../components/Loading';
import { getProfile, setProfile } from '../../Controller/User';
import $ from 'jquery';
import getCroppedImg, { getCroppedImgFile, getAspectRatio } from '../extras/cropImage';
import IMAGE_GALLERY from '../../assets/image-gallery.png';
import IMAGE_GALLERY_BLUE from '../../assets/image-gallery-blue.png';
import IMAGE_WARNING from '../../assets/warning.png';
import ARROW from '../../assets/arrow-dark.png';
import CLOSE from '../../assets/cross-light.png';
import DARK_MODE from '../../assets/dark-mode.png';
import LIGHT_MODE from '../../assets/light-mode.png';

const DIALOG = {
	OPEN: 1,
	CLOSE: 0,
};
export default function EditProfileFragment({ setAlert, loading, setLoading }) {
	const [dialog, openDialog] = React.useState(DIALOG.CLOSE);
	const [darkMode, setDarkMode] = React.useState(getProfile().darkMode);
	const windowOffset = React.useRef(0);

	const updateDarkMode = React.useCallback(async (darkMode) => {
		try {
			await Axios.put('/profile/dark-mode', { darkMode });
		} catch (err) {}
	}, []);

	React.useEffect(() => {
		$('.app-container').addClass('transition-colors duration-300');
		return () => $('.app-container').removeClass('transition-colors duration-300');
	}, []);

	React.useEffect(() => {
		setProfile((prev) => {
			return { ...prev, darkMode };
		});
		updateDarkMode(darkMode);
	}, [darkMode, updateDarkMode]);

	React.useEffect(() => {
		if (dialog === DIALOG.CLOSE) {
			document.body.setAttribute('style', '');
			window.scrollTo(0, windowOffset.current);
		} else {
			windowOffset.current = window.scrollY;
			document.body.setAttribute(
				'style',
				`position:fixed; top: -${windowOffset.current}px; left: 0;right:0 `
			);
		}
	}, [dialog]);
	const getMaxDate = () => {
		var dtToday = new Date();

		var month = dtToday.getMonth() + 1; // jan=0; feb=1 .......
		var day = dtToday.getDate();
		var year = dtToday.getFullYear() - 18;
		if (month < 10) month = '0' + month.toString();
		if (day < 10) day = '0' + day.toString();
		let date = year + '-' + month + '-' + day;
		return date;
	};
	return (
		<>
			<div className='flex flex-col '>
				<div className='w-full flex mb-3'>
					<div className='w-1/4 flex justify-end px-4'>
						<DPImage src={getProfile().dp} className='w-10 rounded-full' />
					</div>
					<div className='w-3/4 md:w-2/3 text-left px-4 flex justify-between'>
						<div>
							<div className='tracking-wide leading-4 dark:text-white'>{getProfile().username}</div>
							<div
								className='text-primary cursor-pointer text-sm font-medium '
								onClick={(e) => openDialog(DIALOG.OPEN)}
							>
								Change Profile Photo
							</div>
						</div>
						<div>
							<img
								src={darkMode ? DARK_MODE : LIGHT_MODE}
								alt=''
								className='w-6 cursor-pointer dark:invert'
								onClick={(e) => {
									setDarkMode((prev) => !prev);
								}}
							/>
						</div>
					</div>
				</div>
				<Input name={'name'} placeholder='Name' type='text' tabIndex={1} required={true} />
				<Input name={'username'} placeholder='Username' type='text' tabIndex={2} required={true} />
				<Input name={'website'} placeholder='Website' type='text' tabIndex={3} />
				<LargeInput name={'bio'} placeholder='Bio' type='textarea' tabIndex={4} />
				<Input
					name={'dob'}
					placeholder='D.O.B'
					type='date'
					tabIndex={5}
					required={true}
					max={getMaxDate()}
				/>
				<Input name={'email'} placeholder='Email' type='email' tabIndex={6} required={true} />
				<GenderInput />

				<SubmitBTN setAlert={setAlert} />
			</div>
			{dialog === DIALOG.OPEN && (
				<Dialog
					setAlert={setAlert}
					openDialog={openDialog}
					loading={loading}
					setLoading={setLoading}
				/>
			)}
		</>
	);
}

function Input({ placeholder, name, type, tabIndex, required, max }) {
	const [value, setValue] = React.useState(getProfile()[name]);

	React.useEffect(() => {
		setProfile((prev) => {
			return { ...prev, [name]: value };
		});
	}, [value, name]);

	return (
		<div className='w-full flex my-2'>
			<div className='w-1/4 flex items-center justify-end px-4 font-medium opacity-90 dark:text-white/90'>
				{placeholder}
			</div>
			<div className='w-3/4 md:w-2/3 text-left px-4 '>
				<input
					className='border border-zinc-300 dark:border-none dark:bg-neutral-700 rounded px-2 py-1 w-full outline-none  font-light dark:text-white'
					autoComplete='off'
					value={value}
					onChange={(e) => setValue(e.target.value)}
					type={type}
					tabIndex={tabIndex}
					required={required || false}
					max={max || null}
				/>
			</div>
		</div>
	);
}

function LargeInput({ placeholder, name, type, tabIndex }) {
	const [value, setValue] = React.useState(getProfile()[name]);

	React.useEffect(() => {
		setProfile((prev) => {
			return { ...prev, [name]: value };
		});
	}, [value, name]);

	return (
		<div className='w-full flex my-2'>
			<div className='w-1/4 flex justify-end px-4 font-medium opacity-90  py-2 dark:text-white/90'>
				{placeholder}
			</div>
			<div className='w-3/4 md:w-2/3 text-left px-4 '>
				<textarea
					className='border border-zinc-300 dark:border-none dark:bg-neutral-700 rounded px-2 py-1 w-full outline-none  font-light dark:text-white'
					autoComplete='off'
					value={value}
					onChange={(e) => setValue(e.target.value)}
					type={type}
					tabIndex={tabIndex}
				/>
			</div>
		</div>
	);
}

function GenderInput() {
	const [gender, setGender] = React.useState(getProfile().gender);

	React.useEffect(() => {
		if (!gender) return;
		setProfile((prev) => {
			return { ...prev, gender: gender };
		});
	}, [gender]);

	return (
		<div className='w-full flex my-2'>
			<div className='w-1/4 flex items-center justify-end px-4 font-medium opacity-90 dark:text-white/90'>
				Gender
			</div>
			<div className='w-3/4 md:w-2/3  text-left px-4 '>
				<div className='flex w-full'>
					<span
						className={`w-1/3 text-center bg-zinc-100 dark:bg-neutral-700 border dark:border-none border-zinc-300 py-1 rounded-l  font-light cursor-pointer dark:text-white/80 ${
							gender === 'Male' && 'bg-green-400 dark:bg-green-400 font-medium text-white'
						}`}
						onClick={(e) => setGender('Male')}
					>
						Male
					</span>
					<span
						className={`w-1/3 text-center bg-zinc-100 dark:bg-neutral-700 border dark:border-none border-zinc-300 py-1  font-light cursor-pointer dark:text-white/80 ${
							gender === 'Female' && 'bg-green-400 dark:bg-green-400 font-medium text-white'
						}`}
						onClick={(e) => setGender('Female')}
					>
						Female
					</span>
					<span
						className={`w-1/3 text-center bg-zinc-100 dark:bg-neutral-700 border dark:border-none border-zinc-300 py-1 font-light rounded-r cursor-pointer dark:text-white/80  ${
							gender === 'Other' && 'bg-green-400 dark:bg-green-400 font-medium text-white'
						}`}
						onClick={(e) => setGender('Other')}
					>
						Other
					</span>
				</div>
			</div>
		</div>
	);
}

function SubmitBTN({ setAlert }) {
	const [loading, setLoading] = React.useState(false);
	const handleSubmit = async () => {
		const details = getProfile();
		if (!details.name) {
			return setAlert('Name required.');
		} else if (!details.username) {
			return setAlert('Username required.');
		} else if (!details.gender) {
			return setAlert('Gender required.');
		} else if (!details.email) {
			return setAlert('Email required.');
		}
		try {
			setLoading(true);
			const { data } = await Axios.post('/profile/save-profile', details);
			setLoading(false);
			if (data.success) {
				return setAlert(data.message);
			}
		} catch (err) {
			setLoading(false);
			if (err.response) {
				return setAlert(err.response.data.message);
			}
			return setAlert('Cannot update profile. Please try again later.');
		}
	};
	return (
		<div className='flex-center flex-col w-full md:w-2/3 mt-6'>
			<div
				className='bg-primary text-white px-4 py-1 w-[150px] text-center rounded cursor-pointer select-none'
				onClick={handleSubmit}
			>
				{loading ? <Loading /> : <>Submit</>}
			</div>
		</div>
	);
}

function Dialog({ setAlert, openDialog, loading, setLoading }) {
	const [file, setFile] = React.useState({ preview: '', raw: '' });
	const [stage, setStage] = React.useState(0);
	const [croppedAreaPixels, setCroppedAreaPixels] = React.useState(null);
	const [header, setHeader] = React.useState('Create new post');
	React.useEffect(() => {
		$('.dialog-wrapper').toggleClass('opacity-0');
	}, []);
	React.useEffect(() => {
		if (file.raw) {
			setHeader('Crop');
			setStage(1);
		} else {
			setStage(0);
			setHeader('Create new post');
		}
	}, [file]);
	React.useEffect(() => {
		$('.dialog-wrapper').on('click', function (e) {
			if ($(e.target).closest('.dialog').length === 0) {
				openDialog(DIALOG.CLOSE);
			}
		});
	}, [openDialog]);

	async function cropHandler() {
		try {
			const croppedImage = await getCroppedImg(file.preview, croppedAreaPixels, 0);
			setStage(2);
			save(croppedImage);
		} catch (e) {
			setStage(0);
			setAlert('Unable to crop image');
		}
	}

	const save = async (croppedImage) => {
		openDialog(DIALOG.CLOSE);
		setLoading(true);
		const formdata = new FormData();
		formdata.append('file', croppedImage, file.raw.name);
		try {
			await Axios.post(`/profile/update-dp`, formdata);
			return window.location.reload();
		} catch (err) {
			setAlert('Upload failed. Please try again later');
		}
		setTimeout(() => {
			setLoading(false);
		}, 500);
	};

	return (
		<>
			<div className='dialog-wrapper w-screen h-screen z-20 fixed top-0 left-0 flex-center bg-black/80 opacity-0'>
				<img
					src={CLOSE}
					alt=''
					className='absolute w-5 right-6 top-6 cursor-pointer'
					onClick={(e) => openDialog(DIALOG.CLOSE)}
				/>
				<div className='dialog w-fit h-fit flex flex-col rounded-[12px] bg-white overflow-hidden max-70vh'>
					<div className='w-[400px] h-fit py-2 flex relative items-center  border-b-[1px] border-zinc-200'>
						<span className='font-medium tracking-wide w-full text-center '>{header}</span>
						{stage === 1 && (
							<>
								<img
									src={ARROW}
									alt=''
									className='w-6 h-6 absolute left-3 rotate-90 cursor-pointer'
									onClick={(e) => setStage((current) => current - 1)}
								/>
								<span
									className='text-primary select-none cursor-pointer absolute right-4 '
									onClick={(e) => {
										if (stage === 1) cropHandler();
									}}
								>
									Save
								</span>
							</>
						)}
					</div>
					{stage === 0 && <FileInput setFile={setFile} file={file} stage={stage} />}
					{stage === 1 && <CropWindow file={file} setCroppedAreaPixels={setCroppedAreaPixels} />}
				</div>
			</div>
		</>
	);
}

function FileInput({ setFile }) {
	const dropRef = React.useRef();
	const [dragCounter, setDragCounter] = React.useState(false);
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
			setDragCounter((count) => count + 1);
			if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
				setDragging(true);
			}
		};
		const handleDragOut = (e) => {
			e.preventDefault();
			e.stopPropagation();
			let c;
			setDragCounter((count) => {
				c = count - 1;
				return c;
			});
			if (c === 0) {
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
				setDragCounter(0);
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
					className='w-20'
				/>
				<span className='mt-5 font-light tracking-wider'>
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
	const [crop, setCrop] = React.useState({ x: 1, y: 1 });
	const [zoom, setZoom] = React.useState(1);

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
					aspect={1}
					showGrid={false}
					onCropChange={setCrop}
					onCropComplete={onCropComplete}
					onZoomChange={setZoom}
				/>
				<div>
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
				</div>
			</div>
		</>
	);
}
