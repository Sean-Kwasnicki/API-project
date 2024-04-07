// frontend/src/components/Navigation/ProfileButton.jsx
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FaUserAlt } from 'react-icons/fa'; // Assuming you're using react-icons for the profile icon
import * as sessionActions from '../../store/session';

function ProfileButton({ user }) {
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef(null); // Ref to the dropdown for detecting outside clicks
  const dispatch = useDispatch();

  const openMenu = () => {
    if (!showMenu) {
      setShowMenu(true);
    }
  };

  useEffect(() => {
    // Function to detect click outside the dropdown and close it
    const closeMenu = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', closeMenu);
    }

    // Cleanup event listener on component unmount or when dropdown closes
    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button onClick={openMenu}>
        <FaUserAlt /> {/* Profile Icon */}
      </button>
      {showMenu && (
        <ul>
          <li>{user.username}</li>
            <li>{user.firstName} {user.lastName}</li>
            <li>{user.email}</li>
            <button onClick={logout}>Logout</button>
        </ul>
      )}
    </div>
  );
}

export default ProfileButton;
