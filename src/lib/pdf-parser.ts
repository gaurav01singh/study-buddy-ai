// PDF and TXT file parsing utilities

export interface ParsedNote {
  fileName: string;
  content: string;
  chunks: { section: string; text: string }[];
}

export async function parseTextFile(file: File): Promise<ParsedNote> {
  const text = await file.text();
  const chunks = text
    .split(/\n\n+/)
    .filter((c) => c.trim().length > 0)
    .map((text, i) => ({ section: `Section ${i + 1}`, text: text.trim() }));

  return { fileName: file.name, content: text, chunks };
}

export async function parsePDFFile(file: File): Promise<ParsedNote> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullContent = "";
  const chunks: { section: string; text: string }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");

    fullContent += `\n--- Page ${i} ---\n${pageText}`;
    if (pageText.trim()) {
      chunks.push({ section: `Page ${i}`, text: pageText.trim() });
    }
  }

  return { fileName: file.name, content: fullContent, chunks };
}

export async function parseFile(file: File): Promise<ParsedNote> {
  if (file.name.endsWith(".pdf")) {
    return parsePDFFile(file);
  }
  return parseTextFile(file);
}

export function buildNotesContext(notes: ParsedNote[]): string {
  return notes
    .map(
      (note) =>
        `=== File: ${note.fileName} ===\n${note.chunks
          .map((c) => `[${c.section}]: ${c.text}`)
          .join("\n\n")}`
    )
    .join("\n\n");
}
