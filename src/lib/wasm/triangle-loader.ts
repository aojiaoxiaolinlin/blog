interface TriangleModule {
  default: (input?: URL | RequestInfo) => Promise<unknown>;
  start: (canvasId: string) => Promise<void>;
}

let modulePromise: Promise<TriangleModule> | null = null;

interface MountTriangleDemoOptions {
  canvasId: string;
  statusId: string;
}

const getTriangleModule = async () => {
  if (!modulePromise) {
    modulePromise = import("../../../wasm/triangle-renderer/pkg/triangle_renderer.js");
  }

  return modulePromise;
};

export const mountTriangleDemo = async ({
  canvasId,
  statusId,
}: MountTriangleDemoOptions) => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  const status = document.getElementById(statusId);

  if (!canvas || !status) return;

  if (!("gpu" in navigator)) {
    status.textContent = "当前浏览器不支持 WebGPU，请使用最新版 Chrome / Edge。";
    canvas.dataset.ready = "unsupported";
    return;
  }

  status.textContent = "正在加载 Rust / WASM 与 WebGPU 管线...";

  try {
    const triangle = await getTriangleModule();
    const wasmUrl = new URL(
      "../../../wasm/triangle-renderer/pkg/triangle_renderer_bg.wasm",
      import.meta.url,
    );
    await triangle.default(wasmUrl);
    await triangle.start(canvasId);
    canvas.dataset.ready = "true";
    status.textContent = "Rust + wgpu 已完成绘制。";
  } catch (error) {
    console.error(error);
    status.textContent = "初始化失败，请检查浏览器 WebGPU 支持或重新构建 WASM。";
    canvas.dataset.ready = "error";
  }
};
