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

async function sendTelegramAlert(name: string, email: string, content: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatTarget = [
    process.env.TELEGRAM_CHAT_ID,
    process.env.TELEGRAM_CHANNEL_ID,
    process.env.TELEGRAM_CHANNEL_USERNAME,
    process.env.TELEGRAM_CHANNEL,
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim())[0];
  const topicId = (process.env.TELEGRAM_TOPIC_ID || process.env.TELEGRAM_MESSAGE_THREAD_ID || "").trim();

  if (!botToken || !chatTarget) {
    console.warn("Telegram alert skipped because the bot token or chat target is not configured.");
    return;
  }

  const normalizeText = (value: string) => value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();

  const text = [
    "📨 New portfolio contact message",
    `👤 Name: ${normalizeText(name)}`,
    `📧 Email: ${normalizeText(email)}`,
    "",
    `💬 Message:\n${normalizeText(content)}`,
  ].join("\n");

  const payload: Record<string, unknown> = {
    chat_id: chatTarget,
    text,
    disable_web_page_preview: true,
  };

  if (topicId) {
    payload.message_thread_id = Number.parseInt(topicId, 10);
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) {
      console.error("Telegram alert failed", {
        status: response.status,
        description: result?.description ?? response.statusText,
      });
    }
  } catch (error) {
    console.error("Telegram alert failed", error);
  }
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

  await sendTelegramAlert(name, email, content);

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
