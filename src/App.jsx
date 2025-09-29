import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import IPhoneFrame from './components/IPhoneFrame'

export default function App({ signOut }){
  // Control whether to redirect home page to survey
  const REDIRECT_HOME_TO_SURVEY = false
  
  const [player, setPlayer] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('player')||'null') } catch { return null }
  })
  const nav = useNavigate()
  const location = useLocation()
  
  // Allow access to admin routes and survey routes without player
  const adminRoutes = ['/survey-admin', '/gm', '/survey']
  const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route))
  
  // Update player state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedPlayer = JSON.parse(localStorage.getItem('player') || 'null');
        setPlayer(storedPlayer);
      } catch {
        setPlayer(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(()=>{
    // Remove automatic redirect since AuthWrapper handles authentication
    // The authentication is now handled by JWT and AuthWrapper
  },[player, isAdminRoute, nav])

  return (
    <IPhoneFrame wallpaperUrl="/wallpapers/iphone4wallpaper.png">
      <Outlet context={{ signOut }} />
    </IPhoneFrame>
  );
}
