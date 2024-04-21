import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteSpot, getAllSpots } from '../../store/spot';
import StarRating from '../SpotDetails/StarRating';
import './ManageSpots.css'

function ManageSpots() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allSpots = useSelector(state => Object.values(state.spot));
  const spotDetails = useSelector(state => Object.values(state.spotDetails))
  const userId = useSelector(state => state.session.user.id);

  useEffect(() => {
    dispatch(getAllSpots());
  }, [dispatch]);


    const allSpotsWithImages = allSpots.map(spot => {
      const details = spotDetails.find(detail => detail.id === spot.id);
      const images = details && details.SpotImages.length > 0 ? details.SpotImages : spot.SpotImages;
      return {
          ...spot,
          SpotImages: images.length > 0 ? images : [{ url: `/public/SpotImages/${spot.name}.jpeg` }] 
      };
  });


  const userSpots = allSpotsWithImages.filter(spot => spot.ownerId === userId);


  return (
    <div>
      <h1>Manage Spots</h1>
      {userSpots.length > 0 ? (
        <div className="spot-tile-container">
          {userSpots.map(spot => (
            <div key={spot.id} className="spot-tile" onClick={() => navigate(`/spots/${spot.id}`)}>
             <img src={spot.SpotImages && spot.SpotImages.length > 0 ? spot.SpotImages[0].url :`/public/SpotImages/${spot.name}.jpeg`} alt={spot.name} className="spot-thumbnail"/>
              <p>{spot.location}</p>
              <StarRating rating={spot.avgRating} />
              <p>${spot.price} per night</p>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/spots/${spot.id}/edit`); }}>Update</button>
              <button onClick={(e) => { e.stopPropagation(); dispatch(deleteSpot(spot.id)); }}>Delete</button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p>No spots posted yet.</p>
          <button onClick={() => navigate('/spots/new')}>Create a New Spot</button>
        </div>
      )}
    </div>
  );
}

export default ManageSpots;
