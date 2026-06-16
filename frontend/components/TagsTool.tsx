"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, CopyButton, ErrorBox, Label, Tags, TextArea, TextInput } from "./ui";

export default function TagsTool() {
  const [topic, setTopic] = useState("");
  const [body, setBody] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  async function run() {
    if (!topic.trim()) return setError("请输入主题");
    setError("");
    setLoading(true);
    try {
      const res = await api.tags(topic, body, count);
      setTags(res.tags);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>主题 *</Label>
        <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="例:露营装备分享" />
      </div>
      <div>
        <Label>正文(可选,有助于更精准)</Label>
        <TextArea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <Label>数量</Label>
        <input
          type="number"
          min={3}
          max={20}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-20 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        />
        <Button onClick={run} loading={loading}>
          推荐标签
        </Button>
      </div>

      <ErrorBox message={error} />

      {tags.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold">推荐话题标签</h4>
            <CopyButton text={tags.map((t) => "#" + t).join(" ")} />
          </div>
          <Tags tags={tags} />
        </Card>
      )}
    </div>
  );
}
