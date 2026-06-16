"use client";

import { useEffect, useRef, useState } from "react";
import { api, Dashboard, MetricRead } from "@/lib/api";
import { Button, Card, ErrorBox, Label, TextInput } from "./ui";

const CSV_TEMPLATE =
  "标题,发布日期,发布小时,曝光,点赞,收藏,评论,分享,涨粉\n示例笔记,2026-06-01,20,10000,800,600,120,40,90\n";

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-3">
      <p className="text-xs text-foreground/50">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ? "text-brand" : ""}`}>{value}</p>
    </div>
  );
}

const EMPTY_FORM = {
  title: "",
  publish_date: "",
  publish_hour: "",
  views: "",
  likes: "",
  collects: "",
  comments: "",
  shares: "",
  follows: "",
};

export default function DashboardTool() {
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [metrics, setMetrics] = useState<MetricRead[]>([]);
  const [error, setError] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const [d, m] = await Promise.all([api.dashboard(), api.listMetrics()]);
      setDash(d);
      setMetrics(m);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function num(v: string) {
    return v.trim() === "" ? undefined : Number(v);
  }

  async function add() {
    if (!form.title.trim()) return setError("请输入标题");
    setError("");
    try {
      await api.createMetric({
        title: form.title,
        publish_date: form.publish_date || null,
        publish_hour: num(form.publish_hour) ?? null,
        views: num(form.views) ?? 0,
        likes: num(form.likes) ?? 0,
        collects: num(form.collects) ?? 0,
        comments: num(form.comments) ?? 0,
        shares: num(form.shares) ?? 0,
        follows: num(form.follows) ?? 0,
      });
      setForm({ ...EMPTY_FORM });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setImportMsg("");
    try {
      const res = await api.importMetrics(file);
      setImportMsg(`导入成功 ${res.imported} 条${res.failed ? `,失败 ${res.failed} 条` : ""}`);
      if (res.errors.length) setError(res.errors.join("；"));
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: number) {
    await api.deleteMetric(id);
    load();
  }

  const maxEng = dash?.best_time_slots.reduce((a, s) => Math.max(a, s.avg_engagement_rate), 0) || 1;

  return (
    <div className="space-y-5">
      {/* 汇总卡片 */}
      {dash && dash.note_count > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="笔记数" value={String(dash.note_count)} />
          <Stat label="总曝光" value={dash.total_views.toLocaleString()} />
          <Stat label="总收藏" value={dash.total_collects.toLocaleString()} />
          <Stat label="总涨粉" value={dash.total_follows.toLocaleString()} />
          <Stat label="平均互动率" value={`${dash.avg_engagement_rate}%`} accent />
          <Stat label="平均收藏率" value={`${dash.avg_collect_rate}%`} accent />
          <Stat label="总点赞" value={dash.total_likes.toLocaleString()} />
          <Stat label="总评论" value={dash.total_comments.toLocaleString()} />
        </div>
      )}

      {/* 最佳发布时段 */}
      {dash && dash.best_time_slots.length > 0 && (
        <Card>
          <h4 className="mb-3 text-sm font-semibold">⏰ 最佳发布时段(按平均互动率)</h4>
          <div className="space-y-2">
            {dash.best_time_slots.map((s) => (
              <div key={s.hour} className="flex items-center gap-3 text-sm">
                <span className="w-14 shrink-0 text-foreground/60">{String(s.hour).padStart(2, "0")}:00</span>
                <div className="h-4 flex-1 rounded bg-black/5">
                  <div
                    className="h-4 rounded bg-brand"
                    style={{ width: `${(s.avg_engagement_rate / maxEng) * 100}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-foreground/70">
                  {s.avg_engagement_rate}% · {s.count}篇
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top 笔记 */}
      {dash && dash.top_notes.length > 0 && (
        <Card>
          <h4 className="mb-3 text-sm font-semibold">🏆 高互动笔记 Top 5</h4>
          <div className="space-y-1.5">
            {dash.top_notes.map((t, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">
                  <span className="mr-2 text-foreground/40">{i + 1}.</span>
                  {t.title}
                </span>
                <span className="shrink-0 text-xs text-foreground/60">
                  互动 {t.engagement_rate}% · 收藏 {t.collect_rate}% · {t.views.toLocaleString()} 曝光
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 导入 / 录入 */}
      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold">导入数据</h4>
          <input ref={fileRef} type="file" accept=".csv" onChange={onImport} className="hidden" />
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            上传 CSV
          </Button>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`}
            download="小红书数据模板.csv"
            className="text-xs text-brand hover:underline"
          >
            下载 CSV 模板
          </a>
          {importMsg && <span className="text-xs text-green-600">{importMsg}</span>}
        </div>

        <p className="mb-2 text-xs text-foreground/50">或手动录入单篇:</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="col-span-2">
            <Label>标题 *</Label>
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>发布日期</Label>
            <input
              type="date"
              value={form.publish_date}
              onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label>发布小时(0-23)</Label>
            <TextInput
              type="number"
              value={form.publish_hour}
              onChange={(e) => setForm({ ...form, publish_hour: e.target.value })}
            />
          </div>
          {(["views", "likes", "collects", "comments", "shares", "follows"] as const).map((k) => (
            <div key={k}>
              <Label>
                {{ views: "曝光", likes: "点赞", collects: "收藏", comments: "评论", shares: "分享", follows: "涨粉" }[k]}
              </Label>
              <TextInput
                type="number"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Button onClick={add}>+ 添加</Button>
        </div>
      </Card>

      <ErrorBox message={error} />

      {/* 明细 */}
      {metrics.length > 0 && (
        <Card>
          <h4 className="mb-3 text-sm font-semibold">数据明细({metrics.length})</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-foreground/50">
                <tr className="border-b border-black/5">
                  <th className="py-1.5 pr-2">标题</th>
                  <th className="px-2">曝光</th>
                  <th className="px-2">点赞</th>
                  <th className="px-2">收藏</th>
                  <th className="px-2">互动率</th>
                  <th className="px-2">收藏率</th>
                  <th className="px-2">涨粉</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.id} className="border-b border-black/5">
                    <td className="max-w-[10rem] truncate py-1.5 pr-2">{m.title}</td>
                    <td className="px-2">{m.views.toLocaleString()}</td>
                    <td className="px-2">{m.likes}</td>
                    <td className="px-2">{m.collects}</td>
                    <td className="px-2 text-brand">{m.engagement_rate}%</td>
                    <td className="px-2">{m.collect_rate}%</td>
                    <td className="px-2">{m.follows}</td>
                    <td className="px-2 text-right">
                      <button onClick={() => remove(m.id)} className="text-foreground/40 hover:text-red-500">
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {dash && dash.note_count === 0 && (
        <p className="text-sm text-foreground/40">还没有数据。上传 CSV 或手动录入第一条吧。</p>
      )}
    </div>
  );
}
