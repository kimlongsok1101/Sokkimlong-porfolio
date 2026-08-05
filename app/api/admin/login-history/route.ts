import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminClient";

export async function GET() {
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const supabase = createSupabaseAdminClient();

  if (!adminEmail) {
    return NextResponse.json({ error: "Admin email is not configured." }, { status: 500 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("admin_login_audit")
    .select("id, email, ip, status, details, created_at")
    .eq("email", adminEmail)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const records = (data ?? []).map((record) => ({
    id: record.id,
    email: record.email,
    ip: record.ip,
    status: record.status,
    deviceModel:
      record.details && typeof record.details === "object" && "deviceModel" in record.details
        ? String((record.details as Record<string, unknown>).deviceModel)
        : "Unknown device",
    deviceLocation:
      record.details && typeof record.details === "object" && "deviceLocation" in record.details
        ? String((record.details as Record<string, unknown>).deviceLocation)
        : record.ip ?? "Unknown location",
    created_at: record.created_at,
  }));

  return NextResponse.json({ data: records }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const supabase = createSupabaseAdminClient();

  if (!adminEmail) {
    return NextResponse.json({ error: "Admin email is not configured." }, { status: 500 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ error: "Missing required field: id." }, { status: 400 });
  }

  const { error } = await supabase.from("admin_login_audit").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
