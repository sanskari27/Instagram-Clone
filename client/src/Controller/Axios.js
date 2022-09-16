import axios from 'axios';

const PROTOCOL = window.location.protocol;
const BASE_URL = window.location.hostname;
const PORT = 9000;

const URL = PROTOCOL + '//' + BASE_URL + ':' + PORT;

const axiosInstance = axios.create({
	baseURL: URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

export default axiosInstance;
