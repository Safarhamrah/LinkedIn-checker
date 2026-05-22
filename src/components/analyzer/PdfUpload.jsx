import { useRef, useState } from "react";
import { FileUp, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PdfUpload({ onTextExtracted, onToast }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);

    try {
      const text = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
        ? await extractPdfText(file)
        : await file.text();

      if (!text.trim()) {
        onToast?.("No readable text found in that file.");
      } else {
        onTextExtracted?.(text.trim());
        onToast?.(`${file.name} imported successfully`);
      }
    } catch (error) {
      console.error(error);
      onToast?.("Could not read that file. Try copying the profile text instead.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="mt-5 rounded-2xl border border-dashed border-linkedin/30 bg-linkedin/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linkedin/10">
            <UploadCloud className="h-5 w-5 text-linkedin-light" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Upload a PDF or text export</p>
            <p className="text-xs text-muted-foreground">PDF, TXT, and copied profile exports are supported.</p>
          </div>
        </div>
        <input ref={inputRef} className="hidden" type="file" accept=".pdf,.txt,text/plain,application/pdf" onChange={handleFile} />
        <Button variant="outline" size="sm" disabled={loading} onClick={() => inputRef.current?.click()} className="border-linkedin/30 text-linkedin-light hover:bg-linkedin/10">
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileUp className="mr-1.5 h-4 w-4" />}
          {loading ? "Reading" : "Upload"}
        </Button>
      </div>
    </div>
  );
}

async function extractPdfText(file) {
  const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const document = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }

  return pages.join("\n\n");
}
