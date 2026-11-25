import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useAnimationControls,
  useInView,
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

   UX pass: discoverable inline fields, native checkbox/radio chips,
   accessible names + errors, validate-on-blur, real submit states.
   ===================================================================== */

const EASE = [0.22, 1, 0.36, 1];

// Where the enquiry goes.
const CONTACT_EMAIL = "softwared858@gmail.com";

// Optional: a real form endpoint (Formspree, Getform, your own API...).
// Put it in .env as VITE_CONTACT_ENDPOINT=https://formspree.io/f/xxxx
// - set   -> the form POSTs JSON and only shows "Thank you" when the server answers OK.
// - unset -> falls back to the original mailto: flow. A mailto can't confirm delivery, so the
//            visitor sees an honest "finish in your email app" screen instead of a fake success.
const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT;
const REQUEST_TIMEOUT_MS = 15000;

// The privacy checkbox is currently hidden in the design. Flip to true to show it AND require it.
const REQUIRE_CONSENT = false;

const INTERESTS = ["Website Development", "UI/UX Design", "Custom Software", "E-commerce", "Branding", "Other"];
const TIMELINES = ["As soon as possible", "Within a month", "In 2–3 months", "Just exploring"];
const BUSINESS = ["Startup", "Small Business", "Personal Brand", "Established Company", "Other"];

const emailOk = (v) => /^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/.test(v.trim());

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

/* Pure validation. Key order matches the order of the fields on the page (used to focus the first error). */
const validate = ({ name, email, agree }) => {
  const next = {};
  if (!name.trim()) next.name = "Please add your name so we know who to reply to.";
  if (!email.trim()) next.email = "Please add your email so we can reply.";
  else if (!emailOk(email)) next.email = "That doesn't look like a valid email. Try something like name@example.com.";
  if (REQUIRE_CONSENT && !agree) next.agree = "Please accept the privacy policy.";
  return next;
};

const buildBody = (data) =>
  [
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

const buildMailto = (data) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`New enquiry from ${data.name}`)}&body=${encodeURIComponent(
    buildBody(data)
  )}`;

/* Resolves "sent" only when the server confirmed it, "handoff" when we opened the mail app. Throws on failure. */
const sendEnquiry = async (data) => {
  if (CONTACT_ENDPOINT) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          interests: data.interests.join(", "),
          start: data.start,
          business: data.business,
          idea: data.idea,
          extra: data.extra,
          message: buildBody(data),
          _subject: `New enquiry from ${data.name}`,
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      return "sent";
    } finally {
      clearTimeout(timer);
    }
  }

  window.location.href = buildMailto(data);
  return "handoff";
};

/* ---------- Heading: words slide up from a mask ---------- */
const AnimatedHeading = ({ lines, id }) => (
  <motion.h2
    id={id}
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

/* ---------- Small helper line next to a sentence ("select all that apply") ---------- */
const Hint = ({ id, children }) => (
  <span id={id} className="text-[11px] font-normal uppercase tracking-[0.25em] text-gray-400">
    {children}
  </span>
);

/* ---------- Guided demo: example text "types itself" into the blanks ----------
   Loops while the blank is visible, then stops for good when the visitor focuses an input.
   It never touches the real value,
   and is skipped entirely for visitors who prefer reduced motion. */
const NO_EXAMPLES = [];
const NAME_EXAMPLES = ["Riya Nair", "Arun Raj"];
const EMAIL_EXAMPLES = ["riya@studio.com"];
const IDEA_EXAMPLES = ["A website for my bakery, live before Diwali."];

function useGhostTyping(enabled, examples, startDelay) {
  const [text, setText] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setText("");
      setRunning(false);
      return;
    }
    let cancelled = false;
    const timers = [];
    const wait = (ms) => new Promise((resolve) => timers.push(setTimeout(resolve, ms)));

    (async () => {
      await wait(startDelay);
      while (!cancelled) {
        for (const example of examples) {
          if (cancelled) return;
          setRunning(true);
          for (let i = 1; i <= example.length; i++) {
            if (cancelled) return;
            setText(example.slice(0, i));
            await wait(70);
          }
          await wait(1100);
          for (let i = example.length - 1; i >= 0; i--) {
            if (cancelled) return;
            setText(example.slice(0, i));
            await wait(35);
          }
          await wait(500);
        }
        await wait(2500);
      }
      if (!cancelled) {
        setRunning(false);
        setText("");
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [enabled, examples, startDelay]);

  return { text, running: enabled && running };
}

const useGhost = ({ examples = NO_EXAMPLES, guide, value, startDelay = 0 }) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [focused, setFocused] = useState(false);
  const enabled = !!guide && inView && !focused && !value && !reduced && examples.length > 0;
  return { ref, setFocused, ...useGhostTyping(enabled, examples, startDelay) };
};

const Caret = () => (
  <span aria-hidden className="ml-px inline-block h-[0.9em] w-px translate-y-[0.1em] animate-pulse bg-emerald-400" />
);

/* ---------- Inline blank that grows with what you type ---------- */
const InlineField = memo(function InlineField({
  name,
  value,
  onChange,
  onBlur,
  onEnter,
  placeholder,
  type = "text",
  autoComplete,
  autoCapitalize,
  enterKeyHint,
  ariaLabel,
  labelledBy,
  required,
  error,
  errorId,
  ghost,
  ghostDelay,
  guide,
}) {
  const g = useGhost({ examples: ghost, guide, value, startDelay: ghostDelay });
  return (
    // minmax(0, auto): grows with the text, but never wider than the line it sits on
    <span ref={g.ref} className="group relative inline-grid max-w-full grid-cols-[minmax(0,auto)] align-baseline">
      <span aria-hidden className="invisible col-start-1 row-start-1 overflow-hidden whitespace-pre px-1">
        {value || placeholder}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onFocus={() => g.setFocused(true)}
        onBlur={() => {
          g.setFocused(false);
          onBlur?.(name);
        }}
        onKeyDown={
          onEnter
            ? (e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                onEnter(e.currentTarget);
              }
            }
            : undefined
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        enterKeyHint={enterKeyHint}
        spellCheck={type === "email" ? false : undefined}
        aria-label={labelledBy ? undefined : ariaLabel}
        aria-labelledby={labelledBy}
        aria-required={required || undefined}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`col-start-1 row-start-1 w-0 min-w-full cursor-text bg-transparent px-1 text-emerald-400 outline-none ${g.running ? "placeholder:text-transparent" : "placeholder:text-gray-500"
          }`}
      />
      {g.running && (
        <span
          aria-hidden
          className="pointer-events-none col-start-1 row-start-1 overflow-hidden whitespace-pre px-1 text-emerald-400/50"
        >
          {g.text}
          <Caret />
        </span>
      )}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/20 transition-colors duration-300 group-hover:bg-white/40" />
      <span
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-500 ${error
          ? "scale-x-100 bg-red-400"
          : g.running
            ? "scale-x-100 bg-emerald-500/50"
            : "scale-x-0 bg-emerald-500 group-focus-within:scale-x-100"
          }`}
      />
    </span>
  );
});

/* ---------- Chip: a real checkbox / radio underneath, same look on top ---------- */
const Chip = memo(function Chip({ label, selected, onToggle, group, single, nudge, index }) {
  return (
    <motion.label
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 20 }}
      style={nudge && !selected ? { animationDelay: `${600 + index * 110}ms` } : undefined}
      className={`${nudge && !selected ? "chip-nudge " : ""}relative cursor-pointer touch-manipulation select-none overflow-hidden rounded-full border px-4 py-2 text-sm transition-colors duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-600/50 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-black ${selected
        ? "border-emerald-600 text-white"
        : "border-white/15 text-gray-400 hover:border-emerald-600/50 hover:text-white"
        }`}
    >
      <input
        type={single ? "radio" : "checkbox"}
        name={group}
        value={label}
        checked={selected}
        // checkbox: every change toggles. radio: only an unselected chip fires a change.
        onChange={() => onToggle(group, label)}
        // radios can't be un-picked natively; clicking the selected one clears it (the groups are optional)
        onClick={single && selected ? () => onToggle(group, label) : undefined}
        className="sr-only"
      />
      <AnimatePresence>
        {selected && (
          <motion.span
            aria-hidden
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
    </motion.label>
  );
});

const ChipGroup = memo(function ChipGroup({ options, value, onToggle, group, single, labelledBy, describedBy, guide }) {
  // when the group scrolls into view the chips light up one after another, once, to say "these are clickable"
  const [hinted, setHinted] = useState(false);
  return (
    <motion.div
      role={single ? "radiogroup" : "group"}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      onViewportEnter={() => setHinted(true)}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
      className="mt-4 flex flex-wrap gap-2.5"
    >
      {options.map((opt, i) => (
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
            onToggle={onToggle}
            nudge={hinted && !!guide}
            index={i}
          />
        </motion.div>
      ))}
    </motion.div>
  );
});

/* ---------- Auto-growing textarea ---------- */
const IdeaField = memo(function IdeaField({ name = "idea", value, onChange, labelledBy, describedBy, guide }) {
  const ref = useRef(null);
  const g = useGhost({ examples: IDEA_EXAMPLES, guide, value, startDelay: 900 });

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  // re-measure when the width changes (rotating a phone, resizing the window) so text is never clipped
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let width = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth !== width) {
        width = el.clientWidth;
        resize();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [resize]);

  return (
    <div ref={g.ref} className="group relative mt-6">
      <textarea
        ref={ref}
        name={name}
        rows={2}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onFocus={() => g.setFocused(true)}
        onBlur={() => g.setFocused(false)}
        placeholder="Write a little about your project..."
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={`block w-full cursor-text resize-none overflow-hidden bg-transparent pb-3 text-lg leading-relaxed text-emerald-400 outline-none md:text-xl ${g.running ? "placeholder:text-transparent" : "placeholder:text-gray-500"
          }`}
      />
      {g.running && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 whitespace-pre-wrap break-words text-lg leading-relaxed text-emerald-400/50 md:text-xl"
        >
          {g.text}
          <Caret />
        </span>
      )}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/20 transition-colors duration-300 group-hover:bg-white/40" />
      <span
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-500 group-focus-within:scale-x-100 ${g.running ? "scale-x-100 bg-emerald-500/50" : "scale-x-0 bg-emerald-500"
          }`}
      />
    </div>
  );
});

/* ---------- Animated check box (only rendered when REQUIRE_CONSENT is true) ---------- */
const Agree = ({ checked, onChange, error, errorId }) => (
  <label className="group flex cursor-pointer items-start gap-3 text-sm text-gray-400">
    <input
      type="checkbox"
      name="agree"
      checked={checked}
      onChange={(e) => onChange("agree", e.target.checked)}
      aria-required="true"
      aria-invalid={!!error}
      aria-describedby={error ? errorId : undefined}
      className="sr-only"
    />
    <motion.span
      whileTap={{ scale: 0.85 }}
      animate={{
        backgroundColor: checked ? "#009966" : "rgba(0,0,0,0)",
        borderColor: error ? "#f87171" : checked ? "#009966" : "rgba(255,255,255,0.25)",
      }}
      transition={{ duration: 0.25 }}
      className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md border group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-emerald-600/50"
    >
      <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

/* ---------- Error line that slides open (announced to screen readers) ---------- */
const FieldError = ({ show, id, children }) => (
  <AnimatePresence initial={false}>
    {show && (
      <motion.p
        id={id}
        role="alert"
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

const actionClass =
  "text-sm uppercase tracking-[0.2em] text-emerald-500 outline-none focus-visible:underline focus-visible:underline-offset-8";

/* ---------- Success / hand-off panel ----------
   mode "sent":    the server confirmed delivery.
   mode "handoff": we opened the visitor's mail app. Nothing is sent until they press send there. */
const Success = ({ mode, name, onReset, onBack, mailtoHref }) => {
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const first = name ? name.split(" ")[0] : "";

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="flex min-h-[420px] flex-col items-start justify-center"
    >
      <motion.svg aria-hidden width="84" height="84" viewBox="0 0 84 84" fill="none" className="mb-8">
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

      {mode === "sent" ? (
        <>
          <h3 ref={headingRef} tabIndex={-1} className="text-4xl font-semibold tracking-tight text-white outline-none md:text-5xl">
            Thank you{first ? `, ${first}` : ""}<span className="text-emerald-600">.</span>
          </h3>
          <p className="mt-4 max-w-md text-gray-400">
            Your message is on its way. We'll read every word and get back to you within 24 hours.
          </p>
          <motion.button
            type="button"
            onClick={onReset}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.96 }}
            className={`mt-8 ${actionClass}`}
          >
            Send another message →
          </motion.button>
        </>
      ) : (
        <>
          <h3 ref={headingRef} tabIndex={-1} className="text-4xl font-semibold tracking-tight text-white outline-none md:text-5xl">
            Almost there<span className="text-emerald-600">.</span>
          </h3>
          <p className="mt-4 max-w-md text-gray-400">
            We've opened your email app with your message filled in. Press send there to finish. Nothing has
            been sent until you do.
          </p>
          <p className="mt-3 max-w-md text-sm text-gray-400">
            Nothing opened? Write to us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-emerald-500"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <motion.a href={mailtoHref} whileHover={{ x: 4 }} whileTap={{ scale: 0.96 }} className={actionClass}>
              Open email app again →
            </motion.a>
            <motion.button
              type="button"
              onClick={onBack}
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.96 }}
              className={`${actionClass} text-gray-400`}
            >
              ← Back to the form
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

/* ---------- Section ---------- */
const Contact = () => {
  const sectionRef = useRef(null);
  const submittingRef = useRef(false);
  const reduced = useReducedMotion();

  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | handoff | error
  const [guide, setGuide] = useState(true); // animated "how to fill this in" demo, off once the visitor engages
  const stopGuide = useCallback(() => setGuide(false), []);
  const shake = useAnimationControls();

  /* stable handlers so memoised fields only re-render when their own value changes */
  const update = useCallback((key, value) => setForm((f) => ({ ...f, [key]: value })), []);
  const toggleInterest = useCallback(
    (_group, opt) =>
      setForm((f) => ({
        ...f,
        interests: f.interests.includes(opt) ? f.interests.filter((i) => i !== opt) : [...f.interests, opt],
      })),
    []
  );
  const pickSingle = useCallback(
    (key, opt) => setForm((f) => ({ ...f, [key]: f[key] === opt ? "" : opt })),
    []
  );
  const markTouched = useCallback((key) => setTouched((t) => (t[key] ? t : { ...t, [key]: true })), []);

  /* Enter in a sentence blank moves on to the next control instead of submitting half a story */
  const focusNext = useCallback((el) => {
    const controls = Array.from(el.form?.elements ?? []).filter((c) => !c.disabled && c.type !== "hidden");
    controls[controls.indexOf(el) + 1]?.focus();
  }, []);

  /* errors are computed, but only shown after the visitor touched the field or tried to submit */
  const allErrors = useMemo(
    () => validate(form),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.name, form.email, form.agree]
  );
  const errors = {
    name: attempted || touched.name ? allErrors.name : undefined,
    email: attempted || touched.email ? allErrors.email : undefined,
    agree: attempted || touched.agree ? allErrors.agree : undefined,
  };

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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return; // no duplicate submissions

    setAttempted(true);
    const invalid = Object.keys(allErrors);
    if (invalid.length) {
      if (!reduced) shake.start({ x: [0, -10, 10, -8, 8, -4, 0], transition: { duration: 0.5 } });
      e.currentTarget.elements.namedItem(invalid[0])?.focus();
      return;
    }

    submittingRef.current = true;
    setStatus("sending");
    try {
      setStatus(await sendEnquiry(form)); // "sent" or "handoff"
    } catch {
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  };

  const reset = () => {
    setForm(initialForm);
    setTouched({});
    setAttempted(false);
    setStatus("idle");
    setGuide(true);
  };

  const sending = status === "sending";

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="contact"
        ref={sectionRef}
        aria-labelledby="contact-heading"
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
        <div aria-hidden className="absolute bottom-24 left-4 top-24 hidden w-px bg-white/10 md:block">
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
              aria-hidden
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
            <AnimatedHeading id="contact-heading" lines={["Get in touch", "with us"]} />
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
                    whileFocus="hover"
                    className="relative mt-3 inline-block text-xl text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 md:text-2xl"
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
                    <span aria-hidden className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Available for projects worldwide
                  </p>
                  <p className="mt-2 text-gray-400">Based in Coimbatore, India</p>
                </Reveal>

                <Reveal delay={0.2} className="mt-12 hidden lg:block">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-500">
                    <span id="story-label">Your story</span>
                    <span className="tabular-nums">{done}/6</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-labelledby="story-label"
                    aria-valuemin={0}
                    aria-valuemax={6}
                    aria-valuenow={done}
                    className="mt-3 h-px w-full bg-white/10"
                  >
                    <motion.div style={{ scaleX: progress, originX: 0 }} className="h-full w-full bg-emerald-500" />
                  </div>
                </Reveal>
              </div>
            </aside>

            {/* ---------- right: the sentence form ---------- */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {status === "sent" || status === "handoff" ? (
                  <Success
                    mode={status}
                    name={form.name}
                    onReset={reset}
                    onBack={() => setStatus("idle")}
                    mailtoHref={buildMailto(form)}
                  />
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={onSubmit}
                    noValidate
                    aria-label="Project enquiry"
                    aria-describedby="form-intro"
                    onFocus={guide ? (event) => {
                      if (event.target.matches("input, textarea, select")) stopGuide();
                    } : undefined}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                    className="space-y-12 text-2xl font-medium leading-[1.35] tracking-tight text-white md:text-[32px]"
                  >
                    <Reveal>
                      <p
                        id="form-intro"
                        className="mb-6 max-w-xl text-sm font-normal leading-relaxed tracking-normal text-gray-400"
                      >
                        Let's make this conversation easy. Fill in the underlined fields and select the options
                        below to tell us about your project.
                      </p>
                      <p>
                        Hi, I'm{" "}
                        <InlineField
                          name="name"
                          value={form.name}
                          onChange={update}
                          onBlur={markTouched}
                          onEnter={focusNext}
                          placeholder="Your Name"
                          ariaLabel="Your name"
                          autoComplete="name"
                          autoCapitalize="words"
                          enterKeyHint="next"
                          required
                          error={errors.name}
                          errorId="name-error"
                          ghost={NAME_EXAMPLES}
                          ghostDelay={600}
                          guide={guide}
                        />
                        ,
                      </p>
                      <p className="text-gray-500">and I'm looking to collaborate with your team.</p>
                      <div className="text-base font-normal tracking-normal">
                        <FieldError show={!!errors.name} id="name-error">
                          {errors.name}
                        </FieldError>
                      </div>
                    </Reveal>

                    <Reveal>
                      <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span id="interests-label">I'm interested in:</span>
                        <Hint id="interests-hint">Select all that apply</Hint>
                      </p>
                      <ChipGroup
                        options={INTERESTS}
                        value={form.interests}
                        onToggle={toggleInterest}
                        group="interests"
                        labelledBy="interests-label"
                        describedBy="interests-hint"
                        guide={guide}
                      />
                    </Reveal>

                    <Reveal>
                      <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span id="start-label">I'm looking to start:</span>
                        <Hint id="start-hint">Choose one option</Hint>
                      </p>
                      <ChipGroup
                        options={TIMELINES}
                        value={form.start}
                        onToggle={pickSingle}
                        group="start"
                        single
                        labelledBy="start-label"
                        describedBy="start-hint"
                        guide={guide}
                      />
                    </Reveal>

                    <Reveal>
                      <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span id="business-label">A little about my business:</span>
                        <Hint id="business-hint">Choose one option</Hint>
                      </p>
                      <ChipGroup
                        options={BUSINESS}
                        value={form.business}
                        onToggle={pickSingle}
                        group="business"
                        single
                        labelledBy="business-label"
                        describedBy="business-hint"
                        guide={guide}
                      />
                    </Reveal>

                    <Reveal>
                      <p id="idea-label">Here's what I have in mind:</p>
                      <p
                        id="idea-hint"
                        className="mt-3 max-w-xl text-base font-normal leading-relaxed tracking-normal text-gray-500"
                      >
                        I'd love to tell you more about my idea, the challenges I'm looking to solve, and what I envision
                        creating together.
                      </p>
                      <IdeaField
                        value={form.idea}
                        onChange={update}
                        labelledBy="idea-label"
                        describedBy="idea-hint"
                        guide={guide}
                      />
                    </Reveal>

                    <Reveal>
                      <p>
                        You can reach me at{" "}
                        <InlineField
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={update}
                          onBlur={markTouched}
                          onEnter={focusNext}
                          placeholder="Your Email Address"
                          ariaLabel="Your email address"
                          autoComplete="email"
                          autoCapitalize="none"
                          enterKeyHint="next"
                          required
                          error={errors.email}
                          errorId="email-error"
                          ghost={EMAIL_EXAMPLES}
                          ghostDelay={600}
                          guide={guide}
                        />
                      </p>
                      <div className="text-base font-normal tracking-normal">
                        <FieldError show={!!errors.email} id="email-error">
                          {errors.email}
                        </FieldError>
                      </div>
                    </Reveal>

                    <Reveal>
                      <p id="extra-label">Anything else you'd like us to know?</p>
                      <div className="mt-3">
                        <InlineField
                          name="extra"
                          value={form.extra}
                          onChange={update}
                          placeholder="Additional details (optional)"
                          labelledBy="extra-label"
                          enterKeyHint="send"
                        />
                      </div>
                    </Reveal>

                    <Reveal>
                      <p>And let's make it happen.</p>
                      <p className="mt-2 max-w-md text-base font-normal leading-relaxed tracking-normal text-gray-500">
                        Looking forward to hearing from you and exploring what we can create together.
                      </p>

                      <div className="mt-8 flex flex-col gap-6 text-base font-normal tracking-normal sm:flex-row sm:items-center sm:justify-between">
                        {REQUIRE_CONSENT && (
                          <div>
                            <Agree checked={form.agree} onChange={update} error={errors.agree} errorId="agree-error" />
                            <FieldError show={!!errors.agree} id="agree-error">
                              {errors.agree}
                            </FieldError>
                          </div>
                        )}

                        <motion.div animate={shake}>
                          {/* aria-disabled (not disabled) so keyboard focus isn't lost while sending */}
                          <motion.button
                            type="submit"
                            aria-disabled={sending}
                            aria-busy={sending}
                            initial="rest"
                            whileHover="hover"
                            whileFocus="hover"
                            whileTap={{ scale: 0.96 }}
                            className="relative inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/70 bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-black shadow-sm outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-800/20 hover:bg-emerald-50 hover:text-emerald-950 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black aria-disabled:cursor-wait"
                          >
                            <motion.span
                              className="relative"
                            >
                              {sending ? "Sending" : status === "error" ? "Try again" : "Let's talk"}
                            </motion.span>
                            {sending ? (
                              <span
                                aria-hidden
                                className="relative block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black motion-reduce:animate-none"
                              />
                            ) : (
                              <motion.svg
                                aria-hidden
                                variants={{ rest: { x: 0, color: "#000" }, hover: { x: 4, color: "#065f46" } }}
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

                      {/* announces progress and failure; the message stays in the form so nothing is lost */}
                      <p role="status" aria-live="polite" className="sr-only">
                        {sending ? "Sending your message…" : ""}
                      </p>
                      <div className="mt-4 text-base font-normal tracking-normal">
                        <FieldError show={status === "error"} id="submit-error">
                          We couldn't send your message. Check your connection and try again, or write to us at{" "}
                          <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            className="underline decoration-red-400/50 underline-offset-4 transition-colors hover:decoration-red-400"
                          >
                            {CONTACT_EMAIL}
                          </a>
                          . Your answers are still here.
                        </FieldError>
                      </div>
                    </Reveal>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
};

export default Contact;
