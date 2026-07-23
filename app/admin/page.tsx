"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import {
  defaultAboutSection,
  defaultContactSection,
  defaultProjectsSection,
  defaultSkillsSection,
} from "@/lib/pageSectionDefaults";
import type { Project, ProjectCategory } from "@/data/projects";

type ProjectCategoryFilter = ProjectCategory | "All";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

type Message = {
  id: string;
  name: string;
  email: string;
  content: string;
  created_at: string | null;
};

type PageSection = {
  section: string;
  payload: Record<string, unknown>;
};

type SectionEditorState = {
  section: string;
  payload: Record<string, unknown>;
};

const sectionOptions = [
  { value: "about", label: "About" },
  { value: "skills", label: "Skills" },
  { value: "projects", label: "Projects" },
  { value: "contact", label: "Contact" },
];

function getDefaultSectionPayload(section: string) {
  switch (section) {
    case "about":
      return defaultAboutSection;
    case "skills":
      return defaultSkillsSection;
    case "projects":
      return defaultProjectsSection;
    case "contact":
      return defaultContactSection;
    default:
      return {};
  }
}

export default function AdminPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [currentSection, setCurrentSection] = useState<string>("about");
  const [sectionEditor, setSectionEditor] = useState<SectionEditorState>({
    section: "about",
    payload: getDefaultSectionPayload("about"),
  });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [messageForm, setMessageForm] = useState({ name: "", email: "", content: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectCategory, setProjectCategory] = useState<ProjectCategoryFilter>("All");
  const [projectForm, setProjectForm] = useState<{
    title: string;
    description: string;
    fullDetails: string;
    category: ProjectCategory;
    tags: string;
    image: string;
    demoUrl: string;
    githubUrl: string;
    featured: boolean;
  }>({
    title: "",
    description: "",
    fullDetails: "",
    category: "Design",
    tags: "",
    image: "",
    demoUrl: "",
    githubUrl: "",
    featured: false,
  });
  const [projectEditId, setProjectEditId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isAdmin = useMemo(
    () => sessionEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    [sessionEmail]
  );

  useEffect(() => {
    let authListenerSubscription: { unsubscribe: () => void } | null = null;

    const loadSession = async () => {
      const supabase = createSupabaseClient();
      if (!supabase) {
        setFeedback(
          "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        setAuthLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setSessionEmail(session.user.email);
      }
      setAuthLoading(false);

      const { data } = supabase.auth.onAuthStateChange((_event, sessionData) => {
        setSessionEmail(sessionData?.user?.email ?? null);
      });

      authListenerSubscription = data.subscription;
    };

    loadSession();

    return () => {
      authListenerSubscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadMessages();
      loadSections();
      loadProjects(projectCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadProjects(projectCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCategory]);

  // Realtime subscription to projects table for live updates when admin adds/edits/deletes
  useEffect(() => {
    if (!isAdmin) return;
    const supabase = createSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`admin:projects:${projectCategory}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: projectCategory === "All" ? undefined : `category=eq.${projectCategory}`,
        },
        async () => {
          await loadProjects(projectCategory);
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, projectCategory]);

  const getSavedSection = (sectionName: string) =>
    sections.find((section) => section.section === sectionName);

  useEffect(() => {
    const saved = getSavedSection(currentSection);
    setSectionEditor({
      section: currentSection,
      payload: saved ? saved.payload : getDefaultSectionPayload(currentSection),
    });
  }, [currentSection, sections]);

  const loadMessages = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    if (!supabase) {
      setFeedback(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("id, name, email, content, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setFeedback(error.message);
      setMessages([]);
    } else if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const loadSections = async () => {
    setLoading(true);
    const response = await fetch("/api/page-sections");
    const result = await response.json();

    if (!response.ok) {
      setFeedback(result.error ?? "Unable to load page sections.");
      setSections([]);
      setLoading(false);
      return;
    }

    if (result.data) {
      setSections(result.data);
      const matched = result.data.find((item: PageSection) => item.section === currentSection);
      if (matched) {
        setSectionEditor({ section: currentSection, payload: matched.payload });
      }
    }
    setLoading(false);
  };

  const loadProjects = async (category: ProjectCategoryFilter) => {
    setLoading(true);
    const url = category === "All" ? "/api/projects" : `/api/projects?category=${encodeURIComponent(category)}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      setFeedback(result.error ?? "Unable to load projects.");
      setProjects([]);
      setLoading(false);
      return;
    }

    setProjects(result.data ?? []);
    setLoading(false);
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: "",
      description: "",
      fullDetails: "",
      category: projectCategory === "All" ? "Design" : projectCategory,
      tags: "",
      image: "",
      demoUrl: "",
      githubUrl: "",
      featured: false,
    });
    setProjectEditId(null);
  };

  const handleProjectFieldChange = (field: keyof typeof projectForm, value: string | boolean) => {
    setProjectForm((current) => ({ ...current, [field]: value }));
  };

  const startProjectEdit = (project: Project) => {
    setProjectEditId(project.id);
    setProjectForm({
      title: project.title,
      description: project.description,
      fullDetails: project.fullDetails ?? "",
      category: project.category,
      tags: project.tags.join(", "),
      image: project.image ?? "",
      demoUrl: project.demoUrl ?? "",
      githubUrl: project.githubUrl ?? "",
      featured: Boolean(project.featured),
    });
  };

  const saveProject = async () => {
    if (!projectForm.title || !projectForm.description || !projectForm.category) {
      setFeedback("Please fill in project title, description, and category.");
      return;
    }

    setLoading(true);
    const method = projectEditId ? "PATCH" : "POST";
    const payload = {
      ...projectForm,
      featured: projectForm.featured,
      id: projectEditId,
    };

    const response = await fetch("/api/projects", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      setFeedback(result.error ?? "Unable to save project.");
    } else {
      setFeedback(projectEditId ? "Project updated." : "Project created.");
      resetProjectForm();
      loadProjects(projectCategory);
    }
    setLoading(false);
  };

  const deleteProject = async (id: string) => {
    setLoading(true);
    const response = await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();

    if (!response.ok) {
      setFeedback(result.error ?? "Unable to delete project.");
    } else {
      setFeedback("Project deleted.");
      setProjects((current) => current.filter((project) => project.id !== id));
    }
    setLoading(false);
  };

  const signIn = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    if (!supabase) {
      setFeedback(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      setFeedback(error.message);
    } else {
      const userEmail = data.session?.user?.email ?? form.email;
      setSessionEmail(userEmail);
      setFeedback("Signed in successfully.");
      if (userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        loadMessages();
        loadSections();
      }
    }
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSessionEmail(null);
    setMessages([]);
    setSections([]);
    setLoading(false);
  };

  const createMessage = async () => {
    if (!messageForm.name || !messageForm.email || !messageForm.content) {
      setFeedback("Please fill all message fields before creating.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageForm),
    });
    const result = await response.json();

    if (!response.ok) {
      setFeedback(result.error ?? "Unable to create message.");
    } else if (result.data?.length) {
      setFeedback("Message created.");
      setMessageForm({ name: "", email: "", content: "" });
      setMessages((current) => [result.data[0], ...current]);
    }
    setLoading(false);
  };

  const updateMessage = async () => {
    if (!editId) {
      return;
    }

    const target = messages.find((message) => message.id === editId);
    if (!target) {
      setFeedback("Message not found.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        name: target.name,
        email: target.email,
        content: target.content,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setFeedback(result.error ?? "Unable to update message.");
    } else {
      setFeedback("Message updated.");
      setEditId(null);
      if (result.data?.length) {
        setMessages((current) =>
          current.map((message) => (message.id === editId ? result.data[0] : message))
        );
      }
    }
    setLoading(false);
  };

  const deleteMessage = async (id: string) => {
    setLoading(true);
    const response = await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();

    if (!response.ok) {
      setFeedback(result.error ?? "Unable to delete message.");
    } else {
      setFeedback("Message deleted.");
      setMessages((current) => current.filter((message) => message.id !== id));
    }
    setLoading(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setMessageForm((current) => ({ ...current, [field]: value }));
  };

  const handleEditFieldChange = (id: string, field: string, value: string) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, [field]: value } : message
      )
    );
  };

  const handleSectionPayloadChange = (path: string[], value: string) => {
    setSectionEditor((current) => {
      const nextPayload = { ...current.payload };
      let pointer: Record<string, unknown> = nextPayload;

      for (let i = 0; i < path.length - 1; i += 1) {
        const key = path[i];
        if (typeof pointer[key] !== "object" || pointer[key] === null) {
          pointer[key] = {};
        }
        pointer = pointer[key] as Record<string, unknown>;
      }

      pointer[path[path.length - 1]] = value;
      return { ...current, payload: nextPayload };
    });
  };

  const handleSaveSection = async () => {
    setLoading(true);
    const response = await fetch("/api/page-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: sectionEditor.section, payload: sectionEditor.payload }),
    });
    const result = await response.json();

    if (!response.ok) {
      setFeedback(result.error ?? "Unable to save section.");
    } else {
      setFeedback(`Saved ${sectionEditor.section} section.`);
      loadSections();
    }
    setLoading(false);
  };

  const getSectionEditorFields = () => {
    switch (sectionEditor.section) {
      case "about":
        return [
          { label: "Heading", path: ["heading"] },
          { label: "Subheading", path: ["subheading"] },
          { label: "Bio", path: ["bio"], multiline: true },
          { label: "Description", path: ["description"], multiline: true },
          { label: "CTA Text", path: ["ctaText"] },
          { label: "CTA Href", path: ["ctaHref"] },
        ];
      case "skills":
        return [
          { label: "Headline", path: ["headline"] },
          { label: "Description", path: ["description"], multiline: true },
        ];
      case "projects":
        return [
          { label: "Headline", path: ["headline"] },
          { label: "Description", path: ["description"], multiline: true },
          { label: "Button Label", path: ["buttonLabel"] },
          { label: "Button Href", path: ["buttonHref"] },
        ];
      case "contact":
        return [
          { label: "Heading", path: ["heading"] },
          { label: "Subheading", path: ["subheading"], multiline: true },
          { label: "Location", path: ["location"] },
        ];
      default:
        return [];
    }
  };

  const renderSectionEditor = () => {
    const fields = getSectionEditorFields();

    return (
      <div className="space-y-4">
        {fields.map((field) => {
          const value = sectionEditor.payload[field.path[0]] as string | undefined;
          return (
            <label className="block" key={field.label}>
              <span className="text-sm text-slate-400">{field.label}</span>
              {field.multiline ? (
                <textarea
                  value={value ?? ""}
                  rows={4}
                  onChange={(e) => handleSectionPayloadChange(field.path, e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              ) : (
                <input
                  value={value ?? ""}
                  onChange={(e) => handleSectionPayloadChange(field.path, e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              )}
            </label>
          );
        })}
      </div>
    );
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-10 shadow-xl">
          Loading admin auth state...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-3xl border border-slate-800/90 bg-slate-900/90 p-10 shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-extrabold mb-4 text-slate-100">Admin Login</h1>
          <p className="text-sm text-slate-400 mb-8">
            Sign in with the admin account to manage visitor messages and website sections. Only the configured admin email may access this dashboard.
          </p>

          <label className="block mb-4">
            <span className="text-slate-300 text-sm">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <label className="block mb-6">
            <span className="text-slate-300 text-sm">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          {feedback && <p className="text-sm text-rose-300 mb-4">{feedback}</p>}

          <button
            type="button"
            onClick={signIn}
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loading ? "Signing in..." : "Sign in as admin"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">Admin Dashboard</p>
              <h1 className="mt-3 text-4xl font-extrabold text-slate-100">Manage content & visitor messages</h1>
              <p className="mt-2 text-slate-400 max-w-2xl">
                Logged in as <span className="text-indigo-300">{sessionEmail}</span>. Edit homepage sections and visitor messages with live realtime updates.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={loadSections}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Refresh sections
              </button>
            </div>
          </div>

          {feedback && (
            <div className="mt-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
              {feedback}
            </div>
          )}
        </header>

        <section id="section-editor" className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">Website section editor</h2>
              <div className="flex flex-wrap gap-3 mb-6">
                {sectionOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCurrentSection(option.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      currentSection === option.value
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {renderSectionEditor()}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-400">
                  Editing section <span className="text-slate-100 font-semibold">{currentSection}</span>.
                </div>
                <button
                  type="button"
                  onClick={handleSaveSection}
                  disabled={loading}
                  className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {loading ? "Saving..." : "Save section"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">Visitor messages</h2>
              <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6">
                  <p className="text-slate-400 text-sm mb-2">Total messages</p>
                  <p className="text-3xl font-bold text-slate-100">{messages.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6">
                  <p className="text-slate-400 text-sm mb-2">Live editor status</p>
                  <p className="text-slate-100 text-sm">
                    Messages are stored in Supabase and will update the public message feed instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
              <div className="flex items-center justify-between mb-4 gap-3 flex-col sm:flex-row">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-100">Project manager</h2>
                  <p className="text-slate-400 text-sm">Add, edit, or remove projects by category.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["All", "Full Stack Websites", "Design", "Frontend"] as ProjectCategoryFilter[]).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setProjectCategory(category)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        projectCategory === category
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm text-slate-400">Title</span>
                    <input
                      value={projectForm.title}
                      onChange={(e) => handleProjectFieldChange("title", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400">Short description</span>
                    <textarea
                      rows={3}
                      value={projectForm.description}
                      onChange={(e) => handleProjectFieldChange("description", e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400">Full details</span>
                    <textarea
                      rows={4}
                      value={projectForm.fullDetails}
                      onChange={(e) => handleProjectFieldChange("fullDetails", e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400">Category</span>
                    <select
                      value={projectForm.category}
                      onChange={(e) => handleProjectFieldChange("category", e.target.value as ProjectCategory)}
                      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option>Full Stack Websites</option>
                      <option>Design</option>
                      <option>Frontend</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400">Tags (comma separated)</span>
                    <input
                      value={projectForm.tags}
                      onChange={(e) => handleProjectFieldChange("tags", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400">Image path</span>
                    <input
                      value={projectForm.image}
                      onChange={(e) => handleProjectFieldChange("image", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400">Demo URL</span>
                    <input
                      value={projectForm.demoUrl}
                      onChange={(e) => handleProjectFieldChange("demoUrl", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400">GitHub URL</span>
                    <input
                      value={projectForm.githubUrl}
                      onChange={(e) => handleProjectFieldChange("githubUrl", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      checked={projectForm.featured}
                      onChange={(e) => handleProjectFieldChange("featured", e.target.checked)}
                      className="accent-indigo-500"
                    />
                    Mark project as featured
                  </label>
                  <button
                    type="button"
                    onClick={saveProject}
                    disabled={loading}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                  >
                    {loading ? "Saving..." : projectEditId ? "Update project" : "Create project"}
                  </button>
                  {projectEditId && (
                    <button
                      type="button"
                      onClick={resetProjectForm}
                      className="rounded-2xl bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-600"
                    >
                      Cancel edit
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6">
                    <p className="text-slate-400 text-sm mb-2">Projects in {projectCategory}</p>
                    <p className="text-3xl font-bold text-slate-100">{projects.length}</p>
                  </div>
                  <div className="space-y-4">
                    {projects.length === 0 ? (
                      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 text-slate-400">
                        No projects found in this category.
                      </div>
                    ) : (
                      projects.map((project) => (
                        <div
                          key={project.id}
                          className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{project.category}</p>
                              <h3 className="text-xl font-semibold text-slate-100">{project.title}</h3>
                              <p className="text-slate-400 text-sm mt-1">{project.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startProjectEdit(project)}
                                className="rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                              >
                                Edit
                              </button>
                                <a
                                  href={
                                    project.category === "Full Stack Websites"
                                      ? "/projects/full-stack"
                                      : project.category === "Design"
                                      ? "/projects/design"
                                      : "/projects/frontend"
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-2xl bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:bg-slate-600"
                                >
                                  View on site
                                </a>
                              <button
                                type="button"
                                onClick={() => deleteProject(project.id)}
                                className="rounded-2xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-400"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
            <div id="message-management" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-100 mb-4">Create new message</h2>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm text-slate-400">Name</span>
                    <input
                      value={messageForm.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400">Email</span>
                    <input
                      value={messageForm.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400">Message</span>
                    <textarea
                      value={messageForm.content}
                      onChange={(e) => handleFieldChange("content", e.target.value)}
                      rows={4}
                      className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={createMessage}
                    disabled={loading}
                    className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                  >
                    {loading ? "Saving..." : "Create message"}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-100 mb-4">Manage messages</h3>
                {loading && (
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 text-slate-400">
                    Loading messages...
                  </div>
                )}
                {!loading && messages.length === 0 && (
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 text-slate-400">
                    No messages to manage.
                  </div>
                )}
                <div className="space-y-4">
                  {messages.map((message) => {
                    const editing = editId === message.id;
                    return (
                      <div
                        key={message.id}
                        className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5"
                      >
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-sm text-slate-400">Name</span>
                            <input
                              value={message.name}
                              onChange={(event) => handleEditFieldChange(message.id, "name", event.target.value)}
                              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </label>
                          <label className="block">
                            <span className="text-sm text-slate-400">Email</span>
                            <input
                              value={message.email}
                              onChange={(event) => handleEditFieldChange(message.id, "email", event.target.value)}
                              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </label>
                          <label className="block">
                            <span className="text-sm text-slate-400">Message</span>
                            <textarea
                              rows={4}
                              value={message.content}
                              onChange={(event) => handleEditFieldChange(message.id, "content", event.target.value)}
                              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </label>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => setEditId(editing ? null : message.id)}
                              className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                            >
                              {editing ? "Cancel" : "Edit"}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteMessage(message.id)}
                              className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                            >
                              Delete
                            </button>
                            {editing && (
                              <button
                                type="button"
                                onClick={updateMessage}
                                className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                              >
                                Save changes
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
