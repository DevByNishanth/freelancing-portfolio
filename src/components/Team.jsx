import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

// shadcn put the file at ./Lanyard — if yours landed in ./ui, change this path
import Lanyard from "./Lanyard";
import { buildCardFace } from "../utils/cardFaces";
import "./Team.css";

import myImg from "../assets/my.png";
import sathiya from "../assets/sathiyaPic.png";
import deepak from "../assets/deepak.png";
import abi from "../assets/abi.png";
import faya from "../assets/faya.png";
import dharshan from "../assets/dharshan.png";
import venkat from "../assets/venkat.png";

const EASE = [0.22, 1, 0.36, 1];

// Team members — one lanyard each. `id` is assigned from the index below.
// TODO: replace each email with the person's real address (printed on the back of the card).
const teamMembers = [
  {
    name: "Nishanth",
    title: "Full Stack Developer",
    handle: "nishanth",
    status: "Available",
    avatarUrl: myImg,
    email: "nishanth@example.com",
  },
  {
    name: "Sathiya",
    title: "Backend Engineer",
    handle: "sathiya",
    status: "Available",
    avatarUrl: sathiya,
    email: "sathiya@example.com",
  },
  {
    name: "Deepak",
    title: "WordPress & Shopify developer",
    handle: "deepak",
    status: "Available",
    avatarUrl: deepak,
    email: "deepak@example.com",
  },
  {
    name: "Abishek",
    title: "Software Developer",
    handle: "abi",
    status: "Available",
    avatarUrl: abi,
    email: "abishek@example.com",
  },
  {
    name: "Fayaz",
    title: "Full stack Developer",
    handle: "fayaz",
    status: "Available",
    avatarUrl: faya,
    email: "fayaz@example.com",
  },
  {
    name: "Dharshan",
    title: "Wordpress / Mobile App Developer",
    handle: "dharshan",
    status: "Available",
    avatarUrl: dharshan,
    email: "dharshan@example.com",
  },
  {
    name: "Venkatesh",
    title: "UI/UX Designer",
    handle: "venkat",
    status: "Available",
    avatarUrl: venkat,
    email: "venkat@example.com",
  },
].map((m, i) => ({ ...m, id: i + 1, statusColor: "#22c55e" }));

const marqueeItems = [
  "Web Development",
  "UI/UX Design",
  "Custom Software",
  "E-commerce",
  "SEO",
  "Dashboards",
  "Maintenance",
];

/* --------------------------------
   Animated heading
--------------------------------- */

const AnimatedHeading = ({ text }) => {
  const words = text.split(" ");

  return (
    <motion.h2
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: 0.12 }}
      className="text-white font-semibold text-4xl md:text-[56px] leading-[1.05] tracking-tight"
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-1 mr-3 align-bottom"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", rotate: 4 },
              visible: {
                y: 0,
                rotate: 0,
                transition: { duration: 0.8, ease: EASE },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}

      <motion.span
        className="text-emerald-600 inline-block"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 12,
            },
          },
        }}
      >
        .
      </motion.span>
    </motion.h2>
  );
};

/* --------------------------------
   Lanyard carousel — loading strategy

   All <Lanyard /> instances share ONE WebGL context (see Lanyard.jsx): the environment map, shader
   programs and geometry are built once, so adding a card is cheap. On top of that:

   1. Card faces are painted lazily, one member at a time, nearest to the centre first, and only
      after the carousel has scrolled into view (see utils/cardFaces.js).
   2. Only cards that can actually be seen get a Lanyard (centre + 1 or 2 either side).
   3. They appear in waves, each one after the previous wave has drawn its first frame (onReady).
   4. The centre card renders at 60 fps / DPR 2; side cards at 30 fps / DPR 1.5 with a cheaper
      physics step. They are dimmed and scaled down, so the difference isn't visible.
   5. A card that leaves the visible range is unmounted after its fade-out finishes.
--------------------------------- */

const STEP_MS = 4500; // autoplay interval
const POS = [0, 0.98, 1.74]; // x distance from centre, in card widths
const SCALE = [1, 0.8, 0.62];
const DIM = [1, 0.72, 0.5];
const FADE = [1, 0.95, 0.8];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const FADE_OUT_MS = 750; // matches the slide's fade, so a card never pops out
const ENTER_DELAY_MS = 120; // lets the slide animation get going before a new scene is built
const WAVE_GAP_MS = 160; // breathing room between waves
const WAVE_TIMEOUT_MS = 3000; // never wait forever on one wave

/* true after `inDelay` once `on` becomes true; false `outDelay` after it becomes false */
const useHold = (on, inDelay, outDelay) => {
  const [value, setValue] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setValue(on), on ? inDelay : outDelay);
    return () => clearTimeout(t);
  }, [on, inDelay, outDelay]);
  return value;
};

/* Builds card faces lazily, in the order given, and returns { [id]: faces } as they become ready */
const useCardFaces = (members, order, enabled) => {
  const [faces, setFaces] = useState({});
  const requested = useRef(new Set());
  const alive = useRef(true);
  const orderKey = order.join(",");

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    order.forEach((index) => {
      const member = members[index];
      if (!member || requested.current.has(member.id)) return;
      requested.current.add(member.id);
      buildCardFace(member)
        .then((f) => {
          if (alive.current) setFaces((prev) => ({ ...prev, [member.id]: f }));
        })
        .catch(() => requested.current.delete(member.id));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey, enabled, members]);

  return faces;
};

const Slide = memo(function Slide({
  member,
  face,
  off,
  range,
  mount,
  cw,
  height,
  onSelect,
  onReady,
}) {
  const prev = useRef(off);
  // a member that wraps from one end to the other fades in instead of sweeping across
  const wrapped = Math.abs(off - prev.current) > 1.5;
  useEffect(() => {
    prev.current = off;
  }, [off]);

  const live = useHold(
    mount && !!face,
    off === 0 ? 0 : ENTER_DELAY_MS,
    FADE_OUT_MS,
  );
  const handleReady = useCallback(
    () => onReady(member.id),
    [onReady, member.id],
  );

  const abs = Math.min(Math.abs(off), 2);
  const sign = Math.sign(off);
  const visible = Math.abs(off) <= range;
  const slot = cw / 0.72; // Lanyard fits the card to 72% of its container width
  const opacity = visible ? FADE[abs] : 0;

  return (
    <motion.div
      initial={false}
      animate={{
        x: sign * POS[abs] * cw,
        scale: SCALE[abs],
        rotate: -sign * abs * 3,
        filter: `brightness(${DIM[abs]})`,
        opacity: wrapped ? [0, opacity] : opacity,
      }}
      transition={
        wrapped
          ? {
              x: { duration: 0 },
              scale: { duration: 0 },
              rotate: { duration: 0 },
              filter: { duration: 0 },
              opacity: { duration: 0.7, delay: 0.2 },
            }
          : {
              default: {
                type: "spring",
                stiffness: 110,
                damping: 20,
                mass: 0.9,
              },
              filter: { duration: 0.6 },
              opacity: { duration: 0.6 },
            }
      }
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        width: slot,
        height,
        marginLeft: -slot / 2,
        transformOrigin: "50% 0%",
        zIndex: 10 - abs,
        pointerEvents: visible ? "auto" : "none",
        willChange: "transform, opacity, filter",
      }}
    >
      {live && face && (
        <Lanyard
          frontImage={face.front}
          backImage={face.back}
          strapImage={face.strap}
          imageFit="cover"
          cardColor="#f4f4f2"
          orientation="portrait"
          finish="glossy"
          cornerRadius={0.3}
          size={0.6}
          anchor="center"
          strapLength={0.45}
          strapColor="#111111"
          strapWidth={0.65}
          metal="silver"
          gravity={1}
          damping={0.5}
          elasticity={0.5}
          breeze={!visible ? 0 : off === 0 ? 0.5 : 0.3}
          interactive={off === 0}
          intro
          pixelRatio={off === 0 ? 2 : 1.5}
          fps={off === 0 ? 60 : 30}
          onReady={handleReady}
        />
      )}
      {off !== 0 && visible && (
        <button
          type="button"
          onClick={() => onSelect(off)}
          aria-label={`Show ${member.name}, ${member.title}`}
          className="absolute inset-x-[14%] inset-y-[22%] z-10 cursor-pointer rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        />
      )}
    </motion.div>
  );
});

const NavButton = ({ dir, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={dir === "prev" ? "Previous team member" : "Next team member"}
    className="group grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/40 text-white outline-none backdrop-blur transition-colors duration-300 hover:border-emerald-500 hover:bg-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-400"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`transition-transform duration-300 ${
        dir === "prev"
          ? "rotate-180 group-hover:-translate-x-0.5"
          : "group-hover:translate-x-0.5"
      }`}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  </button>
);

const Carousel = ({ members, reduced }) => {
  const N = members.length;
  const stageRef = useRef(null);
  const inView = useInView(stageRef, { amount: 0.3 });
  const seen = useInView(stageRef, { amount: 0.15, once: true });

  const [w, setW] = useState(1200);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const [holding, setHolding] = useState(false);
  const [manualPause, setManualPause] = useState(false);

  // loading waves: the widest offset from the centre that is allowed to build a Lanyard yet
  const [wave, setWave] = useState(0);
  const [ready, setReady] = useState({});
  const onReady = useCallback(
    (id) => setReady((r) => (r[id] ? r : { ...r, [id]: true })),
    [],
  );

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const release = () => setHolding(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, []);

  const go = useCallback((d) => setActive((a) => (((a + d) % N) + N) % N), [N]);

  const mobile = w < 760;
  const range = mobile ? 1 : 2;
  const cw = mobile ? clamp(w * 0.52, 150, 260) : clamp(w / 4.3, 190, 320);
  const height = Math.round(cw * 2.2);
  const half = Math.floor(N / 2);
  const mod = useCallback((i) => ((i % N) + N) % N, [N]);

  // faces are painted nearest-first: centre, then right, left, and one step beyond what is visible
  const order = useMemo(() => {
    const out = [];
    for (let d = 0; d <= Math.min(range + 1, half); d++) {
      out.push(mod(active + d));
      if (d) out.push(mod(active - d));
    }
    return [...new Set(out)];
  }, [active, range, half, mod]);
  const faces = useCardFaces(members, order, seen);

  // next wave starts shortly after the current one has drawn its first frame
  useEffect(() => {
    const target = Math.min(range, half);
    if (!seen || wave >= target) return undefined;
    const ids = [];
    for (let off = -wave; off <= wave; off++)
      ids.push(members[mod(active + off)].id);
    const settled = ids.every((id) => ready[id]);
    const t = setTimeout(
      () => setWave((s) => Math.min(target, s + 1)),
      settled ? WAVE_GAP_MS : WAVE_TIMEOUT_MS,
    );
    return () => clearTimeout(t);
  }, [seen, wave, range, half, active, ready, members, mod]);

  const maxOff = Math.min(wave, range);

  const playing = !reduced && !manualPause && N > 1;
  const paused = hover || holding || !inView;

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  };

  return (
    <div className="mt-14">
      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Team members"
        onKeyDown={onKeyDown}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={() => setHover(false)}
        onPointerDown={() => setHolding(true)}
        className="relative w-full select-none overflow-hidden outline-none"
        style={{
          height,
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0, #000 14%)",
          maskImage: "linear-gradient(to bottom, transparent 0, #000 14%)",
        }}
      >
        {/* backdrop: faint arc, floor glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[8%] aspect-square w-[88%] -translate-x-1/2 rounded-full border border-white/[0.07]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-[50%] bg-emerald-600/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[15%] bottom-6 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"
        />

        {seen &&
          members.map((m, i) => {
            const off = ((i - active + N + half) % N) - half;
            return (
              <Slide
                key={m.id}
                member={m}
                face={faces[m.id]}
                off={off}
                range={range}
                mount={Math.abs(off) <= maxOff}
                cw={cw}
                height={height}
                onSelect={go}
                onReady={onReady}
              />
            );
          })}
      </div>

      <p className="sr-only" aria-live="polite">
        {members[active].name}, {members[active].title}. {active + 1} of {N}.
      </p>

      {N > 1 && (
        <div className="mt-6 flex items-center justify-center gap-5">
          <NavButton dir="prev" onClick={() => go(-1)} />

          <div className="flex items-center gap-2">
            {members.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show ${m.name}, ${i + 1} of ${N}`}
                aria-current={i === active}
                className={`relative h-2.5 overflow-hidden rounded-full bg-white/15 outline-none transition-[width,background-color] duration-500 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  i === active ? "w-12" : "w-2.5 hover:bg-white/30"
                }`}
              >
                {i === active && (
                  <span
                    key={active}
                    className="absolute inset-0 origin-left rounded-full bg-emerald-500"
                    style={
                      playing
                        ? {
                            animation: `team-progress ${STEP_MS}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                          }
                        : undefined
                    }
                    onAnimationEnd={() => go(1)}
                  />
                )}
              </button>
            ))}
          </div>

          <NavButton dir="next" onClick={() => go(1)} />

          {!reduced && (
            <button
              type="button"
              onClick={() => setManualPause((p) => !p)}
              aria-pressed={manualPause}
              aria-label={manualPause ? "Resume autoplay" : "Pause autoplay"}
              className="grid h-9 w-9 place-items-center rounded-full text-gray-400 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                {manualPause ? (
                  <path d="M7 4l13 8-13 8z" />
                ) : (
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                )}
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* --------------------------------
   Team section

   Background effects are kept off the main thread / paint path:
   - the cursor glow is a fixed-size gradient that is MOVED with a transform (the old version
     re-painted a full-section background on every mouse move, right on top of the WebGL cards),
   - the two blobs are radial gradients (no 160px blur filters) animated with transform + opacity,
   - the marquee is a CSS animation,
   and all of them stop while the section is off-screen.
--------------------------------- */

const BLOB_A =
  "radial-gradient(circle closest-side, rgba(5,150,105,0.73) 0%, rgba(5,150,105,0.5) 40%, rgba(5,150,105,0.15) 70%, rgba(5,150,105,0) 100%)";
const BLOB_B =
  "radial-gradient(circle closest-side, rgba(5,150,105,0.63) 0%, rgba(5,150,105,0.42) 40%, rgba(5,150,105,0.12) 70%, rgba(5,150,105,0) 100%)";

const Team = () => {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();

  // true while any part of the section is on screen
  const sectionInView = useInView(sectionRef, { amount: 0 });
  const animate = sectionInView && !reduced;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });

  // Background word animation
  const ghostX = useTransform(
    progress,
    [0, 1],
    reduced ? ["0%", "0%"] : ["12%", "-12%"],
  );

  // Section cursor glow (moved with a transform, never repainted)
  const px = useMotionValue(-1200);
  const py = useMotionValue(-1200);
  const glowX = useTransform(px, (v) => v - 520);
  const glowY = useTransform(py, (v) => v - 520);

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();

    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
  };

  const handleLeave = () => {
    px.set(-1200);
    py.set(-1200);
  };

  return (
    <section
      id="team"
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="main-container relative overflow-hidden bg-black px-4 py-20 md:py-28"
    >
      <style>{`@keyframes team-marquee-x{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}`}</style>

      {/* Background layers */}
      <div
        aria-hidden
        className="team-dots pointer-events-none absolute inset-0"
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0"
        style={{
          x: glowX,
          y: glowY,
          width: 1040,
          height: 1040,
          background:
            "radial-gradient(circle closest-side, rgba(0,153,102,0.12), transparent 65%)",
          willChange: "transform",
        }}
      />

      <motion.div
        aria-hidden
        animate={
          animate
            ? { scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }
            : { scale: 1, opacity: 0.2 }
        }
        transition={
          animate
            ? { duration: 8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
        className="pointer-events-none absolute rounded-full"
        style={{
          left: -350,
          top: -350,
          width: 900,
          height: 900,
          background: BLOB_A,
          willChange: "transform, opacity",
        }}
      />

      <motion.div
        aria-hidden
        animate={
          animate
            ? { scale: [1.1, 1, 1.1], opacity: [0.12, 0.25, 0.12] }
            : { scale: 1.1, opacity: 0.12 }
        }
        transition={
          animate
            ? { duration: 10, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
        className="pointer-events-none absolute rounded-full"
        style={{
          right: -360,
          bottom: -408,
          width: 880,
          height: 880,
          background: BLOB_B,
          willChange: "transform, opacity",
        }}
      />

      {/* Background TEAM text */}
      <motion.div
        aria-hidden
        style={{ x: ghostX, willChange: "transform" }}
        className="team-ghost pointer-events-none absolute left-0 top-[42%] -translate-y-1/2 whitespace-nowrap text-[26vw] font-bold leading-none tracking-tighter"
      >
        TEAM
      </motion.div>

      {/* Scroll progress rail */}
      <div className="hidden md:block absolute left-4 top-24 bottom-24 w-px bg-white/10">
        <motion.div
          style={{ scaleY: progress, originY: 0 }}
          className="h-full w-full bg-emerald-600"
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="lable relative mb-4 flex items-center gap-2 italic text-emerald-600"
        >
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: 32 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: EASE,
              delay: 0.2,
            }}
            className="block h-px bg-[#048a47]"
          />
          Our team
        </motion.div>

        {/* Header */}
        <div className="header relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <AnimatedHeading text="A Team of Different Talents" />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: EASE,
              delay: 0.5,
            }}
            className="text-[15px] leading-relaxed text-gray-300 md:w-[30%]"
          >
            A team of designers and developers who care about every pixel, and
            every millisecond.
          </motion.p>
        </div>

        {/* Lanyard carousel */}
        <Carousel members={teamMembers} reduced={reduced} />

        {/* Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 1,
            delay: 0.3,
          }}
          className="team-marquee mt-24 overflow-hidden border-y border-white/10 py-5"
        >
          <div
            className="flex w-max"
            style={{
              animation: reduced
                ? "none"
                : "team-marquee-x 28s linear infinite",
              animationPlayState: animate ? "running" : "paused",
              willChange: "transform",
            }}
          >
            {[0, 1].map((dup) => (
              <div
                key={dup}
                className="flex shrink-0 items-center"
                aria-hidden={dup === 1}
              >
                {marqueeItems.map((item) => (
                  <span
                    key={item}
                    className="flex items-center font-mono text-xs uppercase tracking-[0.3em] text-gray-500"
                  >
                    <span className="px-8">{item}</span>
                    <span className="text-emerald-600">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="mt-14 flex flex-col items-center gap-5 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: EASE,
            }}
            className="text-gray-400"
          >
            Have an idea that deserves a great team?
          </motion.p>

          <motion.a
            href="#contact"
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.96 }}
            className="relative inline-flex items-center gap-3 rounded-full border border-white/70 bg-white px-8 py-4 font-medium text-black shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-800/20 hover:bg-emerald-50 hover:text-emerald-950 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <motion.span
              className="relative"
            >
              Let's work together
            </motion.span>

            <motion.svg
              variants={{
                rest: { x: 0, color: "#000000" },
                hover: { x: 4, color: "#065f46" },
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
              className="relative"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </motion.svg>
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default Team;
