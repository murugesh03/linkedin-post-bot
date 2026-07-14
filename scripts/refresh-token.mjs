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
  try {
    // Use GitHub CLI (gh) which is pre-installed on GitHub Actions runners
    const repo = process.env.GITHUB_REPO; // e.g. murugesh03/linkedin-post-bot
    execSync(
      `echo "${secretValue}" | gh secret set ${secretName} --repo ${repo}`,
      { stdio: 'pipe', env: { ...process.env, GH_TOKEN: process.env.GITHUB_PAT } }
    );
    console.log(`✅ GitHub Secret '${secretName}' updated`);
  } catch (err) {
    throw new Error(`Failed to update secret ${secretName}: ${err.message}`);
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
