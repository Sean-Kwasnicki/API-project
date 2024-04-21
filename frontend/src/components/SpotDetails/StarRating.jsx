import './StarRating.css';
import { FaStar } from 'react-icons/fa';

function StarRating({ rating }) {
  const totalStars = 5;
  let stars = [];
  const fullStars = Math.floor(rating);
  const fractionalPart = rating - fullStars;

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
      const widthPercentage = `${fractionalPart * 100}%`;
      stars.push(
        <span className="star empty-star" key={i} style={{position: 'relative'}}>
          <FaStar />
          <FaStar className="half-star-overlay" style={{
            clipPath: `polygon(0 0, ${widthPercentage} 0, ${widthPercentage} 100%, 0 100%)`
          }} />
        </span>
      );
    } else {
      stars.push(<span className="star empty-star" key={i}><FaStar /></span>);
    }
  }

  return (
    <div className="star-rating">
      {stars}
      <span className="avg-rating">{rating.toFixed(1)}</span>
    </div>
  );
}

export default StarRating;
