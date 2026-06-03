import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Edit3, 
  Check, 
  RotateCcw, 
  Briefcase, 
  Send,
  AlertCircle,
  Award,
  BookOpen,
  Printer,
  ChevronRight,
  Zap
} from "lucide-react";
import { generateResume, generateCoverLetter, type ResumeData, type CoverLetterData } from "../services/gemini";

interface ResumeBuilderProps {
  user: { id: string; name: string; email: string };
}

type Mode = "editor" | "letter" | "ats" | "jd_match";

export default function ResumeBuilder({ user }: ResumeBuilderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume state
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResume, setEditedResume] = useState<ResumeData | null>(null);

  // Cover letter state
  const [letterLoading, setLetterLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [letterTone, setLetterTone] = useState("Professional and persuasive");
  const [activeTab, setActiveTab] = useState<Mode>("editor");

  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // ATS Scan & Hist states
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<{
    atsScore: number;
    readability: number;
    keywordDensity: number;
    achievementImpact: number;
    skillCoverage: number;
    missingKeywords: string[];
    weakAreas: string[];
    recommendations: string[];
  } | null>(null);
  const [atsHistory, setAtsHistory] = useState<any[]>([]);

  // JD Match state
  const [jdLoading, setJdLoading] = useState(false);
  const [targetJd, setTargetJd] = useState("");
  const [jdResult, setJdResult] = useState<{
    matchScore: number;
    missingKeywords: string[];
    missingSkills: string[];
    recommendedChanges: string[];
    tailoredResume: string;
    tailoredLinkedIn: string;
    tailoredCoverLetter: string;
  } | null>(null);

  // History loader
  const fetchAtsHistory = async () => {
    try {
      const res = await fetch(`/api/ats-resume-scan/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAtsHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch ATS History:", err);
    }
  };

  const triggerAtsScan = async () => {
    if (atsLoading) return;
    setAtsLoading(true);
    try {
      const resumeContent = resume ? JSON.stringify(resume) : pastedText;
      const res = await fetch("/api/ats-resume-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, resumeText: resumeContent })
      });
      if (res.ok) {
        const data = await res.json();
        setAtsResult(data);
        fetchAtsHistory();
      }
    } catch (err: any) {
      console.error("ATS Scans Failed:", err);
    } finally {
      setAtsLoading(false);
    }
  };

  const triggerJdMatch = async () => {
    if (!targetJd) return;
    setJdLoading(true);
    try {
      const resumeContent = resume ? JSON.stringify(resume) : pastedText;
      const res = await fetch("/api/jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeContent,
          targetJd
        })
      });
      if (res.ok) {
        const data = await res.json();
        setJdResult(data);
      }
    } catch (err) {
      console.error("Match Engine Failed:", err);
    } finally {
      setJdLoading(false);
    }
  };

  // Handle file choice & reading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setFileName(file.name);
    setFileType(file.type || "application/pdf");
    setError(null);

    const reader = new FileReader();

    // If text file, we can extract text directly
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPastedText(text);
      };
      reader.readAsText(file);
    } else {
      // For PDF / Binary files, send base64 to server where Gemini reads it multimodally!
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        setFileBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setFileBase64(null);
    setFileType(null);
    setPastedText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setFileName(file.name);
    setFileType(file.type || "application/pdf");
    setError(null);

    const reader = new FileReader();
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      reader.onload = (event) => {
        setPastedText(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        setFileBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit to optimize & build resume JSON
  const handleBuildResume = async () => {
    if (!pastedText && !fileBase64) {
      setError("Please paste your resume content or upload a resume file.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await generateResume({
        userId: user.id,
        fileBase64: fileBase64 || undefined,
        fileType: fileType || undefined,
        pastedText: pastedText || undefined
      });

      setResume(data);
      setEditedResume(JSON.parse(JSON.stringify(data))); // Deep Clone
      setIsEditing(false);
      setActiveTab("editor");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while restructuring your resume.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger matching Cover Letter generation
  const handleBuildCoverLetter = async () => {
    if (!resume) return;
    if (!companyName || !jobTitle) {
      setError("Please enter target Company Name and target Job Position first.");
      return;
    }

    setLetterLoading(true);
    setError(null);
    try {
      // Build a text representation of the CV
      const cleanResumeStr = `
Candidate Name: ${resume.name}
Email: ${resume.email}
Phone: ${resume.phone}
Summary: ${resume.summary}
Experience: ${resume.experience.map(e => `${e.role} at ${e.company} (${e.duration}):\n${e.bullets.join("\n")}`).join("\n\n")}
Skills: ${resume.skills.join(", ")}
      `;

      const letterData = await generateCoverLetter({
        userId: user.id,
        resumeText: cleanResumeStr,
        companyName,
        jobTitle,
        tone: letterTone
      });

      setCoverLetter(letterData);
      setActiveTab("letter");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate cover letter.");
    } finally {
      setLetterLoading(false);
    }
  };

  // Clipboard copy utilities
  const copyResumePlainText = () => {
    if (!resume) return;
    let text = `${resume.name}\n${resume.email} | ${resume.phone}\n`;
    if (resume.linkedin) text += `LinkedIn: ${resume.linkedin}\n`;
    if (resume.website) text += `Portfolio: ${resume.website}\n`;
    text += `\nSUMMARY\n${resume.summary}\n`;
    text += `\nPROFESSIONAL EXPERIENCE\n`;
    resume.experience.forEach(exp => {
      text += `${exp.role} | ${exp.company} | ${exp.duration}\n`;
      exp.bullets.forEach(b => text += `- ${b}\n`);
      text += `\n`;
    });
    text += `SKILLS\n${resume.skills.join(", ")}\n\n`;
    text += `EDUCATION\n`;
    resume.education.forEach(edu => {
      text += `${edu.degree} - ${edu.school} (${edu.year})\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  const copyCoverLetter = () => {
    if (!coverLetter) return;
    let text = "";
    if (coverLetter.subjectLine) {
      text += `Subject: ${coverLetter.subjectLine}\n\n`;
    }
    text += coverLetter.letter;
    navigator.clipboard.writeText(text);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  // Directly parse client-printing window
  const triggerPrint = () => {
    window.print();
  };

  const downloadWordResume = () => {
    if (!resume) return;

    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${resume.name} - Resume</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:WordDocument>
    </w:View>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.4;
      color: #1a1a1a;
      margin: 36pt 45pt 36pt 45pt;
    }
    .header {
      margin-bottom: 18pt;
      border-bottom: 2px solid #06b6d4;
      padding-bottom: 8pt;
    }
    .name {
      font-size: 22pt;
      font-weight: bold;
      color: #111827;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .contact-info {
      font-size: 9.5pt;
      color: #4b5563;
      margin-top: 4pt;
    }
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      color: #0891b2;
      text-transform: uppercase;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 2pt;
      margin-top: 14pt;
      margin-bottom: 8pt;
      letter-spacing: 0.5px;
    }
    .summary-text {
      font-size: 9.5pt;
      color: #374151;
      margin-bottom: 12pt;
      text-align: justify;
    }
    .experience-item {
      margin-bottom: 10pt;
    }
    .job-header-table {
      width: 100%;
      margin-bottom: 2pt;
    }
    .job-title {
      font-size: 10pt;
      font-weight: bold;
      color: #111827;
      text-align: left;
    }
    .job-duration {
      font-size: 9pt;
      font-weight: bold;
      color: #4b5563;
      text-align: right;
    }
    .bullet-list {
      margin-top: 2pt;
      margin-bottom: 8pt;
      padding-left: 18pt;
    }
    .bullet-item {
      font-size: 9.5pt;
      color: #374151;
      margin-bottom: 3pt;
    }
    .skills-container {
      font-size: 9.5pt;
      color: #111827;
      margin-bottom: 12pt;
    }
    .skill-tag {
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      padding: 2pt 6pt;
      margin-right: 4pt;
      margin-bottom: 4pt;
      display: inline-block;
      font-size: 8.5pt;
      font-weight: bold;
    }
    .edu-item {
      font-size: 9.5pt;
      margin-bottom: 6pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resume.name}</div>
    <div class="contact-info">
      ${resume.email} &bull; ${resume.phone}
      ${resume.linkedin ? ` &bull; ${resume.linkedin}` : ""}
      ${resume.website ? ` &bull; ${resume.website}` : ""}
    </div>
  </div>

  <div class="section-title">Professional Summary</div>
  <div class="summary-text">${resume.summary}</div>

  <div class="section-title">Professional Experience</div>
  ${resume.experience.map(exp => `
    <div class="experience-item">
      <table class="job-header-table" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="job-title"><b>${exp.role}</b> at <span style="color: #0891b2;">${exp.company}</span></td>
          <td class="job-duration">${exp.duration}</td>
        </tr>
      </table>
      <ul class="bullet-list">
        ${exp.bullets.map(bullet => `<li class="bullet-item">${bullet}</li>`).join("")}
      </ul>
    </div>
  `).join("")}

  <div class="section-title">Core Competencies & Skills</div>
  <div class="skills-container" style="line-height: 1.8;">
    ${resume.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join(" ")}
  </div>

  <div class="section-title">Education & Qualifications</div>
  ${resume.education.map(edu => `
    <table class="job-header-table" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 4pt;">
      <tr>
        <td class="job-title"><b>${edu.degree}</b> &bull; <span style="font-weight: normal; color: #4b5563;">${edu.school}</span></td>
        <td class="job-duration">${edu.year}</td>
      </tr>
    </table>
  `).join("")}
</body>
</html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resume.name.replace(/\s+/g, '_')}_ATS_Resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadWordCoverLetter = () => {
    if (!coverLetter) return;

    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Cover Letter - ${resume?.name || "Candidate"}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:WordDocument>
    </w:View>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.5;
      color: #1a1a1a;
      margin: 36pt 45pt 36pt 45pt;
    }
    .subject {
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 24pt;
      color: #111827;
    }
    .letter-body {
      font-size: 10.5pt;
      color: #374151;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  ${coverLetter.subjectLine ? `<div class="subject"><b>Subject:</b> ${coverLetter.subjectLine}</div>` : ""}
  <div class="letter-body">${coverLetter.letter}</div>
</body>
</html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(resume?.name || "Candidate").replace(/\s+/g, '_')}_Cover_Letter.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDFResume = () => {
    if (!resume) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    let y = 60;

    const addTextWrapped = (text: string, x: number, fontSize: number, style = 'normal', color = '#374151') => {
      doc.setFont('helvetica', style);
      doc.setFontSize(fontSize);
      doc.setTextColor(color);
      const wrapped = doc.splitTextToSize(text, 500); // A4 content width (595 - 90)
      wrapped.forEach((line: string) => {
        if (y > 770) {
          doc.addPage();
          y = 45;
        }
        doc.text(line, x, y);
        y += fontSize * 1.35;
      });
    };

    const addHeading = (title: string) => {
      if (y > 730) {
        doc.addPage();
        y = 45;
      }
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor('#0891b2'); // Modern Teal
      doc.text(title.toUpperCase(), 45, y);
      y += 6;
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(1);
      doc.line(45, y, 550, y);
      y += 14;
    };

    // Header segment
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor('#111827');
    doc.text(resume.name.toUpperCase(), 45, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor('#4b5563');
    const contactString = `${resume.email}   |   ${resume.phone}${resume.linkedin ? `   |   ${resume.linkedin}` : ''}${resume.website ? `   |   ${resume.website}` : ''}`;
    doc.text(contactString, 45, y);
    y += 6;
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(2);
    doc.line(45, y, 550, y);
    y += 18;

    // Professional Summary
    addHeading("Professional Summary");
    addTextWrapped(resume.summary, 45, 9.5, 'normal', '#374151');
    y += 5;

    // Professional Experience
    addHeading("Professional Experience");
    resume.experience.forEach(exp => {
      if (y > 740) {
        doc.addPage();
        y = 45;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor('#111827');
      doc.text(exp.role, 45, y);

      const durationStr = exp.duration || "";
      const durationWidth = doc.getTextWidth(durationStr);
      doc.text(durationStr, 550 - durationWidth, y);

      y += 13;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor('#0891b2');
      doc.text(`at ${exp.company}`, 45, y);
      y += 15;

      exp.bullets.forEach(bullet => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor('#374151');
        const wrappedBullet = doc.splitTextToSize(`•  ${bullet}`, 480);
        wrappedBullet.forEach((line: string, index: number) => {
          if (y > 770) {
            doc.addPage();
            y = 45;
          }
          const indentX = index === 0 ? 55 : 62;
          doc.text(line, indentX, y);
          y += 13;
        });
      });
      y += 5;
    });

    // Core Competencies & Skills
    addHeading("Core Competencies & Skills");
    const skillsStr = resume.skills.join("   |   ");
    addTextWrapped(skillsStr, 45, 9.5, 'normal', '#111827');
    y += 10;

    // Education
    addHeading("Education & Qualifications");
    resume.education.forEach(edu => {
      if (y > 750) {
        doc.addPage();
        y = 45;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor('#111827');
      doc.text(edu.degree, 45, y);

      const yearWidth = doc.getTextWidth(edu.year);
      doc.text(edu.year, 550 - yearWidth, y);

      y += 13;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor('#4b5563');
      doc.text(edu.school, 45, y);
      y += 18;
    });

    doc.save(`${resume.name.replace(/\s+/g, '_')}_ATS_Resume.pdf`);
  };

  const downloadPDFCoverLetter = () => {
    if (!coverLetter) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    let y = 60;

    if (resume) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor('#111827');
      doc.text(resume.name.toUpperCase(), 45, y);
      y += 16;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor('#4b5563');
      const contactString = `${resume.email}   |   ${resume.phone}${resume.linkedin ? `   |   ${resume.linkedin}` : ''}${resume.website ? `   |   ${resume.website}` : ''}`;
      doc.text(contactString, 45, y);
      y += 6;
      doc.setDrawColor(6, 182, 212);
      doc.setLineWidth(1);
      doc.line(45, y, 550, y);
      y += 28;
    }

    if (coverLetter.subjectLine) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor('#111827');
      const wrappedSubject = doc.splitTextToSize(`SUBJECT: ${coverLetter.subjectLine}`, 500);
      wrappedSubject.forEach((line: string) => {
        doc.text(line, 45, y);
        y += 15;
      });
      y += 15;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor('#374151');

    const paragraphs = coverLetter.letter.split('\n');
    paragraphs.forEach((p: string) => {
      const trimmed = p.trim();
      if (!trimmed) {
        y += 12;
        return;
      }
      const wrapped = doc.splitTextToSize(trimmed, 500);
      wrapped.forEach((line: string) => {
        if (y > 770) {
          doc.addPage();
          y = 45;
        }
        doc.text(line, 45, y);
        y += 14.5;
      });
      y += 10;
    });

    doc.save(`${(resume?.name || "Candidate").replace(/\s+/g, '_')}_Cover_Letter.pdf`);
  };

  const saveEdits = () => {
    if (editedResume) {
      setResume(editedResume);
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 print:py-0 print:max-w-full print:w-full">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-accent text-sm font-bold tracking-wider uppercase mb-1 font-mono">
            <Sparkles className="w-4 h-4" /> ATS CV Restructuring Suite
          </div>
          <h1 className="text-3xl font-display font-black text-text tracking-tight">ATS Resume & Cover Letter Builder</h1>
          <p className="text-muted text-sm mt-1 max-w-2xl">
            Upload your legacy CV. Gemini 2.5 Flash will rewrite bullet points using high-impact metric verbs, grade your keywords, and build a persuasive custom cover letter.
          </p>
        </div>
        {resume && (
          <div className="flex items-center gap-2 self-start md:self-center">
            <button 
              onClick={() => {
                setResume(null);
                setCoverLetter(null);
                clearFile();
              }}
              className="btn-glass flex items-center gap-2 py-2 px-3 text-xs text-muted"
            >
              <RotateCcw className="w-4.5 h-4.5" /> Start New CV
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 text-danger text-sm rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-grow">
            <div className="font-bold">Execution Failed</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {!resume ? (
        /* FIRST STATE: Upload / Paste Resume */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* File Picker */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col h-full">
              <h3 className="font-display font-bold text-lg text-text mb-4">Option A: Upload CV File</h3>
              
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex-grow border-2 border-dashed border-border hover:border-accent hover:bg-surface2 rounded-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 min-h-[220px]"
              >
                <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent mb-4">
                  <Upload className="w-6 h-6 animate-pulse" />
                </div>
                
                {fileName ? (
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-text truncate max-w-[200px] mx-auto">{fileName}</p>
                    <p className="text-muted text-xs font-mono uppercase">Uploaded successfully</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      className="text-danger hover:underline text-xs block mx-auto mt-2 font-bold"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-sm text-text mb-1">Drag and Drop your CV File</h4>
                    <p className="text-muted text-xs max-w-xs mx-auto mb-2">
                      Supports PDF or Plain TXT records (Maximum size of 10MB)
                    </p>
                    <span className="text-accent text-xs font-bold underline">or Browse Files</span>
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.md"
                  className="hidden"
                />
              </div>

              <div className="mt-4 p-3 bg-accent/5 border border-accent/10 rounded-xl text-[11px] text-muted flex gap-2">
                <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5 animate-bounce" />
                <span>Multimodal PDF Parsing handles native scanning directly via Gemini model, keeping structural formatting crisp.</span>
              </div>
            </div>
          </div>

          {/* Raw Text Box */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col h-full">
              <h3 className="font-display font-bold text-lg text-text mb-2">Option B: Copy & Paste Resume Text</h3>
              <p className="text-xs text-muted mb-4">
                If you don't have a clean PDF, paste your current text, experiences, or LinkedIn profile highlights below.
              </p>

              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste professional text highlights (Summary, employment record, project list, skill sets)..."
                className="flex-grow bg-surface2 border border-border p-4 rounded-xl text-sm outline-none font-mono focus:border-accent min-h-[260px] resize-none text-text"
              />

              <div className="mt-6 flex items-center justify-end">
                <button
                  onClick={handleBuildResume}
                  disabled={loading}
                  className="btn-primary py-3 px-6 h-12 text-sm flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                      <span>Optimizing CV Bullet metrics...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Rebuild legacy CV data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SECOND STATE: Resume Restructured & Loaded */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: ATS Diagnostics & Cover Letter Inputs */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full print:hidden">
            
            {/* ATS Score Panel */}
            <div className="bg-surface border border-border p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-black text-lg text-text">ATS Optimization Score</h3>
                <span className="text-xs font-bold font-mono px-2 py-0.5 bg-accent/20 text-accent rounded-full border border-accent/30">
                  Targeted Benchmark
                </span>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent2 p-0.5 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <div className="w-full h-full bg-surface rounded-full flex flex-col items-center justify-center select-none">
                    <span className="text-2xl font-black font-display text-accent leading-none">
                      {resume.atsScore}
                    </span>
                    <span className="text-[10px] text-muted font-bold tracking-widest leading-none uppercase mt-0.5">
                      ATS
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-text">Approved for Applicant Screening</h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    All passive or task-focused highlights were restructured into results-oriented metrics utilizing high-volume strategic target buzzwords.
                  </p>
                </div>
              </div>

              <h4 className="font-bold text-xs text-muted uppercase tracking-widest mb-3">RESTUCTURINGS APPLIED</h4>
              <ul className="space-y-2.5">
                {resume.atsFeedback.map((feedback, idx) => (
                  <li key={idx} className="text-xs text-text flex items-start gap-2 leading-relaxed">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5 border border-accent/20 rounded-full p-0.5 bg-accent/15" />
                    <span>{feedback}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cover Letter Creator */}
            <div className="bg-surface border border-border p-6 rounded-2xl">
              <h3 className="font-display font-black text-lg text-text mb-2">Build Matching Cover Letter</h3>
              <p className="text-xs text-muted mb-4">
                Generate a highly tailored draft mapping your exact optimized CV achievements to custom hiring requirements.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                    Target Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Goldman Sachs or Stripe"
                    className="w-full bg-surface2 border border-border px-3 py-2 text-sm rounded-xl outline-none focus:border-accent text-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                    Target Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Director of Product or VP Finance"
                    className="w-full bg-surface2 border border-border px-3 py-2 text-sm rounded-xl outline-none focus:border-accent text-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                    Persuasion Tone
                  </label>
                  <select
                    value={letterTone}
                    onChange={(e) => setLetterTone(e.target.value)}
                    className="w-full bg-surface2 border border-border px-3 py-2 text-sm rounded-xl outline-none focus:border-accent text-text"
                  >
                    <option value="Professional and persuasive">Professional and Sincere</option>
                    <option value="Bold, authoritative, and visionary">Bold & High Agency</option>
                    <option value="Analytical, framework-driven, and metric-focused">Analytical & Numbers-First</option>
                    <option value="Warm, mission-driven, and team-oriented">Mission-Driven & Relatable</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    disabled={letterLoading || !companyName || !jobTitle}
                    onClick={handleBuildCoverLetter}
                    className="w-full btn-primary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {letterLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                        <span>Applying context parameters...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Generate custom cover letter</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Print Friendly Tips */}
            <div className="p-4 bg-muted/10 border border-border rounded-2xl">
              <h4 className="font-bold text-xs text-text mb-1 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-accent" /> Printing Guide
              </h4>
              <p className="text-[11px] text-muted leading-relaxed">
                Clicking "Print" optimized the layout for A4 and US Letter sizes. For premium hard-copies, hide headers/footers in your systemic browser print parameters and save directly as PDF!
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Document Sandbox (CV + Cover Letter) */}
          <div className="lg:col-span-7 flex flex-col gap-6 print:col-span-12 print:w-full print:p-0">
            
            {/* View Selection Selector */}
            <div className="bg-surface border border-border p-2.5 rounded-2xl flex flex-wrap md:flex-nowrap gap-2 print:hidden">
              <button
                onClick={() => setActiveTab("editor")}
                className={`flex-grow flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black rounded-xl transition-all ${
                  activeTab === "editor" 
                    ? "bg-accent/15 text-accent font-extrabold border border-accent/25" 
                    : "text-muted hover:text-text hover:bg-surface2"
                }`}
              >
                <FileText className="w-4 h-4" /> ATS Rebuilt Resume
              </button>
              
              <button
                onClick={() => setActiveTab("letter")}
                className={`flex-grow flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black rounded-xl transition-all ${
                  activeTab === "letter" 
                    ? "bg-accent/15 text-accent font-extrabold border border-accent/25" 
                    : "text-muted hover:text-text hover:bg-surface2"
                }`}
              >
                <Briefcase className="w-4 h-4" /> Cover Letter
              </button>

              <button
                onClick={() => {
                  setActiveTab("ats");
                  triggerAtsScan();
                }}
                className={`flex-grow flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black rounded-xl transition-all ${
                  activeTab === "ats" 
                    ? "bg-accent/15 text-accent font-extrabold border border-accent/25" 
                    : "text-muted hover:text-text hover:bg-surface2"
                }`}
              >
                <Sparkles className="w-4 h-4 animate-pulse" /> ATS Score Scanner
              </button>

              <button
                onClick={() => setActiveTab("jd_match")}
                className={`flex-grow flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black rounded-xl transition-all ${
                  activeTab === "jd_match" 
                    ? "bg-accent/15 text-accent font-extrabold border border-accent/25" 
                    : "text-muted hover:text-text hover:bg-surface2"
                }`}
              >
                <Zap className="w-4 h-4" /> JD Match Engine
              </button>
            </div>

            {/* Sandbox Operations */}
            <div className="bg-surface border border-border p-4.5 rounded-2xl flex items-center justify-between shadow-sm print:hidden">
              <div className="flex gap-2">
                {activeTab === "editor" ? (
                  <button
                    onClick={() => {
                      if (isEditing) {
                        saveEdits();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    className="btn-glass py-1.5 px-3 text-xs flex items-center gap-1.5 text-text"
                  >
                    {isEditing ? (
                      <>
                        <Check className="w-4 h-4 text-accent" /> Save Edits
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" /> Edit Core CV Copy
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-muted font-mono font-bold uppercase py-1">Cover letter editor</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {activeTab === "editor" ? (
                  <>
                    <button
                      onClick={copyResumePlainText}
                      className="btn-glass py-1.5 px-2.5 text-xs flex items-center gap-1 hover:bg-surface2 text-muted hover:text-text transition-colors"
                      title="Copy resume text to clipboard"
                    >
                      {copiedResume ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedResume ? "Copied!" : "Copy Plain"}</span>
                    </button>
                    <button
                      onClick={downloadPDFResume}
                      className="btn-primary py-1.5 px-3 text-[11px] h-8 flex items-center gap-1.5"
                      title="Export resume as a highly optimized PDF file"
                    >
                      <Download className="w-3.5 h-3.5 animate-bounce" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={downloadWordResume}
                      className="btn-secondary py-1.5 px-3 text-[11px] h-8 flex items-center gap-1.5 bg-surface2 border border-border hover:border-accent/30"
                      title="Export resume as professional Word Document (.doc)"
                    >
                      <FileText className="w-3.5 h-3.5 text-accent animate-pulse" />
                      <span>Download Word</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={copyCoverLetter}
                      className="btn-glass py-1.5 px-2.5 text-xs flex items-center gap-1 hover:bg-surface2 text-muted hover:text-text transition-colors"
                      title="Copy cover letter text to clipboard"
                    >
                      {copiedLetter ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLetter ? "Copied!" : "Copy Text"}</span>
                    </button>
                    <button
                      onClick={downloadPDFCoverLetter}
                      className="btn-primary py-1.5 px-3 text-[11px] h-8 flex items-center gap-1.5"
                      title="Export cover letter as a highly optimized PDF file"
                    >
                      <Download className="w-3.5 h-3.5 animate-bounce" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={downloadWordCoverLetter}
                      className="btn-secondary py-1.5 px-3 text-[11px] h-8 flex items-center gap-1.5 bg-surface2 border border-border hover:border-accent/30"
                      title="Export cover letter as professional Word Document (.doc)"
                    >
                      <FileText className="w-3.5 h-3.5 text-accent animate-pulse" />
                      <span>Download Word</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* WORKBENCH: THE ACTUAL SHEET PAPER VIEW */}
            <div className="relative">
              
              {/* Tabs Content: ATS Resume Rebuilt Sheet */}
              {activeTab === "editor" && (
                <div 
                  id="printable-resume"
                  className={`bg-white text-gray-900 duration-300 rounded-2xl shadow-xl p-8 md:p-12 font-sans border border-gray-200 min-h-[900px] flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none`}
                >
                  <div>
                    {/* Header Details */}
                    <div className="border-b border-gray-300 pb-6 mb-6">
                      {isEditing && editedResume ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editedResume.name}
                            onChange={(e) => setEditedResume({ ...editedResume, name: e.target.value })}
                            className="text-2xl font-black font-display text-gray-900 border border-gray-300 w-full p-1 rounded font-sans"
                            placeholder="Full Name"
                          />
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <input
                              type="text"
                              value={editedResume.email}
                              onChange={(e) => setEditedResume({ ...editedResume, email: e.target.value })}
                              className="border border-gray-300 p-1 rounded font-sans"
                              placeholder="Email"
                            />
                            <input
                              type="text"
                              value={editedResume.phone}
                              onChange={(e) => setEditedResume({ ...editedResume, phone: e.target.value })}
                              className="border border-gray-300 p-1 rounded font-sans"
                              placeholder="Phone"
                            />
                            <input
                              type="text"
                              value={editedResume.linkedin || ""}
                              onChange={(e) => setEditedResume({ ...editedResume, linkedin: e.target.value })}
                              className="border border-gray-300 p-1 rounded col-span-2 font-sans"
                              placeholder="LinkedIn URL"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center md:text-left">
                          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 font-sans mb-1.5 leading-none">
                            {resume.name}
                          </h2>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-gray-600 font-medium">
                            <span>{resume.email}</span>
                            <span className="text-gray-300">•</span>
                            <span>{resume.phone}</span>
                            {resume.linkedin && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-700 underline font-mono text-[11px]">{resume.linkedin}</span>
                              </>
                            )}
                            {resume.website && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-700 underline font-mono text-[11px]">{resume.website}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary Section */}
                    <div className="mb-6.5">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 font-sans">
                        Professional Summary
                      </h3>
                      {isEditing && editedResume ? (
                        <textarea
                          value={editedResume.summary}
                          onChange={(e) => setEditedResume({ ...editedResume, summary: e.target.value })}
                          className="w-full text-xs text-gray-700 leading-relaxed border border-gray-300 p-2 rounded resize-y font-sans min-h-[80px]"
                        />
                      ) : (
                        <p className="text-xs text-gray-700 leading-relaxed text-left font-sans font-medium">
                          {resume.summary}
                        </p>
                      )}
                    </div>

                    {/* Employment Record Section */}
                    <div className="mb-6.5">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3.5 font-sans">
                        Professional Experience
                      </h3>
                      <div className="space-y-4">
                        {resume.experience.map((exp, expIdx) => (
                          <div key={expIdx} className="group">
                            <div className="flex justify-between items-baseline mb-1">
                              <div>
                                <span className="text-xs font-bold text-gray-900 font-sans">
                                  {isEditing && editedResume ? (
                                    <input
                                      type="text"
                                      value={editedResume.experience[expIdx].role}
                                      onChange={(e) => {
                                        const nextExp = [...editedResume.experience];
                                        nextExp[expIdx].role = e.target.value;
                                        setEditedResume({ ...editedResume, experience: nextExp });
                                      }}
                                      className="border border-gray-300 p-0.5 rounded text-xs font-sans font-bold"
                                    />
                                  ) : (
                                    exp.role
                                  )}
                                </span>
                                <span className="text-gray-400 mx-1.5">•</span>
                                <span className="text-xs font-semibold text-gray-700 font-sans">
                                  {isEditing && editedResume ? (
                                    <input
                                      type="text"
                                      value={editedResume.experience[expIdx].company}
                                      onChange={(e) => {
                                        const nextExp = [...editedResume.experience];
                                        nextExp[expIdx].company = e.target.value;
                                        setEditedResume({ ...editedResume, experience: nextExp });
                                      }}
                                      className="border border-gray-300 p-0.5 rounded text-xs font-sans font-semibold"
                                    />
                                  ) : (
                                    exp.company
                                  )}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-gray-500 font-sans">
                                {isEditing && editedResume ? (
                                  <input
                                    type="text"
                                    value={editedResume.experience[expIdx].duration}
                                    onChange={(e) => {
                                      const nextExp = [...editedResume.experience];
                                      nextExp[expIdx].duration = e.target.value;
                                      setEditedResume({ ...editedResume, experience: nextExp });
                                    }}
                                    className="border border-gray-300 p-0.5 rounded text-[10px] text-right font-sans font-bold"
                                  />
                                ) : (
                                  exp.duration
                                )}
                              </span>
                            </div>
                            
                            {/* Bullets */}
                            <ul className="list-disc pl-4 text-xs text-gray-700 leading-relaxed font-sans space-y-1">
                              {exp.bullets.map((bullet, bulletIdx) => (
                                <li key={bulletIdx} className="text-left font-sans">
                                  {isEditing && editedResume ? (
                                    <textarea
                                      value={editedResume.experience[expIdx].bullets[bulletIdx]}
                                      onChange={(e) => {
                                        const nextExp = [...editedResume.experience];
                                        nextExp[expIdx].bullets[bulletIdx] = e.target.value;
                                        setEditedResume({ ...editedResume, experience: nextExp });
                                      }}
                                      className="w-full text-xs text-gray-700 leading-relaxed border border-gray-200 rounded p-1 font-sans resize-y"
                                    />
                                  ) : (
                                    bullet
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills Grid */}
                    <div className="mb-6.5">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 font-sans">
                        Core Competencies & Skills
                      </h3>
                      {isEditing && editedResume ? (
                        <input
                          type="text"
                          value={editedResume.skills.join(", ")}
                          onChange={(e) => {
                            const parsedSkills = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                            setEditedResume({ ...editedResume, skills: parsedSkills });
                          }}
                          className="w-full text-xs text-gray-750 border border-gray-300 p-1.5 rounded font-sans"
                          placeholder="Skill 1, Skill 2, Custom Skill 3..."
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1.5 pt-1 text-left">
                          {resume.skills.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] font-bold text-gray-800 bg-gray-100 border border-gray-200.5 py-0.5 px-2 rounded-md font-sans"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Education Grid */}
                    <div className="mb-6.5">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-2.5 font-sans">
                        Education & Qualifications
                      </h3>
                      <div className="space-y-2">
                        {resume.education.map((edu, eduIdx) => (
                          <div key={eduIdx} className="flex justify-between items-baseline text-xs text-gray-700">
                            <div>
                              <span className="font-bold text-gray-900 font-sans">
                                {isEditing && editedResume ? (
                                  <input
                                    type="text"
                                    value={editedResume.education[eduIdx].degree}
                                    onChange={(e) => {
                                      const nextEdu = [...editedResume.education];
                                      nextEdu[eduIdx].degree = e.target.value;
                                      setEditedResume({ ...editedResume, education: nextEdu });
                                    }}
                                    className="border border-gray-300 p-0.5 rounded font-sans text-xs font-bold"
                                  />
                                ) : (
                                  edu.degree
                                )}
                              </span>
                              <span className="text-gray-400 mx-1.5">•</span>
                              <span className="font-medium font-sans">
                                {isEditing && editedResume ? (
                                  <input
                                    type="text"
                                    value={editedResume.education[eduIdx].school}
                                    onChange={(e) => {
                                      const nextEdu = [...editedResume.education];
                                      nextEdu[eduIdx].school = e.target.value;
                                      setEditedResume({ ...editedResume, education: nextEdu });
                                    }}
                                    className="border border-gray-300 p-0.5 rounded font-sans text-xs"
                                  />
                                ) : (
                                  edu.school
                                )}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 font-sans">
                              {isEditing && editedResume ? (
                                <input
                                  type="text"
                                  value={editedResume.education[eduIdx].year}
                                  onChange={(e) => {
                                    const nextEdu = [...editedResume.education];
                                    nextEdu[eduIdx].year = e.target.value;
                                    setEditedResume({ ...editedResume, education: nextEdu });
                                  }}
                                  className="border border-gray-300 p-0.5 rounded font-sans text-[10px] text-right font-bold"
                                />
                              ) : (
                                edu.year
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic Footer watermark for physical printout */}
                  <div className="border-t border-gray-100 pt-3 text-[9px] text-gray-400 flex justify-between items-center font-mono">
                    <span>ATS Verified & Restructured (Score: {resume.atsScore}/100)</span>
                    <span>Created via Narratiq Suite</span>
                  </div>
                </div>
              )}

              {/* Tabs Content: Cover Letter View */}
              {activeTab === "letter" && !coverLetter && (
                <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-sm min-h-[600px] flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-4 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                    <Briefcase className="w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="font-display font-black text-xl text-text mb-2">
                    Tailored Executive Cover Letter
                  </h3>
                  <p className="text-xs text-muted mb-8 max-w-md leading-relaxed">
                    Generate an ATS-aligned custom cover letter that maps your newly structured resume achievements directly to your target company's needs.
                  </p>

                  <div className="w-full space-y-4 max-w-sm text-left mb-6 bg-surface2/40 p-5 rounded-2xl border border-border/80">
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                        Target Company
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Stripe or Anthropic"
                        className="w-full bg-surface border border-border px-3 py-2 text-sm rounded-xl outline-none focus:border-accent text-text focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                        Desired Role / Position
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Lead Product Designer"
                        className="w-full bg-surface border border-border px-3 py-2 text-sm rounded-xl outline-none focus:border-accent text-text focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                        Persuasion Archetype
                      </label>
                      <select
                        value={letterTone}
                        onChange={(e) => setLetterTone(e.target.value)}
                        className="w-full bg-surface border border-border px-3 py-2 text-sm rounded-xl outline-none focus:border-accent text-text focus:ring-1 focus:ring-accent"
                      >
                        <option value="Professional and persuasive">Professional and Sincere</option>
                        <option value="Bold, authoritative, and visionary">Bold & High Agency</option>
                        <option value="Analytical, framework-driven, and metric-focused">Analytical & Numbers-First</option>
                        <option value="Warm, mission-driven, and team-oriented">Mission-Driven & Relatable</option>
                      </select>
                    </div>
                  </div>

                  <button
                    disabled={letterLoading || !companyName || !jobTitle}
                    onClick={handleBuildCoverLetter}
                    className="btn-primary w-full max-w-xs py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {letterLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Structuring matching hooks...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-bg" />
                        <span>Generate Cover Letter</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeTab === "letter" && coverLetter && (
                <div className="bg-white text-gray-900 rounded-2xl p-8 md:p-12 font-sans border border-gray-200 shadow-xl min-h-[900px] flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
                  <div>
                    {coverLetter.subjectLine && (
                      <div className="border-b border-gray-300 pb-4 mb-6 text-left">
                        <span className="text-xs font-black font-semibold text-gray-500 uppercase font-mono block mb-1">
                          Subject Line
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 font-sans">
                          {coverLetter.subjectLine}
                        </h4>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap text-xs text-gray-700 leading-relaxed text-left font-sans font-medium">
                      {coverLetter.letter}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col gap-2.5 text-left">
                    <span className="text-[10px] font-black font-semibold text-gray-400 uppercase tracking-widest font-mono">
                      INJECTED PERSUASION PERSPECTIVES
                    </span>
                    <ul className="space-y-1">
                      {coverLetter.keyHooksUsed.map((hook, idx) => (
                        <li key={idx} className="text-[10px] text-gray-500 leading-relaxed font-sans">
                          • {hook}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TABS CONTENT: ATS SCANNER PANEL (FEATURE 2) */}
              {activeTab === "ats" && (
                <div className="space-y-6">
                  {atsLoading ? (
                    <div className="bg-surface border border-border p-12 rounded-2xl text-center flex flex-col items-center justify-center min-h-[400px]">
                      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="font-display font-bold text-base text-text">Scanning Document Authority...</p>
                      <p className="text-xs text-muted mt-1">Calculating applicant keywords, compliance markers, and readability weights...</p>
                    </div>
                  ) : atsResult ? (
                    <div className="space-y-6 animate-fade-in text-left">
                      {/* Live Scores Aggregates */}
                      <div className="card grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 rounded-xl bg-accent/5 border border-accent/10">
                          <span className="font-display font-black text-2xl block text-accent">{atsResult.atsScore}</span>
                          <span className="text-3xs text-muted uppercase tracking-wider font-extrabold">ATS Score</span>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-surface2/50 border border-border">
                          <span className="font-display font-black text-2xl block text-text">{atsResult.readability}</span>
                          <span className="text-3xs text-muted uppercase tracking-wider font-extrabold">Readability</span>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-surface2/50 border border-border">
                          <span className="font-display font-black text-2xl block text-text">{atsResult.keywordDensity}</span>
                          <span className="text-3xs text-muted uppercase tracking-wider font-extrabold">Keywords %</span>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-surface2/50 border border-border">
                          <span className="font-display font-black text-2xl block text-text">{atsResult.achievementImpact}</span>
                          <span className="text-3xs text-muted uppercase tracking-wider font-extrabold">STAR Impact</span>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-surface2/50 border border-border col-span-2 md:col-span-1">
                          <span className="font-display font-black text-2xl block text-text">{atsResult.skillCoverage}</span>
                          <span className="text-3xs text-muted uppercase tracking-wider font-extrabold">Skill Cover</span>
                        </div>
                      </div>

                      {/* Missing Keywords tags */}
                      <div className="card space-y-3">
                        <h4 className="font-display font-black text-sm text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                          <AlertCircle className="w-4.5 h-4.5" /> Missing Search Engine Optimization Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {atsResult.missingKeywords?.length > 0 ? (
                            atsResult.missingKeywords.map((kw, i) => (
                              <span key={i} className="px-2.5 py-1 text-2xs font-bold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                                {kw}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted">No missing optimization keywords flagged. Excellent SEO rating!</span>
                          )}
                        </div>
                      </div>

                      {/* Weak Areas & Bullet Recommendations Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="card space-y-3 bg-zinc-900/40">
                          <h4 className="font-display font-bold text-xs text-muted uppercase tracking-widest">Structural Weak Areas</h4>
                          <ul className="space-y-2">
                            {atsResult.weakAreas?.map((w, idx) => (
                              <li key={idx} className="text-2xs text-muted flex items-start gap-2">
                                <span className="text-rose-500 font-extrabold mt-0.5">•</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="card space-y-3 bg-zinc-900/40">
                          <h4 className="font-display font-bold text-xs text-muted uppercase tracking-widest">Recruiter Optimization Action Points</h4>
                          <ul className="space-y-2">
                            {atsResult.recommendations?.map((r, idx) => (
                              <li key={idx} className="text-2xs text-muted flex items-start gap-2">
                                <span className="text-accent font-extrabold mt-0.5">✓</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Historical Scans tracker */}
                      {atsHistory.length > 1 && (
                        <div className="card space-y-3">
                          <h4 className="font-display font-black text-sm text-text uppercase tracking-widest">Version Audits & Compare Scans</h4>
                          <div className="divide-y divide-border/60">
                            {atsHistory.map((h, i) => (
                              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                                <span className="text-muted flex items-center gap-2">
                                  <span className="p-1 rounded bg-surface2 text-muted text-3xs font-mono">Run #{atsHistory.length - i}</span>
                                  <span>{new Date(h.created_at * 1000).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                </span>
                                <span className={`font-display font-black px-2 py-0.5 rounded text-xs ${h.atsScore >= 85 ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
                                  Score: {h.atsScore}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-surface border border-dashed border-border p-12 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px] text-muted">
                      <Sparkles className="w-10 h-10 text-muted/30 mb-3 animate-bounce" />
                      <p className="font-display font-black text-sm text-text">Begin ATS Scoring Scan</p>
                      <p className="text-2xs max-w-sm mt-1">This evaluates your newly built resume against strict enterprise parameters and keyword indexes.</p>
                      <button onClick={triggerAtsScan} className="btn-primary mt-4 py-2 px-4 text-xs font-bold">
                        Analyze CV Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TABS CONTENT: JOB DESCRIPTION MATCH ENGINE (FEATURE 3) */}
              {activeTab === "jd_match" && (
                <div className="space-y-6 text-left">
                  <div className="card space-y-4">
                    <h4 className="font-display font-black text-sm text-text uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-5 h-5 text-accent animate-pulse" /> TARGET JOB DESCRIPTION DETAILS
                    </h4>
                    <div>
                      <label className="block text-3xs font-bold text-muted uppercase tracking-wider mb-1.5">Paste Enterprise JD Text</label>
                      <textarea
                        rows={6}
                        value={targetJd}
                        onChange={(e) => setTargetJd(e.target.value)}
                        placeholder="Paste full job posting parameters directly here..."
                        className="w-full bg-bg border border-border rounded-xl p-3 text-xs text-text outline-none focus:border-accent resize-none transition-colors"
                      />
                    </div>

                    <button
                      disabled={jdLoading || !targetJd}
                      onClick={triggerJdMatch}
                      className="btn-primary py-3 px-5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
                    >
                      {jdLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                          <span>Matching CV against JD criteria...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-bg fill-current" />
                          <span>Compare & Build Tailored Files</span>
                        </>
                      )}
                    </button>
                  </div>

                  {jdResult && (
                    <div className="space-y-6 animate-fade-in text-left">
                      {/* Match results dashboard */}
                      <div className="card grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-border pb-5 md:pb-0 md:pr-5 text-center flex flex-col items-center justify-center">
                          <div className="w-24 h-24 bg-accent/15 border-2 border-accent/30 rounded-full flex items-center justify-center font-display font-black text-3xl text-accent mb-2">
                            {jdResult.matchScore}%
                          </div>
                          <span className="text-3xs text-muted uppercase tracking-wider font-extrabold font-mono">JD COMPATIBILITY INDEX</span>
                        </div>

                        <div className="md:col-span-7 space-y-3">
                          <h5 className="font-display font-extrabold text-xs text-text uppercase tracking-widest pt-1">Missing JD Action Factors</h5>
                          <div className="space-y-2">
                            <div>
                              <span className="text-3xs text-muted font-bold uppercase block mb-1">Missing Keywords</span>
                              <div className="flex flex-wrap gap-1.5">
                                {jdResult.missingKeywords?.map((kw, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 rounded text-3xs bg-zinc-800 text-rose-300 font-bold border border-rose-500/10">{kw}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-3xs text-muted font-bold uppercase block mb-1">Missing Skills</span>
                              <div className="flex flex-wrap gap-1.5">
                                {jdResult.missingSkills?.map((sk, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 rounded text-3xs bg-zinc-800 text-sky-300 font-bold border border-sky-500/10">{sk}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tailored suggestions list */}
                      <div className="card space-y-2.5">
                        <h4 className="font-display font-bold text-xs text-muted uppercase tracking-widest">Recommended Strategic Amendments</h4>
                        <ul className="space-y-1.5 pb-1">
                          {jdResult.recommendedChanges?.map((ch, i) => (
                            <li key={i} className="text-2xs text-muted flex items-start gap-1.5">
                              <span className="text-accent font-extrabold">•</span>
                              <span>{ch}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Dynamically Generated Customized outputs templates */}
                      <div className="space-y-4">
                        <h4 className="font-display font-black text-sm text-text uppercase tracking-widest">TAILORED APPLICATION DOCUMENTS</h4>
                        
                        {/* Tailored CV */}
                        <div className="card space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h5 className="font-display font-black text-xs text-accent uppercase tracking-wider">Tailored CV Segment Amendments</h5>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(jdResult.tailoredResume);
                                alert("Tailored CV copy saved to clipboard!");
                              }}
                              className="btn-glass px-2 py-1 text-3xs flex items-center gap-1 text-muted"
                            >
                              <Copy className="w-3 h-3" /> Copy CV Copy
                            </button>
                          </div>
                          <div className="bg-bg border border-border p-3.5 rounded-xl max-h-[220px] overflow-y-auto text-3xs font-mono text-muted whitespace-pre-wrap leading-relaxed">
                            {jdResult.tailoredResume}
                          </div>
                        </div>

                        {/* Tailored LinkedIn Profile details */}
                        <div className="card space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h5 className="font-display font-black text-xs text-accent uppercase tracking-wider">Tailored LinkedIn Bio & Headline</h5>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(jdResult.tailoredLinkedIn);
                                alert("Tailored LinkedIn details saved to clipboard!");
                              }}
                              className="btn-glass px-2 py-1 text-3xs flex items-center gap-1 text-muted"
                            >
                              <Copy className="w-3 h-3" /> Copy Profile Copy
                            </button>
                          </div>
                          <div className="bg-bg border border-border p-3.5 rounded-xl max-h-[200px] overflow-y-auto text-3xs font-mono text-muted whitespace-pre-wrap leading-relaxed">
                            {jdResult.tailoredLinkedIn}
                          </div>
                        </div>

                        {/* Tailored cover letter generator */}
                        <div className="card space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h5 className="font-display font-black text-xs text-accent uppercase tracking-wider">Specially Tailored Cover Letter Outlines</h5>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(jdResult.tailoredCoverLetter);
                                alert("Custom cover letter text saved to clipboard!");
                              }}
                              className="btn-glass px-2 py-1 text-3xs flex items-center gap-1 text-muted"
                            >
                              <Copy className="w-3 h-3" /> Copy Letter
                            </button>
                          </div>
                          <div className="bg-bg border border-border p-3.5 rounded-xl max-h-[280px] overflow-y-auto text-3xs font-mono text-muted whitespace-pre-wrap leading-relaxed">
                            {jdResult.tailoredCoverLetter}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
