import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminClient";

const missingClientResponse = NextResponse.json(
  { error: "Supabase admin client is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server." },
  { status: 500 }
);

export async function GET() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return missingClientResponse;

  const { data, error } = await supabase
    .from("messages")
    .select("id, name, email, content, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return missingClientResponse;

  const body = await request.json();
  const { name, email, content } = body;

  if (!name || !email || !content) {
    return NextResponse.json({ error: "Missing required fields: name, email, content." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert([{ name, email, content }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return missingClientResponse;

  const body = await request.json();
  const { id, name, email, content } = body;

  if (!id || !name || !email || !content) {
    return NextResponse.json({ error: "Missing required fields: id, name, email, content." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .update({ name, email, content })
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return missingClientResponse;

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing required field: id." }, { status: 400 });
  }

  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
