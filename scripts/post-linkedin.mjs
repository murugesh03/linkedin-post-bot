// scripts/post-linkedin.mjs
// 500+ topics — auto-rotating forever
// v5: LLM invents a unique post format each day — no fixed templates, always fresh

import fetch from 'node-fetch';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const MAX_RETRIES = 4;

const ALL_TOPICS = [
  // ── YOUR CORE SKILLS (90 topics) ─────────────────────────────────────────
  { skill:'React', topic:'useState vs useReducer — when to use which' },
  { skill:'React', topic:'useEffect cleanup — why most developers skip it' },
  { skill:'React', topic:'React.memo — stop unnecessary re-renders' },
  { skill:'React', topic:'useCallback — the right way to memoize functions' },
  { skill:'React', topic:'useMemo — when it helps and when it hurts' },
  { skill:'React', topic:'Custom hooks — extract and reuse logic cleanly' },
  { skill:'React', topic:'Context API — avoid prop drilling the right way' },
  { skill:'React', topic:'React lazy and Suspense — code splitting made simple' },
  { skill:'React', topic:'Error boundaries — catch errors without crashing' },
  { skill:'React', topic:'useRef — more than just DOM access' },
  { skill:'React', topic:'React portals — render outside the component tree' },
  { skill:'React', topic:'Compound components pattern — flexible design' },
  { skill:'React', topic:'React keys — why the wrong key breaks your list' },
  { skill:'React', topic:'Controlled vs uncontrolled components' },
  { skill:'React', topic:'React 19 new features — what changed' },
  { skill:'TypeScript', topic:'Generics — write reusable type-safe code' },
  { skill:'TypeScript', topic:'Union and intersection types — combining smartly' },
  { skill:'TypeScript', topic:'Type guards — narrow types at runtime safely' },
  { skill:'TypeScript', topic:'Utility types: Partial, Pick, Omit, Record' },
  { skill:'TypeScript', topic:'Mapped types — transform object types dynamically' },
  { skill:'TypeScript', topic:'Conditional types — logic you did not know existed' },
  { skill:'TypeScript', topic:'Discriminated unions — handle complex state' },
  { skill:'TypeScript', topic:'Strict mode — why you should always enable it' },
  { skill:'TypeScript', topic:'TypeScript with React — typing props and hooks' },
  { skill:'TypeScript', topic:'Decorators — understand them once and for all' },
  { skill:'JavaScript', topic:'Closures — explained with real examples' },
  { skill:'JavaScript', topic:'Event loop — how JS handles async under the hood' },
  { skill:'JavaScript', topic:'Promises vs async/await — stop using them wrong' },
  { skill:'JavaScript', topic:'Array methods: map, filter, reduce mastered' },
  { skill:'JavaScript', topic:'Destructuring and spread — write cleaner JS' },
  { skill:'JavaScript', topic:'ES2024 features every developer must know' },
  { skill:'JavaScript', topic:'Modules: ESM vs CommonJS explained' },
  { skill:'JavaScript', topic:'Optional chaining and nullish coalescing' },
  { skill:'Node.js', topic:'Streams — handle large data without memory issues' },
  { skill:'Node.js', topic:'Express middleware — write your own' },
  { skill:'Node.js', topic:'Clustering — use all CPU cores effectively' },
  { skill:'Node.js', topic:'Error handling in Express — the right pattern' },
  { skill:'Node.js', topic:'Environment variables — manage config correctly' },
  { skill:'Node.js', topic:'Rate limiting — protect your API from abuse' },
  { skill:'Node.js', topic:'Performance profiling — find and fix bottlenecks' },
  { skill:'Node.js', topic:'JWT authentication — implement it securely' },
  { skill:'MongoDB', topic:'Aggregation pipeline — transform data like a pro' },
  { skill:'MongoDB', topic:'Indexing — speed up queries by 10x' },
  { skill:'MongoDB', topic:'Schema design — embed vs reference explained' },
  { skill:'MongoDB', topic:'Transactions — ACID compliance in NoSQL' },
  { skill:'MongoDB', topic:'Mongoose virtuals and middleware' },
  { skill:'Redux', topic:'createSlice — simplify Redux in 10 minutes' },
  { skill:'Redux', topic:'RTK Query — forget Axios and useEffect for fetching' },
  { skill:'Redux', topic:'Middleware — thunk vs saga explained simply' },
  { skill:'Redux', topic:'DevTools — debug state like a senior developer' },
  { skill:'Redux', topic:'Redux vs Zustand — which one to use in 2025' },
  { skill:'Next.js', topic:'App Router vs Pages Router — key differences' },
  { skill:'Next.js', topic:'Server components — what changes for you' },
  { skill:'Next.js', topic:'Data fetching: SSR, SSG, ISR explained simply' },
  { skill:'Next.js', topic:'Image and Font optimization — boost your scores' },
  { skill:'Next.js', topic:'Middleware — protect routes and redirect users' },
  { skill:'React Native', topic:'FlatList — render large lists without lag' },
  { skill:'React Native', topic:'Navigation — stack, tab, drawer explained' },
  { skill:'React Native', topic:'Performance — stop the jank once and for all' },
  { skill:'React Native', topic:'Reanimated — smooth animations made easy' },
  { skill:'React Native', topic:'Sharing code between React and React Native' },
  { skill:'Docker', topic:'Containers explained in 5 minutes' },
  { skill:'Docker', topic:'Compose — run your full stack with one command' },
  { skill:'Docker', topic:'Multi-stage builds — shrink your image size' },
  { skill:'Docker', topic:'Dockerizing a Node.js app — step by step' },
  { skill:'CSS', topic:'Grid vs Flexbox — when to use which layout' },
  { skill:'CSS', topic:'Custom properties — variables that work everywhere' },
  { skill:'CSS', topic:'CSS animations vs JS animations — performance' },
  { skill:'CSS', topic:'Tailwind CSS — build faster without leaving HTML' },
  { skill:'Testing', topic:'React Testing Library — test what users see' },
  { skill:'Testing', topic:'Jest mocking — mock APIs, modules, timers' },
  { skill:'Testing', topic:'Unit vs integration vs E2E — what to write when' },
  { skill:'Testing', topic:'Test coverage — what 80% means and what it does not' },
  { skill:'Git', topic:'Rebase vs merge — stop the confusion' },
  { skill:'Git', topic:'GitHub Actions — automate your workflow' },
  { skill:'Git', topic:'Git hooks — run checks before every commit' },
  { skill:'Web Performance', topic:'Core Web Vitals — LCP, FID, CLS for devs' },
  { skill:'Web Performance', topic:'Code splitting — load only what users need' },
  { skill:'Web Performance', topic:'Image optimization — WebP, lazy loading, CDN' },
  { skill:'Web Performance', topic:'Browser caching — speed up for returning users' },
  { skill:'System Design', topic:'Frontend system design — scalability day one' },
  { skill:'System Design', topic:'Micro-frontends — split your app the right way' },
  { skill:'System Design', topic:'API design — REST principles every dev must know' },
  { skill:'System Design', topic:'CDN and caching — the fastest optimization' },
  { skill:'AWS', topic:'S3 and CloudFront — host frontend for almost free' },
  { skill:'AWS', topic:'Lambda — run backend code without managing servers' },
  { skill:'AWS', topic:'AWS for frontend developers — where to start' },
  { skill:'AI Tools', topic:'AI coding tools in 2025 — which save time' },
  { skill:'AI Tools', topic:'Integrating ChatGPT API into React — step by step' },
  { skill:'AI Tools', topic:'Prompt engineering — get better code from AI' },

  // ── PYTHON (20 topics) ───────────────────────────────────────────────────
  { skill:'Python', topic:'Decorators — write reusable function wrappers' },
  { skill:'Python', topic:'Generators and yield — memory-efficient iteration' },
  { skill:'Python', topic:'Async/await in Python — asyncio explained clearly' },
  { skill:'Python', topic:'List comprehensions vs map/filter — which to use' },
  { skill:'Python', topic:'Context managers — the with statement explained' },
  { skill:'Python', topic:'Dataclasses — cleaner classes in Python 3.7+' },
  { skill:'Python', topic:'Type hints — make Python code self-documenting' },
  { skill:'Python', topic:'Python GIL — why it exists and what it means' },
  { skill:'Python', topic:'Virtual environments — manage dependencies right' },
  { skill:'Python', topic:'Python OOP — dunder methods and class patterns' },
  { skill:'Python', topic:'Exception handling — try/except done correctly' },
  { skill:'Python', topic:'Itertools — the hidden productivity library' },
  { skill:'Python', topic:'Python performance — profiling and optimisation' },
  { skill:'Python', topic:'Pathlib — modern file path handling in Python' },
  { skill:'Python', topic:'F-strings — everything you can do with them' },
  { skill:'Python', topic:'Abstract base classes — enforce interfaces in Python' },
  { skill:'Python', topic:'Functools — partial, lru_cache, reduce explained' },
  { skill:'Python', topic:'Pydantic — data validation the Python way' },
  { skill:'Python', topic:'FastAPI — build APIs faster than Flask or Django' },
  { skill:'Python', topic:'Python packaging — pip, poetry, and publishing' },

  // ── JAVA (15 topics) ─────────────────────────────────────────────────────
  { skill:'Java', topic:'JVM internals — how Java actually runs your code' },
  { skill:'Java', topic:'Generics — type-safe code without casting' },
  { skill:'Java', topic:'Streams API — functional programming in Java' },
  { skill:'Java', topic:'CompletableFuture — async programming in Java' },
  { skill:'Java', topic:'Spring Boot — REST APIs in under 10 minutes' },
  { skill:'Java', topic:'Garbage collection — understand GC algorithms' },
  { skill:'Java', topic:'Design patterns — GoF patterns in Java with examples' },
  { skill:'Java', topic:'Lambda expressions and functional interfaces' },
  { skill:'Java', topic:'Optional — eliminate NullPointerException' },
  { skill:'Java', topic:'Collections framework — when to use which' },
  { skill:'Java', topic:'Concurrency — synchronized, volatile, atomic' },
  { skill:'Java', topic:'Record types — immutable data classes in Java 16+' },
  { skill:'Java', topic:'Sealed classes — restrict type hierarchies cleanly' },
  { skill:'Java', topic:'Pattern matching — instanceof without casting' },
  { skill:'Java', topic:'Java memory model — heap, stack, metaspace' },

  // ── C++ (10 topics) ──────────────────────────────────────────────────────
  { skill:'C++', topic:'Pointers vs references — when to use each' },
  { skill:'C++', topic:'RAII pattern — resource management the C++ way' },
  { skill:'C++', topic:'Smart pointers — unique_ptr, shared_ptr, weak_ptr' },
  { skill:'C++', topic:'Move semantics — avoid unnecessary copies' },
  { skill:'C++', topic:'Templates — generic programming in C++' },
  { skill:'C++', topic:'STL containers — vector, map, set, unordered_map' },
  { skill:'C++', topic:'Virtual functions and polymorphism in C++' },
  { skill:'C++', topic:'Modern C++20 features — concepts, ranges, coroutines' },
  { skill:'C++', topic:'Multithreading — std::thread, mutex, condition_variable' },
  { skill:'C++', topic:'C++ vs Rust — memory safety tradeoffs' },

  // ── GO (10 topics) ───────────────────────────────────────────────────────
  { skill:'Go', topic:'Goroutines — concurrency without threads' },
  { skill:'Go', topic:'Channels — communicate between goroutines safely' },
  { skill:'Go', topic:'Interfaces — implicit implementation in Go' },
  { skill:'Go', topic:'Defer, panic, recover — Go error handling pattern' },
  { skill:'Go', topic:'Go modules — dependency management explained' },
  { skill:'Go', topic:'Error handling in Go — why it works this way' },
  { skill:'Go', topic:'Slices vs arrays — the difference that matters' },
  { skill:'Go', topic:'Go concurrency patterns — worker pools, pipelines' },
  { skill:'Go', topic:'Context package — timeouts and cancellation' },
  { skill:'Go', topic:'Testing in Go — table-driven tests explained' },

  // ── RUST (10 topics) ─────────────────────────────────────────────────────
  { skill:'Rust', topic:'Ownership model — what makes Rust memory-safe' },
  { skill:'Rust', topic:'Borrowing and lifetimes — explained simply' },
  { skill:'Rust', topic:'Enums and pattern matching — exhaustive handling' },
  { skill:'Rust', topic:'Traits — Rust interfaces explained' },
  { skill:'Rust', topic:'Error handling — Result and Option types' },
  { skill:'Rust', topic:'Async Rust — tokio and futures explained' },
  { skill:'Rust', topic:'Cargo ecosystem — packages, workspaces, features' },
  { skill:'Rust', topic:'Zero-cost abstractions — performance with safety' },
  { skill:'Rust', topic:'Rust vs C++ — why developers switch' },
  { skill:'Rust', topic:'WebAssembly with Rust — running Rust in the browser' },

  // ── KOTLIN (8 topics) ────────────────────────────────────────────────────
  { skill:'Kotlin', topic:'Coroutines — async without callbacks' },
  { skill:'Kotlin', topic:'Extension functions — add methods to any class' },
  { skill:'Kotlin', topic:'Data classes — equals, hashCode, copy for free' },
  { skill:'Kotlin', topic:'Sealed classes — exhaustive when expressions' },
  { skill:'Kotlin', topic:'Null safety — Kotlin vs Java null handling' },
  { skill:'Kotlin', topic:'Scope functions — let, run, with, apply, also' },
  { skill:'Kotlin', topic:'Kotlin Flow — reactive streams explained' },
  { skill:'Kotlin', topic:'Android with Kotlin — Jetpack Compose basics' },

  // ── DATA STRUCTURES (12 topics) ──────────────────────────────────────────
  { skill:'Data Structures', topic:'Arrays vs linked lists — time complexity comparison' },
  { skill:'Data Structures', topic:'Hash tables — collision handling strategies' },
  { skill:'Data Structures', topic:'Binary search trees — insert, search, delete' },
  { skill:'Data Structures', topic:'AVL trees — self-balancing explained visually' },
  { skill:'Data Structures', topic:'Heaps — priority queues and heap sort' },
  { skill:'Data Structures', topic:'Graphs — adjacency list vs matrix tradeoffs' },
  { skill:'Data Structures', topic:'Tries — autocomplete and prefix search' },
  { skill:'Data Structures', topic:'Stacks and queues — when to use each' },
  { skill:'Data Structures', topic:'Segment trees — range queries explained' },
  { skill:'Data Structures', topic:'Union-Find — detect cycles and connected components' },
  { skill:'Data Structures', topic:'B-trees — why databases use them for indexing' },
  { skill:'Data Structures', topic:'Skip lists — probabilistic data structures' },

  // ── ALGORITHMS (12 topics) ───────────────────────────────────────────────
  { skill:'Algorithms', topic:'Big O notation — time and space complexity explained' },
  { skill:'Algorithms', topic:'Quicksort vs mergesort — when to use which' },
  { skill:'Algorithms', topic:'Binary search — patterns beyond sorted arrays' },
  { skill:'Algorithms', topic:'BFS vs DFS — choosing the right traversal' },
  { skill:'Algorithms', topic:'Dynamic programming — identify and solve DP problems' },
  { skill:'Algorithms', topic:'Greedy algorithms — when they work and when they do not' },
  { skill:'Algorithms', topic:'Backtracking — solve constraint satisfaction problems' },
  { skill:'Algorithms', topic:'Two pointers — solve array problems in O(n)' },
  { skill:'Algorithms', topic:'Sliding window — substring and subarray problems' },
  { skill:'Algorithms', topic:'Dijkstra shortest path — step by step explained' },
  { skill:'Algorithms', topic:'String matching — KMP algorithm explained' },
  { skill:'Algorithms', topic:'Divide and conquer — the paradigm behind many algorithms' },

  // ── OPERATING SYSTEMS (10 topics) ────────────────────────────────────────
  { skill:'Operating Systems', topic:'Processes vs threads — the real difference' },
  { skill:'Operating Systems', topic:'CPU scheduling — FIFO, round robin, priority queues' },
  { skill:'Operating Systems', topic:'Virtual memory and paging — how it works' },
  { skill:'Operating Systems', topic:'Deadlocks — detection, prevention, avoidance' },
  { skill:'Operating Systems', topic:'Semaphores vs mutexes — concurrency primitives' },
  { skill:'Operating Systems', topic:'File systems — inodes, blocks, directories' },
  { skill:'Operating Systems', topic:'System calls — how programs talk to the OS' },
  { skill:'Operating Systems', topic:'Memory management — heap, stack, and fragmentation' },
  { skill:'Operating Systems', topic:'Inter-process communication — pipes, sockets, shared memory' },
  { skill:'Operating Systems', topic:'Linux internals every developer should know' },

  // ── COMPUTER NETWORKS (10 topics) ────────────────────────────────────────
  { skill:'Networks', topic:'TCP vs UDP — when to use which protocol' },
  { skill:'Networks', topic:'HTTP/1.1 vs HTTP/2 vs HTTP/3 — what changed' },
  { skill:'Networks', topic:'DNS resolution — step by step from URL to IP' },
  { skill:'Networks', topic:'TCP three-way handshake — connection setup explained' },
  { skill:'Networks', topic:'WebSockets vs long polling vs SSE' },
  { skill:'Networks', topic:'TLS and HTTPS — how encryption actually works' },
  { skill:'Networks', topic:'Load balancing algorithms — round robin, least connections' },
  { skill:'Networks', topic:'CDN and reverse proxies — how they work' },
  { skill:'Networks', topic:'REST API design principles — every dev must know' },
  { skill:'Networks', topic:'gRPC vs REST vs GraphQL — tradeoffs explained' },

  // ── AI & MACHINE LEARNING (70 topics) ────────────────────────────────────
  { skill:'ML', topic:'Supervised vs unsupervised vs reinforcement learning' },
  { skill:'ML', topic:'Linear regression from scratch — the math made simple' },
  { skill:'ML', topic:'Logistic regression — classification explained' },
  { skill:'ML', topic:'Decision trees — splits, gini, information gain' },
  { skill:'ML', topic:'Random forests — ensemble learning explained' },
  { skill:'ML', topic:'Support vector machines — the intuition behind SVMs' },
  { skill:'ML', topic:'K-means clustering — the algorithm explained visually' },
  { skill:'ML', topic:'Principal component analysis — dimensionality reduction' },
  { skill:'ML', topic:'Bias-variance tradeoff — the fundamental ML challenge' },
  { skill:'ML', topic:'Cross-validation — evaluate models correctly' },
  { skill:'ML', topic:'Feature engineering — the skill that matters most' },
  { skill:'ML', topic:'Overfitting — causes, detection, and prevention' },
  { skill:'ML', topic:'Gradient descent — how models actually learn' },
  { skill:'ML', topic:'Regularisation — L1 vs L2 explained simply' },
  { skill:'ML', topic:'Naive Bayes — when simple beats complex' },
  { skill:'Deep Learning', topic:'Neural networks — forward pass explained' },
  { skill:'Deep Learning', topic:'Backpropagation — how neural networks learn' },
  { skill:'Deep Learning', topic:'Convolutional neural networks — image recognition' },
  { skill:'Deep Learning', topic:'Recurrent neural networks and vanishing gradients' },
  { skill:'Deep Learning', topic:'LSTM and GRU — solving long-term dependencies' },
  { skill:'Deep Learning', topic:'Attention mechanism — the idea behind transformers' },
  { skill:'Deep Learning', topic:'Transformer architecture — self-attention explained' },
  { skill:'Deep Learning', topic:'Batch normalisation — why it helps training' },
  { skill:'Deep Learning', topic:'Dropout — regularisation for neural networks' },
  { skill:'Deep Learning', topic:'Adam vs SGD — optimiser tradeoffs' },
  { skill:'Deep Learning', topic:'Transfer learning — fine-tune pre-trained models' },
  { skill:'Deep Learning', topic:'GANs — how generative adversarial networks work' },
  { skill:'LLMs', topic:'How transformers work — explained without the math' },
  { skill:'LLMs', topic:'Tokenisation and embeddings — words to numbers' },
  { skill:'LLMs', topic:'Prompt engineering — patterns that actually work' },
  { skill:'LLMs', topic:'Retrieval Augmented Generation — RAG explained' },
  { skill:'LLMs', topic:'Fine-tuning vs few-shot learning — when to use each' },
  { skill:'LLMs', topic:'LoRA — fine-tune large models on consumer hardware' },
  { skill:'LLMs', topic:'Hallucination — causes and mitigation strategies' },
  { skill:'LLMs', topic:'LangChain — building LLM applications step by step' },
  { skill:'LLMs', topic:'Vector databases — Pinecone, Weaviate, Chroma compared' },
  { skill:'LLMs', topic:'Building AI apps with Claude, OpenAI, Gemini APIs' },
  { skill:'NLP', topic:'Text preprocessing pipeline — clean data for NLP' },
  { skill:'NLP', topic:'Word embeddings — Word2Vec and GloVe explained' },
  { skill:'NLP', topic:'BERT — bidirectional transformers explained' },
  { skill:'NLP', topic:'Named entity recognition — extracting information from text' },
  { skill:'NLP', topic:'Sentiment analysis — approaches and tradeoffs' },
  { skill:'NLP', topic:'Text summarisation — extractive vs abstractive' },
  { skill:'NLP', topic:'Semantic search — find meaning not just keywords' },
  { skill:'Computer Vision', topic:'Image preprocessing with OpenCV — practical guide' },
  { skill:'Computer Vision', topic:'Object detection — YOLO explained simply' },
  { skill:'Computer Vision', topic:'Image segmentation — semantic vs instance' },
  { skill:'Computer Vision', topic:'Transfer learning for vision — ResNet, EfficientNet' },
  { skill:'Computer Vision', topic:'Data augmentation — prevent overfitting in vision' },
  { skill:'Computer Vision', topic:'Real-time inference — optimise models for production' },
  { skill:'MLOps', topic:'Experiment tracking with MLflow — practical guide' },
  { skill:'MLOps', topic:'Model versioning and registry — manage models at scale' },
  { skill:'MLOps', topic:'Feature stores — share features across teams' },
  { skill:'MLOps', topic:'Model monitoring and drift detection in production' },
  { skill:'MLOps', topic:'CI/CD for ML pipelines — automate training and deployment' },
  { skill:'MLOps', topic:'Containerising ML models with Docker and FastAPI' },
  { skill:'Data Science', topic:'NumPy — the foundation of scientific Python' },
  { skill:'Data Science', topic:'Pandas — data manipulation and analysis' },
  { skill:'Data Science', topic:'Matplotlib and Seaborn — data visualisation' },
  { skill:'Data Science', topic:'Exploratory data analysis — the first step always' },
  { skill:'Data Science', topic:'Statistics for data science — what you actually need' },
  { skill:'Data Science', topic:'A/B testing — design and analyse experiments' },

  // ── CLOUD & DEVOPS (10 topics) ───────────────────────────────────────────
  { skill:'Cloud', topic:'AWS EC2 vs Lambda — when to use each' },
  { skill:'Cloud', topic:'AWS RDS vs DynamoDB — choosing the right database' },
  { skill:'Cloud', topic:'GCP for developers — BigQuery, Cloud Run, Firebase' },
  { skill:'Cloud', topic:'Azure DevOps — pipelines, boards, artifacts' },
  { skill:'Cloud', topic:'Kubernetes — containers at scale explained simply' },
  { skill:'Cloud', topic:'Terraform — infrastructure as code practical guide' },
  { skill:'Cloud', topic:'CI/CD pipeline design — from commit to production' },
  { skill:'Cloud', topic:'Monitoring with Prometheus and Grafana' },
  { skill:'Cloud', topic:'ELK stack — logs, search, and visualisation' },
  { skill:'Cloud', topic:'Serverless architecture — when it works and when it does not' },

  // ── DATABASES (15 topics) ────────────────────────────────────────────────
  { skill:'Databases', topic:'SQL joins — INNER, LEFT, RIGHT, FULL explained' },
  { skill:'Databases', topic:'Query optimisation — read the EXPLAIN output' },
  { skill:'Databases', topic:'Database indexing — B-tree, hash, composite indexes' },
  { skill:'Databases', topic:'ACID properties — transactions explained clearly' },
  { skill:'Databases', topic:'Database normalisation — 1NF through 3NF' },
  { skill:'Databases', topic:'PostgreSQL vs MySQL — choose for your use case' },
  { skill:'Databases', topic:'NoSQL data modelling — document vs key-value' },
  { skill:'Databases', topic:'Redis — data structures and use cases' },
  { skill:'Databases', topic:'Database sharding — horizontal scaling explained' },
  { skill:'Databases', topic:'Connection pooling — why it matters in production' },
  { skill:'Databases', topic:'Cassandra — wide-column store explained' },
  { skill:'Databases', topic:'GraphQL and graph databases — Neo4j basics' },
  { skill:'Databases', topic:'Time series databases — InfluxDB and TimescaleDB' },
  { skill:'Databases', topic:'Database migration strategies — zero downtime' },
  { skill:'Databases', topic:'Replication — master-slave vs multi-master' },

  // ── SECURITY (15 topics) ─────────────────────────────────────────────────
  { skill:'Security', topic:'OWASP Top 10 — the most critical web vulnerabilities' },
  { skill:'Security', topic:'SQL injection — how it works and how to prevent it' },
  { skill:'Security', topic:'XSS — cross-site scripting attacks explained' },
  { skill:'Security', topic:'CSRF — cross-site request forgery prevention' },
  { skill:'Security', topic:'HTTPS and TLS — certificates and handshakes' },
  { skill:'Security', topic:'OAuth 2.0 — the authorisation protocol explained' },
  { skill:'Security', topic:'JWT security — common mistakes and best practices' },
  { skill:'Security', topic:'Password hashing — bcrypt, argon2, scrypt compared' },
  { skill:'Security', topic:'Rate limiting — protect APIs from abuse and DDoS' },
  { skill:'Security', topic:'Content Security Policy — prevent XSS at the header level' },
  { skill:'Security', topic:'Dependency security — audit and fix vulnerable packages' },
  { skill:'Security', topic:'Secrets management — never hardcode credentials' },
  { skill:'Security', topic:'Penetration testing basics — think like an attacker' },
  { skill:'Security', topic:'Zero trust architecture — never trust, always verify' },
  { skill:'Security', topic:'API security best practices — beyond authentication' },

  // ── MOBILE (10 topics) ───────────────────────────────────────────────────
  { skill:'Mobile', topic:'iOS vs Android — choosing a cross-platform approach' },
  { skill:'Mobile', topic:'Flutter — Dart and widgets explained for web devs' },
  { skill:'Mobile', topic:'SwiftUI basics — declarative iOS development' },
  { skill:'Mobile', topic:'Android Jetpack Compose — modern Android UI' },
  { skill:'Mobile', topic:'Mobile performance — memory, battery, and rendering' },
  { skill:'Mobile', topic:'App Store and Play Store — submission and review' },
  { skill:'Mobile', topic:'Push notifications — FCM and APNs explained' },
  { skill:'Mobile', topic:'Offline-first apps — sync strategies that work' },
  { skill:'Mobile', topic:'Deep links and universal links — mobile navigation' },
  { skill:'Mobile', topic:'Mobile security — certificate pinning, biometrics' },

  // ── INTERVIEW PREP (15 topics) ───────────────────────────────────────────
  { skill:'Interview Prep', topic:'How to approach any coding problem — UMPIRE method' },
  { skill:'Interview Prep', topic:'System design interview — a repeatable framework' },
  { skill:'Interview Prep', topic:'Behavioural interviews — STAR method with examples' },
  { skill:'Interview Prep', topic:'Time complexity — how to analyse any algorithm' },
  { skill:'Interview Prep', topic:'Top 10 most common array interview problems' },
  { skill:'Interview Prep', topic:'Tree interview problems — 5 patterns to know' },
  { skill:'Interview Prep', topic:'Graph problems — BFS/DFS interview patterns' },
  { skill:'Interview Prep', topic:'String manipulation — interview patterns explained' },
  { skill:'Interview Prep', topic:'Dynamic programming — how to identify DP problems' },
  { skill:'Interview Prep', topic:'Database interview questions — SQL and design' },
  { skill:'Interview Prep', topic:'Resume that gets interviews — technical roles' },
  { skill:'Interview Prep', topic:'Negotiating your developer salary — tactics that work' },
  { skill:'Interview Prep', topic:'Remote developer interview — what is different' },
  { skill:'Interview Prep', topic:'Senior engineer interviews — what they actually test' },
  { skill:'Interview Prep', topic:'Open source contribution — stand out as a candidate' },
];

const NEWS_KEYWORDS = [
  'React JavaScript frontend 2025 latest release',
  'Python AI machine learning 2025 update',
  'AI LLM developer tools GitHub 2025',
  'web performance browser Chrome V8 2025',
  'cloud AWS Azure GCP developer news 2025',
  'open source trending GitHub security 2025',
  'mobile iOS Android React Native Flutter 2025',
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
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

async function groq(prompt, temperature = 0.85) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: 1500,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0].message.content.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 0: Generate a unique post format for today
//
// The LLM invents a completely original structure — hook style, body organisation,
// section labels, emoji use, closing style — suited to the specific topic.
// This runs once per execution and the resulting blueprint drives generation.
// ─────────────────────────────────────────────────────────────────────────────
async function generatePostFormat(postType, topicOrKeyword) {
  const today = new Date().toISOString().split('T')[0];

  const context = postType === 'skill'
    ? `Topic: "${topicOrKeyword.topic}" (skill: ${topicOrKeyword.skill})`
    : `News keyword: "${topicOrKeyword}"`;

  const raw = await groq(`You are a LinkedIn content strategist specialising in developer audiences.

Today is ${today}.
${context}

Design a UNIQUE and ORIGINAL LinkedIn post format for this topic.

Rules for a good format:
- The structure must suit the specific topic — a debugging topic deserves a different structure than a conceptual one
- Must feel natural for LinkedIn — scannable, with clear visual rhythm
- Hook style must vary: it can be a question, a bold statement, a counter-intuitive fact, a personal anecdote opener, a numbered promise, a comparison, a confession, or something else entirely
- Body can use any structure: numbered steps, contrasting pairs, a single concept unpacked progressively, a timeline, a checklist, a Q&A, a narrative arc, a ranked list, a myth-bust, a before/after, labelled sections, or a completely original layout
- Section labels and emoji style should be chosen deliberately — not just defaulting to ⚡💡🔥✅🎯
- Closing should vary: a takeaway rule, a challenge to the reader, a prediction, a personal commitment, or a reflection — not always the same pattern
- The format must be COMPLETLEY DIFFERENT from these overused templates:
  * Generic emoji bullets with vague labels
  * "Here is what nobody tells you" openings
  * Identical 5-point lists with identical emoji every time

Output ONLY a concise format blueprint — plain text instructions the writer will follow.
No preamble, no commentary, no example post. Just the structural blueprint.
Keep it under 300 words. Be specific about section names, emoji choices, and the hook style to use today.`, 0.95);

  return raw.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Fetch live news context from DuckDuckGo
// ─────────────────────────────────────────────────────────────────────────────
async function fetchNewsContext(keyword) {
  try {
    const query = encodeURIComponent(keyword);
    const url = `https://api.duckduckgo.com/?q=${query}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LinkedInBot/1.0)' },
    });
    if (!res.ok) throw new Error(`DDG responded ${res.status}`);
    const data = await res.json();
    const snippets = [];
    if (data.Abstract?.length > 20) snippets.push(`SUMMARY: ${data.Abstract}`);
    (data.RelatedTopics || []).filter(t => t.Text?.length > 10).slice(0, 5)
      .forEach(t => snippets.push(`RELATED: ${t.Text}`));
    (data.Results || []).filter(r => r.Text).slice(0, 3)
      .forEach(r => snippets.push(`RESULT: ${r.Text}`));
    return snippets.length ? snippets.join('\n') : null;
  } catch (err) {
    console.warn(`⚠️  News context fetch failed: ${err.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Fact-check pass
// ─────────────────────────────────────────────────────────────────────────────
async function factCheckPost(postText, context = '') {
  const today = new Date().toISOString().split('T')[0];
  const contextSection = context
    ? `VERIFIED REAL-WORLD CONTEXT (from live search):\n${context}\n\n`
    : 'NOTE: No live context available.\n\n';

  const raw = await groq(`You are a senior technical fact-checker. Today is ${today}.

${contextSection}DRAFT POST:
"""
${postText}
"""

Check every version number, release date, and "latest/newest/just released" claim in the post.
Common errors: calling an old version "the latest", wrong release year, wrong version numbers.

If all facts are correct → respond with exactly: PASS
If issues found → respond with this JSON only (no markdown, no backticks):
{
  "issues": ["describe issue 1", "describe issue 2"],
  "revisedPost": "the complete corrected post text"
}

Output ONLY "PASS" or the JSON. Nothing else.`, 0.1);

  if (raw.trim() === 'PASS') return { pass: true, issues: [], revisedPost: null };

  try {
    const parsed = JSON.parse(raw);
    return { pass: false, issues: parsed.issues || [], revisedPost: parsed.revisedPost || null };
  } catch {
    return { pass: false, issues: ['Fact-checker returned unexpected format — flagging for safety.'], revisedPost: null };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATORS — format blueprint injected into every generation call
// ─────────────────────────────────────────────────────────────────────────────
async function generateSkillPost(t, formatBlueprint, attempt = 1) {
  const varietyHint = attempt > 1
    ? `NOTE: This is attempt ${attempt}. Keep the format blueprint below but write completely different content, hook, and examples.`
    : '';

  return cleanPost(await groq(`You are Murugesh Padmanabhan — Technical Lead and Senior Full-Stack Developer at HCL Tech, Chennai. Expert in ${t.skill}.
${varietyHint}

Write a detailed LinkedIn post about: "${t.topic}"

FOLLOW THIS FORMAT EXACTLY:
${formatBlueprint}

CONTENT RULES:
- Name real methods, APIs, tools, and config options in every section
- Write from personal experience: "I", "we", "our team", "in production"
- No buzzwords: no "leverage", "paradigm", "synergy", "utilize"
- VERSION ACCURACY: Only state a specific version number if 100% certain. Use feature names over version numbers when uncertain. Never say "latest" without verified proof
- 280-380 words total
- Output ONLY the post. No preamble, no labels, no extra text.`));
}

async function generateNewsPost(keyword, newsContext, formatBlueprint, attempt = 1) {
  const today = new Date().toISOString().split('T')[0];
  const varietyHint = attempt > 1
    ? `NOTE: This is attempt ${attempt}. Keep the format blueprint below but use a completely different hook and angle.`
    : '';
  const contextBlock = newsContext
    ? `VERIFIED CURRENT INFO FROM LIVE SEARCH — use ONLY these facts for version/date claims:\n${newsContext}\n\n`
    : `WARNING: No live context available. Do NOT claim specific version numbers, release dates, or say "latest". Speak in general trends only.\n\n`;

  return cleanPost(await groq(`You are Murugesh Padmanabhan — Technical Lead at HCL Tech. Today is ${today}.
${varietyHint}

${contextBlock}Write a detailed opinionated LinkedIn post about the latest 2025 news in: ${keyword}

FOLLOW THIS FORMAT EXACTLY:
${formatBlueprint}

CONTENT RULES:
- All version numbers and dates MUST come from the verified context above only
- If context does not mention a version, describe by feature name only
- Never say "the latest version is X" unless context explicitly confirms it
- Write from personal experience as a senior developer
- 280-380 words total
- Output ONLY the post. No preamble, no labels, no extra text.`));
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE RETRY LOOP
// ─────────────────────────────────────────────────────────────────────────────
async function generateAndVerify(session, topicObj, keyword, newsContext, formatBlueprint) {
  let bestRevised = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`\n✍️  Generating post — attempt ${attempt}/${MAX_RETRIES}...`);

    let draft;
    if (session === 'News') {
      draft = await generateNewsPost(keyword, newsContext, formatBlueprint, attempt);
    } else {
      draft = await generateSkillPost(topicObj, formatBlueprint, attempt);
    }

    console.log('\n─── DRAFT ───\n' + draft + '\n─────────────');
    console.log('\n🔎 Running fact-check...');

    const result = await factCheckPost(draft, newsContext || '');

    if (result.pass) {
      console.log(`✅ Fact-check PASSED on attempt ${attempt} — publishing as-is.`);
      return draft;
    }

    console.log(`⚠️  Attempt ${attempt} FAILED:`);
    result.issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));

    if (result.revisedPost) {
      bestRevised = cleanPost(result.revisedPost);
      console.log('📝 Corrected version saved as backup.');
    }

    if (attempt < MAX_RETRIES) console.log('🔄 Generating a completely new post...\n');
  }

  if (bestRevised) {
    console.log(`\n⚠️  All ${MAX_RETRIES} attempts needed corrections. Using the fact-checker's best revision.`);
    console.log('\n─── FINAL (CORRECTED) ───\n' + bestRevised + '\n─────────────────────────');
    return bestRevised;
  }

  console.log(`\n⚠️  All ${MAX_RETRIES} attempts failed and no clean revision was produced.`);
  console.log('   Posting last raw draft — manually review this post after publishing.');
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// LINKEDIN PUBLISH
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
const keyword = NEWS_KEYWORDS[day];
const label = session === 'News' ? `Tech News — ${keyword}` : `[${topicObj.skill}] ${topicObj.topic}`;

console.log(`\n🚀 ${session} Post — ${label}`);
console.log(`   Index: ${session === 'Morning' ? morningIndex : eveningIndex} / ${ALL_TOPICS.length - 1} | ${now.toISOString()}`);

// Fetch live news context (News session only)
let newsContext = null;
if (session === 'News') {
  console.log('\n🔍 Fetching live news context from DuckDuckGo...');
  newsContext = await fetchNewsContext(keyword);
  console.log(newsContext ? '✅ Live context loaded.\n' : '⚠️  No live context — post will use general framing.\n');
}

// Generate today's unique format blueprint
console.log('\n🎨 Generating today\'s post format...');
const topicOrKeyword = session === 'News' ? keyword : topicObj;
const formatBlueprint = await generatePostFormat(session === 'News' ? 'news' : 'skill', topicOrKeyword);
console.log('\n─── FORMAT BLUEPRINT ───\n' + formatBlueprint + '\n────────────────────────');

// Generate → fact-check → retry until passing (or best-effort)
const finalPost = await generateAndVerify(session, topicObj, keyword, newsContext, formatBlueprint);

if (!finalPost) {
  console.error('\n🚫 Could not produce any post. Exiting without publishing.');
  process.exit(1);
}

// Publish
console.log('\n📤 Publishing to LinkedIn...');
const postId = await postToLinkedIn(finalPost);
console.log(`\n✅ Published! Post ID: ${postId}`);
