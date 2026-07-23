// app/data/projects.ts

export type ProjectCategory = "Full Stack Websites" | "Design" | "Frontend" | "Mobile";

export interface Project {
  id: string;
  title: string;
  description: string;
  fullDetails?: string;
  category: ProjectCategory;
  tags: string[];
  image: string;
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

export const projectsData: Project[] = [
  {
    id: "movie-streaming-app",
    title: "Movie Streaming & Rental Platform",
    description: "A clean streaming web app with Bakong bank payment integration, prompt-based AI watch assistant, and user watchlists.",
    fullDetails: "Built with Next.js App Router and Tailwind CSS. Features full Bakong KHQR payment integration, user authentication, and an AI prompt assistant to search and filter movies effortlessly.",
    category: "Full Stack Websites",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Bakong API"],
    image: "/projects/gate.jpg",
    demoUrl: "https://example.com/demo",
    githubUrl: "https://github.com/example/movie-app",
    featured: true,
  },
  {
    id: "inventory-mis",
    title: "Enterprise MIS & Inventory Manager",
    description: "Management Information System with real-time stock tracking, PostgreSQL backend, and automated sales reporting.",
    fullDetails: "Complete inventory management solution with role-based access control, PostgreSQL data layer, and dynamic analytics dashboards.",
    category: "Full Stack Websites",
    tags: ["Node.js", "PostgreSQL", "React", "REST API"],
    image: "/projects/gate.jpg",
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example/mis",
    featured: false,
  },
  {
    id: "brand-identity-design",
    title: "E-Commerce Brand Identity & UI Kit",
    description: "Complete UI/UX design system created in Figma, Adobe Illustrator, and Photoshop for a modern retail brand.",
    fullDetails: "High-resolution brand guidelines, UI kit, logo assets, and social media mockups crafted for modern e-commerce storefronts.",
    category: "Design",
    tags: ["Photoshop", "UI/UX", "Figma"],
    image: "/projects/gate.jpg",
    featured: true,
  },
  {
    id: "portfolio-website",
    title: "Modern Developer Portfolio",
    description: "High-performance dark mode portfolio featuring smooth Framer Motion animations and Next.js App Router.",
    fullDetails: "Minimalist developer portfolio structured with clean routing, dynamic page layouts, and customizable UI components.",
    category: "Frontend",
    tags: ["React", "Next.js", "Tailwind CSS", "Framer Motion"],
    image: "/projects/gate.jpg",
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example/portfolio",
    featured: false,
  },
];

/* Helper to get projects filtered by category */
export function getProjectsByCategory(category: ProjectCategory): Project[] {
  return projectsData.filter((project: Project) => project.category === category);
}