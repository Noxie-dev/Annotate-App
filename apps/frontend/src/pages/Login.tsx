import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackAuth, trackForm, trackError } from '../utils/analytics';
import Logo from '../components/Logo';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Analytics tracking
    trackForm('start', 'login_form');
    trackAuth('login', 'email');

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Store auth token (implement based on your auth strategy)
        localStorage.setItem('authToken', data.token);

        // Analytics tracking for successful login
        trackForm('complete', 'login_form');

        // Redirect to dashboard or intended page
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed. Please try again.');

        // Analytics tracking for failed login
        trackForm('abandon', 'login_form');
        trackError('login_failed', errorData.message || 'Login failed', '/login');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      trackError('network_error', 'Login network error', '/login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ubuntu-blue-50 to-ubuntu-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-ubuntu-blue-200">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="md" variant="dark" showText={false} />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold text-ubuntu-blue-800 mb-2 font-ubuntu"
            >
              Welcome Back
            </motion.h1>
            <p className="text-ubuntu-cool-grey">Sign in to your File Chat account</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              role="alert"
              aria-live="polite"
            >
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ubuntu-cool-grey mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                aria-describedby="email-error"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ubuntu-blue-500 focus:border-ubuntu-blue-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ubuntu-cool-grey mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                aria-describedby="password-error"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ubuntu-blue-500 focus:border-ubuntu-blue-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-ubuntu-blue-600 focus:ring-ubuntu-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-ubuntu-cool-grey">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-ubuntu-blue-600 hover:text-ubuntu-blue-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-ubuntu-blue-600 hover:bg-ubuntu-blue-700 disabled:bg-ubuntu-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ubuntu-blue-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-ubuntu-cool-grey">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-ubuntu-blue-600 hover:text-ubuntu-blue-500 font-medium transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-ubuntu-warm-grey hover:text-ubuntu-cool-grey transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
