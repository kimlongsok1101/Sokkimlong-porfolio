import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminClient";

const SECTION_TABLE = "page_sections";

function createResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return createResponse({ error: "Supabase admin client is not configured." }, 500);
  }

  const { data, error } = await supabase
    .from(SECTION_TABLE)
    .select("section, payload")
    .order("section", { ascending: true });

  if (error) {
    return createResponse({ error: error.message }, 500);
  }

  return createResponse({ data });
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return createResponse({ error: "Supabase admin client is not configured." }, 500);
  }

  const body = await request.json();
  const { section, payload } = body;

  if (!section || !payload) {
    return createResponse({ error: "Missing section or payload." }, 400);
  }

  const { data, error } = await supabase
    .from(SECTION_TABLE)
    .upsert({ section, payload }, { onConflict: "section" })
    .select();

  if (error) {
    return createResponse({ error: error.message }, 500);
  }

  return createResponse({ data });
}
