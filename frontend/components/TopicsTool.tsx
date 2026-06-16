"use client";

import { useEffect, useState } from "react";
import { api, Topic } from "@/lib/api";
import { Button, Card, ErrorBox, Label, TextInput } from "./ui";

const STATUS = [
  { key: "idea", label: "💡 灵感", style: "bg-yellow-100 text-yellow-800" },
  { key: "planned", label: "📅 已排期", style: "bg-blue-100 text-blue-800" },
  { key: "done", label: "✅ 已发布", style: "bg-green-100 text-green-800" },
];

function statusMeta(s: string) {
  return STATUS.find((x) => x.key === s) ?? STATUS[0];
}

export default function TopicsTool() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");

  async function load() {
    try {
      setTopics(await api.listTopics(filter || undefined));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function add() {
    if (!title.trim()) return setError("请输入选题标题");
    setError("");
    try {
      await api.createTopic({ title, keywords, category });
      setTitle("");
      setKeywords("");
      setCategory("");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function cycleStatus(t: Topic) {
    const order = ["idea", "planned", "done"];
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    await api.updateTopic(t.id, { status: next });
    load();
  }

  async function remove(id: number) {
    await api.deleteTopic(id);
    load();
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>选题标题 *</Label>
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例:夏日穿搭公式" />
          </div>
          <div>
            <Label>关键词</Label>
            <TextInput value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <div>
            <Label>赛道/分类</Label>
            <TextInput value={category} onChange={(e) => setCategory(e.target.value)} placeholder="穿搭" />
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={add}>+ 加入选题库</Button>
        </div>
      </Card>

      <ErrorBox message={error} />

      <div className="flex gap-2">
        <button
          onClick={() => setFilter("")}
          className={`rounded-full px-3 py-1 text-xs ${filter === "" ? "bg-brand text-white" : "border border-black/10"}`}
        >
          全部
        </button>
        {STATUS.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`rounded-full px-3 py-1 text-xs ${filter === s.key ? "bg-brand text-white" : "border border-black/10"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {topics.length === 0 && <p className="text-sm text-foreground/40">还没有选题,先添加一个吧</p>}
        {topics.map((t) => {
          const m = statusMeta(t.status);
          return (
            <Card key={t.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t.title}</span>
                    {t.category && (
                      <span className="rounded bg-black/5 px-1.5 py-0.5 text-xs text-foreground/60">{t.category}</span>
                    )}
                  </div>
                  {t.keywords && <p className="mt-0.5 text-xs text-foreground/50">{t.keywords}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => cycleStatus(t)} className={`rounded-full px-2 py-1 text-xs ${m.style}`}>
                    {m.label}
                  </button>
                  <button onClick={() => remove(t.id)} className="text-xs text-foreground/40 hover:text-red-500">
                    删除
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
