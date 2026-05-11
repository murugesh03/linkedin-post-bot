// scripts/post-resources.mjs
// Fully automated — fetches LIVE GitHub repos daily via GitHub Search API
// v2: Integrity check + retry loop — verifies repo data wasn't hallucinated before posting

import fetch from 'node-fetch';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const MAX_RETRIES = 3; // Resources posts are lower risk — 3 retries is enough

// ── 20 topic categories — rotates automatically forever ──────────────────────
const CATEGORIES = [
  {
    label: 'DSA & Algorithms',
    query: 'topic:algorithms+topic:data-structures+stars:>1000',
    hook: 'These GitHub repos are a free, complete DSA curriculum. No paid course needed. 🎯',
    angle: 'DSA interview preparation, algorithm learning, and coding interview resources',
  },
  {
    label: 'JavaScript Mastery',
    query: 'topic:javascript+topic:learning+stars:>5000',
    hook: 'Most developers use JavaScript daily. Very few understand it deeply. These repos fix that. ⚡',
    angle: 'deep JavaScript learning, internals, quirks, and professional best practices',
  },
  {
    label: 'AI & Machine Learning',
    query: 'topic:machine-learning+topic:python+stars:>5000',
    hook: 'AI is reshaping every industry. These repos are where developers actually learn it. 🤖',
    angle: 'machine learning education, tools, frameworks, and practical AI implementation',
  },
  {
    label: 'System Design',
    query: 'topic:system-design+stars:>1000',
    hook: 'System design is the skill gap between mid-level and senior developers. Start here. 🏗️',
    angle: 'system design learning, scalability patterns, and architecture interview preparation',
  },
  {
    label: 'TypeScript',
    query: 'topic:typescript+topic:learning+stars:>1000',
    hook: 'TypeScript is the best thing that happened to JavaScript. These repos make you dangerous with it. 🔷',
    angle: 'TypeScript patterns, advanced type system, and production TypeScript practices',
  },
  {
    label: 'Node.js & Backend',
    query: 'topic:nodejs+topic:backend+stars:>5000',
    hook: 'Building Node.js backends? These repos contain what production experience actually teaches. 🚀',
    angle: 'Node.js best practices, backend patterns, security, and production deployment',
  },
  {
    label: 'Interview Preparation',
    query: 'topic:interview-questions+stars:>10000',
    hook: 'These repos are a complete free curriculum for cracking senior developer interviews. 📚',
    angle: 'technical interview preparation covering algorithms, system design, and behavioural rounds',
  },
  {
    label: 'React & Frontend',
    query: 'topic:react+topic:frontend+stars:>5000',
    hook: 'Using React every day is not the same as understanding it. These repos teach the difference. ⚛️',
    angle: 'React deep learning, component patterns, hooks, performance, and frontend architecture',
  },
  {
    label: 'Python Development',
    query: 'topic:python+topic:learning+stars:>10000',
    hook: 'Python is the most versatile language in 2025. These repos cover everything you need. 🐍',
    angle: 'Python best practices, advanced patterns, and professional Python development',
  },
  {
    label: 'DevOps & Docker',
    query: 'topic:devops+topic:docker+stars:>1000',
    hook: 'Developers who understand DevOps ship faster and break less. These repos show you how. 🐳',
    angle: 'DevOps practices, Docker, Kubernetes, CI/CD pipelines, and cloud deployment',
  },
  {
    label: 'Web Security',
    query: 'topic:security+topic:web-security+stars:>1000',
    hook: 'Most web apps have security vulnerabilities developers do not even know about. Fix that now. 🔐',
    angle: 'web security best practices, vulnerability prevention, and secure coding patterns',
  },
  {
    label: 'CSS & Design Systems',
    query: 'topic:css+topic:design+stars:>5000',
    hook: 'CSS is not just styling. It is a complete layout, animation, and design system. 🎨',
    angle: 'CSS mastery, design tokens, animation, and building scalable design systems',
  },
  {
    label: 'Databases & SQL',
    query: 'topic:database+topic:sql+stars:>1000',
    hook: 'Most developers write SQL every day. Very few write it well. These repos change that. 🗄️',
    angle: 'database design, SQL mastery, query optimisation, and data engineering fundamentals',
  },
  {
    label: 'Go Programming',
    query: 'topic:golang+stars:>5000',
    hook: 'Go is the language of cloud infrastructure and high-performance backends. Start here. 🦫',
    angle: 'Go language learning, goroutines, concurrency patterns, and production Go development',
  },
  {
    label: 'Deep Learning & LLMs',
    query: 'topic:deep-learning+topic:llm+stars:>1000',
    hook: 'LLMs and deep learning are not just for researchers anymore. These repos make them accessible. 🧠',
    angle: 'deep learning, large language models, transformers, and AI application development',
  },
  {
    label: 'Mobile Development',
    query: 'topic:react-native+topic:flutter+stars:>1000',
    hook: 'Mobile in 2025 means one codebase, all platforms. These repos show exactly how. 📱',
    angle: 'cross-platform mobile development with React Native, Flutter, and native patterns',
  },
  {
    label: 'CS Fundamentals',
    query: 'topic:computer-science+topic:education+stars:>5000',
    hook: 'You do not need a CS degree. You need what a CS degree teaches. These repos give you both. 🎓',
    angle: 'computer science fundamentals, self-study curriculum, and foundational concepts',
  },
  {
    label: 'Rust Programming',
    query: 'topic:rust+topic:learning+stars:>1000',
    hook: 'Rust is the fastest-growing systems language. The learning curve is real. These flatten it. 🦀',
    angle: 'Rust ownership model, memory safety, systems programming, and production Rust',
  },
  {
    label: 'Java Development',
    query: 'topic:java+topic:spring+stars:>5000',
    hook: 'Java powers more enterprise systems than any other language. These repos show you why it wins. ☕',
    angle: 'Java best practices, Spring Boot, concurrency, and enterprise development patterns',
  },
  {
    label: 'Open Source Resources',
    query: 'topic:awesome+topic:developer+stars:>10000',
    hook: 'The best developer resources on the internet are free and open source. Bookmark these now. ⭐',
    angle: 'curated open source learning resources, tools, and developer productivity repos',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function formatStars(count) {
  if (count >= 1000) return Math.round(count / 1000) + 'k';
  return count.toString();
}

function cleanPost(text) {
  return text
    .replace(/\[blank line\]/gi, '')
    .replace(/\[BLANK LINE\]/gi, '')
    .replace(/\[empty line\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH live repos from GitHub Search API (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchGitHubRepos(category) {
  const url = `https://api.github.com/search/repositories?q=${category.query}+pushed:>2024-01-01&sort=stars&order=desc&per_page=10`;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'linkedin-post-bot',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const repos = data.items
    .filter(r => r.description && r.description.length > 20 && !r.fork)
    .slice(0, 5)
    .map(r => ({
      name: r.name,
      fullName: r.full_name,
      url: `https://github.com/${r.full_name}`,
      stars: formatStars(r.stargazers_count),
      desc: r.description.replace(/[^\x20-\x7E]/g, '').trim(),
      language: r.language || 'Multiple',
    }));
  if (repos.length < 3) throw new Error('Not enough quality repos found for this topic');
  return repos;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE post with Groq (attempt injected for variety on retries)
// ─────────────────────────────────────────────────────────────────────────────
async function generateResourcePost(category, repos, attempt = 1) {
  const repoLines = repos.map((r, i) =>
    `${i + 1}. ${r.name} — ${r.url} (⭐${r.stars})\n   ${r.desc}`
  ).join('\n\n');

  const varietyHint = attempt > 1
    ? `NOTE: This is attempt ${attempt}. Write a completely different opening, angle, and phrasing than before.`
    : '';

  const prompt = `You are Murugesh Padmanabhan — Technical Lead and Senior Full-Stack Developer at HCL Tech, Chennai. 6+ years of hands-on experience across ReactJS, TypeScript, Node.js, Python, AI/ML, System Design, Security, and more.
${varietyHint}

Write a top-notch LinkedIn post sharing these GitHub repos for: ${category.label}
Focus: ${category.angle}

REAL REPOS (keep names, URLs, and star counts EXACTLY as given — do not modify them):
${repoLines}

WRITE IN THIS EXACT FORMAT with real blank lines between every section:

${category.hook}

[2-3 sentences from personal experience. Why this topic matters to your growth as a developer. What problem these repos collectively solve. Specific, not generic.]

Here are the best free GitHub resources for this 👇

⚡ ${repos[0].name} — ${repos[0].url} ⭐${repos[0].stars}
[2 clear sentences: what is in this repo and specifically why a developer should open it today.]

💡 ${repos[1].name} — ${repos[1].url} ⭐${repos[1].stars}
[2 clear sentences: what makes this repo uniquely valuable and what it teaches.]

🔥 ${repos[2].name} — ${repos[2].url} ⭐${repos[2].stars}
[2 clear sentences: what is inside and how a developer uses it in practice.]

✅ ${repos[3] ? repos[3].name : repos[0].name} — ${repos[3] ? repos[3].url : repos[0].url} ⭐${repos[3] ? repos[3].stars : repos[0].stars}
[2 clear sentences: concrete benefit and who should use this.]

🎯 ${repos[4] ? repos[4].name : repos[1].name} — ${repos[4] ? repos[4].url : repos[1].url} ⭐${repos[4] ? repos[4].stars : repos[1].stars}
[2 clear sentences: why bookmark this right now and what it unlocks.]

[One crisp memorable takeaway.]

[One genuine question inviting developers to share their favourite resources.]

#${category.label.replace(/[^a-zA-Z0-9]/g, '')} #GitHub #OpenSource #Programming #Developer

STRICT RULES:
- NEVER change repo names, URLs, or star counts — copy them character for character
- 2 clear sentences per repo — specific and concrete, no corporate marketing language
- Write from personal experience: "I", "our team", "in production"
- No buzzwords: no "leverage", "synergy", "paradigm", "utilize"
- Total post length: 250-320 words
- Output ONLY the post. No preamble, no labels, no extra text.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  return cleanPost((await res.json()).choices[0].message.content.trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 1 — PROGRAMMATIC INTEGRITY CHECK (no LLM needed)
//
// This is the most important check for resources posts.
// The GitHub data is already accurate — the only risk is the LLM modifying it.
// So we compare the generated post directly against the real repo data.
//
// Returns { pass, violations }
// ─────────────────────────────────────────────────────────────────────────────
function integrityCheck(postText, repos) {
  const violations = [];

  for (const repo of repos) {
    // Check URL is present and unmodified
    if (!postText.includes(repo.url)) {
      violations.push(`Missing or modified URL for "${repo.name}" — expected: ${repo.url}`);
    }

    // Check repo name is present
    if (!postText.includes(repo.name)) {
      violations.push(`Missing or modified repo name — expected: "${repo.name}"`);
    }

    // Check star count is present (the formatted value e.g. "45k" or "1200")
    if (!postText.includes(repo.stars)) {
      violations.push(`Missing or modified star count for "${repo.name}" — expected: ⭐${repo.stars}`);
    }
  }

  return { pass: violations.length === 0, violations };
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 2 — LLM CONTENT CHECK
//
// Catches false claims about what a repo does, wrong technologies mentioned,
// or hallucinated features that aren't in the repo description.
//
// Returns { pass, issues, revisedPost }
// ─────────────────────────────────────────────────────────────────────────────
async function contentCheck(postText, repos) {
  const repoContext = repos.map(r =>
    `- ${r.name} (${r.url}): ${r.desc}`
  ).join('\n');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a technical fact-checker reviewing a LinkedIn post about GitHub repositories.

REAL REPO DESCRIPTIONS (source of truth):
${repoContext}

POST TO CHECK:
"""
${postText}
"""

Check if the post makes any claims about these repos that contradict their actual descriptions above.
Examples of issues: saying a repo covers a topic it does not, attributing wrong language or framework to a repo, inventing features not mentioned in the description.

Do NOT flag writing style, opinions, or enthusiasm — only factual contradictions.

If all descriptions are accurate → respond with exactly: PASS
If issues found → respond with this JSON only (no markdown):
{
  "issues": ["specific issue 1", "specific issue 2"],
  "revisedPost": "the complete corrected post"
}

Output ONLY "PASS" or the JSON. Nothing else.`,
      }],
      temperature: 0.1,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) throw new Error(`Groq content-check error ${res.status}: ${await res.text()}`);
  const raw = (await res.json()).choices[0].message.content.trim();

  if (raw === 'PASS') return { pass: true, issues: [], revisedPost: null };

  try {
    const parsed = JSON.parse(raw);
    return { pass: false, issues: parsed.issues || [], revisedPost: parsed.revisedPost || null };
  } catch {
    return { pass: false, issues: ['Content checker returned unexpected format.'], revisedPost: null };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RETRY LOOP
//
// Per attempt:
//   1. Generate fresh post
//   2. Run integrity check (programmatic — instant, no LLM)
//      FAIL → regenerate immediately, no point running content check
//   3. Run content check (LLM)
//      PASS → publish immediately
//      FAIL + revisedPost → save as backup, try again
//
// After MAX_RETRIES → use best revision or last integrity-passing draft
// ─────────────────────────────────────────────────────────────────────────────
async function generateAndVerify(category, repos) {
  let bestRevised = null;
  let lastIntegrityPassDraft = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`\n✍️  Generating post — attempt ${attempt}/${MAX_RETRIES}...`);
    const draft = await generateResourcePost(category, repos, attempt);
    console.log('\n─── DRAFT ───\n' + draft + '\n─────────────');

    // ── Step 1: Integrity check (programmatic — fast, no LLM cost) ──────────
    console.log('\n🔍 Running integrity check (URLs, names, star counts)...');
    const integrity = integrityCheck(draft, repos);

    if (!integrity.pass) {
      console.log('❌ Integrity check FAILED — LLM modified live repo data:');
      integrity.violations.forEach((v, i) => console.log(`   ${i + 1}. ${v}`));
      console.log('🔄 Regenerating — no point content-checking a post with wrong URLs...\n');
      continue; // Skip content check, regenerate immediately
    }

    console.log('✅ Integrity check PASSED — all URLs, names, star counts intact.');
    lastIntegrityPassDraft = draft; // Save as fallback

    // ── Step 2: Content check (LLM — checks descriptive accuracy) ───────────
    console.log('\n🔎 Running content check...');
    const content = await contentCheck(draft, repos);

    if (content.pass) {
      console.log(`✅ Content check PASSED on attempt ${attempt} — publishing.`);
      return draft;
    }

    console.log(`⚠️  Content check FAILED on attempt ${attempt}:`);
    content.issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));

    if (content.revisedPost) {
      // Only save revision if it also passes integrity check
      const revIntegrity = integrityCheck(cleanPost(content.revisedPost), repos);
      if (revIntegrity.pass) {
        bestRevised = cleanPost(content.revisedPost);
        console.log('📝 Corrected version passed integrity — saved as backup.');
      } else {
        console.log('⚠️  Corrected version also failed integrity — discarding it.');
      }
    }

    if (attempt < MAX_RETRIES) {
      console.log('🔄 Generating a completely new post...\n');
    }
  }

  // All retries exhausted
  if (bestRevised) {
    console.log(`\n⚠️  All ${MAX_RETRIES} attempts needed corrections. Using best corrected version.`);
    console.log('\n─── FINAL (CORRECTED) ───\n' + bestRevised + '\n─────────────────────────');
    return bestRevised;
  }

  if (lastIntegrityPassDraft) {
    console.log(`\n⚠️  Content checks didn't fully pass. Using last integrity-passing draft.`);
    return lastIntegrityPassDraft;
  }

  // Every single attempt failed integrity — repo data was always modified
  throw new Error('All attempts failed integrity check. GitHub repo data was hallucinated every time. Aborting.');
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLISH
// ─────────────────────────────────────────────────────────────────────────────
async function postToLinkedIn(text) {
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.LINKEDIN_ACCESS_TOKEN,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });
  if (!res.ok) throw new Error(`LinkedIn error ${res.status}: ${await res.text()}`);
  return (await res.json()).id;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const now = new Date();
const EPOCH = new Date('2025-01-01').getTime();
const daysSinceEpoch = Math.floor((now.getTime() - EPOCH) / 86400000);
const category = CATEGORIES[daysSinceEpoch % CATEGORIES.length];

console.log(`\n🚀 Category: ${category.label} (index ${daysSinceEpoch % CATEGORIES.length} / ${CATEGORIES.length - 1})`);

console.log('\n📡 Fetching live repos from GitHub API...');
const repos = await fetchGitHubRepos(category);
console.log(`✅ Found ${repos.length} repos:`);
repos.forEach(r => console.log(`   ⭐${r.stars} — ${r.fullName} — ${r.url}`));

// Generate → integrity check → content check → retry loop
const finalPost = await generateAndVerify(category, repos);

console.log('\n📤 Publishing to LinkedIn...');
const postId = await postToLinkedIn(finalPost);
console.log(`\n✅ Published! Post ID: ${postId}`);