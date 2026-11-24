import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";

/*
  Next-project card, laid out like the wireframe:
  [ image ]  [ title            ]            [ View button ]
             [ description ............ ]
*/
export default function NextProject({ project }) {
    if (!project) return null;

    // title = brand, description = overview (falls back to the project title)
    const title = project.brand;
    const description = project.caseStudy?.overview ?? project.title;

    return (
        <section className="relative z-10 mx-auto mt-20 w-[90%] ">
            <Reveal>
                <p className="mb-4 text-sm uppercase tracking-[0.22em] text-gray-500">
                    Next project
                </p>

                <Link
                    to={`/projects/${project.id}`}
                    aria-label={`View ${project.brand}`}
                    className="group relative flex items-center gap-4 overflow-hidden rounded border-white/10 bg-white/[0.02] p-3 backdrop-blur-sm transition-all duration-500 hover:border-emerald-400/40 hover:bg-white/[0.06] sm:gap-6 sm:p-4"
                >
                    {/* hover glow */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500 opacity-0 blur-[90px] transition-opacity duration-700 group-hover:opacity-25"
                    />

                    {/* Image */}
                    <div className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded bg-white/5 ring-1 ring-inset ring-white/10 sm:w-44 md:w-56">
                        <img
                            src={project.img}
                            alt={project.alt}
                            loading="lazy"
                            draggable={false}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>

                    {/* Title + description */}
                    <div className="relative min-w-0 flex-1 self-start ">
                        <h3 className="truncate text-lg font-semibold text-white sm:text-2xl">
                            {title}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 max-w-2xl text-xs leading-relaxed text-gray-400 sm:text-sm">
                            {description}
                        </p>
                    </div>

                    {/* View button */}
                    <span className="relative flex shrink-0 items-center gap-2 self-start rounded-full bg-linear-to-r from-emerald-400 to-emerald-800 p-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-900/30 transition-all duration-300 group-hover:bg-emerald-300 sm:px-5 sm:py-2.5">
                        <span className="hidden sm:inline">View project</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                </Link>
            </Reveal>
        </section>
    );
}
