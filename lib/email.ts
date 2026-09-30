import "server-only";

import nodemailer from "nodemailer";
import type { CleaningRequest } from "@/lib/schema";

function isPlaceholder(value: string | undefined) {
  if (!value) return true;
  return value.includes("replace-me");
}

function gmailUser() {
  return process.env.GMAIL_USER?.trim() ?? "";
}

function gmailAppPassword() {
  return (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s/g, "");
}

function isConfigured() {
  const user = gmailUser();
  const password = gmailAppPassword();
  return (
    user.includes("@") &&
    !isPlaceholder(user) &&
    password.length >= 16 &&
    !isPlaceholder(password)
  );
}

function fromAddress() {
  const name = process.env.GMAIL_FROM_NAME?.trim() || "Lather Bros";
  return `${name} <${gmailUser()}>`;
}

function teamRecipients() {
  const configured = process.env.GMAIL_TO?.trim();
  const list = (configured && !isPlaceholder(configured)
    ? configured
    : gmailUser()
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return list;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function extras(request: CleaningRequest) {
  const items = [
    request.stairs ? "Internal stairs" : null,
    request.balcony ? "Balcony" : null,
    request.utility ? "Utility room" : null,
  ].filter((item): item is string => Boolean(item));
  return items.length ? items.join(", ") : "None";
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #e5e5ea;color:#6e6e73;font-size:13px;width:42%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #e5e5ea;color:#1d1d1f;font-size:14px;vertical-align:top;">${escapeHtml(value)}</td>
  </tr>`;
}

function layout(title: string, intro: string, body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f6f6;color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e5ea;border-radius:22px;overflow:hidden;">
      <tr>
        <td style="background:#0f6f6a;padding:28px 28px 24px;">
          <p style="margin:0;color:#c6a15b;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;">Lather Bros</p>
          <h1 style="margin:10px 0 0;color:#ffffff;font-size:28px;font-weight:600;letter-spacing:-0.03em;">${escapeHtml(title)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          <p style="margin:0 0 22px;color:#6e6e73;font-size:15px;line-height:1.55;">${escapeHtml(intro)}</p>
          ${body}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function detailsTable(request: CleaningRequest, reference: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${row("Reference", reference)}
    ${row("Service", request.service)}
    ${row("Address", request.address)}
    ${row("Property type", request.property_type)}
    ${row("Bedrooms", request.bedrooms)}
    ${row("Bathrooms / WCs", request.bathrooms)}
    ${row("Floors", request.floors)}
    ${row("Also include", extras(request))}
    ${row("Condition", request.condition)}
    ${row("Pets", request.pets)}
    ${row("Parking / access", request.access)}
    ${row("Preferred visit time", request.time)}
    ${row("Preferred date", formatDate(request.date))}
    ${row("Name", `${request.first_name} ${request.last_name}`)}
    ${row("Mobile", request.phone)}
    ${row("Email", request.email || "Not provided")}
    ${row("How they heard about us", request.source)}
    ${row("Notes", request.notes?.trim() || "None")}
  </table>`;
}

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser(),
      pass: gmailAppPassword(),
    },
  });
}

export async function sendRequestEmails(
  request: CleaningRequest,
  reference: string,
) {
  if (!isConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Gmail is not configured yet. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local.",
      );
    }
    return;
  }

  const transport = createTransport();
  const from = fromAddress();
  const fullName = `${request.first_name} ${request.last_name}`.trim();

  const jobs: Promise<unknown>[] = [
    transport.sendMail({
      from,
      to: teamRecipients(),
      replyTo: request.email || undefined,
      subject: `New cleaning request — ${reference}`,
      html: layout(
        "New cleaning request.",
        `${fullName} submitted a cleaning enquiry. Reply to this email to contact them, or call ${request.phone}.`,
        detailsTable(request, reference),
      ),
    }),
    transport.sendMail({
      from,
      to: request.email,
      replyTo: gmailUser(),
      subject: `Thank you for your cleaning request — ${reference}`,
      text: [
        `Hi ${request.first_name},`,
        "",
        "Thank you for registering your cleaning request with Lather Bros.",
        "We’ll get back to you shortly to confirm the details, price and appointment.",
        "",
        `Reference: ${reference}`,
        `Service: ${request.service}`,
        `Address: ${request.address}`,
        `Preferred date: ${formatDate(request.date)}`,
        `Preferred time: ${request.time}`,
        "",
        "There’s nothing you need to do now. If anything looks wrong, just reply to this email.",
        "",
        "Lather Bros",
      ].join("\n"),
      html: layout(
        "Thank you.",
        `Hi ${request.first_name}, thank you for registering your cleaning request with Lather Bros. We’ll get back to you shortly to confirm the details, price and appointment.`,
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row("Reference", reference)}
          ${row("Service", request.service)}
          ${row("Address", request.address)}
          ${row("Preferred date", formatDate(request.date))}
          ${row("Preferred visit time", request.time)}
        </table>
        <p style="margin:22px 0 0;color:#6e6e73;font-size:15px;line-height:1.55;">There’s nothing you need to do now. Our team will be in touch. If anything in this summary looks wrong, reply to this email and we will put it right.</p>`,
      ),
    }),
  ];

  const results = await Promise.allSettled(jobs);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Failed to send request email", result.reason);
    }
  }
}
