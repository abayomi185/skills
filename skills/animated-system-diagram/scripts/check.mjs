// Self-check for a generated diagram page.
// Steps every scenario to the end in every lane variant, then reports outcomes,
// console errors and page width at phone size, and writes screenshots.
//
// Usage: node check.mjs <page.html> <screenshot-dir>
// Needs the `playwright` package: copy this file into a scratch dir, `npm i playwright` there, run it there.
// Set CHROME=/path/to/chrome-or-headless_shell if Playwright's own browser is not installed.
import { chromium } from "playwright";
import { resolve } from "node:path";
const [file, out] = process.argv.slice(2);
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const p = await b.newPage({ viewport: { width: 1360, height: 1000 }, deviceScaleFactor: 1.5 });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("file://" + resolve(file));
await p.waitForTimeout(600);
await p.screenshot({ path: `${out}/rest.png` });
const toEnd = async () => {
  if ((await p.textContent("#b-play")).includes("Pause")) await p.click("#b-play");
  const T = (await p.textContent("#prog")).split("/")[1].trim();
  for (let i = 0; i < 400 && !(await p.textContent("#prog")).startsWith(`step ${T} `); i++) await p.click("#b-step");
};
const scen = await p.$$("#scen button");
for (let i = 0; i < Math.max(1, scen.length); i++) {
  if (scen.length) await p.click(`#scen button[data-i="${i}"]`);
  await toEnd();
  const outs = await p.$$eval(".out .big", (e) => e.map((x) => x.textContent));
  const ctr = await p.$$eval(".counters", (e) => e.map((x) => x.innerText.replace(/\s+/g, " ")));
  console.log(`scenario ${i}:`, JSON.stringify(outs), JSON.stringify(ctr));
  for (const [lane, v] of await p.$$eval("[data-v][aria-pressed=false]", (e) => e.map((x) => [x.dataset.lane, x.dataset.v]))) {
    await p.click(`[data-lane="${lane}"][data-v="${v}"]`);
    await toEnd();
    console.log(`  variant ${v}:`, JSON.stringify(await p.$$eval(".out .big", (e) => e.map((x) => x.textContent))));
  }
  // Exercise every scenario input: each select option, each segmented button, each toggle state.
  const outsNow = () => p.$$eval(".out .big", (e) => JSON.stringify(e.map((x) => x.textContent)));
  for (const sel of await p.$$eval("#inputs select[data-inp]", (e) => e.map((x) => [x.id, [...x.options].map((o) => o.value)]))) {
    for (const v of sel[1]) { await p.selectOption(`#${sel[0]}`, v); await toEnd(); console.log(`  input ${sel[0]}=${v}:`, await outsNow()); }
  }
  for (const [id, vals] of await p.$$eval("#inputs .segi", (e) => e.map((g) => [g.querySelector("button").dataset.inp, [...g.querySelectorAll("button")].map((b) => b.dataset.val)]))) {
    for (const v of vals) { await p.click(`#inputs button[data-inp="${id}"][data-val="${v}"]`); await toEnd(); console.log(`  input ${id}=${v}:`, await outsNow()); }
  }
  for (const id of await p.$$eval("#inputs input[type=checkbox]", (e) => e.map((x) => x.id))) {
    for (let k = 0; k < 2; k++) { await p.click(`#${id}`); await toEnd(); console.log(`  input ${id}=${await p.isChecked(`#${id}`)}:`, await outsNow()); }
  }
}
// Inspect: open a component panel and a request panel in each lane, then close with Escape.
// Use the first scenario that has inspectable components, if any.
for (let i = 0; i < Math.max(1, scen.length); i++) {
  if (scen.length) await p.click(`#scen button[data-i="${i}"]`);
  await toEnd();
  if (await p.$(".box.can")) break;
}
for (const lane of await p.$$eval(".lane", (e) => e.map((x) => x.id))) {
  const comp = await p.$(`#${lane} .box.can`);
  if (comp) {
    await comp.click();
    const txt = await p.textContent(`#${lane} [data-insp]`);
    console.log(`inspect ${lane} component: ${txt.trim().slice(0, 60).replace(/\s+/g, " ")}…`);
    if (await p.isHidden(`#${lane} [data-insp]`)) errs.push(`inspect panel did not open in ${lane}`);
  }
  await p.click(`#${lane} .trail button`);
  if (!(await p.textContent(`#${lane} [data-insp]`)).includes("Request") && !(await p.textContent(`#${lane} [data-insp]`)).includes("filter")) errs.push(`trail inspect empty in ${lane}`);
}
await p.screenshot({ path: `${out}/inspect.png`, fullPage: true });
await p.keyboard.press("Escape");
if ((await p.$$eval("[data-insp]", (e) => e.filter((x) => !x.hidden).length)) > 0) errs.push("Escape did not close inspect panels");
if (scen.length) await p.click('#scen button[data-i="0"]'); else await p.click("#b-replay");
await p.waitForTimeout(950 * 4 + 300);
await p.screenshot({ path: `${out}/mid.png` });
const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
await m.goto("file://" + resolve(file));
await m.waitForTimeout(400);
const w = await m.evaluate(() => document.documentElement.scrollWidth);
await m.screenshot({ path: `${out}/phone.png`, fullPage: true });
console.log(`phone scrollWidth: ${w} ${w > 390 ? "(OVERFLOW)" : "(ok)"}`);
console.log(`errors: ${errs.length ? JSON.stringify(errs) : "none"}`);
await b.close();
process.exit(errs.length || w > 390 ? 1 : 0);
