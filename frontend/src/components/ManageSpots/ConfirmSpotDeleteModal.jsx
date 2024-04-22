import { useModal } from '../../context/Modal';
import { useDispatch } from 'react-redux';
import { deleteSpot, getAllSpots } from '../../store/spot';
import '../Reviews/ConfirmDeleteModal.css'

function ConfirmSpotDeleteModal({ spotId }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleConfirmDelete = async () => {
    await dispatch(deleteSpot(spotId));
    dispatch(getAllSpots());
    closeModal(); // Close the modal after action
  };

  return (
    <div className="confirm-delete-modal">
      <h2 className="modal-title">Confirm Delete</h2>
      <p className="modal-message">Are you sure you want to delete this review?</p>
      <div className="modal-buttons">
        <button onClick={handleConfirmDelete} className="modal-button-delete">Yes (Delete Spot)</button>
        <button onClick={closeModal} className="modal-button-cancel">No (Keep Spot)</button>
      </div>
    </div>
  );
}


export default ConfirmSpotDeleteModal;
