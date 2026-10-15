import { media } from "./media";
import type { Project, ProjectStatus } from "./types";

export const projectStatusLabel: Record<ProjectStatus, string> = {
  shipped: "Shipped",
  "in-progress": "In progress",
  early: "Early stage",
  school: "School project",
};

export const projects: Project[] = [
  {
    id: "mneme",
    title: "Mneme",
    tagline: "Documents in, queryable memory out",
    description:
      "Turns PDFs, DOCX, PPTX, Markdown, HTML and OCR'd images into searchable memory: converts with Docling, chunks with heading context, embeds via OpenRouter and stores in Pinecone. One pipeline behind an HTTP API, a CLI and an MCP server for Claude Code. Early scaffold: the Neo4j graph layer, retrieval module and auth are not built yet.",
    status: "early",
    tags: ["AI", "RAG", "Backend"],
    period: "Aug 2026 – Present",
    technologies: ["Python", "FastAPI", "Docling", "OpenRouter", "Pinecone", "Neo4j", "MCP"],
  },
  {
    id: "lumi",
    title: "Project Lumi",
    tagline: "Beauty intelligence platform",
    description:
      "A free, retailer-neutral platform to help people find beauty products that fit their characteristics, routines and the real outcomes of people like them. Related to my work at Kiyoko Beauty.",
    status: "in-progress",
    tags: ["Mobile"],
    technologies: ["React Native", "Supabase"],
  },
  {
    id: "portfolio",
    title: "Portfolio Website",
    tagline: "This site, built from scratch",
    description:
      "My personal site: a quiet editorial design with a left sidebar nav, a dark default and a light toggle, and all content kept in typed data modules. The expressive parts are a scroll-paged Journey page on a three.js particle-terrain globe and a canvas pixel-art pet (cat, dog or bunny) that walks on the page, jumps between elements, plays fetch and talks. The resume is served from a private Supabase bucket through a short-lived signed URL. The pet is also the way in to my AI assistant: visitors ask it about me, and it answers from the site's own data and nothing else.",
    status: "in-progress",
    tags: ["Frontend"],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "three.js", "Supabase"],
    github: "https://github.com/alam389/Portifolio-website",
    image: {
      src: "/projects/portfolio.webp",
      alt: "The About page of the portfolio: the name Anthony Lam with a software engineer headline, resume buttons, a short bio and a Now list.",
      width: 820,
      height: 650,
    },
    story: [
      "This site started as my resume, just a place to put my experience and projects. Somewhere along the way it turned into a passion project. I still treat it like my resume, but I wanted to do cool stuff with it too, so I gave myself some creative liberties.",
      "The stack is Next.js with the App Router, React, TypeScript in strict mode and Tailwind CSS. All the content lives in typed data modules instead of being hardcoded in components, so updating the site mostly means editing data. Photos and my resume live in Supabase, and the resume sits in a private bucket that the server hands out through a short-lived signed link. Tests run on Vitest, and GitHub Actions checks lint, types, tests and the build on every push.",
      "The design is quiet on purpose: a left sidebar, a serif for headings, a grayscale palette, dark by default with a light toggle. That way the fun parts stand out.",
      "The first fun part is the Journey page. It's a three.js globe made of particle terrain, and as you scroll, the camera flies between the places that shaped me, drawing arcs between stops, with photos and stories for each one. All the scroll maths sits in its own tested module, so the 3D components just follow what it says.",
      "The second is the pixel pet. You can pick a cat, a dog or a bunny, and it walks along the page, jumping between elements like they're platforms. You can pick it up and throw it, play fetch, feed it treats, and it talks in little speech bubbles. I wrote my own physics for it, and the sprites are 16 by 16 pixel art I authored as text, one file per animal.",
      "Beyond that there's an Interests section for the papers, books and podcasts I'm into, plus food and staying active, and a custom 404 that drops you on Null Island. It's still in progress, and I keep adding to it whenever I have an idea I want to try.",
    ],
    // The AI assistant's pipeline and decisions. Every line restates docs/ai-assistant.md
    // or the code in src/lib/assistant, src/components/assistant and src/app/api/chat.
    architecture: {
      title: "My AI assistant: how a question becomes an answer",
      summary:
        "A chat on this site where visitors ask my assistant about me. It knows only what the site says, and answers from that alone. The pixel pet is the way in.",
      assistant: true,
      steps: [
        {
          id: "invite",
          label: "Pet invites",
          detail: "On hover, pat, return",
          why: "The pet notices the visitor and stops to invite them to ask about Anthony, then relays the answers in a speech bubble anchored to it. Hovering it always works; the other invites back off each time one is ignored and stop once the chat has been used. With the pet hidden, a corner button opens a plain chat panel.",
          instead:
            "A floating \"Ask me\" button in the corner, then a mat in the corner the pet leapt onto. Both cluttered the quiet design, and the pet already lives on every page.",
        },
        {
          id: "guard",
          label: "Guard + router",
          detail: "One decision-model call",
          why: "Jev (TypeSafe, on OpenRouter) is a decision model: it returns typed yes-probabilities, not prose, fast and nearly free. One call refuses off-topic questions, injection attempts and gibberish with a canned reply, and scores which parts of the site's data the answer needs. Messages with no letters or digits are refused before Jev is called.",
          instead:
            "Tool use by the answer model. A typed routing answer is more predictable and easier to log.",
        },
        {
          id: "context",
          label: "Routed data",
          detail: "Only what's needed",
          why: "The assistant reads the same typed modules the site renders, so the two never disagree. Drafts are dropped, and first-person stories are used over card summaries. If nothing scores high, or Jev is down, it gets all of src/data, which still fits.",
        },
        {
          id: "answer",
          label: "Answer",
          detail: "DeepSeek V4.1 Flash",
          why: "Talks about Anthony as his assistant, only from the facts it was given, and says he hasn't written about something rather than guess. Swapping models is one setting.",
          instead: "Claude Haiku 5.5, answering as Anthony in the first person.",
        },
        {
          id: "pace",
          label: "Reading pace",
          detail: "~240 words/min",
          why: "The server streams as fast as the model writes; the chat shows it a word at a time at reading speed, so it reads like someone talking. Stop ends it where it is, and with reduced motion it appears at once.",
        },
        {
          id: "log",
          label: "Logged",
          detail: "Supabase, no IPs",
          why: "Each exchange is saved after the response has gone out, so it never slows the chat: question, answer, why it was refused if it was, which data was used and the model. The table is server-only, and the chat says chats are saved.",
        },
      ],
    },
    decisions: [
      {
        id: "ground-in-data",
        title: "Ground the assistant in src/data, nothing else",
        date: "Oct 2026",
        status: "accepted",
        context:
          "A chatbot talking about Anthony can make things up, and a recruiter will take what it says as true.",
        decision:
          "The assistant answers only from the same typed data modules the site renders. They're turned into text with drafts removed, first-person stories are preferred over card summaries, and the prompt tells it to say Anthony hasn't written about something instead of guessing.",
        consequences:
          "Editing the site's data updates the assistant too, and the two can't disagree. Questions the site doesn't cover get \"Anthony hasn't written about that here\" and a pointer to email, not an answer.",
      },
      {
        id: "router-not-tools",
        title: "Route with a decision model instead of tool use",
        date: "Oct 2026",
        status: "accepted",
        context:
          "All of src/data is about 12k tokens. Sending it every time is wasteful, and the answer model needs the right sections to answer well.",
        decision:
          "One call to Jev, a decision model on OpenRouter, scores which sections a question needs; code fetches them and only those go to the answer model, with the profile always included. If nothing scores high, or Jev fails, everything is sent.",
        consequences:
          "The extra call is fast and nearly free, and every route is a typed answer that's easy to log. It adds a second model to depend on, and Jev is young; the send-everything fallback keeps a misroute from leaving the assistant without facts.",
        alternatives: [
          "Tool use, where the answer model fetches sections itself: less predictable and harder to log.",
          "Always send all of src/data: simpler, but every answer pays for every section.",
        ],
      },
      {
        id: "guard",
        title: "Refuse off-topic, injection and gibberish before answering",
        date: "Oct 2026",
        status: "accepted",
        context:
          "A public chat will get homework questions, attempts to rewrite its instructions, and keyboard mashing. Each one costs an answer.",
        decision:
          "The same Jev call also asks whether the message is about Anthony, whether it's trying to manipulate the assistant, and whether it's gibberish. Any of those gets a short canned reply with no answer-model call. Messages with no letters or digits are refused in code before Jev is called. Visitors are limited to 8 messages a minute and 60 a day, 500 characters each, and all visitors together to 120 answers an hour and 500 a day. The browser sends only the new question; earlier turns are read back from the database, so nobody can forge the assistant's past replies to steer it.",
        consequences:
          "Refusals cost almost nothing. The thresholds are lenient, and the gibberish one is high, so short or odd real messages like \"why?\" still get through; the answer prompt is the second line of defence. The per-visitor limit is in memory, so on serverless it's a speed bump; the shared cap is counted in the database, and the OpenRouter key's credit limit is the last backstop.",
      },
      {
        id: "pet-is-the-chat",
        title: "The pixel pet is the way into the chat",
        date: "Oct 2026",
        status: "accepted",
        context:
          "The site is quiet on purpose, and its bottom-right corner is the pet's floor. A chat button there competes with both.",
        decision:
          "With the pet on there's no button. The pet invites visitors when it notices them (hovering it, the cursor lingering near it, a pat, coming back to the tab, pausing to read) and the chat opens as its speech bubble, wherever it is. The paw menu has an \"Ask about Anthony\" row, and with the pet hidden a corner button opens a plain panel.",
        consequences:
          "The chat feels like part of the site rather than a widget bolted on. It's less obvious than a labelled button, so the invites carry discovery, with a cooldown so they don't nag.",
        alternatives: [
          "A /chat page: calm, but easy to miss in a quick skim.",
          "A floating widget: always visible, but clutters the design and collides with the pet.",
          "The pet leaping onto a mat in the corner to talk: worked, but talking in place felt more natural.",
        ],
      },
      {
        id: "reading-pace",
        title: "Reveal answers at reading pace",
        date: "Oct 2026",
        status: "accepted",
        context: "A fast model dumps a paragraph at once, which reads like a wall of text rather than someone talking.",
        decision:
          "The server streams as fast as the model writes, and the chat reveals the text a word at a time at about 240 words a minute, never splitting a word. Stop ends the reveal where it is; with reduced motion the answer appears at once.",
        consequences:
          "Answers feel conversational and the server stays fast. A long answer takes longer to finish showing than to arrive.",
      },
      {
        id: "log-chats",
        title: "Save every exchange, without identifying anyone",
        date: "Oct 2026",
        status: "accepted",
        context: "There's no way to know what people ask, or whether answers and routes are any good, without keeping them.",
        decision:
          "Each exchange is saved to a Supabase table after the response has been sent: question, answer, outcome, refusal reason, routed sections, model, timing, page, a random session ID that lasts until the tab closes, and where the visitor came from (the referring site's domain and utm_source, never the full URL). No IPs. The table is server-only, and the chat tells visitors chats are saved.",
        consequences:
          "Misroutes, bad answers and over-eager refusals show up in the data, chats can be read as whole sessions, and it shows whether visitors come from LinkedIn or a resume link. Chats are kept until deleted, so the note in the chat matters.",
      },
      {
        id: "assistant-not-twin",
        title: "An assistant that talks about Anthony, not a twin that talks as him",
        date: "Oct 2026",
        status: "accepted",
        context:
          "The chat started as an AI twin: it answered as Anthony, in the first person, and the pet handed answers over with \"he says:\". But the pet is an animal and the model isn't Anthony, and first-person answers read as his own words.",
        decision:
          "It's his AI assistant. It speaks as itself and talks about him; facts he wrote in the first person are retold about him. The greeting, starter questions and refusals say so, and the pets hand over the assistant's answer (\"here's the answer:\") instead of quoting him.",
        consequences:
          "Nobody mistakes a model's sentence for something Anthony said. Answers are a step less personal than hearing it from him.",
        alternatives: ["Keep the first-person twin: more personal, but it puts words in Anthony's mouth."],
      },
    ],
  },
  {
    id: "tsi-dashboard",
    title: "PlanCatalyst TSI Data Dashboard",
    tagline: "Country-level development-need dashboard",
    description:
      "A data platform for client PlanCatalyst: global sources are fetched, cleaned, scored on a 7-pillar / 28-indicator model and published as versioned JSON to Azure Blob, then rendered in a React choropleth embedded in their Wix site. I worked on the backend and infrastructure (data-source wiring, country resolver, projections module, publish step) in May–June 2026.",
    status: "in-progress",
    tags: ["Data", "Backend", "Client work"],
    period: "May 2026 – Jun 2026 (my part)",
    technologies: ["Python", "React", "TypeScript", "d3", "Azure Blob", "GitHub Actions"],
    github: "https://github.com/PlanCatalyst/TSI-Data-Dashboard",
  },
  {
    id: "wowie",
    title: "WoWie",
    tagline: "Hack Western 12 checkout nudge to invest",
    description:
      "A Chrome extension that meets women where they already shop: it reads the cart total at checkout and shows a playful \"Girl Math\" popup with what that money could be worth today had it gone into a stock, plus a \"Years Until Free\" opportunity-cost figure. I built the FastAPI backend, the stock engine (CAGR from yfinance history, with a fallback when data looks bad), the personalized recommendations and the frontend API integration, with two teammates on the extension UI, scraping and stock service.",
    status: "shipped",
    tags: ["Backend", "Hackathon"],
    period: "Nov 2025",
    technologies: ["Python", "FastAPI", "yfinance", "React", "TypeScript", "Chrome extension"],
    github: "https://github.com/sarahchiang0529/Hack-Western-XII",
    image: {
      src: media("projects/wowie.webp"),
      alt: "Two WoWie popup cards: an intro reading \"Girl... What happened to becoming a WoW?\" over an Oprah GIF, and a result showing that about $153 in NVDA six months ago would have made $201.76, a 232% return.",
      width: 806,
      height: 500,
    },
    story: [
      "WoWie was my second hackathon, at Hack Western 12 in November 2025, and it was a challenge in a different way. We got paired up with two non-coders, an architecture student and a management engineering student, so there wasn't much coding power on the team, and I ended up leading the project.",
      "The idea is a Chrome extension that meets women where they already shop. At checkout it reads your cart total and pops up some playful 'Girl Math': what that money would be worth today if it had gone into a stock instead, plus a 'Years Until Free' number for the opportunity cost.",
      "Instead of forcing everyone to code, I leaned into what people were good at. Our architecture teammate designed the wireframes, and honestly they were better than anything I would have made. Our management engineering teammate handled the documentation, and I taught her a bit of code along the way. The other developer and I did the heavy coding, which meant a couple of 16-hour sessions.",
      "I built the FastAPI backend and the stock engine. It works out a growth rate from Yahoo Finance price history, with a fallback for when the data looks off. I also built the personalized recommendations and wired the extension's popup up to the API.",
      "We submitted and didn't win anything, but it was a great learning experience. It convinced me a mixed team can do better work than four people who all think the same way, as long as someone's pulling it together.",
    ],
  },
  {
    id: "intern-compass",
    title: "Intern Compass",
    tagline: "Hack the Valley onboarding assistant",
    description:
      "An AI onboarding assistant: admins upload company PDFs, which are chunked and embedded; new hires ask questions in chat and Gemini answers with citations. I built the backend: admin routes, document deletion, vector embeddings for RAG and the Gemini query endpoint.",
    status: "shipped",
    tags: ["AI", "RAG", "Backend", "Hackathon"],
    period: "Oct 2025",
    technologies: ["Express", "TypeScript", "Postgres", "Gemini", "React"],
    github: "https://github.com/alam389/Inter-Compass-Service",
    image: {
      src: media("projects/intern-compass.webp"),
      alt: "The Intern Compass chat screen: a sidebar with Chat, Outline and Admin, a welcome message from the assistant and four quick-start questions.",
    },
    story: [
      "Intern Compass was my first hackathon, at Hack the Valley in October 2025. Four of us built it in a weekend, and honestly the best thing I got out of it was the people. I met some good friends on that team.",
      "The idea came from onboarding being overwhelming. New hires get hundreds of pages of handbooks and policies and can't find what they need. So we built an assistant where admins upload company PDFs and new hires just ask questions in plain English. Gemini answers from those documents and cites where each answer came from.",
      "I owned the backend. I set up the Express and TypeScript server with Postgres, then built the admin routes for managing documents, the embeddings for retrieval, and the endpoint where Gemini pulls the relevant chunks and writes the answer. We built the RAG pipeline from scratch with no LangChain: PDFs get split into roughly 512-token chunks, embedded, and matched to the question with cosine similarity.",
      "It wasn't smooth. About 16 hours in we were stuck and running on no sleep. One of us had spent hours fighting a file storage setup that wouldn't work, and nobody was sure what to do next. I grabbed a mentor to help untangle it, moved people onto pieces they could actually finish, and we cut scope so we'd have something working to show.",
      "We submitted on time and got judged. We didn't win, but that weekend taught me what leading under pressure actually looks like: give people direction, get them unstuck, and cut scope so you finish something.",
    ],
  },
  {
    id: "asl-digits",
    title: "ASL Hand-Gesture Recognition",
    tagline: "CNN on webcam hand gestures",
    description:
      "A DATASCI 3000B group project, presented March 31, 2026, that recognizes American Sign Language from images or a live webcam. It trains on ASL-HG phone photos with real backgrounds, crops each hand with MediaPipe landmarks (cached once), converts it to 128×128 grayscale and classifies it with an ASLNet CNN (BatchNorm, dropout) over 36 classes, digits 0-9 and letters A-Z. It scores 99.98% on a held-out test set of 5,394 images. The split is random, so volunteers overlap, and look-alike signs (2/V, 6/W, 0/O) and the motion letters J and Z can't be told apart from a single frame.",
    status: "school",
    tags: ["AI", "Computer Vision"],
    period: "Winter 2026",
    technologies: ["Python", "PyTorch", "MediaPipe", "OpenCV"],
    github: "https://github.com/alam389/ASL_numbers_CNN",
    video: {
      src: media("projects/asl-cnn-demo.mp4"),
      label: "Live webcam demo of the ASL classifier recognizing hand gestures.",
    },
    story: [
      "This was a group project for DATASCI 3000B, my intro to machine learning course, with three teammates. The idea was to recognize American Sign Language signs from a photo or a live webcam. The proposal used classic models like KNN and random forests, but we went with a CNN because that's what actually worked on images.",
      "Our first version taught us a lot by failing. We trained on a Kaggle dataset of bright hands on pure black backgrounds, so the model basically learned 'bright shape on black' and got most signs wrong in a normal room. We were also cropping hands with YOLOv8n, which doesn't even have a hand class, so half the time it cropped my whole body.",
      "So we rebuilt the pipeline around real-world photos. We switched to the ASL-HG dataset, 36,000 phone photos with real backgrounds and different skin tones, covering all 36 signs: digits 0 to 9 and A to Z. MediaPipe's hand landmarks give a proper crop around the hand, which we turn into a 128×128 grayscale image and cache so training doesn't rerun the detector every epoch. The classifier is a CNN with BatchNorm and dropout, trained with augmentation on an Apple GPU, and there's a test suite behind it.",
      "On a held-out test set of 5,394 images it scores 99.98%, with exactly one mistake: an H read as an I. I'll be honest about that number, though. The split is random, so the same volunteers show up in training and test, and splitting by person would give a fairer score. Some signs also just can't be told apart from a single frame, like 2 and V, 6 and W, 0 and O, and J and Z are motion signs. Live, it works well if your whole hand and wrist are in frame at arm's length, like the dataset photos.",
      "The biggest thing I took from it: a great validation score means nothing until you test it in the real conditions people will use it in. Our first version looked fine on paper and fell apart on a webcam.",
    ],
    // Every line here restates the description or story above.
    architecture: {
      steps: [
        {
          id: "input",
          label: "Photo or webcam frame",
          detail: "Trained on ASL-HG, 36,000 photos",
          why: "ASL-HG is phone photos with real backgrounds and different skin tones, so training looks like what a webcam actually sees.",
          instead:
            "A Kaggle set of bright hands on pure black backgrounds. The model learned 'bright shape on black' and got most signs wrong in a normal room.",
        },
        {
          id: "crop",
          label: "MediaPipe hand crop",
          detail: "Crop box from hand landmarks",
          why: "MediaPipe's hand landmarks give a proper crop around the hand.",
          instead:
            "YOLOv8n, which has no hand class, so half the time it cropped the whole body.",
        },
        {
          id: "preprocess",
          label: "Grayscale + cache",
          detail: "128×128, cached once",
          why: "Each crop is cached once, so training doesn't rerun the detector every epoch.",
        },
        {
          id: "model",
          label: "ASLNet CNN",
          detail: "BatchNorm · dropout · augmentation",
          why: "A CNN because that's what actually worked on images. Trained with augmentation on an Apple GPU, with a test suite behind it.",
          instead: "KNN and random forests, the classic models in the proposal.",
        },
        {
          id: "output",
          label: "36 classes",
          detail: "Digits 0–9, letters A–Z",
          why: "99.98% on 5,394 held-out images, with one mistake: an H read as an I. The split is random, so the same volunteers are in training and test; splitting by person would be fairer. 2/V, 6/W and 0/O look alike in a single frame, and J and Z are motion signs.",
        },
      ],
    },
  },
  {
    id: "pony-ai",
    title: "Pony AI",
    tagline: "Western capstone, source-cited student guide",
    description:
      "A capstone prototype for Team Pony Club: a RAG chatbot that helps Western students find official academic and campus-resource information, always cites its sources and refers personal or high-impact questions to the right office. Currently in planning.",
    status: "early",
    tags: ["AI", "RAG", "Capstone"],
    period: "Oct 2026 – Present",
    technologies: ["RAG"],
    story: [
      "Pony AI is my software engineering capstone at Western, SE4450, with a team of four called Team Pony Club. I'm the product owner. It's early: we've signed our team charter and are still in planning, so there's nothing built yet.",
      "The problem is one every Western student knows. The information you need is spread across the Academic Calendar, the Registrar, faculty and department sites, Student Center and a pile of service platforms. You spend ages figuring out which page is the official one, or which office actually handles your question, and it's worst when you're new.",
      "So we're building a web app with a RAG chatbot that answers from official Western pages only, for a defined set of topics: general deadlines, course descriptions and prerequisites for selected programs, policy navigation and service referrals. Every answer cites the source page, title, link and date. Around it we're planning a course discovery directory and a curated hub of official student resources, with an admin process for approving sources.",
      "What I find most interesting is deciding what it won't do. It doesn't touch grades, transcripts or enrolment, it doesn't do degree audits or give academic, legal, medical or financial advice, and it never presents AI output as official policy. When a question is personal or high-stakes, it sends you to the right office, like academic advising, the Registrar, accessibility services or counselling, instead of guessing.",
      "As product owner I'm accountable for refining user stories and for automated testing. On the technical side, I'm responsible for the long-term storage for our Graph-RAG database. We run it properly agile: two standups a week, PR reviews within 24 hours, and architecture decision records for big calls, because if it isn't written down, it isn't decided.",
    ],
  },
];
