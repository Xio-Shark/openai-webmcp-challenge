# InfraPilot WebMCP — Agent-Native AI Inference Cluster Orchestrator

> Project submitted for the **OpenAI WebMCP Challenge** (August - September 2026).
> Powered by browser-native `document.modelContext.registerTool()`.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![WebMCP Standard](https://img.shields.io/badge/WebMCP-Compliant-00a8e8)](https://webmcp.devpost.com/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Cloudflare_Pages-f38020)](https://openai-webmcp-challenge.pages.dev)

🔗 **Live Application URL**: [https://openai-webmcp-challenge.pages.dev](https://openai-webmcp-challenge.pages.dev)

---

## 💡 Overview

**InfraPilot** is an agent-native control plane designed for orchestrating distributed LLM inference clusters (vLLM, SGLang, Qwen, DeepSeek). 

Instead of forcing AI agents to guess their way through complex observability dashboards, SVG node charts, and dropdown menus, **InfraPilot exposes structured, high-precision tools directly through WebMCP (`document.modelContext.registerTool`)**.

An operator in ChatGPT In-App Browser or WebMCP-enabled Chrome can simply prompt:
> *"DeepSeek-R1 latency is spiking. Check the cluster topology, scale it to 4 replicas, and flush stale KV caches."*

The autonomous agent directly discovers and executes the appropriate WebMCP tools with zero UI hallucinations.

---

## 🛠️ Registered WebMCP Tools

InfraPilot registers 4 core tools on `document.modelContext`:

1. **`get_cluster_topology`**:
   - Inspect all cluster nodes, current replicas, p99 latencies, and VRAM allocations in clean structured JSON.
2. **`scale_service_replicas`**:
   - Directly scale inference nodes (`nodeId`, `replicas: 1-16`) to absorb sudden traffic surges.
3. **`optimize_gpu_memory`**:
   - Trigger memory defragmentation and flush unneeded prefix KV caches, instantly reducing memory pressure.
4. **`run_inference_benchmark`**:
   - Run simulated concurrency stress tests to verify post-optimization cluster health.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Development Server
```bash
pnpm dev
```

### 3. Testing with WebMCP
- **Google Chrome**: Enable `chrome://flags/#enable-webmcp-testing` and navigate to the live URL.
- **ChatGPT Browser**: Open the deployed URL inside ChatGPT's In-App Web Browser.
- **Standalone/Fallback Mode**: If opened in standard browsers without WebMCP, the app activates an internal interactive simulator and polyfill so judges can evaluate tool calls seamlessly.

---

## 📜 License

MIT License © 2026 Xio-Shark.
