import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const [player, setPlayer] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    // Get player data from localStorage
    try {
      const playerData = JSON.parse(localStorage.getItem('player') || 'null');
      setPlayer(playerData);
    } catch (error) {
      console.error('Error loading player data:', error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('player');
    nav('/');
  };

  return (
    <div className="min-h-full text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span className="text-2xl">←</span>
            <span>Home</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {player ? (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-3xl">
                  👤
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{player.name}</h2>
                {player.roleId && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-medium">
                    🔑 {player.roleId}
                  </div>
                )}
              </div>
            </div>

            {/* Player Stats */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📊</span> Player Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Player ID:</span>
                  <span className="font-mono text-blue-300">#{player.id || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Status:</span>
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Role:</span>
                  <span className="text-white">{player.role || 'Employee'}</span>
                </div>
              </div>
            </div>

            {/* Game Actions */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🎮</span> Game Actions
              </h3>
              <div className="space-y-3">
                <Link 
                  to="/lobby" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-neutral-700/50 hover:bg-neutral-600/50 transition-colors"
                >
                  <span className="text-2xl">📋</span>
                  <div>
                    <div className="font-medium">Employee Roster</div>
                    <div className="text-sm text-neutral-400">View all players</div>
                  </div>
                </Link>
                <Link 
                  to="/survey" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-neutral-700/50 hover:bg-neutral-600/50 transition-colors"
                >
                  <span className="text-2xl">📝</span>
                  <div>
                    <div className="font-medium">Personality Assessment</div>
                    <div className="text-sm text-neutral-400">Complete survey</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>⚙️</span> Settings
              </h3>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 hover:text-red-200 transition-all"
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-xl font-bold mb-4">No Profile Found</h2>
            <p className="text-neutral-400 mb-6">
              You need to register first to view your profile.
            </p>
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              <span>🆔</span>
              <span>Register Now</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}