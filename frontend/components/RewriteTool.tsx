"use client";

import { useState } from "react";
import { api, RewriteResult } from "@/lib/api";
import { Button, Card, CopyButton, ErrorBox, Label, Tags, TextArea, TextInput } from "./ui";
import AccountSelect from "./AccountSelect";

export default function RewriteTool() {
  const [source, setSource] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [accountId, setAccountId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [saved, setSaved] = useState(false);

  async function run() {
    if (!source.trim() || !newTopic.trim()) return setError("请填写参考爆款和新主题");
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      setResult(await api.rewrite(source, newTopic, accountId || null));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!result) return;
    try {
      await api.createDraft({ kind: "rewrite", title: result.title, body: result.body, tags: result.tags });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <AccountSelect value={accountId} onChange={setAccountId} />
      <div>
        <Label>参考爆款笔记正文 *</Label>
        <TextArea
          rows={8}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="把一篇爆款笔记的正文粘贴进来,AI 会拆解它的结构套路"
        />
      </div>
      <div>
        <Label>改写成的新主题 *</Label>
        <TextInput value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="例:把美妆爆款套路用到健身主题" />
      </div>

      <Button onClick={run} loading={loading}>
        拆解并仿写
      </Button>

      <ErrorBox message={error} />

      {result && (
        <div className="space-y-3">
          <Card>
            <h4 className="mb-2 text-sm font-semibold text-brand">📐 爆款结构拆解</h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{result.structure}</p>
          </Card>
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
        </div>
      )}
    </div>
  );
}
