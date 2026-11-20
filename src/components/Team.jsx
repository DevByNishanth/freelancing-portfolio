import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";

// shadcn put the file at ./Lanyard — if yours landed in ./ui, change this path
import Lanyard from "./Lanyard";
import { buildCardFaces } from "../utils/cardFaces";
import "./Team.css";

import myImg from "../assets/my.png";
import sathiya from "../assets/sathiyaPic.png";
import deepak from "../assets/deepak.png";
import abi from "../assets/abi.png";
import faya from "../assets/faya.png";
import dharshan from "../assets/dharshan.png";
import venkat from "../assets/venkat.png";

const EASE = [0.22, 1, 0.36, 1];

// Team members — one lanyard each. `id` must be unique.
// Swap avatarUrl for a real photo of each person (square or portrait, 800px+ looks best).
const teamMembers = [
  {
    id: 1,
    name: "Nishanth",
    title: "Full Stack Developer",
    handle: "nishanth",
    status: "Available",
    statusColor: "#22c55e",
    avatarUrl: myImg,
    email: "nishanth@example.com",
  },
  {
    id: 1,
    name: "Sathiya",
    title: "Software Developer",
    handle: "sathiya",
    status: "Available",
    statusColor: "#22c55e",
    avatarUrl: sathiya,
    email: "nishanth@example.com",
  },
  {
    id: 1,
    name: "Deepak",
    title: "WordPress & Shopify developer",
    handle: "deepak",
    status: "Available",
    statusColor: "#22c55e",
    avatarUrl: deepak,
    email: "nishanth@example.com",
  },
  {
    id: 1,
    name: "Abishek",
    title: "Software Developer",
    handle: "abi",
    status: "Available",
    statusColor: "#22c55e",
    avatarUrl: abi,
    email: "nishanth@example.com",
  },
  {
    id: 1,
    name: "Fayaz",
    title: "Full stack Developer",
    handle: "fayaz",
    status: "Available",
    statusColor: "#22c55e",
    avatarUrl: faya,
    email: "nishanth@example.com",
  },
  {
    id: 1,
    name: "Dharshan",
    title: "Software Developer",
    handle: "dharshan",
    status: "Available",
    statusColor: "#22c55e",
    avatarUrl: dharshan,
    email: "nishanth@example.com",
  },
  {
    id: 1,
    name: "Venkatesh",
    title: "UI/UX Designer",
    handle: "venkat",
    status: "Available",
    statusColor: "#22c55e",
    avatarUrl: venkat,
    email: "nishanth@example.com",
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
   Lanyard carousel
   One <Lanyard /> per member. Each card keeps its own physics and is moved
   with transforms (origin = the strap's top, so side cards swing like a
   pendulum). Centre card is interactive; click a side card to bring it in.
--------------------------------- */

const STEP_MS = 4500; // autoplay interval
const POS = [0, 0.98, 1.74]; // x distance from centre, in card widths
const SCALE = [1, 0.8, 0.62];
const DIM = [1, 0.72, 0.5];
const FADE = [1, 0.95, 0.8];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const Slide = ({ member, face, off, range, cw, height, onSelect }) => {
  const prev = useRef(off);
  // a member that wraps from one end to the other fades in instead of sweeping across
  const wrapped = Math.abs(off - prev.current) > 1.5;
  useEffect(() => {
    prev.current = off;
  }, [off]);

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
            default: { type: "spring", stiffness: 110, damping: 20, mass: 0.9 },
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
      }}
    >
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
      />
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
};

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
      className={`transition-transform duration-300 ${dir === "prev" ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
        }`}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  </button>
);

const Carousel = ({ members, faces, reduced }) => {
  const N = members.length;
  const stageRef = useRef(null);
  const inView = useInView(stageRef, { amount: 0.3 });
  const seen = useInView(stageRef, { amount: 0.15, once: true });

  const [w, setW] = useState(1200);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const [holding, setHolding] = useState(false);
  const [manualPause, setManualPause] = useState(false);

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

  const ready = members.every((m) => faces[m.id]);
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
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 14%)",
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
          ready &&
          members.map((m, i) => (
            <Slide
              key={m.id}
              member={m}
              face={faces[m.id]}
              off={((i - active + N + half) % N) - half}
              range={range}
              cw={cw}
              height={height}
              onSelect={go}
            />
          ))}
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
                className={`relative h-2.5 overflow-hidden rounded-full bg-white/15 outline-none transition-[width,background-color] duration-500 focus-visible:ring-2 focus-visible:ring-emerald-400 ${i === active ? "w-12" : "w-2.5 hover:bg-white/30"
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                {manualPause ? <path d="M7 4l13 8-13 8z" /> : <path d="M6 4h4v16H6zM14 4h4v16h-4z" />}
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
--------------------------------- */

const Team = () => {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();
  const [faces, setFaces] = useState({});

  // paint the card faces once (photo + name + role) for the lanyards
  useEffect(() => {
    let dead = false;
    buildCardFaces(teamMembers).then((f) => !dead && setFaces(f));
    return () => {
      dead = true;
    };
  }, []);

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
    reduced ? ["0%", "0%"] : ["12%", "-12%"]
  );

  // Section cursor glow
  const px = useMotionValue(-600);
  const py = useMotionValue(-600);

  const cursorGlow = useMotionTemplate`
    radial-gradient(
      520px circle at ${px}px ${py}px,
      rgba(0, 153, 102, 0.12),
      transparent 65%
    )
  `;

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();

    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
  };

  const handleLeave = () => {
    px.set(-600);
    py.set(-600);
  };

  return (
    <section
      id="team"
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="main-container relative overflow-hidden bg-black px-4 py-20 md:py-28"
    >
      {/* Background layers */}
      <div
        aria-hidden
        className="team-dots pointer-events-none absolute inset-0"
      />

      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: cursorGlow }}
      />

      <motion.div
        aria-hidden
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-600 blur-[160px]"
      />

      <motion.div
        aria-hidden
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.12, 0.25, 0.12],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -bottom-52 -right-40 h-[480px] w-[480px] rounded-full bg-emerald-600 blur-[170px]"
      />

      {/* Background TEAM text */}
      <motion.div
        aria-hidden
        style={{ x: ghostX }}
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
            A team of designers and developers who care about every
            pixel, and every millisecond.
          </motion.p>
        </div>

        {/* Lanyard carousel */}
        <Carousel members={teamMembers} faces={faces} reduced={reduced} />

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
          <motion.div
            animate={reduced ? undefined : { x: ["0%", "-50%"] }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex w-max"
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
          </motion.div>
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
            className="relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 font-medium text-black"
          >
            <motion.span
              variants={{
                rest: { y: "101%" },
                hover: { y: 0 },
              }}
              transition={{
                duration: 0.5,
                ease: EASE,
              }}
              className="absolute inset-0 bg-emerald-600"
            />

            <motion.span
              variants={{
                rest: { color: "#000000" },
                hover: { color: "#ffffff" },
              }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              Let's work together
            </motion.span>

            <motion.svg
              variants={{
                rest: { x: 0, color: "#000000" },
                hover: { x: 6, color: "#ffffff" },
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
