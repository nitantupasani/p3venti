import { generateDashboardPdfBase64 } from "./DownloadPDF";


const EMAIL_API_BASE_URL = "https://smtpp3venti.netlify.app/.netlify/functions/send";
const INTERNAL_REPORT_EMAIL = "nitantupasani@gmail.com";
/** ----------------------------------------------------------------
 * Email templates
 * ---------------------------------------------------------------- */
const EMAIL_TEMPLATES = {
  nl: {
    subject: "Uw PARAAT-scan samenvatting",
    body: [
      "Beste,",
      "Bedankt voor het invullen van de PARAAT-scan. We hebben een samenvatting gemaakt van de uitkomsten. U vindt deze in de bijlage van deze e-mail.",
      "U kunt de PARAAT-scan vaker invullen en de resultaten opslaan. Dit is handig als u bijvoorbeeld meerdere woonkamers wilt bekijken.",
      "Met vriendelijke groet,",
      "Het P3Venti team"
    ].join("\n\n")
  },
  en: {
    subject: "Your PARAAT scan summary",
    body: [
      "Dear,",
      "Thank you for completing the PARAAT scan. Based on your answers, we have created a summary. You can find it in the attachment of this email.",
      "You can fill in the PARAAT-scan more than once and download the results. This is useful if you want to look at different living rooms.",
      "Kind regards,",
      "The P3Venti team"
    ].join("\n\n")
  }
};

function getTemplate(language = "nl") {
  return EMAIL_TEMPLATES[language] || EMAIL_TEMPLATES.en;
}

function buildHtmlBody(textBody = "") {
  return textBody
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

/** ----------------------------------------------------------------
 * Robust base URL (CRA + Vite), localhost only as last resort
 * ---------------------------------------------------------------- */
// const EMAIL_API_BASE_URL =
//   (typeof process !== "undefined" && process.env?.REACT_APP_EMAIL_API_BASE_URL) ||
//   (typeof import.meta !== "undefined" && import.meta.env?.VITE_EMAIL_API_BASE_URL) ||
//   "https://smtpp3venti.netlify.app/";

function isMixedContent(url) {
  try {
    const u = new URL(url);
    return window.location.protocol === "https:" && u.protocol === "http:";
  } catch {
    return false;
  }
}

async function sendEmailRequest(payload) {
  const base = EMAIL_API_BASE_URL.replace(/\/$/, "");
  const endpoint = `${base}/send`;

if (isMixedContent(endpoint)) {
  throw new Error(
    `Mixed content: page is HTTPS but API is HTTP (${endpoint}). Use HTTPS for the API.`
  );
}

  async function tryOnce(abortMs) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort("timeout"), abortMs);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ac.signal
      });
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : { ok: res.ok, raw: await res.text() };
      if (!res.ok || data?.ok === false) {
        const msg = data?.error || `Email service responded with status ${res.status}`;
        throw new Error(msg);
      }
      return data;
    } catch (e) {
      const msg = e?.message || e?.name || String(e);
      throw new Error(msg);
    } finally {
      clearTimeout(t);
    }
  }

  // 1st try: 15s (fast path), then 2 retries if needed (Render cold start)
  const timeouts = [15000, 25000, 35000];
  let lastErr;
  for (let i = 0; i < timeouts.length; i++) {
    try {
      if (i) await new Promise(r => setTimeout(r, i === 1 ? 1200 : 2500)); // backoff
      return await tryOnce(timeouts[i]);
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`Unable to reach the email service: ${lastErr?.message || "timeout"}`);
}


/** ----------------------------------------------------------------
 * Public API
 * ---------------------------------------------------------------- */
export async function sendDashboardSummaryEmail({
  email,
  language = "nl",
  filename = "PARAAT_dashboard.pdf",
  ...pdfParams
}) {
  if (!email) {
    throw new Error("Email address is required");
  }

  const { subject, body } = getTemplate(language);
  const { base64, filename: resolvedFilename } = await generateDashboardPdfBase64({
    language,
    filename,
    ...pdfParams
  });

  const attachmentFilename = resolvedFilename || filename;

  // Send BOTH text and html — works with typical nodemailer handlers
  const textBody = body;
  const htmlBody = buildHtmlBody(body);

  const payload = {
    to: email,
    subject,
    text: textBody,
    html: htmlBody,
    attachments: [
      {
        filename: attachmentFilename,
        contentType: "application/pdf",
        content: base64,
        encoding: "base64"
      }
    ]
  };

  
  const adminTextBody = `${body}\n\nUser email: ${email}`;
  const adminHtmlBody = buildHtmlBody(adminTextBody);

  const adminPayload = {
    to: INTERNAL_REPORT_EMAIL,
    subject,
    text: adminTextBody,
    html: adminHtmlBody,
    attachments: payload.attachments
  };
  
  const response = await sendEmailRequest(payload);
  const adminResponse = await sendEmailRequest(adminPayload);
  
  return { ...payload, response, adminResponse };
}