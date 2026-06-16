"use client";

import { useState } from "react";
import { api, BenchmarkResult } from "@/lib/api";
import { Button, Card, ErrorBox, Label, TextArea, TextInput } from "./ui";

function List({ title, items, marker }: { title: string; items: string[]; marker: string }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold text-brand">{title}</h4>
      <ul className="space-y-1 text-sm text-foreground/85">
        {items.map((it, i) => (
          <li key={i}>
            {marker} {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BenchmarkTool() {
  const [notes, setNotes] = useState("");
  const [positioning, setPositioning] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BenchmarkResult | null>(null);

  async function run() {
    if (!notes.trim()) return setError("请粘贴竞品笔记内容");
    setError("");
    setLoading(true);
    try {
      setResult(await api.benchmark(notes, positioning));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>竞品笔记内容 *(可多篇,空行分隔)</Label>
        <TextArea
          rows={8}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="把竞品的标题+正文粘贴进来,AI 会反推其定位、内容策略,并对标出你的机会点"
        />
      </div>
      <div>
        <Label>我的账号定位(可选)</Label>
        <TextInput
          value={positioning}
          onChange={(e) => setPositioning(e.target.value)}
          placeholder="例:面向职场新人的平价穿搭"
        />
      </div>

      <Button onClick={run} loading={loading}>
        对标分析
      </Button>

      <ErrorBox message={error} />

      {result && (
        <Card>
          <div className="space-y-4">
            <div>
              <h4 className="mb-1 text-sm font-semibold text-brand">🎯 竞品定位与人设</h4>
              <p className="text-sm leading-relaxed text-foreground/85">{result.positioning}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-brand">📋 内容策略</h4>
              <p className="text-sm leading-relaxed text-foreground/85">{result.content_strategy}</p>
            </div>
            <List title="💪 竞品强项" items={result.strengths} marker="•" />
            <List title="🔍 我的机会点" items={result.my_gaps} marker="•" />
            <List title="✅ 行动建议" items={result.suggestions} marker="→" />
          </div>
        </Card>
      )}
    </div>
  );
}
