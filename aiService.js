const OpenAI = require("openai");

let client = null;
function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are Virexo AI, the assistant embedded on the Virexo Innovations website.

Virexo Innovations is a digital solutions studio offering: Web Development, UI/UX Design,
AI & Machine Learning, Mobile App Development, E-Commerce, Business Automation, Cloud &
Backend engineering, and SEO & Growth Marketing. Typical engagements run $299–$5,000+
depending on scope, with marketing sites shipping in 4–6 weeks and larger product builds
in 8–14 weeks. To start a project, a visitor should use the contact form on the site or
describe what they need here and you should encourage them to share their email so the
team can follow up.

You are a genuinely general-purpose assistant, not a scripted FAQ bot:
- Answer any reasonable question — business, technology, AI, coding, marketing, writing,
  productivity, education — in addition to Virexo-specific questions.
- Maintain conversation context: resolve pronouns and follow-up questions ("it", "that",
  "how do I use it") against what was discussed earlier in the conversation.
- Detect the language the user is writing in — English, Urdu (Urdu script), or Roman Urdu
  (Urdu written in Latin letters) — and reply naturally in that same language/script.
- Be concise, warm, and professional. Use short paragraphs or brief bullet points rather
  than long walls of text.
- If a question needs current information (news, prices, recent releases, current events)
  and you are not certain, say so plainly rather than guessing — never invent facts,
  statistics, or current events.
- You do not have access to Virexo's internal database, client list, or pricing beyond
  what's stated above — if asked for something you don't know, say so and suggest the
  contact form.`;

/**
 * Sends the conversation to the OpenAI API and returns the assistant's reply.
 * Returns { ok: false } (never a fabricated reply) if the API key is missing
 * or the request fails for any reason.
 */
async function getChatReply(message, history = []) {
  const openai = getClient();
  if (!openai) {
    return {
      ok: false,
      error: "ai_unavailable",
      message: "Virexo AI is temporarily unavailable — the AI service isn't configured yet.",
    };
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  const useWebSearch = process.env.OPENAI_ENABLE_WEB_SEARCH === "true";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

    const response = await openai.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        temperature: 0.6,
        max_tokens: 700,
        // Tool-calling for current-information questions. The model decides
        // when to invoke it; if the deployed model/plan doesn't support a
        // hosted web_search tool, this is simply ignored by the API.
        ...(useWebSearch
          ? {
              tools: [{ type: "function", function: WEB_SEARCH_FUNCTION_SPEC }],
              tool_choice: "auto",
            }
          : {}),
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const choice = response.choices?.[0];
    if (!choice) {
      return { ok: false, error: "empty_response", message: "Virexo AI didn't return a response. Please try again." };
    }

    // If the model asked to call the web-search tool, the calling route is
    // responsible for executing it and making a follow-up request — see
    // controllers/chatController.js for the two-step flow.
    if (choice.finish_reason === "tool_calls") {
      return { ok: true, needsTool: true, toolCalls: choice.message.tool_calls, assistantMessage: choice.message };
    }

    return { ok: true, reply: choice.message.content?.trim() || "" };
  } catch (err) {
    console.error("[aiService] OpenAI request failed:", err.message);
    return {
      ok: false,
      error: "ai_request_failed",
      message: "Virexo AI couldn't process that request right now. Please try again in a moment.",
    };
  }
}

// Spec for a hosted web-search style function the model can call for
// current-information questions. The actual execution is a real HTTP
// search performed server-side in chatController.js — never fabricated.
const WEB_SEARCH_FUNCTION_SPEC = {
  name: "web_search",
  description:
    "Search the live web for current information (news, prices, recent product releases, current events) that may postdate the model's training data.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query." },
    },
    required: ["query"],
  },
};

async function getFollowUpReply(messages) {
  const openai = getClient();
  if (!openai) {
    return { ok: false, error: "ai_unavailable", message: "Virexo AI is temporarily unavailable." };
  }
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.6,
      max_tokens: 700,
    });
    const choice = response.choices?.[0];
    return { ok: true, reply: choice?.message?.content?.trim() || "" };
  } catch (err) {
    console.error("[aiService] OpenAI follow-up request failed:", err.message);
    return { ok: false, error: "ai_request_failed", message: "Virexo AI couldn't finish that request. Please try again." };
  }
}

module.exports = { getChatReply, getFollowUpReply, WEB_SEARCH_FUNCTION_SPEC };
