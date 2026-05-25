import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archiveDir = path.join(rootDir, "src", "content", "archive");
const publicDir = path.join(rootDir, "public");

const entries = await readdir(archiveDir, { withFileTypes: true });
const missingAudio = [];
const invalidAudio = [];

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith(".json")) continue;

  const filePath = path.join(archiveDir, entry.name);
  const raw = await readFile(filePath, "utf8");
  const specimen = JSON.parse(raw);
  const audio = specimen.audio;

  if (audio === null || audio === undefined || audio === "") continue;

  if (typeof audio !== "string" || !audio.startsWith("/")) {
    invalidAudio.push(`${entry.name}: audio must be null or an absolute public path`);
    continue;
  }

  const audioPath = path.join(publicDir, audio.slice(1));

  try {
    await access(audioPath);
  } catch {
    missingAudio.push(`${entry.name}: ${audio}`);
  }
}

if (invalidAudio.length > 0 || missingAudio.length > 0) {
  for (const error of invalidAudio) {
    console.error(`Invalid audio metadata: ${error}`);
  }

  for (const error of missingAudio) {
    console.error(`Missing audio asset: ${error}`);
  }

  process.exit(1);
}

console.log("Audio asset check passed.");
