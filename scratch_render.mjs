import { spawn } from "child_process";
import http from "http";
import fs from "fs";

const PORT = 4173;
const child = spawn("npx.cmd", ["vite", "preview", "--port", String(PORT)], {
  stdio: "pipe",
  shell: true,
});

child.stdout.on("data", (d) => console.log("STDOUT:", d.toString()));
child.stderr.on("data", (d) => console.log("STDERR:", d.toString()));

async function fetchPage() {
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 600));
    try {
      const html = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${PORT}/`, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(data));
        });
        req.on("error", reject);
        req.setTimeout(2000, () => req.destroy(new Error("Timeout")));
      });

      if (html && html.includes("<html")) {
        console.log("Successfully fetched HTML, length:", html.length);
        fs.writeFileSync("rendered_root.html", html, "utf8");
        break;
      }
    } catch (e) {
      console.log("Waiting for server...", e.message);
    }
  }
  child.kill("SIGTERM");
  process.exit(0);
}

fetchPage();
