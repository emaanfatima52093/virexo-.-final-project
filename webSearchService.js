/**
 * Executes a real web search so the chatbot never fabricates "current"
 * information. Uses Serper.dev (a Google Search API) — swap the fetch
 * below for any search provider you prefer, the contract stays the same:
 * take a query string, return a short list of {title, snippet, link}.
 *
 * If SERPER_API_KEY isn't set, this returns null and the caller must
 * tell the model (and the user) that live search isn't available rather
 * than inventing results.
 */
async function runWebSearch(query) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 5 }),
    });

    if (!res.ok) return null;
    const data = await res.json();

    const results = (data.organic || []).slice(0, 5).map((r) => ({
      title: r.title,
      snippet: r.snippet,
      link: r.link,
    }));

    return results.length ? results : null;
  } catch (err) {
    console.error("[webSearchService] search failed:", err.message);
    return null;
  }
}

module.exports = { runWebSearch };
