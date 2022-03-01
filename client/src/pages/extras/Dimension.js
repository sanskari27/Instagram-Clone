import React from 'react';

export default function Dimension(myRef) {
	const [dimensions, setDimensions] = React.useState({
		width: 0,
		height: 0,
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	});

	React.useEffect(() => {
		const getDimensions = () => ({
			width: myRef.current.offsetWidth,
			height: myRef.current.offsetHeight,
			left: myRef.current.offsetLeft,
			right: myRef.current.offsetRight,
			top: myRef.current.offsetTop,
			bottom: myRef.current.offsetBottom,
		});

		const handleResize = () => {
			setDimensions(getDimensions());
		};

		if (myRef.current) {
			setDimensions(getDimensions());
		}

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [myRef]);

	return dimensions;
}
