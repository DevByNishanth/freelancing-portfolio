import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import "./Project.css";

import arunaImg from "../assets/projects/arunaCanvas.png";
import avaratImg from "../assets/projects/avaratSchoolCanvas.png";
import bookMyCabsImg from "../assets/projects/bookMyCabsCanvas.png";
import exploreMunnarImg from "../assets/projects/exploreMunnarCanvas.png";
import exploreMunnarDashboardImg from "../assets/projects/exploreMunnarDashboard.png";
import shadowArrowImg from "../assets/projects/shadowArrowCanvas.png";

/* =====================================================================
   Projects — same language as Services / Team / Contact
   (italic label with a drawing line, masked word-reveal heading,
   emerald #009966 accent, cursor glow, spring easing), but on a pale
   sage canvas so the saturated project canvases are the colour.

   Layout: two columns, right column dropped (staggered masonry).
   Each card: clip-path wipe reveal, image settles from a zoom, scroll
   parallax inside the frame, 3D tilt + glare, text rises out of masks,
   and the button's dot floods the pill on hover.
   ===================================================================== */

const EASE = [0.22, 1, 0.36, 1];

const INK = "#0c1a14"; // text + button
const PAPER = "#f7ebd5"; // section background
const EMERALD_DEEP = "#007a55"; // hover fill (emerald with AA contrast for white text)

/* tone  → "light" = white text (adds a soft scrim), "dark" = ink text (for yellow / amber canvases)
   glow  → colour of the soft light cast under each card
   href  → replace "#" with the real case-study / live link */
const projects = [
  {
    id: "aruna",
    brand: "Aruna",
    title: "Website design for hotel and catering services.",
    tags: ["Website", "Branding"],
    img: arunaImg,
    alt: "Aruna catering website shown on a tablet",
    tone: "light",
    scrim: "rgba(120, 40, 0, 0.42)",
    glow: "#f4813b",
    href: "#",
  },
  {
    id: "avarat",
    brand: "Avarat Public School",
    title: "School website with admissions, events and a parent portal.",
    tags: ["Website", "Application"],
    img: avaratImg,
    alt: "Avarat Public School website shown on a tablet",
    tone: "dark",
    glow: "#e0961a",
    href: "#",
  },
  {
    id: "explore-munnar",
    brand: "Explore Munnar",
    title: "A centralized dashboard to manage stays, activities and travel operations.",
    tags: ["Admin Dashboard", "Management"],
    img: exploreMunnarImg,
    alt: "Explore Munnar admin dashboard displayed on a tablet",
    tone: "light",
    scrim: "rgba(0, 25, 10, 0.4)",
    glow: "#5f8a3a",
    href: "#",
  },
  {
    id: "shadow-arrow",
    brand: "Shadow Arrow",
    title: "Brand website for a web development company.",
    tags: ["Website", "Web"],
    img: shadowArrowImg,
    alt: "Shadow Arrow company website shown on a tablet",
    tone: "light",
    scrim: "rgba(0, 10, 50, 0.35)",
    glow: "#1d4ed8",
    href: "#",
  },
  {
    id: "book-my-cabs",
    brand: "Book My Cabs",
    title: "Outstation taxi booking with instant fare quotes.",
    tags: ["Application", "Web"],
    img: bookMyCabsImg,
    alt: "Book My Cabs taxi booking website shown on a tablet",
    tone: "dark",
    glow: "#f5c500",
    href: "#",
  },
  {
    id: "explore-munnar",
    brand: "Explore Munnar",
    title: "A centralized dashboard to manage stays, activities and travel operations.",
    tags: ["Admin Dashboard", "Management"],
    img: exploreMunnarDashboardImg,
    alt: "Explore Munnar admin dashboard displayed on a tablet",
    tone: "light",
    scrim: "rgba(0, 25, 10, 0.4)",
    glow: "#5f8a3a",
    href: "#",
  },
];

/* ---------- Heading: words slide up from a mask (same as the other sections) ---------- */
const AnimatedHeading = ({ text }) => {
  const words = text.split(" ");
  return (
    <motion.h2
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: 0.12 }}
      className="text-4xl font-semibold leading-[1.05] tracking-tight text-[#0c1a14] md:text-[56px]"
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="mr-3 inline-block overflow-hidden pb-1 align-bottom"
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
        className="inline-block text-emerald-600"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 12 },
          },
        }}
      >
        .
      </motion.span>
    </motion.h2>
  );
};

/* ---------- Text that rises out of a mask (driven by the card's reveal) ---------- */
const MaskLine = ({ children, delay = 0, className = "" }) => (
  <span className={`block overflow-hidden ${className}`}>
    <motion.span
      className="block"
      variants={{
        hidden: { y: "110%" },
        visible: { y: 0, transition: { duration: 0.85, ease: EASE, delay } },
      }}
    >
      {children}
    </motion.span>
  </span>
);

const Arrow = ({ className = "" }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* ---------- Project card ---------- */
const ProjectCard = ({ project, index, reduced }) => {
  const ref = useRef(null);
  const light = project.tone === "light";
  const stagger = (index % 2) * 0.12; // right column enters a beat later

  // scroll parallax for the picture inside its frame
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : ["-7%", "7%"],
  );

  // 3D tilt + glare that follows the cursor
  const rx = useSpring(0, { stiffness: 140, damping: 16, mass: 0.5 });
  const ry = useSpring(0, { stiffness: 140, damping: 16, mass: 0.5 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.4), transparent 55%)`;

  const onMove = (e) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 10);
    rx.set(-(py - 0.5) * 8);
    gx.set(px * 100);
    gy.set(py * 100);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
  };

  return (
    // plain wrapper holds the static column offset so it never fights motion's transforms
    <div
      ref={ref}
      className={index % 2 === 1 ? "md:translate-y-24 lg:translate-y-32" : ""}
    >
      <motion.div
        initial={reduced ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, visible: {} }}
      >
        <motion.a
          href={project.href}
          aria-label={`View project: ${project.brand}`}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
          className="group relative block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-[#007a55] focus-visible:ring-offset-4 focus-visible:ring-offset-[#e6ede8]"
        >
          {/* light cast under the card */}
          <span
            aria-hidden
            style={{ backgroundColor: project.glow }}
            className="pointer-events-none absolute -bottom-5 left-[10%] h-12 w-[80%]  opacity-30 blur-2xl transition-opacity duration-700 group-hover:opacity-70 group-focus-visible:opacity-70"
          />

          {/* picture frame — wipes open from the bottom */}
          <motion.div
            variants={{
              hidden: { clipPath: "inset(100% 0% 0% 0% )" },
              visible: {
                clipPath: "inset(0% 0% 0% 0% )",
                transition: { duration: 1.1, ease: EASE, delay: stagger },
              },
            }}
            className="relative aspect-[1376/768] overflow-hidden bg-black/10"
          >
            {/* image settles from a zoom */}
            <motion.div
              className="absolute inset-0"
              variants={{
                hidden: { scale: 1.35 },
                visible: {
                  scale: 1,
                  transition: { duration: 1.5, ease: EASE, delay: stagger },
                },
              }}
            >
              {/* scroll parallax (overscanned so edges never show) */}
              <motion.div
                className="absolute inset-0"
                style={{ y: imgY, scale: 1.16 }}
              >
                <img
                  src={project.img}
                  alt={project.alt}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                />
              </motion.div>
            </motion.div>

            {/* soft scrim so white text stays readable */}
            {light && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${project.scrim} 0%, transparent 62%)`,
                }}
              />
            )}

            {/* glare */}
            <motion.div
              aria-hidden
              style={{ background: glare }}
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100"
            />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20"
            />
          </motion.div>

          {/* text layer */}
          <div
            className={`pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-5 sm:p-6 lg:p-8 ${light ? "text-white" : "text-[#1c1402]"
              }`}
          >
            <div className="max-w-[62%]">
              <MaskLine delay={0.55 + stagger}>
                <span className="text-[13px] font-medium opacity-80">
                  {project.brand}
                </span>
              </MaskLine>

              <MaskLine delay={0.65 + stagger} className="mt-1">
                <h3 className="text-base font-medium leading-snug tracking-tight sm:text-xl lg:text-[26px] lg:leading-[1.15]">
                  {project.title}
                </h3>
              </MaskLine>

              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    variants={{
                      hidden: { opacity: 0, y: 10, scale: 0.9 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.6,
                          ease: EASE,
                          delay: 0.85 + stagger + i * 0.08,
                        },
                      },
                    }}
                    style={{ transitionDelay: `${i * 60}ms` }}
                    className="rounded-md bg-[#0c1a14]/90 px-2.5 py-1 text-[11px] font-medium text-white transition-colors duration-300 group-hover:bg-[#000000] group-focus-visible:bg-[#007a55]"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* View project: the dark dot floods the pill on hover */}
            <motion.span
              variants={{
                hidden: { opacity: 0, x: -24 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.8, ease: EASE, delay: 1 + stagger },
                },
              }}
              className="relative inline-flex h-11 w-fit items-center overflow-hidden rounded-full bg-white/90 pl-5 pr-14 text-sm font-medium text-[#0c1a14] backdrop-blur-sm transition-colors duration-500 group-hover:text-white group-focus-visible:text-white"
            >
              <span
                aria-hidden
                className="absolute right-1.5 top-1.5 h-8 w-8 rounded-full bg-[#0c1a14] transition-[transform,background-color] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[14] group-hover:bg-[#000000] group-focus-visible:scale-[14] group-focus-visible:bg-[#007a55]"
              />
              <span className="relative z-10">View project</span>
              <Arrow className="absolute right-[14px] top-[14px] z-10 text-white transition-transform duration-500 group-hover:-rotate-45 group-focus-visible:-rotate-45" />
            </motion.span>
          </div>
        </motion.a>
      </motion.div>
    </div>
  );
};

/* ---------- View all projects: magnetic pill with an emerald wipe ---------- */
const ViewAllButton = ({ reduced }) => {
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.3 });
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.3 });

  const onMove = (e) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
    >
      {/* padded hit area so the pull starts before the cursor reaches the pill */}
      <div onMouseMove={onMove} onMouseLeave={onLeave} className="-m-8 p-8">
        <motion.a
          href="/projects"
          style={{ x, y }}
          whileTap={{ scale: 0.96 }}
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#0c1a14] px-8 py-4 font-medium text-[#e6ede8] outline-none focus-visible:ring-2 focus-visible:ring-[#007a55] focus-visible:ring-offset-4 focus-visible:ring-offset-[#e6ede8]"
        >
          <span
            aria-hidden
            className="absolute inset-0 translate-y-full bg-[#007a55] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
          />
          <span className="relative">View all projects</span>
          <Arrow className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5" />
        </motion.a>
      </div>
    </motion.div>
  );
};

/* ---------- Section ---------- */
const Project = () => {
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
  const ghostX = useTransform(
    progress,
    [0, 1],
    reduced ? ["0%", "0%"] : ["10%", "-20%"],
  );

  // section cursor glow
  const px = useMotionValue(-600);
  const py = useMotionValue(-600);
  const cursorGlow = useMotionTemplate`radial-gradient(520px circle at ${px}px ${py}px, rgba(0, 153, 102, 0.13), transparent 65%)`;

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
  };
  const handleLeave = () => {
    px.set(-600);
    py.set(-600);
  };

  // when the card count is even the dropped right column ends lower than the left one
  const even = projects.length % 2 === 0;

  return (
    <section
      id="projects"
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ backgroundColor: PAPER }}
      className="main-container relative overflow-hidden rounded-t-[32px] px-4 py-20 text-[#0c1a14] md:px-12 md:py-28"
    >
      {/* background layers */}
      <div
        aria-hidden
        className="project-dots pointer-events-none absolute inset-0"
      />
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: cursorGlow }}
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.15, 1], opacity: [0.14, 0.28, 0.14] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-emerald-500 blur-[160px]"
      />
      <motion.div
        aria-hidden
        style={{ x: ghostX }}
        className="project-ghost pointer-events-none absolute left-0 top-6 whitespace-nowrap text-[28vw] font-semibold leading-none tracking-tighter md:text-[20vw]"
      >
        Projects
      </motion.div>

      <div className="relative mx-auto max-w-[1280px]">
        {/* label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-4 flex items-center gap-2 italic text-emerald-700"
        >
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: 32 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="block h-px bg-emerald-700"
          />
          Projects
        </motion.div>

        {/* header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <AnimatedHeading text="Work that earns its place" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
            className="text-[15px] leading-relaxed text-stone-700 md:w-[34%]"
          >
            Schools, cab operators, caterers and software studios. Each one
            started as a business problem and shipped as a fast, working
            website.
          </motion.p>
        </div>

        {/* staggered grid */}
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 md:mt-20 md:grid-cols-2 md:gap-y-14 lg:gap-x-12">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              reduced={reduced}
            />
          ))}
        </div>

        {/* view all */}
        <div
          className={`flex items-center gap-6 ${even ? "mt-16 md:mt-44 lg:mt-52" : "mt-16 md:mt-28"
            }`}
        >
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
            style={{ originX: 1 }}
            className="h-px flex-1 bg-[#0c1a14]/15"
          />
          <ViewAllButton reduced={reduced} />
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
            style={{ originX: 0 }}
            className="h-px flex-1 bg-[#0c1a14]/15"
          />
        </div>
      </div>
    </section>
  );
};

export default Project;
