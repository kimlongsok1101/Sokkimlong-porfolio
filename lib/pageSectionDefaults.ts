export type AboutSectionPayload = {
  heading: string;
  subheading: string;
  bio: string;
  description: string;
  ctaText: string;
  ctaHref: string;
};

export type SkillItem = {
  name: string;
  level: string;
  icon?: string;
};

export type SkillGroup = {
  category: string;
  description: string;
  icon?: string;
  skills: SkillItem[];
};

export type SkillsSectionPayload = {
  headline: string;
  description: string;
  groups: SkillGroup[];
};

export type ProjectsSectionPayload = {
  headline: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
};

export type ContactSectionPayload = {
  heading: string;
  subheading: string;
  location: string;
};

export type PageSectionPayload =
  | AboutSectionPayload
  | SkillsSectionPayload
  | ProjectsSectionPayload
  | ContactSectionPayload;

export const defaultAboutSection: AboutSectionPayload = {
  heading: "Who is Sokkimlong?",
  subheading: "Full-Stack Developer & MIS Specialist",
  bio: "Hi! I'm Sokkimlong. I combine software development skills with business technology through my degree in Management Information Systems (MIS).",
  description:
    "I build modern web applications with sleek UI design, clear user experiences, and responsive performance using Next.js, React, and Tailwind CSS.",
  ctaText: "View MY CV",
  ctaHref: "/cv.pdf",
};

export const defaultSkillsSection: SkillsSectionPayload = {
  headline: "Skills & Applications",
  description: "Development frameworks, database engines, and creative software I use daily.",
  groups: [
    {
      category: "Frontend Development",
      description: "Creating responsive, interactive & modern web apps",
      icon: "Layout",
      skills: [
        { name: "React.js", level: "90%", icon: "ReactIcon" },
        { name: "Next.js", level: "85%", icon: "NextjsIcon" },
        { name: "TypeScript", level: "80%", icon: "TypescriptIcon" },
        { name: "Tailwind CSS", level: "95%", icon: "TailwindIcon" },
      ],
    },
    {
      category: "Backend & Systems",
      description: "Building scalable APIs and managing database systems",
      icon: "Database",
      skills: [
        { name: "Node.js", level: "80%", icon: "NodejsIcon" },
        { name: "PostgreSQL", level: "75%", icon: "PostgresIcon" },
        { name: "MIS & Systems", level: "88%", icon: "Cpu" },
        { name: "REST APIs", level: "85%", icon: "Terminal" },
      ],
    },
    {
      category: "Design & Creative Tools",
      description: "UI/UX wireframing, graphics, and asset design",
      icon: "Palette",
      skills: [
        { name: "Adobe Photoshop", level: "85%", icon: "PhotoshopIcon" },
        { name: "Adobe Illustrator", level: "80%", icon: "IllustratorIcon" },
        { name: "Figma", level: "90%", icon: "FigmaIcon" },
        { name: "Git & GitHub", level: "90%", icon: "GitIcon" },
      ],
    },
  ],
};

export const defaultProjectsSection: ProjectsSectionPayload = {
  headline: "Explore Projects Showcase",
  description: "Browse Fullstack, Design & Frontend categories",
  buttonLabel: "Explore Projects Showcase",
  buttonHref: "/projects",
};

export const defaultContactSection: ContactSectionPayload = {
  heading: "Let’s Build Something Great",
  subheading:
    "Feel free to reach out through any of these platforms for collaborations or inquiries.",
  location: "Based in Phnom Penh, Cambodia • Open for opportunities",
};
