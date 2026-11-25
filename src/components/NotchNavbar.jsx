import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const NOTCH_BG = "#07100c";
const EAR = 18; // size of the curved corners (px)

const icons = {
    home: (
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    ),
    about: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </>
    ),
    services: (
        <>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
    ),
    projects: (
        <>
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </>
    ),
    contact: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
        </>
    ),
};

const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
];

function Icon({ name }) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {icons[name]}
        </svg>
    );
}

// Inverted rounded corner that blends the notch into the top edge
function Ear({ side }) {
    const at = side === "left" ? "0 100%" : "100% 100%";
    return (
        <span
            aria-hidden="true"
            className={`absolute top-0 ${side === "left" ? "right-full" : "left-full"}`}
            style={{
                width: EAR,
                height: EAR,
                background: `radial-gradient(circle at ${at}, transparent ${EAR - 0.5}px, ${NOTCH_BG} ${EAR}px)`,
            }}
        />
    );
}

export default function NotchNavbar() {
    const [active, setActive] = useState("home");
    const reducedMotion = useReducedMotion();

    // Highlight the section currently in view
    useEffect(() => {
        const sections = navLinks
            .map(({ id }) => document.getElementById(id))
            .filter(Boolean);
        if (!sections.length) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: "-45% 0px -50% 0px" },
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    return (
        <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
            {/* Thin top frame line */}
            <div className="h-[3px] w-full" style={{ background: NOTCH_BG }} />

            <motion.nav
                aria-label="Main"
                initial={reducedMotion ? false : { y: -60 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto relative mx-auto w-fit rounded-b-[20px] px-2 pb-2 pt-1 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                style={{ background: NOTCH_BG }}
            >
                <Ear side="left" />
                <Ear side="right" />

                <ul className="flex items-center gap-0.5">
                    {navLinks.map((link) => {
                        const isActive = active === link.id;
                        return (
                            <li key={link.id}>
                                <a
                                    href={`#${link.id}`}
                                    onClick={() => setActive(link.id)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300 ${isActive ? "text-white" : "text-white/40 hover:text-white/75"
                                        }`}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="notch-active"
                                            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                                            className="absolute inset-0 rounded-full bg-white/[0.08] ring-1 ring-white/10"
                                        />
                                    )}
                                    <span className="relative">
                                        <Icon name={link.id} />
                                    </span>
                                    <span className="relative hidden sm:inline">{link.label}</span>
                                    {isActive && (
                                        <span className="relative h-1 w-1 rounded-full bg-emerald-400 sm:hidden" />
                                    )}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </motion.nav>
        </header>
    );
}
