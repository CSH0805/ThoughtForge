import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";

// ─── 공통: 보고서 HTML 생성 ───────────────────────────────────────────────────
function buildReportHTML({ thought, markdown, prompts, nodes }) {
  const date = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const mdToHtml = (md = "") =>
    md
      .replace(/## (.+)/g, '<h2 style="color:#4f46e5;font-size:17px;margin:18px 0 8px;border-bottom:1px solid #e0e7ff;padding-bottom:4px;">$1</h2>')
      .replace(/### (.+)/g, '<h3 style="color:#6366f1;font-size:15px;margin:14px 0 6px;">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^- (.+)/gm, '<li style="margin:3px 0;">$1</li>')
      .replace(/\n/g, "<br>");

  const nodeCards = (nodes || [])
    .map(
      (n) => `
      <div style="border:1px solid #e0e7ff;border-radius:8px;padding:12px;background:#f8f9ff;">
        <p style="font-weight:bold;color:#4f46e5;margin:0 0 6px;font-size:13px;">${n.label}</p>
        ${(n.detail || []).map((d) => `<p style="margin:2px 0;font-size:12px;color:#444;">• ${d}</p>`).join("")}
      </div>`
    )
    .join("");

  const promptCards = (prompts || [])
    .map(
      (p) => `
      <div style="margin-bottom:14px;border:1px solid #e0e7ff;border-radius:8px;overflow:hidden;">
        <div style="background:#4f46e5;color:white;padding:7px 14px;font-weight:bold;font-size:13px;">
          Step ${p.step}: ${p.title}
        </div>
        <div style="padding:10px 14px;background:#f8f9ff;font-size:12px;line-height:1.7;white-space:pre-wrap;">${p.prompt}</div>
      </div>`
    )
    .join("");

  return `
    <div style="font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif;color:#1a1a2e;line-height:1.7;">
      <!-- 헤더 -->
      <div style="border-bottom:3px solid #4f46e5;padding-bottom:18px;margin-bottom:28px;">
        <h1 style="font-size:26px;font-weight:bold;color:#1a1a2e;margin:0;">🧠 ThoughtForge</h1>
        <p style="color:#6366f1;margin:4px 0 0;font-size:15px;">AI 생각 분석 보고서</p>
        <p style="color:#888;margin:6px 0 0;font-size:12px;">생성일: ${date}</p>
      </div>

      <!-- 원본 생각 -->
      <section style="margin-bottom:28px;">
        <h2 style="font-size:17px;color:#4f46e5;border-left:4px solid #4f46e5;padding-left:10px;margin-bottom:10px;">💭 원본 생각</h2>
        <div style="background:#f8f9ff;border:1px solid #e0e7ff;border-radius:8px;padding:14px;font-size:14px;">
          ${thought.replace(/\n/g, "<br>")}
        </div>
      </section>

      <!-- AI 정리 -->
      <section style="margin-bottom:28px;">
        <h2 style="font-size:17px;color:#4f46e5;border-left:4px solid #4f46e5;padding-left:10px;margin-bottom:10px;">📝 AI 정리</h2>
        <div style="font-size:14px;">${mdToHtml(markdown)}</div>
      </section>

      ${
        prompts?.length
          ? `<section style="margin-bottom:28px;">
        <h2 style="font-size:17px;color:#4f46e5;border-left:4px solid #4f46e5;padding-left:10px;margin-bottom:10px;">💬 AI 프롬프트</h2>
        ${promptCards}
      </section>`
          : ""
      }

      ${
        nodes?.length
          ? `<section>
        <h2 style="font-size:17px;color:#4f46e5;border-left:4px solid #4f46e5;padding-left:10px;margin-bottom:10px;">🗺️ 생각 그래프</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">${nodeCards}</div>
      </section>`
          : ""
      }
    </div>
  `;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().slice(0, 10);

// ─── PDF 다운로드 ─────────────────────────────────────────────────────────────
export async function downloadPDF(exportData) {
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:820px;padding:52px;background:white;";
  container.innerHTML = buildReportHTML(exportData);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    let remaining = imgH;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);
    remaining -= pageH;

    while (remaining > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
      remaining -= pageH;
    }

    pdf.save(`ThoughtForge_보고서_${today()}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

// ─── DOCX 다운로드 ────────────────────────────────────────────────────────────
export async function downloadDOCX({ thought, markdown, prompts, nodes }) {
  const date = new Date().toLocaleDateString("ko-KR");

  const h = (text, size = 28, color = "4f46e5", bold = true) =>
    new Paragraph({
      children: [new TextRun({ text, bold, size, color })],
      spacing: { before: 360, after: 160 },
    });

  const body = (text, size = 22) =>
    new Paragraph({
      children: [new TextRun({ text, size })],
      spacing: { after: 80 },
    });

  const bullet = (text) =>
    new Paragraph({
      children: [new TextRun({ text: `• ${text}`, size: 20 })],
      indent: { left: 360 },
      spacing: { after: 60 },
    });

  // markdown → paragraph 배열
  const mdLines = (markdown || "").split("\n").map((line) => {
    if (line.startsWith("## "))
      return new Paragraph({
        children: [new TextRun({ text: line.slice(3), bold: true, size: 24, color: "4f46e5" })],
        spacing: { before: 280, after: 100 },
      });
    if (line.startsWith("### "))
      return new Paragraph({
        children: [new TextRun({ text: line.slice(4), bold: true, size: 22, color: "6366f1" })],
        spacing: { before: 200, after: 80 },
      });
    if (line.startsWith("- ")) return bullet(line.slice(2));
    if (!line.trim()) return new Paragraph({ children: [new TextRun({ text: "" })] });
    return body(line);
  });

  const children = [
    // 제목
    new Paragraph({
      children: [new TextRun({ text: "ThoughtForge AI 분석 보고서", bold: true, size: 44, color: "4f46e5" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `생성일: ${date}`, size: 18, color: "888888" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
    }),

    // 원본 생각
    h("💭 원본 생각"),
    body(thought),

    // AI 정리
    h("📝 AI 정리"),
    ...mdLines,

    // AI 프롬프트
    ...(prompts?.length
      ? [
          h("💬 AI 프롬프트"),
          ...(prompts || []).flatMap((p) => [
            new Paragraph({
              children: [new TextRun({ text: `Step ${p.step}: ${p.title}`, bold: true, size: 22, color: "6366f1" })],
              spacing: { before: 240, after: 80 },
            }),
            body(p.prompt),
          ]),
        ]
      : []),

    // 생각 그래프
    ...(nodes?.length
      ? [
          h("🗺️ 생각 그래프"),
          ...(nodes || []).flatMap((n) => [
            new Paragraph({
              children: [new TextRun({ text: n.label, bold: true, size: 22 })],
              spacing: { before: 180, after: 60 },
            }),
            ...(n.detail || []).map((d) => bullet(d)),
          ]),
        ]
      : []),
  ];

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `ThoughtForge_보고서_${today()}.docx`);
}
