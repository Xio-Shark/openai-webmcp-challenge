import { useState, useEffect } from 'react';
import { 
  Bot, 
  Terminal, 
  Cpu, 
  Activity, 
  Sparkles, 
  Play, 
  Sliders, 
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { registerWebMCPTool } from './lib/webmcp';

interface ExecutionLog {
  id: string;
  time: string;
  tool: string;
  input: any;
  output: any;
}

interface ServiceNode {
  id: string;
  name: string;
  type: 'inference' | 'gateway' | 'cache' | 'database';
  status: 'healthy' | 'degraded' | 'scaling';
  replicas: number;
  latencyMs: number;
  gpuMemoryUsed: number;
}

const INITIAL_NODES: ServiceNode[] = [
  { id: 'llm-qwen-7b', name: 'Qwen2.5-7B-Engine', type: 'inference', status: 'healthy', replicas: 2, latencyMs: 18, gpuMemoryUsed: 65 },
  { id: 'llm-deepseek-r1', name: 'DeepSeek-R1-Distill', type: 'inference', status: 'degraded', replicas: 1, latencyMs: 145, gpuMemoryUsed: 92 },
  { id: 'vllm-router', name: 'vLLM-Gateway', type: 'gateway', status: 'healthy', replicas: 3, latencyMs: 4, gpuMemoryUsed: 12 },
  { id: 'kv-cache-redis', name: 'Prefix-KV-Cache', type: 'cache', status: 'healthy', replicas: 2, latencyMs: 2, gpuMemoryUsed: 28 },
  { id: 'vector-milvus', name: 'Milvus-KnowledgeDB', type: 'database', status: 'healthy', replicas: 2, latencyMs: 11, gpuMemoryUsed: 44 },
];

export default function App() {
  const [nodes, setNodes] = useState<ServiceNode[]>(INITIAL_NODES);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [activeTab, setActiveTab] = useState<'topology' | 'tools' | 'logs'>('topology');
  const [hasNativeWebMCP, setHasNativeWebMCP] = useState(false);
  const [benchmarkStatus, setBenchmarkStatus] = useState<string>('Ready');

  const addLog = (tool: string, input: any, output: any) => {
    const newLog: ExecutionLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(),
      tool,
      input,
      output,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 30)]);
  };

  // 注册 WebMCP 工具集
  useEffect(() => {
    setHasNativeWebMCP(!!(typeof document !== 'undefined' && document.modelContext?.registerTool));

    // Tool 1: 获取当前集群节点状态
    registerWebMCPTool({
      name: 'get_cluster_topology',
      description: 'Get the current AI inference cluster topology, including service nodes, latency, replicas and GPU memory.',
      inputSchema: {
        type: 'object',
        properties: {
          filterType: { 
            type: 'string', 
            description: 'Optional filter by node type: inference, gateway, cache, database' 
          }
        }
      },
      execute: async ({ filterType }) => {
        const filtered = filterType ? nodes.filter(n => n.type === filterType) : nodes;
        return {
          totalNodes: filtered.length,
          nodes: filtered,
          clusterHealth: filtered.every(n => n.status === 'healthy') ? 'Optimal' : 'Needs Optimization'
        };
      }
    }, (tool, input, output) => addLog(tool, input, output));

    // Tool 2: 扩缩容服务副本
    registerWebMCPTool({
      name: 'scale_service_replicas',
      description: 'Scale the replica count of a given AI model or gateway node to handle load spikes.',
      inputSchema: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: 'ID of the node to scale (e.g. llm-qwen-7b, llm-deepseek-r1)' },
          replicas: { type: 'number', description: 'Target replica count (1 to 16)' }
        },
        required: ['nodeId', 'replicas']
      },
      execute: async ({ nodeId, replicas }) => {
        const targetReplicas = Math.max(1, Math.min(16, Number(replicas)));
        setNodes(prev => prev.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              replicas: targetReplicas,
              status: 'healthy',
              latencyMs: Math.max(12, Math.round(node.latencyMs * (node.replicas / targetReplicas))),
              gpuMemoryUsed: Math.max(30, Math.round(node.gpuMemoryUsed * 0.8))
            };
          }
          return node;
        }));
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
        return { success: true, nodeId, newReplicas: targetReplicas, message: `Node ${nodeId} successfully scaled to ${targetReplicas} replicas` };
      }
    }, (tool, input, output) => addLog(tool, input, output));

    // Tool 3: 优化显存与清理 KV Cache
    registerWebMCPTool({
      name: 'optimize_gpu_memory',
      description: 'Trigger memory defragmentation and flush stale KV-cache to reduce VRAM pressure and drop p99 latency.',
      inputSchema: {
        type: 'object',
        properties: {
          targetNodeId: { type: 'string', description: 'Node ID or "all" to optimize whole cluster' }
        }
      },
      execute: async ({ targetNodeId = 'all' }) => {
        setNodes(prev => prev.map(node => {
          if (targetNodeId === 'all' || node.id === targetNodeId) {
            return {
              ...node,
              status: 'healthy',
              gpuMemoryUsed: Math.round(node.gpuMemoryUsed * 0.65),
              latencyMs: Math.round(node.latencyMs * 0.8)
            };
          }
          return node;
        }));
        confetti({ particleCount: 50, spread: 70 });
        return { success: true, optimized: targetNodeId, status: 'VRAM cleared by ~35%' };
      }
    }, (tool, input, output) => addLog(tool, input, output));

    // Tool 4: 运行模拟基准压测
    registerWebMCPTool({
      name: 'run_inference_benchmark',
      description: 'Run an automated throughput and latency stress test across inference nodes.',
      inputSchema: {
        type: 'object',
        properties: {
          concurrency: { type: 'number', description: 'Simulated concurrent requests (e.g. 50, 100, 500)' }
        },
        required: ['concurrency']
      },
      execute: async ({ concurrency }) => {
        setBenchmarkStatus(`Running benchmark (${concurrency} reqs)...`);
        await new Promise(r => setTimeout(r, 1200));
        setBenchmarkStatus('Benchmark Completed');
        return {
          throughput: `${Math.round(Number(concurrency) * 32.5)} tokens/s`,
          p50Latency: '14.2ms',
          p99Latency: '38.6ms',
          successRate: '99.98%'
        };
      }
    }, (tool, input, output) => addLog(tool, input, output));

  }, []);

  return (
    <div className="min-h-screen bg-[#090d13] text-gray-100 flex flex-col font-sans">
      {/* 顶部导航 */}
      <header className="border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">InfraPilot WebMCP</h1>
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full font-mono">
                OpenAI Challenge
              </span>
            </div>
            <p className="text-xs text-gray-400">Agent-Native AI Inference Cluster Orchestration Console</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs">
            <ShieldCheck className={`w-4 h-4 ${hasNativeWebMCP ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>WebMCP Engine:</span>
            <span className={`font-semibold ${hasNativeWebMCP ? 'text-emerald-400' : 'text-amber-400'}`}>
              {hasNativeWebMCP ? 'Native (In-App / Chrome)' : 'Polyfill Active'}
            </span>
          </div>

          <a 
            href="https://webmcp.devpost.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
          >
            <span>Challenge Specs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* 主体区域 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧两列：集群与交互操作 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 状态总览卡片 */}
          <div className="bg-[#111620] border border-gray-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-semibold text-white">Inference Cluster Topology</h2>
              </div>
              <div className="flex items-center space-x-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
                <button 
                  onClick={() => setActiveTab('topology')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${activeTab === 'topology' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Topology View
                </button>
                <button 
                  onClick={() => setActiveTab('tools')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${activeTab === 'tools' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Exposed WebMCP Tools (4)
                </button>
              </div>
            </div>

            {activeTab === 'topology' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {nodes.map((node) => (
                  <div 
                    key={node.id} 
                    className="p-4 rounded-xl bg-[#161c28]/70 border border-gray-800/80 hover:border-cyan-500/40 transition duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${node.status === 'healthy' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'}`} />
                        <span className="font-semibold text-sm text-gray-100">{node.name}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                        {node.type}
                      </span>
                    </div>

                    <div className="space-y-2 mt-3 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Replicas:</span>
                        <span className="font-mono text-cyan-300 font-semibold">{node.replicas} Pods</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">P99 Latency:</span>
                        <span className="font-mono text-emerald-400">{node.latencyMs} ms</span>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">VRAM Allocation:</span>
                          <span className="font-mono text-gray-200">{node.gpuMemoryUsed}%</span>
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${node.gpuMemoryUsed > 85 ? 'bg-rose-500' : node.gpuMemoryUsed > 60 ? 'bg-amber-500' : 'bg-cyan-500'}`} 
                            style={{ width: `${node.gpuMemoryUsed}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  These tools are directly declared on <code className="text-cyan-300 bg-gray-900 px-1.5 py-0.5 rounded">document.modelContext.registerTool</code>. AI Agents can query and manipulate the UI in real time.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { name: 'get_cluster_topology', desc: 'Inspect nodes, memory, latencies and health in JSON.' },
                    { name: 'scale_service_replicas', desc: 'Scale specific inference pods from 1 to 16.' },
                    { name: 'optimize_gpu_memory', desc: 'Flush KV cache and optimize fragmented VRAM.' },
                    { name: 'run_inference_benchmark', desc: 'Trigger parallel concurrency performance test.' },
                  ].map((t) => (
                    <div key={t.name} className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-cyan-400">{t.name}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">Callable</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 交互演练控制器（方便人工在没有 Agent 时一键调用测试） */}
          <div className="bg-[#111620] border border-gray-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">Interactive Agent Simulation</h3>
              </div>
              <span className="text-xs text-gray-400">Test WebMCP tools without external LLM</span>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Clicking below simulates what an autonomous agent (like ChatGPT or Claude in browser) performs via WebMCP:
            </p>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={async () => {
                  const tool = (window as any).__webmcp_tools?.scale_service_replicas;
                  if (tool) await tool.execute({ nodeId: 'llm-deepseek-r1', replicas: 4 });
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-blue-500/20"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulate Agent: Scale DeepSeek to 4</span>
              </button>

              <button
                onClick={async () => {
                  const tool = (window as any).__webmcp_tools?.optimize_gpu_memory;
                  if (tool) await tool.execute({ targetNodeId: 'all' });
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-emerald-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simulate Agent: Flush All KV Caches</span>
              </button>

              <button
                onClick={async () => {
                  const tool = (window as any).__webmcp_tools?.run_inference_benchmark;
                  if (tool) await tool.execute({ concurrency: 200 });
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-purple-500/20"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Agent: Benchmark (200 reqs)</span>
              </button>
            </div>
            
            {benchmarkStatus !== 'Ready' && (
              <div className="mt-3 text-xs font-mono text-cyan-300 bg-gray-900/90 px-3 py-2 rounded-lg border border-cyan-500/30">
                {benchmarkStatus}
              </div>
            )}
          </div>
        </div>

        {/* 右侧列：WebMCP 实时执行审计日志 (Audit Stream) */}
        <div className="bg-[#111620] border border-gray-800/80 rounded-2xl p-5 flex flex-col h-[600px] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">WebMCP Tool Execution Audit</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
              Live Stream
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1 text-xs font-mono">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
                <Bot className="w-8 h-8 opacity-40" />
                <p>Waiting for Agent or user to trigger WebMCP tools...</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 bg-gray-950/80 rounded-xl border border-gray-800/70 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-gray-400 text-[11px]">
                    <span className="text-cyan-400 font-bold">⚡ {log.tool}</span>
                    <span>{log.time}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Input: </span>
                    <span className="text-gray-300">{JSON.stringify(log.input)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Output: </span>
                    <span className="text-emerald-300">{JSON.stringify(log.output)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="border-t border-gray-800/80 py-4 px-6 text-center text-xs text-gray-500">
        InfraPilot — Built for the OpenAI WebMCP Challenge · Standard Compliance: <code className="text-cyan-400">document.modelContext.registerTool</code>
      </footer>
    </div>
  );
}
