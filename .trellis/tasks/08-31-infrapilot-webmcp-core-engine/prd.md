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
- [x] **现代化高质感 UI**：
  - 暗黑风格、低饱和蓝青莫兰迪科技感。
  - 拓扑卡片实时动态响应（显存进度条、健康指示灯、延迟数据更新）。
  - 右侧实时执行审计日志流（Audit Stream）。
- [x] **开源规范健全**：
  - 包含顶级 MIT License 与完备的 README 说明。
- [ ] **线上部署与多端联调**：
  - 部署至 Cloudflare Pages 或 Vercel。
  - Chrome 实验性 WebMCP flag 联调。
  - 录制 2~3 分钟 YouTube 演示视频。

## 3. 验收标准 (Acceptance Criteria)
1. `pnpm build` 静态类型检测与构建 0 错误、0 警告。
2. 页面在原生支持 WebMCP 的浏览器（ChatGPT In-App / Chrome flag）中直接唤起工具，在普通浏览器中模拟测试功能完备。
3. 提交符合 Devpost 评委各项标准。
