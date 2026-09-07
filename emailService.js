const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null; // Email not configured — caller must handle gracefully.
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return transporter;
}

async function sendInquiryNotification(inquiry) {
  const t = getTransporter();
  if (!t) {
    console.warn("[email] SMTP not configured — skipping admin notification email.");
    return { sent: false, reason: "smtp_not_configured" };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  await t.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: adminEmail,
    replyTo: inquiry.email,
    subject: `New project inquiry — ${inquiry.name}`,
    text: [
      `New inquiry received via Virexo Innovations`,
      ``,
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Phone: ${inquiry.phone || "—"}`,
      `Company: ${inquiry.company || "—"}`,
      `Service: ${inquiry.service || "—"}`,
      `Budget: ${inquiry.budget || "—"}`,
      ``,
      `Message:`,
      inquiry.message,
    ].join("\n"),
  });

  return { sent: true };
}

async function sendInquiryConfirmation(inquiry) {
  const t = getTransporter();
  if (!t) {
    return { sent: false, reason: "smtp_not_configured" };
  }

  await t.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: inquiry.email,
    subject: "We received your project inquiry — Virexo Innovations",
    text: [
      `Hi ${inquiry.name},`,
      ``,
      `Thanks for reaching out to Virexo Innovations. We've received your project details and a member of our team will reply within one business day.`,
      ``,
      `Here's a copy of what you sent us:`,
      inquiry.message,
      ``,
      `— The Virexo Innovations Team`,
    ].join("\n"),
  });

  return { sent: true };
}

module.exports = { sendInquiryNotification, sendInquiryConfirmation };
