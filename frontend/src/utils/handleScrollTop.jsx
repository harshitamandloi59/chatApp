import React from "react";

const handleScrollTop = () => {
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});
};

export const handleScrollEnd = (box) => {
	if (box && typeof box.scrollTo === 'function') {
		box.scrollTo({
			left: box.scrollWidth,
			behavior: "smooth",
		});
	}
};

export default handleScrollTop;
