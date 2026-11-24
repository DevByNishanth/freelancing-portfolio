import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useLenis } from "lenis/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Quote } from "lucide-react";

import Footer from "@/components/Footer";
import ProjectForm from "@/components/ProjectForm";
import { projects } from "@/data/projects";
import ChallengeSolution from "@/components/ChallengeSolution";

// --------------------------------------------------
// CONFIG
// --------------------------------------------------

const EASE = [0.22, 1, 0.36, 1];

const headingVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const wordVariants = {
  hidden: { opacity: 0, y: 60, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE },
  },
};

// --------------------------------------------------
// CASE STUDY CONTENT (placeholders used when a project has no `caseStudy`)
// --------------------------------------------------

const getCaseStudy = (project) => {
  const cs = project.caseStudy || {};

  return {
    client: cs.client ?? project.brand,
    year: cs.year ?? "2025",
    role: cs.role ?? "Design & Development",
    duration: cs.duration ?? "6 weeks",
    overview:
      cs.overview ??
      `${project.brand} needed a reliable digital product that matched how their business actually runs. ${project.title} This is a short overview of the brief, the people it was built for and why it mattered.`,
    challenge:
      cs.challenge ??
      "Describe the problem the client was facing before we started: the manual processes, the missed opportunities and the constraints we had to design around.",
    solution:
      cs.solution ??
      "Describe the approach we took: the key decisions, how we simplified the experience and how the final product solves the problem end to end.",
    features: cs.features ?? [
      { title: "Clear user flows", text: "Every journey was mapped and simplified before a single screen was designed." },
      { title: "Responsive by default", text: "Built mobile-first so it feels native on any device." },
      { title: "Performance focused", text: "Lean code and optimised assets for fast load times." },
      { title: "Easy to maintain", text: "A clean structure the client's team can manage without developers." },
    ],
    results: cs.results ?? [
      { value: 100, suffix: "%", label: "On-time delivery" },
      { value: 95, suffix: "+", label: "Lighthouse score" },
      { value: 24, suffix: "/7", label: "Support after launch" },
    ],
    tech: cs.tech ?? ["React", "Tailwind CSS", "Node.js"],
    gallery: cs.gallery ?? [],
    testimonial: cs.testimonial ?? null,
  };
};

// --------------------------------------------------
// SMALL BUILDING BLOCKS
// --------------------------------------------------

const Reveal = ({ children, delay = 0, y = 40, className = "" }) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Eyebrow = ({ children }) => (
  <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-emerald-400">
    <span className="h-px w-8 bg-emerald-400/60" />
    {children}
  </p>
);

const CountUp = ({ value, suffix = "", prefix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.8, ease: EASE });
    return () => controls.stop();
  }, [inView, count, value]);

  return (
    <span ref={ref} className="inline-flex">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

// --------------------------------------------------
// NOT FOUND
// --------------------------------------------------

const NotFound = () => (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07100c] px-6 text-center">
    <div className="pointer-events-none absolute -top-40 right-[-100px] h-[520px] w-[520px] rounded-full bg-emerald-600 opacity-25 blur-[160px]" />
    <div className="relative z-10">
      <p className="text-sm uppercase tracking-[0.22em] text-emerald-400">404</p>
      <h1 className="mt-4 text-4xl font-bold uppercase text-white sm:text-5xl">
        Project not found
      </h1>
      <p className="mx-auto mt-4 max-w-md text-gray-400">
        We couldn&apos;t find the case study you were looking for.
      </p>
      <Link
        to="/projects"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>
    </div>
  </main>
);

// --------------------------------------------------
// PAGE
// --------------------------------------------------

const ProjectDetailPage = () => {
  const { id } = useParams();
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);

  const index = projects.findIndex((p) => p.id === id);
  const project = projects[index];
  const nextProject = projects[(index + 1) % projects.length];

  // Always open a case study from the top
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [id, lenis]);

  // Reading progress bar
  const { scrollYProgress: pageProgress } = useScroll();
  const progress = useSpring(pageProgress, { stiffness: 140, damping: 30 });

  // Hero image parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const heroImgY = useTransform(
    heroProgress,
    [0, 1],
    reducedMotion ? ["0%", "0%"] : ["-7%", "7%"],
  );

  if (!project) return <NotFound />;

  const cs = getCaseStudy(project);
  const hasLiveLink = project.href && project.href !== "#";

  const meta = [
    { label: "Client", value: cs.client },
    { label: "Year", value: cs.year },
    { label: "Role", value: cs.role },
    { label: "Duration", value: cs.duration },
  ];

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#07100c] text-white">
      {/* Reading progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-emerald-500 via-emerald-300 to-white"
      />

      {/* Background glows */}
      <motion.div
        aria-hidden
        animate={
          reducedMotion
            ? { opacity: 0.25 }
            : { scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 right-[-100px] h-[520px] w-[520px] rounded-full bg-emerald-600 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-160px] top-[900px] h-[420px] w-[420px] rounded-full opacity-20 blur-[160px]"
        style={{ backgroundColor: project.glow }}
      />

      {/* ------------------------------------------------ */}
      {/* HERO */}
      {/* ------------------------------------------------ */}
      <header className="relative z-10 mx-auto w-[90%] pt-10 sm:pt-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur-md transition hover:border-white/40 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            All projects
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="mt-8 text-sm font-semibold tracking-wide text-emerald-600"
        >
          Case study · {project.brand}
        </motion.p>

        <div className="flex items-start justify-between">



          <div>
            <motion.h1
              variants={headingVariants}
              initial="hidden"
              animate="visible"
              className="flex max-w-4xl flex-wrap gap-x-3 text-3xl font-bold uppercase leading-[1.1] tracking-tight sm:gap-x-4 sm:text-5xl lg:text-[56px]"
            >
              {project.title.split(" ").map((word, i) => (
                <motion.span key={i} variants={wordVariants} className="inline-block">
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
              className="mt-2 flex flex-wrap items-center gap-3"
            >
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full  bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md"
                >
                  {tag}
                </span>
              ))}


            </motion.div>
          </div>

          {hasLiveLink && (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative ml-1 inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/30 transition hover:bg-emerald-300 active:scale-95"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-[400%]"
              />
              <span className="relative">Visit live site</span>
              <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            </a>
          )}
        </div>

        {/* Meta */}
        <motion.dl
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } } }}
          initial="hidden"
          animate="visible"
          className="mt-4 grid grid-cols-2 gap-x-2 gap-y-6 md:grid-cols-4 "
        >
          {meta.map((item) => (
            <motion.div
              key={item.label}
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
              }}
              className="pt-3"
            >
              <dt className="text-sm text-gray-500">{item.label}</dt>
              <dd className="mt-1 text-base font-medium text-white sm:text-lg">
                {item.value}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </header>

      {/* ------------------------------------------------ */}
      {/* HERO IMAGE */}
      {/* ------------------------------------------------ */}
      <section className="relative z-10 mx-auto mt-8 w-[90%] ">
        <Reveal y={60}>
          <div ref={heroRef} className="group relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-6 left-[10%] h-20 w-[80%] opacity-40 blur-3xl"
              style={{ backgroundColor: project.glow }}
            />
            <div className="relative aspect-[1376/768] overflow-hidden  bg-white/5">
              <motion.img
                src={project.img}
                alt={project.alt}
                draggable={false}
                style={{ y: heroImgY, scale: 1.15 }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15" />
            </div>
          </div>
        </Reveal>

        <div className="tint bg-black/70 blur-[90px] absolute bottom-0 left-0 h-50 w-[100%] z-10"></div>

        <section className="absolute bottom-10 z-40 w-[90%] left-10">
          <Reveal delay={0.1}>
            <p className="text-xl leading-relaxed font-semibold text-white sm:text-5xl">
              {cs.client}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-xs mt-5 leading-relaxed text-white sm:text-xl">
              {cs.overview}
            </p>
          </Reveal>
        </section>


      </section>

      {/* ------------------------------------------------ */}
      {/* OVERVIEW */}
      {/* ------------------------------------------------ */}

      {/* ------------------------------------------------ */}
      {/* CHALLENGE / SOLUTION */}
      {/* ------------------------------------------------ */}
      {/* <section className="relative z-10 mx-auto mt-20 grid w-[90%] max-w-6xl gap-5 md:grid-cols-2 md:gap-6">
        {[
          { label: "The challenge", text: cs.challenge, n: "01" },
          { label: "The solution", text: cs.solution, n: "02" },
        ].map((block, i) => (
          <Reveal key={block.label} delay={i * 0.12}>
            <div className="group relative h-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm transition-colors duration-500 hover:border-emerald-400/40 sm:p-9">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500 opacity-0 blur-[90px] transition-opacity duration-700 group-hover:opacity-25"
              />
              <span className="text-sm font-medium text-emerald-400">{block.n}</span>
              <h2 className="mt-3 text-2xl font-semibold text-white">{block.label}</h2>
              <p className="mt-4 leading-relaxed text-gray-400">{block.text}</p>
            </div>
          </Reveal>
        ))}
      </section> */}


      <ChallengeSolution  cs={cs} />

      {/* ------------------------------------------------ */}
      {/* KEY FEATURES */}
      {/* ------------------------------------------------ */}
      <section className="relative z-10 mx-auto mt-28 w-[90%] max-w-6xl">
        <Reveal>
          <Eyebrow>What we built</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold uppercase leading-tight sm:text-4xl">
            Key features
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-x-12 sm:grid-cols-2">
          {cs.features.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 2) * 0.1} y={30}>
              <motion.div
                whileHover={reducedMotion ? undefined : { x: 6 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex gap-5 border-t border-gray-800 py-7"
              >
                <span className="pt-1 text-sm font-medium tabular-nums text-emerald-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-white">{feature.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-400">{feature.text}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* GALLERY (optional) */}
      {/* ------------------------------------------------ */}
      {cs.gallery.length > 0 && (
        <section className="relative z-10 mx-auto mt-24 grid w-[90%] max-w-6xl gap-5 md:grid-cols-2">
          {cs.gallery.map((src, i) => (
            <Reveal
              key={i}
              delay={(i % 2) * 0.1}
              className={i % 3 === 0 ? "md:col-span-2" : ""}
            >
              <div className="overflow-hidden rounded-xl bg-white/5 ring-1 ring-inset ring-white/10">
                <img
                  src={src}
                  alt={`${project.brand} screenshot ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
                />
              </div>
            </Reveal>
          ))}
        </section>
      )}

      {/* ------------------------------------------------ */}
      {/* RESULTS */}
      {/* ------------------------------------------------ */}
      <section className="relative z-10 mx-auto mt-28 w-[90%] max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/2 h-[180px] w-[320px] -translate-x-1/2 rounded-full bg-[#03fc5e] opacity-30 blur-[110px]"
        />
        <Reveal>
          <Eyebrow>Impact</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold uppercase sm:text-4xl">The results</h2>
        </Reveal>

        <div className="relative mt-10 grid gap-8 sm:grid-cols-3">
          {cs.results.map((r, i) => (
            <Reveal key={r.label} delay={i * 0.12} y={30}>
              <div className="border-t border-gray-700 pt-4">
                <p className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  <CountUp value={r.value} suffix={r.suffix} prefix={r.prefix} />
                </p>
                <p className="mt-2 text-sm text-gray-400">{r.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* TECH STACK */}
      {/* ------------------------------------------------ */}
      <section className="relative z-10 mx-auto mt-24 grid w-[90%] max-w-6xl gap-8 md:grid-cols-[1fr_2fr] md:gap-16">
        <Reveal>
          <Eyebrow>Tech stack</Eyebrow>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-wrap gap-2.5">
          {cs.tech.map((t) => (
            <motion.span
              key={t}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:border-emerald-300/60 hover:bg-emerald-400/10"
            >
              {t}
            </motion.span>
          ))}
        </Reveal>
      </section>

      {/* ------------------------------------------------ */}
      {/* TESTIMONIAL (optional) */}
      {/* ------------------------------------------------ */}
      {cs.testimonial && (
        <section className="relative z-10 mx-auto mt-28 w-[90%] max-w-4xl text-center">
          <Reveal>
            <Quote className="mx-auto h-10 w-10 text-emerald-400/70" />
            <blockquote className="mt-6 text-2xl font-medium leading-snug text-white sm:text-3xl">
              “{cs.testimonial.quote}”
            </blockquote>
            <p className="mt-6 text-sm text-gray-400">
              <span className="font-semibold text-white">{cs.testimonial.author}</span>
              {cs.testimonial.role && <> · {cs.testimonial.role}</>}
            </p>
          </Reveal>
        </section>
      )}

      {/* ------------------------------------------------ */}
      {/* NEXT PROJECT */}
      {/* ------------------------------------------------ */}
      {nextProject && nextProject.id !== project.id && (
        <section className="relative z-10 mx-auto mt-32 w-[90%] max-w-6xl">
          <Reveal>
            <p className="mb-4 text-sm uppercase tracking-[0.22em] text-gray-500">
              Next project
            </p>
            <Link
              to={`/projects/${nextProject.id}`}
              className="group relative block overflow-hidden rounded-xl bg-white/5"
            >
              <div className="relative aspect-[1376/500] overflow-hidden">
                <img
                  src={nextProject.img}
                  alt={nextProject.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10 transition-opacity duration-700 group-hover:opacity-90" />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15 transition-all duration-500 group-hover:ring-white/40" />

                <div className="absolute inset-0 flex items-center justify-between gap-4 p-6 sm:p-10">
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">
                      {nextProject.brand}
                    </p>
                    <h3 className="mt-1 max-w-md text-lg font-medium leading-snug sm:text-3xl">
                      {nextProject.title}
                    </h3>
                  </div>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition-all duration-500 group-hover:translate-x-1 group-hover:bg-emerald-300 sm:h-14 sm:w-14">
                    <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-45" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ------------------------------------------------ */}
      {/* CTA BANNER */}
      {/* ------------------------------------------------ */}
      <section className="relative z-10 mx-auto mt-24 mb-24 h-[260px] w-[90%] max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4 sm:w-[80%]">
        <div className="absolute -bottom-45 left-1/2 h-[160px] w-[260px] -translate-x-1/2 rounded-full bg-[#03fc5e] blur-[110px]" />

        <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 px-4 text-center">
          <h2 className="text-3xl font-semibold uppercase text-white sm:text-4xl">
            Want results like this?
          </h2>
          <p className="mt-3 text-gray-400">
            Tell us what you&apos;re building and we&apos;ll help shape it.
          </p>

          <div className="mx-auto mt-5 flex max-w-sm items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProjectFormOpen(true)}
              className="w-1/2 cursor-pointer rounded-md bg-black px-3 py-2 text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              Start a project
            </button>
            <Link
              to="/projects"
              className="w-1/2 rounded-md bg-white px-3 py-2 text-center text-black transition hover:bg-emerald-300"
            >
              More work
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ProjectForm
        open={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
      />
    </main>
  );
};

export default ProjectDetailPage;
