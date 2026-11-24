import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

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

export default Reveal;