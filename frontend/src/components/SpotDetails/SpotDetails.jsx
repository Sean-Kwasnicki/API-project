import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSpotDetails } from '../../store/spotDetails';
import StarRating from './StarRating';
import Reviews from '../Reviews/Reviews';
import './SpotDetails.css';
import { getAllSpots } from '../../store/spot';

function SpotDetails() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spotDetails[spotId]);

  useEffect(() => {
    dispatch(getSpotDetails(spotId));
    dispatch(getAllSpots(spotId))
  }, [dispatch, spotId]);


  if (!spot) {
    return <div>Loading...</div>;
  }

  // Find the preview image
  const previewImage =spot.SpotImages && spot.SpotImages.length > 0 ? spot.SpotImages[0].url :`/public/SpotImages/${spot.name}.jpeg`

  return (

    <div className="spot-details-container">
      <div className="spot-details-main">
        <h1 className="spot-name">{spot.name}</h1>
        <p className="spot-location">{spot.city}, {spot.state}, {spot.country}</p>

  

{previewImage ? (
          <img src={previewImage} alt="Preview" className="main-image"/>
        ) : (
          <p>No preview image available.</p>
        )}
        {spot.SpotImages.slice(1).map((image, index) => {
            // Do not repeat the preview image
            return <img key={index} src={image.url} alt={`Spot ${index}`} />;

        })}

        <div className="spot-description">
          <p>{spot.description}</p>
          <p>Hosted by {spot.Owner.firstName} {spot.Owner.lastName} ~ {spot.Owner.username}</p>
        </div>
      </div>
      <div className="spot-details-sidebar">
        <div className="pricing-box">
          <p className="spot-price">${spot.price} <span className="per-night">per night</span></p>
          {/* <StarRating rating={spot.avgStarRating} />
          <p className="spot-rating">Average Star Rating: {spot.avgStarRating} </p> */}
          <div className="spot-rating">
        <StarRating rating={spot.avgStarRating} />
        {spot.numReviews > 0 && (
          <>
            <span> · </span>
            <span>{spot.numReviews} {spot.numReviews === 1 ? 'Review' : 'Reviews'}</span>
          </>
        )}
      </div>
          <button className="reserve-button" onClick={() => alert('Feature coming soon')}>Reserve</button>
        </div>
            <Reviews spot={spot.Reviews}/>
      </div>
    </div>
  );
}

export default SpotDetails;
