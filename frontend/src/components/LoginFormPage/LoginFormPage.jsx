// frontend/src/components/LoginFormPage/LoginFormPage.jsx

import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import './LoginForm.css'

function LoginFormPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password })).catch(
      async (res) => {
        const data = await res.json();
        if (data?.errors) setErrors(data.errors);
      }
    );
  };


  return (
    <div className="login-page-container">
      <div className="form-container">
        <h1 className="form-title">Log In</h1>
        <form onSubmit={handleSubmit}>
          <label className="form-label">
            Username or Email
            <input
              className="form-input"
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
            />
          </label>
          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {Object.keys(errors).length > 0 && (
            <div className="error-message">
              {Object.values(errors).map((error, idx) => <p key={idx}>{error}</p>)}
            </div>
          )}
          <button className="submit-button" type="submit">Log In</button>

          <button type="submit" className="submit-button" onClick={() => {
                setCredential("Demo-lition");
                setPassword("password");
            }}>Log in as demo user</button>
        </form>
      </div>
    </div>
  );
}


export default LoginFormPage;
