import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllSpots} from "../../store/spot";
import { NavLink } from "react-router-dom";
import StarRating from "../SpotDetails/StarRating";
import './Spots.css';
import { getSpotDetails } from "../../store/spotDetails";



function Spots() {
    const dispatch = useDispatch();
    const allSpots = useSelector(state => Object.values(state.spot));
    const spotDetails = useSelector(state => Object.values(state.spotDetails))
    const [currentPage, setCurrentPage] = useState(1);
    const [spotsPerPage] = useState(25);

    useEffect(() => {
      dispatch(getSpotDetails())
      dispatch(getAllSpots());
    }, [dispatch]);


  const allSpotsWithImages = allSpots.map(spot => {
    const details = spotDetails.find(detail => detail.id === spot.id);
    const images = details && details.SpotImages.length > 0 ? details.SpotImages : spot.SpotImages;
    return {
        ...spot,
        SpotImages: images  
    };
  });

  function renderImage(spot) {
    if (spot.SpotImages && spot.SpotImages.length > 0) {
      return <img src={spot.SpotImages[0].url} alt={spot.name} className="spot-thumbnail" />;
    } else {
      return <div className="no-image" style={{ backgroundColor: "transparent"  }}></div>;
    }
  }

    // Get current spots
    const indexOfLastSpot = currentPage * spotsPerPage;
    const indexOfFirstSpot = indexOfLastSpot - spotsPerPage;
    const currentSpots = allSpotsWithImages.slice(indexOfFirstSpot, indexOfLastSpot);
    console.log('Current Spot:',currentSpots)
    // Change page
    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <div>
            <div className="spots-grid">
              {currentSpots.map(spot => (
                <div className="spot-tile" key={spot.id}>
          <NavLink to={`/spots/${spot.id}`} className="spot-link">
                {renderImage(spot)}
                    <div className="spot-info">
                      <p className="spot-location">{spot.city}, {spot.state}</p>
                      <p className="spot-price">${spot.price} per night</p>
                      <StarRating rating={spot.avgRating} />
                      <span className="tooltip">{spot.name}</span>
                    </div>
                  </NavLink>
                </div>
              ))}
            </div>
            <div className="pagination">
                {Array.from({ length: Math.ceil(allSpots.length / spotsPerPage) }, (_, i) => (
                    <button key={i + 1} onClick={() => paginate(i + 1)}>
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
      );
}

export default Spots;
