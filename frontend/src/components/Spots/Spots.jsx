import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllSpots } from "../../store/spot";
import { NavLink } from "react-router-dom";
import StarRating from "../SpotDetails/StarRating";
import './Spots.css';

function Spots() {
    const dispatch = useDispatch();
    const spots = useSelector(state => Object.values(state.spot));
  
    useEffect(() => {
      dispatch(getAllSpots());
    }, [dispatch]);
  
    // return (
    //   <div className="spots-grid">
    //     {spots.map(spot => (
    //       <div className="spot-tile" key={spot.id}>
    //         <NavLink to={`/spots/${spot.id}`}>
    //           <img src={spot.previewImage} alt={spot.name} className="spot-thumbnail"/>
    //           <div className="spot-info">
    //             <p className="spot-location">{spot.city}, {spot.state}</p>
    //             <p className="spot-price">${spot.price} per night</p>
    //             {/* Tooltip for spot name */}
    //             <span className="tooltip">{spot.name}</span>
    //           </div>
    //         </NavLink>
    //       </div>
    //     ))}
    //   </div>
    // );
    return (
        <div className="spots-grid">
          {spots.map(spot => (
            <div className="spot-tile" key={spot.id}>
              <NavLink to={`/spots/${spot.id}`} className="spot-link">
                <img src={spot.previewImage} alt={spot.name} className="spot-thumbnail"/>
                <div className="spot-info">
                  <p className="spot-location">{spot.city}, {spot.state}</p>
                  <p className="spot-price">${spot.price} per night</p>
                  <StarRating rating={spot.avgRating || 'New'} /> {/* Display star rating or "New" */}
                  <span className="tooltip">{spot.name}</span> {/* Tooltip for spot name */}
                </div>
              </NavLink>
            </div>
          ))}
        </div>
      );
  }
  
  export default Spots;