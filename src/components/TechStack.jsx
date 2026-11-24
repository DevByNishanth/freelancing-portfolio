import { useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { Layers, ShieldCheck, Zap } from "lucide-react";
import Reveal from "@/components/Reveal";

const EASE = [0.22, 1, 0.36, 1];

// --------------------------------------------------
// DEFAULT CONTENT (override any of these with props)
// --------------------------------------------------
const DEFAULT_DESCRIPTION =
  "Every project is built on tools we trust in production, picked for performance, long-term maintainability and a great developer experience. Nothing flashy for its own sake: each choice has to earn its place in the stack.";

const DEFAULT_HIGHLIGHTS = [
  { icon: Zap, title: "Fast by default", text: "Lean bundles and optimised assets keep load times low." },
  { icon: Layers, title: "Built to scale", text: "A modular architecture that grows with the product." },
  { icon: ShieldCheck, title: "Easy to maintain", text: "Clean, documented code your team can own." },
];

const DEFAULT_TOOLS = [
  "Git", "GitHub", "Figma", "Vercel", "Vite", "Docker",
  "npm", "Postman", "ESLint", "Prettier", "Notion", "Slack",
];

// --------------------------------------------------
// Keyframes (disabled for reduced motion)
// --------------------------------------------------
const STYLES = `
@keyframes ts-spin { to { transform: rotate(360deg); } }
@keyframes ts-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes ts-shimmer {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
.ts-spin { animation: ts-spin var(--d, 30s) linear infinite; }
.ts-rev { animation-direction: reverse; }
.ts-orbit:hover .ts-spin { animation-play-state: paused; }
.ts-marquee { animation: ts-marquee 35s linear infinite; }
.ts-marquee:hover { animation-play-state: paused; }
.ts-shimmer { background-size: 200% 100%; animation: ts-shimmer 5s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .ts-spin, .ts-marquee, .ts-shimmer { animation: none; }
}
`;

// --------------------------------------------------
// Logos (Simple Icons CDN in brand colours, letter fallback)
// --------------------------------------------------
const SLUG_OVERRIDES = {
  "framer motion": "framer",
  gsap: "greensock",
  "react native": "react",
  "node.js": "nodedotjs",
};

const toSlug = (name) => {
  const key = name.toLowerCase().trim();
  if (SLUG_OVERRIDES[key]) return SLUG_OVERRIDES[key];
  return key.replace(/\./g, "dot").replace(/[^a-z0-9]/g, "");
};

// Brands whose official colour is black / very dark would vanish on the dark
// tiles, so those are drawn in white instead. Add more slugs here if needed.
const DARK_BRANDS = new Set([
  "github", "nextdotjs", "vercel", "notion", "express", "framer",
  "threedotjs", "django", "slack", "flask", "radixui", "shadcnui",
  "openai", "x", "bun", "astro", "sanity", "supabase",
]);

// must sit inside an element with the `group` class
const TechLogo = ({ name, imgClass }) => {
  const [failed, setFailed] = useState(false);
  const slug = toSlug(name);
  const src = DARK_BRANDS.has(slug)
    ? `https://cdn.simpleicons.org/${slug}/ffffff`
    : `https://cdn.simpleicons.org/${slug}`;

  if (failed) {
    return (
      <span className="text-sm font-semibold text-gray-300 transition-colors group-hover:text-emerald-300">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={`${imgClass} transition-transform duration-300 group-hover:scale-110`}
    />
  );
};

// --------------------------------------------------
// Orbit illustration: tech logos circling a glowing core
// --------------------------------------------------
const RINGS = [
  { r: 22, count: 3, duration: 28, reverse: false },
  { r: 34, count: 4, duration: 40, reverse: true },
  { r: 45, count: 6, duration: 56, reverse: false },
];

// split the item list across the rings (core tech first, then tools)
function distribute(items) {
  let cursor = 0;
  return RINGS.map((ring) => {
    const slice = items.slice(cursor, cursor + ring.count);
    cursor += ring.count;
    return { ...ring, items: slice };
  }).filter((ring) => ring.items.length > 0);
}

const OrbitItem = ({ item, angle, r }) => {
  const rad = (angle * Math.PI) / 180;
  const left = 50 + r * Math.cos(rad);
  const top = 50 + r * Math.sin(rad);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${left}%`, top: `${top}%`, width: "11%", aspectRatio: "1" }}
    >
      {/* counter-rotation keeps the logo upright while the ring spins */}
      <div
        className={`ts-spin h-full w-full ${item.ringReverse ? "" : "ts-rev"}`}
        style={{ "--d": item.duration }}
      >
        <div
          title={item.name}
          aria-label={item.name}
          className={`group flex h-full w-full items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-125 hover:shadow-[0_0_28px_-4px_rgba(52,211,153,0.7)] ${
            item.core
              ? "border-emerald-400/40 bg-emerald-400/10"
              : "border-white/10 bg-[#0b1511]/90 hover:border-emerald-400/50"
          }`}
        >
          <TechLogo name={item.name} imgClass="h-1/2 w-1/2" />
        </div>
      </div>
    </div>
  );
};

const TechOrbit = ({ items, x, y }) => {
  const rings = distribute(items);

  return (
    <motion.div style={{ x, y }}>
      <style>{STYLES}</style>
      <div className="ts-orbit relative mx-auto aspect-square w-full max-w-[440px]">
        {/* soft glow */}
        <div
          aria-hidden
          className="absolute inset-[15%] rounded-full bg-emerald-500/25 blur-[70px]"
        />

        {/* rings */}
        {RINGS.map((ring) => (
          <div
            key={ring.r}
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10"
            style={{ width: `${ring.r * 2}%`, height: `${ring.r * 2}%` }}
          />
        ))}

        {/* radar sweep */}
        <div
          aria-hidden
          className="ts-spin absolute inset-[5%] rounded-full"
          style={{
            "--d": "9s",
            background:
              "conic-gradient(from 0deg, transparent 0 72%, rgba(52,211,153,0.22) 100%)",
            maskImage: "radial-gradient(circle, transparent 12%, black 13%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 12%, black 13%)",
          }}
        />

        {/* orbiting logos */}
        {rings.map((ring) => (
          <div
            key={ring.r}
            className={`ts-spin absolute inset-0 ${ring.reverse ? "ts-rev" : ""}`}
            style={{ "--d": `${ring.duration}s` }}
          >
            {ring.items.map((item, k) => (
              <OrbitItem
                key={item.name}
                item={{ ...item, duration: `${ring.duration}s`, ringReverse: ring.reverse }}
                angle={(360 / ring.items.length) * k - 90 + ring.r}
                r={ring.r}
              />
            ))}
          </div>
        ))}

        {/* core */}
        <div className="absolute left-1/2 top-1/2 flex h-[16%] w-[16%] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
          <span className="absolute -inset-[30%] rounded-full border border-emerald-400/20" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full border border-emerald-400/50 bg-gradient-to-br from-emerald-400/30 to-emerald-700/30 text-emerald-300 shadow-[0_0_40px_rgba(52,211,153,0.55)]">
            <Layers className="h-1/2 w-1/2" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --------------------------------------------------
// Tiles
// --------------------------------------------------
// Main stack tile: staggered entrance, idle float, hover glow + label
const CoreTile = ({ name, index }) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.li
      initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
      whileHover={reducedMotion ? undefined : { y: -6, scale: 1.06 }}
      className="relative"
    >
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
        transition={{
          duration: 3 + (index % 3) * 0.7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.25,
        }}
        className="group relative"
      >
        <div
          title={name}
          aria-label={name}
          className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all duration-300 group-hover:border-emerald-400/60 group-hover:bg-emerald-400/10 group-hover:shadow-[0_0_30px_-4px_rgba(52,211,153,0.55)] sm:h-16 sm:w-16"
        >
          <TechLogo name={name} imgClass="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {name}
        </span>
      </motion.div>
    </motion.li>
  );
};

// Smaller tile used in the scrolling tools row
const ToolTile = ({ name }) => (
  <li className="group relative shrink-0">
    <div
      title={name}
      aria-label={name}
      className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-300 group-hover:border-emerald-400/50 group-hover:bg-emerald-400/10 group-hover:shadow-[0_0_24px_-4px_rgba(52,211,153,0.5)]"
    >
      <TechLogo name={name} imgClass="h-5 w-5" />
    </div>
  </li>
);

const Marquee = ({ items }) => (
  <div className="[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] overflow-hidden">
    <div className="ts-marquee flex w-max">
      {[0, 1].map((copy) => (
        <ul key={copy} className="flex gap-3 pr-3" aria-hidden={copy === 1}>
          {items.map((name) => (
            <ToolTile key={`${copy}-${name}`} name={name} />
          ))}
        </ul>
      ))}
    </div>
  </div>
);

// --------------------------------------------------
// Section
// --------------------------------------------------
export default function TechStack({
  tech = [],
  description = DEFAULT_DESCRIPTION,
  highlights = DEFAULT_HIGHLIGHTS,
  tools = DEFAULT_TOOLS,
}) {
  const reducedMotion = useReducedMotion();

  // mouse parallax for the orbit
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 16 });
  const sy = useSpring(my, { stiffness: 60, damping: 16 });

  if (!tech.length) return null;

  const handleMove = (e) => {
    if (reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 24);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 24);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const extraTools = tools.filter(
    (t) => !tech.some((x) => x.toLowerCase() === t.toLowerCase()),
  );

  const orbitItems = [
    ...tech.map((name) => ({ name, core: true })),
    ...extraTools.map((name) => ({ name, core: false })),
  ];

  return (
    <section
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative z-10 mx-auto mt-28 w-[90%] max-w-6xl"
    >
      <div className="relative grid items-center gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
        {/* Left: orbit illustration */}
        <Reveal>
          <TechOrbit items={orbitItems} x={sx} y={sy} />
        </Reveal>

        {/* Right: copy + tiles */}
        <div className="min-w-0">
          <Reveal delay={0.1}>
            <span className="inline-block rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">
              Tech stack
            </span>

            <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Built on{" "}
              <span className="ts-shimmer bg-gradient-to-r from-emerald-300 via-white to-emerald-400 bg-clip-text text-transparent">
                {tech.length} modern tools
              </span>
              , chosen to scale.
            </h2>

            <p className="mt-4 max-w-lg leading-relaxed text-gray-400">{description}</p>
          </Reveal>

          {/* Highlights */}
          {/* <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={0.15 + i * 0.1} y={24}>
                <li className="group h-full rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-300 hover:border-emerald-400/40 hover:bg-emerald-400/[0.05]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                    <Icon size={16} />
                  </span>
                  <h3 className="mt-3 text-sm font-medium text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-400">{text}</p>
                </li>
              </Reveal>
            ))}
          </ul> */}

          {/* Core stack */}
          <Reveal delay={0.1}>
            <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Core stack
            </p>
          </Reveal>
          <ul className="mt-4 flex flex-wrap gap-3 pb-6 sm:gap-4">
            {tech.map((name, i) => (
              <CoreTile key={name} name={name} index={i} />
            ))}
          </ul>

          {/* Tools & workflow (scrolling) */}
          {extraTools.length > 0 && (
            <>
              <Reveal delay={0.1}>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                  Tools &amp; workflow
                </p>
              </Reveal>
              <Reveal delay={0.15} className="mt-4">
                <Marquee items={extraTools} />
              </Reveal>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
