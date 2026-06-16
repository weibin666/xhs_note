"use client";

import { useEffect, useState } from "react";
import { api, Account } from "@/lib/api";
import { Button, Card, ErrorBox, Label, TextInput } from "./ui";

const EMPTY = { name: "", niche: "", persona: "", audience: "", tone: "", bio: "" };

export default function AccountsTool() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY });

  async function load() {
    try {
      setAccounts(await api.listAccounts());
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!form.name.trim()) return setError("请输入账号名称");
    setError("");
    try {
      await api.createAccount(form);
      setForm({ ...EMPTY });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(id: number) {
    await api.deleteAccount(id);
    load();
  }

  const fields: [keyof typeof EMPTY, string, string][] = [
    ["name", "账号名称 *", "例:主号·平价护肤"],
    ["niche", "赛道", "美妆 / 穿搭 / 美食…"],
    ["persona", "人设", "接地气的学生党闺蜜"],
    ["audience", "目标人群", "18-24 女大学生"],
    ["tone", "语气风格", "亲切种草"],
    ["bio", "简介 / Slogan", "每月只花100块的护肤研究所"],
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {fields.map(([k, label, ph]) => (
            <div key={k}>
              <Label>{label}</Label>
              <TextInput value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={ph} />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Button onClick={add}>+ 新建账号档案</Button>
        </div>
      </Card>

      <ErrorBox message={error} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {accounts.length === 0 && <p className="text-sm text-foreground/40">还没有账号档案</p>}
        {accounts.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold">{a.name}</h3>
              <button onClick={() => remove(a.id)} className="text-xs text-foreground/40 hover:text-red-500">
                删除
              </button>
            </div>
            {a.bio && <p className="mt-0.5 text-xs text-brand">{a.bio}</p>}
            <dl className="mt-2 space-y-1 text-xs text-foreground/70">
              {a.niche && <div>🎯 赛道:{a.niche}</div>}
              {a.persona && <div>👤 人设:{a.persona}</div>}
              {a.audience && <div>🎈 人群:{a.audience}</div>}
              {a.tone && <div>🗣️ 语气:{a.tone}</div>}
            </dl>
          </Card>
        ))}
      </div>
    </div>
  );
}
