// Setup check for .qurio/seed.json ("Make your Vercel project"). Read only.
// Passes (exit 0) when this folder is linked to a Vercel project in the team the
// person picked on the setup card. Qurio passes that team's id as the one argument
// ({vercelTeamId}), the same id `.vercel/project.json` names as `orgId`. A folder
// linked to another team (Vercel's default one, say) fails, so the link runs again.
import { readFileSync } from 'node:fs';

const want = (process.argv[2] || '').trim();

let linked;
try {
  linked = JSON.parse(readFileSync('.vercel/project.json', 'utf8'));
} catch {
  console.log('This folder is not linked to a Vercel project yet.');
  process.exit(1);
}

if (!want) {
  console.log('No Vercel team was picked.');
  process.exit(1);
}
if (linked.orgId === want) {
  console.log(`Linked to Vercel project ${linked.projectId} in team ${linked.orgId}.`);
  process.exit(0);
}
console.log(`Linked to Vercel team ${linked.orgId}, not the team you picked (${want}).`);
process.exit(1);
