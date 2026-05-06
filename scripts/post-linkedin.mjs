// scripts/post-linkedin.mjs
// Fully automatic forever — topics cycle endlessly, news fetched live daily

import fetch from 'node-fetch';

// ── 90 micro-topics covering all skills ───────────────────────────────────────
const ALL_TOPICS = [
  { skill: 'React', topic: 'useState vs useReducer — when to use which' },
  { skill: 'React', topic: 'useEffect cleanup — why most developers skip it' },
  { skill: 'React', topic: 'React.memo — stop unnecessary re-renders today' },
  { skill: 'React', topic: 'useCallback — the right way to memoize functions' },
  { skill: 'React', topic: 'useMemo — when it helps and when it hurts performance' },
  { skill: 'React', topic: 'Custom hooks — extract and reuse logic cleanly' },
  { skill: 'React', topic: 'Context API — avoid prop drilling the right way' },
  { skill: 'React', topic: 'React lazy and Suspense — code splitting made simple' },
  { skill: 'React', topic: 'Error boundaries — catch errors without crashing the app' },
  { skill: 'React', topic: 'useRef — more than just DOM access' },
  { skill: 'React', topic: 'React portals — render outside the component tree' },
  { skill: 'React', topic: 'Compound components pattern — flexible component design' },
  { skill: 'React', topic: 'React keys — why the wrong key breaks your list' },
  { skill: 'React', topic: 'Controlled vs uncontrolled components — which to choose' },
  { skill: 'React', topic: 'React 19 new features — what changed and why it matters' },
  { skill: 'TypeScript', topic: 'TypeScript generics — write reusable type-safe code' },
  { skill: 'TypeScript', topic: 'Union and intersection types — combining types smartly' },
  { skill: 'TypeScript', topic: 'Type guards — narrow types at runtime safely' },
  { skill: 'TypeScript', topic: 'Utility types: Partial, Pick, Omit, Record explained' },
  { skill: 'TypeScript', topic: 'Mapped types — transform object types dynamically' },
  { skill: 'TypeScript', topic: 'Conditional types — TypeScript logic you did not know existed' },
  { skill: 'TypeScript', topic: 'Discriminated unions — handle complex state with types' },
  { skill: 'TypeScript', topic: 'Strict mode — why you should always enable it' },
  { skill: 'TypeScript', topic: 'TypeScript with React — typing props, hooks, and events' },
  { skill: 'TypeScript', topic: 'TypeScript decorators — understand them once and for all' },
  { skill: 'JavaScript', topic: 'JavaScript closures — explained with real examples' },
  { skill: 'JavaScript', topic: 'Event loop — how JS handles async under the hood' },
  { skill: 'JavaScript', topic: 'Promises vs async/await — stop using them wrong' },
  { skill: 'JavaScript', topic: 'Array methods: map, filter, reduce — master them all' },
  { skill: 'JavaScript', topic: 'Destructuring and spread — write cleaner JS today' },
  { skill: 'JavaScript', topic: 'ES2024 features every developer must know' },
  { skill: 'JavaScript', topic: 'JavaScript modules: ESM vs CommonJS explained' },
  { skill: 'JavaScript', topic: 'Optional chaining and nullish coalescing — safer code' },
  { skill: 'Node.js', topic: 'Node.js streams — handle large data without memory issues' },
  { skill: 'Node.js', topic: 'Express middleware — how it works and how to write your own' },
  { skill: 'Node.js', topic: 'Node.js clustering — use all CPU cores effectively' },
  { skill: 'Node.js', topic: 'Error handling in Express — the right pattern to follow' },
  { skill: 'Node.js', topic: 'Node.js environment variables — manage config the right way' },
  { skill: 'Node.js', topic: 'Rate limiting in Express — protect your API from abuse' },
  { skill: 'Node.js', topic: 'Node.js performance profiling — find and fix bottlenecks' },
  { skill: 'Node.js', topic: 'JWT authentication in Node.js — implement it securely' },
  { skill: 'MongoDB', topic: 'MongoDB aggregation pipeline — transform data like a pro' },
  { skill: 'MongoDB', topic: 'MongoDB indexing — speed up queries by 10x' },
  { skill: 'MongoDB', topic: 'Schema design in MongoDB — embed vs reference explained' },
  { skill: 'MongoDB', topic: 'MongoDB transactions — ACID compliance in NoSQL' },
  { skill: 'MongoDB', topic: 'Mongoose virtuals and middleware — power features explained' },
  { skill: 'Redux', topic: 'Redux Toolkit createSlice — simplify Redux in 10 minutes' },
  { skill: 'Redux', topic: 'RTK Query — forget Axios and useEffect for data fetching' },
  { skill: 'Redux', topic: 'Redux middleware — thunk vs saga explained simply' },
  { skill: 'Redux', topic: 'Redux DevTools — debug state like a senior developer' },
  { skill: 'Redux', topic: 'Redux vs Zustand — which one to use in 2025' },
  { skill: 'Next.js', topic: 'Next.js App Router vs Pages Router — key differences' },
  { skill: 'Next.js', topic: 'Server components in Next.js — what changes for you' },
  { skill: 'Next.js', topic: 'Next.js data fetching: SSR, SSG, ISR explained simply' },
  { skill: 'Next.js', topic: 'Next.js Image and Font optimization — boost your scores' },
  { skill: 'Next.js', topic: 'Next.js middleware — protect routes and redirect users' },
  { skill: 'React Native', topic: 'React Native FlatList — render large lists without lag' },
  { skill: 'React Native', topic: 'React Native navigation — stack, tab, drawer explained' },
  { skill: 'React Native', topic: 'React Native performance — stop the jank once and for all' },
  { skill: 'React Native', topic: 'React Native Reanimated — smooth animations made easy' },
  { skill: 'React Native', topic: 'Sharing code between React and React Native apps' },
  { skill: 'Docker', topic: 'Docker for developers — containers explained in 5 minutes' },
  { skill: 'Docker', topic: 'Docker Compose — run your full stack with one command' },
  { skill: 'Docker', topic: 'Docker multi-stage builds — shrink your image size' },
  { skill: 'Docker', topic: 'Dockerizing a Node.js app — step by step guide' },
  { skill: 'CSS', topic: 'CSS Grid vs Flexbox — when to use which layout' },
  { skill: 'CSS', topic: 'CSS custom properties — variables that work everywhere' },
  { skill: 'CSS', topic: 'CSS animations vs JS animations — performance matters' },
  { skill: 'CSS', topic: 'Tailwind CSS — build faster without leaving HTML' },
  { skill: 'Testing', topic: 'React Testing Library — test what users actually see' },
  { skill: 'Testing', topic: 'Jest mocking — mock APIs, modules, and timers correctly' },
  { skill: 'Testing', topic: 'Unit vs integration vs E2E tests — what to write and when' },
  { skill: 'Testing', topic: 'Test coverage — what 80 percent means and what it does not' },
  { skill: 'Git', topic: 'Git rebase vs merge — stop the confusion once and for all' },
  { skill: 'Git', topic: 'GitHub Actions — automate your workflow from scratch' },
  { skill: 'Git', topic: 'Git hooks — run checks before every commit automatically' },
  { skill: 'Web Performance', topic: 'Core Web Vitals — LCP, FID, CLS explained for devs' },
  { skill: 'Web Performance', topic: 'Code splitting — load only what users need right now' },
  { skill: 'Web Performance', topic: 'Image optimization — WebP, lazy loading, and CDN tips' },
  { skill: 'Web Performance', topic: 'Browser caching — speed up your app for returning users' },
  { skill: 'System Design', topic: 'Frontend system design — scalability from day one' },
  { skill: 'System Design', topic: 'Micro-frontends — split your app the right way' },
  { skill: 'System Design', topic: 'API design — REST principles every developer must follow' },
  { skill: 'System Design', topic: 'CDN and caching — the fastest frontend optimization' },
  { skill: 'AWS', topic: 'AWS S3 and CloudFront — host your frontend for almost free' },
  { skill: 'AWS', topic: 'AWS Lambda — run backend code without managing servers' },
  { skill: 'AWS', topic: 'AWS for frontend developers — where to start in 2025' },
  { skill: 'AI', topic: 'AI coding tools in 2025 — which ones actually save time' },
  { skill: 'AI', topic: 'Integrating ChatGPT API into your React app — step by step' },
  { skill: 'AI', topic: 'Prompt engineering for developers — get better code from AI' },
  { skill: 'Vite', topic: 'Vite vs Webpack — why Vite is faster and when to migrate' },
  { skill: 'Webpack', topic: 'Webpack bundle analyzer — find and fix bloat in your app' },
  { skill: 'Material UI', topic: 'Material UI theming — customize components your way' },
  { skill: 'Material UI', topic: 'MUI sx prop and styled — which to use and when' },
  { skill: 'Zustand', topic: 'Zustand in 5 minutes — simplest state management in React' },
  { skill: 'Zustand', topic: 'Zustand middleware: persist, devtools, and immer explained' },
  { skill: 'PostgreSQL', topic: 'PostgreSQL vs MySQL — choose the right one for your app' },
  { skill: 'PostgreSQL', topic: 'PostgreSQL joins — INNER, LEFT, RIGHT explained simply' },
  { skill: 'Redis', topic: 'Redis caching in Node.js — speed up your API responses' },
  { skill: 'Redis', topic: 'Redis data structures — strings, hashes, lists, sets explained' },
];

// ── News keywords (auto-fetched daily, rotates by day) ────────────────────────
const NEWS_KEYWORDS = [
  'React JavaScript frontend 2025 latest update release',
  'TypeScript Node.js backend developer news 2025',
  'AI developer tools GitHub Copilot Cursor 2025',
  'web performance Chrome browser update 2025',
  'AWS cloud DevOps developer tools news 2025',
  'open source trending GitHub developer tools 2025',
  'React Native mobile development update 2025',
];

// ── Session detection ─────────────────────────────────────────────────────────
const now = new Date();
const utcHour = now.getUTCHours();
const day = now.getDay();

// Days since a fixed epoch — auto cycles topics forever
const EPOCH = new Date('2025-01-01').getTime();
const daysSinceEpoch = Math.floor((now.getTime() - EPOCH) / 86400000);

// Morning gets even index, evening gets odd index — cycles endlessly
const morningIndex = (daysSinceEpoch * 2) % ALL_TOPICS.length;
const eveningIndex = (daysSinceEpoch * 2 + 1) % ALL_TOPICS.length;

let session;
if (utcHour >= 3 && utcHour < 6) session = 'Morning';
else if (utcHour >= 6 && utcHour < 13) session = 'News';
else session = 'Evening';

const topicObj = session === 'Morning' ? ALL_TOPICS[morningIndex] : ALL_TOPICS[eveningIndex];
const newsKeyword = NEWS_KEYWORDS[day];

// ── Fetch trending tech news via Groq ─────────────────────────────────────────
async function fetchLatestNews() {
  const today = now.toISOString().split('T')[0];
  const prompt = `Today is ${today}. You are an expert tech journalist writing for developers.

Write a LinkedIn post about the LATEST and most talked about news or release in: ${newsKeyword}

Think about what major frameworks, tools, or companies announced or released recently in 2025 that developers are actively discussing right now.

Write in this EXACT structure with a blank line between every element:

[Hook — 1 punchy breaking news style line. Do NOT start with "I".]

[1 line — why every developer needs to know this right now]

⚡ [News detail 1 — name actual tool, version, or announcement]

💡 [News detail 2 — what specifically changed or improved]

🔥 [News detail 3 — real impact on developer workflow]

✅ [What you should do or try today because of this news]

🎯 [What to watch or expect next]

[1 line clear takeaway]

[1 question to spark discussion in comments]

#TechNews #WebDev #Developer #Programming

RULES:
- Name real tools, versions, companies — be specific
- Simple language — any developer can understand
- Each bullet max 10 words
- Blank line between EVERY element
- Output ONLY the post. Nothing else.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ── Generate skill post ───────────────────────────────────────────────────────
async function generateSkillPost(t) {
  const prompt = `You are writing a LinkedIn post for Murugesh Padmanabhan — Technical Lead & Senior Frontend/MERN Stack Developer at HCL Tech, Chennai. 6+ years in ReactJS, TypeScript, JavaScript, Node.js, MongoDB, Redux, React Native, Next.js, Docker, Jest, Material UI, Formik, Zustand, AWS, Redis, PostgreSQL, MySQL, Webpack, Vite, GitHub Actions, Chart.js, System Design.

Skill: ${t.skill}
Topic: ${t.topic}

GOAL: Maximum reach and engagement. Simple enough for junior devs. Valuable enough for seniors.

Write in this EXACT structure with a blank line between every element:

[Hook — 1 punchy line. Bold claim or surprising fact. Do NOT start with "I".]

[1 line — simple relatable problem every developer faces]

⚡ [Tip 1 — name the exact API, method, hook, or command]

💡 [Tip 2 — name the exact API, method, hook, or command]

🔥 [Tip 3 — name the exact API, method, hook, or command]

✅ [Tip 4 — name the exact API, method, hook, or command]

🎯 [Tip 5 — name the exact API, method, hook, or command]

[1 line — simple memorable takeaway]

[1 question to drive comments from all levels of developers]

#${t.skill.replace(/\s/g, '')} #WebDev #Programming #100DaysOfCode

RULES:
- Simple language — a junior dev must understand every word
- Specific — name actual hooks, methods, commands, or tools
- No buzzwords — no "leverage", "paradigm", "synergy"
- Each bullet max 10 words
- Blank line between EVERY element
- Output ONLY the post. Nothing else.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
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
  const data = await res.json();
  return data.id;
}

// ── Main ──────────────────────────────────────────────────────────────────────
let postText, label;

if (session === 'News') {
  label = `Tech News — ${newsKeyword}`;
  postText = await fetchLatestNews();
} else {
  label = `[${topicObj.skill}] ${topicObj.topic}`;
  postText = await generateSkillPost(topicObj);
}

console.log(`\n${session} Post — ${label}`);
console.log(`Topic index: ${session === 'Morning' ? morningIndex : eveningIndex} / ${ALL_TOPICS.length}`);
console.log('\nGenerated post:\n' + postText);

console.log('\nPublishing to LinkedIn...');
const postId = await postToLinkedIn(postText);
console.log(`\n✅ ${session} post published! ID: ${postId}`);