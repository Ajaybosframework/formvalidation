// App.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in from previous session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []); // Empty dependency array = run only once when component mounts

  // ========== LOGIN COMPONENT ==========
  const LoginForm = () => {
    const [formData, setFormData] = useState({
      email: '',
      password: ''
    });
    const [errors, setErrors] = useState({});
    const [rememberMe, setRememberMe] = useState(false);

    // ========== EXPLANATION: Why useEffect inside LoginForm? ==========
  
    useEffect(() => {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setFormData(prev => ({ ...prev, email: rememberedEmail }));
        setRememberMe(true);
      }
    }, []);

    // ========== EXPLANATION: What is Regex and why use it? ==========
    
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // ========== EXPLANATION: Event Handler ==========
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when user starts typing in that field
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };

    // ========== EXPLANATION: Form Submission ==========
    
    const handleSubmit = async (e) => {
      e.preventDefault(); // Stop browser from refreshing page
      setIsLoading(true);

      // ========== STEP 1: VALIDATION ==========
      const newErrors = {};
      
      // Email validation
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }

      // Password validation  
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      // If validation errors exist, stop here
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return; 
      }

      
      await new Promise(resolve => setTimeout(resolve, 1500));

      const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
      
      const user = users.find(u => 
        u.email === formData.email && u.password === formData.password
      );

      // ========== STEP 4: HANDLE LOGIN RESULT ==========
      if (user) {
        const updatedUser = {
          ...user,
          lastLogin: new Date().toISOString()
        };
        
        // Update users array with new login timestamp
        const updatedUsers = users.map(u => 
          u.id === user.id ? updatedUser : u
        );
        
        // Save to localStorage
        localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        
        // Handle "Remember me" functionality
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        setErrors({});
      } else {
        //  Login failed - show appropriate error
        const userExists = users.find(u => u.email === formData.email);
        if (userExists) {
          setErrors({ submit: 'Incorrect password' });
        } else {
          setErrors({ submit: 'No account found with this email' });
        }
      }

      setIsLoading(false);
    };

    // ========== EXPLANATION: JSX Return ==========
    return (
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back!</h2>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Input */}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Remember Me Checkbox */}
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Submit Error Message */}
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Switch to Signup */}
        <div className="auth-switch">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={() => setIsLogin(false)}
              className="switch-btn"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    );
  };

  // ========== SIGNUP COMPONENT ==========
  const SignupForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    });
    const [errors, setErrors] = useState({});

    // Email validation regex (same as login)
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      
      // Clear field-specific errors when user types
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);

      // ========== STEP 1: VALIDATION ==========
      const newErrors = {};
      
      // Name validation
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      // Email validation
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }

      // Password validation
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      // Confirm password validation
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Terms agreement validation
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms';
      }

      // ========== STEP 2: CHECK IF USER ALREADY EXISTS ==========
      const existingUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
      const userExists = existingUsers.find(u => u.email === formData.email);
      
      if (userExists) {
        newErrors.email = 'User with this email already exists';
      }

      // ========== STEP 3: STOP IF ERRORS EXIST ==========
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return; //  STOP if any validation errors
      }

      // ========== STEP 4: SIMULATE API CALL ==========
      await new Promise(resolve => setTimeout(resolve, 2000));

      // ========== STEP 5: CREATE NEW USER ==========
      const newUser = {
        id: Date.now().toString(), // Simple unique ID
        name: formData.name,
        email: formData.email,
        password: formData.password, //  In real app, this would be hashed
        joined: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        preferences: {
          theme: 'light',
          notifications: true
        }
      };

      // ========== STEP 6: SAVE TO STORAGE ==========
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      // ========== STEP 7: UPDATE STATE ==========
      setCurrentUser(newUser);
      setIsLoading(false);
    };

    return (
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join us today!</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name Input */}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Email Input */}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Create a password"
              disabled={isLoading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password Input */}
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>
                I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && (
              <span className="error-text">{errors.agreeToTerms}</span>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="auth-switch">
          <p>
            Already have an account?{' '}
            <button 
              type="button" 
              onClick={() => setIsLogin(true)}
              className="switch-btn"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    );
  };

  // ========== DASHBOARD COMPONENT ==========
  const Dashboard = () => {
    const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    };

    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <img 
            src={currentUser.avatar} 
            alt="Avatar" 
            className="user-avatar"
          />
          <h1>Welcome back, {currentUser.name}!</h1>
          <p>You're successfully logged in</p>
        </div>

        <div className="user-info">
          <div className="info-item">
            <strong>Email:</strong>
            <span>{currentUser.email}</span>
          </div>
          <div className="info-item">
            <strong>Member since:</strong>
            <span>{new Date(currentUser.joined).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <strong>Last login:</strong>
            <span>{new Date(currentUser.lastLogin).toLocaleString()}</span>
          </div>
        </div>

        <div className="dashboard-actions">
          <button onClick={handleLogout} className="action-btn logout">
            Logout
          </button>
        </div>
      </div>
    );
  };

  // ========== MAIN APP RETURN ==========

  return (
    <div className="app">
      <div className="app-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="app-content">
        {currentUser ? (
          <Dashboard />
        ) : (
          <div className="auth-container">
            {isLogin ? <LoginForm /> : <SignupForm />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;