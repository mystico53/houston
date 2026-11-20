// Setup step for .qurio/seed.json ("Deploy from your copy"): connect this folder's
// Vercel project to the GitHub repository in `origin` (the designer's fork).
// A script, not `npx vercel git connect $(git remote get-url origin) --yes`: Qurio
// types a step's command into whichever shell the terminal has (Windows PowerShell
// 5.1, cmd or bash), and `$(…)` is not cmd's. Node reads the same everywhere.
import { execFileSync, spawnSync } from 'node:child_process';

let origin = '';
try {
  origin = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
} catch {
  console.log('This folder has no `origin` remote yet.');
  process.exit(1);
}
// Only a GitHub repository address goes on to the command line.
if (!/^(?:https:\/\/github\.com\/|git@github\.com:)[\w.-]+\/[\w.-]+$/.test(origin)) {
  console.log(`origin is ${origin}, not a GitHub repository.`);
  process.exit(1);
}

// npx is npx.cmd on Windows, which Node starts only through a shell.
const win = process.platform === 'win32';
const r = spawnSync(win ? 'npx.cmd' : 'npx', ['vercel', 'git', 'connect', origin, '--yes'], { stdio: 'inherit', shell: win });
process.exit(r.status ?? 1);
