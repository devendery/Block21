const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function runGit(args) {
  const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: (result.stdout ?? "").trim(),
    stderr: (result.stderr ?? "").trim(),
  };
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function collectFiles(dir, allowedExtensions) {
  const out = [];
  const stack = [dir];

  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;

    const rel = path.relative(repoRoot, current);
    if (
      rel.startsWith(".next") ||
      rel.startsWith("node_modules") ||
      rel.startsWith(".git") ||
      rel.startsWith(".trae")
    ) {
      continue;
    }

    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (allowedExtensions.has(ext)) out.push(full);
      }
    }
  }

  return out;
}

function fileContainsPattern(filePath, patterns) {
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  for (const pattern of patterns) {
    if (pattern.test(text)) return pattern;
  }

  return null;
}

function assertTagExists(tagName) {
  const r = runGit(["rev-parse", "--quiet", "--verify", `refs/tags/${tagName}`]);
  if (!r.ok) {
    fail(`[phase2:entry] Missing tag: ${tagName}. Phase-2 entry is blocked.`);
  }
}

function assertFilesUnchangedSinceTag(tagName, fileRelPaths) {
  for (const fileRel of fileRelPaths) {
    const r = runGit(["diff", "--name-only", `${tagName}..HEAD`, "--", fileRel]);
    if (!r.ok) {
      fail(`[phase2:entry] Unable to diff ${fileRel} vs ${tagName}:\n${r.stderr || r.stdout}`);
    }
    if (r.stdout.trim().length > 0) {
      fail(`[phase2:entry] ${fileRel} changed since ${tagName}. Phase-2 entry is blocked.`);
    }
  }
}

function assertNoForbiddenImportsInReact() {
  const reactRoots = [path.join(repoRoot, "app"), path.join(repoRoot, "components")];
  const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
  const forbidden = [
    /from\s+["']phaser["']/,
    /import\(\s*["']phaser["']\s*\)/,
    /\bnew\s+Phaser\.Game\b/,
    /\bPhaser\.Scene\b/,
    /from\s+["']colyseus\.js["']/,
    /import\(\s*["']colyseus\.js["']\s*\)/,
    /\bnew\s+Client\s*\(/,
    /\broom\.onStateChange\b/,
  ];

  const offenders = [];
  for (const root of reactRoots) {
    const files = collectFiles(root, allowedExtensions);
    for (const file of files) {
      const rel = path.relative(repoRoot, file);
      if (!rel.includes(".ts") && !rel.includes(".js")) continue;
      const matched = fileContainsPattern(file, forbidden);
      if (matched) offenders.push({ file: rel, matched: matched.toString() });
    }
  }

  if (offenders.length) {
    const lines = offenders.map((o) => `- ${o.file} matched ${o.matched}`).join("\n");
    fail(`[phase2:entry] Forbidden runtime imports/usages detected in React layer:\n${lines}`);
  }
}

function assertNoReactImportsInRuntime() {
  const runtimeFile = path.join(repoRoot, "game-client", "GameRuntime.ts");
  const forbidden = [
    /from\s+["']react["']/,
    /from\s+["']next\b/,
    /\bwagmi\b/,
    /@\/components\/ui/,
    /@\/lib\/utils/,
  ];

  const matched = fileContainsPattern(runtimeFile, forbidden);
  if (matched) {
    fail(`[phase2:entry] Forbidden React/Next/UI imports in runtime: game-client/GameRuntime.ts matched ${matched}`);
  }
}

function main() {
  const tag = "phase-1-locked-final";

  assertTagExists(tag);
  assertFilesUnchangedSinceTag(tag, [
    "game-client/GameRuntime.ts",
    "components/phase1/snake/SnakeGame.tsx",
  ]);

  assertNoForbiddenImportsInReact();
  assertNoReactImportsInRuntime();

  process.stdout.write("[phase2:entry] PASS\n");
}

main();
