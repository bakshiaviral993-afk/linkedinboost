import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const db = new Database("linkboost.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    linkedin_id TEXT UNIQUE,
    name TEXT,
    email TEXT,
    picture TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at INTEGER
  );
`);

// Migration: Add missing columns if they don't exist
try {
  db.exec("ALTER TABLE users ADD COLUMN headline TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE users ADD COLUMN about TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE posts ADD COLUMN virality_score INTEGER;");
} catch (e) {}
try {
  db.exec("ALTER TABLE posts ADD COLUMN topic TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE posts ADD COLUMN post_type TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE profile_analyses ADD COLUMN analysis_json TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE profile_analyses ADD COLUMN score INTEGER;");
} catch (e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    content TEXT,
    status TEXT DEFAULT 'draft',
    scheduled_at INTEGER,
    linkedin_post_id TEXT,
    virality_score INTEGER,
    topic TEXT,
    post_type TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS profile_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    analysis_json TEXT,
    score INTEGER,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

function cleanKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let cleaned = key.trim();
  // Remove common prefixes if user accidentally pasted them
  cleaned = cleaned.replace(/^(KIMI_API_KEY|GEMINI_API_KEY|PERPLEXITY_API_KEY|ANTHROPIC_API_KEY|API_KEY)[:=]\s*/i, "");
  // Remove quotes if present
  cleaned = cleaned.replace(/^["']|["']$/g, "");
  return cleaned;
}

async function perplexity(prompt: string, systemPrompt?: string): Promise<string> {
  const key = cleanKey(process.env.PERPLEXITY_API_KEY);
  if (!key) {
    throw new Error("Perplexity API Key is missing.");
  }

  console.log(`Using Perplexity Fallback (Key: ${key.substring(0, 6)}...)`);

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API Error: ${error}`);
  }

  const data: any = await response.json();
  return data.choices[0].message.content || "";
}

async function claude(prompt: string, systemPrompt?: string): Promise<string> {
  const key = cleanKey(process.env.ANTHROPIC_API_KEY);
  if (!key) {
    throw new Error("Anthropic API Key is missing.");
  }

  console.log(`Using Claude Fallback (Key: ${key.substring(0, 6)}...)`);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API Error: ${error}`);
  }

  const data: any = await response.json();
  return data.content[0].text || "";
}

async function kimi(prompt: string, systemPrompt?: string): Promise<string> {
  const key = cleanKey(process.env.KIMI_API_KEY);
  if (!key) {
    throw new Error("Kimi API Key is missing.");
  }

  console.log(`Using Kimi Fallback (Key: ${key.substring(0, 6)}...)`);

  const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "moonshot-v1-8k",
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API Error: ${error}`);
  }

  const data: any = await response.json();
  return data.choices[0].message.content || "";
}

async function gemini(prompt: string, systemPrompt?: string): Promise<string> {
  // Try Kimi first as requested by the user
  if (process.env.KIMI_API_KEY) {
    try {
      return await kimi(prompt, systemPrompt);
    } catch (kimiError: any) {
      console.error("Kimi Error, attempting Gemini fallback:", kimiError.message);
    }
  }

  const key = cleanKey(process.env.GEMINI_API_KEY || process.env.API_KEY);
  
  if (key) {
    const ai = new GoogleGenAI({ apiKey: key });
    const modelsToTry = ["gemini-3-flash-preview", "gemini-3.1-pro-preview", "gemini-flash-latest"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting Gemini with model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: systemPrompt ? { systemInstruction: systemPrompt } : undefined,
        });
        if (response.text) return response.text;
      } catch (error: any) {
        const errorMsg = error.message || "";
        console.error(`Gemini Error with ${modelName}:`, errorMsg);
        lastError = error;
        continue;
      }
    }
  }

  // If all Gemini models failed, try other providers
  if (process.env.PERPLEXITY_API_KEY) {
    try {
      return await perplexity(prompt, systemPrompt);
    } catch (perpError: any) {
      console.error("Perplexity Error, attempting Claude fallback:", perpError.message);
    }
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await claude(prompt, systemPrompt);
    } catch (claudeError: any) {
      console.error("Claude Error:", claudeError.message);
    }
  }
  
  const errorDetails = {
    kimi: process.env.KIMI_API_KEY ? "Tried and failed" : "Missing key",
    gemini: key ? "Tried multiple models and failed" : "Missing key",
    perplexity: process.env.PERPLEXITY_API_KEY ? "Tried and failed" : "Missing key",
    claude: process.env.ANTHROPIC_API_KEY ? "Tried and failed" : "Missing key"
  };

  throw new Error(`All AI models failed. \n\nDetails:\n- Kimi: ${errorDetails.kimi}\n- Gemini: ${errorDetails.gemini}\n- Perplexity: ${errorDetails.perplexity}\n- Claude: ${errorDetails.claude}\n\nPlease check your API keys in the AI Diagnostics tab.`);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  const APP_URL = process.env.APP_URL?.replace(/\/$/, "") || `http://localhost:${PORT}`;
  const REDIRECT_URI = `${APP_URL}/auth/linkedin/callback`;

  // API Routes
  app.get("/api/health", (req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const kimiKey = process.env.KIMI_API_KEY;
    res.json({ 
      status: "ok", 
      hasClientId: !!CLIENT_ID, 
      hasClientSecret: !!CLIENT_SECRET, 
      hasGeminiKey: !!geminiKey,
      geminiKeyLength: geminiKey ? geminiKey.length : 0,
      geminiKeyName: process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" : (process.env.API_KEY ? "API_KEY" : "NONE"),
      hasPerplexityKey: !!perplexityKey,
      hasAnthropicKey: !!anthropicKey,
      hasKimiKey: !!kimiKey
    });
  });

  app.get("/api/test-ai", async (req, res) => {
    const results: any = {};
    const testPrompt = "Respond with only the word 'OK' if you can read this.";

    // Test Kimi
    if (process.env.KIMI_API_KEY) {
      try {
        results.kimi = { status: "success", response: await kimi(testPrompt) };
      } catch (e: any) {
        results.kimi = { status: "error", message: e.message };
      }
    } else {
      results.kimi = { status: "missing" };
    }

    // Test Gemini
    const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: testPrompt,
        });
        results.gemini = { status: "success", response: response.text };
      } catch (e: any) {
        results.gemini = { status: "error", message: e.message };
      }
    } else {
      results.gemini = { status: "missing" };
    }

    // Test Perplexity
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        results.perplexity = { status: "success", response: await perplexity(testPrompt) };
      } catch (e: any) {
        results.perplexity = { status: "error", message: e.message };
      }
    } else {
      results.perplexity = { status: "missing" };
    }

    // Test Claude
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        results.claude = { status: "success", response: await claude(testPrompt) };
      } catch (e: any) {
        results.claude = { status: "error", message: e.message };
      }
    } else {
      results.claude = { status: "missing" };
    }

    res.json(results);
  });

  app.get("/api/auth/url", (req, res) => {
    if (!CLIENT_ID) {
      return res.status(500).json({ error: "LinkedIn Client ID is missing. Please add it to the Secrets panel in AI Studio." });
    }
    const scope = "openid profile email w_member_social";
    const state = Math.random().toString(36).substring(7);
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    res.json({ url: authUrl });
  });

  app.get("/auth/linkedin/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          client_id: CLIENT_ID!,
          client_secret: CLIENT_SECRET!,
          redirect_uri: REDIRECT_URI,
        }),
      });

      const tokenData: any = await tokenResponse.json();
      if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

      const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData: any = await profileResponse.json();

      const userId = profileData.sub;
      db.prepare(`
        INSERT INTO users (id, linkedin_id, name, email, picture, access_token, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(linkedin_id) DO UPDATE SET
          access_token = excluded.access_token,
          expires_at = excluded.expires_at,
          name = excluded.name,
          picture = excluded.picture
      `).run(
        userId,
        userId,
        profileData.name,
        profileData.email,
        profileData.picture,
        tokenData.access_token,
        Date.now() + (tokenData.expires_in || 3600) * 1000
      );

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #030712; color: white;">
            <div style="text-align: center; padding: 2rem; background: #0d1117; border-radius: 1rem; border: 1px solid #21262d;">
              <h2 style="color: #22d3ee; margin-bottom: 0.5rem;">Connection Successful!</h2>
              <p style="color: #7d8590;">This window will close automatically.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', userId: '${userId}' }, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  document.querySelector('p').innerText = "Authentication complete. You can now close this tab and return to the app.";
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("OAuth Error:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: sans-serif; padding: 2rem; background: #030712; color: white;">
            <h2 style="color: #f87171;">Authentication Failed</h2>
            <p>${error.message}</p>
            <button onclick="window.close()" style="background: #21262d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">Close Window</button>
          </body>
        </html>
      `);
    }
  });

  app.get("/api/user/:id", (req, res) => {
    const user = db.prepare("SELECT id, name, email, picture, headline, about FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.get("/api/user/:id/posts", (req, res) => {
    const posts = db.prepare("SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(req.params.id);
    res.json(posts);
  });

  app.post("/api/analyze-profile", async (req, res) => {
    const { userId, profileData } = req.body;
    const systemPrompt = "You are an elite LinkedIn growth strategist who has helped 500+ professionals reach top 1% profile visibility. Be brutally honest, specific, and actionable. Return ONLY valid JSON with no markdown fences.";
    const prompt = `Analyze this LinkedIn profile data and provide a deep analysis.
    Profile Data: ${JSON.stringify(profileData)}
    
    Return this exact JSON shape:
    {
      "overallScore": 85,
      "grade": "A",
      "categories": {
        "headline": { "score": 70, "feedback": "...", "optimized": "..." },
        "about": { "score": 65, "feedback": "...", "optimized": "..." },
        "experience": { "score": 80, "feedback": "..." },
        "skills": { "score": 75, "feedback": "...", "suggested": ["skill1", "skill2", "skill3"] },
        "network": { "score": 60, "feedback": "..." }
      },
      "strengths": ["strength1", "strength2", "strength3"],
      "criticalFixes": ["fix1", "fix2", "fix3"],
      "profilePowerStatement": "One powerful sentence about unique value",
      "competitorGap": "What top performers in this space have that this profile lacks",
      "viralityPotential": "high",
      "targetAudienceReach": "description"
    }`;

    try {
      const resultText = await gemini(prompt, systemPrompt);
      const cleanJson = resultText.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(cleanJson);
      
      db.prepare("INSERT INTO profile_analyses (user_id, analysis_json, score) VALUES (?, ?, ?)").run(
        userId,
        cleanJson,
        analysis.overallScore
      );
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Profile Analysis Error:", error.message);
      res.status(500).json({ 
        error: error.message,
        isAiError: true 
      });
    }
  });

  app.post("/api/generate-post", async (req, res) => {
    const { userId, topic, postType, tone, context, targetAudience } = req.body;
    const systemPrompt = "You are a LinkedIn viral content expert. Posts you've written have reached 100k+ impressions. You understand the LinkedIn algorithm deeply. Return ONLY valid JSON.";
    const prompt = `Generate a viral LinkedIn post for a ${postType} about "${topic}".
    Tone: ${tone}
    Context: ${context}
    Target Audience: ${targetAudience}
    
    Return this exact JSON shape:
    {
      "post": "full post text with \\n line breaks",
      "hook": "just the first line",
      "viralityScore": 85,
      "viralityReason": "why this will perform well",
      "bestPostingTime": "Tuesday 8-9am",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
      "engagementPrediction": { "likes": "200-500", "comments": "30-80", "reposts": "20-50" },
      "variations": ["alternative hook 1", "alternative hook 2"]
    }`;

    try {
      const resultText = await gemini(prompt, systemPrompt);
      const cleanJson = resultText.replace(/```json|```/g, "").trim();
      const postData = JSON.parse(cleanJson);
      
      db.prepare("INSERT INTO posts (user_id, content, status, virality_score, topic, post_type) VALUES (?, ?, 'draft', ?, ?, ?)").run(
        userId,
        postData.post,
        postData.viralityScore,
        topic,
        postType
      );
      
      res.json(postData);
    } catch (error: any) {
      console.error("Post Generation Error:", error.message);
      res.status(500).json({ 
        error: error.message,
        isAiError: true 
      });
    }
  });

  app.post("/api/score-post", async (req, res) => {
    const { content } = req.body;
    const prompt = `Score this LinkedIn post for virality and provide feedback.
    Content: ${content}
    
    Return this exact JSON shape:
    {
      "viralityScore": 75,
      "hookStrength": 80,
      "readabilityScore": 70,
      "valueScore": 85,
      "emotionalResonance": 65,
      "ctaStrength": 60,
      "verdict": "one sentence verdict",
      "topFix": "most important improvement",
      "improvedHook": "rewritten first line",
      "predictedImpressions": "medium"
    }`;

    try {
      const resultText = await gemini(prompt);
      const cleanJson = resultText.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/optimize-section", async (req, res) => {
    const { section, content, context } = req.body;
    const prompt = `Optimize this LinkedIn ${section} section.
    Current Content: ${content}
    Context: ${context}
    
    Return this exact JSON shape:
    {
      "optimized": "rewritten section",
      "keyImprovements": ["imp1", "imp2", "imp3"],
      "keywordsAdded": ["kw1", "kw2", "kw3"],
      "seoScore": 88
    }`;

    try {
      const resultText = await gemini(prompt);
      const cleanJson = resultText.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/content-strategy", async (req, res) => {
    const { industry, role, goals, audience } = req.body;
    const prompt = `Create a 30-day LinkedIn content strategy.
    Industry: ${industry}
    Role: ${role}
    Goals: ${goals}
    Audience: ${audience}
    
    Return this exact JSON shape:
    {
      "pillars": [
        { "name": "pillar name", "description": "...", "frequency": "2x/week", "examples": ["topic1", "topic2"] }
      ],
      "weeklySchedule": {
        "monday": "content type + topic idea",
        "tuesday": "...",
        "wednesday": "...",
        "thursday": "...",
        "friday": "..."
      },
      "viralTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
      "contentMix": { "stories": "30%", "insights": "30%", "lists": "25%", "questions": "15%" },
      "growthProjection": "Expected growth description with numbers"
    }`;

    try {
      const resultText = await gemini(prompt);
      const cleanJson = resultText.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/post", async (req, res) => {
    const { userId, content } = req.body;
    const user: any = db.prepare("SELECT access_token FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    try {
      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: `urn:li:person:${userId}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: content },
              shareMediaCategory: "NONE",
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      });

      const result: any = await response.json();
      if (result.id) {
        db.prepare("UPDATE posts SET status = 'published', linkedin_post_id = ? WHERE user_id = ? AND content = ?").run(
          result.id,
          userId,
          content
        );
        res.json({ success: true, postId: result.id });
      } else {
        res.status(400).json({ error: "Failed to post", details: result });
      }
    } catch (error: any) {
      console.error("Post Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
