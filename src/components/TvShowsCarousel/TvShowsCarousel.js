import { useEffect, useState } from "react";
import { Scroller } from "@enact/sandstone/Scroller";
import { ImageItem } from "@enact/sandstone/ImageItem";
import { VirtualGridList } from "@enact/sandstone/VirtualList";

const TvShowsCarousel = ({ setPanelIndex, setSelectedMovieId }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("https://quiet-coast-60557-5151c2363932.herokuapp.com/api/tvShows")
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  const itemWidth = window.innerWidth / 4; // Adjust this value as needed

  const handleSelect = (id) => {
    setSelectedMovieId(id);
    setPanelIndex(2);
  };

  return (
    <Scroller direction="horizontal" noScrollByWheel noScrollByDrag>
      <div style={{ height: "300px" }}>
        <VirtualGridList
          dataSize={items.length}
          itemRenderer={({ index: itemIndex, ...rest }) => (
            <ImageItem
              {...rest}
              src={items[itemIndex].horizontal_poster}
              onClick={() => handleSelect(items[itemIndex]._id)}
            >
              {items[itemIndex].show_name}
            </ImageItem>
          )}
          itemSize={{ minWidth: itemWidth, minHeight: 300 }} // Adjust the item size as needed
          noScrollByWheel
          direction="horizontal"
          column={items.length}
          horizontalScrollbar="hidden"
        />
      </div>
    </Scroller>
  );
};

export default TvShowsCarousel;
