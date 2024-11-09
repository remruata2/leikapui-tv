import { useEffect, useState } from "react";
import { Scroller } from "@enact/sandstone/Scroller";
import { ImageItem } from "@enact/sandstone/ImageItem";
import { VirtualGridList } from "@enact/sandstone/VirtualList";
import { Panels, Panel } from "@enact/sandstone/Panels";
import MovieDetail from "../MovieDetail/MovieDetail";

const Movies = () => {
  const [movieIndex, setMovieIndex] = useState(0);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("https://quiet-coast-60557-5151c2363932.herokuapp.com/api/movies")
      .then((response) => response.json())
      .then((data) => setItems(data.data))
      .catch((error) => console.error("Error:", error));
  }, []);

  const itemWidth = window.innerWidth / 4; // Adjust this value as needed

  const handleSelect = (id) => {
    setSelectedMovieId(id);
    setMovieIndex(1);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Backspace" || event.key === "Escape") {
      setMovieIndex(0);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Panels index={movieIndex} onBack={() => setMovieIndex(0)}>
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
              >
                {items[itemIndex].title}
              </ImageItem>
            )}
            itemSize={{ minWidth: itemWidth, minHeight: 300 }} // Adjust the item size as needed
            noScrollByWheel
            column={4} // Adjust the number of columns as needed
          />
        </Scroller>
      </Panel>
      <Panel>
        <MovieDetail selectedMovieId={selectedMovieId} />
      </Panel>
    </Panels>
  );
};

export default Movies;
