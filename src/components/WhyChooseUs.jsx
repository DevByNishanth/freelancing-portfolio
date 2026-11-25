import React, { useEffect, useRef } from "react";
import {
    motion,
    useInView,
    animate,
    useMotionValue,
    useSpring,
    useTransform,
    useMotionTemplate,
} from "motion/react";
import broken from "../assets/broken-2.png";
import fixed from "../assets/fixed-2.png";

/* =====================================================================
   VERSION 1: same cream theme (#f7ebd5) + same left/right images.
   Only content + animation are added.
   ===================================================================== */

const EASE = [0.22, 1, 0.36, 1];

const reasons = [
    { title: "Built to convert", text: "Every layout decision is tied to one goal: turning visitors into customers." },
    { title: "Fast & secure", text: "Optimised builds, clean code and monitored security out of the box." },
    { title: "Transparent process", text: "Clear milestones, honest timelines and no surprise invoices." },
    { title: "Support that stays", text: "We don't disappear after launch. Updates, fixes and help when you need it." },
];

const stats = [
    { to: 50, suffix: "+", label: "Projects delivered" },
    { to: 98, suffix: "%", label: "Client satisfaction" },
    { to: 24, suffix: "h", label: "Average response" },
];

/* ---------- Count-up number ---------- */
const Counter = ({ to, suffix }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        const controls = animate(0, to, {
            duration: 2,
            ease: EASE,
            onUpdate: (v) => {
                if (ref.current) ref.current.textContent = Math.round(v) + suffix;
            },
        });
        return () => controls.stop();
    }, [inView, to, suffix]);

    return <span ref={ref}>0{suffix}</span>;
};

/* ---------- Heading: words slide up from a mask ---------- */
const AnimatedHeading = ({ text }) => {
    const words = text.split(" ");
    return (
        <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ staggerChildren: 0.12 }}
            className="text-stone-900 font-semibold text-4xl md:text-6xl leading-[1.05] tracking-tight"
        >
            {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1 mr-3 align-bottom">
                    <motion.span
                        className="inline-block"
                        variants={{
                            hidden: { y: "110%", rotate: 4 },
                            visible: { y: 0, rotate: 0, transition: { duration: 0.8, ease: EASE } },
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
                    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 12 } },
                }}
            >
                .
            </motion.span>
        </motion.h1>
    );
};

/* ---------- Side image: slide in + mouse tilt + slow breathing ---------- */
const SideImage = ({ src, side, tilt }) => {
    const isLeft = side === "left";
    return (
        <motion.div
            initial={{ x: isLeft ? -160 : 160, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: EASE }}
            className={`image-container absolute bottom-0 h-[94%] w-[110px] md:w-[220px] lg:w-[300px] opacity-30 md:opacity-100 ${isLeft ? "left-0" : "right-0"
                }`}
        >
            <motion.div
                className="h-full w-full"
                style={{ rotate: tilt, originY: 1, originX: isLeft ? 0 : 1 }}
            >
                <motion.img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    animate={{ scale: [1, 1.025, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: isLeft ? "bottom left" : "bottom right" }}
                />
            </motion.div>
        </motion.div>
    );
};

/* ---------- Reason card ---------- */
const ReasonCard = ({ item, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 * index }}
        whileHover={{ y: -6 }}
        className="group relative overflow-hidden border-b border-stone-900/10 p-5 text-left backdrop-blur-sm"
    >
        <motion.div
            className="absolute bottom-0 left-0 h-[2px] w-full bg-black origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        />
        <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-stone-500 group-hover:text-emerald-700 transition-colors">
                {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-lg font-medium text-stone-900">{item.title}</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">{item.text}</p>
    </motion.div>
);

/* ---------- Section ---------- */
const WhyChooseUs = () => {
    const mx = useMotionValue(0.5);
    const px = useMotionValue(-500);
    const py = useMotionValue(-500);

    const tilt = useSpring(useTransform(mx, [0, 1], [-1.6, 1.6]), { stiffness: 80, damping: 18 });
    const tiltOpposite = useTransform(tilt, (v) => -v);

    const glow = useMotionTemplate`radial-gradient(520px circle at ${px}px ${py}px, rgba(3, 163, 0, 0.10 ), transparent 65%)`;

    const handleMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set(e.clientX - r.left);
        py.set(e.clientY - r.top);
        mx.set((e.clientX - r.left) / r.width);
    };

    const handleLeave = () => {
        px.set(-500);
        py.set(-500);
        mx.set(0.5);
    };

    return (
        <div
            id="about"
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="main-container bg-[#f7ebd5] min-h-[90vh] relative overflow-hidden px-6 py-16 md:py-24 rounded-t-3xl"
        >
            {/* cursor glow */}
            <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} />

            {/* images (same position, same size, same files) */}
            <SideImage src={broken} side="left" tilt={tilt} />
            <SideImage src={fixed} side="right" tilt={tiltOpposite} />

            {/* content */}
            <div className="content-container relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center md:px-[40px] lg:px-0">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
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
                    Why choose us
                    <motion.span
                        initial={{ width: 0 }}
                        whileInView={{ width: 32 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                        className="block h-px bg-emerald-700"
                    />
                </motion.div>

                <div className="heading">
                    <AnimatedHeading text="Why brands choose us" />
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
                    className="mt-5 max-w-xl text-[15px] leading-relaxed text-stone-700"
                >
                    We take websites that are slow, outdated or simply not working and turn them into
                    digital products that earn their place in your business.
                </motion.p>

                {/* reasons */}
                <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    {reasons.map((r, i) => (
                        <ReasonCard key={r.title} item={r} index={i} />
                    ))}
                </div>

                {/* stats */}
                <div className="mt-10 grid w-full grid-cols-3 gap-4  border-stone-900/10 pt-8">
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: EASE, delay: 0.1 * i }}
                        >
                            <div className="text-3xl md:text-5xl font-semibold tracking-tight text-stone-900 tabular-nums">
                                <Counter to={s.to} suffix={s.suffix} />
                            </div>
                            <div className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-600">{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.a
                    href="#contact"
                    initial="rest"
                    whileHover="hover"
                    whileTap={{ scale: 0.96 }}
                    className="relative mt-10 inline-flex items-center gap-3 overflow-hidden rounded-full bg-stone-900 px-8 py-4 font-medium text-[#f7ebd5]"
                >
                    <motion.span
                        variants={{ rest: { y: "101%" }, hover: { y: 0 } }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="absolute inset-0 bg-emerald-600"
                    />
                    <span className="relative">Start your project</span>
                    <motion.svg
                        variants={{ rest: { x: 0 }, hover: { x: 6 } }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
    );
};

export default WhyChooseUs;
