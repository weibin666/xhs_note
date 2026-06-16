"use client";

import { useEffect, useState } from "react";
import { api, ScheduleItem } from "@/lib/api";
import { Button, Card, ErrorBox, Label, TextInput } from "./ui";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function CalendarTool() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [reminders, setReminders] = useState<ScheduleItem[]>([]);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayStr());

  async function load() {
    try {
      const [all, rem] = await Promise.all([api.listSchedule(), api.reminders()]);
      setItems(all);
      setReminders(rem);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!title.trim()) return setError("请输入排期标题");
    setError("");
    try {
      await api.createSchedule({ title, scheduled_date: date });
      setTitle("");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function markPosted(item: ScheduleItem) {
    await api.updateSchedule(item.id, { status: "posted" });
    load();
  }

  async function remove(id: number) {
    await api.deleteSchedule(id);
    load();
  }

  const today = todayStr();

  return (
    <div className="space-y-4">
      {reminders.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
          ⏰ 有 <strong>{reminders.length}</strong> 条待发布(今天或已逾期):
          {reminders.map((r) => ` ${r.title}(${r.scheduled_date})`).join(" / ")}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label>排期内容 *</Label>
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例:发布夏日穿搭笔记" />
          </div>
          <div>
            <Label>计划发布日期</Label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={add}>+ 加入日历</Button>
        </div>
      </Card>

      <ErrorBox message={error} />

      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-foreground/40">还没有排期</p>}
        {items.map((item) => {
          const overdue = item.status === "planned" && item.scheduled_date < today;
          const isToday = item.scheduled_date === today;
          return (
            <Card key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.status === "posted" && (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">已发布</span>
                    )}
                    {overdue && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">逾期</span>
                    )}
                    {isToday && item.status === "planned" && (
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">今天</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-foreground/50">📅 {item.scheduled_date}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === "planned" && (
                    <button
                      onClick={() => markPosted(item)}
                      className="rounded-md border border-black/10 px-2 py-1 text-xs hover:bg-black/5"
                    >
                      标记已发布
                    </button>
                  )}
                  <button onClick={() => remove(item.id)} className="text-xs text-foreground/40 hover:text-red-500">
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
