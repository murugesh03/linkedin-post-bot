// scripts/post-linkedin.mjs
// Generates a daily tech LinkedIn post using Claude API and publishes it via LinkedIn API.
// Run via GitHub Actions or manually: node scripts/post-linkedin.mjs

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

const AUTHOR_CONTEXT = `
Murugesh Padmanabhan, Technical Lead and Senior Frontend/MERN Stack Developer at HCL Tech, Chennai.
6+ years of experience in ReactJS, TypeScript, Node.js, Express, MongoDB, Redux, and React Native.
Career transitioned into tech driven by passion for the field.
`;

// ── Step 1: Generate post with Claude ────────────────────────────────────────
async function generatePost() {
  const topic = TOPICS[new Date().getDay()];

  const prompt = `Write a LinkedIn post about ${topic} for the following developer:

${AUTHOR_CONTEXT}

Requirements:
- 150 to 250 words
- Start with a strong hook — NOT starting with "I" or generic phrases like "Have you ever"
- First person, authentic developer voice — not corporate or formal
- 2 to 4 emojis placed naturally within the text
- Specific enough to impress senior engineers, accessible to a general tech audience
- 3 to 5 relevant hashtags at the very end
- End with a question or clear CTA to drive engagement and comments

Output ONLY the post text. No preamble, no quotes around the output.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content[0].text.trim();
}

// ── Step 2: Publish to LinkedIn ───────────────────────────────────────────────
async function postToLinkedIn(text) {
  const body = {
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
  };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.LINKEDIN_ACCESS_TOKEN,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn API error ${res.status}: ${err}`);
  }

  const result = await res.json();
  return result.id;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('Generating post for topic:', TOPICS[new Date().getDay()]);
const postText = await generatePost();
console.log('\nGenerated post:\n' + postText);

console.log('\nPublishing to LinkedIn...');
const postId = await postToLinkedIn(postText);
console.log('✅ Posted successfully! Post ID:', postId);