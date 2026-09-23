// scripts/refresh-token.mjs
// Auto-refreshes LinkedIn access token every 50 days using refresh token
// Updates GitHub Secrets automatically — zero manual work ever

import fetch from 'node-fetch';
import { execSync } from 'child_process';

// ── Step 1: Refresh LinkedIn token ───────────────────────────────────────────
async function refreshLinkedInToken() {
  console.log('Calling LinkedIn token refresh API...');

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.LINKEDIN_REFRESH_TOKEN,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn token refresh failed ${res.status}: ${err}`);
  }

  const data = await res.json();
  console.log(`✅ New access token received — expires in ${Math.floor(data.expires_in / 86400)} days`);
  console.log(`✅ New refresh token received — expires in ${Math.floor(data.refresh_token_expires_in / 86400)} days`);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

// ── Step 2: Update GitHub Secret using GitHub CLI ─────────────────────────────
function updateGitHubSecret(secretName, secretValue) {
  const githubToken = process.env.GH_TOKEN;
  if (!githubToken) {
    throw new Error('GH_TOKEN is missing. Configure the GH_PAT repository secret before running token refresh.');
  }

  try {
    const repo = process.env.GITHUB_REPO; // e.g. murugesh03/linkedin-post-bot
    execSync(`gh secret set ${secretName} --repo ${repo}`, {
      input: `${secretValue}\n`,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GH_TOKEN: githubToken },
    });
    console.log(`✅ GitHub Secret '${secretName}' updated`);
  } catch (err) {
    const detail = err.stderr?.toString().trim() || err.message;
    throw new Error(`Failed to update secret ${secretName}: ${detail}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('=== LinkedIn Token Auto-Refresh ===\n');

const { accessToken, refreshToken } = await refreshLinkedInToken();

console.log('\nUpdating GitHub Secrets...');
updateGitHubSecret('LINKEDIN_ACCESS_TOKEN', accessToken);
updateGitHubSecret('LINKEDIN_REFRESH_TOKEN', refreshToken);

console.log('\n🎉 Done! Token refreshed and secrets updated automatically.');
console.log('Next auto-refresh will happen in 50 days.');
