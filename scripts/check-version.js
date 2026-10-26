// Runs before every `npm version` (the "preversion" script) and refuses a
// version that breaks the branch rules in README → "Branches and versions":
//
//   main            plain versions only (0.2.1, 0.3.0)
//   feature branch  prereleases named after the branch (0.3.0-autocampaigns.4),
//                   based on a version newer than anything released so far
//
// and any version whose git tag already exists, locally or on GitHub.
// Nothing is changed when it fails. ALLOW_ANY_VERSION=1 skips the checks.

const { execSync } = require("child_process");

const sh = (cmd) => execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

function fail(msg) {
  console.error(`\n✖ ${msg}\n  See README → "Branches and versions".\n`);
  process.exit(1);
}

// Compares X.Y.Z only; prerelease suffixes are ignored.
function compareCore(a, b) {
  const pa = a.split("-")[0].split(".").map(Number);
  const pb = b.split("-")[0].split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

if (process.env.ALLOW_ANY_VERSION) process.exit(0);

const version = process.env.npm_new_version;
if (!version) fail("npm didn't pass the new version; run this through `npm version`.");

const branch = sh("git rev-parse --abbrev-ref HEAD");
const tag = `v${version}`;
const isPrerelease = version.includes("-");

let remoteTags = [];
try {
  remoteTags = sh("git ls-remote --tags origin")
    .split("\n")
    .map((l) => l.split("refs/tags/")[1])
    .filter(Boolean)
    .map((t) => t.replace(/\^\{\}$/, ""));
} catch {
  fail("Couldn't list tags on GitHub (offline?). Check that the tag is free, then retry.");
}
const localTags = sh("git tag").split("\n").filter(Boolean);
const allTags = new Set([...localTags, ...remoteTags]);

if (allTags.has(tag)) fail(`Tag ${tag} already exists. Pick another version.`);

if (branch === "main") {
  if (isPrerelease) {
    fail(`main releases plain versions only; ${version} is a prerelease.`);
  }
} else {
  const id = branch.replace(/[^0-9A-Za-z-]/g, "-");
  if (!new RegExp(`^\\d+\\.\\d+\\.\\d+-${id}\\.\\d+$`).test(version)) {
    fail(
      `Branch ${branch} releases prereleases only, like X.Y.Z-${id}.N.\n` +
        `  First time on this branch: npm version preminor --preid=${id}\n` +
        `  After that:                npm version prerelease --preid=${id}`,
    );
  }
  const highestPlain = [...allTags]
    .filter((t) => /^v\d+\.\d+\.\d+$/.test(t))
    .map((t) => t.slice(1))
    .sort(compareCore)
    .pop();
  if (highestPlain && compareCore(version, highestPlain) <= 0) {
    const [major, minor] = highestPlain.split(".").map(Number);
    fail(
      `${version} is based on ${version.split("-")[0]}, but ${highestPlain} is already released.\n` +
        `  Move this branch past it: npm version ${major}.${minor + 1}.0-${id}.0`,
    );
  }
}
