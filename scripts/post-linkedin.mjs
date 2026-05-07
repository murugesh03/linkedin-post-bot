// scripts/post-linkedin.mjs
// Deep, detailed, crisp LinkedIn posts — 3x daily covering all skills

import fetch from 'node-fetch';

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

const NEWS_KEYWORDS = [
  'React JavaScript frontend 2025 latest update',
  'TypeScript Node.js backend developer news 2025',
  'AI developer tools GitHub Copilot Cursor 2025',
  'web performance Chrome browser update 2025',
  'AWS cloud DevOps developer tools news 2025',
  'open source trending GitHub developer tools 2025',
  'React Native mobile development update 2025',
];

// ── Clean up AI formatting artifacts ─────────────────────────────────────────
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

const now = new Date();
const utcHour = now.getUTCHours();
const day = now.getDay();
const EPOCH = new Date('2025-01-01').getTime();
const daysSinceEpoch = Math.floor((now.getTime() - EPOCH) / 86400000);
const morningIndex = (daysSinceEpoch * 2) % ALL_TOPICS.length;
const eveningIndex = (daysSinceEpoch * 2 + 1) % ALL_TOPICS.length;

let session;
if (utcHour >= 3 && utcHour < 6) session = 'Morning';
else if (utcHour >= 6 && utcHour < 13) session = 'News';
else session = 'Evening';

const topicObj = session === 'Morning' ? ALL_TOPICS[morningIndex] : ALL_TOPICS[eveningIndex];

async function generateSkillPost(t) {
  const prompt = `You are Murugesh Padmanabhan — Technical Lead and Senior Frontend/MERN Stack Developer at HCL Tech, Chennai. 6+ years of hands-on experience shipping production apps with ReactJS, TypeScript, Node.js, MongoDB, Redux, React Native, Next.js, Docker, AWS, Redis, PostgreSQL, Vite, Jest, Material UI, Zustand, GitHub Actions, System Design.

Write a detailed LinkedIn post about: "${t.topic}" — Skill: ${t.skill}

TARGET: Make developers stop scrolling, read every word, learn something real, and feel compelled to comment or share.

FOLLOW THIS EXACT FORMAT. Use a real empty line between every section — do NOT write the words "blank line":

[HOOK — One bold, surprising line. A counterintuitive fact, a common mistake, or a bold claim. Do NOT start with "I". Max 15 words.]

[STORY — 2 to 3 short sentences describing a real situation from experience. Specific, relatable, human. Reference a real project scenario, a bug you fixed, or a pattern you discovered.]

Here is what 6 years taught me 👇

⚡ [LABEL in 2-4 words] — [2-3 sentences. What it is, why it matters, how to use it. Include the actual method name, API, or pattern.]

💡 [LABEL in 2-4 words] — [2-3 sentences with a concrete example or comparison. Explain the WHY not just the WHAT.]

🔥 [LABEL in 2-4 words] — [2-3 sentences. A deeper insight or common mistake. Reference a real gotcha or edge case from production.]

✅ [LABEL in 2-4 words] — [2-3 sentences. The correct pattern or best practice. Mention a specific tool, hook, config, or code pattern by name.]

🎯 [LABEL in 2-4 words] — [2-3 sentences. Advanced tip that separates junior from senior developers on this topic.]

The bottom line: [One crisp memorable sentence — the single most important takeaway.]

[One genuine question that makes developers want to share their own experience.]

#${t.skill.replace(/\s/g,'')} #WebDevelopment #Programming #SoftwareEngineering

STRICT RULES:
- Every point must have 2-3 sentences of real depth — not one-liners
- Use real method names, API names, config keys, or tool names in every point
- Write from personal experience — use "I", "we", "our team", "in production"
- No buzzwords — no "leverage", "paradigm", "utilize", "synergy"
- Each label is bold and short (2-4 words)
- Blank line between EVERY section
- Total length: 280-380 words
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
      max_tokens: 1500,
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return cleanPost(data.choices[0].message.content.trim());
}

async function generateNewsPost() {
  const keyword = NEWS_KEYWORDS[day];
  const today = now.toISOString().split('T')[0];
  const prompt = `You are Murugesh Padmanabhan — Technical Lead and Senior Frontend/MERN Stack Developer at HCL Tech, Chennai. Today is ${today}.

Write a detailed, opinionated LinkedIn post reacting to the latest news or major update in: ${keyword}

TARGET: Give developers a real expert perspective — not just a summary, but your actual take on what it means for day-to-day development.

FOLLOW THIS EXACT FORMAT with blank lines exactly as shown:

[HOOK — One bold breaking-news style line. Make it feel urgent and relevant. Do NOT start with "I". Max 15 words.]

[blank line]

[CONTEXT — 2 to 3 sentences explaining what happened, what was released, or what changed. Name the actual tool, version, or company. Be specific.]

[blank line]

My take as a senior developer 👇

[blank line]

⚡ [LABEL in 2-4 words] — [What specifically changed or was announced. Name the exact feature, version number, or company involved. Explain the technical detail in 2-3 sentences.]

[blank line]

💡 [LABEL in 2-4 words] — [Why this matters to working developers. What problem does it solve? How does it compare to what existed before? 2-3 sentences with real depth.]

[blank line]

🔥 [LABEL in 2-4 words] — [Real impact on your workflow or codebase. Describe a concrete scenario where this change makes a difference. 2-3 sentences.]

[blank line]

✅ [LABEL in 2-4 words] — [What developers should do right now because of this. Specific action — update a package, read a doc, try a feature. 2-3 sentences.]

[blank line]

🎯 [LABEL in 2-4 words] — [Your personal prediction or opinion. What does this mean for the future of this technology? Be opinionated. 2-3 sentences.]

[blank line]

The bottom line: [One sharp sentence capturing your overall take on this news.]

[blank line]

[QUESTION — One genuine debate-sparking question about the news or update.]

[blank line]

#TechNews #WebDevelopment #Programming #Developer

STRICT RULES:
- Every point must have 2-3 sentences with real depth
- Name actual tools, versions, APIs, and companies throughout
- Be opinionated — share a real developer perspective
- No fluff — every sentence must add value
- Blank line between EVERY section
- Total length: 280-380 words
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
      max_tokens: 1500,
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return cleanPost(data.choices[0].message.content.trim());
}

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

let postText, label;

if (session === 'News') {
  label = `Tech News — ${NEWS_KEYWORDS[day]}`;
  postText = await generateNewsPost();
} else {
  label = `[${topicObj.skill}] ${topicObj.topic}`;
  postText = await generateSkillPost(topicObj);
}

console.log(`\n${session} Post — ${label}`);
console.log('\nGenerated post:\n' + postText);
console.log('\nPublishing to LinkedIn...');
const postId = await postToLinkedIn(postText);
console.log(`\n✅ ${session} post published! ID: ${postId}`);