const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { type, name, email, phone, message, car, answers, time } = req.body || {};

  if (!name || !phone) {
    res.status(400).json({ error: "Name und Telefon sind erforderlich." });
    return;
  }

  const missing = ["smtp_server", "smtp_benutzer", "smtp_passwort", "smtp_absender"].filter(
    (k) => !process.env[k]
  );
  if (missing.length) {
    res.status(500).json({
      error: "SMTP nicht konfiguriert.",
      debug: process.env.SEND_LEAD_DEBUG === "1" ? { missing } : undefined,
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.smtp_server,
    port: 587,
    secure: false, // STARTTLS on port 587
    auth: {
      user: process.env.smtp_benutzer,
      pass: process.env.smtp_passwort,
    },
  });

  const subjectByType = {
    contact: "Neue Kontaktanfrage",
    quiz: "Neue Anfrage aus dem Unfall-Check",
    callback: "Neuer Rückrufwunsch",
  };
  const subject = subjectByType[type] || "Neue Anfrage über die Website";

  const lines = [
    `Typ: ${type || "unbekannt"}`,
    `Name: ${name}`,
    phone ? `Telefon: ${phone}` : null,
    email ? `E-Mail: ${email}` : null,
    car ? `Fahrzeug: ${car}` : null,
    time ? `Wunschzeit: ${time}` : null,
    message ? `Nachricht: ${message}` : null,
    answers ? `Antworten: ${JSON.stringify(answers, null, 2)}` : null,
  ].filter(Boolean);

  try {
    await transporter.sendMail({
      from: process.env.smtp_benutzer,
      to: process.env.smtp_absender,
      replyTo: email || undefined,
      subject: `${subject} – ${name}`,
      text: lines.join("\n"),
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("send-lead error:", err);
    res.status(500).json({
      error: "E-Mail konnte nicht gesendet werden.",
      debug: process.env.SEND_LEAD_DEBUG === "1" ? { code: err.code, message: err.message } : undefined,
    });
  }
};
