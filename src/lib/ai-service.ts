// AI Service using Google Gemini API
// Set VITE_GEMINI_API_KEY in your .env file

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface Citation {
  fileName: string;
  section: string;
  snippet: string;
}

export interface AIResponse {
  answer: string;
  citations: Citation[];
  confidence: "High" | "Medium" | "Low";
  evidenceSnippets: string[];
  notFound: boolean;
}

export interface MCQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation: Citation;
}

export interface ShortAnswerQuestion {
  question: string;
  modelAnswer: string;
  citation: Citation;
}

export interface StudyModeResponse {
  mcqs: MCQuestion[];
  shortAnswers: ShortAnswerQuestion[];
}

function buildQAPrompt(question: string, subjectName: string, notesContext: string): string {
  return `You are a study assistant. Answer the following question using ONLY the provided notes for the subject "${subjectName}". 

RULES:
1. If the notes do NOT contain sufficient information, respond with exactly: {"notFound": true, "answer": "Not found in your notes for ${subjectName}", "citations": [], "confidence": "Low", "evidenceSnippets": []}
2. Include citations with file name and section/chunk reference.
3. Rate confidence as High, Medium, or Low.
4. Include the top supporting evidence snippets.
5. Respond ONLY with valid JSON matching this schema:
{
  "notFound": false,
  "answer": "your answer here",
  "citations": [{"fileName": "file.pdf", "section": "Page 3, Paragraph 2", "snippet": "relevant text"}],
  "confidence": "High",
  "evidenceSnippets": ["snippet1", "snippet2"]
}

NOTES:
${notesContext}

QUESTION: ${question}`;
}

function buildStudyPrompt(subjectName: string, notesContext: string): string {
  return `You are a study assistant. Generate study questions from the provided notes for "${subjectName}".

Generate exactly:
- 5 multiple-choice questions (4 options each, with correct option index 0-3, and brief explanation)
- 3 short-answer questions with model answers

Include citations for ALL generated content. Respond ONLY with valid JSON:
{
  "mcqs": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "...",
      "citation": {"fileName": "file.pdf", "section": "Page 1", "snippet": "..."}
    }
  ],
  "shortAnswers": [
    {
      "question": "...",
      "modelAnswer": "...",
      "citation": {"fileName": "file.pdf", "section": "Page 2", "snippet": "..."}
    }
  ]
}

NOTES:
${notesContext}`;
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set. Add it to your .env file.");
  }

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}

function extractJSON(text: string): string {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  const match2 = text.match(/\{[\s\S]*\}/);
  if (match2) return match2[0];
  return text;
}

export async function askQuestion(
  question: string,
  subjectName: string,
  notesContext: string
): Promise<AIResponse> {
  const prompt = buildQAPrompt(question, subjectName, notesContext);
  const raw = await callGemini(prompt);
  try {
    const json = JSON.parse(extractJSON(raw));
    return json as AIResponse;
  } catch {
    return {
      answer: raw,
      citations: [],
      confidence: "Low",
      evidenceSnippets: [],
      notFound: false,
    };
  }
}

export async function generateStudyQuestions(
  subjectName: string,
  notesContext: string
): Promise<StudyModeResponse> {
  const prompt = buildStudyPrompt(subjectName, notesContext);
  const raw = await callGemini(prompt);
  try {
    const json = JSON.parse(extractJSON(raw));
    return json as StudyModeResponse;
  } catch {
    return { mcqs: [], shortAnswers: [] };
  }
}
