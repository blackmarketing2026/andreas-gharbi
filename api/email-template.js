const NAVY = "#1e2f47";
const NAVY_DARK = "#16233a";
const RED = "#d6392c";
const RED_LIGHT = "#e6584a";
const LOGO_URL = "https://andreas-gharbi.vercel.app/assets/logo-CuBQHYOz.png";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Normalizes a German-style phone number to international digits for tel:/wa.me links.
function normalizePhone(phone) {
  if (!phone) return "";
  let digits = String(phone).replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "49" + digits.slice(1);
  return digits;
}

const TYPE_LABELS = {
  contact: "Kontaktformular",
  quiz: "Unfall-Check Quiz",
  callback: "Rückrufwunsch",
};

function buildRow(label, value) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2c3f5a;color:#9fb0c7;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:.04em;vertical-align:top;width:130px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2c3f5a;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;vertical-align:top;">${value}</td>
    </tr>`;
}

// Renders quiz answers as a readable Q&A list. Accepts either an array of
// { question, answer } pairs or a plain { key: value } object.
function buildAnswersHtml(answers) {
  if (!answers) return null;

  const pairs = Array.isArray(answers)
    ? answers.map((a) => [a && a.question, a && a.answer])
    : Object.entries(answers);

  if (!pairs.length) return null;

  return pairs
    .map(
      ([question, answer]) => `
        <div style="margin:0 0 10px 0;">
          <div style="color:#9fb0c7;font-family:Arial,Helvetica,sans-serif;font-size:13px;">${escapeHtml(question)}</div>
          <div style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;">${escapeHtml(answer)}</div>
        </div>`
    )
    .join("");
}

function buildLeadEmailHtml({ type, name, email, phone, message, car, answers, time }) {
  const typeLabel = TYPE_LABELS[type] || "Website-Anfrage";
  const phoneDigits = normalizePhone(phone);
  const telHref = phoneDigits ? `tel:+${phoneDigits}` : null;
  const waHref = phoneDigits ? `https://wa.me/${phoneDigits}` : null;
  const mailHref = email ? `mailto:${encodeURIComponent(email)}` : null;

  const answersHtml = buildAnswersHtml(answers);

  const rows = [
    buildRow("Name", escapeHtml(name)),
    buildRow("Telefon", phone ? `<a href="${telHref}" style="color:${RED_LIGHT};text-decoration:none;">${escapeHtml(phone)}</a>` : null),
    buildRow("E-Mail", email ? `<a href="${mailHref}" style="color:${RED_LIGHT};text-decoration:none;">${escapeHtml(email)}</a>` : null),
    buildRow("Fahrzeug", escapeHtml(car)),
    buildRow("Wunschzeit", escapeHtml(time)),
    buildRow("Nachricht", message ? escapeHtml(message).replace(/\n/g, "<br>") : null),
    buildRow("Antworten", answersHtml),
  ].join("");

  const buttons = [
    telHref
      ? `<td style="padding:0 6px;">
          <a href="${telHref}" style="display:block;background-color:${RED};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;text-align:center;border-radius:8px;padding:14px 8px;">📞 Anrufen</a>
        </td>`
      : "",
    waHref
      ? `<td style="padding:0 6px;">
          <a href="${waHref}" style="display:block;background-color:#25D366;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;text-align:center;border-radius:8px;padding:14px 8px;">💬 WhatsApp</a>
        </td>`
      : "",
    mailHref
      ? `<td style="padding:0 6px;">
          <a href="${mailHref}" style="display:block;background-color:${NAVY_DARK};border:1px solid #3a4f6c;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;text-align:center;border-radius:8px;padding:13px 8px;">✉️ E-Mail</a>
        </td>`
      : "",
  ].filter(Boolean).join("");

  return `<!doctype html>
<html lang="de">
  <body style="margin:0;padding:0;background-color:#0f1b2d;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1b2d;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${NAVY};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:${NAVY_DARK};padding:24px 32px;">
                <img src="${LOGO_URL}" alt="AG KFZ Sachverständiger" height="36" style="display:block;height:36px;">
              </td>
            </tr>
            <tr>
              <td style="padding:6px 32px 0 32px;">
                <p style="margin:24px 0 4px 0;color:${RED_LIGHT};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;">Neue Anfrage</p>
                <h1 style="margin:0 0 20px 0;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:800;">${escapeHtml(typeLabel)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${rows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>${buttons}</tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <p style="margin:0;color:#7488a3;font-family:Arial,Helvetica,sans-serif;font-size:12px;">
                  Diese Nachricht wurde automatisch über die Website ag-kfz-sachverstaendiger.de versendet.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = { buildLeadEmailHtml, normalizePhone };
