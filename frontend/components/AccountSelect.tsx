"use client";

import { useEffect, useState } from "react";
import { Account, api } from "@/lib/api";
import { Label } from "./ui";

export default function AccountSelect({
  value,
  onChange,
}: {
  value: number | "";
  onChange: (id: number | "") => void;
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    api.listAccounts().then(setAccounts).catch(() => {});
  }, []);

  const selected = accounts.find((a) => a.id === value);

  return (
    <div>
      <Label>按账号定位生成(可选)</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
      >
        <option value="">不指定账号</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
            {a.niche ? `(${a.niche})` : ""}
          </option>
        ))}
      </select>
      {selected && (
        <p className="mt-1 text-xs text-foreground/50">
          将贴合「{selected.persona || selected.name}」的人设
          {selected.tone ? ` · ${selected.tone}` : ""}
          {selected.audience ? ` · 面向${selected.audience}` : ""}
        </p>
      )}
      {accounts.length === 0 && (
        <p className="mt-1 text-xs text-foreground/40">还没有账号档案,可在「👥 账号档案」里创建</p>
      )}
    </div>
  );
}
