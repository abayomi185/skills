---
name: animated-system-diagram
description: Build an animated, ByteByteGo-style system diagram page that walks a team through request flows and compares designs side by side (today vs a proposal, option A vs B). Numbered request packets travel between pastel component boxes, responses travel back, and each lane ends in a green, amber or red outcome. Use when the user wants to explain or compare architectures, request flows, data models or API designs to a team, or asks for "an animation", "a ByteByteGo-style diagram", or "something to show the team" about how a system behaves. Produces one self-contained HTML file.
---

# Animated System Diagram

Make a single HTML page where people pick a scenario, press play, and watch requests move through each design. The diagram carries the argument; text stays short.

## Workflow

1. **Find the story.** Name the components (usually a client, one server, one to three stores or services), the designs to compare (one lane each, and a lane can toggle between variants), and three to six scenarios that show real differences. Read the code or docs you need to get routes, collection names and failure modes right. Each scenario should end in an outcome a person can judge at a glance.
2. **Write the data file** (`const DIAGRAM = {...};`, format below). Write only data; the engine is in `assets/template.html`. For a full worked example, read `references/cache-example.js` (three scenarios, two lanes, a variant toggle, notes, a client filter, a repeated call, a guarantees table, and an "update" scenario with a toggle, a TTL picker and inspectable state).
3. **Build:** `python3 scripts/fill.py data.js <out>/YYYY-MM-DD-<slug>.html`. Put the file where the user asked; otherwise in the working directory root, uncommitted. Always start the filename with today's date.
4. **Check** (required before reporting): copy `scripts/check.mjs` into a scratch dir that has `playwright` installed (`npm i playwright`), then run `node check.mjs <page.html> <shots-dir>`. If Playwright's browser is missing, set `CHROME` to a cached `headless_shell` or Chromium binary (look under `~/.cache/ms-playwright/`). It steps every scenario, variant and input value to the end and prints each lane's outcome and counters. It also opens a component panel and a request panel in each lane and closes them with Escape. It fails on console errors, on an inspect panel that doesn't open or close, and on sideways scroll at 390px. Read `mid.png`, `inspect.png` and `phone.png` and fix anything that overlaps or clips. Don't report until it exits 0.
5. **Publish (optional):** for a claude.ai Artifact, run `python3 scripts/to_artifact.py page.html artifact.html` (it strips the doctype/html/head/body wrapper) and publish `artifact.html`. The page is a deliberate single light look; say so if asked about dark mode.

## Visual language (already built into the template; keep it)

- White canvas, rounded pastel boxes. Each component keeps one colour everywhere. Poppins headings, Inter body, JetBrains Mono for packets and paths.
- Thin grey connectors with arrowheads, two parallel lines per pair (request out, response back). The active edge turns dark.
- Each request is a pill with a numbered badge. It travels client → server, then server → each `via` component and back, then server → client. Requests are dark. Responses are white, or coloured when they carry a verdict: amber for 4xx, red for 5xx or `tone: "bad"`, green for `tone: "good"`.
- A yellow "client filter" box under the client lights up for client-side work. Yellow sticky notes appear where a design silently misses something.
- Each lane has counters (requests and client-side filters), an outcome chip at the end (`good`, `warn` or `bad`), and a numbered trail of full request paths.
- Controls: scenario picker (starts playing), Play/Pause, Step, Replay and a step counter. Lanes advance together, so a shorter design visibly finishes first. With `prefers-reduced-motion`, packets appear mid-edge without travelling.
- Scenario inputs sit under the scenario title. Components with state show a small "i" badge, and the trail items are buttons. Both open an inspect panel under the diagram (see Interaction).
- The page loads at the finished state, so thumbnails and skimmers see the outcomes. A summary card follows: an outcome per scenario and design, optional ✓/✕/~ guarantees (`"y"`, `"n"`, `"p"`, or any short text), and optional closing HTML.

## Data format

```js
const DIAGRAM = {
  title: "Short Name",              // <title>, 2–4 words
  eyebrow: "Team · date", heading: "Page headline", lede: "One or two sentences.",
  components: {                     // order matters: first = client, second = server (override with client:/server:)
    client: { title: "Web app", sub: "browser", icon: "globe", color: "violet", box: [8, 112, 124, 84] },
    api:    { title: "Orders API", sub: "/orders", icon: "api", color: "blue", box: [236, 112, 124, 84] },
    db:     { title: "Postgres", sub: "orders", icon: "db", color: "green", box: [456, 18, 136, 88] },
    queue:  { title: "Queue", sub: "order-events", icon: "queue", color: "orange", box: [456, 202, 136, 88] },
  },
  filterAt: "client",               // component to hang the client-filter box under, or null
  lanes: [{ variants: ["today"] }, { variants: ["optA", "optB"] }],   // 2 lanes; >1 variant gives a toggle
  variants: { today: { kicker: "Today", title: "Polling", short: "Today", subs: { db: "orders · status" } }, ... },
  scenarios: [{
    id: "status", tag: "Read", title: "Show the status of order 1042", desc: "One sentence of context.",
    components: { client: { title: "Support agent", icon: "person" } },  // optional per-scenario overrides
    inputs: [                        // optional; shown above the lanes, changing one re-runs the scenario
      { id: "mode", type: "select", label: "Client uses", options: [{ value: "poll", label: "Polling" }, { value: "push", label: "Webhooks" }], default: "poll" },
      { id: "retry", type: "toggle", label: "Retry on 503", default: false },
      { id: "page", type: "segmented", label: "Page size", options: [10, 50], default: 50 },
    ],
    runs: {
      optB: ({ mode, retry, page }) => ({ steps: [...], out: [...] }),   // any run may be a function of the input values
      today: {
        start: "meta.json → …",     // optional starting-point line
        data: { db: { orders: [{ id: 1042, status: "packed" }] } },   // optional component state for inspect panels
        steps: [
          req("GET /orders", "GET /orders?customer=77", "40 orders", { via: [["db", "SELECT", "40 rows"]], resBody: [{ id: 1042 }, "… 39 more"] }),
          req("PATCH /orders/1042", "PATCH /orders/1042", "200", { via: [["db", "UPDATE", "ok"]], body: { status: "shipped" },
            set: { db: { orders: [{ id: 1042, status: "shipped", _new: true }] } } }),
          filter("find 1042 → 1 of 40"),
          req("GET …/1042/events ×3", "GET /orders/1042/events, polled 3 times", "no change", { x: 3, via: [["db", "SELECT", "0 new"]] }),
          note("api", "No push.\nClient must poll."),
        ],
        out: ["warn", "2 matches?", "One or two sentences on why."],
      },
      optA: { steps: [...], out: ["good", "One call", "..."] },
    },
  }],
  summary: { columns: ["today", "optA", "optB"], guarantees: { rows: [["Label", "n", "y", "p"], ["Size", "–", "Small", "Large"]] }, closing: "<h3>…</h3><p>…</p>" },
  footer: "Mock for discussion.",
  hopMs: 950,                       // optional speed
};
```

- `req(label, full, res, opts)`: `label` is the short packet text (keep it under about 28 characters), `full` goes in the trail. Options: `via: [[component, outLabel, backLabel], ...]` for backend hops in order, `x: n` for a call repeated n times (counted n times, shown once), `tone: "good" | "warn" | "bad"` for the response, and `from`/`to` to route between other components.
- More `req` options for inspection: `body` and `resBody` (any JSON or string) appear when someone clicks the trail item or the packet, and `set: { componentId: { tableName: rows } }` updates component state once the step starts. Any step type can carry `set`.
- `filter(text, { tone })`: client-side work. `note(componentId | [x, y, w], "line1\nline2")`: a sticky note above the component, or below it if there's no room.
- The viewBox is 600×300. The default layout puts the client and server in the middle row and up to two stores stacked on the right at x 456. Keep boxes inside the viewBox and leave about 80px under `filterAt` for the filter box.
- Icons: `bot person plug api db bucket queue server cache globe lock file`. Colours: `violet blue green orange pink teal slate yellow`. Yellow is reserved for filters and notes.

## Interaction

Use interaction to let people ask "what if" without leaving the diagram. Keep it to what changes the outcome.

- **Inputs** (`scenario.inputs`): `select`, `toggle` or `segmented`. Write a run as a function of the values when an input changes its steps or outcome; leave other runs as plain objects. Changing an input replays the scenario, or jumps straight to the result under `prefers-reduced-motion`. The summary table uses the default values, so pick defaults that tell the main story.
- **Component state** (`variants[v].data`, `run.data`, step `set`): the panel shows tables built from the merged state at the current step. Each value is either an array of rows or a string. Mark changed rows with `_new: true` to highlight them; keys starting with `_` are hidden. Keep it to a handful of rows that make the point, plus a `"… N more"` row if needed.
- **Request detail** (`body`, `resBody`): show the payload that matters, such as an error message or the field that changed. Leave it out where the label says enough.
- Everything is keyboard accessible: inputs are native controls, components are focusable buttons (Enter or Space), trail items are buttons, and Escape closes the panels. The page still loads at its finished state.

## Writing rules

- Plain, classic prose with no hype. Labels are a few words; the diagram does the explaining.
- Be honest in outcomes: if the cheaper option gets most of the benefit, say so in its outcome and in the closing note.
- Use real routes, collection names and data shapes from the system. Mark anything invented as illustrative in the footer.
