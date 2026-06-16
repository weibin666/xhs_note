"use client";

import { useEffect, useRef, useState } from "react";
import { api, CoverTextItem } from "@/lib/api";
import { Button, Card, ErrorBox, Label, TextInput } from "./ui";

const W = 1080;
const H = 1440;

interface Template {
  key: string;
  name: string;
  paintBg: (ctx: CanvasRenderingContext2D) => void;
  titleColor: string;
  subColor: string;
  badge?: string; // 副标题底色
}

function gradient(ctx: CanvasRenderingContext2D, c1: string, c2: string) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

const TEMPLATES: Template[] = [
  {
    key: "clean",
    name: "大字干货",
    paintBg: (ctx) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ff2e4d";
      ctx.fillRect(0, 0, W, 24);
      ctx.fillRect(0, H - 24, W, 24);
    },
    titleColor: "#1a1a1a",
    subColor: "#ffffff",
    badge: "#ff2e4d",
  },
  {
    key: "gradient",
    name: "渐变痛点",
    paintBg: (ctx) => gradient(ctx, "#ff6a88", "#ff2e4d"),
    titleColor: "#ffffff",
    subColor: "#ff2e4d",
    badge: "#ffffff",
  },
  {
    key: "cream",
    name: "简约高级",
    paintBg: (ctx) => {
      ctx.fillStyle = "#f3ece1";
      ctx.fillRect(0, 0, W, H);
    },
    titleColor: "#2b2b2b",
    subColor: "#7a6f5d",
  },
  {
    key: "yellow",
    name: "活力清单",
    paintBg: (ctx) => gradient(ctx, "#ffe259", "#ffa751"),
    titleColor: "#1a1a1a",
    subColor: "#ffffff",
    badge: "#1a1a1a",
  },
];

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const ch of text) {
    if (ch === "\n") {
      lines.push(cur);
      cur = "";
      continue;
    }
    if (ctx.measureText(cur + ch).width > maxWidth && cur) {
      lines.push(cur);
      cur = ch;
    } else {
      cur += ch;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export default function CoverTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tplKey, setTplKey] = useState(TEMPLATES[0].key);
  const [main, setMain] = useState("3个被低估的\n护肤冷知识");
  const [sub, setSub] = useState("学生党必看");

  // AI 文案
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<CoverTextItem[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const tpl = TEMPLATES.find((t) => t.key === tplKey)!;

    tpl.paintBg(ctx);

    const pad = 90;
    const maxW = W - pad * 2;

    // 主标题:按行数自适应字号
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let fontSize = 130;
    let lines: string[] = [];
    for (; fontSize >= 60; fontSize -= 6) {
      ctx.font = `900 ${fontSize}px "PingFang SC", system-ui, sans-serif`;
      lines = wrap(ctx, main || " ", maxW);
      if (lines.length <= 4) break;
    }
    const lineH = fontSize * 1.25;
    const blockH = lines.length * lineH;
    let y = H / 2 - blockH / 2 + lineH / 2 - (sub ? 60 : 0);

    ctx.fillStyle = tpl.titleColor;
    for (const ln of lines) {
      ctx.fillText(ln, W / 2, y);
      y += lineH;
    }

    // 副标题(可选,带 badge)
    if (sub.trim()) {
      const subSize = 56;
      ctx.font = `700 ${subSize}px "PingFang SC", system-ui, sans-serif`;
      const tw = ctx.measureText(sub).width;
      const by = y + 30;
      if (tpl.badge) {
        const bw = tw + 70;
        const bh = subSize + 44;
        ctx.fillStyle = tpl.badge;
        const bx = W / 2 - bw / 2;
        const r = bh / 2;
        ctx.beginPath();
        ctx.roundRect(bx, by - bh / 2, bw, bh, r);
        ctx.fill();
      }
      ctx.fillStyle = tpl.subColor;
      ctx.fillText(sub, W / 2, by);
    }
  }, [tplKey, main, sub]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `小红书封面_${Date.now()}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  async function genCopy() {
    if (!topic.trim()) return setError("请输入主题");
    setError("");
    setLoading(true);
    try {
      const res = await api.coverText(topic, style);
      setSuggestions(res.items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* 预览 */}
      <div>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full rounded-xl border border-black/10 shadow-sm"
        />
        <div className="mt-3">
          <Button onClick={download}>⬇ 下载封面 PNG(1080×1440)</Button>
        </div>
      </div>

      {/* 控制 */}
      <div className="space-y-4">
        <div>
          <Label>模板</Label>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTplKey(t.key)}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  tplKey === t.key ? "bg-brand text-white" : "border border-black/10 bg-white"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>主标题(支持换行)</Label>
          <textarea
            rows={2}
            value={main}
            onChange={(e) => setMain(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <Label>副标题 / 角标</Label>
          <TextInput value={sub} onChange={(e) => setSub(e.target.value)} />
        </div>

        <Card>
          <h4 className="mb-2 text-sm font-semibold">✨ AI 封面文案</h4>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1">
              <Label>主题</Label>
              <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="例:平价护肤" />
            </div>
            <div className="w-28">
              <Label>风格</Label>
              <TextInput value={style} onChange={(e) => setStyle(e.target.value)} placeholder="干货" />
            </div>
            <Button onClick={genCopy} loading={loading}>
              生成
            </Button>
          </div>
          <ErrorBox message={error} />
          {suggestions.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMain(s.main);
                    setSub(s.sub);
                  }}
                  className="block w-full rounded-lg border border-black/10 px-3 py-2 text-left text-sm hover:bg-brand-soft"
                >
                  <span className="font-medium">{s.main}</span>
                  {s.sub && <span className="ml-2 text-xs text-foreground/50">{s.sub}</span>}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
