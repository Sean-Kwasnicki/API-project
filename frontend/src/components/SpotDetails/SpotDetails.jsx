import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSpotDetails } from '../../store/spotDetails';
import StarRating from './StarRating';
import Reviews from '../Reviews/Reviews';
import './SpotDetails.css';
import '../Reviews/Reviews.css'

import { getAllSpots } from '../../store/spot';

function SpotDetails() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spotDetails[spotId]);

  useEffect(() => {
      dispatch(getSpotDetails(spotId));
      dispatch(getAllSpots());
  }, [dispatch, spotId]);

  if (!spot) {
      return <div>Loading...</div>;
  }

  const previewImage = spot.SpotImages && spot.SpotImages.length > 0 ? spot.SpotImages[0].url : `/public/SpotImages/${spot.name}.jpeg`;

  return (
      <div className="spot-details-container">
          <div className="spot-details-main">
            <div className='header'>
              <h1 className="spot-name">{spot.name}</h1>
              <p className="location-header">{spot.city}, {spot.state}</p>
            </div>
              <div className="image-section">
                  <img src={previewImage} alt="Preview" className="main-image"/>
                  <div className="spot-images-small">
                      {spot.SpotImages.slice(1).map((image, index) => (
                          <img key={index} src={image.url} alt={`Spot ${index}`} />
                      ))}
                  </div>
              </div>
              <div className="spot-description">
                  <p className='host-details-text'>Hosted by {spot.Owner.firstName} {spot.Owner.lastName}</p>
                  <div className="pricing-box">
                    <div className='location-and-rating-box'>
                    <p className="spot-price-box">${spot.price} <span className="per-night">per night</span></p>
                    <div className="Star-Rating">
                      <StarRating rating={spot.avgStarRating} />
                      {spot.numReviews > 0 && (
                          <>
                              <span className='dot'>·</span>
                              <span className='numReviews'>{spot.numReviews} {spot.numReviews === 1 ? 'Review' : 'Reviews'}</span>
                          </>
                      )}
                    </div>
                    </div>
                    <button className="reserve-button" onClick={() => alert('Feature coming soon')}>Reserve</button>
                </div>
              </div>
              <div className="spot-description-text">
                  <p className='spot-text'>{spot.description}</p>
              </div>
          </div>
              <div className='Reviews'>
              <div className='Star-Rating'>
                <div className='reviews-rating'></div>
               <StarRating rating={spot.avgStarRating} />
                      {spot.numReviews > 0 && (
                          <>
                              <span className='dot'>·</span>
                              <span className='numReviews'>{spot.numReviews} {spot.numReviews === 1 ? 'Review' : 'Reviews'}</span>
                          </>
                      )}
              </div>
              <Reviews spot={spot.Reviews}/>
          </div>
      </div>
  );
}

export default SpotDetails;
