import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminClient";

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
