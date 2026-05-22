import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExportPdfButton() {
  return (
    <Button size="sm" variant="outline" onClick={() => window.print()} className="border-linkedin/30 text-linkedin-light hover:bg-linkedin/10">
      <Download className="mr-1.5 h-4 w-4" />
      Export PDF
    </Button>
  );
}
