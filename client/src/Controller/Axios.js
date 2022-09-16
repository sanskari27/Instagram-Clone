import axios from 'axios';

const PROTOCOL = window.location.protocol;
const BASE_URL = window.location.hostname;
const PORT = 9000;

const axiosInstance = axios.create({
	baseURL: PROTOCOL + '//' + BASE_URL + ':' + PORT,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

export default axiosInstance;
