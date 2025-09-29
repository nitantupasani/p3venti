import { generateDashboardPdfBase64 } from "./DownloadPDF";

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

async function fakeEmailApiCall(payload) {
  // Simulate latency for the dummy API call.
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.info("Dummy email API call executed", payload);
  return { ok: true };
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

  const payload = {
    to: email,
    subject,
    body,
    attachments: [
      {
        filename: attachmentFilename,
        contentType: "application/pdf",
        content: base64
      }
    ]
  };

  await fakeEmailApiCall(payload);

  return payload;
}