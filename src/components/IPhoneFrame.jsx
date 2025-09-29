// src/components/IPhoneFrame.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IPhoneFrame({
  children,
  classic = true,
  wallpaperPreset = "aurora-blue",
  wallpaperUrl,
  wallpaperClass
}) {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-dvh bg-neutral-900 text-white">
      {/* Outer metal rim */}
      <div className="pointer-events-none absolute inset-0 rounded-[44px] ring-1 ring-black/70" />
      <div className="pointer-events-none absolute inset-[4px] rounded-[42px] bg-gradient-to-b from-neutral-500/70 via-neutral-700/70 to-neutral-900/70" />

      {/* Inner black glass bezel */}
      <div className="pointer-events-none absolute inset-[12px] rounded-[36px] bg-black shadow-[inset_0_2px_10px_rgba(255,255,255,.06),inset_0_-2px_10px_rgba(0,0,0,.6)]" />

      {/* Speaker + camera nub */}
      <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 flex items-center gap-2">
        <div className="h-[8px] w-[8px] rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,.2)] ring-1 ring-white/10" />
        <div className="h-[6px] w-24 rounded-full bg-neutral-800 shadow-[inset_0_1px_1px_rgba(255,255,255,.25)] ring-1 ring-black/60" />
      </div>

      {/* Screen area */}
      <div className="relative mx-auto top-10 h-[calc(100dvh-130px)] w-[min(92vw,800px)] " style={{ aspectRatio: "2 / 3" }}>
        <div className="absolute inset-0 rounded-[28px] ring-1 ring-black/60 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] overflow-hidden bg-black">
          {/* Wallpaper */}
          <Wallpaper preset={wallpaperPreset} url={wallpaperUrl} cls={wallpaperClass} />

          {/* Status bar */}
          <StatusBar classic={classic} />

          {/* Scrollable app content */}
          <div className="absolute inset-0 pt-9 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>

      {/* Home button */}
      <div className="absolute left-1/2 bottom-6 -translate-x-1/2">
        <button 
          onClick={handleHomeClick}
          className="h-[56px] w-[56px] rounded-full bg-neutral-900 shadow-[inset_0_2px_8px_rgba(255,255,255,.08),inset_0_-2px_10px_rgba(0,0,0,.8),0_8px_18px_rgba(0,0,0,.65)] ring-1 ring-black/70 flex items-center justify-center hover:bg-neutral-800 active:scale-95 transition-all duration-150"
          aria-label="Home"
        >
          <div className="h-[22px] w-[22px] rounded-[6px] border border-white/25" />
        </button>
      </div>
    </div>
  );
}

function Wallpaper({ preset = "aurora-blue", url, cls }) {
  if (cls) return <div className={`absolute inset-0 -z-10 ${cls}`} />;

  if (url) {
    return (
      <div className="absolute inset-0 z-0">
        <img src={url} alt="" className="h-full w-full object-cover" />
        {/* optional darken for contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
    );
  }

  // Presets
  if (preset === "ios4") {
    return (
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e2a50] via-[#0b1330] to-black" />
        <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,.25),transparent_40%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,.18),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,.2),transparent_40%),radial-gradient(circle_at_30%_75%,rgba(255,255,255,.16),transparent_45%)]" />
      </div>
    );
  }

  if (preset === "aurora-purple") {
    return (
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1400px_1000px_at_50%_-10%,#b67cff_0%,#5b1fa3_55%,#020617_100%)]" />
    );
  }

  if (preset === "solid") {
    return <div className="absolute inset-0 -z-10 bg-neutral-900" />;
  }

  // default "aurora-blue"
  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(1400px_1000px_at_50%_-10%,#69a7ff_0%,#1f3a95_55%,#020617_100%)]" />
      <div className="absolute inset-0 opacity-35 mix-blend-screen bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,.22),transparent_40%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,.14),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,.16),transparent_40%),radial-gradient(circle_at_30%_75%,rgba(255,255,255,.12),transparent_45%)]" />
    </div>
  );
}

function StatusBar({ classic = false }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const timeText = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return (
    <div className="absolute inset-x-0 top-0 z-10">
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between text-[11px] drop-shadow-[0_1px_1px_rgba(0,0,0,.8)]">
          <div className="flex items-center gap-2 opacity-95">
            <SignalDots />
            <span className="font-semibold tracking-tight">AT&amp;T</span>
            <span className="uppercase">{classic ? "3G" : "LTE"}</span>
          </div>
          <div className="font-semibold">{timeText}</div>
          <div className="flex items-center gap-1 opacity-95">
            <span className="text-[10px]">100%</span>
            <Battery />
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalDots() {
  return (
    <div className="flex items-center gap-[3px]">
      {[0,1,2,3,4].map(i => (
        <span key={i} className={`h-[6px] w-[6px] rounded-full ${i < 4 ? "bg-white" : "bg-white/40"}`} />
      ))}
    </div>
  );
}

function Battery() {
  return (
    <div className="relative h-[12px] w-[28px] rounded-[2px] border border-white/85 bg-black/40">
      <div className="absolute right-[-3px] top-1/2 h-[6px] w-[2px] -translate-y-1/2 rounded-r-[1px] bg-white/85" />
      <div className="m-[2px] h-[6px] w-[20px] bg-white/90" />
    </div>
  );
}
