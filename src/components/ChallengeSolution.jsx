// Needs: lucide-react  ->  npm i lucide-react
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Lightbulb,
  Link2Off,
  Laptop,
  Rocket,
  Sparkles,
  TrendingDown,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
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


/*
  Optional: add these to your `cs` data to customise the lists.
  Falls back to the defaults below if not provided.
    cs.challengePoints = [{ text: "Disconnected workflows" }, ...]
    cs.solutionPoints  = [{ text: "Enhanced user experience" }, ...]
*/
const defaultChallengePoints = [
  { icon: Link2Off, text: "Disconnected workflows" },
  { icon: TrendingDown, text: "Low user engagement" },
  { icon: Users, text: "Scalability concerns" },
];
const defaultSolutionPoints = [
  { icon: Rocket, text: "Enhanced user experience" },
  { icon: Workflow, text: "Automated workflows" },
  { icon: Zap, text: "Built for scalability" },
];

function PointList({ points, tone }) {
  const isRed = tone === "red";
  return (
    <ul className="mt-6 space-y-3">
      {points.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-3 text-sm text-gray-300">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${isRed
              ? "border-white/10 bg-white/5 text-gray-400"
              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
              }`}
          >
            <Icon size={15} />
          </span>
          {text}
        </li>
      ))}
    </ul>
  );
}


export default function ChallengeSolution({ cs }) {

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

  const EASE = [0.22, 1, 0.36, 1];


  const challengePoints = cs.challengePoints
    ? cs.challengePoints.map((p, i) => ({ icon: defaultChallengePoints[i % 3].icon, text: p.text ?? p }))
    : defaultChallengePoints;
  const solutionPoints = cs.solutionPoints
    ? cs.solutionPoints.map((p, i) => ({ icon: defaultSolutionPoints[i % 3].icon, text: p.text ?? p }))
    : defaultSolutionPoints;

  return (
    <section className="relative z-10 mx-auto mt-20 w-[90%] max-w-6xl">
      {/* ambient glow behind the section */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-[120px]"
      />

      {/* ───────── Heading ───────── */}
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-sm">
            <Sparkles size={13} className="text-emerald-400" />
            The Journey
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            The Challenge &amp;{" "}
            <span className="bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent">
              The Solution
            </span>
          </h2>

          <p className="mt-4 leading-relaxed text-gray-400">
            Every great product starts with a problem. Here&apos;s how we turned
            challenges into a seamless solution.
          </p>
          <div className="mx-auto mt-5 h-[3px] w-16 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        </div>
      </Reveal>

      {/* ───────── Cards ───────── */}
      <div className="mt-16 grid items-center gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-4">
        {/* Challenge card */}
        <Reveal>
          <div className="group relative md:-rotate-[1.5deg] transition-transform duration-500 hover:rotate-0">
            {/* floating warning illustration */}
            <div className="absolute -right-4 -top-10 z-20 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-400/30 bg-gradient-to-br from-red-400/30 to-red-600/20 text-red-300 shadow-[0_10px_40px_-8px_rgba(239,68,68,0.6)] backdrop-blur-sm rotate-6 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-12 sm:-right-6">
              <AlertTriangle size={40} strokeWidth={2} />
            </div>

            <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-[#0c0f0e] p-7 shadow-2xl shadow-black/50 transition-colors duration-500 hover:border-red-400/30 sm:p-9">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-red-500 opacity-0 blur-[90px] transition-opacity duration-700 group-hover:opacity-20"
              />

              <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-medium text-red-300">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-400 text-[10px] font-bold text-black">
                  !
                </span>
                The Challenge
              </span>

              <h3 className="mt-5 text-2xl font-semibold leading-snug text-white">
                {cs.challengeTitle ?? "A fragmented experience with limited engagement."}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">{cs.challenge}</p>

              <PointList points={challengePoints} tone="red" />
            </div>
          </div>
        </Reveal>

        {/* Arrow connector */}
        <Reveal delay={0.1}>
          <div className="relative z-20 flex items-center justify-center">
            <div className="absolute hidden h-px w-24 border-t border-dashed border-emerald-400/30 md:block" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/40 bg-[#0c0f0e] text-emerald-400 shadow-[0_0_30px_-4px_rgba(52,211,153,0.5)]">
              <ArrowRight size={20} className="rotate-90 md:rotate-0" />
            </div>
          </div>
        </Reveal>

        {/* Solution card */}
        <Reveal delay={0.2}>
          <div className="group relative md:rotate-[1.5deg] transition-transform duration-500 hover:rotate-0">
            {/* lightbulb illustration */}
            <div className="absolute -right-3 -top-12 z-20 flex h-20 w-20 items-center justify-center sm:-right-5">
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-2xl" />
              <Lightbulb
                size={52}
                strokeWidth={1.8}
                className="relative -rotate-6 text-emerald-300 drop-shadow-[0_0_18px_rgba(52,211,153,0.8)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-6"
              />
            </div>

            <div className="relative h-full overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.12] via-white/[0.04] to-white/[0.02] p-7 shadow-2xl shadow-emerald-900/20 backdrop-blur-sm transition-colors duration-500 hover:border-emerald-400/50 sm:p-9">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500 opacity-20 blur-[90px] transition-opacity duration-700 group-hover:opacity-40"
              />

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <CheckCircle2 size={14} className="text-emerald-400" />
                The Solution
              </span>

              <h3 className="mt-5 max-w-[16rem] text-2xl font-semibold leading-snug text-white">
                {cs.solutionTitle ?? "A modern, scalable platform built for growth."}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">{cs.solution}</p>

              <PointList points={solutionPoints} tone="green" />

              {/* laptop illustration */}
              <div className="pointer-events-none absolute bottom-10 right-2 hidden sm:block">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl" />
                  <Laptop
                    size={150}
                    strokeWidth={1}
                    className="relative rotate-10 text-emerald-100/50 transition-transform duration-500 group-hover:scale-105"
                  />
                  <CheckCircle2
                    size={34}
                    strokeWidth={1.6}
                    className="absolute left-1/2 top-[41%] -translate-x-1/2 -translate-y-1/2 text-emerald-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
