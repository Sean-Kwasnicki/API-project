// frontend/src/components/Navigation/OpenModalMenuItem.jsx

import { useModal } from '../../context/Modal';

function OpenModalMenuItem({
  modalComponent,
  itemText,
  onItemClick,
  onModalClose 
}) {
  const { setModalContent, setOnModalClose } = useModal();

  const onClick = () => {
    if (onModalClose) setOnModalClose(onModalClose);
    setModalContent(modalComponent);
    if (typeof onItemClick === "function") onItemClick();
  };

  return (
    <li onClick={onClick}>{itemText}</li>
  );
}

export default OpenModalMenuItem;
