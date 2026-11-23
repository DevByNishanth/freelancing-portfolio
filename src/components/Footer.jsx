import React from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

const footerLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Behance", href: "#" },
];

const words = ["Let's", "build", "something", "meaningful."];

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
    y: 80,
    rotateX: -45,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1,
      ease: EASE,
    },
  },
};

const Footer = () => {
  const reducedMotion = useReducedMotion();

  return (
    <footer className="relative isolate overflow-hidden bg-[#07100c] text-white">
      {/* ===================================== */}
      {/* BACKGROUND ATMOSPHERE */}
      {/* ===================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Main emerald glow */}
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
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-72 left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-emerald-500/30 blur-[150px]"
        />

        {/* Small secondary glow */}
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
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-150px] top-10 h-[400px] w-[400px] rounded-full bg-teal-500/20 blur-[130px]"
        />

        {/* Subtle grid */}
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
      {/* MAIN CTA */}
      {/* ===================================== */}

      {/* ===================================== */}
      {/* MOVING MARQUEE */}
      {/* ===================================== */}

      <div className="relative overflow-hidden border-y border-white/[0.08] py-7">
        <motion.div
          animate={reducedMotion ? {} : { x: ["0%", "-50%"] }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex w-max items-center gap-8 whitespace-nowrap"
        >
          {[0, 1].map((group) => (
            <div
              key={group}
              aria-hidden="true"
              className="flex items-center gap-8"
            >
              {["DESIGN", "DEVELOP", "INNOVATE", "CREATE IMPACT"].map(
                (item) => (
                  <React.Fragment key={item}>
                    <span className="text-4xl font-bold tracking-tight text-white/[0.12] sm:text-6xl">
                      {item}
                    </span>

                    <span className="text-2xl text-emerald-400">✳</span>
                  </React.Fragment>
                ),
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ===================================== */}
      {/* FOOTER LINKS */}
      {/* ===================================== */}

      <div className="relative z-10 mx-auto grid w-[90%] max-w-7xl grid-cols-1 gap-12 py-16 md:grid-cols-3">
        {/* Brand */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="md:col-span-1"
        >
          

          <p className="max-w-xs text-sm leading-7 text-gray-500">
            Building digital experiences that help businesses move forward, grow
            faster and stand out.
          </p>

          {/* Availability indicator */}
          <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-2.5">
            <motion.span
              animate={reducedMotion ? {} : { scale: [1, 1.5, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="h-2 w-2 rounded-full bg-emerald-400"
            />

            <span className="text-xs text-emerald-300">
              Open for new opportunities
            </span>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        >
          <h3 className="mb-7 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Explore
          </h3>

          <div className="flex flex-col items-start gap-4">
            {footerLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={reducedMotion ? false : { opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: EASE,
                }}
                className="group flex items-center gap-2 text-sm text-gray-400 transition-colors duration-300 hover:text-emerald-300"
              >
                <span className="h-1 w-1 rounded-full bg-emerald-400 opacity-0 transition-opacity group-hover:opacity-100" />

                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  {link.label}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
        >
          <h3 className="mb-7 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Find us on
          </h3>

          <div className="flex flex-col items-start gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={reducedMotion ? {} : { x: 7 }}
                className="group flex items-center gap-3 text-sm text-gray-400 transition-colors duration-300 hover:text-emerald-300"
              >
                {social.label}

                <span className="text-xs opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  ↗
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ===================================== */}
      {/* BOTTOM COPYRIGHT */}
      {/* ===================================== */}

      <div className="relative z-10 mx-auto w-[90%] max-w-7xl border-t border-white/[0.08] py-7">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Shadow Arrow. All rights reserved.
          </p>

          <motion.a
            href="#home"
            whileHover={reducedMotion ? {} : { y: -4 }}
            className="group flex items-center gap-2 text-xs text-gray-500 transition-colors hover:text-emerald-300"
          >
            Back to top
            <span className="transition-transform duration-300 group-hover:-translate-y-1">
              ↑
            </span>
          </motion.a>

          <p className="text-xs text-gray-600">
            Crafted with intention. Built with passion.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
