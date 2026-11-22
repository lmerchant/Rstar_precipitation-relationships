# R* categorization viewer

A static site for reading the R* categorizations of each dataset. It has a landing page with the four
categories, and one page per category. On a category page, each subcategory card shows its description and
"How to find" text, and opens to show the evidence sorted into it.

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

- `rstar_definitions/*.md` (titles, descriptions, "How to find" text)
- `data-rstar-categories/datasets/<dataset>/*.json` (the categorizations)
- `docs/rstar_relationship_graph/rstar_graphs.md` (point values and group weights)
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

**Known issue (2026-11-22):** Firefox fails to launch on this account. The Playwright Firefox build loads
Homebrew's `libnss3` (`/opt/homebrew/Cellar/nss/...`) and stops with "Symbol not found: _PR_GMTParameters".
WebKit works.

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
- **Evidence items** show a confidence badge and the research run they came from (hover for the full folder
  name). Links open in a new tab.
