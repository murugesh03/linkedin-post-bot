// scripts/post-linkedin.mjs
// Generates 2 daily LinkedIn posts using Groq API (free) — morning and evening.

import fetch from 'node-fetch';

// ── Morning topics (technical, educational) ───────────────────────────────────
const MORNING_TOPICS = [
  'React hooks, performance optimization, and component patterns',         // Sun
  'React architecture, design patterns, and production best practices',    // Mon
  'TypeScript advanced types, generics, and type-safe patterns',           // Tue
  'Frontend system design, scalable architecture, technical decisions',    // Wed
  'AI tools for developers, LLM integrations, prompt engineering',         // Thu
  'Tech leadership, code review culture, engineering career growth',       // Fri
  'Node.js patterns, MongoDB optimization, MERN stack architecture',       // Sat
];

// ── Evening topics (career, insights, softer content) ────────────────────────
const EVENING_TOPICS = [
  'lessons learned from building production React apps',                   // Sun
  'mistakes junior developers make and how to avoid them',                 // Mon
  'how TypeScript changed the way I think about code quality',             // Tue
  'the most important soft skills for senior frontend developers',         // Wed
  'how AI is changing the daily workflow of frontend developers',          // Thu
  'what nobody tells you about becoming a Tech Lead',                      // Fri
  'how to stand out as a developer in a competitive job market',           // Sat
];

// ── Styles rotation ───────────────────────────────────────────────────────────
const MORNING_STYLES = [
  'numbered tips list',
  'before vs after',
  'numbered tips list',
  'myth vs reality',
  'numbered tips list',
  'common mistakes list',
  'numbered tips list',
];

const EVENING_STYLES = [
  'personal story with lesson',
  'hot take opinion',
  'personal story with lesson',
  'numbered insights list',
  'personal story with lesson',
  'hot take opinion',
  'personal story with lesson',
];

// ── Determine morning or evening ──────────────────────────────────────────────
const now = new Date();
const utcHour = now.getUTCHours();
const day = now.getDay();

// Morning = UTC 3:30 (9AM IST), Evening = UTC 13:30 (7PM IST)
const isEvening = utcHour >= 13;

const topic = isEvening ? EVENING_TOPICS[day] : MORNING_TOPICS[day];
const style = isEvening ? EVENING_STYLES[day] : MORNING_STYLES[day];
const session = isEvening ? 'Evening' : 'Morning';

// ── Step 1: Generate post with Groq ──────────────────────────────────────────
async function generatePost() {
  const prompt = `Write a LinkedIn post about ${topic} for Murugesh Padmanabhan, a Technical Lead and Senior Frontend/MERN Stack Developer at HCL Tech, Chennai. 6+ years in ReactJS, TypeScript, Node.js, MongoDB, Redux, React Native.
  const prompt = `Write a LinkedIn post about ${topic} for Murugesh Padmanabhan, a Technical Lead and Senior Frontend/MERN Stack Developer at HCL Tech, Chennai. 6+ years in ReactJS, TypeScript, Node.js, MongoDB, Redux, React Native.

FORMAT RULES — follow these exactly:
- Style: ${style}
- Hook: 1 punchy line that stops the scroll (do NOT start with "I", no generic openers)
- Body: short broken lines — NOT long paragraphs. Each line max 10 words.
- Use generous line breaks to make it scannable
- Each point must have ONE clear takeaway the reader can use TODAY
- Use emojis as bullet markers (→ ✅ ⚡ 🔥 💡 🎯) instead of plain dashes
- End with 1 question to drive comments
- 3-5 relevant hashtags on the last line

EXAMPLE FORMAT:
Most developers write useEffect wrong. Here's why 👇

After 6 years of React, I see this mistake everywhere:

⚡ Missing dependency arrays cause infinite loops
💡 Cleanup functions prevent memory leaks
🔥 Split effects by concern — don't bundle logic
✅ Custom hooks make effects reusable

The rule: one effect, one responsibility.

Which of these have you run into? Drop it below 👇

#ReactJS #Frontend #JavaScript #WebDev

Output ONLY the post. No preamble, no explanation.`;

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
      temperature: 0.85,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ── Step 2: Publish to LinkedIn ───────────────────────────────────────────────
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
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.id;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log(`${session} post — Topic: ${topic}`);
const postText = await generatePost();
console.log('\nGenerated post:\n' + postText);

console.log('\nPublishing to LinkedIn...');
const postId = await postToLinkedIn(postText);
console.log(`✅ ${session} post published! ID: ${postId}`);