import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../authContext/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [particles, setParticles] = useState([]);
  
  const { login, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page they were trying to access or default to dashboard
  const from = location.state?.from?.pathname || '/';
  
  // Array of SVG paths for different business icons
  const svgIcons = [
    // File icon
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6",
    // Document icon
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M16 13H8 M16 17H8 M10 9H8",
    // Check/Task icon
    "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    // Chart/Graph icon
    "M18 20V10 M12 20V4 M6 20v-6",
    // User/Profile icon
    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100-8 4 4 0 000 8z",
    // Settings/Gear icon
    "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
  ];
  
  useEffect(() => {
    // Create random SVG particles for animation
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 20 + Math.random() * 15,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: 0.1 + Math.random() * 0.4,
          // Randomly select an icon from our array
          iconPath: svgIcons[Math.floor(Math.random() * svgIcons.length)]
        });
      }
      setParticles(newParticles);
    };
    
    generateParticles();
    
    // Animation loop for particles
    const animationInterval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: ((particle.x + particle.speedX + 100) % 100),
          y: ((particle.y + particle.speedY + 100) % 100),
        }))
      );
    }, 50);
    
    return () => clearInterval(animationInterval);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    
    try {
      let result;
      
      if (isSignUp) {
        result = await signUp(email, password);
        if (result.success) {
          setMessage(result.message);
        }
      } else {
        console.log("log in")
        result = await login(email, password);
        if (result.success) {
          navigate(from, { replace: true });
        }
      }
      
      if (!result.success) {
        console.log("error ocurred")
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Static messages (previously used with typed effect)
  const staticMessages = [
    'Manage your projects with ease.',
    'Collaborate with your team seamlessly.',
    'Track progress in real-time.',
    'Analyze data with powerful insights.',
    'Streamline your workflow today.'
  ];
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left section with gradient background and static message */}
      <div 
        className="w-full md:w-2/3 p-8 flex flex-col justify-center items-center relative overflow-hidden"
        style={{
          background: "radial-gradient(circle at center, #4ade80 0%, #16a34a 70%, #15803d 100%)"
        }}
      >
       
        
        {/* Animated SVG particles with business icons */}
        {particles.map((particle) => (
          <svg 
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              top: `${particle.y}%`,
              left: `${particle.x}%`,
              opacity: particle.opacity,
            }}
            width={particle.size}
            height={particle.size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={particle.iconPath} />
          </svg>
        ))}
        
        {/* Main content */}
        <div className="z-10 max-w-xl text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Secure. Simple. Efficient.
          </h1>
          <div className="text-xl md:text-2xl text-white font-light mb-8 min-h-16">
            {/* Static message without typing effect */}
            <div className="h-16 flex items-center justify-center">
              <span className="font-light">{staticMessages[0]}</span>
            </div>
          </div>
          <p className="text-white text-lg opacity-90 max-w-md mx-auto">
            Join thousands of professionals who trust our platform for their daily operations.
          </p>
        </div>
      </div>
      
      {/* Right section with login form */}
      <div className="w-full md:w-1/3 bg-white flex items-center relative justify-center p-8">
       {/* Logo at the top */}
       <div className="absolute top-4 right-4">
          <div className="flex items-center w-28 h-fit rounded-lg">
            <img src='/images/nav_icon.png' alt='docital logo' className='w-full'/>
          </div>
        </div>
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-center text-gray-600">
              {isSignUp ? 'Join our community today' : 'Sign in to continue'}
            </p>
          </div>
          
          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          {message && (
            <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg">
              {message}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            {!isSignUp && (
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md group hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  isSignUp ? 'Create account' : 'Sign in'
                )}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-green-600 hover:text-green-800 font-medium"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setMessage('');
                }}
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;