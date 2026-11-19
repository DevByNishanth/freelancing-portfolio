import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import "./Contact.css";

/* =====================================================================
   Contact: "fill in the sentence" form.
   Same language as Services / Team: black canvas, emerald #009966,
   italic label with a drawing line, masked word-reveal heading,
   cursor glow, spring hovers.
   ===================================================================== */

const EASE = [0.22, 1, 0.36, 1];

// Where the enquiry goes. Swap `sendEnquiry` below for a real API / Formspree call when ready.
const CONTACT_EMAIL = "hello@yourstudio.com";

const INTERESTS = ["Website Development", "UI/UX Design", "Custom Software", "E-commerce", "Branding", "Other"];
const TIMELINES = ["As soon as possible", "Within a month", "In 2–3 months", "Just exploring"];
const BUSINESS = ["Startup", "Small Business", "Personal Brand", "Established Company", "Other"];

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const initialForm = {
  name: "",
  interests: [],
  start: "",
  business: "",
  idea: "",
  email: "",
  extra: "",
  agree: false,
};

/* ---------- Heading: words slide up from a mask ---------- */
const AnimatedHeading = ({ lines }) => (
  <motion.h2
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
    transition={{ staggerChildren: 0.1 }}
    className="text-white font-semibold text-5xl md:text-7xl lg:text-[84px] leading-[1.02] tracking-tight"
  >
    {lines.map((line, li) => (
      <span key={li} className="block">
        {line.split(" ").map((word, i, arr) => (
          <span key={i} className="inline-block overflow-hidden pb-2 mr-3 md:mr-4 align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%", rotate: 4 },
                visible: { y: 0, rotate: 0, transition: { duration: 0.9, ease: EASE } },
              }}
            >
              {word}
              {li === lines.length - 1 && i === arr.length - 1 && (
                <motion.span
                  className="inline-block text-emerald-600"
                  variants={{
                    hidden: { scale: 0, opacity: 0 },
                    visible: {
                      scale: 1,
                      opacity: 1,
                      transition: { type: "spring", stiffness: 300, damping: 12, delay: 0.5 },
                    },
                  }}
                >
                  .
                </motion.span>
              )}
            </motion.span>
          </span>
        ))}
      </span>
    ))}
  </motion.h2>
);

/* ---------- Scroll reveal wrapper ---------- */
const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 36, filter: "blur(8px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true, amount: 0.35 }}
    transition={{ duration: 0.8, ease: EASE, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ---------- Inline blank that grows with what you type ---------- */
const InlineField = ({ value, onChange, placeholder, type = "text", name, autoComplete, error }) => (
  <span className="group relative inline-grid max-w-full align-baseline">
    <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre px-1">
      {value || placeholder}
    </span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-invalid={!!error}
      className="col-start-1 row-start-1 w-0 min-w-full bg-transparent px-1 text-emerald-400 outline-none placeholder:text-gray-600"
    />
    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/20" />
    <span
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-500 ${
        error ? "scale-x-100 bg-red-400" : "scale-x-0 bg-emerald-500 group-focus-within:scale-x-100"
      }`}
    />
  </span>
);

/* ---------- Chip (single or multi select) ---------- */
const Chip = ({ label, selected, onClick, group, single }) => (
  <motion.button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.94 }}
    transition={{ type: "spring", stiffness: 380, damping: 20 }}
    className={`relative overflow-hidden rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
      selected
        ? "border-emerald-600 text-white"
        : "border-white/15 text-gray-400 hover:border-emerald-600/50 hover:text-white"
    }`}
  >
    <AnimatePresence>
      {selected && (
        <motion.span
          layoutId={single ? `chip-${group}` : undefined}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute inset-0 rounded-full bg-[#009966]"
        />
      )}
    </AnimatePresence>
    <span className="relative">{label}</span>
  </motion.button>
);

const ChipGroup = ({ options, value, onToggle, group, single }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
    className="mt-4 flex flex-wrap gap-2.5"
  >
    {options.map((opt) => (
      <motion.div
        key={opt}
        variants={{
          hidden: { opacity: 0, y: 14, scale: 0.9 },
          visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
        }}
      >
        <Chip
          label={opt}
          group={group}
          single={single}
          selected={single ? value === opt : value.includes(opt)}
          onClick={() => onToggle(opt)}
        />
      </motion.div>
    ))}
  </motion.div>
);

/* ---------- Auto-growing textarea ---------- */
const IdeaField = ({ value, onChange }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="group relative mt-6">
      <textarea
        ref={ref}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a little about your project..."
        className="block w-full resize-none overflow-hidden bg-transparent pb-3 text-lg leading-relaxed text-emerald-400 outline-none placeholder:text-gray-600 md:text-xl"
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/20" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-emerald-500 transition-transform duration-500 group-focus-within:scale-x-100" />
    </div>
  );
};

/* ---------- Animated check box ---------- */
const Agree = ({ checked, onChange, error }) => (
  <label className="group flex cursor-pointer items-start gap-3 text-sm text-gray-400">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    <motion.span
      whileTap={{ scale: 0.85 }}
      animate={{
        backgroundColor: checked ? "#009966" : "rgba(0,0,0,0)",
        borderColor: error ? "#f87171" : checked ? "#009966" : "rgba(255,255,255,0.25)",
      }}
      transition={{ duration: 0.25 }}
      className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md border group-focus-within:ring-2 group-focus-within:ring-emerald-600/50"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M2 6.5l2.5 2.5L10 3"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        />
      </svg>
    </motion.span>
    <span>
      I agree to the{" "}
      <a href="#privacy" className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-emerald-500">
        privacy policy
      </a>
      .
    </span>
  </label>
);

/* ---------- Error line that slides open ---------- */
const FieldError = ({ show, children }) => (
  <AnimatePresence initial={false}>
    {show && (
      <motion.p
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="overflow-hidden text-sm text-red-400"
      >
        <span className="block pt-2">{children}</span>
      </motion.p>
    )}
  </AnimatePresence>
);

/* ---------- Success panel ---------- */
const Success = ({ name, onReset }) => (
  <motion.div
    key="success"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.7, ease: EASE }}
    className="flex min-h-[420px] flex-col items-start justify-center"
  >
    <motion.svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="mb-8">
      <motion.circle
        cx="42"
        cy="42"
        r="38"
        stroke="#009966"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
      />
      <motion.path
        d="M26 43l11 11 21-23"
        stroke="#34d399"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
      />
    </motion.svg>
    <h3 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
      Thank you{name ? `, ${name.split(" ")[0]}` : ""}<span className="text-emerald-600">.</span>
    </h3>
    <p className="mt-4 max-w-md text-gray-400">
      Your message is on its way. We'll read every word and get back to you within 24 hours.
    </p>
    <motion.button
      type="button"
      onClick={onReset}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.96 }}
      className="mt-8 text-sm uppercase tracking-[0.2em] text-emerald-500"
    >
      Send another message →
    </motion.button>
  </motion.div>
);

/* ---------- Section ---------- */
const Contact = () => {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const shake = useAnimationControls();

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };
  const toggleInterest = (opt) =>
    set("interests")(form.interests.includes(opt) ? form.interests.filter((i) => i !== opt) : [...form.interests, opt]);
  const pickSingle = (key) => (opt) => set(key)(form[key] === opt ? "" : opt);

  /* how much of the story has been told */
  const done = useMemo(
    () =>
      [form.name.trim(), form.interests.length, form.start, form.business, form.idea.trim(), emailOk(form.email)].filter(
        Boolean
      ).length,
    [form]
  );
  const progress = useSpring(done / 6, { stiffness: 120, damping: 20 });
  useEffect(() => {
    progress.set(done / 6);
  }, [done, progress]);

  /* section scroll progress rail (same as Services/Team) */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 80%", "end 60%"] });
  const rail = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  /* cursor glow */
  const px = useMotionValue(-600);
  const py = useMotionValue(-600);
  const glow = useMotionTemplate`radial-gradient(520px circle at ${px}px ${py}px, rgba(0, 153, 102, 0.12), transparent 65%)`;
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
  };
  const onLeave = () => {
    px.set(-600);
    py.set(-600);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please tell us your name.";
    if (!emailOk(form.email)) next.email = "Enter a valid email so we can reply.";
    if (!form.agree) next.agree = "Please accept the privacy policy.";
    return next;
  };

  // Replace this with a fetch() to your backend / Formspree / EmailJS when you have one.
  const sendEnquiry = async (data) => {
    const body = [
      `Name: ${data.name}`,
      `Interested in: ${data.interests.join(", ") || "-"}`,
      `Start: ${data.start || "-"}`,
      `Business: ${data.business || "-"}`,
      `Email: ${data.email}`,
      "",
      `Project: ${data.idea || "-"}`,
      "",
      `Extra: ${data.extra || "-"}`,
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `New enquiry from ${data.name}`
    )}&body=${encodeURIComponent(body)}`;
    await new Promise((r) => setTimeout(r, 900));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      shake.start({ x: [0, -10, 10, -8, 8, -4, 0], transition: { duration: 0.5 } });
      return;
    }
    setStatus("sending");
    await sendEnquiry(form);
    setStatus("sent");
  };

  const reset = () => {
    setForm(initialForm);
    setErrors({});
    setStatus("idle");
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="main-container relative overflow-clip bg-black px-4 py-20 text-white md:py-28"
    >
      {/* backdrop */}
      <div aria-hidden className="contact-dots pointer-events-none absolute inset-0" />
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} />
      <motion.div
        aria-hidden
        animate={reduced ? undefined : { scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-emerald-600 opacity-25 blur-[160px]"
      />
      <motion.div
        aria-hidden
        animate={reduced ? undefined : { scale: [1.1, 1, 1.1], opacity: [0.1, 0.22, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-56 -left-40 h-[480px] w-[480px] rounded-full bg-emerald-600 opacity-15 blur-[170px]"
      />

      {/* scroll rail */}
      <div className="absolute bottom-24 left-4 top-24 hidden w-px bg-white/10 md:block">
        <motion.div style={{ scaleY: rail, originY: 0 }} className="h-full w-full bg-emerald-600" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="lable mb-5 flex items-center gap-2 italic text-emerald-600"
        >
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: 32 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="block h-px bg-[#048a47]"
          />
          Contact
        </motion.div>

        {/* header */}
        <div className="header">
          <AnimatedHeading lines={["Get in touch", "with us"]} />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-gray-300"
          >
            Let's build something great together.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-10">
          {/* ---------- left: details ---------- */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Reveal>
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Email us</p>
                <motion.a
                  href={`mailto:${CONTACT_EMAIL}`}
                  initial="rest"
                  whileHover="hover"
                  className="relative mt-3 inline-block text-xl text-white md:text-2xl"
                >
                  {CONTACT_EMAIL}
                  <motion.span
                    variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                    transition={{ duration: 0.5, ease: EASE }}
                    style={{ originX: 0 }}
                    className="absolute -bottom-1 left-0 h-px w-full bg-emerald-500"
                  />
                </motion.a>
              </Reveal>

              <Reveal delay={0.1} className="mt-10">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Let's work together</p>
                <p className="mt-3 flex items-center gap-3 text-gray-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Available for projects worldwide
                </p>
                <p className="mt-2 text-gray-400">Based in [Your City], India</p>
              </Reveal>

              <Reveal delay={0.2} className="mt-12 hidden lg:block">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-500">
                  <span>Your story</span>
                  <span className="tabular-nums">{done}/6</span>
                </div>
                <div className="mt-3 h-px w-full bg-white/10">
                  <motion.div style={{ scaleX: progress, originX: 0 }} className="h-full w-full bg-emerald-500" />
                </div>
              </Reveal>
            </div>
          </aside>

          {/* ---------- right: the sentence form ---------- */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <Success name={form.name} onReset={reset} />
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  noValidate
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                  className="space-y-12 text-2xl font-medium leading-[1.35] tracking-tight text-white md:text-[32px]"
                >
                  <Reveal>
                    <p>
                      Hi, I'm{" "}
                      <InlineField
                        name="name"
                        value={form.name}
                        onChange={set("name")}
                        placeholder="Your Name"
                        autoComplete="name"
                        error={errors.name}
                      />
                      ,
                    </p>
                    <p className="text-gray-500">and I'm looking to collaborate with your team.</p>
                    <div className="text-base font-normal tracking-normal">
                      <FieldError show={!!errors.name}>{errors.name}</FieldError>
                    </div>
                  </Reveal>

                  <Reveal>
                    <p>I'm interested in:</p>
                    <ChipGroup options={INTERESTS} value={form.interests} onToggle={toggleInterest} group="interests" />
                  </Reveal>

                  <Reveal>
                    <p>I'm looking to start:</p>
                    <ChipGroup options={TIMELINES} value={form.start} onToggle={pickSingle("start")} group="start" single />
                  </Reveal>

                  <Reveal>
                    <p>A little about my business:</p>
                    <ChipGroup options={BUSINESS} value={form.business} onToggle={pickSingle("business")} group="business" single />
                  </Reveal>

                  <Reveal>
                    <p>Here's what I have in mind:</p>
                    <p className="mt-3 max-w-xl text-base font-normal leading-relaxed tracking-normal text-gray-500">
                      I'd love to tell you more about my idea, the challenges I'm looking to solve, and what I envision
                      creating together.
                    </p>
                    <IdeaField value={form.idea} onChange={set("idea")} />
                  </Reveal>

                  <Reveal>
                    <p>
                      You can reach me at{" "}
                      <InlineField
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="Your Email Address"
                        autoComplete="email"
                        error={errors.email}
                      />
                    </p>
                    <div className="text-base font-normal tracking-normal">
                      <FieldError show={!!errors.email}>{errors.email}</FieldError>
                    </div>
                  </Reveal>

                  <Reveal>
                    <p>Anything else you'd like us to know?</p>
                    <div className="mt-3">
                      <InlineField
                        name="extra"
                        value={form.extra}
                        onChange={set("extra")}
                        placeholder="Additional details (optional)"
                      />
                    </div>
                  </Reveal>

                  <Reveal>
                    <p>And let's make it happen.</p>
                    <p className="mt-2 max-w-md text-base font-normal leading-relaxed tracking-normal text-gray-500">
                      Looking forward to hearing from you and exploring what we can create together.
                    </p>

                    <div className="mt-8 flex flex-col gap-6 text-base font-normal tracking-normal sm:flex-row sm:items-center sm:justify-between">
                      {/* <div>
                        <Agree checked={form.agree} onChange={set("agree")} error={errors.agree} />
                        <FieldError show={!!errors.agree}>{errors.agree}</FieldError>
                      </div> */}

                      <motion.div animate={shake}>
                        <motion.button
                          type="submit"
                          disabled={status === "sending"}
                          initial="rest"
                          whileHover="hover"
                          whileTap={{ scale: 0.96 }}
                          className="relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-black disabled:cursor-wait"
                        >
                          <motion.span
                            variants={{ rest: { y: "101%" }, hover: { y: 0 } }}
                            transition={{ duration: 0.5, ease: EASE }}
                            className="absolute inset-0 bg-emerald-600"
                          />
                          <motion.span
                            variants={{ rest: { color: "#000" }, hover: { color: "#fff" } }}
                            transition={{ duration: 0.3 }}
                            className="relative"
                          >
                            {status === "sending" ? "Sending" : "Let's talk"}
                          </motion.span>
                          {status === "sending" ? (
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                              className="relative block h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                            />
                          ) : (
                            <motion.svg
                              variants={{ rest: { x: 0, color: "#000" }, hover: { x: 6, color: "#fff" } }}
                              transition={{ type: "spring", stiffness: 300, damping: 15 }}
                              className="relative"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14M13 6l6 6-6 6" />
                            </motion.svg>
                          )}
                        </motion.button>
                      </motion.div>
                    </div>
                  </Reveal>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
