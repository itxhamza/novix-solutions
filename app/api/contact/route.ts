import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { firestoreConfigured, saveEnquiry, type Enquiry } from "@/lib/enquiries";

/**
 * Contact form endpoint. No database: each submission is emailed through
 * Resend's HTTP API (https://resend.com). Configure with env vars — see
 * .env.example.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best-effort throttle (per server instance): 5 messages / 10 min / IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 5000);

  // Honeypot field: real visitors never fill it. Pretend it worked.
  if (body.company) return NextResponse.json({ ok: true });

  if (!name || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json({ error: "Please check the form fields." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }

  // Two places for an enquiry to land: Firestore keeps the record, email is
  // how we notice it. Either one succeeding means the visitor was heard, so
  // the form only fails when both do.
  const enquiry: Enquiry = { name, email, message };

  const [saved, emailed] = await Promise.all([
    saveEnquiry(enquiry).catch((err) => {
      console.error("[contact] Firestore write failed", err);
      return null;
    }),
    sendEmail(enquiry),
  ]);

  if (!saved && !emailed) {
    // Both routes out are down. Say which were even set up, so the logs point
    // at the cause rather than at the symptom.
    console.error("[contact] enquiry neither stored nor sent", {
      firestore: firestoreConfigured() ? "configured" : "not configured",
      resend: process.env.RESEND_API_KEY ? "configured" : "not configured",
    });
    return NextResponse.json({ error: "Could not send the message." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** True once the enquiry is emailed — or logged, when dev has nowhere to send it. */
async function sendEmail({ name, email, message }: Enquiry): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  // Defaults to the address shown on the site; CONTACT_TO_EMAIL overrides it.
  const to = process.env.CONTACT_TO_EMAIL || site.contact.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Novix Website <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      // Local development without a key: log instead of sending.
      console.log("\n[contact] (email not configured — logging only)\n", { name, email, message }, "\n");
      return true;
    }
    console.error("[contact] RESEND_API_KEY is not set.");
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `New enquiry from ${name} — ${site.name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escape(name)}<br><strong>Email:</strong> ${escape(email)}</p><p style="white-space:pre-wrap">${escape(message)}</p>`,
    }),
  }).catch((err) => {
    console.error("[contact] Resend request failed", err);
    return null;
  });

  if (!res?.ok) {
    if (res) console.error("[contact] Resend error", res.status, await res.text());
    return false;
  }
  return true;
}
