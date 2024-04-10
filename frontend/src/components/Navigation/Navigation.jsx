// frontend/src/components/Navigation/Navigation.jsx

import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import heartBNBLogo from '../images/heartbnb.png';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav className="navigation">
      <NavLink to="/">
        <img src={heartBNBLogo} alt="Airbnb" className="logo" />
      </NavLink>
      <div className='navigation-links'>
      {sessionUser && (
        <NavLink to="/spots/new" className="create-new-spot-link">Create a New Spot</NavLink>
      )}
      {isLoaded && <ProfileButton user={sessionUser} />}
      </div>
    </nav>
  );
}

export default Navigation;
