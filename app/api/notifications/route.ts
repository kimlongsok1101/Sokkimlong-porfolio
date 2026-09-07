import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminClient";
import { getConfiguredAdminEmails } from "../../../lib/adminEmails";

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase admin client not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const type = body.type;
    const title = body.title;
    const description = body.description;
    const projectId = body.projectId ?? body.projectid ?? body.project_id;
    const projectImage = body.projectImage ?? body.projectimage ?? body.project_image;
    const projectCategory = body.projectCategory ?? body.projectcategory ?? body.project_category;

    if (!type || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, description" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const baseRecord: Record<string, unknown> = {
      type,
      title,
      description,
      read: false,
      created_at: timestamp,
    };

    const candidateRecords: Record<string, unknown>[] = [
      {
        ...baseRecord,
        ...(projectId !== undefined ? { projectId } : {}),
        ...(projectImage !== undefined ? { projectImage } : {}),
        ...(projectCategory !== undefined ? { projectCategory } : {}),
      },
      {
        ...baseRecord,
        ...(projectId !== undefined ? { projectid: projectId } : {}),
        ...(projectImage !== undefined ? { projectimage: projectImage } : {}),
        ...(projectCategory !== undefined ? { projectcategory: projectCategory } : {}),
      },
      {
        ...baseRecord,
        ...(projectId !== undefined ? { project_id: projectId } : {}),
        ...(projectImage !== undefined ? { project_image: projectImage } : {}),
        ...(projectCategory !== undefined ? { project_category: projectCategory } : {}),
      },
    ];

    let insertError = null;
    let insertedData = null;

    for (const record of candidateRecords) {
      const result = await supabase.from("notifications").insert([record]).select();
      if (!result.error) {
        insertedData = result.data;
        break;
      }
      insertError = result.error;
    }

    if (!insertedData) {
      return NextResponse.json({ error: insertError?.message ?? "Failed to insert notification" }, { status: 500 });
    }

    return NextResponse.json({ data: insertedData });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase admin client not configured" },
      { status: 500 }
    );
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!accessToken) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  const adminEmails = getConfiguredAdminEmails();
  if (userError || !userData.user?.email || !adminEmails.includes(userData.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === "string") : [];

    let query = supabase.from("notifications").delete();
    if (ids.length > 0) {
      query = query.in("id", ids);
    } else {
      query = query.not("id", "is", null);
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
