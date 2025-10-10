import fs from "fs";
const apiBase = process.env.API_BASE || "";
const out = `// Auto-generated at build time
window.API_BASE = ${JSON.stringify(apiBase)};
`;
await fs.promises.writeFile("public/config.js", out, "utf8");
console.log(
  "Wrote public/config.js with API_BASE =",
  apiBase || "(empty for same-origin)",
);
