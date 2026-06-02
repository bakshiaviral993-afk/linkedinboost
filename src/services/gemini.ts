import { GoogleGenAI, Type } from "@google/genai";

// The platform injects GEMINI_API_KEY into the environment
const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY || "" });

export interface ProfileAnalysis {
  overallScore: number;
  grade: string;
  categories: {
    headline: { score: number; feedback: string; optimized: string };
    about: { score: number; feedback: string; optimized: string };
    experience: { score: number; feedback: string };
    skills: { score: number; feedback: string; suggested: string[] };
    network: { score: number; feedback: string };
  };
  strengths: string[];
  criticalFixes: string[];
  profilePowerStatement: string;
  competitorGap: string;
  viralityPotential: string;
  targetAudienceReach: string;
  roadmap30Days: {
    week: string;
    focus: string;
    actionItems: string[];
    contentIdeas: string[];
  }[];
}

export interface PostGeneration {
  post: string;
  hook: string;
  viralityScore: number;
  viralityReason: string;
  bestPostingTime: string;
  hashtags: string[];
  engagementPrediction: { likes: string; comments: string; reposts: string };
  variations: string[];
}

export interface PostScore {
  viralityScore: number;
  hookStrength: number;
  readabilityScore: number;
  valueScore: number;
  emotionalResonance: number;
  ctaStrength: number;
  verdict: string;
  topFix: string;
  improvedHook: string;
  predictedImpressions: string;
}

export interface OptimizationResult {
  optimized: string;
  keyImprovements: string[];
  keywordsAdded: string[];
  seoScore: number;
}

export async function analyzeProfile(profileData: any): Promise<ProfileAnalysis> {
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
    "targetAudienceReach": "description",
    "roadmap30Days": [
      {
        "week": "Week 1: Headline & Core Hook",
        "focus": "Strengthening headline messaging and profile SEO",
        "actionItems": ["Rewrite headline using the optimized AI version", "Detail standard FinTech or BFSI metrics in experience"],
        "contentIdeas": ["A post on FinTech/industry digital transformation benchmarks", "A personal career lesson story"]
      },
      {
        "week": "Week 2: Storytelling & Authority",
        "focus": "...",
        "actionItems": ["...", "..."],
        "contentIdeas": ["...", "..."]
      },
      {
        "week": "Week 3: Engagement & Networking Integration",
        "focus": "...",
        "actionItems": ["...", "..."],
        "contentIdeas": ["...", "..."]
      },
      {
        "week": "Week 4: Scaling Lead Generation",
        "focus": "...",
        "actionItems": ["...", "..."],
        "contentIdeas": ["...", "..."]
      }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generatePost(formData: any): Promise<PostGeneration> {
  const systemPrompt = "You are a LinkedIn viral content expert. Posts you've written have reached 100k+ impressions. You understand the LinkedIn algorithm deeply. Return ONLY valid JSON.";
  const prompt = `Generate a viral LinkedIn post for a ${formData.postType} about "${formData.topic}".
  Tone: ${formData.tone}
  Context: ${formData.context}
  Target Audience: ${formData.targetAudience}
  
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

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function scorePost(content: string): Promise<PostScore> {
  const systemPrompt = "You are a LinkedIn algorithm specialist. You analyze content for virality potential. Return ONLY valid JSON.";
  const prompt = `Analyze and score this LinkedIn post content:
  "${content}"
  
  Return this exact JSON shape:
  {
    "viralityScore": 85,
    "hookStrength": 90,
    "readabilityScore": 80,
    "valueScore": 75,
    "emotionalResonance": 70,
    "ctaStrength": 65,
    "verdict": "Short summary of the post's potential",
    "topFix": "The single most important change to make",
    "improvedHook": "A better version of the first line",
    "predictedImpressions": "1k-5k"
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function optimizeSection(section: string, content: string, context: string): Promise<OptimizationResult> {
  const systemPrompt = "You are a LinkedIn profile optimization expert. You help professionals stand out with high-impact copy. Return ONLY valid JSON.";
  const prompt = `Optimize this LinkedIn ${section} section.
  Current Content: ${content}
  Context: ${context}
  
  Return this exact JSON shape:
  {
    "optimized": "the full rewritten content",
    "keyImprovements": ["improvement 1", "improvement 2", "improvement 3"],
    "keywordsAdded": ["keyword 1", "keyword 2"],
    "seoScore": 95
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}

