import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminClient";

const missingClientResponse = NextResponse.json(
  {
    error: "Supabase admin client is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.",
  },
  { status: 500 }
);

function normalizeTags(tags: unknown) {
  if (Array.isArray(tags)) {
    return tags.filter((tag) => typeof tag === "string");
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeProjectRow(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    fullDetails: row.fulldetails ?? null,
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    image: row.image ?? null,
    demoUrl: row.demourl ?? null,
    githubUrl: row.githuburl ?? null,
    featured: Boolean(row.featured),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeProjectRows(rows: any[] | null) {
  if (!rows) return [];
  return rows.map(normalizeProjectRow);
}

export async function GET(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return missingClientResponse;

  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  let query = supabase
    .from("projects")
    .select(
      "id,title,description,fulldetails,category,tags,image,demourl,githuburl,featured,created_at,updated_at"
    )
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: normalizeProjectRows(data) });
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return missingClientResponse;

  const body = await request.json();
  const { title, description, fullDetails, category, tags, image, demoUrl, githubUrl, featured } = body;

  if (!title || !description || !category) {
    return NextResponse.json(
      { error: "Missing required fields: title, description, category." },
      { status: 400 }
    );
  }

  const payload = {
    title,
    description,
    fulldetails: fullDetails ?? null,
    category,
    tags: normalizeTags(tags),
    image: image ?? null,
    demourl: demoUrl ?? null,
    githuburl: githubUrl ?? null,
    featured: Boolean(featured),
  };

  const { data, error } = await supabase
    .from("projects")
    .insert([payload])
    .select("id,title,description,fulldetails,category,tags,image,demourl,githuburl,featured,created_at,updated_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: normalizeProjectRows(data) });
}

export async function PATCH(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return missingClientResponse;

  const body = await request.json();
  const { id, title, description, fullDetails, category, tags, image, demoUrl, githubUrl, featured } = body;

  if (!id || !title || !description || !category) {
    return NextResponse.json(
      { error: "Missing required fields: id, title, description, category." },
      { status: 400 }
    );
  }

  const payload = {
    title,
    description,
    fulldetails: fullDetails ?? null,
    category,
    tags: normalizeTags(tags),
    image: image ?? null,
    demourl: demoUrl ?? null,
    githuburl: githubUrl ?? null,
    featured: Boolean(featured),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select("id,title,description,fulldetails,category,tags,image,demourl,githuburl,featured,created_at,updated_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: normalizeProjectRows(data) });
}

export async function DELETE(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return missingClientResponse;

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing required field: id." }, { status: 400 });
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
