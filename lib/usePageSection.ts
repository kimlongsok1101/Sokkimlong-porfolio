"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

type PageSectionPayload = Record<string, unknown>;

export function usePageSection(section: string, defaultPayload: PageSectionPayload) {
  const [payload, setPayload] = useState<PageSectionPayload>(defaultPayload);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchSection = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("page_sections")
        .select("payload")
        .eq("section", section)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (data?.payload) {
        setPayload(data.payload as PageSectionPayload);
      } else {
        setPayload(defaultPayload);
      }
      setLoading(false);
    };

    fetchSection();

    channel = supabase
      .channel(`public:page_sections:${section}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "page_sections",
          filter: `section=eq.${section}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setPayload(defaultPayload);
            return;
          }

          if (payload.new?.payload) {
            setPayload(payload.new.payload as PageSectionPayload);
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [section, defaultPayload]);

  return { payload, loading, error };
}
