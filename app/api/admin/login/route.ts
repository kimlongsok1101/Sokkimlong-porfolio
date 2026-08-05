import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminClient";
import { createSupabaseClient } from "@/lib/supabaseClient";

type RateLimitEntry = {
  count: number;
  windowStart: number;
  blockedUntil: number | null;
};

type CaptchaChallenge = {
  answer: number;
  expiresAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const captchaStore = new Map<string, CaptchaChallenge>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 5 * 60 * 1000;
const CAPTCHA_AFTER_FAILURES = 3;
const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const DEFAULT_RETRY_AFTER = 5;

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function getDeviceModel(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "unknown device";
  const cleaned = userAgent.replace(/\s+/g, " ").trim();

  const parsed = parseDeviceName(cleaned);
  return parsed || cleaned;
}

function parseDeviceName(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (/iphone/.test(ua)) {
    return "iPhone";
  }

  if (/ipad/.test(ua)) {
    return "iPad";
  }

  if (/ipod/.test(ua)) {
    return "iPod";
  }

  if (/android/.test(ua)) {
    const androidMatch = userAgent.match(/Android [\d.]+;?\s*([^;\)]+)(?:;|\))/i);
    if (androidMatch && androidMatch[1]) {
      return androidMatch[1].trim();
    }
    return "Android device";
  }

  if (/windows nt/.test(ua)) {
    return "Windows desktop";
  }

  if (/macintosh/.test(ua) || /mac os x/.test(ua)) {
    return "Mac desktop";
  }

  if (/linux/.test(ua)) {
    return "Linux desktop";
  }

  const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)/i);
  if (browserMatch && browserMatch[1]) {
    return `${browserMatch[1]} browser`;
  }

  return null;
}

function getRateLimitKey(email: string, ip: string) {
  return `${email || "unknown"}:${ip}`;
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(key) ?? { count: 0, windowStart: now, blockedUntil: null };

  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  if (now - entry.windowStart >= WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
    entry.blockedUntil = null;
  }

  entry.count += 1;

  if (entry.count > MAX_ATTEMPTS) {
    entry.blockedUntil = now + LOCKOUT_MS;
    rateLimitStore.set(key, entry);
    return {
      allowed: false,
      retryAfter: Math.ceil(LOCKOUT_MS / 1000),
    };
  }

  rateLimitStore.set(key, entry);
  return { allowed: true, retryAfter: 0 };
}

function resetRateLimit(key: string) {
  rateLimitStore.set(key, { count: 0, windowStart: Date.now(), blockedUntil: null });
}

function createCaptchaChallenge(key: string) {
  const first = Math.floor(Math.random() * 9) + 1;
  const second = Math.floor(Math.random() * 9) + 1;
  const answer = first + second;
  const challenge = { answer, expiresAt: Date.now() + CAPTCHA_TTL_MS };
  captchaStore.set(key, challenge);
  return {
    question: `What is ${first} + ${second}?`,
    token: `${key}:${Date.now()}`,
    answer,
  };
}

function getCaptchaChallenge(key: string) {
  const challenge = captchaStore.get(key);
  if (!challenge) {
    return null;
  }

  if (Date.now() > challenge.expiresAt) {
    captchaStore.delete(key);
    return null;
  }

  return challenge;
}

function clearCaptchaChallenge(key: string) {
  captchaStore.delete(key);
}

async function getFailureRecord(supabase: ReturnType<typeof createSupabaseAdminClient>, email: string, ip: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("admin_login_blocks")
    .select("email, ip, failure_count, blocked_until, reason")
    .eq("email", email)
    .eq("ip", ip)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

async function upsertFailureRecord(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  email: string,
  ip: string,
  failureCount: number,
  blockedUntil: string | null,
  reason: string | null
) {
  if (!supabase) return;

  await supabase.from("admin_login_blocks").upsert(
    {
      email,
      ip,
      failure_count: failureCount,
      blocked_until: blockedUntil,
      reason,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,ip" }
  );
}

async function clearFailureRecord(supabase: ReturnType<typeof createSupabaseAdminClient>, email: string, ip: string) {
  if (!supabase) return;

  await supabase.from("admin_login_blocks").delete().eq("email", email).eq("ip", ip);
}

async function logAuditAttempt(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  email: string,
  ip: string,
  status: string,
  reason: string,
  details: Record<string, unknown> = {}
) {
  if (!supabase) return;

  await supabase.from("admin_login_audit").insert({
    email,
    ip,
    status,
    reason,
    details,
    created_at: new Date().toISOString(),
  });
}

function createBlockResponse(message: string, retryAfter: number, status = 429, extra: Record<string, unknown> = {}) {
  return NextResponse.json(
    {
      error: message,
      retryAfter,
      ...extra,
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const deviceLocation = typeof body.deviceLocation === "string" ? body.deviceLocation : null;
  const captchaAnswer = typeof body.captchaAnswer === "string" ? Number(body.captchaAnswer) : body.captchaAnswer;
  const captchaToken = typeof body.captchaToken === "string" ? body.captchaToken : "";
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const ip = getClientIp(request);
  const rateLimitKey = getRateLimitKey(email, ip);
  const supabase = createSupabaseAdminClient();
  const canPersist = Boolean(supabase);

  if (!adminEmail) {
    return NextResponse.json({ error: "Admin email is not configured." }, { status: 500 });
  }

  const deviceModel = getDeviceModel(request);
  const baseAuditDetails = { deviceModel, deviceLocation };
  const localRateLimit = checkRateLimit(rateLimitKey);
  if (!localRateLimit.allowed) {
    if (canPersist) {
      await logAuditAttempt(supabase, email, ip, "blocked", "local_rate_limit", {
        ...baseAuditDetails,
        retryAfter: localRateLimit.retryAfter,
      });
    }

    return createBlockResponse("Too many login attempts. Please wait before trying again.", localRateLimit.retryAfter);
  }

  if (!email || email !== adminEmail) {
    if (canPersist) {
      await logAuditAttempt(supabase, email, ip, "blocked", "unauthorized_email", {
        ...baseAuditDetails,
        attemptedEmail: email,
      });
    }

    return createBlockResponse("Invalid admin login request.", DEFAULT_RETRY_AFTER, 403);
  }

  const activeBlock = canPersist ? await getFailureRecord(supabase, email, ip) : null;
  const blockActiveUntil = activeBlock?.blocked_until ? new Date(activeBlock.blocked_until).getTime() : null;
  if (blockActiveUntil && blockActiveUntil > Date.now()) {
    if (canPersist) {
      await logAuditAttempt(supabase, email, ip, "blocked", "persisted_block", {
        ...baseAuditDetails,
        retryAfter: Math.ceil((blockActiveUntil - Date.now()) / 1000),
      });
    }

    return createBlockResponse("Too many login attempts. Please wait before trying again.", Math.ceil((blockActiveUntil - Date.now()) / 1000));
  }

  const storedChallenge = getCaptchaChallenge(rateLimitKey);
  if (storedChallenge) {
    const isValidCaptcha = captchaToken && Number.isFinite(captchaAnswer) && captchaAnswer === storedChallenge.answer;
    if (!isValidCaptcha) {
      if (canPersist) {
        await logAuditAttempt(supabase, email, ip, "failed", "captcha_failed", {
          ...baseAuditDetails,
          captchaToken,
        });
      }

      return createBlockResponse("CAPTCHA verification failed.", DEFAULT_RETRY_AFTER, 401, {
        requireCaptcha: true,
        captchaQuestion: `What is ${Math.floor(Math.random() * 9) + 1} + ${Math.floor(Math.random() * 9) + 1}?`,
      });
    }

    clearCaptchaChallenge(rateLimitKey);
  }

  const authSupabase = createSupabaseClient();
  if (!authSupabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data, error } = await authSupabase.auth.signInWithPassword({ email, password });

  if (error) {
    const previousRecord = canPersist ? await getFailureRecord(supabase, email, ip) : null;
    const failureCount = (previousRecord?.failure_count ?? 0) + 1;

    if (failureCount >= MAX_ATTEMPTS) {
      const blockUntil = new Date(Date.now() + LOCKOUT_MS);
      if (canPersist) {
        await upsertFailureRecord(supabase, email, ip, failureCount, blockUntil.toISOString(), "max_attempts_reached");
        await logAuditAttempt(supabase, email, ip, "blocked", "max_attempts_reached", {
          ...baseAuditDetails,
          failureCount,
        });
      }

      return createBlockResponse("Too many login attempts. Please wait before trying again.", Math.ceil(LOCKOUT_MS / 1000));
    }

    if (failureCount >= CAPTCHA_AFTER_FAILURES) {
      const challenge = createCaptchaChallenge(rateLimitKey);
      if (canPersist) {
        await upsertFailureRecord(supabase, email, ip, failureCount, null, "captcha_required");
        await logAuditAttempt(supabase, email, ip, "failed", "captcha_required", {
          ...baseAuditDetails,
          failureCount,
        });
      }

      return NextResponse.json(
        {
          error: "Too many failed attempts. Complete the CAPTCHA to continue.",
          requireCaptcha: true,
          captchaQuestion: challenge.question,
          captchaToken: challenge.token,
          failureCount,
          retryAfter: DEFAULT_RETRY_AFTER,
        },
        { status: 401 }
      );
    }

    if (canPersist) {
      await upsertFailureRecord(supabase, email, ip, failureCount, null, "failed_login");
      await logAuditAttempt(supabase, email, ip, "failed", "failed_login", {
        ...baseAuditDetails,
        failureCount,
      });
    }

    return NextResponse.json({ error: error.message, retryAfter: DEFAULT_RETRY_AFTER }, { status: 401 });
  }

  if (canPersist) {
    await clearFailureRecord(supabase, email, ip);
    await logAuditAttempt(supabase, email, ip, "success", "successful_login", {
      ...baseAuditDetails,
      email,
    });
  }

  resetRateLimit(rateLimitKey);
  clearCaptchaChallenge(rateLimitKey);

  return NextResponse.json(
    {
      data: {
        email: data.session?.user?.email ?? email,
        session: data.session,
      },
    },
    { status: 200 }
  );
}
