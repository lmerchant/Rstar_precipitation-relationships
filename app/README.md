# R* categorization viewer

A static site titled "R* Scores" for reading the R* categorizations of each dataset and choosing its scores. It has a landing page with
the dataset's R* score (total, four category scores and a "Score details" panel), a key to the tags and scoring, and
the four categories, and one page per category. On a category page, each subcategory card shows its description,
"What counts as evidence" text, why the research evidence gives the score it does, "Your score" radio buttons
(starting on the research score) and status, and opens to show the evidence sorted into it. A panel beside the category description lists each
subcategory's chosen score and the category total. A score graph page draws the dataset's R* scores as a weighted
network graph.

## Score graph (`graph.html`)

A weighted network graph of one dataset's chosen scores (the same scores as the landing page, so it changes as scores
are chosen). Reached from "Score graph" in the header or "See the score graph →" in the landing page's score panel.
The drawing code is `assets/graph.js`; `app.js` passes it its helpers.

- **Nodes:** R* in the middle (black while it is NA, red once every subcategory has a score); the four category nodes (P, D, DIRS, RRS), each in its own colour (blue, orange, aqua,
  violet; blue and violet sit opposite each other because they are the hardest pair to tell apart); and each
  category's subcategory nodes, smaller and in the same colour. Each node shows its ID and score.
- **Lines:** width carries the score. A subcategory line is score ÷ 5 (35 is 7 px). A category line is its weighted
  share of R* ÷ 4 (chosen 2026-11-24), so the most each can draw is D 40 → 10 px, P 30 → 7.5 px, RRS 20 → 5 px and
  DIRS 10 → 2.5 px; RRS's share is 0.20 × (100 − total). Each category node shows its total and what it adds to R*.
  A 0 is a 1 px line. **NA is a black node with a dashed line** (its ring keeps the category colour).
- **Repository resilience:** a switch above the graph draws the RRS subcategory lines as the risk they add (points −
  score, the default, matching how RRS enters R* as 100 − total, so a resilient repository is a thin line) or as the
  score. The RRS line to R* is always its share of R*.
- **Details:** hovering or focusing a node shows its title, score, the web evidence reason and evidence count;
  selecting a subcategory node opens its card, and a category node its page. "The graph as a table" lists every node,
  its score, the line drawn and its evidence counts, for screen readers and for checking the numbers.
- **Evidence nodes:** the "Show evidence nodes" switch (off by default; `graph.html?dataset=ghcn-daily&evidence=on`
  opens with it on) adds one small node per evidence item, in a fan on the outer side of its subcategory node, joined
  to it by a thin grey line. Shape shows the stance (circle for "for", diamond for "against", small grey ring for
  context); filled means it sets the score (high or moderate confidence), outline only means low confidence. Hovering
  a dot shows its stance, confidence, repository and the start of its text; clicking it opens its card. Hovering or
  focusing a subcategory node dims the other dots. The dots are not tab stops and are hidden from screen readers;
  the table's Evidence column gives the counts. They are read from the category JSON in the browser, so
  `build_data.py` doesn't change. Plan: `notes/score-graph-evidence-nodes-plan.md`.
- Below 660 px wide the graph keeps a readable size and scrolls sideways.

## Chosen scores

Each card's "Your score" radios offer full points, 0 or NA, and start on the research score. A choice updates the
category panel at once, and the landing page's category totals, R* and "Score details" (which shows only the chosen
scores; the web evidence score and its reason are on the category page cards). Above the radios, each card states the score the web evidence implies and why, for example
"Both “for” and “against” web evidence (high or moderate): score = NA". "Reset scores" in a category's panel clears only that category's choices. The landing page's "Reset scores",
next to "Score details", clears every category's choices for the dataset after asking. Neither clears notes.

On the site (GitHub Pages or any address), each person's browser keeps its own choices: a first visit starts from the
web evidence scores, and a returning person sees the choices they left until they click "Reset scores" (decided
2026-11-23).

Each card also has a **Your notes** box for inside knowledge or reasons for the score.

Choices are kept in the browser's `localStorage` until saved to a file: `rstar-chosen-scores-v1`
(`{"<dataset id>": {"P-1": 35, "P-2": 0, "P-3": "NA"}}`; only chosen subcategories), `rstar-notes-v1` (notes, same
shape), `rstar-assessor-v1` (name, email, role) and `rstar-last-save-v1` (the last file saved per dataset). They stay
in that browser and on that address (a page opened from disk keeps its own set).

## Saving scores to a file

The landing page's **Save your scores** panel takes the scorer's name (required), email and role (expert, workshop
participant or workshop group), and **Save scores to a file** downloads one JSON file, for example
`ghcn-daily_rstar_jane-smith_2026-11-23T232937Z.json`. Each save is a new file. The panel shows a note when NA values
are included and says when there are changes since the last save.

The file uses the format of a colleague's R* form (`docs/json_output/example_rstar_json.json`) plus an `assessor`
block. NA is saved as `null`; notes go in each category's `justification` (`P-1: ...`); `scoringMethod` is `""`.
`build_data.py` copies the example's `formula` and `framework` blocks into the data, and passes each dataset's DOI (or
a data endpoint URL) as the identifier. The schema is `schema/rstar-assessment.schema.json`; the changes from the
colleague's form are listed in `notes/rstar-json-format-changes.md`.

Scores come from `data-score` on each subcategory's div in the category JSON (written by
`scripts/categorize/rstar_common.py`); `scripts/build_data.py` adds the category totals and R*. A total is NA if any
of its subcategories is NA, and R* is NA if any total is.

The design plan is in [`notes/app-categorization-viewer-plan.md`](../notes/app-categorization-viewer-plan.md).

## View it

From the project folder, start a local server:

```bash
cd /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/app && python3 -m http.server 3000 --bind 127.0.0.1
```

Then open http://127.0.0.1:3000/

You can also open `app/index.html` straight from disk. The data is loaded with a `<script>` tag, not
`fetch()`, so it works without a server.

## Update the data

The pages read `data/rstar-data.js`, which is generated. Re-run the build after changing any of:

- `rstar_definitions/*.md` (titles, descriptions, "What counts as evidence" text, which is the reader's version of
  the "How to find" search instructions and is the one the site shows; the first paragraph of a "... defined"
  section is the short definition on the landing page, and any later paragraphs show only on the category page)
- `data-rstar-categories/datasets/<dataset>/*.json` (the categorizations)
- `docs/scoring/how_to_score_rstar.md` (point values and group weights)
- `docs/json_output/example_rstar_json.json` (the saved file's `formula` and `framework` blocks)
- `datasets_metadata/json/*_dataset-metadata.json` (dataset names and details)

```bash
python3 /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/app/scripts/build_data.py
```

A new dataset appears in the dataset selector as soon as its folder exists in
`data-rstar-categories/datasets/`. It is marked "not categorized yet" until the folder has a JSON file.

## Tests (Playwright for Python)

End-to-end tests are in `e2e/`. They use pytest-playwright with Firefox and WebKit only (no Chromium). A
fixture serves `app/` on a free port on 127.0.0.1 for the run.

One-time setup, run in the Terminal (pip can't reach PyPI from Claude's sandbox):

```bash
cd /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships && python3 -m venv .work/venv && .work/venv/bin/pip install -r app/requirements-dev.txt && .work/venv/bin/python -m playwright install firefox webkit
```

Run all tests in both browsers:

```bash
cd /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/app && ../.work/venv/bin/pytest
```

Run in one browser only (`pytest.ini` sets both, so override its options):

```bash
cd /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/app && ../.work/venv/bin/pytest --browser webkit --override-ini="addopts=--tracing retain-on-failure --screenshot only-on-failure --output test-results"
```

Failed tests leave a trace and a screenshot in `app/test-results/`. Open a trace with
`../.work/venv/bin/playwright show-trace <path>/trace.zip`.

**`DYLD_LIBRARY_PATH` and Firefox:** if `DYLD_LIBRARY_PATH` includes `/opt/homebrew/lib`, Playwright's
Firefox loads Homebrew's `libnss3` instead of its own and fails with "Symbol not found: _PR_GMTParameters".
`e2e/conftest.py` removes that variable before the browsers start, so the tests work either way.

## Files

| Path | What it is |
|---|---|
| `index.html` | Landing page: dataset details and the four category cards |
| `graph.html` | Score graph page (`assets/graph.js` draws it) |
| `people-risk.html`, `data-risk.html`, `dependent-infrastructure.html`, `repository-resilience.html` | Category pages (thin shells; `assets/app.js` fills them) |
| `assets/app.js` | Renders all pages from `window.RSTAR_DATA` |
| `assets/graph.js` | Draws the weighted network graph on `graph.html` (SVG, no libraries) |
| `assets/styles.css` | Styles, with light and dark themes that follow the system setting |
| `data/rstar-data.js` | Generated data. Don't edit it by hand |
| `scripts/build_data.py` | Builds `data/rstar-data.js` (Python standard library only) |
| `e2e/` | Playwright tests: `conftest.py` (test server), `test_landing.py`, `test_category.py`, `test_scores.py`, `test_save.py`, `test_graph.py` |
| `pytest.ini`, `requirements-dev.txt` | Test settings (Firefox and WebKit) and pinned test tools |

## Using it

- **Dataset selector** (top right): switches the dataset. The choice is kept in the URL (`?dataset=ghcn-daily`).
- **Subcategory chips** on the landing page jump to that card. The dot shows coverage: green for 4 or more
  evidence items, amber for 1–3, a hollow circle for none, and grey for not categorized.
- **Cards**: click anywhere on a card's header, or the arrow button, to open it. Expand all and Collapse all
  are above the list.
- **Deep links**: `people-risk.html?dataset=ghcn-daily#P-3` opens P-3 directly.
- **Evidence items** show a stance tag, a confidence badge and (RRS) the repository. The research run each came
  from stays in the JSON's `data-source` but isn't shown. Links open in a new tab.
