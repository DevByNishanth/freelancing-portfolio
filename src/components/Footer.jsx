import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";

const EASE = [0.22, 1, 0.36, 1];

const footerLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const words = ["Let's", "build", "something", "meaningful."];

const marqueeItems = ["DESIGN", "DEVELOP", "INNOVATE", "CREATE IMPACT"];

const headingVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 80,
    rotateX: -45,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE },
  },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 25 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, delay, ease: EASE },
});

const Footer = ({ showNavigation = true }) => {
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();
  const reveal = (delay) => (reducedMotion ? {} : fadeUp(delay));

  const scrollToSection = (event, href) => {
    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    if (lenis) {
      lenis.scrollTo(targetPosition, {
        duration: reducedMotion ? 0 : 1.2,
        force: true,
      });
    } else {
      target.scrollIntoView({
        behavior: reducedMotion ? "instant" : "smooth",
        block: "start",
      });
    }
    window.history.replaceState(null, "", href);
  };

  return (
    <footer className="relative isolate overflow-hidden bg-[#07100c] text-white">
      {/* ===================================== */}
      {/* BACKGROUND ATMOSPHERE */}
      {/* ===================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          animate={
            reducedMotion
              ? { opacity: 0.2 }
              : {
                scale: [1, 1.25, 1],
                opacity: [0.15, 0.35, 0.15],
                x: [0, 40, 0],
                y: [0, -30, 0],
              }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-72 left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-emerald-500/30 blur-[150px]"
        />

        <motion.div
          animate={
            reducedMotion
              ? { opacity: 0.12 }
              : {
                x: [0, 50, 0],
                y: [0, -40, 0],
                opacity: [0.08, 0.2, 0.08],
              }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-150px] top-10 h-[400px] w-[400px] rounded-full bg-teal-500/20 blur-[130px]"
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
            maskImage:
              "linear-gradient(to bottom, transparent, black 30%, black 80%, transparent)",
          }}
        />
      </div>

      {/* ===================================== */}
      {/* HERO STATEMENT */}
      {/* ===================================== */}
      <div className="relative z-10 mx-auto w-[90%] max-w-7xl pb-16 pt-24 sm:pt-32">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-[1.6fr_1fr]">
          <motion.h2
            variants={headingVariants}
            initial={reducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="flex flex-wrap gap-x-[0.28em] text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl lg:text-8xl"
            style={{ perspective: 800 }}
          >
            {words.map((word, i) => (
              <motion.span
                key={word}
                variants={wordVariants}
                className={
                  i === words.length - 1
                    ? "inline-block bg-gradient-to-r from-emerald-400 via-emerald-600 to-teal-900 bg-clip-text text-transparent"
                    : "inline-block"
                }
                style={{ transformOrigin: "50% 100%" }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.div {...reveal(0.4)} className="flex flex-col gap-7">
            <p className="max-w-sm text-sm leading-7 text-gray-400">
              Building digital experiences that help businesses move forward,
              grow faster and stand out.
            </p>

            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-2.5">
              <span className="relative flex h-2 w-2">
                {!reducedMotion && (
                  <motion.span
                    animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-emerald-400"
                  />
                )}
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs text-emerald-300">
                Open for new opportunities
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===================================== */}
      {/* MOVING MARQUEE */}
      {/* ===================================== */}
      <div className="relative overflow-hidden border-y border-white/[0.08] py-7 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          animate={reducedMotion ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="flex w-max items-center gap-8 whitespace-nowrap"
        >
          {[0, 1].map((group) => (
            <div
              key={group}
              aria-hidden="true"
              className="flex items-center gap-8 pr-8"
            >
              {marqueeItems.map((item) => (
                <React.Fragment key={item}>
                  <span className="text-4xl font-bold tracking-tight text-white/[0.12] sm:text-6xl">
                    {item}
                  </span>
                  <span className="text-2xl text-emerald-400">✳</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ===================================== */}
      {/* NAVIGATION + SIGN-OFF */}
      {/* ===================================== */}
      <div className="relative z-10 mx-auto flex w-[90%] max-w-7xl flex-col items-center gap-8 py-12 md:flex-row md:justify-between">
        {showNavigation && (
          <motion.nav
            {...reveal(0.1)}
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {footerLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                onClick={(event) => scrollToSection(event, link.href)}
                whileHover={reducedMotion ? {} : { y: -2 }}
                className="rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-gray-400 transition-colors duration-300 hover:border-emerald-400/30 hover:bg-emerald-400/[0.06] hover:text-emerald-300"
              >
                {link.label}
              </motion.a>
            ))}
          </motion.nav>
        )}

        <motion.p
          {...reveal(0.25)}
          className="flex items-center gap-3 text-xs text-gray-500"
        >
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-400/60" />
          Crafted with intention. Built with passion.
        </motion.p>
      </div>
    </footer>
  );
};

export default Footer;
