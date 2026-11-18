const DIAGRAM = {
  title: "Profile Cache Options",
  eyebrow: "Design discussion · example",
  heading: "Reading user profiles: straight from Postgres or through a cache",
  lede: "Pick a task and press play. Both lanes run the same task. The left lane reads Postgres directly. The right lane adds Redis, as cache-aside or write-through. All numbers are illustrative.",
  components: {
    client: { title: "Web app", sub: "browser", icon: "globe", color: "violet", box: [8, 112, 124, 84] },
    api: { title: "Profile API", sub: "/profiles", icon: "api", color: "blue", box: [236, 112, 124, 84] },
    cache: { title: "Redis", sub: "profile:{id}", icon: "cache", color: "pink", box: [456, 18, 136, 88] },
    db: { title: "Postgres", sub: "users", icon: "db", color: "green", box: [456, 202, 136, 88] },
  },
  filterAt: "client",
  lanes: [{ variants: ["direct"] }, { variants: ["aside", "through"] }],
  variants: {
    direct: { kicker: "Today", title: "Direct to Postgres", short: "Direct", subs: { cache: "unused" } },
    aside: { kicker: "Option A", title: "Cache-aside", short: "Cache-aside" },
    through: { kicker: "Option B", title: "Write-through", short: "Write-through" },
  },
  scenarios: [
    {
      id: "warm", tag: "Read", title: "Read profile 42 twice", desc: "The same profile is read twice, a second apart. This is the most common request.",
      runs: {
        direct: {
          steps: [
            req("GET /profiles/42", "GET /profiles/42", "200", { via: [["db", "SELECT", "1 row"]] }),
            req("GET /profiles/42", "GET /profiles/42  (again)", "200", { via: [["db", "SELECT", "1 row"]] }),
            note("db", "Same query again.\nLoad grows with reads."),
          ],
          out: ["warn", "2 queries", "Every read reaches Postgres. Fine at low traffic; hot profiles become hot rows."],
        },
        aside: {
          steps: [
            req("GET /profiles/42", "GET /profiles/42", "200", { via: [["cache", "GET", "miss"], ["db", "SELECT", "1 row"], ["cache", "SET ttl 300", "ok"]] }),
            req("GET /profiles/42", "GET /profiles/42  (again)", "200", { via: [["cache", "GET", "hit"]], tone: "good" }),
          ],
          out: ["good", "1 query", "The first read fills the cache. The second never touches Postgres."],
        },
        through: {
          steps: [
            req("GET /profiles/42", "GET /profiles/42", "200", { via: [["cache", "GET", "hit"]], tone: "good" }),
            req("GET /profiles/42", "GET /profiles/42  (again)", "200", { via: [["cache", "GET", "hit"]], tone: "good" }),
          ],
          out: ["good", "0 queries", "Writes already filled the cache, so both reads are hits."],
        },
      },
    },
    {
      id: "update", tag: "Write", title: "Update a name, then read it back",
      desc: "A user renames themselves from Ada to Ada L. and the page reloads straight away. Click Redis or Postgres to see what each holds.",
      // Inputs re-run the scenario. Runs written as functions receive the current values.
      inputs: [
        { id: "del", type: "toggle", label: "Cache-aside deletes the key on write", default: false },
        { id: "ttl", type: "segmented", label: "TTL", options: [{ value: 5, label: "5 s" }, { value: 300, label: "300 s" }], default: 300 },
      ],
      runs: {
        direct: {
          data: { db: { users: [{ id: 42, name: "Ada" }] } },
          steps: [
            req("PATCH /profiles/42", "PATCH /profiles/42", "200", { via: [["db", "UPDATE", "ok"]], body: { name: "Ada L." }, resBody: { id: 42, name: "Ada L." }, set: { db: { users: [{ id: 42, name: "Ada L.", _new: true }] } } }),
            req("GET /profiles/42", "GET /profiles/42", "200 new name", { via: [["db", "SELECT", "1 row"]], tone: "good", resBody: { id: 42, name: "Ada L." } }),
          ],
          out: ["good", "Fresh", "There is only one copy of the data, so the read sees the write."],
        },
        aside: ({ del, ttl }) => ({
          data: { db: { users: [{ id: 42, name: "Ada" }] }, cache: { keys: [{ key: "profile:42", value: "Ada", ttl: `${ttl} s` }] } },
          steps: [
            req("PATCH /profiles/42", "PATCH /profiles/42", "200", {
              via: del ? [["db", "UPDATE", "ok"], ["cache", "DEL profile:42", "ok"]] : [["db", "UPDATE", "ok"]],
              body: { name: "Ada L." }, resBody: { id: 42, name: "Ada L." },
              set: { db: { users: [{ id: 42, name: "Ada L.", _new: true }] }, ...(del ? { cache: { keys: [] } } : {}) },
            }),
            ...(del ? [] : [note("cache", `Old name cached\nfor up to ${ttl} s`)]),
            del
              ? req("GET /profiles/42", "GET /profiles/42", "200 new name", { via: [["cache", "GET", "miss"], ["db", "SELECT", "1 row"], ["cache", `SET ttl ${ttl}`, "ok"]], tone: "good", resBody: { id: 42, name: "Ada L." }, set: { cache: { keys: [{ key: "profile:42", value: "Ada L.", ttl: `${ttl} s`, _new: true }] } } })
              : req("GET /profiles/42", "GET /profiles/42", "200 old name", { via: [["cache", "GET", "hit (stale)"]], tone: "bad", resBody: { id: 42, name: "Ada" } }),
          ],
          out: del ? ["good", "Fresh", "Deleting the key on write forces the next read to refill from Postgres."]
            : ttl <= 5 ? ["warn", "Stale for 5 s", "A short TTL limits the damage, but more reads reach Postgres."]
            : ["bad", "Stale read", `The update skipped Redis, so the user sees their old name for up to ${ttl} s. Turn on "deletes the key on write" to fix it.`],
        }),
        through: {
          data: { db: { users: [{ id: 42, name: "Ada" }] }, cache: { keys: [{ key: "profile:42", value: "Ada" }] } },
          steps: [
            req("PATCH /profiles/42", "PATCH /profiles/42", "200", { via: [["db", "UPDATE", "ok"], ["cache", "SET", "ok"]], body: { name: "Ada L." }, set: { db: { users: [{ id: 42, name: "Ada L.", _new: true }] }, cache: { keys: [{ key: "profile:42", value: "Ada L.", _new: true }] } } }),
            req("GET /profiles/42", "GET /profiles/42", "200 new name", { via: [["cache", "GET", "hit"]], tone: "good", resBody: { id: 42, name: "Ada L." } }),
          ],
          out: ["good", "Fresh", "Every write updates both stores, at the cost of a slower write."],
        },
      },
    },
    {
      id: "list", tag: "Page", title: "Load a team page with 20 profiles", desc: "The team page shows 20 members. The API has no batch route, so the browser fetches each one.",
      runs: {
        direct: {
          steps: [
            req("GET /profiles/{id} ×20", "GET /profiles/{id}, once per member", "20 × 200", { via: [["db", "SELECT", "1 row"]], x: 20 }),
            filter("merge + sort 20 profiles"),
          ],
          out: ["warn", "20 queries", "Works, but every page view costs 20 queries and 20 round trips."],
        },
        aside: {
          steps: [
            req("GET /profiles/{id} ×20", "GET /profiles/{id}, once per member", "20 × 200", { via: [["cache", "GET", "18 hit, 2 miss"], ["db", "SELECT ×2", "2 rows"]], x: 20 }),
            filter("merge + sort 20 profiles"),
          ],
          out: ["warn", "2 queries", "The cache absorbs most reads, but the browser still makes 20 calls. A batch route would help either design."],
        },
        through: {
          steps: [
            req("GET /profiles/{id} ×20", "GET /profiles/{id}, once per member", "20 × 200", { via: [["cache", "GET", "20 hit"]], x: 20, tone: "good" }),
            filter("merge + sort 20 profiles"),
          ],
          out: ["warn", "0 queries", "No database load, but still 20 round trips from the browser."],
        },
      },
    },
  ],
  summary: {
    columns: ["direct", "aside", "through"],
    guarantees: {
      rows: [
        ["Read sees the latest write", "y", "n", "y"],
        ["Postgres load on hot profiles", "High", "Low", "Low"],
        ["Write latency", "Low", "Low", "Higher"],
        ["Moving parts", "1 store", "2 stores", "2 stores"],
      ],
    },
    closing: "<h3>Takeaway</h3><p>Cache-aside is the smaller change and removes most read load, but it needs invalidation on write to avoid stale reads. Write-through keeps reads fresh at the cost of slower writes. Neither fixes the 20-call team page; that needs a batch route.</p>",
  },
  footer: "Illustrative example for the animated-system-diagram skill. Numbers are made up.",
};
