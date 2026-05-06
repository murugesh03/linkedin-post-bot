// scripts/post-linkedin.mjs
// Generates a daily tech LinkedIn post using Gemini API and publishes via LinkedIn API.

import fetch from 'node-fetch';

// ── Topic rotation by day of week ─────────────────────────────────────────────
const TOPICS = [
  'React hooks, performance optimization, and modern component patterns',  // Sun
  'React architecture, design patterns, and production best practices',    // Mon
  'TypeScript advanced types, generics, and type-safe patterns',           // Tue
  'Frontend system design, scalable architecture, and technical decisions',// Wed
  'AI tools for developers, LLM integrations, and prompt engineering',     // Thu
  'Tech leadership, code review culture, and engineering career growth',   // Fri
  'Node.js patterns, MongoDB optimization, and MERN stack architecture',   // Sat
];

const STYLES = [
  'Educational — teach something valuable with clear structure',
  'Personal story — first-person narrative with a lesson at the end',
  'Numbered tips — exactly 5 actionable tips with a strong hook',
  'Hot take — bold opinion that challenges conventional wisdom in tech',
];

const today = new Date().getDay();
const topic = TOPICS[today];
const style = STYLES[today % STYLES.length];

// ── Step 1: Generate post with Gemini ────────────────────────────────────────
async function generatePost() {
  const prompt = `Write a LinkedIn post about ${topic} for Murugesh Padmanabhan, 
a Technical Lead and Senior Frontend/MERN Stack Developer at HCL Tech, Chennai. 
6+ years of experience in ReactJS, TypeScript, Node.js, MongoDB, Redux, React Native.

Style: ${style}

Requirements:
- 150 to 250 words
- Start with a strong hook — NOT starting with "I" or "Have you ever"
- First person, authentic developer voice — not corporate
- 2 to 4 emojis placed naturally
- Specific enough to impress senior engineers, accessible to general tech audience  
- 3 to 5 relevant hashtags at the very end
- End with a question or CTA to drive comments

Output ONLY the post text. No preamble, no quotes around the output.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text.trim();
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
      author: 'urn:li:person:' + process.env.LINKEDIN_PERSON_URN,
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

  const result = await res.json();
  return result.id;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('Generating post for topic:', topic);
const postText = await generatePost();
console.log('\nGenerated post:\n' + postText);

console.log('\nPublishing to LinkedIn...');
const postId = await postToLinkedIn(postText);
console.log('✅ Posted successfully! Post ID:', postId);