import { Link as RouterLink, useOutletContext } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

// Add custom animations for app opening effects
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
    
    @keyframes app-bounce {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.15);
      }
      100% {
        transform: scale(1.1);
      }
    }
    
    .app-opening {
      animation: app-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  `;
  document.head.appendChild(style);
}

// iPhone 4 full-screen themed home (Tailwind CSS)
// - Fills viewport, styled like iPhone 4 (skeuomorphic icons, blue starfield wallpaper)
// - Has a visible device-like border and a home button overlay
// - Each icon links to a route via <RouterLink>
// Drop into src/pages/Home.jsx. Ensure Tailwind is configured.

export default function Home() {
  const { signOut } = useOutletContext() || {};
  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('player');
    localStorage.removeItem('login_timestamp');
    window.location.reload();
  };
  const logoutFunction = signOut || handleLogout;

  return (
    <div className="relative h-full w-full px-6 pt-12 pb-6">
      <HomeScreen signOut={logoutFunction} />
    </div>
  );
}

function HomeScreen({ signOut }) {
  const [isAnyAppOpening, setIsAnyAppOpening] = useState(false);
  
  const apps = useMemo(
    () => [
      { title: "Messages", to: "/messages", emoji: "💬", gradient: "from-green-400 to-green-600" },
      { title: "Calendar", to: "/calendar", emoji: "📅", gradient: "from-red-300 to-rose-600" },
      { title: "Photos", to: "/photos", emoji: "📸", gradient: "from-yellow-300 to-amber-500" },
      { title: "Camera", to: "/camera", emoji: "📷", gradient: "from-stone-300 to-stone-500" },
      { title: "YouTube", to: "/youtube", emoji: "▶️", gradient: "from-rose-400 to-rose-600" },
      { title: "Maps", to: "/maps", emoji: "🗺️", gradient: "from-sky-300 to-sky-600" },
      { title: "Notes", to: "/notes", emoji: "📝", gradient: "from-amber-300 to-amber-600" },
      { title: "Profile", to: "/profile", emoji: "👤", gradient: "from-purple-400 to-purple-600" },
      { title: "Reminders", to: "/reminders", emoji: "✅", gradient: "from-zinc-300 to-zinc-600" },
      { title: "Invite", to: "/invite", emoji: "�", gradient: "from-emerald-400 to-emerald-600" },
      { title: "Settings", to: "/settings", emoji: "⚙️", gradient: "from-neutral-400 to-neutral-700" },
      { title: "Logout", to: "#", emoji: "🚪", gradient: "from-red-400 to-red-600", isLogout: true },
    ],
    []
  );

  const dock = useMemo(
    () => [
      { title: "Phone", to: "/phone", emoji: "📞", gradient: "from-green-400 to-green-600" },
      { title: "Mail", to: "/mail", emoji: "✉️", gradient: "from-sky-400 to-blue-600" },
      { title: "Safari", to: "/safari", emoji: "🧭", gradient: "from-sky-400 to-indigo-600" },
      { title: "Music", to: "/music", emoji: "🎵", gradient: "from-pink-400 to-rose-500" },
    ],
    []
  );

  return (
    <div
      className="relative h-full w-full select-none"
      style={{
        /* Scale unit for icons & spacings */
        /* 57px original iPhone 4 icon -> clamp to viewport */
        /* @ts-ignore */
        "--icon": "clamp(48px, 6.2vw, 70px)",
      }}
    >
      {/* Dimming overlay when app is opening */}
      {isAnyAppOpening && (
        <div 
          className="absolute inset-0 bg-black/20 transition-opacity duration-300 z-20"
          style={{ backdropFilter: 'blur(1px)' }}
        />
      )}

      <div className="mx-auto h-full pb-[calc(var(--icon)*1.8)]">
        {/* App grid like iOS4: 4 per row */}
        <div className="grid grid-cols-4 gap-x-5 gap-y-6">
          {apps.map((app) => (
            <AppIcon key={app.title} {...app} onOpeningChange={setIsAnyAppOpening} signOut={signOut} />
          ))}
        </div>

        {/* Page dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
        </div>
      </div>

      <Dock apps={dock} onOpeningChange={setIsAnyAppOpening} />
    </div>
  );
}



function AppIcon({ title, to, emoji, gradient, onOpeningChange, isLogout, signOut }) {
  const [isOpening, setIsOpening] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setIsOpening(true);
    onOpeningChange?.(true);
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Handle logout differently
    if (isLogout && signOut) {
      setTimeout(() => {
        signOut();
      }, 300); // Shorter delay for logout
    } else {
      // Navigate after animation completes
      setTimeout(() => {
        window.location.href = to;
      }, 600);
    }
  };

  useEffect(() => {
    if (!isOpening) {
      onOpeningChange?.(false);
    }
  }, [isOpening, onOpeningChange]);

  return (
    <RouterLink
      to={to}
      onClick={handleClick}
      className="group flex flex-col items-center gap-1.5 relative z-10"
      aria-label={title}
    >
      <div
        className={[
          "relative bg-gradient-to-b",
          "shadow-[0_10px_18px_rgba(0,0,0,.55)] ring-1 ring-black/20",
          "transition-all duration-150 ease-out",
          "rounded-[20%]",
          gradient,
          isOpening 
            ? "animate-pulse scale-110 shadow-[0_0_40px_rgba(255,255,255,.8),0_0_80px_rgba(255,255,255,.4)] ring-4 ring-white/70 z-30" 
            : "active:scale-95"
        ].join(" ")}
        style={{ 
          width: "var(--icon)", 
          height: "var(--icon)",
          transform: isOpening ? 'scale(1.15)' : undefined,
          transition: isOpening ? 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.15s ease-out'
        }}
      >
        {/* Inner ring */}
        <div className="absolute inset-0 rounded-[20%] ring-1 ring-white/25" />
        
        {/* Opening animation overlay */}
        {isOpening && (
          <>
            <div className="absolute inset-0 rounded-[20%] bg-white/30 animate-ping" />
            <div 
              className="absolute inset-0 rounded-[20%]"
              style={{
                animation: 'shimmer 0.6s ease-out',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                backgroundSize: '200% 100%',
                backgroundPosition: '200% 0'
              }}
            />
            {/* Expanding glow effect */}
            <div className="absolute -inset-4 rounded-[30%] bg-white/20 animate-ping" style={{ animationDuration: '0.6s' }} />
          </>
        )}
        
        {/* Top gloss */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[56%] opacity-80"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,.9), rgba(255,255,255,.25))",
            clipPath: "ellipse(120% 70% at 50% 0%)",
            borderTopLeftRadius: "20%",
            borderTopRightRadius: "20%",
          }}
        />
        {/* Emoji */}
        <div 
          className={[
            "absolute inset-0 flex items-center justify-center text-xl drop-shadow-[0_1px_1px_rgba(0,0,0,.5)]",
            "transition-all duration-300 ease-out",
            isOpening ? "scale-125 drop-shadow-[0_0_10px_rgba(255,255,255,.8)]" : ""
          ].join(" ")}
        >
          <span>{emoji}</span>
        </div>
      </div>
      <span 
        className={[
          "text-[11px] leading-none text-white [text-shadow:0_1px_1px_rgba(0,0,0,.9)]",
          "transition-all duration-300",
          isOpening ? "opacity-90 scale-105 drop-shadow-[0_0_5px_rgba(255,255,255,.6)]" : ""
        ].join(" ")}
      >
        {title}
      </span>
    </RouterLink>
  );
}

function Dock({ apps, onOpeningChange }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10">
      <div className="px-8">
        <div
          className="relative rounded-[22px] bg-white/15 shadow-[inset_0_1px_8px_rgba(255,255,255,.55),0_10px_32px_rgba(0,0,0,.6)] backdrop-blur-md"
          style={{ height: "calc(var(--icon) * 1.25)" }}
        >
          {/* Gloss */}
          <div
            className="pointer-events-none absolute inset-x-6 top-0 rounded-t-[22px] opacity-75"
            style={{
              height: "50%",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,.8), rgba(255,255,255,.15))",
              clipPath: "ellipse(120% 100% at 50% 0%)",
            }}
          />
          {/* Apps in dock */}
          <div className="absolute inset-0 flex items-center justify-around px-4">
            {apps.map((a) => (
              <div key={a.title} className="pointer-events-auto">
                <AppIcon {...a} onOpeningChange={onOpeningChange} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
