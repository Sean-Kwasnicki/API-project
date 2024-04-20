import './StarRating.css';
import { FaStar } from 'react-icons/fa';

function StarRating({ rating }) {
  const totalStars = 5;
  let stars = [];
  const fullStars = Math.floor(rating); // Number of full stars
  const fractionalPart = rating - fullStars; // Fractional part of the rating

  // Handle the case where there is no rating (rating is 0)
  if (!fullStars) {
    return (
      <div className="new-rating">
        <FaStar className="new-star" /> <span> New</span>
      </div>
    );
  }

  for (let i = 1; i <= totalStars; i++) {
    if (i <= fullStars) {
      stars.push(<span className="star full-star" key={i}><FaStar /></span>);
    } else if (i === fullStars + 1 && fractionalPart > 0) {
      // Calculate width for the fractional star
      const widthPercentage = `${fractionalPart * 100}%`;
      stars.push(
        <span className="star empty-star" key={i} style={{position: 'relative'}}>
          <FaStar /> {/* This is the empty star */}
          <FaStar className="half-star-overlay" style={{
            clipPath: `polygon(0 0, ${widthPercentage} 0, ${widthPercentage} 100%, 0 100%)`
          }} /> {/* This is the fractional star overlay */}
        </span>
      );
    } else {
      stars.push(<span className="star empty-star" key={i}><FaStar /></span>);
    }
  }

  return (
    <div className="star-rating">
      {stars}
      <span className="avg-rating">{rating.toFixed(1)}</span> {/* Display the average rating */}
    </div>
  );
}

export default StarRating;
