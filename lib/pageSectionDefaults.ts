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
};

export type SkillGroup = {
  category: string;
  description: string;
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
      skills: [
        { name: "React.js", level: "90%" },
        { name: "Next.js", level: "85%" },
        { name: "TypeScript", level: "80%" },
        { name: "Tailwind CSS", level: "95%" },
      ],
    },
    {
      category: "Backend & Systems",
      description: "Building scalable APIs and managing database systems",
      skills: [
        { name: "Node.js", level: "80%" },
        { name: "PostgreSQL", level: "75%" },
        { name: "MIS & Systems", level: "88%" },
        { name: "REST APIs", level: "85%" },
      ],
    },
    {
      category: "Design & Creative Tools",
      description: "UI/UX wireframing, graphics, and asset design",
      skills: [
        { name: "Adobe Photoshop", level: "85%" },
        { name: "Adobe Illustrator", level: "80%" },
        { name: "Figma", level: "90%" },
        { name: "Git & GitHub", level: "90%" },
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
