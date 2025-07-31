import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userLogin ,startTokenRefreshCycle} from '../api';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await userLogin(credentials);
      console.log(response)
      if (response) {     
        localStorage.setItem('accessToken', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        startTokenRefreshCycle();
        console.log('Login response:', response);
        switch(response.user.role.toLowerCase()) {
          case 'manager':
            navigate('/manager-dashboard', {
              state: { deptId: response.user.department_id }
            });
            break;
          case 'employee':
            navigate('/employee-dashboard', {
              state: { username: response.user.username }
            });
            break;
          case 'director':
            navigate('/director-dashboard', {
              state: { company_id: response.user.company_id}
            });
            break;
          case 'super_admin':
            navigate('/super-admin-dashboard', {
              state: { userId: response.user.id }
            });
            break;
          case 'company_admin':
            navigate('/admin-dashboard', {
              state: { company_id: response.user.company_id }
            });
            break;
          default:
            setError('Unknown user role');
            setLoading(false);
        }} else { 
        setError('Invalid username or password');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-card">
        <div className="login-header">
          <h1>Asset Management System</h1>
          <p>Sign in to access your account</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-field">
              <FiUser className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-field">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? (
              <span className="button-loader"></span>
            ) : (
              <>
                Login <FiArrowRight className="button-icon" />
              </>
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="/contact">Contact administrator</a></p>
          <a href="/forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;