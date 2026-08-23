// scripts/post-resources.mjs
// Fully automated — fetches LIVE GitHub repos daily via GitHub Search API
// v4: LLM invents a unique post format each day — no fixed templates, always fresh

import fetch from 'node-fetch';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const MAX_RETRIES = 3;
const GROQ_MAX_RETRIES = 3;

async function fetchGroq(url, options) {
  for (let attempt = 1; attempt <= GROQ_MAX_RETRIES; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429 || attempt === GROQ_MAX_RETRIES) return res;

    const retryAfter = Number(res.headers.get('retry-after'));
    const delaySeconds = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter
      : 20 * attempt;
    console.log(`⚠️  Groq rate limit reached. Retrying in ${delaySeconds}s...`);
    await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
  }
}

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
    fallbackQuery: 'topic:css+stars:>5000',
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
    fallbackQuery: 'topic:deep-learning+stars:>1000',
    hook: 'LLMs and deep learning are not just for researchers anymore. These repos make them accessible. 🧠',
    angle: 'deep learning, large language models, transformers, and AI application development',
  },
  {
    label: 'Mobile Development',
    query: 'topic:react-native+topic:flutter+stars:>1000',
    fallbackQuery: 'topic:react-native+stars:>1000',
    hook: 'Mobile in 2025 means one codebase, all platforms. These repos show exactly how. 📱',
    angle: 'cross-platform mobile development with React Native, Flutter, and native patterns',
  },
  {
    label: 'CS Fundamentals',
    query: 'topic:computer-science+topic:education+stars:>5000',
    fallbackQuery: 'topic:computer-science+stars:>5000',
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
    // ── FIXED: replaced topic:awesome+topic:developer (returns 0) with broader query ──
    label: 'Open Source Resources',
    query: 'topic:awesome+stars:>10000',
    fallbackQuery: 'awesome+developer+tools+stars:>5000',
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

function preserveRepoFacts(postText, repos) {
  const missingFacts = repos
    .filter(repo => !postText.includes(repo.name) || !postText.includes(repo.url) || !postText.includes(repo.stars))
    .map(repo => `${repo.name} | ${repo.url} | ⭐${repo.stars}`);

  if (missingFacts.length === 0) return postText;
  return `${postText}\n\nGitHub references:\n${missingFacts.join('\n')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 0: Generate a unique post format for today's resource post
// ─────────────────────────────────────────────────────────────────────────────
async function generatePostFormat(category, repos) {
  const today = new Date().toISOString().split('T')[0];
  const repoSummary = repos.map(r => `- ${r.name} (⭐${r.stars}): ${r.desc}`).join('\n');

  const raw = await fetchGroq('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [{
        role: 'user',
        content: `You are a LinkedIn content strategist specialising in developer audiences.

Today is ${today}.
Category: ${category.label}
Angle: ${category.angle}

Repos to feature:
${repoSummary}

Design a UNIQUE and ORIGINAL LinkedIn post format for sharing these GitHub repos.

Rules for a good format:
- The structure must suit this specific category — a security category deserves a different layout than an algorithms one
- Must feel natural for LinkedIn: scannable, visual rhythm, easy to skim
- Hook style must vary: it can be a challenge to the reader, a surprising statistic, a confession, a bold ranking claim, a use-case scenario, a "what if" question, or something else — NOT always the same opener
- How repos are presented can vary widely: numbered ranking with reasoning, matched to developer personas, grouped by use case, presented as a toolkit, framed as a learning path, compared side-by-side, or any other original approach
- Emoji usage should be deliberate and matched to the structure — not just default ⚡💡🔥✅🎯 every time
- Closing style should vary: a challenge, a save-this CTA, a prediction, a reflection, or a specific question
- The format must be COMPLETELY DIFFERENT from a generic "here are 5 repos with emoji bullets" list

HARD RULE: The format must include explicit placeholders showing exactly where each repo name, URL, and star count must appear — these data points must never be omitted or modified.

Output ONLY a concise format blueprint — plain text instructions the writer will follow.
No preamble, no commentary, no example post. Just the structural blueprint.
Keep it under 300 words.`,
      }],
      temperature: 0.95,
      max_tokens: 600,
    }),
  });

  if (!raw.ok) throw new Error(`Groq format error ${raw.status}: ${await raw.text()}`);
  return ((await raw.json()).choices[0].message.content.trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH live repos from GitHub Search API
// ─────────────────────────────────────────────────────────────────────────────
async function fetchGitHubRepos(category) {
  const queries = [category.query];
  if (category.fallbackQuery) queries.push(category.fallbackQuery);

  // Additional universal fallback using label keywords
  const labelQuery = encodeURIComponent(
    category.label.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().split(' ').slice(0, 3).join('+')
  ) + '+stars:>1000';
  queries.push(labelQuery);

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'linkedin-post-bot',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const isFallback = i > 0;

    try {
      const url = `https://api.github.com/search/repositories?q=${query}+pushed:>2024-01-01&sort=stars&order=desc&per_page=10`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.log(`⚠️  Query ${i + 1} failed with status ${res.status}`);
        continue;
      }

      const data = await res.json();
      const repos = (data.items || [])
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

      if (repos.length >= 3) {
        if (isFallback) console.log(`⚠️  Used fallback query ${i + 1} for "${category.label}".`);
        return repos;
      }

      console.log(`⚠️  Query ${i + 1} returned only ${repos.length} repos for "${category.label}" — trying next...`);
    } catch (err) {
      console.log(`⚠️  Query ${i + 1} threw error: ${err.message}`);
    }
  }

  throw new Error(`Not enough quality repos found for "${category.label}" after ${queries.length} attempts.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE post
// ─────────────────────────────────────────────────────────────────────────────
async function generateResourcePost(category, repos, formatBlueprint, attempt = 1) {
  const repoData = repos.map((r, i) =>
    `Repo ${i + 1}:\n  Name: ${r.name}\n  URL: ${r.url}\n  Stars: ⭐${r.stars}\n  Description: ${r.desc}`
  ).join('\n\n');

  const varietyHint = attempt > 1
    ? `NOTE: This is attempt ${attempt}. Keep the format blueprint but write completely different framing and copy.`
    : '';

  const res = await fetchGroq('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [{
        role: 'user',
        content: `You are Murugesh Padmanabhan — Technical Lead and Senior Full-Stack Developer at HCL Tech, Chennai.
${varietyHint}

Write a LinkedIn post sharing these GitHub repos for: ${category.label}
Focus: ${category.angle}

REAL REPO DATA — copy names, URLs, and star counts CHARACTER FOR CHARACTER. Never modify them:
${repoData}

FOLLOW THIS FORMAT EXACTLY:
${formatBlueprint}

STRICT RULES:
- NEVER change any repo name, URL, or star count — copy them exactly as given above
- Write 2 clear sentences per repo — specific and concrete, no marketing language
- Write from personal experience: "I", "our team", "in production"
- No buzzwords: no "leverage", "synergy", "paradigm", "utilize"
- 250-320 words total
- Output ONLY the post. No preamble, no labels, no extra text.`,
      }],
      temperature: 0.75,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  return preserveRepoFacts(cleanPost((await res.json()).choices[0].message.content.trim()), repos);
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRITY CHECK (programmatic)
// ─────────────────────────────────────────────────────────────────────────────
function integrityCheck(postText, repos) {
  const violations = [];
  for (const repo of repos) {
    if (!postText.includes(repo.url))   violations.push(`Missing or modified URL for "${repo.name}" — expected: ${repo.url}`);
    if (!postText.includes(repo.name))  violations.push(`Missing or modified name — expected: "${repo.name}"`);
    if (!postText.includes(repo.stars)) violations.push(`Missing or modified stars for "${repo.name}" — expected: ⭐${repo.stars}`);
  }
  return { pass: violations.length === 0, violations };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT CHECK (LLM)
// ─────────────────────────────────────────────────────────────────────────────
async function contentCheck(postText, repos) {
  const repoContext = repos.map(r => `- ${r.name} (${r.url}): ${r.desc}`).join('\n');

  const res = await fetchGroq('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [{
        role: 'user',
        content: `You are a technical fact-checker reviewing a LinkedIn post about GitHub repositories.

REAL REPO DESCRIPTIONS (source of truth):
${repoContext}

POST TO CHECK:
"""
${postText}
"""

Check if the post makes any claims about these repos that contradict their actual descriptions.
Do NOT flag writing style, opinions, or enthusiasm — only factual contradictions.

If all descriptions are accurate → respond with exactly: PASS
If issues found → respond with this JSON only (no markdown):
{
  "issues": ["specific issue 1"],
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
// ─────────────────────────────────────────────────────────────────────────────
async function generateAndVerify(category, repos, formatBlueprint) {
  let bestRevised = null;
  let lastIntegrityPassDraft = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`\n✍️  Generating post — attempt ${attempt}/${MAX_RETRIES}...`);
    const draft = await generateResourcePost(category, repos, formatBlueprint, attempt);
    console.log('\n─── DRAFT ───\n' + draft + '\n─────────────');

    console.log('\n🔍 Running integrity check...');
    const integrity = integrityCheck(draft, repos);

    if (!integrity.pass) {
      console.log('❌ Integrity check FAILED:');
      integrity.violations.forEach((v, i) => console.log(`   ${i + 1}. ${v}`));
      console.log('🔄 Regenerating...\n');
      continue;
    }

    console.log('✅ Integrity check PASSED.');
    lastIntegrityPassDraft = draft;

    console.log('\n🔎 Running content check...');
    const content = await contentCheck(draft, repos);

    if (content.pass) {
      console.log(`✅ Content check PASSED on attempt ${attempt} — publishing.`);
      return draft;
    }

    console.log(`⚠️  Content check FAILED on attempt ${attempt}:`);
    content.issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));

    if (content.revisedPost) {
      const revIntegrity = integrityCheck(cleanPost(content.revisedPost), repos);
      if (revIntegrity.pass) {
        bestRevised = cleanPost(content.revisedPost);
        console.log('📝 Corrected version passed integrity — saved as backup.');
      } else {
        console.log('⚠️  Corrected version failed integrity — discarding.');
      }
    }

    if (attempt < MAX_RETRIES) console.log('🔄 Generating a completely new post...\n');
  }

  if (bestRevised) {
    console.log(`\n⚠️  All ${MAX_RETRIES} attempts needed corrections. Using best corrected version.`);
    return bestRevised;
  }

  if (lastIntegrityPassDraft) {
    console.log(`\n⚠️  Content checks did not fully pass. Using last integrity-passing draft.`);
    return lastIntegrityPassDraft;
  }

  throw new Error('All attempts failed integrity check. Aborting.');
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
console.log(`   ${now.toISOString()}`);

console.log('\n📡 Fetching live repos from GitHub API...');
const repos = await fetchGitHubRepos(category);
console.log(`✅ Found ${repos.length} repos:`);
repos.forEach(r => console.log(`   ⭐${r.stars} — ${r.fullName} — ${r.url}`));

// Generate today's unique format blueprint (informed by actual repos)
console.log('\n🎨 Generating today\'s post format...');
const formatBlueprint = await generatePostFormat(category, repos);
console.log('\n─── FORMAT BLUEPRINT ───\n' + formatBlueprint + '\n────────────────────────');

// Generate → integrity check → content check → retry loop
const finalPost = await generateAndVerify(category, repos, formatBlueprint);

console.log('\n📤 Publishing to LinkedIn...');
const postId = await postToLinkedIn(finalPost);
console.log(`\n✅ Published! Post ID: ${postId}`);