# R* categorization viewer

A static site for reading the R* categorizations of each dataset. It has a landing page with a key to the tags and
scoring, the dataset's R* score (total, four category scores and a "Score details" panel) and the four categories, and
one page per category. On a category page, each subcategory card shows its description, "What counts as evidence" text, score
(a number or NA, with the reason) and status, and opens to show the evidence sorted into it.

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
| `people-risk.html`, `data-risk.html`, `dependent-infrastructure.html`, `repository-resilience.html` | Category pages (thin shells; `assets/app.js` fills them) |
| `assets/app.js` | Renders all pages from `window.RSTAR_DATA` |
| `assets/styles.css` | Styles, with light and dark themes that follow the system setting |
| `data/rstar-data.js` | Generated data. Don't edit it by hand |
| `scripts/build_data.py` | Builds `data/rstar-data.js` (Python standard library only) |
| `e2e/` | Playwright tests: `conftest.py` (test server), `test_landing.py`, `test_category.py` |
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
