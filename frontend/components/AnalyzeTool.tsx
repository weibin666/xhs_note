"use client";

import { useState } from "react";
import { api, AnalyzeResult } from "@/lib/api";
import { Button, Card, ErrorBox, Label, TextArea, TextInput } from "./ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold text-brand">{title}</h4>
      <div className="text-sm leading-relaxed text-foreground/85">{children}</div>
    </div>
  );
}

export default function AnalyzeTool() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  async function run() {
    if (!body.trim()) return setError("请粘贴爆款笔记正文");
    setError("");
    setLoading(true);
    try {
      setResult(await api.analyze(title, body));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>爆款标题(可选)</Label>
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label>爆款正文 *</Label>
        <TextArea
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="粘贴一篇爆款笔记,拆解它的钩子、开头、骨架、情绪点、结尾和标签套路"
        />
      </div>

      <Button onClick={run} loading={loading}>
        拆解爆款
      </Button>

      <ErrorBox message={error} />

      {result && (
        <Card>
          <div className="space-y-4">
            <Section title={`🎣 标题钩子 · ${result.hook_type}`}>{result.hook_analysis}</Section>
            <Section title="🚀 开头手法">{result.opening}</Section>
            <Section title="🧱 正文骨架">
              <ol className="ml-4 list-decimal space-y-1">
                {result.structure.map((s, i) => (
                  <li key={i}>
                    <span className="font-medium">{s.section}</span> — {s.purpose}
                  </li>
                ))}
              </ol>
            </Section>
            <Section title="💗 情绪与利他点">{result.emotion_value}</Section>
            <Section title="🎬 结尾引导">{result.ending}</Section>
            <Section title="🏷️ 标签套路">{result.tags_pattern}</Section>
            <Section title="♻️ 可复用套路清单">
              <ul className="ml-4 list-disc space-y-1">
                {result.takeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </Section>
          </div>
        </Card>
      )}
    </div>
  );
}
