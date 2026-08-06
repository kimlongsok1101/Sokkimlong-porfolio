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

const blockedWords = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "nigger",
  "nigga",
  "faggot",
  "slut",
  "whore",
  "dick",
  "penis",
  "pussy",
  "porn",
  "pornhub",
  "porno",
  "xxx",
  "sex",
  "adult",
  "18+",
  "18 plus",
  "nsfw",
  "motherfucker",
  "fucking",
  "fucker",
  "douche",
  "crap",
  "tits",
  "boobs",
  "cum",
  "anal",
  "gayporn",
  "hardcore",
  "orgy",
  "suck",
  "sucked",
  "blowjob",
];

const containsBlockedWord = (text: string) => {
  const normalized = text.toLowerCase();
  return blockedWords.some((word) => {
    const escapedWord = word.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    return new RegExp(`\\b${escapedWord}\\b`, "i").test(normalized);
  });
};

const MAX_CONTACT_ATTEMPTS = 3;
const CONTACT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const CONTACT_LOCKOUT_MS = 60 * 1000; // 60 seconds

function getClientIp(request: Request) {
  const headerKeys = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "true-client-ip",
    "fastly-client-ip",
    "x-client-ip",
    "x-cluster-client-ip",
    "forwarded",
  ];

  for (const key of headerKeys) {
    const value = request.headers.get(key);
    if (!value) continue;

    if (key === "forwarded") {
      const match = value.match(/for=([^;,+]+)/i);
      if (match) {
        return match[1].trim();
      }
    }

    return value.split(",")[0]?.trim() ?? "unknown";
  }

  return "unknown";
}

let cachedMessagesHaveIpColumn: boolean | null = null;

async function hasMessagesIpColumn(supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>) {
  if (cachedMessagesHaveIpColumn !== null) {
    return cachedMessagesHaveIpColumn;
  }

  const { error } = await supabase.from("messages").select("ip", { head: true }).limit(1);
  if (error) {
    if (/Could not find the 'ip' column/i.test(error.message)) {
      cachedMessagesHaveIpColumn = false;
      return false;
    }

    console.warn("Unable to determine whether messages.ip exists:", error.message);
    cachedMessagesHaveIpColumn = false;
    return false;
  }

  cachedMessagesHaveIpColumn = true;
  return true;
}

async function checkContactRateLimit(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  ip: string,
  email: string,
) {
  const now = Date.now();
  const windowStart = new Date(now - CONTACT_WINDOW_MS).toISOString();
  const hasIpColumn = await hasMessagesIpColumn(supabase);
  const useIpRateLimit = hasIpColumn && ip && ip.toLowerCase() !== "unknown";

  const countQuery = supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .gte("created_at", windowStart);

  if (useIpRateLimit) {
    countQuery.eq("ip", ip);
  } else {
    countQuery.eq("email", email);
  }

  const { count, error: countError } = await countQuery;
  if (countError) {
    console.warn("Contact rate limit check failed", countError.message);
    return { allowed: true, retryAfter: 0 };
  }

  const recentCount = count ?? 0;
  if (recentCount < MAX_CONTACT_ATTEMPTS) {
    return { allowed: true, retryAfter: 0 };
  }

  const latestQuery = supabase
    .from("messages")
    .select("created_at")
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false })
    .limit(1);

  if (useIpRateLimit) {
    latestQuery.eq("ip", ip);
  } else {
    latestQuery.eq("email", email);
  }

  const latestResult = await latestQuery.maybeSingle();

  if (latestResult.error) {
    console.warn("Contact rate limit latest timestamp check failed", latestResult.error.message);
    return { allowed: true, retryAfter: 0 };
  }

  const lastCreatedAt = latestResult.data?.created_at ? new Date(latestResult.data.created_at).getTime() : null;
  if (!lastCreatedAt) {
    return { allowed: true, retryAfter: 0 };
  }

  const retryAfterSeconds = Math.max(0, Math.ceil((lastCreatedAt + CONTACT_LOCKOUT_MS - now) / 1000));
  if (retryAfterSeconds > 0) {
    return { allowed: false, retryAfter: retryAfterSeconds };
  }

  return { allowed: true, retryAfter: 0 };
}

const containsBlockedLink = (text: string) => {
  return /(https?:\/\/|www\.|<\s*a\b|mailto:|\.[a-z]{2,}\b)(\/|$|\s)/i.test(text);
};

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
    "New portfolio contact message",
    `Name: ${normalizeText(name)}`,
    `Email: ${normalizeText(email)}`,
    "",
    `Message:\n${normalizeText(content)}`,
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
  const ip = getClientIp(request);
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!name || !email || !content) {
    return NextResponse.json({ error: "Missing required fields: name, email, content." }, { status: 400 });
  }

  const rateLimitResult = await checkContactRateLimit(supabase, ip, normalizedEmail);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many contact requests. Please wait before sending another message.",
        retryAfter: rateLimitResult.retryAfter,
      },
      { status: 429 },
    );
  }

  if (containsBlockedWord(name) || containsBlockedWord(content)) {
    return NextResponse.json(
      { error: "Messages cannot contain offensive language." },
      { status: 400 },
    );
  }

  if (containsBlockedLink(content)) {
    return NextResponse.json({ error: "Messages cannot contain links." }, { status: 400 });
  }

  const hasIpColumn = await hasMessagesIpColumn(supabase);
  const messagePayload: { name: string; email: string; content: string; ip?: string } = {
    name,
    email,
    content,
  };

  if (hasIpColumn && ip && ip.toLowerCase() !== "unknown") {
    messagePayload.ip = ip;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert([messagePayload])
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
