"use client";

import { useState } from "react";
import { api, CheckResult } from "@/lib/api";
import { Button, Card, ErrorBox, Label, TextArea } from "./ui";

const LEVEL_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  none: { bg: "bg-green-50 border-green-200", text: "text-green-700", label: "无风险" },
  low: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", label: "低风险" },
  medium: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", label: "中风险" },
  high: { bg: "bg-red-50 border-red-200", text: "text-red-700", label: "高风险" },
};

export default function CheckTool() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);

  async function run() {
    if (!text.trim()) return setError("请输入待检测文本");
    setError("");
    setLoading(true);
    try {
      setResult(await api.check(text));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const level = result ? LEVEL_STYLE[result.risk_level] ?? LEVEL_STYLE.low : null;

  return (
    <div className="space-y-4">
      <div>
        <Label>待检测文本 *</Label>
        <TextArea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="粘贴标题或正文,检测广告法极限词、医疗功效、虚假承诺、站外导流等限流风险"
        />
      </div>

      <Button onClick={run} loading={loading}>
        合规检测
      </Button>

      <ErrorBox message={error} />

      {result && level && (
        <div className="space-y-3">
          <div className={`rounded-lg border px-3 py-2 text-sm ${level.bg} ${level.text}`}>
            <strong>{level.label}</strong> · {result.summary}
          </div>
          {result.hits.map((h, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-medium text-red-600">「{h.word}」</span>
                  <span className="ml-2 rounded bg-black/5 px-1.5 py-0.5 text-xs text-foreground/60">
                    {LEVEL_STYLE[h.severity]?.label ?? h.severity}
                  </span>
                  <p className="mt-1 text-xs text-foreground/70">{h.reason}</p>
                  <p className="mt-1 text-xs text-foreground/90">💡 {h.suggestion}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
