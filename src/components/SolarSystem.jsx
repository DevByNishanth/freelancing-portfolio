import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  SiReact,
  SiNextdotjs,
  SiJavascript,
  SiNodedotjs,
  SiPython,
  SiExpress,
  SiMongodb,
  SiGithub,
  SiFigma,
  SiFirebase,
  SiPostgresql,
  SiTailwindcss,
} from "./techIcons";
import "./solar-system.css";

/* =====================================================================
   Technology orbit — same language as Services / Team / Contact:
   black canvas, emerald #009966, italic label with a drawing line,
   masked word-reveal heading, cursor glow, spring hovers.

   The rings are tilted ellipses, planets are driven by motion values
   (no CSS counter-rotation), nearer planets are bigger and brighter,
   and hovering a planet or a legend chip focuses its orbit.
   ===================================================================== */

const EASE = [0.22, 1, 0.36, 1];

// logical stage sizes; "compact" is used on phones with tighter orbits so logos stay readable
const LAYOUTS = {
  full: { w: 920, h: 410, k: 1 },
  compact: { w: 560, h: 300, k: 0.6 },
};
const TILT = 0.36; // ellipse squash (ry = rx * TILT)

const technologies = [
  {
    id: "frontend",
    name: "Frontend",
    speed: 38, // seconds per revolution
    radius: 190,
    dir: 1,
    items: [
      { name: "React", Icon: SiReact, color: "#61DAFB" },
      { name: "Next.js", Icon: SiNextdotjs, color: "#FFFFFF" },
      { name: "JavaScript", Icon: SiJavascript, color: "#F7DF1E" },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    speed: 52,
    radius: 305,
    dir: -1,
    items: [
      { name: "Node.js", Icon: SiNodedotjs, color: "#68A063" },
      { name: "Python", Icon: SiPython, color: "#3776AB" },
      { name: "Express", Icon: SiExpress, color: "#FFFFFF" },
      { name: "MongoDB", Icon: SiMongodb, color: "#47A248" },
    ],
  },
  {
    id: "tools",
    name: "Tools",
    speed: 68,
    radius: 420,
    dir: 1,
    items: [
      { name: "GitHub", Icon: SiGithub, color: "#FFFFFF" },
      { name: "Figma", Icon: SiFigma, color: "#F24E1E" },
      { name: "Firebase", Icon: SiFirebase, color: "#FFCA28" },
      { name: "PostgreSQL", Icon: SiPostgresql, color: "#4169E1" },
      { name: "Tailwind", Icon: SiTailwindcss, color: "#38BDF8" },
    ],
  },
];

/* ---------- Heading: words slide up from a mask ---------- */
const AnimatedHeading = ({ text }) => {
  const words = text.split(" ");
  return (
    <motion.h2
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: 0.1 }}
      className="text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-[56px]"
    >
      {words.map((word, i) => (
        <span key={i} className={`inline-block overflow-hidden pb-1 align-bottom ${i < words.length - 1 ? "mr-3" : ""}`}>
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", rotate: 4 },
              visible: { y: 0, rotate: 0, transition: { duration: 0.8, ease: EASE } },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
      <motion.span
        className="inline-block text-emerald-600"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 12 } },
        }}
      >
        .
      </motion.span>
    </motion.h2>
  );
};

/* ---------- Deterministic starfield (generated once) ---------- */
const STARS = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 46 }, (_, i) => ({
    id: i,
    x: rnd() * 100,
    y: rnd() * 100,
    size: 1 + rnd() * 1.8,
    delay: rnd() * 4,
    dur: 2.5 + rnd() * 3.5,
  }));
})();

/* ---------- One planet ---------- */
const Planet = ({ item, orbit, k, baseAngle, angle, reveal, active, dimmed, onHover, onLeave, showLabel }) => {
  const rx = orbit.radius * k;
  const ry = rx * TILT;

  // position on the tilted ellipse
  const x = useTransform([angle, reveal], ([a, r]) => Math.cos(baseAngle + a) * rx * r);
  const y = useTransform([angle, reveal], ([a, r]) => Math.sin(baseAngle + a) * ry * r);
  // depth: sin > 0 is the near side of the ring
  const depth = useTransform(angle, (a) => (Math.sin(baseAngle + a) + 1) / 2); // 0 back .. 1 front
  const scale = useTransform([depth, reveal], ([d, r]) => (0.72 + d * 0.38) * (0.4 + 0.6 * r));
  const opacity = useTransform([depth, reveal], ([d, r]) => (0.55 + d * 0.45) * r);
  const zIndex = useTransform(depth, (d) => (d > 0.5 ? 20 : 2));

  const [hover, setHover] = useState(false);
  const { Icon } = item;

  return (
    <motion.div
      style={{ x, y, zIndex, left: "50%", top: "50%" }}
      className="absolute"
    >
      {/* the visible planet is centred on the ellipse point */}
      <motion.div style={{ scale, opacity }} className="absolute -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ opacity: dimmed ? 0.25 : 1 }}
          transition={{ duration: 0.4 }}
          onHoverStart={() => {
            setHover(true);
            onHover();
          }}
          onHoverEnd={() => {
            setHover(false);
            onLeave();
          }}
          className="relative flex cursor-pointer flex-col items-center gap-2"
        >
          {/* glow halo */}
          <motion.span
            aria-hidden
            animate={{ opacity: hover ? 0.9 : active ? 0.35 : 0, scale: hover ? 1.6 : 1.2 }}
            transition={{ duration: 0.4 }}
            style={{ background: item.color }}
            className="pointer-events-none absolute left-1/2 top-[26px] h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
          />
          <motion.div
            animate={{ scale: hover ? 1.25 : 1, y: hover ? -4 : 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 16 }}
            style={{ "--tech-color": item.color }}
            className="tech-chip relative grid h-[52px] w-[52px] place-items-center rounded-full border border-white/15 bg-neutral-950/80 backdrop-blur"
          >
            <Icon size={24} color={item.color} />
          </motion.div>

          <span
            className={`whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-300 ${
              hover ? "text-white" : "text-gray-500"
            } ${showLabel ? "" : "hidden"}`}
          >
            {item.name}
          </span>

          {/* tooltip card */}
          <AnimatePresence>
            {hover && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="pointer-events-none absolute bottom-full mb-3 whitespace-nowrap rounded-xl border border-white/10 bg-neutral-950/95 px-3 py-2 text-center shadow-xl backdrop-blur"
              >
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500">{orbit.name}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/* ---------- One orbit: ring + comet + planets ---------- */
const Orbit = ({ orbit, layout, compact, index, inView, reduced, focus, hovered, onHover, onLeave }) => {
  const { w: STAGE_W, h: STAGE_H, k } = layout;
  const rx = orbit.radius * k;
  const ry = rx * TILT;

  // revealed from the centre, staggered
  const reveal = useSpring(0, { stiffness: 55, damping: 16 });
  useEffect(() => {
    const t = setTimeout(() => reveal.set(inView ? 1 : 0), inView ? 250 + index * 260 : 0);
    return () => clearTimeout(t);
  }, [inView, index, reveal]);

  // angle is advanced manually so speed can ease to 0 on hover
  const angle = useMotionValue(index * 0.9);
  const speed = useSpring(1, { stiffness: 60, damping: 18 });
  const isFocus = focus === orbit.id;
  const dimmed = !!focus && !isFocus;

  useEffect(() => {
    // hovered planet's orbit pauses, the others slow down
    speed.set(reduced ? 0 : hovered === orbit.id ? 0 : hovered ? 0.35 : 1);
  }, [hovered, orbit.id, reduced, speed]);

  useAnimationFrame((_, delta) => {
    const s = speed.get();
    if (!s) return;
    angle.set(angle.get() + orbit.dir * ((Math.PI * 2) / orbit.speed) * (delta / 1000) * s);
  });

  const n = orbit.items.length;

  return (
    <>
      {/* ring */}
      <motion.svg
        aria-hidden
        width={STAGE_W}
        height={STAGE_H}
        viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
        animate={{ opacity: dimmed ? 0.25 : 1 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none absolute left-0 top-0"
      >
        <motion.ellipse
          cx={STAGE_W / 2}
          cy={STAGE_H / 2}
          rx={rx}
          ry={ry}
          fill="none"
          strokeDasharray="3 7"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: inView ? 1 : 0,
            opacity: inView ? 1 : 0,
            stroke: isFocus ? "rgba(0,153,102,0.9)" : "rgba(255,255,255,0.16)",
          }}
          transition={{ pathLength: { duration: 1.6, ease: EASE, delay: 0.2 + index * 0.25 }, stroke: { duration: 0.4 } }}
          strokeWidth={1}
        />
        {/* comet racing along the ring */}
        {!reduced && (
          <motion.ellipse
            cx={STAGE_W / 2}
            cy={STAGE_H / 2}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="#34d399"
            strokeWidth={2}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="0.07 0.93"
            animate={{ strokeDashoffset: orbit.dir > 0 ? [0, -1] : [0, 1], opacity: inView ? 0.9 : 0 }}
            transition={{
              strokeDashoffset: { duration: orbit.speed / 3, repeat: Infinity, ease: "linear" },
              opacity: { duration: 1, delay: 1.2 + index * 0.25 },
            }}
            style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,.9))" }}
          />
        )}
      </motion.svg>

      {/* planets */}
      <div className="absolute inset-0">
        {orbit.items.map((item, i) => (
          <Planet
            key={item.name}
            item={item}
            orbit={orbit}
            k={k}
            baseAngle={(Math.PI * 2 * i) / n}
            angle={angle}
            reveal={reveal}
            active={isFocus}
            dimmed={dimmed}
            showLabel={!compact}
            onHover={() => onHover(orbit.id)}
            onLeave={onLeave}
          />
        ))}
      </div>
    </>
  );
};

/* ---------- Glowing core ---------- */
const Core = ({ label, inView, reduced, compact }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={inView ? { scale: compact ? 0.6 : 1, opacity: 1 } : {}}
    transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.1 }}
    className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
  >
    {/* expanding pulse rings */}
    {!reduced &&
      [0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          animate={{ scale: [1, 3.2], opacity: [0.35, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeOut", delay: i * 1.5 }}
          className="absolute inset-0 rounded-full border border-emerald-500"
        />
      ))}
    <div className="relative grid h-[112px] w-[112px] place-items-center">
      {/* spinning conic ring */}
      <motion.span
        aria-hidden
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        className="core-ring absolute inset-0 rounded-full"
      />
      <div className="relative grid h-[104px] w-[104px] place-items-center rounded-full bg-black shadow-[0_0_60px_rgba(0,153,102,.45)]">
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(0,153,102,.35),transparent_70%)]" />
        <div className="relative flex flex-col items-center gap-1">
          <motion.span
            animate={reduced ? undefined : { rotate: [0, 90, 180, 270, 360], scale: [1, 1.15, 1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="text-3xl leading-none text-emerald-400"
          >
            ✦
          </motion.span>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gray-300">{label}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ---------- Section ---------- */
export function SolarSystem({
  label = "Our technology stack",
  title = "Technologies we work with",
  description = "We combine modern technologies to build powerful digital experiences.",
  centerLabel = "Our Stack",
}) {
  const sectionRef = useRef(null);
  const wrapRef = useRef(null);
  const stageInView = useInView(wrapRef, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  const [hovered, setHovered] = useState(null); // orbit whose planet is hovered
  const [legend, setLegend] = useState(null); // orbit whose legend chip is hovered
  const focus = hovered ?? legend;

  /* scale the logical stage to the available width */
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const compact = width < 700;
  const layout = compact ? LAYOUTS.compact : LAYOUTS.full;
  const scale = Math.min(1, width / layout.w);

  /* pointer parallax: the stage leans toward the cursor */
  const mx = useSpring(0, { stiffness: 80, damping: 20 });
  const my = useSpring(0, { stiffness: 80, damping: 20 });
  const rotateY = useTransform(mx, [-1, 1], [-7, 7]);
  const rotateX = useTransform(my, [-1, 1], [5, -5]);

  /* section cursor glow */
  const px = useMotionValue(-600);
  const py = useMotionValue(-600);
  const glow = useMotionTemplate`radial-gradient(520px circle at ${px}px ${py}px, rgba(0, 153, 102, 0.12), transparent 65%)`;
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
    if (!reduced) {
      mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
      my.set(((e.clientY - r.top) / r.height) * 2 - 1);
    }
  };
  const onLeave = () => {
    px.set(-600);
    py.set(-600);
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      id="technology"
      ref={sectionRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="main-container technology-section relative overflow-clip bg-black px-4 py-20 text-white md:py-28"
    >
      {/* backdrop */}
      <div aria-hidden className="tech-dots pointer-events-none absolute inset-0" />
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} />
      <motion.div
        aria-hidden
        animate={reduced ? undefined : { scale: [1, 1.15, 1], opacity: [0.18, 0.3, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-[58%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600 opacity-20 blur-[170px]"
      />
      {/* twinkling stars */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map((s) => (
          <motion.span
            key={s.id}
            animate={reduced ? { opacity: 0.4 } : { opacity: [0.08, 0.7, 0.08] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            className="absolute rounded-full bg-white"
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="lable mb-4 flex items-center gap-2 italic text-emerald-600"
        >
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: 32 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="block h-px bg-[#048a47]"
          />
          {label}
        </motion.div>

        {/* header */}
        <div className="header flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <AnimatedHeading text={title} />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
            className="text-[15px] leading-relaxed text-gray-300 md:w-[30%]"
          >
            {description}
          </motion.p>
        </div>

        {/* stage */}
        <div ref={wrapRef} className="mt-12 w-full md:mt-16" style={{ height: layout.h * scale }}>
          <div style={{ perspective: 1200 }} className="h-full w-full">
            <motion.div
              style={{
                width: layout.w,
                height: layout.h,
                scale,
                transformOrigin: "top left",
                left: "50%",
                marginLeft: -(layout.w * scale) / 2,
                rotateX,
                rotateY,
              }}
              className="relative"
            >
              {technologies.map((orbit, i) => (
                <Orbit
                  key={orbit.id}
                  orbit={orbit}
                  layout={layout}
                  compact={compact}
                  index={i}
                  inView={stageInView}
                  reduced={reduced}
                  focus={focus}
                  hovered={hovered}
                  onHover={setHovered}
                  onLeave={() => setHovered(null)}
                />
              ))}
              <Core label={centerLabel} inView={stageInView} reduced={reduced} compact={compact} />
            </motion.div>
          </div>
        </div>

        {/* legend: hover a chip to focus its orbit */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } } }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {technologies.map((o) => {
            const on = focus === o.id;
            return (
              <motion.button
                key={o.id}
                type="button"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
                }}
                onMouseEnter={() => setLegend(o.id)}
                onMouseLeave={() => setLegend(null)}
                onFocus={() => setLegend(o.id)}
                onBlur={() => setLegend(null)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`relative overflow-hidden rounded-full border px-5 py-2.5 text-sm transition-colors duration-300 ${
                  on ? "border-emerald-600 text-white" : "border-white/15 text-gray-400"
                }`}
              >
                <AnimatePresence>
                  {on && (
                    <motion.span
                      layoutId="legend-pill"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-[#009966]/25"
                    />
                  )}
                </AnimatePresence>
                <span className="relative flex items-center gap-2">
                  {o.name}
                  <span className="font-mono text-xs tabular-nums text-emerald-500">
                    {String(o.items.length).padStart(2, "0")}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default SolarSystem;
