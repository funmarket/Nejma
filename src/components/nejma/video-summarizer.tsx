"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/providers/toast-provider";

type VideoSummarizerProps = {
  videoUrl: string;
  onSummaryGenerated: (summary: string) => void;
};

export function VideoSummarizer({ videoUrl, onSummaryGenerated }: VideoSummarizerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [format, setFormat] = useState<"paragraph" | "bullet">("paragraph");
  const [length, setLength] = useState<"short" | "medium" | "long">("short");
  const { addToast } = useToast();

  const handleSummarize = async () => {
    addToast("AI summarization is not configured.", "info");
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="summary-format">Summary Format</Label>
                <Select value={format} onValueChange={(value) => setFormat(value as any)} disabled>
                    <SelectTrigger id="summary-format">
                        <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="paragraph">Paragraph</SelectItem>
                        <SelectItem value="bullet">Bullet Points</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="summary-length">Summary Length</Label>
                <Select value={length} onValueChange={(value) => setLength(value as any)} disabled>
                    <SelectTrigger id="summary-length">
                        <SelectValue placeholder="Length" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                </Select>
            </div>
      </div>
      <Button
        type="button"
        onClick={handleSummarize}
        disabled={isSubmitting || !videoUrl}
        className="w-full"
      >
        <Wand2 className="mr-2 h-4 w-4" />
        {isSubmitting ? "Generating Summary..." : "Generate Description with AI"}
      </Button>
    </div>
  );
}

    