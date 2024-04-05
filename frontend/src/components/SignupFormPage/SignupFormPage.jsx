// frontend/src/components/SignupFormPage/SignupFormPage.jsx

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import * as sessionActions from '../../store/session';

import './SignupForm.css';

function SignupFormPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password
        })
      ).catch(async (res) => {
        const data = await res.json();
        if (data?.errors) {
          setErrors(data.errors);
        }
      });
    }
    return setErrors({
      confirmPassword: "Confirm Password field must be the same as the Password field"
    });
  };

  return (
    <div className="signup-form">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Email
            <input className="form-input" type="text" value={email}
                   onChange={(e) => setEmail(e.target.value)} required />
          </label>
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Username
            <input className="form-input" type="text" value={username}
                   onChange={(e) => setUsername(e.target.value)} required />
          </label>
          {errors.username && <p className="error-message">{errors.username}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">First Name
            <input className="form-input" type="text" value={firstName}
                   onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          {errors.firstName && <p className="error-message">{errors.firstName}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Last Name
            <input className="form-input" type="text" value={lastName}
                   onChange={(e) => setLastName(e.target.value)} required />
          </label>
          {errors.lastName && <p className="error-message">{errors.lastName}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Password
            <input className="form-input" type="password" value={password}
                   onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Confirm Password
            <input className="form-input" type="password" value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)} required />
          </label>
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
        </div>

        <button className="signup-button" type="submit">Sign Up</button>
      </form>
    </div>
  );

}

export default SignupFormPage;
