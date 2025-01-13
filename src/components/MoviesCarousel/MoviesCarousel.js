import { useEffect, useState } from "react";
import { Scroller } from "@enact/sandstone/Scroller";
import { ImageItem } from "@enact/sandstone/ImageItem";
import { VirtualGridList } from "@enact/sandstone/VirtualList";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";

const MoviesCarousel = ({ setPanelIndex, setSelectedMovieId }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/movies`)
      .then((response) => response.json())
      .then((data) => setItems(data.data))
      .catch((error) => console.error("Error:", error));
  }, []);

  const itemWidth = window.innerWidth / 4;

  const handleSelect = (id) => {
    setSelectedMovieId(id);
    setPanelIndex(1);
  };

  const handleItemClick = (id) => {
    handleSelect(id);
  };

  return (
    <Scroller 
      direction="horizontal" 
      focusableScrollbar
      spotlightDisabled={false}
    >
      <div style={{ height: "300px" }}>
        <VirtualGridList
          dataSize={items.length}
          itemRenderer={({ index: itemIndex, ...rest }) => (
            <ImageItem
              {...rest}
              src={items[itemIndex].horizontal_poster}
              onClick={() => handleItemClick(items[itemIndex]._id)}
              spotlightDisabled={false}
            >
              {items[itemIndex].title}
            </ImageItem>
          )}
          itemSize={{ minWidth: itemWidth, minHeight: 300 }}
          direction="horizontal"
          horizontalScrollbar="hidden"
          spotlightDisabled={false}
        />
      </div>
    </Scroller>
  );
};

const CarouselDecorator = SpotlightContainerDecorator({
  enterTo: 'default-element',
  preserveId: true,
  continue5WayHold: true
});

export default CarouselDecorator(MoviesCarousel);
