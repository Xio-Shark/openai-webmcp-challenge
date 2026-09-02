# Devpost Submission Kit: InfraPilot WebMCP

> Complete submission package for **The WebMCP Challenge** hosted by OpenAI on Devpost.

---

## 📌 Project Overview & Metadata

* **Project Title**: `InfraPilot WebMCP`
* **Elevator Pitch (Tagline)**: `Agent-Native AI Inference Cluster Orchestrator powered by WebMCP (document.modelContext.registerTool)`
* **Live Application URL**: [https://openai-webmcp-challenge.pages.dev](https://openai-webmcp-challenge.pages.dev)
* **Public Code Repository**: [https://github.com/Xio-Shark/openai-webmcp-challenge](https://github.com/Xio-Shark/openai-webmcp-challenge)
* **Primary Categories**: `Developer Tools`, `Machine Learning / AI`, `Web Development`

---

## 📝 Required Text Description (Devpost Questions)

### 1. Why your use case is a strong fit for WebMCP
Traditional observability and operational dashboards (e.g., Grafana, Kubernetes Web UI, vLLM/SGLang monitors) rely heavily on visual representations: nested metrics graphs, SVG cluster topologies, and multi-level modal dropdowns. 

When autonomous AI agents attempt to manage these systems using vision or raw DOM scraping, they frequently suffer from UI hallucinations, miss small text indicators, or misclick critical action buttons. 

**WebMCP fundamentally solves this by transforming the web app from an interface built solely for human eyes into a dual-interface designed for both humans and agents.** By exposing deterministic, type-safe tools through `document.modelContext.registerTool()`, the browser gives the agent structured command capabilities directly, eliminating guessing and ensuring 100% operational precision.

---

### 2. How it creates a better user experience
InfraPilot provides a high-efficiency co-pilot experience during high-pressure infrastructure troubleshooting:

* **Zero-Friction Prompting**: Instead of an on-call engineer clicking through five sub-pages and modal forms to adjust replicas, they can simply tell their agent: *"DeepSeek-R1 latency is spiking. Inspect the cluster topology, scale it to 4 pods, and flush stale KV caches."*
* **Real-Time Visual State Synchronization**: As the agent executes tool calls, the React frontend updates instantaneously (replica badges update, P99 latency recalculates, VRAM meters reflect optimization).
* **Transparent Auditing**: The on-screen **WebMCP Tool Execution Audit** stream provides a live feed of all inputs, outputs, and execution latencies, ensuring the human operator retains complete visibility and control over autonomous actions.

---

### 3. What people and agents can do together that was difficult or impossible before
* **Collaborative Remediation**: Humans focus on high-level strategic decisions (e.g., SLA thresholds, budget constraints), while agents handle granular diagnostic discovery and rapid multi-step remediation routines.
* **Instant Stress Verification**: After applying cluster tuning, an operator can command the agent to immediately trigger concurrent stress benchmarks (`run_inference_benchmark`) to verify throughput recovery before closing an incident.
* **Deterministic Dual-Mode Operation**: The same web console serves both human manual interaction (via clean buttons and views) and agent programmatic control without any separate backend API setup or API key distribution—everything runs safely inside the active browser session.

---

### 4. Briefly explain how you implemented WebMCP
1. **Tool Registration**: Implemented in TypeScript using `document.modelContext.registerTool()` to register four atomic tools:
   * `get_cluster_topology`: Discovers node health, latencies, replicas, and VRAM.
   * `scale_service_replicas`: Scales specific model worker pods (1–16).
   * `optimize_gpu_memory`: Triggers VRAM defragmentation and prefix cache eviction.
   * `run_inference_benchmark`: Runs simulated concurrent load tests.
2. **Execution Interceptor**: Wrapped the `execute` handler of each tool with an audit logger that captures timestamped input arguments, outputs, and millisecond execution times to render the real-time stream in the UI.
3. **Graceful Fallback & Simulation Bridge**: Built an internal dev bridge so judges and visitors evaluating the app in standard browsers without experimental flags can still test and verify tool execution seamlessly.
4. **Minimalist Monochrome UI**: Designed following Linear/Vercel design principles with React 19, Vite, and Tailwind CSS v4, deployed globally via Cloudflare Pages.

---

## 🛠️ Tool Schema Reference

```javascript
// Example: Scale Service Replicas
document.modelContext.registerTool({
  name: "scale_service_replicas",
  description: "Scale the replica count of a given AI model or gateway node to handle load spikes.",
  inputSchema: {
    type: "object",
    properties: {
      nodeId: { type: "string", description: "ID of the node to scale (e.g. llm-deepseek-r1, llm-qwen-7b)" },
      replicas: { type: "number", description: "Target replica count (1 to 16)" }
    },
    required: ["nodeId", "replicas"]
  },
  execute: async ({ nodeId, replicas }) => {
    // Updates React state & returns structured confirmation
    return { success: true, nodeId, newReplicas: replicas };
  }
});
```

---

## 🧪 Testing Instructions for Judges

1. **In ChatGPT In-App Browser**:
   * Open `https://openai-webmcp-challenge.pages.dev` directly inside ChatGPT's web browsing environment (supports WebMCP natively).
   * Prompt ChatGPT: *"Inspect the cluster topology on this page and scale DeepSeek-R1 to 4 replicas."*
2. **In Google Chrome**:
   * Navigate to `chrome://flags/#enable-webmcp-testing` and set to **Enabled**.
   * Open `https://openai-webmcp-challenge.pages.dev`. Notice the header badge reads `WebMCP: Native`.
3. **In Any Standard Browser**:
   * Open `https://openai-webmcp-challenge.pages.dev`.
   * Use the **Interactive Simulation** panel to trigger simulated agent tool calls and watch the real-time audit log stream.
