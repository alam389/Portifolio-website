import type {
  Activity,
  Book,
  Dish,
  Paper,
  Podcast,
  Restaurant,
} from "./types";

const MOCK = "Placeholder. Replace with a real entry or delete.";

// Everything here is a placeholder until replaced. Draft entries only render
// in dev, so production shows nothing that isn't real.

/** One-line intros: the Interests overview, then each section. */
export const interestIntros = {
  overview: "What I read, cook and do for fun.",
  ai: "What I've been reading and listening to.",
  food: "What I cook, and where I eat.",
  active: "How I get away from the screen.",
};

export const papers: Paper[] = [
  {
    id: "why-lms-hallucinate",
    title: "Why Language Models Hallucinate",
    authors: "Kalai, Nachum, Vempala, Zhang",
    year: 2025,
    url: "https://arxiv.org/abs/2509.04664",
    tags: ["LLMs", "evaluation"],
    summary: {
      overview:
        "An OpenAI and Georgia Tech paper arguing that hallucinations aren't mysterious. They start as ordinary classification errors during pretraining, and they survive post-training because most benchmarks reward a confident guess over \"I don't know\".",
      problem:
        "Language models still produce plausible, confident falsehoods, even the latest ones. The paper asks why they appear at all, and why years of post-training work haven't removed them.",
      approach: [
        "Reduces generation to a binary classification problem the authors call Is-It-Valid: deciding whether a candidate output is valid or an error. Producing valid text is at least as hard as answering that yes/no question.",
        "Uses computational learning theory to bound a base model's error rate by its misclassification rate on Is-It-Valid. The analysis covers prompts and \"I don't know\" answers, and doesn't depend on transformers or next-word prediction.",
        "Audits ten popular benchmarks (GPQA, MMLU-Pro, SWE-bench, HLE and others) to see how each one scores an abstention.",
      ],
      findings: [
        "Even with error-free training data, minimizing the standard cross-entropy loss produces a calibrated model, and a calibrated model must make some errors. Roughly, generative error rate ≳ 2 × Is-It-Valid misclassification rate.",
        "For arbitrary facts with no learnable pattern, like birthdays, the hallucination rate after pretraining is at least the share of facts that appear exactly once in the training data (the \"singleton rate\"). If 20% of birthdays appear once, expect at least 20% hallucination on birthdays.",
        "Other errors come from poor models rather than missing data. Letter-counting fails partly because models see tokens, not characters, and reasoning models that spell words out get it right.",
        "Under binary 0/1 grading, abstaining is never the score-maximizing answer, so models are trained to always be in \"test-taking\" mode. Nine of the ten benchmarks give no credit for \"I don't know\", and the tenth gives only partial credit.",
        "The proposed fix is socio-technical: put explicit confidence targets in mainstream evals (e.g. \"answer only if more than 90% confident; wrong answers cost 9 points\") instead of adding yet another hallucination benchmark.",
      ],
      limitations: [
        "Only considers plausible falsehoods, not nonsense, and treats every error as equally bad.",
        "Examples center on single factual questions; open-ended generation with several errors per answer is harder to score.",
        "RAG and search don't escape the argument: binary grading still rewards guessing whenever retrieval comes up empty.",
        "A correct/incorrect/IDK scale is still a simplification of the many ways to express uncertainty, like hedging or asking a clarifying question.",
      ],
    },
  },
  {
    id: "review-of-ai-agents",
    title: "A Comprehensive Review of AI Agents: Transforming Possibilities in Technology and Beyond",
    authors: "Qu et al.",
    year: 2025,
    url: "https://arxiv.org/abs/2508.11957",
    tags: ["agents", "survey"],
    summary: {
      overview:
        "A broad survey, written with newcomers in mind, of how AI agents have evolved from rule-based programs to LLM-driven systems that perceive, plan and act. It maps the core architecture, where agents are being applied, and what's still unsolved.",
      problem:
        "Agent research is moving fast and spans RL, LLMs, cognitive science and multi-agent systems. Existing reviews tend to assume prior knowledge, so there are few simple frameworks for someone entering the field.",
      approach: [
        "A systematic literature review following PRISMA guidelines: Google Scholar searches, screening by title and abstract, then full-text review.",
        "Excluded papers without full-text access, papers only tangential to agents, and non-English work.",
        "Organized the results into architecture, applications across six domains, design directions, and a step-by-step guide for new researchers.",
      ],
      findings: [
        "A modern agent comes down to four parts: memory (short-term context plus long-term storage), tools (search, code interpreters, calculators), planning (chain-of-thought, reflection, breaking goals into subgoals) and actions.",
        "Self-improvement methods like Reflexion, which learns from verbal self-feedback, and Chain of Hindsight, which trains on past outputs paired with feedback, let agents improve without heavy fine-tuning.",
        "Agents are already used in healthcare (diagnostic support, patient chatbots), business (customer service, supply chains, fraud detection, trading), education (co-learners, mentor agents), science (automated labs, \"AI Scientist\"), public services, and games.",
        "Promising design directions are hybrid symbolic-plus-neural architectures, for interpretability and generalization, and hierarchical, modular designs that break big tasks into specialized sub-modules that are easier to debug.",
        "For newcomers: build the theory first (RL, planning, multi-agent coordination), pick projects with measurable outcomes, practice in simulators like CARLA and PettingZoo, and reproduce published results.",
      ],
      limitations: [
        "Open challenges: robustness under distribution shift and adversarial inputs, opaque decision-making, bias and accountability, poor transfer to new tasks, and high compute and energy cost.",
        "Autonomy makes responsibility harder to pin down than with a plain LLM, because an agent's behavior keeps changing and it acts directly on people and systems.",
        "As a survey it summarizes others' results instead of running its own experiments, and the search was limited to open-access English papers.",
      ],
    },
  },
  {
    id: "rag-knowledge-graphs-customer-service",
    title: "Retrieval-Augmented Generation with Knowledge Graphs for Customer Service Question Answering",
    authors: "Xu et al.",
    year: 2024,
    venue: "SIGIR",
    url: "https://arxiv.org/abs/2404.17723",
    tags: ["RAG", "knowledge graphs"],
    summary: {
      overview:
        "A LinkedIn paper on answering customer-support questions from past issue tickets. Instead of chunking tickets into plain text for RAG, it builds a knowledge graph that keeps each ticket's structure and the links between tickets. Deployed in production, it cut median resolution time by 28.6%.",
      problem:
        "Standard RAG treats tickets as flat text split into fixed-size chunks. That throws away structure (tickets are \"related to\", \"cloned from\" or \"caused by\" other tickets) and can split a problem from its fix, which leads to incomplete answers.",
      approach: [
        "Parses each ticket into a tree of sections (summary, description, priority, steps to reproduce, root cause). Fixed fields use rules, and an LLM guided by a YAML template handles the free text.",
        "Connects tickets into a graph using explicit links from the issue tracker plus implicit links when ticket titles are similar enough (cosine similarity of embeddings above a threshold).",
        "Embeds text-heavy sections with E5/BERT into a vector database. Because each section is embedded on its own, chunking never splits one section from another.",
        "At query time, an LLM extracts entities and intent from the question, embedding search finds the most relevant tickets, then the LLM writes a Cypher query against Neo4j to pull exactly the sub-graph it needs and answers from it. It falls back to plain text retrieval if the graph query fails.",
      ],
      findings: [
        "Same LLM (GPT-4) and embedding model (E5) as the baseline, but retrieval MRR rose from 0.522 to 0.927.",
        "Answer quality improved on every text metric: BLEU 0.057 → 0.377, METEOR 0.279 → 0.613, ROUGE 0.183 → 0.546.",
        "In a roughly six-month randomized rollout to LinkedIn's support team, the group using the tool resolved issues faster: mean 40h → 15h, median 7h → 5h, P90 87h → 47h.",
      ],
      stats: [
        { label: "Retrieval MRR", value: "+77.6%" },
        { label: "BLEU", value: "+0.32" },
        { label: "Median resolution", value: "−28.6%" },
      ],
      limitations: [
        "The graph template is written by hand for customer-support tickets. Extracting templates automatically is listed as future work.",
        "The graph isn't updated live as new questions come in, and the paper only tests the customer-service domain.",
        "Offline results come from a curated \"golden\" dataset; the paper is a short five-page industry write-up.",
      ],
    },
  },
  {
    id: "cognitive-architecture-artificial-societies",
    title: "A General Cognitive Architecture for Agent-Based Modeling in Artificial Societies",
    authors: "Ye, Wang, Wang",
    year: 2018,
    venue: "IEEE Transactions on Computational Social Systems",
    url: "https://doi.org/10.1109/TCSS.2017.2777602",
    tags: ["agents", "multiagent systems"],
    summary: {
      overview:
        "Proposes one general \"brain\" design for agents in social simulations (crowds, populations, economies), so models built for different studies can be reused and combined. It predates LLM agents, but its modules map closely onto how agents are designed today.",
      problem:
        "Agent-based artificial societies are a standard tool for studying things like demography, traffic, epidemics and economics. But there is no agreed way to model an agent's decision-making, so every project builds its own, and models rarely get reused or integrated.",
      approach: [
        "Reviews four families of existing architectures: production-rule systems (cheap, but limited to simple behavior), BDI models (beliefs, desires, intentions) and the BOID variant that adds obligations, normative models where social norms come from outside the agent, and psychology-inspired ones like SOAR, ACT-R and CLARION (rich, but too expensive for thousands of agents).",
        "Proposes a modular architecture: perception and actuation, learning, working and long-term memory, norms, emotion and personality, physical and social state, reasoning, motivation and attention, planning, and interaction with other agents.",
        "Runs two simulations that use different subsets of the modules to show one architecture can host different kinds of models.",
      ],
      findings: [
        "Each agent repeats one cycle: observe and talk to others, update memory, learn, reason under the constraints of norms, emotion and physical state, rank motivations by attention, plan, then act.",
        "Emotion drives short-term, time-pressured decisions; personality drives long-term strategy, and is what makes individuals differ.",
        "Evacuation (500 agents, two exits): agents pick and switch exits based on what neighbors do, their self-confidence and their fatigue. This short-term scenario used most of the modules.",
        "Population evolution: Chinese census data, with each agent standing for 10,000 people, modeling births, deaths, and migration driven by wage gaps, distance, and a pull toward home. This long-term, \"rational\" scenario needed only six modules.",
      ],
      limitations: [
        "The authors list the field's open problems: assumptions can be arbitrary, too many free parameters make models hard to falsify, empirical grounding is weak, documentation and replication are poor, and code is rarely reusable.",
        "Proposed remedies are calibrating behavior with social experiments (like the trust game), fitting micro-level parameters to macro-level statistics, open-sourcing code, and sharing a common knowledge base.",
        "The two simulations are demonstrations that the architecture works, not benchmarked comparisons against other designs.",
      ],
    },
  },
  {
    id: "attention-is-all-you-need",
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    year: 2017,
    venue: "NeurIPS",
    url: "https://arxiv.org/abs/1706.03762",
    tags: ["transformers", "LLMs"],
    summary: {
      overview:
        "The Google paper that introduced the Transformer: an encoder-decoder model built only from attention, with no recurrence or convolution. It set new machine-translation records while training in a fraction of the time, and it's the architecture today's large language models are built on.",
      problem:
        "The best sequence models of 2017 were recurrent networks (LSTMs, GRUs) with attention on top. Recurrence processes a sentence one position at a time, so training can't be parallelized within a sequence, and signals between distant words have to pass through many steps. Convolutional alternatives parallelize better, but the number of operations needed to relate two positions still grows with the distance between them.",
      approach: [
        "Keeps the encoder-decoder shape but builds each side from 6 identical layers. An encoder layer is multi-head self-attention followed by a position-wise feed-forward network, each wrapped in a residual connection and layer normalization. The decoder adds attention over the encoder's output and masks future positions so each prediction only sees earlier words.",
        "Scaled dot-product attention: each position compares its query with every key, takes softmax(QKᵀ / √dₖ) and uses the result to weight the values. The √dₖ scaling keeps large dot products from pushing the softmax into regions with tiny gradients.",
        "Multi-head attention runs 8 attention heads in parallel on smaller 64-dimensional projections (model width 512), so the model can attend to different kinds of relationships at once for about the cost of one full-width head.",
        "With no recurrence, word order comes from positional encodings: sine and cosine waves of different frequencies added to the embeddings. Learned position embeddings worked about as well; the sinusoids were chosen in the hope they extend to longer sequences than seen in training.",
        "Trained on WMT 2014 English-German (about 4.5M sentence pairs) and English-French (36M) on 8 NVIDIA P100 GPUs, with a warmup-then-decay learning rate, dropout and label smoothing.",
      ],
      findings: [
        "A self-attention layer connects any two positions in a constant number of sequential steps, versus a number that grows with sentence length for recurrent layers. It's also cheaper per layer whenever the sentence is shorter than the model width, which is the usual case.",
        "English-German: the big model scored 28.4 BLEU, more than 2 BLEU above the previous best results, ensembles included. Even the base model, trained in about 12 hours, beat every previously published model and ensemble.",
        "English-French: 41.8 BLEU, a new single-model state of the art, after 3.5 days of training, a small fraction of the training cost of the previous best models.",
        "Ablations: a single attention head is 0.9 BLEU worse than the best setting, and too many heads also hurts. Bigger models and dropout both help.",
        "The same architecture, barely tuned, did well on English constituency parsing (91.3 F1 on WSJ alone, 92.7 with extra semi-supervised data), suggesting it generalizes beyond translation.",
      ],
      stats: [
        { label: "BLEU, EN→DE", value: "28.4" },
        { label: "BLEU, EN→FR", value: "41.8" },
        { label: "Big-model training", value: "3.5 days" },
      ],
      limitations: [
        "Self-attention compares every position with every other, so its cost grows with the square of the sequence length. The authors suggest restricting attention to a local neighborhood for very long inputs, as future work.",
        "Averaging over attention-weighted positions blurs fine detail; multi-head attention is the paper's counter to that, not a full fix.",
        "Generation is still autoregressive, one token at a time. The authors list making it less sequential as a goal.",
        "Evaluated only on text (translation and parsing). Images, audio and video are named as future directions.",
      ],
    },
  },
];

export const books: Book[] = [
  {
    id: "ai-engineering",
    title: "AI Engineering: Building Applications with Foundation Models",
    authors: "Chip Huyen",
    year: 2025,
    publisher: "O'Reilly",
    url: "https://openlibrary.org/isbn/9781098166304",
    tags: ["LLMs"],
  },
  {
    id: "building-applications-with-ai-agents",
    title: "Building Applications with AI Agents: Designing and Implementing Multiagent Systems",
    authors: "Michael Albada",
    year: 2025,
    publisher: "O'Reilly",
    url: "https://openlibrary.org/isbn/9781098176501",
    tags: ["agents"],
  },
  {
    id: "learning-langchain",
    title: "Learning LangChain: Building AI and LLM Applications with LangChain and LangGraph",
    authors: "Mayo Oshin, Nuno Campos",
    year: 2025,
    publisher: "O'Reilly",
    url: "https://openlibrary.org/isbn/9781098167288",
    tags: ["RAG", "agents"],
  },
  {
    id: "pragmatic-programmer",
    title: "The Pragmatic Programmer, 20th Anniversary Edition",
    authors: "David Thomas, Andrew Hunt",
    year: 2019,
    publisher: "Addison-Wesley",
    url: "https://pragprog.com/titles/tpp20/",
    tags: ["craft"],
  },
];

// A whole show, or one episode (with `episode` and `date`) when the takeaway
// is about something specific that was said.
export const podcasts: Podcast[] = [
  {
    id: "bloomberg-tech",
    show: "Bloomberg Tech",
    url: "https://open.spotify.com/show/5L84QuZlUsILySyMZNM07W",
    embed: "audio",
    about:
      "Bloomberg's daily show on the technology industry: big-tech earnings, chips, startups, funding and the policy and markets stories around them.",
    takeaway:
      "I use it to stay on top of what's happening in tech and the wider environment around it, for investing and for making plays on the stock market. It's one of the places I heard about the Hugging Face incident the moment it was reported.",
    tags: [],
  },
  {
    id: "ai-daily-brief",
    show: "The AI Daily Brief",
    url: "https://open.spotify.com/show/7gKwwMLFLc6RmjmRpbMtEO",
    embed: "video",
    about:
      "A daily rundown of the biggest AI news and the discussion around it: model releases, company moves, research and what it all means. The host draws on top research experts and the AI giants for sources.",
    takeaway:
      "It keeps me on top of new model releases, and of the political and economic state of AI and how it's affecting everybody.",
    tags: [],
  },
];

// Photos go in public/interests/cooking/ and are referenced as
// "/interests/cooking/<file>". Dishes without one get a name-only card.
export const dishes: Dish[] = [
  { id: "dish-one", name: "Dish name", note: "Go-to weeknight meal", draft: MOCK },
  { id: "dish-two", name: "Dish name", cuisine: "Cuisine", draft: MOCK },
  { id: "dish-three", name: "Dish name", draft: MOCK },
];

export const restaurants: Restaurant[] = [
  {
    id: "restaurant-one",
    name: "Restaurant name",
    city: "London, ON",
    cuisine: "Cuisine",
    order: "The dish I always get",
    draft: MOCK,
  },
  {
    id: "restaurant-two",
    name: "Restaurant name",
    city: "Toronto, ON",
    cuisine: "Cuisine",
    order: "The dish I always get",
    draft: MOCK,
  },
];

export const activities: Activity[] = [
  {
    id: "badminton",
    title: "Badminton",
    description: "How long I've played, where, and what I like about it.",
    facts: ["Singles or doubles", "How often"],
    draft: MOCK,
  },
  {
    id: "gym",
    title: "Working out",
    description: "What my training looks like right now.",
    facts: ["Split", "How often"],
    prs: [{ label: "Lift", value: "Weight" }],
    draft: MOCK,
  },
];
