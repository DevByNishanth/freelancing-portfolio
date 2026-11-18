import React, { useRef } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useMotionValue,
    useMotionTemplate,
} from "motion/react";

const services = [
    {
        service: "Website Development",
        label: "Development",
        details: ["Business Websites", "Portfolio Websites", "Landing Pages", "Corporate Websites", "Responsive Development"],
    },
    {
        service: "Custom Software",
        label: "Solutions",
        details: ["Custom Web Applications", "Business Management Systems", "Workflow Automation", "Booking Systems", "API Integration"],
    },
    {
        service: "Website Redesign",
        label: "Revamp",
        details: ["Website Modernization", "Layout Improvements", "Visual Enhancements", "Performance Optimization", "Responsive Redesign"],
    },
    {
        service: "E-commerce Development",
        label: "Commerce",
        details: ["Online Store Development", "Product Management", "Shopping Cart Integration", "Secure Payment Integration", "Order Management"],
    },
    {
        service: "Website Maintenance",
        label: "Support",
        details: ["Regular Website Updates", "Bug Fixes", "Security Monitoring", "Performance Monitoring", "Technical Support"],
    },
    {
        service: "SEO & Digital Optimization",
        label: "Visibility",
        details: ["Search Engine Optimization", "On-Page SEO", "Technical SEO", "Website Speed Optimization", "Performance Optimization"],
    },
    {
        service: "UI/UX Design",
        label: "Experience",
        details: ["UI Design", "UX Research", "Wireframing", "Prototyping", "User Flow Design"],
    },
    {
        service: "Admin Dashboards",
        label: "Management",
        details: ["Dashboard Development", "Analytics & Reports", "User Management", "Data Visualization", "Role-Based Access"],
    },
];

const EASE = [0.22, 1, 0.36, 1];

/* ---------- Heading: words slide up from a mask ---------- */
const AnimatedHeading = ({ text }) => {
    const words = text.split(" ");
    return (
        <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ staggerChildren: 0.12 }}
            className="text-white font-semibold text-4xl md:text-[56px] leading-[1.05] tracking-tight"
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

/* ---------- Single service row ---------- */
const ServiceRow = ({ item, index }) => {
    const mouseX = useMotionValue(-500);
    const mouseY = useMotionValue(-500);

    const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(0, 153, 102, .30), transparent 70%)`;

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const handleMouseLeave = () => {
        mouseX.set(-500);
        mouseY.set(-500);
    };

    return (
        // Outer: scroll reveal
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
        >
            {/* Inner: hover choreography via variants */}
            <motion.div
                initial="rest"
                whileHover="hover"
                animate="rest"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="card group relative overflow-hidden rounded-2xl px-4 md:px-8 py-10 flex flex-col md:flex-row md:items-center gap-8 text-white cursor-pointer"
            >
                {/* Cursor spotlight */}
                <motion.div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: spotlight }}
                />

                {/* Bottom line that draws on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
                <motion.div
                    variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                    transition={{ duration: 0.6, ease: EASE }}
                    style={{ originX: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-px bg-[#b41a1a]"
                />

                {/* Title block */}
                <div className="title md:w-[50%] flex items-start gap-6 relative z-10">
                    <motion.span
                        variants={{
                            rest: { color: "#4b4b4b" },
                            hover: { color: "#b41a1a" },
                        }}
                        className="font-mono text-sm pt-3 tabular-nums"
                    >
                        {String(index + 1).padStart(2, "0")}
                    </motion.span>

                    <motion.div
                        variants={{ rest: { x: 0 }, hover: { x: 14 } }}
                        transition={{ duration: 0.5, ease: EASE }}
                    >
                        <h1 className="text-3xl md:text-4xl font-medium tracking-tight">{item.service}</h1>
                        <h2 className="text-gray-400 uppercase text-xs mt-2 tracking-[0.25em]">{item.label}</h2>
                    </motion.div>

                    <motion.svg
                        variants={{
                            rest: { opacity: 0, x: -10, rotate: -45 },
                            hover: { opacity: 1, x: 0, rotate: 0 },
                        }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        className="hidden md:block ml-auto mt-2 text-[#b41a1a]"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </motion.svg>
                </div>

                {/* Detail chips */}
                <motion.div
                    variants={{ rest: {}, hover: { transition: { staggerChildren: 0.05 } } }}
                    className="description md:w-[50%] flex flex-wrap gap-3 relative z-10"
                >
                    {item.details.map((detail) => (
                        <motion.div
                            key={detail}
                            variants={{
                                rest: {
                                    y: 0,
                                    color: "#9ca3af",
                                    borderColor: "rgba(255,255,255,0.1)",
                                    backgroundColor: "rgba(255,255,255,0)",
                                },
                                hover: {
                                    y: -4,
                                    color: "#ffffff",
                                    borderColor: "rgba(180,26,26,0.7)",
                                    backgroundColor: "rgba(180,26,26,0.12)",
                                },
                            }}
                            transition={{ type: "spring", stiffness: 350, damping: 20 }}
                            className="detail-card text-sm px-4 py-2 rounded-full border"
                        >
                            {detail}
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

/* ---------- Section ---------- */
const Services = () => {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start 80%", "end 60%"],
    });
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

    return (
        <section
            ref={sectionRef}
            className="main-container relative bg-[#000000] px-6 md:px-12 py-16 md:py-24 m-auto mt-10 overflow-hidden"
        >
            {/* Ambient red glow */}
            <motion.div
                aria-hidden
                animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-emerald-600 blur-[160px]"
            />

            {/* Scroll progress rail */}
            <div className="hidden md:block absolute left-4 top-24 bottom-24 w-px bg-white/10">
                <motion.div style={{ scaleY: progress, originY: 0 }} className="h-full w-full bg-emerald-600" />
            </div>

            {/* Label */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE }}
                className="lable relative text-emerald-600 italic flex gap-2 items-center mb-4"
            >
                <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: 32 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                    className="block h-px bg-[#048a47]"
                />
                Services
            </motion.div>

            {/* Header */}
            <div className="header relative flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <AnimatedHeading text="Eight disciplines. One studio" />
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
                    className="md:w-[30%] text-gray-300 text-[15px] leading-relaxed"
                >
                    Every project is built around one outcome. A digital presence that pays you back!
                </motion.p>
            </div>

            {/* Rows */}
            <div className="content-container relative mt-16 md:mt-20 md:w-[97%] m-auto">
                {services.map((item, index) => (
                    <ServiceRow key={item.service} item={item} index={index} />
                ))}
            </div>
        </section>
    );
};

export default Services;
