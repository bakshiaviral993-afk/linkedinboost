// Gemini API services handled server-side to secure keys.

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
  profileSnapshot?: {
    name: string;
    headline: string;
    industry: string;
    profileCompletion: number;
    accountAge: string;
  };
  brandScore?: {
    score: number;
    grade: string;
    strengths: string[];
    weaknesses: string[];
  };
  aiAuditSummary?: {
    topIssues: string[];
    topOpportunities: string[];
    recommendations: string[];
  };
  keywordSeo?: {
    detectedKeywords: string[];
    missingKeywords: string[];
    keywordCoverage: number;
  };
  growthRoadmap30Days?: {
    week1: { theme: string; focus: string; actionItems: string[]; contentIdeas: string[] };
    week2: { theme: string; focus: string; actionItems: string[]; contentIdeas: string[] };
    week3: { theme: string; focus: string; actionItems: string[]; contentIdeas: string[] };
    week4: { theme: string; focus: string; actionItems: string[]; contentIdeas: string[] };
  };
  contentStrategy?: {
    recommendedTopics: string[];
    postingFrequency: string;
    contentPillars: string[];
  };
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

export async function analyzeProfile(profileData: any, userId: string): Promise<ProfileAnalysis> {
  const response = await fetch("/api/analyze-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, profileData })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const err = new Error(errData.error || "Failed to analyze profile");
    (err as any).limitReached = errData.limitReached || response.status === 403;
    throw err;
  }

  return response.json();
}

export async function generatePost(formData: any, userId: string): Promise<PostGeneration> {
  const response = await fetch("/api/generate-post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, formData })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const err = new Error(errData.error || "Failed to generate post");
    (err as any).limitReached = errData.limitReached || response.status === 403;
    throw err;
  }

  return response.json();
}

export async function scorePost(content: string): Promise<PostScore> {
  const response = await fetch("/api/score-post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to score post: ${errorText}`);
  }

  return response.json();
}

export async function optimizeSection(section: string, content: string, context: string): Promise<OptimizationResult> {
  const response = await fetch("/api/optimize-section", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, content, context })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to optimize section: ${errorText}`);
  }

  return response.json();
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  website?: string;
  linkedin?: string;
  summary: string;
  experience: {
    role: string;
    company: string;
    duration: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  skills: string[];
  projects?: {
    name: string;
    description: string;
    bullets: string[];
  }[];
  atsScore: number;
  atsFeedback: string[];
}

export interface CoverLetterData {
  subjectLine?: string;
  letter: string;
  keyHooksUsed: string[];
}

export async function generateResume(params: {
  userId: string;
  fileBase64?: string;
  fileType?: string;
  pastedText?: string;
}): Promise<ResumeData> {
  const response = await fetch("/api/generate-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate optimized ATM resume");
  }

  return response.json();
}

export async function generateCoverLetter(params: {
  userId: string;
  resumeText: string;
  companyName: string;
  jobTitle: string;
  tone: string;
}): Promise<CoverLetterData> {
  const response = await fetch("/api/generate-cover-letter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate matching Cover Letter");
  }

  return response.json();
}

