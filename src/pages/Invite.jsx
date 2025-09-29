// src/pages/Invite.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE;

export default function Invite() {
  const player = usePlayer();
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
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
    const name = player?.name || 'Guest';

    // If player has an assigned character, use it
    if (player?.characterId) {
      const assignedCharacter = characters.find(c => c.id === player.characterId);
      if (assignedCharacter) {
        return {
          name: assignedCharacter.name,
          role: player?.role || 'Employee',
          avatar: player?.avatar || null,
          goals: assignedCharacter.goals || [],
          flaws: assignedCharacter.flaws || [],
          backstory: assignedCharacter.backstory || ''
        };
      }
    }

    // Fallback to default character data
    return {
      name,
      role: player?.role || 'Employee',
      avatar: player?.avatar || null,
      goals: player?.goals || [
        'Be present at three clue reveals',
        'Collect two witness statements',
        'Contribute to the team debrief'
      ],
      flaws: player?.flaws || [
        'Terrible with directions',
        'Can\'t resist starting rumors'
      ],
      backstory:
        player?.backstory ||
        `${name} joined Blackwood Tower last year. Known for quick instincts and a knack for reading rooms, ` +
        `they've made as many friends as skeptics. Tonight's dinner could make — or break — their reputation.`
    };
  }, [player, characters]);

  // phases: sealed -> peek -> details
  const [phase, setPhase] = useState('sealed');

  return (
    <div className="min-h-full text-white p-6 bg-black">
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="text-blue-300 hover:text-blue-200 text-sm">← Home</Link>
      </div>

      <AnimatePresence mode="wait">
        {phase !== 'details' ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-center"
          >
            <Envelope
              phase={phase}
              onPrimaryClick={() => phase === 'sealed' && setPhase('peek')}
              onLetterClick={() => phase === 'peek' && setPhase('details')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto w-full max-w-xl"
          >
            <ProfileDetails character={character} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ========================= */
/* Envelope (starts closed)  */
/* ========================= */
function Envelope({ phase, onPrimaryClick, onLetterClick }) {
  const isSealed = phase === 'sealed';
  const isPeek = phase === 'peek';

  return (
    <motion.div
      className="w-full max-w-md"
      animate={
        isSealed
          ? { rotateZ: [0, -2, 2, -2, 2, 0], y: [0, -1, 1, -1, 1, 0] }
          : { rotateZ: 0, y: 0 }
      }
      transition={
        isSealed
          ? { duration: 1.2, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }
          : { duration: 0.3 }
      }
    >
      <div className="text-center mb-5">
        <div className="text-sm text-neutral-300">Blackwood Tower</div>
        <div className="text-xs text-neutral-400">Annual Company Dinner</div>
        <div className="text-[11px] text-neutral-400 mt-1">
          {isSealed ? 'Tap the envelope' : 'Tap the letter to continue'}
        </div>
      </div>

      <div className="relative mx-auto w-[min(420px,92%)]" style={{ perspective: 1000 }}>
        {/* Click to open on first tap */}
        <div
          role="button"
          aria-label="Open invitation"
          onClick={isSealed ? onPrimaryClick : undefined}
          className="relative w-full h-64 select-none focus:outline-none"
        >
          {/* ENVELOPE BODY (overflow visible so letter can slide outside) */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300/80 shadow-[0_16px_40px_rgba(0,0,0,.25)] overflow-visible">
            {/* Inner shadow */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_2px_8px_rgba(0,0,0,.08)]" />

            {/* Decorative side folds */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-48 w-48 opacity-60"
              style={{ clipPath: 'polygon(0 0,100% 50%,0 100%)', background: 'linear-gradient(135deg,#f6e3b1,#e4c882)' }}
            />
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 h-48 w-48 opacity-60"
              style={{ clipPath: 'polygon(0 50%,100% 0,100% 100%)', background: 'linear-gradient(225deg,#f6e3b1,#e4c882)' }}
            />

            {/* LETTER (starts INSIDE; slides OUTSIDE above the envelope on peek) */}
            <motion.div
              onClick={isPeek ? onLetterClick : undefined}
              className={`absolute left-1/2 top-6 -translate-x-1/2 w-[86%] h-[80%] rounded-xl bg-white border border-amber-300/70 z-10 ${
                isPeek ? 'cursor-pointer' : ''
              }`}
              initial={false}
              animate={{
                y: isPeek ? -170 : 0,          // slide upward out of the envelope
                boxShadow: isPeek
                  ? '0px 20px 40px rgba(0,0,0,0.35)'
                  : '0px 10px 24px rgba(0,0,0,0.20)'
              }}
              transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.1 }}
              style={{ zIndex: isPeek ? 40 : 10 }}  // raise above front pocket when outside
            >
              <div className="h-full w-full p-5 text-neutral-800">
                <div className="text-center">
                  <div className="text-xs tracking-widest text-neutral-500">YOU&apos;RE INVITED</div>
                  <div className="mt-1 text-xl font-serif">Yearly Company Dinner Party</div>
                  <div className="mt-2 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                    {isSealed ? 'Tap to open' : 'Tap to view character'}
                  </div>
                </div>
                <div className="mt-4 text-sm leading-relaxed">
                  You are cordially invited to an evening of celebration, intrigue, and
                  collaboration. Formal attire suggested. Dinner to follow.
                </div>
                <div className="mt-4 text-right text-xs text-neutral-500">— Blackwood Tower</div>
              </div>

              {/* subtle ring pulse when tappable */}
              {isPeek && (
                <motion.div
                  className="absolute inset-0 rounded-xl ring-2 ring-blue-400/40 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* FRONT POCKET OVERLAY (covers the letter while inside) */}
            <div
              className="absolute inset-0 rounded-2xl z-20 pointer-events-none"
              style={{
                clipPath: 'polygon(0 28%, 50% 0, 100% 28%, 100% 100%, 0 100%)',
                background: 'linear-gradient(180deg, rgba(250,234,177,0.9), rgba(236,205,130,0.92))',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
              }}
            />

            {/* Wax seal (hidden after opening) */}
            <motion.div
              className="absolute left-1/2 top-[52%] -translate-x-1/2 z-30 rounded-full h-12 w-12 bg-red-700 ring-4 ring-red-900/60 shadow-lg grid place-items-center"
              initial={false}
              animate={{ scale: isSealed ? 1 : 0, opacity: isSealed ? 1 : 0 }}
              transition={{ duration: 0.22 }}
            >
              <span className="text-xs">BT</span>
            </motion.div>

            {/* TOP FLAP (opens on first tap) */}
            <motion.div
              className={`absolute left-0 right-0 top-0 h-1/2 origin-top ${isPeek ? 'z-30' : 'z-40'}`}
              style={{
                transformStyle: 'preserve-3d',
                clipPath: 'polygon(0 0,100% 0,50% 100%)',
                background: 'linear-gradient(#f6e3b1,#e4c882)'
              }}
              initial={false}
              animate={{ rotateX: isPeek ? -180 : 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            >
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-amber-300/80" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ========================= */
/* Details view              */
/* ========================= */
function ProfileDetails({ character }) {
  const initials = initialsFromName(character.name);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-[0_12px_30px_rgba(0,0,0,.35)]">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden ring-1 ring-white/15 bg-gradient-to-br from-sky-500/40 to-indigo-500/40 grid place-items-center">
            {character.avatar ? (
              <img src={character.avatar} alt={character.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold">{initials}</span>
            )}
          </div>
          <div>
            <div className="text-xl font-semibold">{character.name}</div>
            <div className="text-neutral-300 text-sm">{character.role}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard title="Goals">
          <ul className="list-disc list-inside space-y-2 text-sm text-neutral-200">
            {character.goals.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Flaws">
          <ul className="list-disc list-inside space-y-2 text-sm text-neutral-200">
            {character.flaws.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Backstory">
        <p className="text-sm leading-relaxed text-neutral-200">{character.backstory}</p>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-[0_12px_30px_rgba(0,0,0,.35)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ========================= */
/* Helpers                   */
/* ========================= */
function usePlayer() {
  const [player, setPlayer] = useState(null);
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('player') || 'null');
      setPlayer(p);
    } catch {
      setPlayer(null);
    }
  }, []);
  return player;
}

function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase()).join('') || 'GT';
}