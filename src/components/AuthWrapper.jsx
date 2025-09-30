import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SignIn from './SignIn';
import IPhoneFrame from './IPhoneFrame';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

// Debug: Log the API URL
console.log('AuthWrapper API URL:', API);

export default function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);
  const { name: urlName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Verify JWT token
  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.player;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
    return null;
  };

  // Auto-login with name from URL
  const autoLoginWithName = async (name) => {
    try {
      const response = await fetch(`${API}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.player) {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('player', JSON.stringify(data.player));
        localStorage.setItem('login_timestamp', Date.now().toString());
        setPlayer(data.player);
        setIsAuthenticated(true);

        // Clean URL - remove the name parameter but keep nested path
        // e.g. /harrison/invite -> /invite
        const currentPath = location.pathname;
        const match = currentPath.match(/^\/[\w-]+(\/.*)?$/);
        const targetPath = (match && match[1]) ? match[1] : '/';
        
        // Set redirect path for later navigation
        setRedirectPath(targetPath);
        return true;
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
    }
    return false;
  };

  // Check if token is near expiration and refresh if needed
  const checkTokenExpiration = async () => {
    const token = localStorage.getItem('jwt_token');
    const loginTimestamp = localStorage.getItem('login_timestamp');
    
    if (!token || !loginTimestamp) return false;

    const tokenAge = Date.now() - parseInt(loginTimestamp);
    const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const sixDays = 6 * 24 * 60 * 60 * 1000; // 6 days in milliseconds

    // If token is older than 6 days, try to refresh it
    if (tokenAge > sixDays) {
      try {
        const verifiedPlayer = await verifyToken(token);
        if (verifiedPlayer) {
          // Token is still valid, update the login timestamp
          localStorage.setItem('login_timestamp', Date.now().toString());
          return true;
        }
      } catch (error) {
        console.error('Token refresh check failed:', error);
      }
    }

    // If token is older than 7 days, force re-login
    if (tokenAge > sevenDays) {
      handleSignOut();
      return false;
    }

    return true;
  };

  useEffect(() => {
    const initAuth = async () => {
      // Check if there's a name in the URL for auto-login
      if (urlName) {
        const success = await autoLoginWithName(urlName);
        if (success) {
          setLoading(false);
          return;
        }
      }

      // Check for existing JWT token
      const token = localStorage.getItem('jwt_token');
      const storedPlayer = localStorage.getItem('player');

      if (token && storedPlayer) {
        try {
          // Check if token is expired before using it
          const tokenValid = await checkTokenExpiration();
          if (!tokenValid) {
            setLoading(false);
            return;
          }

          // First, try to use the stored player data immediately for better UX
          const playerData = JSON.parse(storedPlayer);
          setPlayer(playerData);
          setIsAuthenticated(true);

          // Then verify the token in the background
          const verifiedPlayer = await verifyToken(token);
          if (verifiedPlayer) {
            // Update with latest player data from server
            setPlayer(verifiedPlayer);
            localStorage.setItem('player', JSON.stringify(verifiedPlayer));
          } else {
            // Token invalid, clear storage and show sign-in
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('player');
            localStorage.removeItem('login_timestamp');
            setPlayer(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // If there's an error parsing stored data, clear it
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('player');
          localStorage.removeItem('login_timestamp');
          setPlayer(null);
          setIsAuthenticated(false);
        }
      }

      setLoading(false);
    };

    // Set up periodic token validation (every hour)
    const tokenCheckInterval = setInterval(checkTokenExpiration, 60 * 60 * 1000);

    initAuth();

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [urlName, navigate]);

  // Handle redirect after authentication
  useEffect(() => {
    if (redirectPath && isAuthenticated) {
      navigate(redirectPath, { replace: true });
      setRedirectPath(null);
    }
  }, [redirectPath, isAuthenticated, navigate]);

  const handleSignIn = (playerData, token) => {
    setPlayer(playerData);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('player');
    localStorage.removeItem('login_timestamp');
    setPlayer(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <IPhoneFrame wallpaperUrl="/wallpapers/iphone4wallpaper.png">
        <div className="min-h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </IPhoneFrame>
    );
  }

  if (!isAuthenticated) {
    return (
      <IPhoneFrame wallpaperUrl="/wallpapers/iphone4wallpaper.png">
        <SignIn onSignIn={handleSignIn} />
      </IPhoneFrame>
    );
  }

  // Pass player data and signOut function to children
  return (
    <div>
      {typeof children === 'function' 
        ? children({ player, signOut: handleSignOut })
        : children
      }
    </div>
  );
}