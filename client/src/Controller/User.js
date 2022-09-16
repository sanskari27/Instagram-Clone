import { useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

const init = {
	username: '',
	name: '',
	dp: '',
	private: '',
	email: '',
	website: '',
	bio: '',
	gender: '',
	dob: '',
	darkMode: false,
};

let _setProfile = () => {
	throw new Error('Create an instance using initProfile');
};
let _profile = { ...init };

export const initProfile = singletonHook(init, () => {
	const [profile, setProfile] = useState(init);
	_profile = profile;
	_setProfile = setProfile;
	return profile;
});

export const getProfile = () => _profile;
export const setProfile = (details) => {
	localStorage.setItem('darkMode', details.darkMode);
	_setProfile(details);
};
export const clearProfile = () => _setProfile({});
