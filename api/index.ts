import express from "express";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";

// ── Supabase ───────────────────────────────────────────────────
const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { persistSession: false } }
);

// ── AI Helpers ─────────────────────────────────────────────────
function cleanKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return key.trim().replace(/^["']|["']$/g, "");
}

async function perplexity(prompt: string, systemPrompt?: string): Promise<string> {
  const key = cleanKey(process.env.PERPLEXITY_API_KEY);
  if (!key) throw new Error("Perplexity API Key is missing.");
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "sonar", messages: [{ role: "system", content: systemPrompt || "You are a helpful assistant." }, { role: "user", content: prompt }] })
  });
  if (!res.ok) throw new Error(`Perplexity Error: ${await res.text()}`);
  return ((await res.json()) as any).choices[0].message.content;
}

async function claudeAI(prompt: string, systemPrompt?: string): Promise<string> {
  const key = cleanKey(process.env.ANTHROPIC_API_KEY);
  if (!key) throw new Error("Anthropic API Key is missing.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-3-5-sonnet-20240620", max_tokens: 4096, system: systemPrompt, messages: [{ role: "user", content: prompt }] })
  });
  if (!res.ok) throw new Error(`Claude Error: ${await res.text()}`);
  return ((await res.json()) as any).content[0].text;
}

async function kimi(prompt: string, systemPrompt?: string): Promise<string> {
  const key = cleanKey(process.env.KIMI_API_KEY);
  if (!key) throw new Error("Kimi API Key is missing.");
  const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "moonshot-v1-8k", messages: [{ role: "system", content: systemPrompt || "You are a helpful assistant." }, { role: "user", content: prompt }] })
  });
  if (!res.ok) throw new Error(`Kimi Error: ${await res.text()}`);
  return ((await res.json()) as any).choices[0].message.content;
}

async function gemini(prompt: string, systemPrompt?: string): Promise<string> {
  if (process.env.KIMI_API_KEY) {
    try { return await kimi(prompt, systemPrompt); } catch (e: any) { console.error("Kimi Error:", e.message); }
  }
  const key = cleanKey(process.env.GEMINI_API_KEY || process.env.API_KEY);
  if (key) {
    const ai = new GoogleGenAI({ apiKey: key });
    for (const model of ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]) {
      try {
        const r = await ai.models.generateContent({ model, contents: prompt, config: systemPrompt ? { systemInstruction: systemPrompt } : undefined });
        if (r.text) return r.text;
      } catch (e: any) { console.error(`Gemini (${model}) Error:`, e.message); }
    }
  }
  if (process.env.PERPLEXITY_API_KEY) {
    try { return await perplexity(prompt, systemPrompt); } catch (e: any) { console.error("Perplexity Error:", e.message); }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    try { return await claudeAI(prompt, systemPrompt); } catch (e: any) { console.error("Claude Error:", e.message); }
  }
  throw new Error("All AI models failed. Please check your API keys.");
}

// ── Express App ────────────────────────────────────────────────
const app = express();
app.use(express.json());

const APP_URL = process.env.APP_URL?.replace(/\/$/, "") || "";
const REDIRECT_URI = `${APP_URL}/auth/linkedin/callback`;
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

// Health
app.get("/api/health", async (req, res) => {
  const { error } = await db.from("users").select("id").limit(1);
  res.json({
    status: "ok",
    supabase: error ? `error: ${error.message}` : "connected",
    hasClientId: !!CLIENT_ID,
    hasGeminiKey: !!(process.env.GEMINI_API_KEY || process.env.API_KEY),
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasPerplexityKey: !!process.env.PERPLEXITY_API_KEY,
    hasKimiKey: !!process.env.KIMI_API_KEY
  });
});

// AI Diagnostics
app.get("/api/test-ai", async (req, res) => {
  const results: any = {};
  const testPrompt = "Respond with only the word OK.";
  if (process.env.KIMI_API_KEY) {
    try { results.kimi = { status: "success", response: await kimi(testPrompt) }; } catch (e: any) { results.kimi = { status: "error", message: e.message }; }
  } else { results.kimi = { status: "missing" }; }
  const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (geminiKey) {
    try { const ai = new GoogleGenAI({ apiKey: geminiKey.trim() }); const r = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: testPrompt }); results.gemini = { status: "success", response: r.text }; } catch (e: any) { results.gemini = { status: "error", message: e.message }; }
  } else { results.gemini = { status: "missing" }; }
  if (process.env.PERPLEXITY_API_KEY) {
    try { results.perplexity = { status: "success", response: await perplexity(testPrompt) }; } catch (e: any) { results.perplexity = { status: "error", message: e.message }; }
  } else { results.perplexity = { status: "missing" }; }
  if (process.env.ANTHROPIC_API_KEY) {
    try { results.claude = { status: "success", response: await claudeAI(testPrompt) }; } catch (e: any) { results.claude = { status: "error", message: e.message }; }
  } else { results.claude = { status: "missing" }; }
  res.json(results);
});

// LinkedIn OAuth
app.get("/api/auth/url", (req, res) => {
  if (!CLIENT_ID) return res.status(500).json({ error: "LinkedIn Client ID missing." });
  const state = Math.random().toString(36).substring(7);
  const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${encodeURIComponent("openid profile email w_member_social")}`;
  res.json({ url });
});

app.get("/auth/linkedin/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code provided");
  try {
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code: code as string, client_id: CLIENT_ID!, client_secret: CLIENT_SECRET!, redirect_uri: REDIRECT_URI })
    });
    const tokenData: any = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description);

    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    const profile: any = await profileRes.json();
    const userId = profile.sub;

    const { error } = await db.from("users").upsert({
      id: userId, linkedin_id: userId, name: profile.name, email: profile.email,
      picture: profile.picture, access_token: tokenData.access_token,
      expires_at: Date.now() + (tokenData.expires_in || 3600) * 1000
    }, { onConflict: "linkedin_id" });

    if (error) throw new Error(`DB Error: ${error.message}`);

    res.send(`<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#030712;color:white;"><div style="text-align:center;padding:2rem;background:#0d1117;border-radius:1rem;border:1px solid #21262d;"><h2 style="color:#22d3ee;">Connection Successful!</h2><p style="color:#7d8590;">Closing window...</p><script>if(window.opener){window.opener.postMessage({type:'OAUTH_AUTH_SUCCESS',userId:'${userId}'},'*');setTimeout(()=>window.close(),1000);}else{document.querySelector('p').innerText='Authentication complete. You can close this tab.';}<\/script></div></body></html>`);
  } catch (err: any) {
    res.status(500).send(`<html><body style="padding:2rem;background:#030712;color:white;"><h2 style="color:#f87171;">Auth Failed</h2><p>${err.message}</p><button onclick="window.close()" style="background:#21262d;color:white;border:none;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;">Close</button></body></html>`);
  }
});

// User
app.get("/api/user/:id", async (req, res) => {
  const { data, error } = await db.from("users").select("id, name, email, picture, headline, about").eq("id", req.params.id).single();
  if (error || !data) return res.status(404).json({ error: "User not found" });
  res.json(data);
});

app.get("/api/user/:id/posts", async (req, res) => {
  const { data, error } = await db.from("posts").select("*").eq("user_id", req.params.id).order("created_at", { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Save Analysis
app.post("/api/save-analysis", async (req, res) => {
  const { userId, analysis } = req.body;
  const { error } = await db.from("profile_analyses").insert({ user_id: userId, analysis_json: JSON.stringify(analysis), score: analysis.overallScore });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Save Post
app.post("/api/save-post", async (req, res) => {
  const { userId, postData, topic, postType } = req.body;
  const { error } = await db.from("posts").insert({ user_id: userId, content: postData.post, status: "draft", virality_score: postData.viralityScore, topic, post_type: postType });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Content Strategy
app.post("/api/content-strategy", async (req, res) => {
  const { industry, role, goals, audience } = req.body;
  const prompt = `Create a 30-day LinkedIn content strategy.\nIndustry: ${industry}\nRole: ${role}\nGoals: ${goals}\nAudience: ${audience}\n\nReturn ONLY valid JSON:\n{"pillars":[{"name":"","description":"","frequency":"","examples":[]}],"weeklySchedule":{"monday":"","tuesday":"","wednesday":"","thursday":"","friday":""},"viralTopics":["","","","",""],"contentMix":{"stories":"30%","insights":"30%","lists":"25%","questions":"15%"},"growthProjection":""}`;
  try {
    const text = await gemini(prompt);
    res.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Publish to LinkedIn
app.post("/api/post", async (req, res) => {
  const { userId, content } = req.body;
  const { data: user, error: userErr } = await db.from("users").select("access_token").eq("id", userId).single();
  if (userErr || !user) return res.status(404).json({ error: "User not found" });
  try {
    const r = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: { Authorization: `Bearer ${user.access_token}`, "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json" },
      body: JSON.stringify({ author: `urn:li:person:${userId}`, lifecycleState: "PUBLISHED", specificContent: { "com.linkedin.ugc.ShareContent": { shareCommentary: { text: content }, shareMediaCategory: "NONE" } }, visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" } })
    });
    const result: any = await r.json();
    if (result.id) {
      await db.from("posts").update({ status: "published", linkedin_post_id: result.id }).eq("user_id", userId).eq("content", content);
      res.json({ success: true, postId: result.id });
    } else {
      res.status(400).json({ error: "Failed to post", details: result });
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default app;
