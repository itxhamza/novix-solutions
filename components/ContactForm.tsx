"use client";

import { useRef, useState } from "react";
import { site } from "@/content/site";

type Status = "idle" | "sending" | "sent" | "error" | "invalid";

type Animations = ReturnType<
  typeof import("@/lib/animations").createSendButton
>;

/** Resolve when `promise` settles, or after `ms`, whichever comes first. */
function settleWithin(promise: Promise<void> | undefined, ms: number) {
  if (!promise) return Promise.resolve();
  return Promise.race([
    promise.catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ]);
}

export function ContactForm() {
  const t = site.contactSection.form;
  const [status, setStatus] = useState<Status>("idle");
  const buttonRef = useRef<HTMLButtonElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    if (!form.checkValidity()) {
      setStatus("invalid");
      form.reportValidity();
      return;
    }

    setStatus("sending");

    // The button → progress bar → check mark morph lives in lib/animations.ts.
    // It is decorative: if the chunk fails to load the message must still send,
    // so this never escapes into the submit path.
    let button: Animations | undefined;
    let pulse: (() => void) | undefined;
    try {
      const anim = await import("@/lib/animations");
      pulse = anim.pulseField;
      if (buttonRef.current) {
        button = anim.createSendButton(buttonRef.current);
        button.start();
      }
    } catch {
      /* no animation — the states below still render */
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));

      // Never let a stalled animation hold the success state hostage.
      await settleWithin(button?.success(), 2000);
      pulse?.();

      setStatus("sent");
      form.reset();
      window.setTimeout(() => {
        button?.reset();
        setStatus((s) => (s === "sent" ? "idle" : s));
      }, 6000);
    } catch {
      button?.reset();
      setStatus("error");
    }
  }

  const message =
    status === "sent" ? t.success : status === "error" ? t.error : status === "invalid" ? t.invalid : "";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <label className="block">
        <span className="mono text-muted">{t.name}</span>
        <input className="field-input" name="name" type="text" required maxLength={120} autoComplete="name" placeholder={t.namePlaceholder} />
      </label>
      <label className="block">
        <span className="mono text-muted">{t.email}</span>
        <input className="field-input" name="email" type="email" required maxLength={200} autoComplete="email" placeholder={t.emailPlaceholder} />
      </label>
      <label className="block">
        <span className="mono text-muted">{t.message}</span>
        <textarea className="field-input resize-y" name="message" required minLength={10} maxLength={5000} rows={4} placeholder={t.messagePlaceholder} />
      </label>
      {/* Honeypot: hidden from people, tempting for bots. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="send-slot">
          <button ref={buttonRef} type="submit" className="send" data-send disabled={status === "sending" || status === "sent"}>
            <span data-send-label>{status === "sending" ? t.sending : t.submit}</span>
            <span className="send-fill" data-send-fill aria-hidden="true" />
            <svg className="send-check" viewBox="0 0 24 24" data-send-check aria-hidden="true">
              <path d="M5 12.5l4.500 4.500L19 7.500" pathLength={1} />
            </svg>
          </button>
        </div>
        <p role="status" aria-live="polite" className={`text-sm ${status === "error" || status === "invalid" ? "text-fault" : "text-accent"}`}>
          {message}
        </p>
      </div>
    </form>
  );
}
