# Project Specification: InfraPilot WebMCP

## 1. 竞赛背景 (Challenge Background)
- **赛事名称**：The WebMCP Challenge (OpenAI 主办，Devpost 承办，Cloudflare / Vercel / Shopify / Chrome 支持)。
- **核心宗旨**：探索下一代开放网络标准 **WebMCP (Web Model Context Protocol)**。通过在浏览器端向 AI Agent 暴露原生结构化工具接口（`document.modelContext.registerTool`），让 Agent 无需盲目猜测 DOM 或截图反推，直接精准调用网页内置工具完成高效协同。
- **评委核心导向**：
  1. **WebMCP Leverage**：深度且熟练利用 WebMCP 规范，非简单 mock 或 trivial 实现。
  2. **Execution**：完整连贯的产品级 UX 体验，而非单纯的技术 PoC。
  3. **Potential Impact**：解决具有高价值的真实世界痛点。
  4. **Creativity & Ambition**：区别于传统页面的高野心交互范式。

---

## 2. 选定方案：InfraPilot WebMCP
- **定位**：Agent 原生 AI 大模型推理集群控制台 (Agent-Native AI Inference Cluster Orchestrator)。
- **核心场景**：
  - 管理 vLLM / SGLang / Qwen2.5 / DeepSeek 等分布式推理服务拓扑。
  - 人工运维或 Agent 通过自然语言排查故障（如：“发现 DeepSeek-R1 延迟飙升，帮我排查并扩容至 4 副本，清理陈旧 KV Cache”）。
  - 网页向宿主 Agent 原生提供 4 项核心调度工具：
    1. `get_cluster_topology`：输出集群结构、副本数、实时 P99 延迟与显存占比。
    2. `scale_service_replicas`：精确调度扩缩容。
    3. `optimize_gpu_memory`：执行显存整理与 KV Cache 驱逐。
    4. `run_inference_benchmark`：执行并发吞吐与健康压测评估。
  - 提供交互式执行审计日志流（Audit Log Stream）与优雅降级模拟器。

---

## 3. 技术栈架构与设计系统
- **前端框架**：React 19 + TypeScript + Vite 8
- **设计风格**：Linear / Vercel Monochrome 工业级极简深色灰阶体系（采用纯粹的黑/深灰/锌白层级，克制使用色彩，杜绝 RGB 霓虹）
- **图标与动效**：Lucide React 精细图标
- **WebMCP 抽象层**：`src/lib/webmcp.ts` 自动适配原生 `document.modelContext` 与 Dev 模拟模式。
- **线上分发**：Cloudflare Pages 全球 CDN（`https://openai-webmcp-challenge.pages.dev`）

---

## 4. 目录与工作流规范
- `src/`
  - `lib/webmcp.ts`：WebMCP 核心桥接与工具注册。
  - `App.tsx`：控制台主应用（极简拓扑卡片、注册工具清单、实时调用审计日志流）。
  - `index.css`：极简灰阶基础样式。
- `.github/workflows/`：自动化持续集成与部署工作流（`deploy.yml`）。
- `.trellis/`：Trellis 规范管理与任务跟踪。
- `README.md` & `LICENSE`：符合 Devpost 参赛标准的开源说明、Live Demo 徽章与 MIT 许可证。
