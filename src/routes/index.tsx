import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Letterhead Generator – Create & Download Professional Letterheads as PDF" },
      { name: "description", content: "Design a custom company letterhead online and download it as a PDF in seconds." },
    ],
  }),
  component: Index,
});

type Theme = "classic" | "modern" | "minimal";

interface FormData {
  companyName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  recipient: string;
  date: string;
  subject: string;
  body: string;
  signature: string;
  theme: Theme;
  accent: string;
}

const today = new Date().toISOString().slice(0, 10);

const initial: FormData = {
  companyName: "Acme Corporation",
  tagline: "Innovation in every detail",
  address: "123 Market Street, Suite 400, San Francisco, CA 94105",
  phone: "+1 (555) 123-4567",
  email: "hello@acme.com",
  website: "www.acme.com",
  recipient: "Jane Doe\nDirector of Operations\nGlobex Inc.",
  date: today,
  subject: "Partnership Proposal",
  body: "Dear Jane,\n\nWe are delighted to present a proposal for a long-term partnership between our two organizations. Please find the details enclosed for your review.\n\nWe look forward to your response.",
  signature: "John Smith\nCEO, Acme Corporation",
  theme: "modern",
  accent: "#2c5fb8",
};

function Index() {
  const [data, setData] = useState<FormData>(initial);
  const previewRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const generatePdf = () => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    const M = 50;
    const accent = data.accent;

    // Header
    if (data.theme === "modern") {
      pdf.setFillColor(accent);
      pdf.rect(0, 0, W, 90, "F");
      pdf.setTextColor("#ffffff");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text(data.companyName, M, 45);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      if (data.tagline) pdf.text(data.tagline, M, 65);
    } else if (data.theme === "classic") {
      pdf.setTextColor(accent);
      pdf.setFont("times", "bold");
      pdf.setFontSize(26);
      pdf.text(data.companyName, W / 2, 60, { align: "center" });
      pdf.setFont("times", "italic");
      pdf.setFontSize(11);
      pdf.setTextColor("#555");
      if (data.tagline) pdf.text(data.tagline, W / 2, 78, { align: "center" });
      pdf.setDrawColor(accent);
      pdf.setLineWidth(1.5);
      pdf.line(M, 95, W - M, 95);
    } else {
      pdf.setTextColor("#111");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text(data.companyName, M, 55);
      pdf.setDrawColor(accent);
      pdf.setLineWidth(2);
      pdf.line(M, 70, M + 60, 70);
    }

    // Contact strip
    const contactLine = [data.address, data.phone, data.email, data.website]
      .filter(Boolean)
      .join("  •  ");
    pdf.setTextColor(data.theme === "modern" ? "#ffffff" : "#666");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    if (data.theme === "modern") {
      pdf.text(contactLine, M, 82);
    } else {
      pdf.text(contactLine, M, 110, { maxWidth: W - 2 * M });
    }

    // Body
    let y = data.theme === "modern" ? 140 : 150;
    pdf.setTextColor("#222");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    if (data.date) {
      pdf.text(new Date(data.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }), M, y);
      y += 30;
    }
    if (data.recipient) {
      const lines = pdf.splitTextToSize(data.recipient, W - 2 * M);
      pdf.text(lines, M, y);
      y += lines.length * 14 + 14;
    }
    if (data.subject) {
      pdf.setFont("helvetica", "bold");
      pdf.text(`Subject: ${data.subject}`, M, y);
      pdf.setFont("helvetica", "normal");
      y += 22;
    }
    if (data.body) {
      const lines = pdf.splitTextToSize(data.body, W - 2 * M);
      pdf.text(lines, M, y);
      y += lines.length * 15 + 30;
    }
    if (data.signature) {
      const lines = pdf.splitTextToSize(data.signature, W - 2 * M);
      pdf.text("Sincerely,", M, y);
      y += 30;
      pdf.setFont("helvetica", "bold");
      pdf.text(lines, M, y);
    }

    // Footer
    pdf.setDrawColor(accent);
    pdf.setLineWidth(0.5);
    pdf.line(M, H - 50, W - M, H - 50);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor("#888");
    pdf.text(data.companyName + (data.website ? ` — ${data.website}` : ""), W / 2, H - 32, { align: "center" });

    pdf.save(`${data.companyName.replace(/\s+/g, "_")}_letterhead.pdf`);
  };

  const previewHeader = () => {
    if (data.theme === "modern") {
      return (
        <div className="p-6 text-white" style={{ backgroundColor: data.accent }}>
          <h2 className="text-2xl font-bold">{data.companyName || "Company Name"}</h2>
          {data.tagline && <p className="text-sm opacity-90 mt-1">{data.tagline}</p>}
          <p className="text-xs opacity-80 mt-2">
            {[data.address, data.phone, data.email, data.website].filter(Boolean).join("  •  ")}
          </p>
        </div>
      );
    }
    if (data.theme === "classic") {
      return (
        <div className="p-6 text-center border-b-2" style={{ borderColor: data.accent }}>
          <h2 className="text-3xl font-serif font-bold" style={{ color: data.accent }}>
            {data.companyName || "Company Name"}
          </h2>
          {data.tagline && <p className="italic text-muted-foreground text-sm mt-1">{data.tagline}</p>}
          <p className="text-xs text-muted-foreground mt-3">
            {[data.address, data.phone, data.email, data.website].filter(Boolean).join("  •  ")}
          </p>
        </div>
      );
    }
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">{data.companyName || "Company Name"}</h2>
        <div className="h-0.5 w-14 mt-2" style={{ backgroundColor: data.accent }} />
        <p className="text-xs text-muted-foreground mt-3">
          {[data.address, data.phone, data.email, data.website].filter(Boolean).join("  •  ")}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <h1 className="text-lg font-semibold">Letterhead Generator</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Build your letterhead</h2>
            <p className="text-muted-foreground text-sm mt-1">Fill in the details, preview live, then download as PDF.</p>
          </div>

          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Company</h3>
            <div className="grid gap-3">
              <Field label="Company Name">
                <Input value={data.companyName} onChange={(e) => update("companyName", e.target.value)} />
              </Field>
              <Field label="Tagline">
                <Input value={data.tagline} onChange={(e) => update("tagline", e.target.value)} />
              </Field>
              <Field label="Address">
                <Input value={data.address} onChange={(e) => update("address", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone">
                  <Input value={data.phone} onChange={(e) => update("phone", e.target.value)} />
                </Field>
                <Field label="Email">
                  <Input value={data.email} onChange={(e) => update("email", e.target.value)} />
                </Field>
              </div>
              <Field label="Website">
                <Input value={data.website} onChange={(e) => update("website", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Letter</h3>
            <div className="grid gap-3">
              <Field label="Date">
                <Input type="date" value={data.date} onChange={(e) => update("date", e.target.value)} />
              </Field>
              <Field label="Recipient">
                <Textarea rows={3} value={data.recipient} onChange={(e) => update("recipient", e.target.value)} />
              </Field>
              <Field label="Subject">
                <Input value={data.subject} onChange={(e) => update("subject", e.target.value)} />
              </Field>
              <Field label="Body">
                <Textarea rows={6} value={data.body} onChange={(e) => update("body", e.target.value)} />
              </Field>
              <Field label="Signature">
                <Textarea rows={2} value={data.signature} onChange={(e) => update("signature", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Style</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Theme">
                <Select value={data.theme} onValueChange={(v) => update("theme", v as Theme)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Accent Color">
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={data.accent}
                    onChange={(e) => update("accent", e.target.value)}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input value={data.accent} onChange={(e) => update("accent", e.target.value)} />
                </div>
              </Field>
            </div>
          </Card>

          <Button onClick={generatePdf} size="lg" className="w-full">
            <Download className="size-4 mr-2" />
            Download PDF
          </Button>
        </section>

        {/* Preview */}
        <section className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-sm text-muted-foreground mb-3">Live preview</p>
          <Card className="overflow-hidden shadow-lg" ref={previewRef}>
            {previewHeader()}
            <div className="p-8 space-y-5 min-h-[600px] bg-card">
              {data.date && (
                <p className="text-sm">{new Date(data.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
              )}
              {data.recipient && <p className="text-sm whitespace-pre-line">{data.recipient}</p>}
              {data.subject && <p className="text-sm font-semibold">Subject: {data.subject}</p>}
              {data.body && <p className="text-sm whitespace-pre-line leading-relaxed">{data.body}</p>}
              {data.signature && (
                <div className="pt-6">
                  <p className="text-sm">Sincerely,</p>
                  <p className="text-sm font-semibold whitespace-pre-line mt-6">{data.signature}</p>
                </div>
              )}
            </div>
            <div className="px-8 py-3 border-t text-center text-xs text-muted-foreground italic" style={{ borderColor: data.accent }}>
              {data.companyName}{data.website && ` — ${data.website}`}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
