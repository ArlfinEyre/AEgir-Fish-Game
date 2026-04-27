import { spawn } from "node:child_process";
import { once } from "node:events";
import process from "node:process";

const PORT = "8000";
/** 使用 127.0.0.1 便于 Windows 下浏览器与本机预览地址一致；需局域网访问可改为 0.0.0.0 */
const HOST = "127.0.0.1";
const MIN_NODE_MAJOR = 18;

function spawnInherited(command, args) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

async function runBuild() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const buildProcess = spawnInherited(npmCommand, ["run", "build"]);
  const [exitCode] = await once(buildProcess, "exit");

  if (exitCode !== 0) {
    console.error(
      `[ERROR] 构建失败（npm run build，退出码: ${exitCode ?? "unknown"}）。`,
    );
    console.error(
      "[HINT] 请先执行 npm install，并确认 Node.js 版本满足项目要求（建议 18+）。",
    );
    process.exit(exitCode ?? 1);
  }
}

function openBrowser(url) {
  const browserCommandByPlatform = {
    darwin: ["open", [url]],
    win32: ["cmd", ["/c", "start", "", url]],
  };

  const [command, args] =
    browserCommandByPlatform[process.platform] ?? ["xdg-open", [url]];
  const browserProcess = spawn(command, args, {
    detached: true,
    stdio: "ignore",
  });
  browserProcess.unref();
}

function startPreview() {
  const previewProcess = spawn(
    process.execPath,
    [
      "./node_modules/vite/bin/vite.js",
      "preview",
      "--host",
      HOST,
      "--port",
      PORT,
    ],
    {
      stdio: ["inherit", "pipe", "pipe"],
    },
  );

  previewProcess.on("error", (error) => {
    console.error(`[ERROR] 启动预览服务器失败: ${error.message}`);
    console.error("[HINT] 请确认依赖已安装并且端口 8000 未被占用。");
    process.exit(1);
  });

  let browserOpened = false;

  function tryOpenHubFromLog(text) {
    const localUrlMatch = text.match(/Local:\s+(https?:\/\/[^\s]+)/);
    if (!browserOpened && localUrlMatch?.[1]) {
      browserOpened = true;
      let url = localUrlMatch[1].replace(/\/$/, "");
      url = `${url}/index.html`;
      openBrowser(url);
    }
  }

  previewProcess.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);
    tryOpenHubFromLog(text);
  });

  previewProcess.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    process.stderr.write(text);
    tryOpenHubFromLog(text);
  });

  previewProcess.on("exit", (code) => {
    if (code !== 0) {
      console.error(
        `[ERROR] 预览服务器异常退出（退出码: ${code ?? "unknown"}）。`,
      );
    }
    process.exit(code ?? 0);
  });
}

function validateNodeVersion() {
  const major = Number.parseInt(process.versions.node.split(".")[0], 10);
  if (Number.isNaN(major) || major < MIN_NODE_MAJOR) {
    console.error(
      `[ERROR] 当前 Node.js 版本为 ${process.versions.node}，需要 ${MIN_NODE_MAJOR}+。`,
    );
    console.error("[HINT] 请升级 Node.js 后重试。");
    process.exit(1);
  }
}

validateNodeVersion();
await runBuild();
startPreview();
