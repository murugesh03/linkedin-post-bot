// scripts/post-resources.mjs
// Fully automated — fetches LIVE GitHub repos daily via GitHub Search API
// No hardcoded content — always fresh, real star counts, real repos

import fetch from 'node-fetch';

// ── 20 topic categories — rotates automatically forever ───────────────────────
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

// ── Format star count ─────────────────────────────────────────────────────────
function formatStars(count) {
  if (count >= 1000) return Math.round(count / 1000) + 'k';
  return count.toString();
}

// ── Fetch live repos from GitHub Search API ───────────────────────────────────
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

// ── Generate LinkedIn post using Groq ─────────────────────────────────────────
async function generateResourcePost(category, repos) {
  const repoLines = repos.map((r, i) =>
    `${i + 1}. ${r.name} — ${r.url} (⭐${r.stars})\n   ${r.desc}`
  ).join('\n\n');

  const prompt = `You are Murugesh Padmanabhan — Technical Lead and Senior Full-Stack Developer at HCL Tech, Chennai. 6+ years of hands-on experience across ReactJS, TypeScript, Node.js, Python, AI/ML, System Design, Security, and more.

Write a top-notch LinkedIn post sharing these GitHub repos for: ${category.label}
Focus: ${category.angle}

REAL REPOS (keep names, URLs, and star counts EXACTLY as given — do not change them):
${repoLines}

WRITE IN THIS EXACT FORMAT with real blank lines between every section:

${category.hook}

[2-3 sentences from personal experience. Why this topic matters to your growth as a developer. What problem these repos collectively solve. Specific, not generic.]

Here are the best free GitHub resources for this 👇

⚡ ${repos[0].name} — ${repos[0].url} ⭐${repos[0].stars}
[2 clear sentences: what is in this repo and specifically why a developer should open it today. Concrete, not vague.]

💡 ${repos[1].name} — ${repos[1].url} ⭐${repos[1].stars}
[2 clear sentences: what makes this repo uniquely valuable. What does it teach or solve that others do not.]

🔥 ${repos[2].name} — ${repos[2].url} ⭐${repos[2].stars}
[2 clear sentences: what is inside and how a developer uses it in practice. Mention a specific feature or use case.]

✅ ${repos[3] ? repos[3].name : repos[0].name} — ${repos[3] ? repos[3].url : repos[0].url} ⭐${repos[3] ? repos[3].stars : repos[0].stars}
[2 clear sentences: concrete benefit and who should use this. Be specific about what type of developer needs it.]

🎯 ${repos[4] ? repos[4].name : repos[1].name} — ${repos[4] ? repos[4].url : repos[1].url} ⭐${repos[4] ? repos[4].stars : repos[1].stars}
[2 clear sentences: why bookmark this right now. What does it unlock for someone who studies it seriously.]

[One crisp memorable takeaway — the single most important lesson from these repos.]

[One genuine question that invites developers to share their own favourite resources in the comments.]

#${category.label.replace(/[^a-zA-Z0-9]/g, '')} #GitHub #OpenSource #Programming #Developer

STRICT RULES:
- Keep EXACT repo names, URLs, and star counts — never modify them
- 2 clear sentences per repo — specific and concrete, not corporate marketing language
- Write from personal experience: use "I", "our team", "in production"
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

// ── Clean AI formatting artifacts ─────────────────────────────────────────────
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

// ── Publish to LinkedIn ───────────────────────────────────────────────────────
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

// ── Main ──────────────────────────────────────────────────────────────────────
const now = new Date();
const EPOCH = new Date('2025-01-01').getTime();
const daysSinceEpoch = Math.floor((now.getTime() - EPOCH) / 86400000);
const category = CATEGORIES[daysSinceEpoch % CATEGORIES.length];

console.log(`\nCategory: ${category.label} (index ${daysSinceEpoch % CATEGORIES.length} of ${CATEGORIES.length})`);

console.log('Fetching live repos from GitHub API...');
const repos = await fetchGitHubRepos(category);
console.log(`Found ${repos.length} repos:`);
repos.forEach(r => console.log(`  ⭐${r.stars} — ${r.fullName}`));

console.log('\nGenerating post with Groq...');
const postText = await generateResourcePost(category, repos);
console.log('\nGenerated post:\n' + postText);

console.log('\nPublishing to LinkedIn...');
const postId = await postToLinkedIn(postText);
console.log(`\n✅ Published! Post ID: ${postId}`);