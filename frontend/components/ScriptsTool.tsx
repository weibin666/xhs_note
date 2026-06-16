"use client";

import { useEffect, useState } from "react";
import { api, Script } from "@/lib/api";
import { Button, Card, CopyButton, ErrorBox, Label, TextArea, TextInput } from "./ui";

const SCENES = ["评论回复", "私信破冰", "私信引流", "促转化", "涨粉互动"];

export default function ScriptsTool() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  // 手动新增
  const [scene, setScene] = useState(SCENES[0]);
  const [content, setContent] = useState("");

  // AI 生成
  const [genScene, setGenScene] = useState(SCENES[0]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);

  async function load() {
    try {
      setScripts(await api.listScripts(filter || undefined));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function add(s: string, sc: string) {
    if (!s.trim()) return setError("话术内容为空");
    setError("");
    await api.createScript({ scene: sc, content: s });
    load();
  }

  async function gen() {
    if (!context.trim()) return setError("请填写背景信息");
    setError("");
    setLoading(true);
    try {
      const res = await api.generateScripts(genScene, context, 5);
      setGenerated(res.scripts);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: number) {
    await api.deleteScript(id);
    load();
  }

  return (
    <div className="space-y-4">
      {/* AI 生成 */}
      <Card>
        <h4 className="mb-2 text-sm font-semibold">✨ AI 生成话术</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>场景</Label>
            <select
              value={genScene}
              onChange={(e) => setGenScene(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            >
              {SCENES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>背景(账号定位 / 用户说了什么 / 目的)</Label>
            <TextInput value={context} onChange={(e) => setContext(e.target.value)} placeholder="例:用户问哪里买,想引导收藏并关注" />
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={gen} loading={loading}>
            生成话术
          </Button>
        </div>
        {generated.length > 0 && (
          <div className="mt-3 space-y-2">
            {generated.map((g, i) => (
              <div key={i} className="flex items-start justify-between gap-2 rounded-lg border border-black/10 px-3 py-2">
                <span className="text-sm">{g}</span>
                <div className="flex shrink-0 gap-2">
                  <CopyButton text={g} />
                  <button
                    onClick={() => add(g, genScene)}
                    className="rounded-md border border-black/10 px-2 py-1 text-xs hover:bg-black/5"
                  >
                    存入库
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 手动新增 */}
      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <Label>场景</Label>
            <select
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            >
              {SCENES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <Label>话术内容</Label>
            <TextArea rows={2} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <Button
            variant="ghost"
            onClick={() => {
              add(content, scene);
              setContent("");
            }}
          >
            + 手动添加
          </Button>
        </div>
      </Card>

      <ErrorBox message={error} />

      {/* 筛选 + 列表 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`rounded-full px-3 py-1 text-xs ${filter === "" ? "bg-brand text-white" : "border border-black/10"}`}
        >
          全部
        </button>
        {SCENES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs ${filter === s ? "bg-brand text-white" : "border border-black/10"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {scripts.length === 0 && <p className="text-sm text-foreground/40">话术库还是空的,用 AI 生成或手动添加吧</p>}
        {scripts.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="mr-2 rounded bg-brand-soft px-1.5 py-0.5 text-xs text-brand">{s.scene}</span>
                <span className="text-sm">{s.content}</span>
              </div>
              <div className="flex shrink-0 gap-2">
                <CopyButton text={s.content} />
                <button onClick={() => remove(s.id)} className="text-xs text-foreground/40 hover:text-red-500">
                  删除
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
