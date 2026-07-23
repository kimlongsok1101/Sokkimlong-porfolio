"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/data/projects";

export function useProjects(category: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const supabase = createSupabaseClient();
    let channel: ReturnType<SupabaseClient["channel"]> | null = null;

    if (!supabase) {
      setError("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = category === "All" ? "/api/projects" : `/api/projects?category=${encodeURIComponent(category)}`;
        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? "Unable to load projects.");
          setProjects([]);
        } else {
          setProjects(result.data ?? []);
        }
      } catch (fetchError) {
        setError((fetchError as Error).message ?? "Unable to load projects.");
        setProjects([]);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    channel = supabase
      .channel(`public:projects:${category}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: category === "All" ? undefined : `category=eq.${category}`,
        },
        async () => {
          await fetchProjects();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [category]);

  return { projects, loading, error };
}
