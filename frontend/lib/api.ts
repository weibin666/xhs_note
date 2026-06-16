const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = `请求失败 (${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) detail = data.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

const post = <T>(path: string, body: unknown) => request<T>("POST", path, body);
const get = <T>(path: string) => request<T>("GET", path);
const patch = <T>(path: string, body: unknown) => request<T>("PATCH", path, body);
const del = (path: string) => request<{ ok: boolean }>("DELETE", path);

// ---------- 类型 ----------
export interface TitleItem {
  title: string;
  style: string;
}
export interface ContentResult {
  title: string;
  body: string;
  tags: string[];
}
export interface RewriteResult {
  structure: string;
  title: string;
  body: string;
  tags: string[];
}
export interface CheckHit {
  word: string;
  reason: string;
  severity: string;
  suggestion: string;
}
export interface CheckResult {
  risk_level: string;
  hits: CheckHit[];
  summary: string;
}
export interface StructureSection {
  section: string;
  purpose: string;
}
export interface AnalyzeResult {
  hook_type: string;
  hook_analysis: string;
  opening: string;
  structure: StructureSection[];
  emotion_value: string;
  ending: string;
  tags_pattern: string;
  takeaways: string[];
}
export interface Topic {
  id: number;
  title: string;
  keywords: string | null;
  category: string | null;
  status: string;
  note: string | null;
  created_at: string;
}
export interface Draft {
  id: number;
  kind: string;
  title: string;
  body: string;
  tags: string[];
  topic_id: number | null;
  parent_id: number | null;
  version: number;
  created_at: string;
}
export interface ScheduleItem {
  id: number;
  title: string;
  scheduled_date: string;
  status: string;
  topic_id: number | null;
  draft_id: number | null;
  note: string | null;
  created_at: string;
}
export interface MetricRead {
  id: number;
  title: string;
  publish_date: string | null;
  publish_hour: number | null;
  views: number;
  likes: number;
  collects: number;
  comments: number;
  shares: number;
  follows: number;
  engagement_rate: number;
  collect_rate: number;
}
export interface MetricCreate {
  title: string;
  publish_date?: string | null;
  publish_hour?: number | null;
  views?: number;
  likes?: number;
  collects?: number;
  comments?: number;
  shares?: number;
  follows?: number;
}
export interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}
export interface TimeSlotStat {
  hour: number;
  count: number;
  avg_engagement_rate: number;
}
export interface TopNote {
  title: string;
  views: number;
  engagement_rate: number;
  collect_rate: number;
}
export interface Dashboard {
  note_count: number;
  total_views: number;
  total_likes: number;
  total_collects: number;
  total_comments: number;
  total_follows: number;
  avg_engagement_rate: number;
  avg_collect_rate: number;
  best_time_slots: TimeSlotStat[];
  top_notes: TopNote[];
}
export interface BenchmarkResult {
  positioning: string;
  content_strategy: string;
  strengths: string[];
  my_gaps: string[];
  suggestions: string[];
}
export interface Account {
  id: number;
  name: string;
  niche: string | null;
  persona: string | null;
  audience: string | null;
  tone: string | null;
  bio: string | null;
  note: string | null;
  created_at: string;
}
export interface Script {
  id: number;
  scene: string;
  title: string;
  content: string;
  account_id: number | null;
  created_at: string;
}
export interface CoverTextItem {
  main: string;
  sub: string;
}

// ---------- API ----------
export const api = {
  titles: (topic: string, keywords: string, count: number, account_id?: number | null) =>
    post<{ titles: TitleItem[] }>("/api/titles", { topic, keywords, count, account_id }),

  content: (
    topic: string,
    keywords: string,
    tone: string,
    audience: string,
    account_id?: number | null
  ) => post<ContentResult>("/api/content", { topic, keywords, tone, audience, account_id }),

  rewrite: (source: string, new_topic: string, account_id?: number | null) =>
    post<RewriteResult>("/api/rewrite", { source, new_topic, account_id }),

  tags: (topic: string, body: string, count: number) =>
    post<{ tags: string[] }>("/api/tags", { topic, body, count }),

  check: (text: string) => post<CheckResult>("/api/check", { text }),

  analyze: (title: string, body: string) =>
    post<AnalyzeResult>("/api/analyze", { title, body }),

  // 选题库
  listTopics: (status?: string) =>
    get<Topic[]>(`/api/topics${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  createTopic: (data: Partial<Topic>) => post<Topic>("/api/topics", data),
  updateTopic: (id: number, data: Partial<Topic>) => patch<Topic>(`/api/topics/${id}`, data),
  deleteTopic: (id: number) => del(`/api/topics/${id}`),

  // 草稿
  listDrafts: () => get<Draft[]>("/api/drafts"),
  createDraft: (data: Partial<Draft>) => post<Draft>("/api/drafts", data),
  deleteDraft: (id: number) => del(`/api/drafts/${id}`),

  // 排期 / 日历
  listSchedule: (start?: string, end?: string) => {
    const q = new URLSearchParams();
    if (start) q.set("start", start);
    if (end) q.set("end", end);
    const qs = q.toString();
    return get<ScheduleItem[]>(`/api/schedule${qs ? `?${qs}` : ""}`);
  },
  reminders: () => get<ScheduleItem[]>("/api/schedule/reminders"),
  createSchedule: (data: Partial<ScheduleItem>) => post<ScheduleItem>("/api/schedule", data),
  updateSchedule: (id: number, data: Partial<ScheduleItem>) =>
    patch<ScheduleItem>(`/api/schedule/${id}`, data),
  deleteSchedule: (id: number) => del(`/api/schedule/${id}`),

  // 笔记数据 / 看板
  listMetrics: () => get<MetricRead[]>("/api/metrics"),
  createMetric: (data: MetricCreate) => post<MetricRead>("/api/metrics", data),
  deleteMetric: (id: number) => del(`/api/metrics/${id}`),
  dashboard: () => get<Dashboard>("/api/metrics/dashboard"),
  importMetrics: async (file: File): Promise<ImportResult> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/api/metrics/import`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`导入失败 (${res.status})`);
    return res.json() as Promise<ImportResult>;
  },

  // 竞品对标
  benchmark: (competitor_notes: string, my_positioning: string) =>
    post<BenchmarkResult>("/api/benchmark", { competitor_notes, my_positioning }),

  // 多账号定位档案
  listAccounts: () => get<Account[]>("/api/accounts"),
  createAccount: (data: Partial<Account>) => post<Account>("/api/accounts", data),
  updateAccount: (id: number, data: Partial<Account>) => patch<Account>(`/api/accounts/${id}`, data),
  deleteAccount: (id: number) => del(`/api/accounts/${id}`),

  // 话术库
  listScripts: (scene?: string) =>
    get<Script[]>(`/api/scripts${scene ? `?scene=${encodeURIComponent(scene)}` : ""}`),
  createScript: (data: Partial<Script>) => post<Script>("/api/scripts", data),
  deleteScript: (id: number) => del(`/api/scripts/${id}`),
  generateScripts: (scene: string, context: string, count: number) =>
    post<{ scripts: string[] }>("/api/scripts/generate", { scene, context, count }),

  // 封面文案
  coverText: (topic: string, style: string) =>
    post<{ items: CoverTextItem[] }>("/api/cover-text", { topic, style }),
};
