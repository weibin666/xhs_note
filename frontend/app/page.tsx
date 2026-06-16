"use client";

import { useState } from "react";
import TitleTool from "@/components/TitleTool";
import ContentTool from "@/components/ContentTool";
import RewriteTool from "@/components/RewriteTool";
import CheckTool from "@/components/CheckTool";
import TagsTool from "@/components/TagsTool";
import AnalyzeTool from "@/components/AnalyzeTool";
import TopicsTool from "@/components/TopicsTool";
import DraftsTool from "@/components/DraftsTool";
import CalendarTool from "@/components/CalendarTool";
import DashboardTool from "@/components/DashboardTool";
import BenchmarkTool from "@/components/BenchmarkTool";
import CoverTool from "@/components/CoverTool";
import AccountsTool from "@/components/AccountsTool";
import ScriptsTool from "@/components/ScriptsTool";

const TABS = [
  { key: "content", label: "📝 笔记生成", desc: "输入主题,一键生成完整笔记", el: <ContentTool /> },
  { key: "title", label: "✨ 标题生成", desc: "多风格高点击率标题", el: <TitleTool /> },
  { key: "rewrite", label: "🔥 爆款仿写", desc: "拆解爆款结构并改写新主题", el: <RewriteTool /> },
  { key: "analyze", label: "🔬 爆款拆解", desc: "把爆款逆向拆成可复用套路", el: <AnalyzeTool /> },
  { key: "tags", label: "🏷️ 标签推荐", desc: "大词+精准词+长尾词", el: <TagsTool /> },
  { key: "check", label: "🛡️ 合规检测", desc: "极限词/限流词风险检测", el: <CheckTool /> },
  { key: "topics", label: "📚 选题库", desc: "灵感 → 排期 → 已发布,选题全流程", el: <TopicsTool /> },
  { key: "drafts", label: "📁 草稿", desc: "保存的生成结果,支持版本", el: <DraftsTool /> },
  { key: "calendar", label: "🗓️ 内容日历", desc: "排期 + 到期/逾期提醒", el: <CalendarTool /> },
  { key: "dashboard", label: "📊 数据看板", desc: "导入数据 → 互动率/收藏率/最佳时段", el: <DashboardTool /> },
  { key: "benchmark", label: "🆚 竞品对标", desc: "粘贴竞品笔记,AI 对标分析", el: <BenchmarkTool /> },
  { key: "cover", label: "🎨 封面生成", desc: "模板化封面,导出 1080×1440 PNG", el: <CoverTool /> },
  { key: "accounts", label: "👥 账号档案", desc: "多账号定位 / 人设管理", el: <AccountsTool /> },
  { key: "scripts", label: "💬 话术库", desc: "评论/私信话术,AI 生成 + 收藏", el: <ScriptsTool /> },
] as const;

export default function Home() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("content");
  const current = TABS.find((t) => t.key === active)!;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          小红书运营助手 <span className="text-brand">·</span> AI 内容工作台
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          内容生产 · 选题拆解 · 合规检测 ｜ 发布请在官方后台操作
        </p>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active === t.key
                ? "bg-brand text-white"
                : "border border-black/10 bg-white text-foreground/70 hover:bg-black/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <p className="mb-4 text-sm text-foreground/50">{current.desc}</p>

      {current.el}

      <footer className="mt-12 border-t border-black/5 pt-4 text-center text-xs text-foreground/40">
        本工具仅做内容创作辅助,不涉及自动发布 · 请遵守小红书社区规范
      </footer>
    </main>
  );
}
