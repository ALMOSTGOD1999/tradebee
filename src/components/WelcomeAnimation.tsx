import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

function Bee() {
  return (
    <g>
      <motion.g
        animate={{ rotate: [0, -22, 0, 22, 0] }}
        transition={{ duration: 0.16, repeat: Infinity, ease: "linear" }}
        style={{ originX: "0px", originY: "0px" }}
      >
        <ellipse cx="-7" cy="-9" rx="9" ry="5" fill="var(--foreground)" opacity="0.55" transform="rotate(-25 -7 -9)" />
        <ellipse cx="6" cy="-10" rx="8" ry="4.5" fill="var(--foreground)" opacity="0.4" transform="rotate(20 6 -10)" />
      </motion.g>
      <ellipse cx="0" cy="0" rx="13" ry="9" fill="var(--honey)" />
      <path d="M -4 -8 L -4 8" stroke="var(--background)" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M 3 -8.4 L 3 8.4" stroke="var(--background)" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="12" cy="-2" r="5" fill="var(--background)" />
      <circle cx="13.6" cy="-3" r="1.2" fill="var(--honey)" />
      <path d="M 12 -7 Q 15 -13 19 -12" stroke="var(--background)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="19.6" cy="-12.4" r="1.5" fill="var(--background)" />
    </g>
  );
}

const candles = [
  { x: 70, top: 250, bottom: 320, wickTop: 232, wickBottom: 336, bull: false },
  { x: 130, top: 210, bottom: 285, wickTop: 192, wickBottom: 300, bull: true },
  { x: 190, top: 225, bottom: 300, wickTop: 205, wickBottom: 316, bull: false },
  { x: 310, top: 150, bottom: 215, wickTop: 132, wickBottom: 232, bull: true },
  { x: 370, top: 110, bottom: 175, wickTop: 92, wickBottom: 190, bull: true },
];

export default function WelcomeAnimation({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const flip = window.setTimeout(() => setFlipped(true), 2400);
    const end = window.setTimeout(() => setVisible(false), 5200);
    return () => {
      window.clearTimeout(flip);
      window.clearTimeout(end);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={() => onDone?.()}>
      {visible && (
        <motion.div
          key="welcome"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background hero-surface"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 grid-lines opacity-25" />

          <svg viewBox="0 0 480 380" className="relative w-[min(90vw,640px)]">
            <line
              x1="30"
              y1="345"
              x2="450"
              y2="345"
              stroke="var(--border)"
              strokeWidth="2"
            />
            {candles.map((c) => (
              <g key={c.x}>
                <line
                  x1={c.x + 16}
                  y1={c.wickTop}
                  x2={c.x + 16}
                  y2={c.wickBottom}
                  stroke={c.bull ? "var(--bull)" : "var(--bear)"}
                  strokeWidth="3"
                />
                <rect
                  x={c.x}
                  y={c.top}
                  width="32"
                  height={c.bottom - c.top}
                  rx="4"
                  fill={c.bull ? "var(--bull)" : "var(--bear)"}
                />
              </g>
            ))}

            {/* The hero candle: starts red, turns green when the bee lands */}
            <motion.line
              x1="266"
              x2="266"
              y1="212"
              y2="330"
              stroke="var(--bear)"
              strokeWidth="3"
              animate={
                flipped
                  ? { stroke: "var(--bull)", y1: 150, y2: 316 }
                  : {}
              }
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            <motion.rect
              x="250"
              width="32"
              rx="4"
              initial={{ y: 230, height: 90, fill: "var(--bear)" }}
              animate={
                flipped
                  ? { y: 168, height: 132, fill: "var(--bull)" }
                  : { y: 230, height: 90 }
              }
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.g
              initial={{ x: -70, y: 90 }}
              animate={{
                x: [-70, 60, 150, 230, 266],
                y: [90, 40, 130, 60, flipped ? 152 : 214],
              }}
              transition={{ duration: 2.6, ease: "easeInOut", times: [0, 0.25, 0.5, 0.78, 1] }}
            >
              <motion.g
                animate={{ rotate: flipped ? 0 : [0, -6, 6, 0] }}
                transition={{ duration: 1.2, repeat: flipped ? 0 : Infinity }}
              >
                <Bee />
              </motion.g>
            </motion.g>
          </svg>

          <motion.div
            className="relative mt-6 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.7, duration: 0.7 }}
          >
            <h1 className="text-4xl font-bold tracking-[0.3em] text-primary sm:text-6xl">
              TRADEBEE
            </h1>
            <p className="mt-3 text-xs tracking-[0.45em] text-muted-foreground sm:text-sm">
              OWN YOUR SUCCESS
            </p>
          </motion.div>

          <button
            onClick={() => setVisible(false)}
            className="absolute bottom-8 rounded-full border border-border px-5 py-2 text-xs tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            SKIP
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
