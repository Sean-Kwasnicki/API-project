import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getAllReviews } from '../../store/reviews';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import ReviewFormModal from './ReviewFormModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { useModal } from '../../context/Modal';

function Reviews() {
  const dispatch = useDispatch();
  const { spotId } = useParams();
  const reviews = useSelector(state => state.reviews[spotId] || []);
  const sessionUser = useSelector(state => state.session.user);
  const spotDetails = useSelector(state => state.spotDetails[spotId]);
  console.log('Session User:',sessionUser)

  const { setModalContent, closeModal } = useModal();

  useEffect(() => {
    dispatch(getAllReviews(spotId));
  }, [dispatch, spotId]);

  console.log('Session User:',sessionUser)
  const userHasReviewed = reviews.some(review => review.userId === sessionUser?.id);

  const showModalButton = sessionUser && sessionUser?.id !== spotDetails.ownerId && !userHasReviewed;

  const isOwner = sessionUser && sessionUser?.id === spotDetails.ownerId;

  return (
    <div className="reviews-container">
      <h3>Reviews</h3>
      {showModalButton && (
        <OpenModalButton
          modalComponent={<ReviewFormModal spotId={spotId} />}
          buttonText="Post Your Review"
        />
      )}
      {reviews.length === 0 && (
        <p>{isOwner ? "No reviews yet." : "Be the first to review this spot!"}</p>
      )}
      {reviews.map(review => (
        <div key={review.id} className="review-item">
          <p className='created-review'> {review.User?.username || review.User?.firstName} - {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          <p className="review-text">{review.review}</p>
          {sessionUser && sessionUser.id === review.userId && (
            <button onClick={() => {
              const confirmModal = (
                <ConfirmDeleteModal
                  reviewId={review}
                  spotId={spotId}
                  onClick={closeModal}
                />
              );
              setModalContent(confirmModal);
            }}>Delete</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Reviews;
