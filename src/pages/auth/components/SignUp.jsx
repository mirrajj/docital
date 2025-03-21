// src/components/SignUp.js
import { useState, useEffect } from 'react';
import {useAuth} from '../authContext/AuthContext';
import supabase from '@/config/supabaseClient';

const SignUp = ({ setAuthView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch roles from database
  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('role_id, role_name');
      
      if (error) {
        console.error('Error fetching roles:', error);
      } else {
        setRoles(data || []);
        console.log(data);
        if (data && data.length > 0) {
          setRole(data[1].role_id); // Default to first role
        }
      }
    };

    fetchRoles();
  }, []);

  const { signUp } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // 1. Register user in Supabase auth
      const { success, user, error: signUpError } = await signUp(email, password);
      
      if (!success) {
        throw new Error(signUpError || 'Failed to create account');
      }

      // 2. Add user to employee table with role
      if (user && user.id) {
        const { error: profileError } = await supabase
          .from('employee')
          .insert([{ 
            id: user.id,
            name : name,
            role : role
          }]);

        if (profileError) throw new Error('Could not create employee profile');
      }

      setMessage('Account created! Please check your email for confirmation.');
    } catch (err) {
      console.error('Error during signup:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create an Account</h2>
      
      {error && (
        <div className="bg-red-100 p-3 rounded text-red-700 mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 p-3 rounded text-green-700 mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            minLength={6}
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 6 characters long
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <p className="text-center mt-4 text-sm">
        Already have an account?{' '}
        <button
          onClick={() => setAuthView('sign-in')}
          className="text-blue-600 hover:text-blue-800"
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

export default SignUp;