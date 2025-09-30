import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE;

export default function Profile() {
  const [player, setPlayer] = useState(null);
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    // Get player data from localStorage
    try {
      const playerData = JSON.parse(localStorage.getItem('player') || 'null');
      setPlayer(playerData);
    } catch (error) {
      console.error('Error loading player data:', error);
    }

    // Fetch characters
    const fetchCharacters = async () => {
      try {
        const response = await axios.get(`${API}/api/characters`);
        setCharacters(response.data);
      } catch (error) {
        console.error('Failed to fetch characters:', error);
      }
    };
    fetchCharacters();
  }, []);

  const character = useMemo(() => {
    if (!player) return null;

    const name = player.name || 'Guest';

    // If player has an assigned character, use it
    if (player.characterId) {
      const assignedCharacter = characters.find(c => c.id === player.characterId);
      if (assignedCharacter) {
        return {
          name: assignedCharacter.name,
          role: player.role || 'Employee',
          avatar: player.avatar || null,
          goals: assignedCharacter.goals || [],
          flaws: assignedCharacter.flaws || [],
          backstory: assignedCharacter.backstory || ''
        };
      }
    }

    // Fallback to default character data
    return {
      name,
      role: player.role || 'Employee',
      avatar: player.avatar || null,
      goals: player.goals || [
        'Be present at three clue reveals',
        'Collect two witness statements',
        'Contribute to the team debrief'
      ],
      flaws: player.flaws || [
        'Terrible with directions',
        'Can\'t resist starting rumors'
      ],
      backstory:
        player.backstory ||
        `${name} joined Blackwood Tower last year. Known for quick instincts and a knack for reading rooms, ` +
        `they've made as many friends as skeptics. Tonight's dinner could make — or break — their reputation.`
    };
  }, [player, characters]);

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
            {/* Character Profile Card */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
              <div className="text-center mb-6">
                <div className="relative h-20 w-20 mx-auto mb-4 rounded-2xl overflow-hidden ring-1 ring-white/15 bg-gradient-to-br from-sky-500/40 to-indigo-500/40 grid place-items-center">
                  {character?.avatar ? (
                    <img src={character.avatar} alt={character.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-10 h-10 text-white/80"
                        fill="currentColor"
                      >
                        {/* Detective/Mystery themed icon - silhouette with fedora */}
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9H1V21H23V9H21ZM19 19H5V11H19V19ZM9 13H11V15H9V13ZM13 13H15V15H13V13Z"/>
                        {/* Add a magnifying glass overlay for mystery theme */}
                        <circle cx="18" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
                        <path d="M20 4L21.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                      </svg>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{character?.name || player.name}</h2>
                <div className="text-neutral-300 text-sm mb-2">{character?.role || player.role || 'Employee'}</div>
                {player.roleId && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-medium">
                    🔑 {player.roleId}
                  </div>
                )}
              </div>
            </div>

            {/* Character Details */}
            {character && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>🎯</span> Goals
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-neutral-200">
                    {character.goals.map((goal, i) => (
                      <li key={i}>{goal}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>⚠️</span> Flaws
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-neutral-200">
                    {character.flaws.map((flaw, i) => (
                      <li key={i}>{flaw}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {character?.backstory && (
              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>📖</span> Backstory
                </h3>
                <p className="text-sm leading-relaxed text-neutral-200">{character.backstory}</p>
              </div>
            )}

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