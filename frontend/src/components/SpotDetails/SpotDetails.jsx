import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSpotDetails } from '../../store/spotDetails';
import StarRating from './StarRating';
import './SpotDetails.css';

function SpotDetails() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spotDetails[spotId]);

  useEffect(() => {
    dispatch(getSpotDetails(spotId));
  }, [dispatch, spotId]);

  if (!spot) {
    return <div>Loading...</div>;
  }

  return (

    <div className="spot-details-container">
      <div className="spot-details-main">
        <h1 className="spot-name">{spot.name}</h1>
        <p className="spot-location">{spot.city}, {spot.state}, {spot.country}</p>
        <div className="spot-images-large">
          <img src={spot.previewImage} alt="Main Spot" className="main-image" />
        </div>
        <div className="spot-images-small">
          {spot.SpotImages.slice(0, 4).map((image, index) => (
            <img key={index} src={image.url} alt={`Spot ${index + 1}`} />
          ))}
        </div>
        <div className="spot-description">
          <p>{spot.description}</p>
          <p>Hosted by {spot.Owner.firstName} {spot.Owner.lastName}</p>
        </div>
      </div>
      <div className="spot-details-sidebar">
        <div className="pricing-box">
          <p className="spot-price">${spot.price} <span className="per-night">per night</span></p>
          <StarRating rating={spot.avgStarRating} />
          <p className="spot-rating">Average Star Rating: {spot.avgStarRating} </p>
          <p className="spot-rating">{spot.numReviews} Total reviews</p>
          <button className="reserve-button" onClick={() => alert('Feature coming soon')}>Reserve</button>
        </div>
      </div>
    </div>
  );
}

export default SpotDetails;
