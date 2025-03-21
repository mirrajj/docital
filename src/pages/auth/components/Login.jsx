// src/pages/Login.js
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext/AuthContext';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authView, setAuthView] = useState('sign-in'); // 'sign-in', 'sign-up', 'forgot-password'
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page they were trying to access or default to dashboard
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render different views based on authView state
  const renderAuthView = () => {
    switch (authView) {
      case 'sign-up':
        return <SignUp setAuthView={setAuthView} />;
      case 'forgot-password':
        return <ForgotPassword setAuthView={setAuthView} />;
      default:
        return (
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">Sign in to your account</h2>
            
            {error && (
              <div className="bg-red-100 p-3 rounded text-red-700 mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthView('forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
              
              <p className="text-center mt-4 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthView('sign-up')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Create one
                </button>
              </p>
            </form>
          </div>
        );
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        {renderAuthView()}
      </div>
    </div>
  );
};

export default Login;