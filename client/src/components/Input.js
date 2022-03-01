import $ from 'jquery';
import React from 'react';
import LOADING from '../assets/loading.png';

export function TextInput(props) {
	function updateStyles(e) {
		const _this = $(e.target);
		const span = $(e.target).closest('div').children('span');
		const value = e.target.value;
		if (value) {
			span.addClass('text-[10px] pt-1');
			span.removeClass('text-xs items-center');
			_this.addClass('pt-3');
		} else {
			span.addClass('items-center text-xs');
			span.removeClass('text-[10px] pt-1');
			_this.removeClass('pt-3');
		}
	}
	return (
		<div
			className={`bg-zinc-50 dark:bg-neutral-700 border border-zinc-200 dark:border-none h-10 relative rounded ${props.className} transition-all`}
		>
			<span className='w-full h-full absolute left-0 top-0 px-2 text-xs flex items-center text-zinc-400 dark:text-white/70 text-ellipsis overflow-hidden transition-all select-none'>
				{props.placeholder}
			</span>
			<input
				className={`w-full h-full bg-transparent absolute left-0 top-0 px-2 text-xs outline-none text-ellipsis overflow-hidden  dark:text-white `}
				type='text'
				value={props.value}
				tabIndex={props.tabIndex}
				autoComplete={props.autoComplete || 'off'}
				onChange={(e) => {
					const value = e.target.value;
					props.onChange(value);
					updateStyles(e);
				}}
				onFocus={(e) => {
					$(e.target).closest('div').removeClass('border-zinc-200').addClass('border-zinc-400');
					updateStyles(e);
				}}
				onBlur={(e) => {
					$(e.target).closest('div').addClass('border-zinc-200').removeClass('border-zinc-400');
					updateStyles(e);
				}}
			/>
		</div>
	);
}

export function PasswordInput(props) {
	const [passwordVisible, setPasswordVisible] = React.useState('');
	const updateStyles = function (e) {
		const _this = $(e.target);
		const span = $(e.target).closest('div').find('span').first();
		const value = e.target.value;
		if (value) {
			span.addClass('text-[10px] pt-1');
			span.removeClass('text-xs items-center');
			_this.addClass('pt-3');
		} else {
			span.addClass('items-center text-xs');
			span.removeClass('text-[10px] pt-1');
			_this.removeClass('pt-3');
		}
	};
	return (
		<div
			className={`bg-zinc-50 dark:bg-neutral-700 border border-zinc-200 dark:border-none rounded h-10 relative ${props.className}  transition-all`}
		>
			<span className='w-full h-full absolute left-0 top-0 px-2 text-xs flex items-center text-zinc-400 text-ellipsis overflow-hidden transition-all select-none'>
				{props.placeholder}
			</span>
			<input
				className={`w-4/5 h-full bg-transparent absolute left-0 top-0 px-2 text-xs outline-none text-ellipsis overflow-hidden dark:text-white`}
				type={`${passwordVisible ? 'text' : 'password'}`}
				value={props.value}
				tabIndex={props.tabIndex}
				autoComplete={props.autoComplete || 'off'}
				onChange={(e) => {
					const value = e.target.value;
					props.onChange(value);
					updateStyles(e);
				}}
				onFocus={(e) => {
					$(e.target).closest('div').removeClass('border-zinc-200').addClass('border-zinc-400');
					updateStyles(e);
				}}
				onBlur={(e) => {
					$(e.target).closest('div').addClass('border-zinc-200').removeClass('border-zinc-400');
					updateStyles(e);
				}}
			/>
			<span
				className={`absolute right-2 h-full flex items-center cursor-pointer select-none text-sm font-medium  dark:text-white/70 ${
					!props.value && 'hidden'
				}`}
				onClick={(e) => {
					setPasswordVisible((prev) => !prev);
				}}
				tabIndex={props.tabIndex + 1}
			>
				{passwordVisible ? 'Hide' : 'Show'}
			</span>
		</div>
	);
}

export function SubmitBTN(props) {
	return (
		<div
			id='submit-btn'
			className={`flex justify-center items-center bg-primary h-8 rounded relative   ${
				props.disabled ? 'opacity-50' : 'cursor-pointer'
			} ${props.className}`}
			onClick={(e) => {
				if ($('#submit-btn').hasClass('cursor-pointer')) {
					props.onClick();
				}
			}}
		>
			<span
				className={`w-full h-full text-sm text-white tracking-wide font-bold flex justify-center items-center ${
					props.loading && 'hidden'
				}`}
				tabIndex={props.tabIndex}
				onChange={(e) => {
					const _this = $(e.target);
					const span = $(e.target).closest('div').children('span');
					const value = e.target.value;
					props.onChange(value);
					if (value) {
						span.addClass('text-[10px] pt-1');
						span.removeClass('text-xs items-center');
						_this.addClass('pt-3');
					} else {
						span.addClass('items-center text-xs');
						span.removeClass('text-[10px] pt-1');
						_this.removeClass('pt-3');
					}
				}}
			>
				{props.text}
			</span>
			<img src={LOADING} alt='' className={`w-5 animate-spin ${!props.loading && 'hidden'}`} />
		</div>
	);
}
