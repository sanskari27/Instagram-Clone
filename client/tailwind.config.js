module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: 'rgb(0,149,246)',
				zinc: {
					150: '#EFEFEF',
				},
			},
			fontFamily: {
				sans: ['Roboto'],
			},
		},
	},
	plugins: [require('@tailwindcss/line-clamp')],
};
