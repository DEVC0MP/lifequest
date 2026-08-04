import { spawn } from "node:child_process";
import { createServer } from "node:net";

const port = await findFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const preview = spawn(`npm run preview -- --port ${port} --strictPort`, {
  shell: true,
  stdio: "inherit"
});

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate a local preview port"));
        return;
      }
      const selectedPort = address.port;
      server.close((error) => error ? reject(error) : resolve(selectedPort));
    });
  });
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Server did not start at ${url}`);
}

function runPlaywright() {
  return new Promise((resolve) => {
    const child = spawn("npx playwright test --reporter=list --workers=1", {
      shell: true,
      stdio: "inherit",
      env: {
        ...process.env,
        PLAYWRIGHT_EXTERNAL_SERVER: "1",
        PLAYWRIGHT_BASE_URL: baseUrl
      }
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

try {
  await waitForServer(baseUrl, 20000);
  const code = await runPlaywright();
  preview.kill();
  process.exit(code);
} catch (error) {
  preview.kill();
  console.error(error);
  process.exit(1);
}
