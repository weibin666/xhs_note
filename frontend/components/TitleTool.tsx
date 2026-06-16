"use client";

import { useState } from "react";
import { api, TitleItem } from "@/lib/api";
import { Button, Card, CopyButton, ErrorBox, Label, TextInput } from "./ui";
import AccountSelect from "./AccountSelect";

export default function TitleTool() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [count, setCount] = useState(6);
  const [accountId, setAccountId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [titles, setTitles] = useState<TitleItem[]>([]);

  async function run() {
    if (!topic.trim()) return setError("请输入主题");
    setError("");
    setLoading(true);
    try {
      const res = await api.titles(topic, keywords, count, accountId || null);
      setTitles(res.titles);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <AccountSelect value={accountId} onChange={setAccountId} />
      <div>
        <Label>笔记主题 *</Label>
        <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="例:学生党平价护肤" />
      </div>
      <div>
        <Label>关键词(可选,逗号分隔)</Label>
        <TextInput value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="平价,学生党,护肤" />
      </div>
      <div className="flex items-center gap-3">
        <Label>生成数量</Label>
        <input
          type="number"
          min={1}
          max={15}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-20 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        />
        <Button onClick={run} loading={loading}>
          生成标题
        </Button>
      </div>

      <ErrorBox message={error} />

      {titles.length > 0 && (
        <div className="space-y-2">
          {titles.map((t, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="mr-2 rounded bg-brand-soft px-1.5 py-0.5 text-xs text-brand">
                    {t.style}
                  </span>
                  <span className="text-sm">{t.title}</span>
                </div>
                <CopyButton text={t.title} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
