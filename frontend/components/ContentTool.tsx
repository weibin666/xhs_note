"use client";

import { useState } from "react";
import { api, ContentResult } from "@/lib/api";
import { Button, Card, CopyButton, ErrorBox, Label, Tags, TextInput } from "./ui";
import AccountSelect from "./AccountSelect";

const TONES = ["亲切种草", "干货专业", "搞笑活泼", "高级简约", "情绪共鸣"];

export default function ContentTool() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [audience, setAudience] = useState("");
  const [accountId, setAccountId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ContentResult | null>(null);
  const [saved, setSaved] = useState(false);

  async function run() {
    if (!topic.trim()) return setError("请输入主题");
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      setResult(await api.content(topic, keywords, tone, audience, accountId || null));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!result) return;
    try {
      await api.createDraft({ kind: "content", title: result.title, body: result.body, tags: result.tags });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <AccountSelect value={accountId} onChange={setAccountId} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>主题 *</Label>
          <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="例:三天两夜成都吃喝攻略" />
        </div>
        <div>
          <Label>目标人群(可选)</Label>
          <TextInput value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="例:预算有限的大学生" />
        </div>
        <div>
          <Label>关键词(可选)</Label>
          <TextInput value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="成都,美食,攻略" />
        </div>
        <div>
          <Label>语气风格</Label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          >
            {TONES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <Button onClick={run} loading={loading}>
        生成笔记
      </Button>

      <ErrorBox message={error} />

      {result && (
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">{result.title}</h3>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={save}
                disabled={saved}
                className="rounded-md border border-black/10 px-2 py-1 text-xs text-foreground/70 hover:bg-black/5 disabled:opacity-50"
              >
                {saved ? "已保存 ✓" : "保存为草稿"}
              </button>
              <CopyButton text={`${result.title}\n\n${result.body}\n\n${result.tags.map((t) => "#" + t).join(" ")}`} />
            </div>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{result.body}</p>
          <div className="mt-4">
            <Tags tags={result.tags} />
          </div>
        </Card>
      )}
    </div>
  );
}
