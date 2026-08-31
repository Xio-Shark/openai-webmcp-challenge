import { useState, useEffect } from 'react';
import { 
  Terminal, 
  Layers, 
  Sliders,
  RefreshCw,
  Play,
  ChevronRight,
  Server,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { registerWebMCPTool } from './lib/webmcp';

interface ExecutionLog {
  id: string;
  time: string;
  tool: string;
  input: any;
  output: any;
  durationMs: number;
}

interface ServiceNode {
  id: string;
  name: string;
  type: 'Inference' | 'Gateway' | 'Cache' | 'Database';
  status: 'Ready' | 'Busy' | 'Optimizing';
  replicas: number;
  latencyMs: number;
  vramPercentage: number;
}

const INITIAL_NODES: ServiceNode[] = [
  { id: 'llm-qwen-7b', name: 'Qwen2.5-7B-Engine', type: 'Inference', status: 'Ready', replicas: 2, latencyMs: 18, vramPercentage: 62 },
  { id: 'llm-deepseek-r1', name: 'DeepSeek-R1-Distill', type: 'Inference', status: 'Busy', replicas: 1, latencyMs: 142, vramPercentage: 91 },
  { id: 'vllm-router', name: 'vLLM-Gateway', type: 'Gateway', status: 'Ready', replicas: 3, latencyMs: 4, vramPercentage: 14 },
  { id: 'kv-cache-redis', name: 'Prefix-KV-Cache', type: 'Cache', status: 'Ready', replicas: 2, latencyMs: 2, vramPercentage: 30 },
  { id: 'vector-milvus', name: 'Milvus-VectorDB', type: 'Database', status: 'Ready', replicas: 2, latencyMs: 12, vramPercentage: 45 },
];

export default function App() {
  const [nodes, setNodes] = useState<ServiceNode[]>(INITIAL_NODES);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [activeTab, setActiveTab] = useState<'topology' | 'tools'>('topology');
  const [hasNativeWebMCP, setHasNativeWebMCP] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const addLog = (tool: string, input: any, output: any, durationMs: number = 42) => {
    const newLog: ExecutionLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      tool,
      input,
      output,
      durationMs,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 50)]);
  };

  useEffect(() => {
    setHasNativeWebMCP(!!(typeof document !== 'undefined' && document.modelContext?.registerTool));

    // 1. get_cluster_topology
    registerWebMCPTool({
      name: 'get_cluster_topology',
      description: 'Get current LLM cluster nodes, replica counts, latencies and VRAM usage.',
      inputSchema: {
        type: 'object',
        properties: {
          filterType: { type: 'string', description: 'Filter by node type: Inference, Gateway, Cache, Database' }
        }
      },
      execute: async ({ filterType }) => {
        const filtered = filterType ? nodes.filter(n => n.type.toLowerCase() === filterType.toLowerCase()) : nodes;
        return {
          totalNodes: filtered.length,
          nodes: filtered,
          status: 'ok'
        };
      }
    }, (tool, input, output) => addLog(tool, input, output, 18));

    // 2. scale_service_replicas
    registerWebMCPTool({
      name: 'scale_service_replicas',
      description: 'Scale the replica count of a designated node to absorb traffic spikes.',
      inputSchema: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: 'Node ID (e.g. llm-deepseek-r1, llm-qwen-7b)' },
          replicas: { type: 'number', description: 'Target replica count (1 to 16)' }
        },
        required: ['nodeId', 'replicas']
      },
      execute: async ({ nodeId, replicas }) => {
        const target = Math.max(1, Math.min(16, Number(replicas)));
        setNodes(prev => prev.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              replicas: target,
              status: 'Ready',
              latencyMs: Math.max(14, Math.round(node.latencyMs * (node.replicas / target))),
              vramPercentage: Math.max(28, Math.round(node.vramPercentage * 0.8))
            };
          }
          return node;
        }));
        return { success: true, nodeId, newReplicas: target };
      }
    }, (tool, input, output) => addLog(tool, input, output, 35));

    // 3. optimize_gpu_memory
    registerWebMCPTool({
      name: 'optimize_gpu_memory',
      description: 'Evict stale prefix KV caches and defragment GPU memory.',
      inputSchema: {
        type: 'object',
        properties: {
          targetNodeId: { type: 'string', description: 'Node ID or "all" to defragment entire cluster' }
        }
      },
      execute: async ({ targetNodeId = 'all' }) => {
        setNodes(prev => prev.map(node => {
          if (targetNodeId === 'all' || node.id === targetNodeId) {
            return {
              ...node,
              status: 'Ready',
              vramPercentage: Math.round(node.vramPercentage * 0.65),
              latencyMs: Math.round(node.latencyMs * 0.85)
            };
          }
          return node;
        }));
        return { success: true, optimized: targetNodeId, reduction: '35% VRAM freed' };
      }
    }, (tool, input, output) => addLog(tool, input, output, 52));

    // 4. run_inference_benchmark
    registerWebMCPTool({
      name: 'run_inference_benchmark',
      description: 'Trigger an automated throughput and latency stress test across the cluster.',
      inputSchema: {
        type: 'object',
        properties: {
          concurrency: { type: 'number', description: 'Simulated request concurrency' }
        },
        required: ['concurrency']
      },
      execute: async ({ concurrency }) => {
        setActionStatus(`Benchmarking (${concurrency} requests)...`);
        await new Promise(r => setTimeout(r, 800));
        setActionStatus(null);
        return {
          concurrency,
          throughput: `${Math.round(Number(concurrency) * 38.2)} tok/s`,
          p50: '12.4ms',
          p99: '29.1ms',
          errorRate: '0.00%'
        };
      }
    }, (tool, input, output) => addLog(tool, input, output, 120));

  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col antialiased selection:bg-zinc-800 selection:text-white">
      {/* 顶部极简导航 (Linear / Vercel 风格) */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur sticky top-0 z-40 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">
            IP
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-zinc-100 tracking-tight">InfraPilot</span>
            <span className="text-zinc-600 text-xs">/</span>
            <span className="text-xs text-zinc-400 font-mono">WebMCP Cluster</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900/60 font-mono text-zinc-300">
            <span className={`w-1.5 h-1.5 rounded-full ${hasNativeWebMCP ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
            <span>WebMCP:</span>
            <span className="text-zinc-100">{hasNativeWebMCP ? 'Native' : 'Dev Bridge'}</span>
          </div>

          <a 
            href="https://webmcp.devpost.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-zinc-400 hover:text-zinc-200 border border-transparent hover:border-zinc-800 transition"
          >
            <span>Challenge Specs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* 主界面布局 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧拓扑与操作面板 */}
        <div className="lg:col-span-7 space-y-5">
          {/* 选项卡栏 */}
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
            <div className="flex space-x-6 text-xs font-medium">
              <button 
                onClick={() => setActiveTab('topology')}
                className={`pb-2 transition relative ${activeTab === 'topology' ? 'text-zinc-100 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Inference Topology
              </button>
              <button 
                onClick={() => setActiveTab('tools')}
                className={`pb-2 transition relative ${activeTab === 'tools' ? 'text-zinc-100 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Registered Tools (4)
              </button>
            </div>

            <span className="text-[11px] text-zinc-500 font-mono">
              {nodes.length} nodes online
            </span>
          </div>

          {activeTab === 'topology' ? (
            <div className="space-y-2.5">
              {nodes.map((node) => (
                <div 
                  key={node.id}
                  className="p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 transition flex flex-col space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Server className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-200 tracking-tight">{node.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-950 font-mono text-zinc-400">
                        {node.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'Ready' ? 'bg-zinc-300' : 'bg-amber-400'}`} />
                      <span className="text-[11px] text-zinc-400 font-mono">{node.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-800/50 text-[11px] font-mono text-zinc-400">
                    <div>
                      <span className="text-zinc-500 text-[10px] block font-sans">Replicas</span>
                      <span className="text-zinc-200">{node.replicas} Pods</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block font-sans">P99 Latency</span>
                      <span className="text-zinc-200">{node.latencyMs}ms</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 font-sans">VRAM</span>
                        <span className="text-zinc-300">{node.vramPercentage}%</span>
                      </div>
                      <div className="w-full bg-zinc-800/80 rounded-full h-1 mt-1 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${node.vramPercentage > 85 ? 'bg-zinc-200' : 'bg-zinc-400'}`}
                          style={{ width: `${node.vramPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { name: 'get_cluster_topology', desc: 'Inspect nodes, memory, latencies and health structure in JSON format.' },
                { name: 'scale_service_replicas', desc: 'Scale specific inference pods from 1 to 16 instances.' },
                { name: 'optimize_gpu_memory', desc: 'Flush stale prefix KV caches and reclaim fragmented VRAM.' },
                { name: 'run_inference_benchmark', desc: 'Run concurrent stress benchmarks across available worker nodes.' },
              ].map(t => (
                <div key={t.name} className="p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-zinc-200">{t.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">document.modelContext</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{t.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* 交互演练区域 (极简单色灰度卡片) */}
          <div className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-200">Interactive Simulation</span>
              </div>
              <span className="text-[11px] text-zinc-500">Test tools directly without external LLM</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  const tool = (window as any).__webmcp_tools?.scale_service_replicas;
                  if (tool) await tool.execute({ nodeId: 'llm-deepseek-r1', replicas: 4 });
                }}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium rounded-md flex items-center space-x-1.5 transition"
              >
                <Sliders className="w-3 h-3" />
                <span>Scale DeepSeek to 4</span>
              </button>

              <button
                onClick={async () => {
                  const tool = (window as any).__webmcp_tools?.optimize_gpu_memory;
                  if (tool) await tool.execute({ targetNodeId: 'all' });
                }}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-md border border-zinc-700/60 flex items-center space-x-1.5 transition"
              >
                <RefreshCw className="w-3 h-3 text-zinc-400" />
                <span>Evict All KV Caches</span>
              </button>

              <button
                onClick={async () => {
                  const tool = (window as any).__webmcp_tools?.run_inference_benchmark;
                  if (tool) await tool.execute({ concurrency: 100 });
                }}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-md border border-zinc-700/60 flex items-center space-x-1.5 transition"
              >
                <Play className="w-3 h-3 text-zinc-400" />
                <span>Run Benchmark (100 reqs)</span>
              </button>
            </div>

            {actionStatus && (
              <div className="text-[11px] font-mono text-zinc-400 pt-1">
                {actionStatus}
              </div>
            )}
          </div>
        </div>

        {/* 右侧审计日志流 (单色控制台风格) */}
        <div className="lg:col-span-5 flex flex-col h-[680px] rounded-lg border border-zinc-800/80 bg-zinc-950/60">
          <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-200">Execution Audit Log</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {logs.length} calls recorded
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center space-y-1">
                <Layers className="w-6 h-6 opacity-30 mb-1" />
                <p className="text-xs">No tool executions recorded yet.</p>
                <p className="text-[11px] text-zinc-600">Trigger simulated actions or let an AI agent invoke tools.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 rounded-md border border-zinc-800/60 bg-zinc-900/40 space-y-1.5 hover:border-zinc-700/60 transition"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <ChevronRight className="w-3 h-3 text-zinc-500" />
                      <span className="text-zinc-200 font-semibold">{log.tool}</span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">{log.time} · {log.durationMs}ms</span>
                  </div>

                  <div className="text-[11px] text-zinc-400 bg-zinc-950/70 p-2 rounded border border-zinc-800/40 space-y-1">
                    <div>
                      <span className="text-zinc-600">args: </span>
                      <span className="text-zinc-300">{JSON.stringify(log.input)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600">result: </span>
                      <span className="text-zinc-300">{JSON.stringify(log.output)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* 极简页脚 */}
      <footer className="border-t border-zinc-800/60 py-4 px-6 text-center text-xs text-zinc-500 font-mono">
        InfraPilot · Built for the OpenAI WebMCP Challenge · Standard: document.modelContext.registerTool
      </footer>
    </div>
  );
}
