import arunaImg from "../assets/projects/arunaCanvas.png";
import avaratImg from "../assets/projects/avaratSchoolCanvas.png";
import bookMyCabsImg from "../assets/projects/bookMyCabsCanvas.png";
import exploreMunnarImg from "../assets/projects/exploreMunnarCanvas.png";
import exploreMunnarDashboardImg from "../assets/projects/exploreMunnarDashboard.png";
import shadowArrowImg from "../assets/projects/shadowArrowCanvas.png";
import crossCurrencyCanvas from "../assets/projects/crossCurrencyCanvas.png";
import eventsCanvas from "../assets/projects/eventsCanvas.png";
import lmsCanvas from "../assets/projects/lmsCanvas.png";
import hrmsCanvas from "../assets/projects/hrmsCanvas.png";

export const projects = [
  {
    id: "aruna",
    brand: "Aruna",
    title: "Website design for hotel and catering services.",
    tags: ["Website", "Branding"],
    img: arunaImg,
    alt: "Aruna catering website shown on a tablet",
    glow: "#f4813b",
    href: "https://arunacaterer.com",
    // Optional — every field below falls back to a placeholder if omitted.
    caseStudy: {
      client: "Aruna Caterers",
      year: "2025",
      role: "UI/UX, Branding, Development",
      duration: "6 weeks",
      overview:
        "Aruna is a hotel and catering business that relied on word of mouth and phone calls. They needed a website that showcased their menus, built trust with corporate clients and made enquiries effortless.",
      challenge:
        "Their menu is large and changes with every event type. Customers couldn't browse it easily, and most enquiries came in with missing details, costing the team hours of back and forth.",
      solution:
        "We designed a visual, category-first menu experience and a short guided enquiry form that captures event type, headcount and date up front, then routes it straight to WhatsApp and email.",
      features: [
        { title: "Visual menu browsing", text: "Veg and non-veg categories with rich photography and quick filters." },
        { title: "Guided enquiry form", text: "Captures every detail the kitchen needs in under a minute." },
        { title: "WhatsApp handoff", text: "One tap sends the full enquiry to the owner's phone." },
        { title: "Fast and mobile-first", text: "Optimised images and lean code for slow mobile networks." },
      ],
      results: [
        { value: 3, suffix: "x", label: "More enquiries" },
        { value: 40, suffix: "%", label: "Faster response time" },
        { value: 95, suffix: "+", label: "Lighthouse score" },
      ],
      tech: ["React", "Tailwind CSS", "Node.js", "Vercel"],
      gallery: [], // extra screenshots, e.g. [img1, img2]
      testimonial: {
        quote: "The new site paid for itself in the first month. Clients now arrive with exactly the details we need.",
        author: "Aruna Team",
        role: "Aruna Caterers",
      },
    },
  },
  {
    id: "avarat",
    brand: "Avarat Public School",
    title: "School website with admissions, events and a parent portal.",
    tags: ["Website", "Application"],
    img: avaratImg,
    alt: "Avarat Public School website shown on a tablet",
    glow: "#e0961a",
    href: "#",
  },
  {
    id: "explore-munnar",
    brand: "Explore Munnar",
    title:
      "A centralized dashboard to manage stays, activities and travel operations.",
    tags: ["Website", "Web"],
    img: exploreMunnarImg,
    alt: "Explore Munnar admin dashboard displayed on a tablet",
    glow: "#5f8a3a",
    href: "#",
  },
  {
    id: "shadow-arrow",
    brand: "Shadow Arrow",
    title: "Brand website for a web development company.",
    tags: ["Website", "Web"],
    img: shadowArrowImg,
    alt: "Shadow Arrow company website shown on a tablet",
    glow: "#1d4ed8",
    href: "#",
  },
  {
    id: "book-my-cabs",
    brand: "Book My Cabs",
    title: "Outstation taxi booking with instant fare quotes.",
    tags: ["Application", "Web"],
    img: bookMyCabsImg,
    alt: "Book My Cabs taxi booking website shown on a tablet",
    glow: "#f5c500",
    href: "#",
  },
  {
    id: "learning-management",
    brand: "Learning Management System",
    title:
      "A platform to simplify learning and assignments for college students.",
    tags: ["Management", "Admin Dashboard"],
    img: lmsCanvas,
    alt: "Explore Munnar management dashboard",
    glow: "#5f8a3a",
    href: "#",
  },
  {
    id: "explore-munnar-dashboard",
    brand: "Explore Munnar",
    title:
      "A centralized dashboard to manage stays, activities and travel operations.",
    tags: ["Admin Dashboard", "Management"],
    img: exploreMunnarDashboardImg,
    alt: "Explore Munnar management dashboard",
    glow: "#5f8a3a",
    href: "#",
  },
  {
    id: "event-management",
    brand: "Event Management System",
    title:
      "A platform to simplify event planning and management.",
    tags: ["Management", "Admin Dashboard"],
    img: eventsCanvas,
    alt: "Explore Munnar management dashboard",
    glow: "#5f8a3a",
    href: "#",
  },
  {
    id: "cross-currency",
    brand: "Cross currency",
    title:
      "A currency conversion and financial data platform.",
    tags: ["Trading", "Admin Dashboard"],
    img: crossCurrencyCanvas,
    alt: "Explore Munnar management dashboard",
    glow: "#5f8a3a",
    href: "#",
  },
  {
    id: "human-resource",
    brand: "HR Management System",
    title:
      "A platform to streamline employee management and HR operations.",
    tags: ["Management", "Admin Dashboard"],
    img: hrmsCanvas,
    alt: "Explore Munnar management dashboard",
    glow: "#5f8a3a",
    href: "#",
  },

];
