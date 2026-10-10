# Pixel pet

A cat, dog or bunny that roams the site for every visitor, in the spirit of VS Code Pets and Shimeji. It walks on real page elements, rides them as the page scrolls, falls and lands when they move away, jumps between them, and plays with the visitor.

Visitors choose their pet in the **paw menu** (the paw button in the sidebar). The choice is remembered in localStorage.

## What a visitor can do

| Action | How |
| --- | --- |
| Pick species and coat | Paw menu. Cat: ginger, grey tabby, tuxedo. Dog: golden, chocolate, black. Bunny: white, brown, grey. The cat is the default. |
| Pat | Click the pet, or "Pet the …" in the menu |
| Pick up and throw | Drag the pet and let go; it keeps the throw velocity |
| Play fetch | "Throw ball" in the menu. Drag the ball to carry it and fling it; a click pops it up |
| Feed | "Feed the …" in the menu. Fish for the cat, bone for the dog, carrot for the bunny |
| Mute / unmute the chatter | "Mute the chatter" in the paw menu (remembered) |
| Hide / show | Paw menu |

Dev shortcuts (not in production): **B** throws a ball, **F** feeds.

### Ball and food

- Both vanish 30 seconds after they were last thrown (a fresh throw restarts the clock) and blink for the last 2 seconds. While the ball exists the pet keeps playing with it.
- Food comes before the ball, and the ball comes before the cursor. A treat drops just in front of the pet, on the platform it's standing on, so it can always be reached. It is eaten bite by bite; an interrupted meal is finished later.

### Speech bubbles and the page

The pet talks in small bubbles over its head: mostly sounds and single words, in each species' voice (the cat is dry, the dog excitable, the bunny shy). All the copy is in `speech.ts`.

- **Moments** (engine): pat, picked up, tumbling, noticing or being startled by the cursor, the ball arriving or vanishing, the dog bringing it back, eating, napping, and now and then an idle remark. Ambient lines hold back for a few seconds after any line, so it never turns into a stream.
- **The page** (`Pet.tsx` decides, `speech.ts` words it): it comments once on an element it has stood on for a couple of seconds (a heading, photo, sidebar or footer, sometimes quoting the heading), at most every 14 s; it has a line for each route after navigating, and for the theme toggle; it greets an odd hour once per visit.
- Bubbles are `aria-hidden` like the pet, are never shown under `prefers-reduced-motion` (the pet is asleep), and can be muted from the paw menu.

### Personalities

Same engine, different `TRAITS` in `engine.ts`:

| | Walk speed | Jump reach | Ball | Cursor |
| --- | --- | --- | --- | --- |
| Cat | slow | high | Swats it away, watches, goes again | Stalks, pounces when the cursor stops, bats at it up close; only notices ~60% of the time |
| Dog | fast | low | Carries it to the cursor and waits for a throw (tosses it itself if ignored) | Runs over and wags |
| Bunny | medium | medium | Nudges it along, zooms between rounds | Hops over and keeps a polite distance; bolts if the cursor rushes in |

A pet only notices the cursor within `SENSE` (3 sprite widths), and follows it out to 1.5× that once interested. Touch screens have no hovering cursor, so they're left out.

It is always doing something: walking, jumping, sitting, stretching, glancing about, shaking off. There is no deep sleep unless the visitor has `prefers-reduced-motion` set, in which case the pet is simply asleep on the floor and does not move.

## How it's put together

```
PetMount.tsx     reads preferences, lazy-loads Pet (next/dynamic, ssr:false)
Pet.tsx          DOM glue: rAF loop, transform writes, canvases, events
gestures.ts      pat, drag and throw for the pet and the ball; cursor tracking
surfaces.ts      finds the page elements the pet can stand on, caches their geometry
engine.ts        the brain and physics, plain TypeScript with no DOM
ball.ts          Ball class, used for both the ball and the food
physics.ts       gravity, fall(), landing(), Surface
PawMenu.tsx      the sidebar button and popover
PawPanel.tsx     the panel: previews, coats, actions (lazy-loaded)
preferences.ts   localStorage-backed store (useSyncExternalStore): species, coat, on/off, talk
events.ts        window events from the menu to the pet
speech.ts        what the pet says, per species, moment and page
draw.ts          drawFrame() and crispScale()
PetLab.tsx       dev-only review page at /pet-lab
sprites/         art as text grids (see below)
```

### Engine and DOM split

`PetEngine` never touches the DOM. Each frame `Pet.tsx` gives it the **surfaces** currently on screen (`{ el, left, right, top }` for each platform, plus the viewport floor) and the engine moves the pet, returning a `Pose` (frame name, lift, squash and stretch, facing) from `frame()`. Because it's pure, it can be simulated in Node at 60 steps per second with a fake page. That is how the behaviour was tuned: a browser tab in the background doesn't run `requestAnimationFrame`.

Coordinates are viewport pixels; `y` is the pet's **feet**.

Rendering writes `style.transform` directly with no React re-render per frame. The loop pauses when the tab is hidden. Canvases are tiny (16×16 for the pet) and scaled up by CSS with `image-rendering: pixelated`; `crispScale` keeps every sprite pixel a whole number of device pixels. Scale is 3× on desktop and 2× on mobile.

### Platforms

`PLATFORMS` in `surfaces.ts` is a CSS selector list (the sidebar, nav, `main h1`, `main h2`, `main img`, `main figure`, `main > footer`, and so on). Opt an element **in** with `data-pet-platform`, or **out** (with everything inside it) with `data-pet-ignore`. Anything narrower than 1.5 pet widths is skipped. The list is re-queried every 500 ms and re-measured after scroll or resize so route changes and new content are picked up.

### Movement

Walk, fall and jump; there is no climbing. Jumps use a parabola aimed a little above the target edge. Walking off a ledge sets a `leaving` flag so the pet keeps walking until its centre is past the edge. When its platform scrolls away upward, it loses its footing and tumbles; scrolled below the floor, it just stands on the floor.

## Sprites

Each frame is **16 rows of 16 characters**, one character per pixel:

- `.` is transparent. Any other character is a key into the variant's palette.
- **Fills only**: the outline is added automatically (`sprites/outline.ts`, 4-neighbours). A hand-placed `o` is an interior line.
- **Uppercase characters** are a "behind" layer (far-side legs): they cast no outline.
- `z` is closed eyes (always dark). Frames face right; facing left is a flip at draw time.
- Each coat is a `Variant` with its colours and a per-theme outline colour (`paletteFor(variant, theme)`), so light and dark mode never touch the frames.

Animations are named lists of frames with an fps, in `sprites/index.ts` (`ANIMATIONS`): the shared set (idle, sit, walk, jump, sleep, held, happy, eat) plus each species' ball move (cat `swat`, dog `carry`, bunny `nudge`). The ball and the three treats are in `sprites/ball.ts` and `sprites/food.ts`.

### Editing the art

1. Edit the grid in `sprites/<species>.ts`.
2. `node --no-warnings scripts/pet-sheet.mjs <species> out.png [variant]` validates the grids (sizes, unknown characters) and renders a contact sheet at 10×, at real size, and as an onion-skin of each animation.
3. Or run the dev server and open `/pet-lab`, which shows every animation in both themes with a scale slider, a face-left toggle and a coat picker. It returns 404 in production.

## Testing

There is no automated test runner. The checks used so far:

- `npx tsc --noEmit`.
- Node simulations of `PetEngine` against a fake page (with a small TypeScript loader). They check that each species reaches the ball and keeps playing until it vanishes, finishes a meal, and reacts to the cursor only when close.
- Headless Chromium with Playwright for the real thing: feeding from the paw menu, dragging the ball, cursor proximity, no console errors.

## Known gaps

- The mobile nav bar now has seven buttons and may overflow on 360px-wide phones. Untested.
- Art polish still open: the jump pose and a landing squash on the sprite itself.
