import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';
import './SignupForm.css'; 

function SignupFormModal() {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrors({ ...errors, confirmPassword: "Confirm Password must match Password" });
      return;
    }
    setErrors({});
    try {
      await dispatch(sessionActions.signup({ email, username, firstName, lastName, password }));
      closeModal();
    } catch (res) {
      const data = await res.json();
      if (data && data.errors) {
        setErrors(data.errors);
      }
    }
  };

  return (
    <div className="signup-form">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>


        {/* First Name Field */}
        <div className="form-field">
          <label className="form-label">First Name</label>
          <input className="form-input"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required />
          {errors.firstName && <p className="error-message">{errors.firstName}</p>}
        </div>

        {/* Last Name Field */}
        <div className="form-field">
          <label className="form-label">Last Name</label>
          <input className="form-input"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required />
          {errors.lastName && <p className="error-message">{errors.lastName}</p>}
        </div>
        {/* Email Field */}
        <div className="form-field">
          <label className="form-label">Email</label>
          <input className="form-input"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        {/* Username Field */}
        <div className="form-field">
          <label className="form-label">Username</label>
          <input className="form-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required />
          {errors.username && <p className="error-message">{errors.username}</p>}
        </div>

        {/* Password Field */}
        <div className="form-field">
          <label className="form-label">Password</label>
          <input className="form-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required />
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        {/* Confirm Password Field */}
        <div className="form-field">
          <label className="form-label">Confirm Password</label>
          <input className="form-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required />
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </div>
  );
}

export default SignupFormModal;
