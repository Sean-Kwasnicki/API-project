import { useState, } from 'react';
import { useDispatch } from 'react-redux';
import { createReview } from '../../store/reviews';
import { getSpotDetails } from '../../store/spotDetails';
//import { getAllSpots } from '../../store/spot';
import { FaStar } from 'react-icons/fa';
import { useModal } from '../../context/Modal';
import './ReviewFormModal.css'

function ReviewFormModal({ spotId}) {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [errors, setErrors] = useState([]);
  const [hover, setHover] = useState(0); // For hover state of stars
  const { closeModal } = useModal();


  const handleSubmit = async (e) => {
      e.preventDefault();
      if (review.length >= 10 && rating > 0) {
          const response = await dispatch(createReview(spotId, { review, stars: rating }));
          if (response) {

                dispatch(getSpotDetails(spotId));
                //dispatch(getAllSpots(spotId))
                closeModal(); // Close modal only if the submission is successful
          } else {
              setErrors(['Could not post your review. Please try again.']);
          }
      } else {
          setErrors(['Ensure all fields are properly filled out.']);
      }
  };

  return (
      <form onSubmit={handleSubmit} className="review-form">
          <h2>How was your stay?</h2>
          <div className="star-rating">
              {[...Array(5)].map((star, index) => {
                  index += 1;
                  return (
                      <button
                          type="button"
                          key={index}
                          className={index <= (hover || rating) ? "on" : "off"}
                          onClick={() => setRating(index)}
                          onMouseEnter={() => setHover(index)}
                          onMouseLeave={() => setHover(rating)}
                          style={{ background: "none", border: "none", cursor: "pointer" }}>
                          <FaStar color={index <= (hover || rating) ? "gold" : "gray"} />
                      </button>
                  );
              })}
          </div>
          <textarea
              placeholder="Leave your review here..."
              required
              minLength="10"
              value={review}
              onChange={e => setReview(e.target.value)}
              style={{ width: "100%", height: "100px" }}
          ></textarea>
          <button type="submit" disabled={review.length < 10 || rating === 0}>
              Submit Your Review
          </button>
          {errors.map((error, idx) => <p key={idx} className="error-message">{error}</p>)}
      </form>
  );
}

export default ReviewFormModal;
