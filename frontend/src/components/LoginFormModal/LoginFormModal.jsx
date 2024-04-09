// frontend/src/components/LoginFormModal/LoginFormModal.jsx
import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    return dispatch(sessionActions.login({ credential: "Demo-lition", password: "password" }))
    .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };


  return (
    <div className="login-page-container">
      <div className="form-container">
        <h1 className="form-title">Log In</h1>
        <form onSubmit={handleSubmit}>
          <label className="form-label">
            Username or Email
            <input
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
              className="form-input"
            />
          </label>
          <label className="form-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </label>
          {Object.keys(errors).length > 0 && (
            <div className="error-message">
              {Object.values(errors).map((error, idx) => <p key={idx}>{error}</p>)}
            </div>
          )}
          <button type="submit" className="submit-button">
            Log In
          </button>
          <a href="#" onClick={handleDemoLogin} className="demo-login-link">Demo user</a>
        </form>
      </div>
    </div>
  );
}

export default LoginFormModal;
