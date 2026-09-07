const validator = require("validator");

const SERVICES = [
  "Web Development",
  "UI/UX Design",
  "AI/ML",
  "Mobile App",
  "E-Commerce",
  "Automation",
  "Cloud/Backend",
  "SEO",
  "Other",
];

const BUDGETS = ["Under $500", "$500 - $1,000", "$1,000 - $5,000", "$5,000+", "Custom"];

function sanitizeText(value, maxLength = 2000) {
  if (typeof value !== "string") return "";
  return validator.escape(value.trim()).slice(0, maxLength);
}

function validateContactPayload(body) {
  const errors = {};
  const name = sanitizeText(body.name, 120);
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = sanitizeText(body.phone, 40);
  const company = sanitizeText(body.company, 120);
  const service = SERVICES.includes(body.service) ? body.service : "";
  const budget = BUDGETS.includes(body.budget) ? body.budget : "";
  const message = sanitizeText(body.message, 4000);

  if (!name || name.length < 2) errors.name = "Please enter your full name.";
  if (!email || !validator.isEmail(email)) errors.email = "Please enter a valid email address.";
  if (!message || message.length < 10) errors.message = "Please tell us a bit more about your project (min. 10 characters).";
  if (phone && !validator.isMobilePhone(phone.replace(/[^\d+]/g, ""), "any", { strictMode: false })) {
    errors.phone = "Please enter a valid phone number.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { name, email: validator.normalizeEmail(email) || email, phone, company, service, budget, message },
  };
}

function validateNewsletterPayload(body) {
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !validator.isEmail(email)) {
    return { valid: false, errors: { email: "Please enter a valid email address." } };
  }
  return { valid: true, data: { email: validator.normalizeEmail(email) || email } };
}

function validateChatPayload(body) {
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) {
    return { valid: false, error: "Message cannot be empty." };
  }
  if (message.length > 4000) {
    return { valid: false, error: "Message is too long (4000 character limit)." };
  }
  // Cap history size/shape to prevent oversized payloads being forwarded to the AI API.
  const safeHistory = history
    .slice(-20)
    .filter((m) => m && typeof m.content === "string" && ["user", "assistant"].includes(m.role))
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  return { valid: true, data: { message: message.slice(0, 4000), history: safeHistory } };
}

module.exports = {
  SERVICES,
  BUDGETS,
  sanitizeText,
  validateContactPayload,
  validateNewsletterPayload,
  validateChatPayload,
};
