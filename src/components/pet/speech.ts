import type { SpeciesName } from "./sprites";

/**
 * What the pet says, kept apart from the engine so the copy is easy to tweak.
 * Short on purpose: mostly sounds and single words, in each species' voice
 * (the cat is dry and aloof, the dog excitable, the bunny shy).
 */

export type Moment =
  | "pat"
  | "grabbed"
  | "tumble"
  | "notice"
  | "startle"
  | "ball"
  | "ballGone"
  | "bring"
  | "eat"
  | "eatDone"
  | "sleep"
  | "idle";

const LINES: Record<SpeciesName, Record<Moment, string[]>> = {
  cat: {
    pat: ["mrrp", "prrr…", "…fine.", "again.", "acceptable."],
    grabbed: ["excuse me.", "unhand me.", "rude."],
    tumble: ["whoa.", "intentional."],
    notice: ["?", "hm.", "…?"],
    startle: ["!"],
    ball: ["hm.", "oh?", "mine."],
    ballGone: ["…boring.", "it left.", "fine."],
    bring: ["…"],
    eat: ["mm.", "finally."],
    eatDone: ["acceptable.", "more.", "adequate."],
    sleep: ["zzz…", "nap time."],
    idle: ["hm.", "…", "*stares*", "meow.", "this is my page."],
  },
  dog: {
    pat: ["!!", "hi hi hi!", "best day!", "♥", "again!!"],
    grabbed: ["wheee!", "!!", "up up up!"],
    tumble: ["whoaa!", "aaa!"],
    notice: ["!", "hi!", "!!"],
    startle: ["!"],
    ball: ["BALL!!", "ball!!", "!!!"],
    ballGone: ["where'd it go?", "ball?", "…ball?"],
    bring: ["throw it!", "again!", "go on!"],
    eat: ["BONE!!", "nom nom!", "!!!"],
    eatDone: ["more?", "yum!!", "best bone"],
    sleep: ["zzz…", "five mins…"],
    idle: ["!", "hi!", "*pant*", "good page!", "walk?"],
  },
  bunny: {
    pat: ["♥", "*binky*", "eep!", "…nice", "hehe"],
    grabbed: ["eep!", "eeep!", "careful!"],
    tumble: ["eep!", "oh no!"],
    notice: ["…?", "oh?", "!"],
    startle: ["eep!", "!!"],
    ball: ["ooh", "oh!", "play?"],
    ballGone: ["gone?", "where?", "aw."],
    bring: ["…"],
    eat: ["carrot!", "crunch!", "ooh!"],
    eatDone: ["yum", "more?", "crunchy"],
    sleep: ["zzz…", "sleepy…"],
    idle: ["…", "*sniff*", "hop?", "nice page.", "*twitch*"],
  },
};

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const line = (species: SpeciesName, moment: Moment) => pick(LINES[species][moment]);

/** How long a line stays up, in seconds: enough to read, never a wall. */
export const lingerFor = (text: string) => Math.min(1.8 + text.length * 0.07, 4);

// --- Reacting to the page ---

type PerSpecies = Record<SpeciesName, string[]>;

/** One-off remark a moment after arriving on a page, by route prefix. */
const ROUTES: [prefix: string, lines: PerSpecies][] = [
  ["/pet-lab", { cat: [], dog: [], bunny: [] }],
  ["/experience", { cat: ["so much work.", "busy human."], dog: ["so much work!!", "wow!"], bunny: ["so busy…", "ooh, work"] }],
  ["/projects", { cat: ["hm. shiny.", "adequate work."], dog: ["so many projects!!", "ooh!!"], bunny: ["ooh, projects", "so neat"] }],
  ["/journey", { cat: ["a globe. a ball?", "round."], dog: ["a globe!!", "BIG ball!!"], bunny: ["so round", "the world…"] }],
  ["/interests/food", { cat: ["is that fish?", "snacks."], dog: ["FOOD??", "i'm hungry!"], bunny: ["carrots?", "snacks…?"] }],
  ["/interests/ai", { cat: ["robots. hm.", "i am smarter."], dog: ["robots!!", "beep boop!"], bunny: ["beep boop?", "so clever"] }],
  ["/interests/active", { cat: ["running? no.", "exercise. ugh."], dog: ["running!!", "WALK??"], bunny: ["zoomies!", "hop hop"] }],
  ["/interests", { cat: ["interests. mine: naps.", "hm."], dog: ["hobbies!!", "ooh!"], bunny: ["ooh, hobbies", "nice"] }],
  ["/resume", { cat: ["hire him.", "…acceptable hire."], dog: ["hire anthony!!", "good human!!"], bunny: ["good resume", "hire him?"] }],
];

const LOST: PerSpecies = {
  cat: ["this is not a page.", "we are lost."],
  dog: ["where are we??", "lost!! fun!!"],
  bunny: ["where are we…?", "oh no."],
};

export function routeLine(species: SpeciesName, path: string): string | null {
  if (path === "/") return null;
  const hit = ROUTES.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  const lines = hit ? hit[1][species] : LOST[species];
  return lines.length ? pick(lines) : null;
}

const SWITCH: Record<"light" | "dark", PerSpecies> = {
  light: { cat: ["too bright.", "my eyes."], dog: ["so sunny!!", "bright!!"], bunny: ["bright!", "so bright"] },
  dark: { cat: ["better.", "mm. dark."], dog: ["night mode!!", "spooky!"], bunny: ["cozy", "ahh, dim"] },
};

export const themeLine = (species: SpeciesName, to: "light" | "dark") => pick(SWITCH[to][species]);

/** Said once on arrival if it's an odd hour. */
export function hourLine(species: SpeciesName, hour: number): string | null {
  if (hour >= 23 || hour < 5) {
    return { cat: "it's late. nap?", dog: "up late!!", bunny: "so late…" }[species];
  }
  if (hour >= 5 && hour < 10) {
    return { cat: "morning. ugh.", dog: "good morning!!", bunny: "morning!" }[species];
  }
  return null;
}

/** What the pet is standing on. */
export interface Spot {
  tag: string;
  text: string;
}

const PERCH: Record<string, PerSpecies> = {
  aside: {
    cat: ["the sidebar. mine.", "a fine perch."],
    dog: ["the menu!!", "i live here!"],
    bunny: ["this is cozy", "the sidebar"],
  },
  nav: {
    cat: ["the menu. mine.", "a fine perch."],
    dog: ["the menu!!", "buttons!!"],
    bunny: ["so many buttons", "cozy"],
  },
  img: {
    cat: ["nice photo.", "hm. pretty."],
    dog: ["nice photo!!", "ooh!!"],
    bunny: ["pretty photo", "ooh"],
  },
  figure: {
    cat: ["nice photo.", "hm. pretty."],
    dog: ["nice photo!!", "ooh!!"],
    bunny: ["pretty photo", "ooh"],
  },
  footer: {
    cat: ["the end.", "nothing here."],
    dog: ["the end!!", "that's all!"],
    bunny: ["the end…", "all done"],
  },
};

const HEADING: PerSpecies = {
  cat: ["a heading. convenient.", "a ledge. good."],
  dog: ["i'm on the title!!", "ta-da!!"],
  bunny: ["good view", "up high"],
};

/** A remark about the element it's standing on, or null if there's nothing to say. */
export function perchLine(species: SpeciesName, { tag, text }: Spot): string | null {
  if (tag === "h1" || tag === "h2") {
    const title = text.trim();
    // Quote the heading itself now and then.
    if (title && title.length <= 24 && Math.random() < 0.6) {
      return {
        cat: `${title}. noted.`,
        dog: `${title}!!`,
        bunny: `${title}?`,
      }[species];
    }
    return pick(HEADING[species]);
  }
  const lines = PERCH[tag];
  return lines ? pick(lines[species]) : null;
}
