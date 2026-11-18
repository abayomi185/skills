---
name: design-proposal
description: Write a short design proposal or decision doc (often a Confluence page) that a team can read in three minutes, with diagrams doing most of the explaining. Use when the user asks for a proposal, design doc, options paper or RFC, or asks to trim or tighten an existing one.
---

# Design Proposal

A proposal exists to get a decision. Readers skim, so every section earns its place by helping them decide. Diagrams carry the explanation; the prose only says what they can't.

## Before writing

A proposal starts from the driver's own idea, never one Claude made up. Before creating or publishing anything, play back the problem, the options and the recommendation in a few lines, and wait for the driver to confirm that's what they mean.

## Format

If the team has its own proposal template, follow its headings and process, and apply the limits and writing rules here on top. Otherwise use these sections in this order. Leave out a section only when it would be empty.

| Section | Limit |
|---|---|
| Header line | Ticket links · Author · Date. Add a Decided or Superseded status only once it closes |
| AI-assisted note | A blockquote, "Drafted with AI assistance, reviewed and edited by a human", if Claude drafted it |
| **Decision needed** | 1–2 sentences: what we're choosing between and why now |
| **Context** | Up to 3 bullets. Link to earlier pages and tickets instead of restating them |
| **Diagrams** | As many as help, each with a one-line caption (see Diagrams) |
| **Options** | One table, up to 3 rows: option, what it is, for, against. One line per cell |
| **Recommendation** | One short paragraph. Name the option and the deciding reason |
| **Open questions** | Up to 5 bullets, each with a proposed answer |
| **Decision** | An empty paragraph for the team to fill in |

**Budget:** about 400 words outside tables and captions. Count before publishing. Anything over the limit goes in a collapsed expand at the end ("Details"), or on its own page that this one links to.

## Writing rules

- Lead with the decision, not the history. Background belongs in links.
- One idea per bullet, one line per table cell. No sub-bullets.
- Cut what the reader can't act on: "as discussed", recaps of meetings, restated requirements, hedges, and phrases like "it's worth noting".
- Say what's unverified in a few words ("estimate not checked with the team"). Don't explain why at length.
- Use real names from the code and docs: routes, collections, templates, fields. Check them on the latest main branch before writing; designs drift.
- Prefer existing patterns in the codebase. If an option introduces a new pattern, say so in its "against" cell.
- Before publishing, read the draft once purely to cut. Remove anything that doesn't change the decision.

## Diagrams

Use as many diagrams as help, and no more. Start with the picture that shows the difference between the options, usually the request path or the data model before and after. Add others only when they explain something the first can't, such as a publishing flow or an audit trail. Diagrams don't count towards the word budget.

**Static diagram (default).** Build an Excalidraw scene with `scripts/excalidraw.py`, then render it with `scripts/render.py` (usage in each file's header). Read the PNG before publishing and fix overlaps or text that clips its box. Embed each PNG and attach its `.excalidraw` source, so the team can edit it at excalidraw.com.

**Walkthrough.** If the argument depends on steps or several scenarios, use the `animated-system-diagram` skill. Link the page from the proposal and embed one static frame or diagram.

## Confluence

- Create the page under the parent the user names, or next to related proposals. Use HTML, not Markdown, so tables, status lozenges and smart links work.
- Images: create the page first, upload each PNG and `.excalidraw` file as an attachment, then update the page with media nodes that use the returned file IDs.
- Revising a page: fetch it as HTML first. Keep inline comments, mentions and anything the user added. If the change reverses an earlier draft, add a one-line note at the top saying what changed and why.

## Trimming an existing proposal

1. Fetch the page and count its words outside tables.
2. Map each part onto the format above, or onto the team's own template if it has one. Merge or cut whatever doesn't fit.
3. Move long comparisons and reference material into a "Details" expand, or link to the page they came from.
4. Keep the decision, the options, the diagrams, anything the team has commented on, and any decision already recorded.
5. Add a version message saying it was shortened.
