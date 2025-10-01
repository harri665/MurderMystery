// src/pages/Invite.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import axios from "axios";

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
        console.error("Failed to fetch characters:", error);
      }
    };
    fetchCharacters();
  }, []);

  const character = useMemo(() => {
    const name = player?.name || "Guest";

    if (player?.characterId) {
      const assignedCharacter = characters.find(
        (c) => c.id === player.characterId
      );
      if (assignedCharacter) {
        return {
          name: assignedCharacter.name,
          role: player?.role || "Employee",
          avatar: player?.avatar || null,
          goals: assignedCharacter.goals || [],
          flaws: assignedCharacter.flaws || [],
          backstory: assignedCharacter.backstory || "",
        };
      }
    }

    return {
      name,
      role: player?.role || "Employee",
      avatar: player?.avatar || null,
      goals: player?.goals || [
        "Test1",
        "Test2",
        "test3",
      ],
      flaws: player?.flaws || [
        "Test1",
        "Test2",
      ],
      backstory:
        player?.backstory ||
        `${name} joined Blackwood Tower last year. Known for quick instincts and a knack for reading rooms, they've made as many friends as skeptics. Tonight's dinner could make — or break — their reputation.`,
    };
  }, [player, characters]);

  // phases: sealed -> peek -> details
  const [phase, setPhase] = useState("sealed");
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="min-h-dvh text-white p-6"
      style={{
        // Early 2000s: glossy gradients, soft glow, subtle starburst
        background:
          "radial-gradient(1200px 800px at 20% -10%, rgba(40,120,255,0.30), transparent 60%), radial-gradient(900px 600px at 120% 20%, rgba(255,180,80,0.20), transparent 60%), linear-gradient(180deg, #0c1120 0%, #0a0f1a 60%, #070b14 100%)",
      }}
    >
      {/* scanline + glossy overlay */}
      <div
        className="pointer-events-none fixed inset-0 mix-blend-screen opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.06)), repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 3px)`,
        }}
      />

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="text-sky-300 hover:text-sky-200 text-sm">
            ← Home
          </Link>

          {/* Retro header pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 shadow-[0_4px_16px_rgba(0,0,0,.4)]">
            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-lime-300 to-lime-500 shadow-[0_0_8px_rgba(190,255,150,.9)]" />
            <span className="text-[11px] tracking-widest uppercase text-white/80">
              Blackwood Tower
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase !== "details" ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="grid place-items-center min-h-[70vh]"
            >
              <Envelope
                phase={phase}
                reduceMotion={reduceMotion}
                onPrimaryClick={() => phase === "sealed" && setPhase("peek")}
                onLetterClick={() => phase === "peek" && setPhase("details")}
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
    </div>
  );
}

/* ========================= */
/* Envelope (starts closed)  */
/* ========================= */
function Envelope({ phase, onPrimaryClick, onLetterClick, reduceMotion }) {
  const isSealed = phase === "sealed";
  const isPeek = phase === "peek";

  return (
    <motion.div
      className="w-full max-w-lg"
      animate={
        isSealed && !reduceMotion
          ? { rotateZ: [0, -1.6, 1.6, -1.6, 1.6, 0], y: [0, -1, 1, -1, 1, 0] }
          : { rotateZ: 0, y: 0 }
      }
      transition={
        isSealed && !reduceMotion
          ? {
              duration: 1.4,
              repeat: Infinity,
              repeatDelay: 1.8,
              ease: "easeInOut",
            }
          : { duration: 0.3 }
      }
    >
      <div className="text-center mb-5 select-none">
        <div className="text-[11px] tracking-[0.25em] text-white/70 uppercase">
          You're invited
        </div>
        <div className="text-xs text-white/60">
          Tap {isSealed ? "the envelope" : "the letter"} to continue
        </div>
      </div>

      <div
        className="relative mx-auto w-[min(520px,92%)]"
        style={{ perspective: 1400 }}
      >
        {/* Click to open on first tap */}
        <div
          role="button"
          aria-label="Open invitation"
          onClick={isSealed ? onPrimaryClick : undefined}
          className="relative w-full h-72 focus:outline-none"
        >
          {/* Envelope base */}
          <div
            className="absolute inset-0 rounded-[22px] overflow-visible border border-amber-300/70 shadow-[0_20px_60px_rgba(0,0,0,.45)]"
            style={{
              background:
                "linear-gradient(135deg,#f7e7b6 0%,#ead095 40%,#e6c37c 100%)",
            }}
          >
            {/* subtle inner edge */}
            <div className="absolute inset-0 rounded-[22px] pointer-events-none shadow-[inset_0_3px_10px_rgba(0,0,0,.10)]" />

            {/* Side folds with shaded bevels */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-52 w-52 opacity-70"
              style={{
                clipPath: "polygon(0 0,100% 50%,0 100%)",
                background: "linear-gradient(135deg,#f5deaa,#e8c985)",
              }}
            />
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 h-52 w-52 opacity-70"
              style={{
                clipPath: "polygon(0 50%,100% 0,100% 100%)",
                background: "linear-gradient(225deg,#f5deaa,#e8c985)",
              }}
            />

            {/* Inner lining pattern revealed when flap opens */}
            <motion.div
              className="absolute inset-3 rounded-[18px] z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPeek ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,.4) 0 10px, rgba(255,255,255,.15) 10px 20px)",
                filter: "blur(0.2px)",
              }}
            />

            {/* LETTER (starts INSIDE; slides OUTSIDE above the envelope on peek) */}
            <motion.div
              onClick={isPeek ? onLetterClick : undefined}
              className={`absolute left-1/2 top-7 -translate-x-1/2 rounded-xl bg-white border border-amber-300/70 z-20 ${
                isPeek ? "cursor-pointer" : ""
              }`}
              initial={false}
              animate={{
                y: isPeek ? -195 : 0, // slide upward out of the envelope
                height: isPeek ? "auto" : 208,
                width: isPeek ? "90%" : "86%",
                boxShadow: isPeek
                  ? "0px 28px 60px rgba(0,0,0,0.45)"
                  : "0px 12px 28px rgba(0,0,0,0.25)",
                rotateX: isPeek ? 0 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 140,
                damping: 16,
                // follows flap
                  }}
                  style={{
                  overflow: isPeek ? "visible" : "hidden",
                  zIndex: isPeek ? 50 : 20,
                  }}
                  >
                  <motion.div
                  className="h-full w-full p-5 text-neutral-800 relative"
                  initial={false}
                  animate={{ opacity: isPeek ? 1 : 0 }}
                  transition={{
                    duration: 0.45,
                    delay: isPeek && !reduceMotion ? 0.95 : 0,
                  }}
                  >
                  {/* faux letterhead */}
                  <div className="text-center">
                    <div className="text-[11px] tracking-[0.35em] text-neutral-700 uppercase font-bold">
                    Blackwood Tower
                    </div>
                    <div className="mt-1 text-lg font-serif font-bold text-neutral-800">
                    Yearly Company Dinner Party
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium px-4 py-1 rounded-full inline-block select-none ring-1 ring-sky-400"
                    style={{
                    background: isSealed
                    ? undefined
                    : "linear-gradient(90deg,#38bdf8 0%,#2563eb 100%)",
                    color: isSealed ? "#444" : "#fff",
                    fontWeight: isSealed ? "500" : "700",
                    letterSpacing: isSealed ? "0.02em" : "0.04em",
                    boxShadow: isSealed
                    ? undefined
                    : "0 2px 12px 0 rgba(56,189,248,0.12)",
                    }}
                  >
                    {isSealed ? "Tap to open" : "Tap to view character"}
                  </div>
                  <div className="mt-4 text-[13px] leading-relaxed font-normal text-neutral-800">
                    You are <span className="font-semibold text-neutral-700">cordially invited</span> to an evening of <span className="font-semibold">celebration</span>, <span className="font-semibold">intrigue</span>, and <span className="font-semibold">collaboration</span>. Formal attire suggested. Dinner to follow.
                  </div>
                  <ul className="mt-4 mb-2 text-[13px] text-neutral-900 space-y-2 font-normal">
                    <li>
                    <span className="inline-block px-2 py-1 rounded bg-neutral-100 text-neutral-700 font-semibold mr-2">Oct 4th at 5 pm</span>
                    </li>
                    <li>
                    <span className="inline-block px-2 py-1 rounded bg-neutral-100 text-neutral-700 font-semibold mr-2">Dress in character / Business Casual</span>
                    </li>
                    <li>
                    <span className="inline-block px-2 py-1 rounded bg-neutral-100 text-neutral-700 font-semibold mr-2">There will be food but it will not be dinner</span>
                    </li>
                    <li>
                    <span className="inline-block px-2 py-1 rounded bg-neutral-100 text-neutral-700 font-semibold mr-2">Backstories are important, take a second to read through yours</span>
                    </li>
                    <li>
                    <span className="inline-block px-2 py-1 rounded bg-neutral-100 text-neutral-700 font-semibold mr-2">This will be outside and includes walking</span>
                    </li>
                    <li>
                    <span className="font-semibold text-neutral-700 bg-neutral-100 px-2 py-1 rounded">
                    Come with your <span className="underline">phone fully charged</span>
                    </span>
                    </li>
                  </ul>
                  <div className="mt-4 text-right text-xs text-neutral-500 italic font-medium">
                    — Blackwood Tower
                  </div>
                  </motion.div>

                  {/* subtle ring pulse when tappable */}
                  {isPeek && (
                  <motion.div
                    className="absolute inset-0 rounded-xl ring-2 ring-sky-400/40 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                    duration: 1.2,
                    repeat: !reduceMotion ? Infinity : 0,
                    }}
                  />
                  )}
                  </motion.div>

                  {/* FRONT POCKET OVERLAY (covers the letter while inside) */}
                  <motion.div
                    className="absolute inset-0 rounded-[22px] z-30 pointer-events-none"
                    initial={false}
                    animate={{ opacity: isPeek ? 0 : 1 }}
                    transition={{ duration: 0.3, delay: isPeek ? 0 : 0.2 }}
                    style={{
                      clipPath: "polygon(0 28%, 50% 0, 100% 28%, 100% 100%, 0 100%)",
                      background:
                        "linear-gradient(180deg, rgba(250,234,177,0.95), rgba(236,205,130,0.96))",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)",
                    }}
                  />

                  {/* Wax seal + burst particles */}
                  <motion.div
                    className="absolute left-1/2 top-[52%] -translate-x-1/2 z-40 rounded-full h-20 w-20 overflow-hidden"
                    initial={false}
                    animate={{ scale: isSealed ? 1 : 0, opacity: isSealed ? 1 : 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <img
                      src="/images/seal.png"
                      alt="Wax seal"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Burst chips */}
                  {!isSealed && (
              <div className="absolute left-1/2 top-[52%] -translate-x-1/2 z-40">
                {[...Array(8)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute h-2.5 w-2.5 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, #ff9ab0, #b20a2c)",
                    }}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
                    animate={{
                      opacity: [0, 1, 0],
                      x:
                        Math.cos((i / 8) * Math.PI * 2) * 80 +
                        Math.random() * 10,
                      y:
                        Math.sin((i / 8) * Math.PI * 2) * 50 +
                        Math.random() * 8,
                      scale: [0.8, 1.2, 0.6],
                    }}
                    transition={{ duration: 0.6, delay: 0.05 + i * 0.02 }}
                  />
                ))}
              </div>
            )}

            {/* TOP FLAP (opens on first tap) */}
            <motion.div
              className={`absolute left-0 right-0 top-0 h-1/2 origin-top ${
                isPeek ? "z-30" : "z-50"
              }`}
              style={{
                transformStyle: "preserve-3d",
                clipPath: "polygon(0 0,100% 0,50% 100%)",
                background: "linear-gradient(#f6e3b1,#e4c882)",
              }}
              initial={false}
              animate={{ rotateX: isPeek ? -180 : 0 }}
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 18,
                delay: !isSealed ? 0.18 : 0,
              }}
            >
              {/* flap thickness */}
              <div
                className="absolute inset-x-0 bottom-0 h-[10px]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0))",
                }}
              />
              {/* faux stamp */}
              <div
                className="absolute right-6 top-3 h-10 w-8 rounded-sm border border-amber-700/40"
                style={{
                  background: "linear-gradient(180deg,#fff 0%,#f0e4c0 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(0,0,0,.06) 6px, rgba(0,0,0,.06) 12px)",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WaxSeal() {
  return (
    <div className="relative w-full h-full">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #ff8aa1, #b20a2c 65%)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-overlay opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,.8), transparent 40%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest">
          BT
        </span>
      </div>
      {/* ripples */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ boxShadow: "inset 0 10px 24px rgba(0,0,0,.35)" }}
      />
    </div>
  );
}

/* ========================= */
/* Details view              */
/* ========================= */
function ProfileDetails({ character }) {
  const initials = initialsFromName(character.name);
  const player = usePlayer();

  return (
    <div className="space-y-6">
      {/* Glassy identity card with early-2000s chrome gradient header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-[0_12px_30px_rgba(0,0,0,.45)]">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden ring-1 ring-white/15 bg-gradient-to-br from-sky-500/40 to-indigo-500/40 grid place-items-center">
            {character.avatar ? (
              <img
                src={character.avatar}
                alt={character.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-white/80"
                  fill="currentColor"
                >
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9H1V21H23V9H21ZM19 19H5V11H19V19ZM9 13H11V15H9V13ZM13 13H15V15H13V13Z" />
                  <circle
                    cx="18"
                    cy="6"
                    r="3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                  <path
                    d="M20 4L21.5 5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </div>
            )}
            {/* floating shine */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-6 skew-x-[20deg]"
              animate={{ x: ["-60%", "130%"] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.4 }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,.25) 45%, rgba(255,255,255,.55) 50%, rgba(255,255,255,.25) 55%, transparent)",
              }}
            />
          </div>
          <div>
            <div className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
              {character.name}
            </div>
            <div className="text-white/70 text-sm">{character.role}</div>
          </div>
        </div>
      </div>

      {/* Role Status */}
      {player && (
        <div className="text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              player.isKiller
                ? "bg-red-600/20 text-red-300 border border-red-500/30"
                : player.isDetective
                ? "bg-sky-600/20 text-sky-300 border border-sky-500/30"
                : "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {player.isKiller ? (
              <>
                <span>🔪</span>
                <span>You are the killer</span>
              </>
            ) : player.isDetective ? (
              <>
                <span>🕵️</span>
                <span>You are the detective</span>
              </>
            ) : (
              <>
                <span>✅</span>
                <span>You are a civilian</span>
              </>
            )}
          </div>
        </div>
      )}

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
        <p className="text-sm leading-relaxed text-neutral-200">
          {character.backstory}
        </p>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-[0_12px_30px_rgba(0,0,0,.45)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
          {title}
        </h2>
        <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-white/40 to-transparent" />
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
      const p = JSON.parse(localStorage.getItem("player") || "null");
      setPlayer(p);
    } catch {
      setPlayer(null);
    }
  }, []);
  return player;
}

function initialsFromName(name = "") {
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "GT";
}
