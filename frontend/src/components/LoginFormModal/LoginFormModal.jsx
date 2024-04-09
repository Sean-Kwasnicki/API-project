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
      .catch(errorResponse => {
        // Parse the JSON from the response body
        errorResponse.json().then(errorData => {
          // Log the error data or messages received
          console.log("Error Data:", errorData);
          if (errorData && errorData.errors) {
            // The array of errors, log the first one or map through them as needed
            console.log("Error Message:", errorData.errors[0]);
            setErrors([errorData.errors[0]]); // Set the first error message to state
            // If your errors are not in an array or structured differently, adjust accordingly
          } else if (errorData && errorData.message) {
            // If a single error message is sent back
            console.log("Error Message:", errorData.message);
            setErrors([errorData.message]); // Set the error message to state
          } else {
            // Fallback error message
            setErrors(["An unknown error occurred."]);
          }
        }).catch(() => {
          // Handle any errors that occur during the parsing of the JSON
          console.log("Error parsing error response.");
          setErrors(["An error occurred while processing your request."]);
        });
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


        {errors.length > 0 &&
        <p className="error-message">{errors.map((error, idx) => <div key={idx}>{error}</div>)}</p>}


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
