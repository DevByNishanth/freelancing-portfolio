import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Link } from "react-router-dom";
import { useLenis } from "lenis/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import arunaImg from "../assets/projects/arunaCanvas.png";
import avaratImg from "../assets/projects/avaratSchoolCanvas.png";
import bookMyCabsImg from "../assets/projects/bookMyCabsCanvas.png";
import exploreMunnarImg from "../assets/projects/exploreMunnarCanvas.png";
import exploreMunnarDashboardImg from "../assets/projects/exploreMunnarDashboard.png";
import shadowArrowImg from "../assets/projects/shadowArrowCanvas.png";
import crossCurrencyCanvas from "../assets/projects/crossCurrencyCanvas.png";
import eventsCanvas from "../assets/projects/eventsCanvas.png";
import lmsCanvas from "../assets/projects/lmsCanvas.png";
import hrmsCanvas from "../assets/projects/hrmsCanvas.png";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ProjectForm from "@/components/ProjectForm";

// --------------------------------------------------
// DATA
// --------------------------------------------------

const tabs = [
  "All projects",
  "Website",
  "Branding",
  "Management",
  "Admin dashboard",
  "UI/UX",
];

const projects = [
  {
    id: "aruna",
    brand: "Aruna",
    title: "Website design for hotel and catering services.",
    tags: ["Website", "Branding"],
    img: arunaImg,
    alt: "Aruna catering website shown on a tablet",
    glow: "#f4813b",
    href: "https://arunacaterer.com/",
  },
  {
    id: "avarat",
    brand: "Avarat Public School",
    title: "School website with admissions, events and a parent portal.",
    tags: ["Website", "Application"],
    img: avaratImg,
    alt: "Avarat Public School website shown on a tablet",
    glow: "#e0961a",
    href: "https://avatarpublicschool.com/",
  },
  {
    id: "explore-munnar",
    brand: "Explore Munnar",
    title:
      "A centralized dashboard to manage stays, activities and travel operations.",
    tags: ["Website", "Web"],
    img: exploreMunnarImg,
    alt: "Explore Munnar admin dashboard displayed on a tablet",
    glow: "#5f8a3a",
    href: "https://www.exploringmunnar.com",
  },
  {
    id: "shadow-arrow",
    brand: "Shadow Arrow",
    title: "Brand website for a web development company.",
    tags: ["Website", "Web"],
    img: shadowArrowImg,
    alt: "Shadow Arrow company website shown on a tablet",
    glow: "#1d4ed8",
    href: "https://shadowarrow.com/",
  },
  {
    id: "book-my-cabs",
    brand: "Book My Cabs",
    title: "Outstation taxi booking with instant fare quotes.",
    tags: ["Application", "Web"],
    img: bookMyCabsImg,
    alt: "Book My Cabs taxi booking website shown on a tablet",
    glow: "#f5c500",
    href: "https://bookmycabs.in",
  },
  {
    id: "learning-management",
    brand: "Learning Management System",
    title:
      "A platform to simplify learning and assignments for college students.",
    tags: ["Management", "Admin Dashboard"],
    img: lmsCanvas,
    alt: "Explore Munnar management dashboard",
    glow: "#5f8a3a",
    href: "https://sece-lms.vercel.app/",
  },
  {
    id: "explore-munnar-dashboard",
    brand: "Explore Munnar",
    title:
      "A centralized dashboard to manage stays, activities and travel operations.",
    tags: ["Admin Dashboard", "Management"],
    img: exploreMunnarDashboardImg,
    alt: "Explore Munnar management dashboard",
    glow: "#5f8a3a",
    href: "https://exploremunnardashboard.netlify.app/",
  },
  {
    id: "event-management",
    brand: "Event Management System",
    title:
      "A platform to simplify event planning and management.",
    tags: ["Management", "Admin Dashboard"],
    img: eventsCanvas,
    alt: "Explore Munnar management dashboard",
    glow: "#5f8a3a",
    href: "https://srieshwarevents.com",
  },
  {
    id: "cross-currency",
    brand: "Cross currency",
    title:
      "A currency conversion and financial data platform.",
    tags: ["Trading", "Admin Dashboard"],
    img: crossCurrencyCanvas,
    alt: "Explore Munnar management dashboard",
    glow: "#5f8a3a",
    href: "https://crosscurrencyfx.com",
  },
  {
    id: "human-resource",
    brand: "HR Management System",
    title:
      "A platform to streamline employee management and HR operations.",
    tags: ["Management", "Admin Dashboard"],
    img: hrmsCanvas,
    alt: "Explore Munnar management dashboard",
    glow: "#5f8a3a",
    href: "https://srieshwarems.com",
  },

];

// --------------------------------------------------
// ANIMATION CONFIGURATION
// --------------------------------------------------

const EASE = [0.22, 1, 0.36, 1];

const headingVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 70,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1,
      ease: EASE,
    },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13,
    },
  },
};

const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: EASE,
    },
  },
};

// --------------------------------------------------
// ANIMATED PROJECT CARD
// --------------------------------------------------

const ProjectCard = ({ project, index }) => {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();

  // Scroll progress for image parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? ["0%", "0%"] : ["-6%", "6%"],
  );

  return (
    <motion.article
      ref={ref}
      layout
      initial={
        reducedMotion
          ? false
          : { opacity: 0, y: 80, scale: 0.94, filter: "blur(10px)" }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 1,
        delay: reducedMotion ? 0 : (index % 2) * 0.14,
        ease: EASE,
        layout: { duration: 0.5, ease: EASE },
      }}
      whileHover={
        reducedMotion
          ? undefined
          : { y: -8, transition: { duration: 0.4, ease: EASE } }
      }
      className="project-card group relative cursor-pointer"
    >
      {/* Image glow */}
      <div
        className="pointer-events-none absolute -bottom-5 left-[10%] h-16 w-[80%] opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40"
        style={{ backgroundColor: project.glow }}
      />

      {/* Image frame */}
      <div className="relative aspect-[1376/768] overflow-hidden rounded bg-white/5">
        {/* Parallax image */}
        <motion.img
          src={project.img}
          alt={project.alt}
          loading="lazy"
          draggable={false}
          style={{ y: imageY, scale: 1.15 }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.2]"
        />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 opacity-60 transition-opacity duration-700 group-hover:opacity-90" />

        {/* Bottom scrim — fades in on hover so the actions stay legible */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100" />

        {/* Border */}
        <div className="pointer-events-none absolute rounded inset-0 ring-1 ring-inset ring-white/15 transition-all duration-500 group-hover:ring-white/40" />

        {/* Project details */}
        <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
          {/* Top content */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-wide text-white drop-shadow-md">
                {project.brand}
              </p>
              <h3 className="mt-1 max-w-[350px] text-lg font-medium leading-snug text-white drop-shadow-md sm:text-2xl">
                {project.title}
              </h3>
            </div>

            <motion.div
              whileHover={{ rotate: 45, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-black backdrop-blur-md"
            >
              ↗
            </motion.div>
          </div>

          {/* Bottom content */}
          <div className="flex flex-col">
            {/* Tags (hidden on touch devices where the actions are always shown) */}
            <div className="flex flex-wrap gap-2 [@media(hover:none)]:hidden">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Hover actions: height expands so the tags glide upward */}
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]">
              <div className="min-h-0 overflow-hidden">
                <div className="flex flex-wrap items-center gap-2.5 px-0.5 pb-0.5 pt-3.5">
                  {/* View project */}
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!project.href || project.href === "#") e.preventDefault();
                    }}
                    aria-label={`View live project: ${project.brand}`}
                    className="group/btn relative inline-flex translate-y-4 items-center gap-2 overflow-hidden rounded-full border border-white/70 bg-white px-4 py-2 text-xs font-semibold text-black opacity-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-800/20 hover:bg-emerald-50 hover:text-emerald-950 hover:shadow-md focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 active:scale-95 sm:text-sm [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
                  >
                    <span className="relative">View project</span>
                    <ArrowUpRight
                      aria-hidden
                      className="relative h-4 w-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                    />
                  </a>

                  {/* Case study */}
                  <Link
                    to={`/projects/${project.id}`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Read case study: ${project.brand}`}
                    className="group/btn relative inline-flex translate-y-4 items-center gap-2 overflow-hidden rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white opacity-0 shadow-lg shadow-black/30 backdrop-blur-md transition-all delay-75 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]  hover:bg-black hover:text-white focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2  group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 active:scale-95 sm:text-sm [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
                  >
                    <span className="relative">Case study</span>
                    <ArrowRight
                      aria-hidden
                      className="relative h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

// --------------------------------------------------
// MAIN PROJECT LISTING
// --------------------------------------------------

export const ProjectListing = () => {
  const lenis = useLenis();
  const [activeTab, setActiveTab] = useState("All projects");
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [lenis]);

  const scrollToContact = () => {
    if (lenis) lenis.scrollTo("#contact", { offset: 0 });
    else document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const reducedMotion = useReducedMotion();

  // Category filtering
  const filteredProjects = useMemo(() => {
    if (activeTab === "All projects") {
      return projects;
    }

    return projects.filter((project) =>
      project.tags.some((tag) => tag.toLowerCase() === activeTab.toLowerCase()),
    );
  }, [activeTab]);

  return (
    <main className="main-container relative min-h-screen overflow-x-clip bg-[#07100c]">
      {/* ------------------------------------------------ */}
      {/* BACKGROUND GLOW */}
      {/* ------------------------------------------------ */}

      <motion.div
        aria-hidden
        animate={
          reducedMotion
            ? { opacity: 0.25 }
            : {
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.4, 0.2],
            }
        }
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-40 right-[-100px] h-[520px]  w-[520px] rounded-full bg-emerald-600 blur-[160px]"
      />

      {/* ------------------------------------------------ */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------ */}

      <header className="relative z-10 mx-auto  w-[90%] pt-16 text-center">
        {/* Animated heading */}
        <motion.h1
          variants={headingVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-4 text-4xl font-bold uppercase leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-[55px]"
        >
          {"Work that earns its place.".split(" ").map((word, index) => (
            <motion.span
              key={index}
              variants={wordVariants}
              className="inline-block"
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.9,
            delay: 0.65,
            ease: EASE,
          }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg"
        >
          Each one started as a business problem and shipped as a fast, working
          website and software.
        </motion.p>

        {/* ------------------------------------------------ */}
        {/* STATISTICS */}
        {/* ------------------------------------------------ */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-10 flex w-full max-w-2xl flex-wrap justify-center gap-8 sm:gap-14"
        >
          {[
            { label: "Projects shipped", value: "10+" },
            { label: "Industries", value: "10+" },
            { label: "Dedicated support", value: "24/7" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUpVariants}
              className="min-w-[110px] border-t border-gray-700 pt-3 text-left"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <motion.p
                whileHover={{ scale: 1.08, x: 4 }}
                className="mt-1 text-2xl font-semibold text-white"
              >
                {stat.value}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        {/* ------------------------------------------------ */}
        {/* CATEGORY TABS */}
        {/* ------------------------------------------------ */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 1,
            ease: EASE,
          }}
          className="mx-auto mt-14 flex w-fit max-w-full flex-wrap justify-center gap-2"
        >
          {tabs.map((item) => {
            const isActive = activeTab === item;

            return (
              <motion.button
                key={item}
                type="button"
                onClick={() => setActiveTab(item)}
                whileHover={reducedMotion ? undefined : { y: -3 }}
                whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                className={`relative overflow-hidden rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${isActive
                  ? "border-white text-black"
                  : "border-gray-800/70 text-gray-400 hover:border-gray-500 hover:text-white"
                  }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-project-tab"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                    className="absolute inset-0 rounded-full bg-white"
                  />
                )}

                <span className="relative z-10">{item}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </header>

      {/* ------------------------------------------------ */}
      {/* PROJECT GRID */}
      {/* ------------------------------------------------ */}

      <section className="relative z-10 mx-auto mt-10 w-[80%]">
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-8"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center text-gray-400"
          >
            No projects available in this category yet.
          </motion.div>
        )}
      </section>

      {/* cta banner  */}
      <div className="call-to-action h-[260px] relative overflow-hidden p-4 rounded-xl w-[80%] m-auto  mt-16">
        {/* glow  */}
        <div className="glow bg-[#03fc5e] rounded-full blur-[110px] absolute -bottom-45 left-[50%] translate-x-[-50%]  w-[260px] h-[160px]"></div>

        {/* content */}
        <div className="content-container text-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] ">
          <h1 className="uppercase text-4xl font-semibold text-white">
            Your project is next.
          </h1>
          <h1 className="text-gray-400 mt-4">
            Tell us what you’re building and we’ll help shape it.
          </h1>

          {/* button  */}

          <div className="btn-container flex items-center gap-2 mt-4">
            <button type="button" onClick={() => setIsProjectFormOpen(true)} className="w-1/2 cursor-pointer rounded-md bg-black px-3 py-2 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-950 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
              Start a project
            </button>
            <button type="button" onClick={scrollToContact} className="w-1/2 cursor-pointer rounded-md border border-white/70 bg-white px-3 py-2 text-center text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-800/20 hover:bg-emerald-50 hover:text-emerald-950 hover:shadow-md">
              Book a consultation
            </button>
          </div>
        </div>
      </div>

      <Contact />
      <Footer />
      <ProjectForm open={isProjectFormOpen} onClose={() => setIsProjectFormOpen(false)} />
    </main>
  );
};
