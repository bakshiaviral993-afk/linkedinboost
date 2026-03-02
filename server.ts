import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";

dotenv.config();

const db = new Database("linkboost.db");
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
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    content TEXT,
    status TEXT DEFAULT 'draft',
    scheduled_at INTEGER,
    linkedin_post_id TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // LinkedIn OAuth Configuration
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("MISSING LINKEDIN CREDENTIALS: Check AI Studio Secrets panel.");
  }

  // Normalize APP_URL to remove trailing slash if present
  const baseAppUrl = process.env.APP_URL?.replace(/\/$/, "");
  const REDIRECT_URI = `${baseAppUrl}/auth/linkedin/callback`;

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      appUrl: process.env.APP_URL,
      hasClientId: !!process.env.LINKEDIN_CLIENT_ID,
      hasClientSecret: !!process.env.LINKEDIN_CLIENT_SECRET
    });
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
      // Exchange code for token
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
      if (tokenData.error) throw new Error(tokenData.error_description);

      // Get user profile
      const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData: any = await profileResponse.json();

      // Store user
      const userId = profileData.sub; // OpenID Connect 'sub' is the unique ID
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
        Date.now() + tokenData.expires_in * 1000
      );

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
              <h2 style="color: #4f46e5; margin-bottom: 0.5rem;">Connection Successful!</h2>
              <p style="color: #64748b;">This window will close automatically.</p>
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
          <body style="font-family: sans-serif; padding: 2rem;">
            <h2 style="color: #ef4444;">Authentication Failed</h2>
            <p>${error.message}</p>
            <button onclick="window.close()">Close Window</button>
          </body>
        </html>
      `);
    }
  });

  app.get("/api/user/:id", (req, res) => {
    const user = db.prepare("SELECT id, name, email, picture FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
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
        db.prepare("INSERT INTO posts (user_id, content, status, linkedin_post_id) VALUES (?, ?, 'published', ?)").run(
          userId,
          content,
          result.id
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
