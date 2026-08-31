export interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (input: any) => Promise<any>;
}

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: WebMCPTool) => Promise<void> | void;
    };
  }
}

/**
 * 安全注册 WebMCP 工具
 * 自动检测原生 document.modelContext，若不存在则挂载 mock/polyfill 方便在普通浏览器环境调试
 */
export function registerWebMCPTool(
  tool: WebMCPTool,
  onToolExecuted?: (toolName: string, input: any, output: any) => void
) {
  // 包裹 execute 函数以收集执行审计日志
  const wrappedExecute = async (input: any) => {
    try {
      const result = await tool.execute(input);
      if (onToolExecuted) {
        onToolExecuted(tool.name, input, result);
      }
      return result;
    } catch (error: any) {
      if (onToolExecuted) {
        onToolExecuted(tool.name, input, { error: error?.message || 'Execution failed' });
      }
      throw error;
    }
  };

  const finalTool = {
    ...tool,
    execute: wrappedExecute,
  };

  // 1. 如果浏览器原生支持 WebMCP (ChatGPT In-App Browser 或 Chrome flag 开启)
  if (typeof document !== 'undefined' && document.modelContext?.registerTool) {
    document.modelContext.registerTool(finalTool);
    console.log(`[WebMCP Native] Registered tool: ${tool.name}`);
  } else {
    // 2. Polyfill / 调试模式：注册在 window.__webmcp_tools 上
    if (typeof window !== 'undefined') {
      (window as any).__webmcp_tools = (window as any).__webmcp_tools || {};
      (window as any).__webmcp_tools[tool.name] = finalTool;
      console.log(`[WebMCP Polyfill/Dev] Registered tool: ${tool.name}`);
    }
  }
}
