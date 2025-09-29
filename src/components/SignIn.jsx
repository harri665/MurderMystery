import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export default function SignIn({ onSignIn }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your first name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.player) {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('player', JSON.stringify(data.player));
        localStorage.setItem('login_timestamp', Date.now().toString());
        if (onSignIn) {
          onSignIn(data.player, data.token);
        } else {
          window.location.href = '/';
        }
      } else {
        setError(data.error || 'First name not found. Please check your first name or register first.');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full text-white p-6">
      {/* Lock-screen-ish header */}
      <div className="pt-10 text-center select-none">
        <LiveClock />
        <div className="text-neutral-300 text-sm mt-1">Blackwood Tower</div>
      </div>

      {/* Sign-in card */}
      <div className="px-6 mt-10 pb-24">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,.35)]">
          <div className="px-6 py-7">
            {/* Title */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">🔒</div>
              <h1 className="text-xl font-semibold text-white">Enter to Continue</h1>
              <p className="text-neutral-400 text-sm">Enter your first name to access the system</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  First Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none text-white placeholder-neutral-400 px-4"
                  placeholder="e.g., Alex"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-medium text-white transition-all
                           bg-gradient-to-b from-[#4da3ff] to-[#1b6cff]
                           disabled:opacity-60 active:translate-y-[1px]
                           shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_6px_14px_rgba(0,0,0,.35)]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In…</span>
                  </div>
                ) : (
                  <span>Access System</span>
                )}
              </button>
            </form>

            {/* Register */}
            <div className="mt-5 text-center">
              <p className="text-neutral-400 text-xs mb-2">Don&apos;t have an account?</p>
              <button
                onClick={() => navigate('/register')}
                className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors underline underline-offset-4"
              >
                Register as New Employee
              </button>
            </div>

            {/* Security note */}
            <div className="mt-5 p-3 rounded-lg bg-yellow-500/15 border border-yellow-500/25">
              <div className="text-yellow-300 text-[11px] text-center leading-relaxed">
                <div className="font-semibold mb-0.5">SECURE ACCESS</div>
                No passwords required. Identity verified by first name only.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dock hint (subtle) */}
      <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 w-28 h-1.5 rounded-full bg-white/35" />
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  // tick per second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div>
      <div className="text-5xl font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,.6)]">{time}</div>
      <div className="text-neutral-300 text-xs">{date}</div>
    </div>
  );
}
