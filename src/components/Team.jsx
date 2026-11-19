
import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";

import ProfileCard from "./ProfileCard";
import "./Team.css";

import myImg from "../assets/my.png";
import patternIcon from "../assets/team-pattern.svg";

const EASE = [0.22, 1, 0.36, 1];

// Team members
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
    name: "Nishanth",
    title: "Full Stack Developer",
    handle: "nishanth",
    status: "Available",
    statusColor: "#22c55e",
    avatarUrl: myImg,
    email: "nishanth@example.com",
  },
];

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
   Team member card
--------------------------------- */

const TeamCard = ({ member, index, progress, reduced }) => {
  const mx = useMotionValue(-600);
  const my = useMotionValue(-600);

  const glow = useMotionTemplate`
    radial-gradient(
      340px circle at ${mx}px ${my}px,
      rgba(0, 153, 102, .45),
      transparent 65%
    )
  `;

  const drift = index % 2 === 0 ? 40 : -40;

  const y = useTransform(
    progress,
    [0, 1],
    reduced ? [0, 0] : [drift, -drift]
  );

  const col = index % 4;
  const PAD = 48;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();

    mx.set(e.clientX - r.left + PAD);
    my.set(e.clientY - r.top + PAD);
  };

  const onLeave = () => {
    mx.set(-600);
    my.set(-600);
  };

  return (
    <motion.div style={{ y }} className="w-full flex justify-center">
      <motion.div
        initial={{
          opacity: 0,
          y: 90,
          rotateX: -28,
          scale: 0.92,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
        }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          duration: 1,
          ease: EASE,
          delay: 0.12 * col,
        }}
        style={{ transformPerspective: 1000 }}
        className="w-full "
      >
        {/* Index label */}
        <div className="mb-3 flex items-center gap-3 ">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              ease: EASE,
              delay: 0.4 + 0.12 * col,
            }}
            className="font-mono text-xs tabular-nums text-[#4b4b4b]"
          >
            {String(index + 1).padStart(2, "0")}
          </motion.span>

          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.9,
              ease: EASE,
              delay: 0.5 + 0.12 * col,
            }}
            style={{ originX: 0 }}
            className="h-px flex-1 bg-white/10"
          />
        </div>

        {/* Idle floating animation */}
        <motion.div
          animate={reduced ? undefined : { y: [0, -8, 0] }}
          transition={{
            duration: 5 + index * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
          }}
        >
          {/* Hover animation */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="group relative"
          >
            {/* Cursor-following glow */}
            {/* <motion.div
              aria-hidden
              style={{
                background: glow,
                inset: -PAD,
              }}
              className="pointer-events-none absolute opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            /> */}

            {/* Resting glow */}
            <motion.div
              aria-hidden
              animate={{
                opacity: [0.25, 0.5, 0.25],
                scaleX: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.6,
              }}
              className="pointer-events-none absolute -bottom-5 left-[12%] h-10 w-[76%] rounded-full bg-emerald-600 blur-2xl "
            />

            <div className="relative ">
              <ProfileCard
                name={member.name}
                title={member.title}
                handle={member.handle}
                status={member.status}
                statusColor={member.statusColor}
                contactText="Contact"
                avatarUrl={member.avatarUrl}
                iconUrl={patternIcon}
                backdropColor="#0c2a20"
                aspectRatio="1 / .8"
                holo={0.70}
                glare={0.5}
                tiltStrength={12}
                parallax={8}
                radius={16}
                enableTilt
                intro={false}
                showUserInfo
                enableMobileTilt={false}
                theme="dark"
                onContactClick={() => {
                  window.location.href = `mailto:${member.email}`;
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/* --------------------------------
   Team section
--------------------------------- */

const Team = () => {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();

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

        {/* Team cards */}
        {/* IMPORTANT: Do not add the custom team-grid class here */}
        <div className="relative mt-16 grid grid-cols-3 px-20 mx-20 gap-12 ">
          {teamMembers.map((member, i) => (
            <TeamCard
              key={`${member.id}-${i}`}
              member={member}
              index={i}
              progress={progress}
              reduced={reduced}
            />


          ))}
        </div>

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
