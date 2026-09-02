# PRD: InfraPilot WebMCP 核心工程落地

## 1. 目标与价值 (Objectives)
构建符合 **OpenAI WebMCP Challenge** 规范的 Agent-Native 控制台，面向大模型推理集群提供结构化调度能力。

## 2. 核心功能清单 (Features)
- [x] **WebMCP 标准集成**：实现 `document.modelContext.registerTool` 标准注册机制，并提供 Polyfill/Dev 模式保证评审环境兼容。
- [x] **4 大核心原子工具**：
  1. `get_cluster_topology` (查询拓扑)
  2. `scale_service_replicas` (服务扩缩容)
  3. `optimize_gpu_memory` (显存/KV Cache清理)
  4. `run_inference_benchmark` (性能压测)
- [x] **工业级极简设计重构（Linear / Vercel Monochrome 风格）**：
  - 彻底移除高饱和霓虹与 RGB 渐变色，采用灰阶单色（`#09090b` 底色、`zinc` 系列卡片、微描边与紧凑数据网格）。
  - 拓扑卡片实时动态响应（单色显存条、状态指示标、P99 延迟与 Pod 计数更新）。
  - 右侧实时执行审计日志流（Audit Stream）与精确耗时标示。
- [x] **开源规范健全与匿名化**：
  - 包含顶级 MIT License 与完备的 README 说明。
  - Git Commit 历史 100% 匿名化（统一使用 `Xio-Shark` 开发者 ID，无个人隐私信息）。
- [x] **线上生产部署（Cloudflare Pages）**：
  - 成功部署至 Cloudflare Pages 全球 CDN，分配公网独立地址：`https://openai-webmcp-challenge.pages.dev`。
  - 添加 GitHub Actions 自动化持续部署工作流（`.github/workflows/deploy.yml`）。
- [x] **冲刺提交前开发与配置（已全链路验证通过）**：
  - [x] 步骤 1：将极简产品截图放入仓库并嵌入 README.md。
  - [x] 步骤 2：配置 GitHub 仓库 Topics 标签与 Homepage 地址。
  - [x] 步骤 3：编写 Devpost 提交全套英文问答文档 (`docs/devpost-submission.md`)。
  - [x] 步骤 4：完成线上生产环境 4 大 WebMCP 工具 E2E 自动化调用与审计流响应验证。
- [ ] **最终申报行动（由用户完成）**：
  - [ ] 录制 2~3 分钟 YouTube 演示视频（附带人声解说与操作演示）。
  - [ ] 前往 Devpost 表单复制 `docs/devpost-submission.md` 完成最终提交。

## 3. 验收标准 (Acceptance Criteria)
1. `pnpm build` 静态类型检测与构建 0 错误、0 警告。
2. 页面在原生支持 WebMCP 的浏览器（ChatGPT In-App / Chrome flag）中直接唤起工具，在普通浏览器中模拟测试功能完备。
3. 提交符合 Devpost 评委各项标准。
