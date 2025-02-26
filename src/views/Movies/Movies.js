import { useState, useEffect } from "react";
import { Scroller } from "@enact/sandstone/Scroller";
import { ImageItem } from "@enact/sandstone/ImageItem";
import { VirtualGridList } from "@enact/sandstone/VirtualList";
import { Spotlight } from "@enact/spotlight";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";

const MoviesBase = ({ setPanelIndex, setSelectedMovieId }) => {
	const [items, setItems] = useState([]);

	useEffect(() => {
		fetch(`${process.env.REACT_APP_API_URL}/api/movies`)
			.then((response) => response.json())
			.then((data) => setItems(data.data))
			.catch((error) => console.error("Error:", error));
	}, []);

	useEffect(() => {
		// Auto-focus the grid when mounted/returned to
		const grid = document.querySelector('[data-spotlight-id="movies-grid"]');
		if (grid) {
			setTimeout(() => Spotlight.focus(grid), 50);
		}

		return () => {
			// Clear focus state when leaving Movies view
			window.localStorage.removeItem("moviesLastFocus");
		};
	}, []);

	const itemWidth = window.innerWidth / 4;

	const handleSelect = (id) => {
		setSelectedMovieId(id);
		setPanelIndex(1);
	};

	return (
		<Scroller noScrollByWheel noScrollByDrag>
			<VirtualGridList
				data-spotlight-id="movies-grid"
				dataSize={items.length}
				itemRenderer={({ index: itemIndex, ...rest }) => (
					<ImageItem
						{...rest}
						key={items[itemIndex]._id}
						src={items[itemIndex].horizontal_poster}
						onClick={() => handleSelect(items[itemIndex]._id)}
						style={{
							width: itemWidth,
							height: (itemWidth * 9) / 16,
						}}
					>
						{items[itemIndex].title}
					</ImageItem>
				)}
				itemSize={{ minWidth: itemWidth, minHeight: 300 }}
				noScrollByWheel
				column={4}
			/>
		</Scroller>
	);
};

const Movies = SpotlightContainerDecorator(
	{
		enterTo: "last-focused",
		leaveFor: { left: "", right: "" },
		restrict: "self-only",
	},
	MoviesBase
);

export default Movies;
