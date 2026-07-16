import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { arch, platform } from "node:os";
import path from "node:path";

import {
  defaultResumeVariant,
  resumeVariantIds,
} from "../apps/web/src/lib/resume/variants";

const typstVersion = "0.15.0";
const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "resume/typst-basic/main.typ");
const publicOutput = path.join(root, "apps/web/public/resume");
const archiveOutput = path.join(root, "resume/typst-basic/output");

const run = (command: string, args: string[]) => {
  const result = spawnSync(command, args, { stdio: "inherit" });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
};

const commandExists = (command: string) =>
  spawnSync(command, ["--version"], { stdio: "ignore" }).status === 0;

const getTarget = () => {
  const currentPlatform = platform();
  const currentArch = arch();

  if (currentPlatform === "linux" && currentArch === "x64") {
    return "x86_64-unknown-linux-musl";
  }

  if (currentPlatform === "linux" && currentArch === "arm64") {
    return "aarch64-unknown-linux-musl";
  }

  if (currentPlatform === "darwin" && currentArch === "x64") {
    return "x86_64-apple-darwin";
  }

  if (currentPlatform === "darwin" && currentArch === "arm64") {
    return "aarch64-apple-darwin";
  }

  throw new Error(
    `Unsupported Typst platform: ${currentPlatform}/${currentArch}`
  );
};

const downloadTypst = async () => {
  const target = getTarget();
  const installRoot = path.join(root, ".cache/typst", typstVersion);
  const binary = path.join(installRoot, `typst-${target}`, "typst");

  if (existsSync(binary)) {
    return binary;
  }

  await mkdir(installRoot, { recursive: true });

  const asset = `typst-${target}.tar.xz`;
  const url = `https://github.com/typst/typst/releases/download/v${typstVersion}/${asset}`;
  const archive = path.join(installRoot, asset);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  await writeFile(archive, new Uint8Array(await response.arrayBuffer()));
  run("tar", ["-xf", archive, "-C", installRoot]);
  await chmod(binary, 0o755);

  return binary;
};

const getTypst = () => {
  if (commandExists("typst")) {
    return "typst";
  }

  return downloadTypst();
};

mkdirSync(publicOutput, { recursive: true });
mkdirSync(archiveOutput, { recursive: true });

const typst = await getTypst();

for (const variant of resumeVariantIds) {
  const publicPdf = path.join(publicOutput, `${variant}.pdf`);
  const archivePdf = path.join(archiveOutput, `${variant}.pdf`);

  run(typst, ["compile", "--input", `variant=${variant}`, source, publicPdf]);
  copyFileSync(publicPdf, archivePdf);
  console.log(`Built ${path.basename(publicPdf)}`);
}

copyFileSync(
  path.join(publicOutput, `${defaultResumeVariant}.pdf`),
  path.join(publicOutput, "manthan-mallikarjun.pdf")
);
