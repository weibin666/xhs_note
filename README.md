# 小红书运营助手 · AI 内容工作台

自用 / 小团队的小红书**内容生产**辅助工具(纯合规,不做自动发布)。
详见 [开发计划.md](开发计划.md)。

## 功能

**P0 · AI 内容生产**
- 📝 **笔记生成** — 主题 → 完整笔记(标题 + 正文 + 标签),可保存为草稿
- ✨ **标题生成** — 多风格高点击率标题
- 🔥 **爆款仿写** — 拆解爆款结构并改写成新主题,可保存为草稿
- 🏷️ **标签推荐** — 大词 + 精准词 + 长尾词
- 🛡️ **合规检测** — 极限词 / 限流词风险检测(本地词库 + AI 双重)

**P1 · 选题与运营管理**(SQLite 持久化)
- 🔬 **爆款拆解** — 把爆款逆向拆成钩子/开头/骨架/情绪点/结尾/标签套路 + 可复用清单
- 📚 **选题库** — 灵感 → 已排期 → 已发布 状态流转,分类/关键词/筛选
- 📁 **草稿管理** — 保存生成结果,版本链,查看/复制/删除
- 🗓️ **内容日历** — 排期 + 到期/逾期提醒,标记已发布

**P2 · 数据分析**
- 📊 **数据看板** — CSV 导入(含模板)/ 手动录入,互动率·收藏率自动计算,最佳发布时段 + 高互动 Top5
- 🆚 **竞品对标** — 粘贴竞品笔记,AI 反推定位/策略/强项/机会点/行动建议

**P3 · 进阶**
- 🎨 **封面生成** — 4 套模板,实时预览,导出 1080×1440 PNG,可选 AI 封面文案
- 👥 **账号档案** — 多账号定位(赛道/人设/人群/语气/Slogan)管理
- 💬 **话术库** — 评论/私信 5 大场景,AI 生成 + 收藏 + 场景筛选

## 技术栈

- 后端:Python + FastAPI,DeepSeek API(OpenAI 兼容,deepseek-chat)
- 前端:Next.js 16 (App Router) + TypeScript + Tailwind CSS

## 快速开始

### 前置依赖

- **Python ≥ 3.9**(`python3 --version`)
- **Node.js ≥ 18**(`node -v`);本机用 `nvm` 管理,新终端先 `source ~/.nvm/nvm.sh` 或重开终端
- 一个 **DeepSeek API Key**(https://platform.deepseek.com),用于 AI 功能

### 1. 克隆

```bash
git clone https://github.com/weibin666/xhs_note.git
cd xhs_note
```

### 2. 启动后端(终端 A)

```bash
cd backend
cp .env.example .env                       # 然后编辑 .env,填入 DEEPSEEK_API_KEY
python3 -m venv .venv                       # 首次
.venv/bin/pip install -r requirements.txt   # 首次
.venv/bin/uvicorn app.main:app --reload --port 8000
```

- 数据库:首次启动自动创建 `backend/xhs.db`(SQLite),无需手动建表。
- API 文档:http://localhost:8000/docs
- 健康检查:http://localhost:8000/health

### 3. 启动前端(终端 B)

```bash
cd frontend
npm install      # 首次
npm run dev
```

打开 http://localhost:3000 即可使用。

> 前端默认连后端 `http://localhost:8000`;如需修改,在 `frontend/` 下建 `.env.local` 写 `NEXT_PUBLIC_API_BASE=http://你的地址`。
> 后端默认只允许 `http://localhost:3000` 跨域,改前端端口时同步改 `backend/.env` 的 `FRONTEND_ORIGIN`。

### 4. 验证安装

- 打开「🛡️ 合规检测」,粘贴一段含"最好""加微信"的文字 → 应标红风险词(此功能无需 API Key)。
- 打开「📝 笔记生成」,输入主题点生成 → 出现完整笔记则说明 DeepSeek Key 配置成功。

## 说明

- 「合规检测」的本地词库扫描无需 API Key 即可使用;其余 AI 功能需配置 `DEEPSEEK_API_KEY`。
- 本工具仅做创作辅助,发布请在小红书官方后台 / 创作者中心操作。
