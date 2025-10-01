// DownloadPDF.js
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { topRecommendationsData } from "./recommendations";

const tueLogoDataUrl = "/tue.png";
const tnoLogoDataUrl = "/tno.png";

/**
 * Build Top 5 recommendations based on the same priority logic used on the Dashboard.
 */
function computeTop5Recommendations(language, userAnswers) {
  const PRIORITY_ARRAY = [
    "q14", "q12", "q15", "q8", "q4", "q11", "q1", "q3", "q10",
    "q9", "q20", "q5", "q18", "q16", "q19", "q6", "q7",
    "q13", "q21", "q17", "q2"
  ];
  const removeOnZero = ["q4", "q8", "q14", "q15", "q18", "q19", "q21"];

  const queue = PRIORITY_ARRAY.filter((qid) => {
    const a = userAnswers?.[qid];
    if (qid === "q12" && a === 1) return false;
    if (removeOnZero.includes(qid) && a === 0) return false;
    return true;
  });

  const ids = queue.slice(0, 5);
  return ids
    .map((qid) => topRecommendationsData?.[language]?.[qid])
    .filter(Boolean);
}

/** Fancy semicircle dial for PARAAT score */
const buildFancyParaatDialHTML = (score, label, uid) => {
  const v = Math.max(0, Math.min(100, Math.round(score || 0)));
  const gradId = `grad-${uid}`;
  const arcLen = 125.6637; // length of semicircle path
  const progressLen = (v / 100) * arcLen;
  const strokeDashoffset = arcLen - progressLen;

  return `
    <div class="dial-container">
      <svg viewBox="0 0 100 60" class="dial-svg">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="50%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#22c55e" />
          </linearGradient>
        </defs>
        <path d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none" stroke="url(#${gradId})"
              stroke-width="12" stroke-linecap="round" opacity="0.3" />
        <path d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none" stroke="url(#${gradId})"
              stroke-width="12" stroke-linecap="round"
              style="stroke-dasharray: ${arcLen} ${arcLen};
                     stroke-dashoffset: ${strokeDashoffset};" />
        <text x="50" y="40" text-anchor="middle"
              dominant-baseline="middle"
              font-size="16" font-weight="800"
              class="dial-text">${v}</text>
      </svg>
      <div class="dial-label">${label}</div>
    </div>
  `;
};

/** Reliability bar with gradient fill */
const buildReliabilityScoreBarHTML = (score, label) => {
  const v = Math.max(0, Math.min(100, Math.round(score || 0)));
  const getScoreColor = (value) =>
    value < 33 ? "#ef4444" : value < 66 ? "#f59e0b" : "#22c55e";
  const scoreColor = getScoreColor(v);
  const gradient = "linear-gradient(to right, #ef4444, #f59e0b, #22c55e)";

  return `
    <div class="bar-container">
      <div class="bar-header">
        <h3 class="bar-label">${label}</h3>
        <span class="bar-score" style="color: ${scoreColor};">${v}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-progress-wrapper" style="width: ${v}%; ">
          <div class="bar-progress" style="background: ${gradient};"></div>
        </div>
      </div>
    </div>
  `;
};

/** Build printable HTML */
function buildPrintableHTML({
  language,
  content,
  userAnswers,
  overallParaatScore,
  overallReliabilityScore,
  analysisData
}) {
  const top5 = computeTop5Recommendations(language, userAnswers);

  // Cards
  const cardBlocks = [];
  for (let i = 1; i <= 10; i++) {
    const title = content[`card${i}Title`];
    const back = content[`card${i}Back`];
    if (title || back) {
      cardBlocks.push(`
        <div class="card">
          <div class="card-title">${title ?? ""}</div>
          <div class="card-back">${back ?? ""}</div>
        </div>
      `);
    }
  }

  // Analysis rows — mark every section except the last with .page-break
  const analysisRows = (analysisData || [])
  .map((row, index) => {
    const recs = (row.recommendations || [])
      .filter(r => r.some(cell => cell && cell.trim() !== '')) // Filter out empty rows
      .map(
        (r) => `
          <tr>
            <td>${r[0] || ""}</td>
            <td>${r[1] || ""}</td>
            <td>${r[2] || ""}</td>
          </tr>
        `
      )
      .join("");

      const pageBreakClass = "page-break";

      return `
      <section class="section ${pageBreakClass}">
        <div class="section-header">
          <h3>${row.title || ""}</h3>
          <div class="scores-inline">
            ${buildFancyParaatDialHTML(
              row.paraatScore,
              content.paraatScore,
              `row-${index}`
            )}
            ${buildReliabilityScoreBarHTML(
              row.reliabilityScore,
              content.reliabilityScore
            )}
          </div>
        </div>
        ${
          recs
            ? `<table class="recs-table">
                <thead>
                  <tr>
                    <th>${content.recHeaderQuick}</th>
                    <th>${content.recHeaderInvestment}</th>
                    <th>${content.recHeaderInformation}</th>
                  </tr>
                </thead>
                <tbody>${recs}</tbody>
              </table>`
            : `<div class="muted">${content.noRecommendations}</div>`
        }
      </section>
    `;
  })
  .join("");

  const css = `
    <style>
      * { box-sizing: border-box; }
      body { font-family: Inter, Arial, sans-serif; color: #0f172a; margin: 0; }
      .print-root { padding: 24px; width: 1000px; background: #ffffff; }
      h1 { font-size: 28px; margin: 0 0 6px 0; color: #4f46e5; }
      h2 { font-size: 22px; margin: 24px 0 10px 0; color: #0f172a; }
      h3 { font-size: 18px; margin: 0; }
      .muted { color: #64748b; font-size: 14px; }
      .header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
      .sub { color: #64748b; margin-bottom: 20px; }
      .score-strip { display: flex; gap: 16px; margin: 24px 0; flex-wrap: wrap; justify-content: center; align-items: center; }
      .section { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; background: #fff; }
      .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 16px; }
      .scores-inline { display: flex; align-items: center; gap: 24px; }
      .cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; background: #fafafa; }
      .card-title { font-weight: 700; margin-bottom: 6px; }
      .card-back { color: #334155; font-size: 14px; line-height: 1.4; }
      .top-list { padding-left: 18px; margin: 8px 0 0 0; }
      .recs-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 14px; }
      .recs-table th, .recs-table td { border: 1px solid #e2e8f0; padding: 8px; vertical-align: top; text-align: left; }

      /* Note: this class is *only* used to find breakpoints; actual breaking is done in JS slicing. */
      .page-break { page-break-after: always; }

      .dial-container { display: flex; flex-direction: column; align-items: center; }
      .dial-svg { width: 160px; height: auto; }
      .dial-text { fill: #1e293b; }
      .dial-label { margin-top: 8px; font-size: 14px; font-weight: 600; color: #1e293b; text-align: center; }
      .bar-container { width: 240px; }
      .bar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .bar-label { font-size: 14px; font-weight: 600; color: #334155; }
      .bar-score { font-size: 16px; font-weight: 700; }
      .bar-track { position: relative; width: 100%; height: 16px; border-radius: 9999px; overflow: hidden; background-color: rgba(0,0,0,0.05); }
      .bar-progress-wrapper { height: 100%; border-radius: 9999px; overflow: hidden; }
      .bar-progress { height: 100%; border-radius: 9999px; }
    </style>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" />${css}</head>
      <body>
        <div class="print-root" id="print-root">
          <div class="header">
            <img src="/p3venti.png" alt="P3Venti" style="height:40px"/>
            <h1>Pandemic Readiness Assessment & Action Tool (PARAAT)</h1>
          </div>
          <div class="sub">${content.pageSubtitle}</div>

          <div class="score-strip">
            ${buildFancyParaatDialHTML(overallParaatScore, content.paraatScore, "overall")}
            ${buildReliabilityScoreBarHTML(overallReliabilityScore, content.reliabilityScore)}
          </div>

          <h2>${content.topRecommendationsTitle}</h2>
          ${
            top5.length
              ? `<ol class="top-list">${top5.map((t) => `<li>${t}</li>`).join("")}</ol>`
              : `<div class="muted">${content.noRecommendations}</div>`
          }

          <div class="hr"></div>
          <h2>${content.analysisTitle}</h2>
          ${analysisRows}

          <h2>${content.cardsTitle}</h2>
          <div class="cards">${cardBlocks.join("")}</div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Slice a large canvas into multiple A4 pages, honoring custom breakpoints.
 * @param {jsPDF} pdf
 * @param {HTMLCanvasElement} canvas - full rendered canvas
 * @param {number[]} breakPositionsPx - y positions in canvas pixels to break AFTER
 */
async function addCanvasAsMultipagePDF(pdf, canvas, breakPositionsPx = []) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;
  const mmPerPx = pageWidth / imgWidthPx;

  // Filter breakpoints so none equal bottom
  const sortedBreaks = (breakPositionsPx || [])
    .filter((y) => y > 0 && y < imgHeightPx - 5)
    .sort((a, b) => a - b);

  const stops = [0, ...sortedBreaks, imgHeightPx];

  for (let i = 0; i < stops.length - 1; i++) {
    const y0 = stops[i];
    const y1 = stops[i + 1];
    const sliceHeight = y1 - y0;

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = imgWidthPx;
    pageCanvas.height = sliceHeight;

    const ctx = pageCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, y0, imgWidthPx, sliceHeight, 0, 0, imgWidthPx, sliceHeight);

    const imgData = pageCanvas.toDataURL("image/png");
    if (i !== 0) pdf.addPage();
    // Keep width fit; height is proportional
    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, sliceHeight * mmPerPx);

    if (i > 0) {
      const logoMargin = 10; // mm from page edges
      const logoGap = 5;     // mm gap between logos

      const tueLogoH = 18;
      const tnoLogoH = 12;
      const tueLogoW = 1.8 * tueLogoH;
      const tnoLogoW = 1.2 * tnoLogoH;

      const logoBandH = Math.max(tueLogoH, tnoLogoH);
      const bandTopY = pageHeight - logoMargin - logoBandH;

      const tnoX = pageWidth - logoMargin - tnoLogoW;
      const tnoY = bandTopY + (logoBandH - tnoLogoH) / 2;

      const tueX = tnoX - logoGap - tueLogoW;
      const tueY = bandTopY + (logoBandH - tueLogoH) / 2;

      pdf.addImage(tnoLogoDataUrl, "PNG", tnoX, tnoY, tnoLogoW, tnoLogoH);
      pdf.addImage(tueLogoDataUrl, "PNG", tueX, tueY, tueLogoW, tueLogoH);
    }

    
    
  }
}

/** Public API */
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

async function createDashboardPdf({
  language = "nl",
  content,
  userAnswers,
  overallParaatScore = 0,
  overallReliabilityScore = 0,
  analysisData = []
} = {}) {
  // Create an offscreen container to render the printable HTML
  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.left = "-10000px";
  holder.style.top = "0";
  holder.style.width = "1000px"; // match .print-root width
  holder.style.zIndex = "-1";
  document.body.appendChild(holder);

  holder.innerHTML = buildPrintableHTML({
    language,
    content,
    userAnswers,
    overallParaatScore,
    overallReliabilityScore,
    analysisData
  });

  const printRoot = holder.querySelector("#print-root");

  try {
    // 1) Find DOM breakpoints at the *bottom* of each .page-break section
    const breakEls = Array.from(printRoot.querySelectorAll(".page-break"));
    const rootTop = printRoot.getBoundingClientRect().top + window.scrollY;
    const domBreakYs = breakEls.map((el) => {
      const rect = el.getBoundingClientRect();
      const bottom = rect.bottom + window.scrollY; // absolute bottom in page coords
      const yInRoot = bottom - rootTop;            // relative to root top
      return Math.round(yInRoot);
    });

    // 2) Render to canvas (hi-res)
    const scale = 1.25;
    const canvas = await html2canvas(printRoot, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false
    });

    // 3) Convert DOM px -> canvas px using the same scale
    const breakPositionsPx = domBreakYs.map((y) => Math.round(y * scale));

    // 4) Build PDF honoring the breakpoints
    const pdf = new jsPDF("p", "mm", "a4");
    await addCanvasAsMultipagePDF(pdf, canvas, breakPositionsPx);
    return pdf;
  } finally {
    document.body.removeChild(holder);
  }
}

export async function downloadDashboardFullPDF(params) {
  const { filename = "dashboard.pdf" } = params || {};

  try {
    const pdf = await createDashboardPdf(params);
    pdf.save(filename);
  } catch (err) {
    console.error("Error generating full dashboard PDF:", err);
  } 
  }

export async function generateDashboardPdfBase64(params) {
  const { filename = "dashboard.pdf" } = params || {};

  try {
    const pdf = await createDashboardPdf(params);
    const arrayBuffer = pdf.output("arraybuffer");
    const base64 = arrayBufferToBase64(arrayBuffer);
    return { base64, filename };
  } catch (err) {
    console.error("Error generating dashboard PDF base64:", err);
    throw err;
  }
}