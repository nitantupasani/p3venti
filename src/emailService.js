import { generateDashboardPdfBase64 } from "./DownloadPDF";

// This will use your Render environment variable in production
// and fallback to localhost for local development.
const EMAIL_API_BASE_URL =
  process.env.REACT_APP_EMAIL_API_BASE_URL || "http://localhost:3001"; // Port 3001 for backend

function getTemplate(language = "nl") {
  return EMAIL_TEMPLATES[language] || EMAIL_TEMPLATES.en;
}

// This helper function correctly formats the text body into simple HTML
function buildHtmlBody(textBody = "") {
  return textBody
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

async function sendEmailRequest(payload) {
  const endpoint = `${EMAIL_API_BASE_URL.replace(/\/$/, "")}/send`;

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    throw new Error(`Unable to reach the email service: ${networkError.message}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error(`Invalid response from the email service (status ${response.status})`);
  }

  if (!response.ok || data?.ok === false) {
    const message = data?.error || `Email service responded with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

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

  // *** FIX IS HERE ***
  // The backend expects 'html', not 'body'. We use the helper to create it.
  const payload = {
    to: email,
    subject,
    html: buildHtmlBody(body), // Use the 'html' property
    attachments: [
      {
        filename: attachmentFilename,
        contentType: "application/pdf",
        content: base64,
        encoding: "base64"
      }
    ]
  };

  const response = await sendEmailRequest(payload);

  return { ...payload, response };
}

// Keep the templates at the bottom for readability
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