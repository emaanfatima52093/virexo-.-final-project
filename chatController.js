const crypto = require('crypto');
const db = require('../database/db');
const { validateChatPayload } = require('../middleware/validators');
const { getChatReply, getFollowUpReply } = require('../services/aiService');
const { runWebSearch } = require('../services/webSearchService');
async function postChat(req, res) {
  const { valid, error, data } = validateChatPayload(req.body || {});
  if (!valid) return res.status(400).json({ error });
  const sessionId = typeof req.body.sessionId === 'string' && req.body.sessionId.length <= 100 ? req.body.sessionId : crypto.randomUUID();
  const result = await getChatReply(data.message, data.history);
  if (!result.ok) return res.status(503).json({ error: result.message, code: result.error });
  let finalReply = result.reply;
  if (result.needsTool) {
    const toolCall = result.toolCalls[0]; let query = data.message;
    try { query = JSON.parse(toolCall.function.arguments).query || query; } catch (_) {}
    const searchResults = await runWebSearch(query);
    const toolContent = searchResults ? JSON.stringify(searchResults) : JSON.stringify({ error: "Live web search isn't configured on this deployment." });
    const followUp = await getFollowUpReply([{ role: 'system', content: 'You are Virexo AI on the Virexo Innovations website.' }, ...data.history, { role: 'user', content: data.message }, result.assistantMessage, { role: 'tool', tool_call_id: toolCall.id, content: toolContent }]);
    if (!followUp.ok) return res.status(503).json({ error: followUp.message, code: followUp.error });
    finalReply = followUp.reply;
  }
  if (!finalReply) return res.status(503).json({ error: "Virexo AI didn't return a usable response.", code: 'empty_response' });
  db.insert('chat_logs', { session_id: sessionId, role: 'user', content: data.message, created_at: new Date().toISOString() });
  db.insert('chat_logs', { session_id: sessionId, role: 'assistant', content: finalReply, created_at: new Date().toISOString() });
  res.json({ reply: finalReply, sessionId });
}
module.exports = { postChat };
