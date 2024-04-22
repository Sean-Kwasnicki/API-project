import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteSpot, getAllSpots } from '../../store/spot';
import StarRating from '../SpotDetails/StarRating';
import ConfirmSpotDeleteModal from './ConfirmSpotDeleteModal';
import { useModal } from '../../context/Modal';
import './ManageSpots.css'

function ManageSpots() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allSpots = useSelector(state => Object.values(state.spot));
  const spotDetails = useSelector(state => Object.values(state.spotDetails))
  const userId = useSelector(state => state.session.user.id);

  const { setModalContent, closeModal } = useModal();

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
      <div className="spots-grid">
      {userSpots.length > 0 ? (
        <div className="spot-tile-container">
          {userSpots.map(spot => (
            <div key={spot.id} className="spot-tile" onClick={() => navigate(`/spots/${spot.id}`)}>
             <img src={spot.SpotImages && spot.SpotImages.length > 0 ? spot.SpotImages[0].url :`/public/SpotImages/${spot.name}.jpeg`} alt={spot.name} className="spot-thumbnail"/>
             <div className="spot-info">
                        <div className="info-and-rating">
                            <div className="location-and-price">
                              <div className="location-and-rating">
                                <p className="spot-location">{spot.city}, {spot.state}</p>
                                <div className="rating">
                                <StarRating rating={spot.avgRating} />
                                </div>
                              </div>
                                <p className="spot-price">${spot.price} per night</p>
                            </div>
                        </div>
                    </div>
                    <span className="tooltip">{spot.name}</span>
              <div className='manage-buttons'>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/spots/${spot.id}/edit`); }}>Update</button>
              <button onClick={(e) => {
                e.stopPropagation();
              const confirmModal = (
                <ConfirmSpotDeleteModal
                  spotId={spot.id}
                  onClose={closeModal}
                  onConfirm={() => {
                    dispatch(deleteSpot(spot.id));
                    closeModal();
                    dispatch(getAllSpots());
                  }}
                />
              );
              setModalContent(confirmModal);
            }}>Delete</button>
              </div>

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
    </div>
  );
}

export default ManageSpots;
