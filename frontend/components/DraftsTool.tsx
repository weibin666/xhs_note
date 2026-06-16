"use client";

import { useEffect, useState } from "react";
import { api, Draft } from "@/lib/api";
import { Card, CopyButton, ErrorBox, Tags } from "./ui";

const KIND_LABEL: Record<string, string> = {
  content: "笔记",
  rewrite: "仿写",
  title: "标题",
};

export default function DraftsTool() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  async function load() {
    try {
      setDrafts(await api.listDrafts());
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: number) {
    await api.deleteDraft(id);
    load();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/50">
        在「笔记生成」「爆款仿写」里点击「保存为草稿」,结果会出现在这里。
      </p>
      <ErrorBox message={error} />

      <div className="space-y-2">
        {drafts.length === 0 && <p className="text-sm text-foreground/40">暂无草稿</p>}
        {drafts.map((d) => (
          <Card key={d.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-brand-soft px-1.5 py-0.5 text-xs text-brand">
                    {KIND_LABEL[d.kind] ?? d.kind}
                  </span>
                  {d.version > 1 && (
                    <span className="rounded bg-black/5 px-1.5 py-0.5 text-xs text-foreground/60">v{d.version}</span>
                  )}
                  <span className="truncate text-sm font-medium">{d.title || "(无标题)"}</span>
                </div>
                <p className="mt-0.5 text-xs text-foreground/40">
                  {new Date(d.created_at).toLocaleString("zh-CN")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setOpenId(openId === d.id ? null : d.id)}
                  className="rounded-md border border-black/10 px-2 py-1 text-xs hover:bg-black/5"
                >
                  {openId === d.id ? "收起" : "查看"}
                </button>
                <CopyButton text={`${d.title}\n\n${d.body}\n\n${d.tags.map((t) => "#" + t).join(" ")}`} />
                <button onClick={() => remove(d.id)} className="text-xs text-foreground/40 hover:text-red-500">
                  删除
                </button>
              </div>
            </div>
            {openId === d.id && (
              <div className="mt-3 border-t border-black/5 pt-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{d.body}</p>
                {d.tags.length > 0 && (
                  <div className="mt-3">
                    <Tags tags={d.tags} />
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
