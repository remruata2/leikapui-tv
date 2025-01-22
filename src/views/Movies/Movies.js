import { useEffect, useState } from "react";
import { Scroller } from "@enact/sandstone/Scroller";
import { ImageItem } from "@enact/sandstone/ImageItem";
import { VirtualGridList } from "@enact/sandstone/VirtualList";
import { Panel } from "@enact/sandstone/Panels";

const Movies = ({ setPanelIndex, setSelectedMovieId }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/movies`)
      .then((response) => response.json())
      .then((data) => setItems(data.data))
      .catch((error) => console.error("Error:", error));
  }, []);

  const itemWidth = window.innerWidth / 4; // Adjust this value as needed

  const handleSelect = (id) => {
    setSelectedMovieId(id);
    setPanelIndex(1); // Navigate directly to MovieDetail panel
  };

  return (
    <Panel>
      <Scroller noScrollByWheel noScrollByDrag>
        <VirtualGridList
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
    </Panel>
  );
};

export default Movies;
