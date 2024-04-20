import { useModal } from '../../context/Modal';
import { useDispatch } from 'react-redux';
import { deleteReview, getAllReviews } from '../../store/reviews';
import { getSpotDetails } from '../../store/spotDetails';
import './ConfirmDeleteModal.css'

function ConfirmDeleteModal({ reviewId, spotId }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleConfirmDelete = async () => {
    await dispatch(deleteReview(reviewId));
    dispatch(getAllReviews(spotId));
    dispatch(getSpotDetails(spotId));
    closeModal(); // Close the modal after action
  };

  return (
    <div className="confirm-delete-modal">
      <h2 className="modal-title">Confirm Delete</h2>
      <p className="modal-message">Are you sure you want to delete this review?</p>
      <div className="modal-buttons">
        <button onClick={handleConfirmDelete} className="modal-button-delete">Yes (Delete Review)</button>
        <button onClick={closeModal} className="modal-button-cancel">No (Keep Review)</button>
      </div>
    </div>
  );
}


export default ConfirmDeleteModal;
