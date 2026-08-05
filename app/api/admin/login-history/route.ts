import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminClient";

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

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
    deviceLocation: (() => {
      const details = record.details && typeof record.details === "object" ? (record.details as Record<string, any>) : null;
      if (details && "deviceLocation" in details) {
        const dl = details.deviceLocation;
        // If the deviceLocation is already a string (e.g., "123 Main St" or "lat,lng"), return it directly
        if (typeof dl === "string") return dl;
        // If it's an object with lat/lng or latitude/longitude fields, format as "lat,lng"
        if (dl && typeof dl === "object") {
          const lat = dl.lat ?? dl.latitude ?? dl.latitude_deg ?? dl.lat_deg;
          const lng = dl.lng ?? dl.longitude ?? dl.longitude_deg ?? dl.lng_deg;
          if ((lat !== undefined && lat !== null) && (lng !== undefined && lng !== null)) {
            return `${lat},${lng}`;
          }
        }
        // Fallback to JSON string if possible
        try {
          return JSON.stringify(dl);
        } catch {
          return String(dl);
        }
      }
      return "Unknown location";
    })(),
    created_at: record.created_at,
  }));

  return NextResponse.json({ data: records }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const supabase = createSupabaseAdminClient();

  if (!adminEmail) {
    return NextResponse.json({ error: "Admin email is not configured." }, { status: 500 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const status = typeof body.status === "string" ? body.status : "unknown";
  const reason = typeof body.reason === "string" ? body.reason : "client_record";
  const details = typeof body.details === "object" && body.details !== null ? body.details : {};

  // Only allow recording for the configured admin email
  if (!email || email !== adminEmail) {
    return NextResponse.json({ error: "Unauthorized: email mismatch." }, { status: 403 });
  }

  const ip = getClientIp(request) ?? "unknown";

  const { error } = await supabase.from("admin_login_audit").insert({
    email,
    ip,
    status,
    reason,
    details,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
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
