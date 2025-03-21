// src/components/ForgotPassword.js
import { useState } from 'react';
import supabase from '@/config/supabaseClient';

const ForgotPassword = ({ setAuthView }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Request password reset email from Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setMessage('Password reset instructions sent to your email!');
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Reset Your Password</h2>
      
      {error && (
        <div className="bg-red-100 p-3 rounded text-red-700 mb-4">{error}</div>
      )}
      
      {message && (
        <div className="bg-green-100 p-3 rounded text-green-700 mb-4">{message}</div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4">
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </div>
      </form>

      <p className="text-center mt-4 text-sm">
        <button
          onClick={() => setAuthView('sign-in')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Sign In
        </button>
      </p>
    </div>
  );
};

export default ForgotPassword;



