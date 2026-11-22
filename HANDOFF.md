# Handoff

Notes for the next session: what the project is for, where things stand, and what to do next.
Last updated 2026-11-22. Update this file before compacting a session and at the end of every session
(see CLAUDE.md).

## Goal

Score precipitation datasets on the R* framework and show how risky each one is. There are four groups:
People risk (P), Data risk (D), Dependent infrastructure resilience (DIRS) and Repository resilience (RRS),
with 19 subcategories in all.

1. Web research on each dataset, its repositories and its instruments is saved in `data-rstar-query-results/`.
2. That research is sorted into the 19 subcategories as evidence (`data-rstar-categories/`).
3. A person reads the evidence and decides each subcategory: true, false, unknown or partly known.
4. The final app in `app/` shows a weighted network graph and/or knowledge graph of R* scores and dataset
   relationships. Ideas and the scoring formula are in `docs/rstar_relationship_graph/rstar_graphs.md`:
   - R* = 0.40 D + 0.30 P + 0.20 (100 − RRS) + 0.10 DIRS;
   - each subcategory is worth 0 or a fixed number of points, and 0 when the evidence is missing.

The user is still deciding what the final app will be. For now, the categorization is being tested on one
dataset to see whether the subcategory definitions need more context.

## Where things stand

| Piece | State |
|---|---|
| GHCN-Daily categorization | Done (first pass): `data-rstar-categories/datasets/ghcn-daily/ghcn-daily_rstar-categories.json` |
| GPCP Daily, PERSIANN-CDR Daily, IMERG Late Run | Research exists in `data-rstar-query-results/about-datasets/`; not categorized |
| Feedback on the first pass | `docs/claude_feedback/first_pass_to_categorize.md`. **Waiting on the user's answers** (see below) |
| Categorization viewer | Done: static site in `app/` (landing page plus 4 category pages) |
| e2e tests | 32 pass (16 tests × Firefox and WebKit), Python Playwright |
| Final graph app | Not started |

## Categorization format

Follows `docs/create_rstar_node_files.md`:

- **One JSON file per dataset**, in `data-rstar-categories/datasets/<dataset>/`.
- **Top keys:** `people_risk`, `data_risk`, `dep_infra_resilience`, `repo_resilience`, each holding its
  subcategory keys (`P-1` … `RRS-5`).
- **Each value** is HTML: `<div class="p-1">` containing:
  - `<h4>Evidence</h4><ul class="evidence">`, where each `<li>` has `data-confidence` (high, moderate or
    low) and `data-source` (the research run folder);
  - then `<h4>Gaps</h4><ul class="gaps">`.
- **Empty subcategory:** a bare `<div class="rrs-2"></div>`.
- **Inferences** made during categorization are labelled "inference" and given low confidence.
- **Source material:** the `answer_*.md` file in each run folder under
  `data-rstar-query-results/about-datasets/<dataset>/`.
- **How the GHCN-Daily file was made:** written by hand through a throwaway script (not kept). For a new
  dataset, read all its answer files and write the JSON the same way.

## Open questions for the user

From `docs/claude_feedback/first_pass_to_categorize.md`. Check whether the user has answered them before
categorizing another dataset.

1. Should RRS and DIRS also use `data-rstar-query-results/archives/` and `instruments/`? Those folders
   probably hold the missing evidence for RRS-2, RRS-3 and DIRS-1.
2. Should `repo_resilience` be split by repository (NCEI, AWS, Google), or stay pooled?
3. Should there be a data-quality subcategory? QC and processing evidence has no home in D-1 to D-5 now.
4. Should evidence shared between subcategories be repeated, or cross-referenced ("see D-1")?
5. Is the JSON and HTML format right? That covers the file name, the Evidence and Gaps lists, the
   attributes, and keeping labelled inferences.
6. Should the 2025-to-present window in D-1 and RRS-4 be enforced strictly?

Other issues raised in the feedback:

- **Unknown scores unevenly.** Missing evidence scores 0, which reads as "no risk" for P, D and DIRS but
  "no resilience" for RRS.
- **DIRS-1's "How to find" text** is about who does processing, not calibration.
- **The research never asked some questions:** succession plans, ages or ORCID, calibration, checksums,
  disaster recovery plans.
- **Research file mix-ups:** two GHCN-Daily runs are both named "pt3", and the answers' cross-links point
  to `answer.md` files that don't exist.

## The viewer (`app/`)

Plan: `notes/app-categorization-viewer-plan.md`. Details: `app/README.md`.

- **How it's built:** plain HTML, CSS and JavaScript, with no dependencies. `app/scripts/build_data.py`
  reads the definitions, the point values and weights, the dataset metadata and the categorization JSON,
  and writes `app/data/rstar-data.js`.
  - **Re-run it after changing any of those inputs:**
    `python3 app/scripts/build_data.py`.
  - The pages load the data with a `<script>` tag, so they also work opened from disk.
- **Pages:** `index.html` (dataset selector, dataset details, 4 category cards with coverage chips), plus
  one page per category. On a category page each subcategory card shows its Description and "How to find"
  text and opens to show the evidence.
  - Deep links work: `people-risk.html?dataset=ghcn-daily#P-3`.
- **Viewing:** after each big change, give the user this command (CLAUDE.md):
  `cd /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/app && python3 -m http.server 3000 --bind 127.0.0.1`,
  then http://127.0.0.1:3000/.
- **Claude's own preview:** `.claude/launch.json` defines `rstar-viewer` on port 8765 for the built-in
  browser. The built-in browser can't load the CSS and JS of a page opened from disk, so serve it.
- **Accessibility:** follows the frontend-ui-engineering skill.
  - Each card's arrow is a `<button aria-expanded>` that controls a `role="region"` panel.
  - Headings go h1, then h2 (subcategory), then h3.
  - Coverage dots have screen-reader text.

## Tests

- **Tool:** Python Playwright, not npm. It lives in `.work/venv`, with versions pinned in
  `app/requirements-dev.txt`. The tests are in `app/e2e/`, and `pytest.ini` runs Firefox and WebKit only.
- **Run them in the Terminal panel,** not the Bash tool. In the sandbox, pip can't reach PyPI and servers
  can't bind ports:
  `cd /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/app && ../.work/venv/bin/pytest`
- **Rebuild the venv** if its Python disappears (Anaconda was uninstalled on 2026-11-22): the command is in
  `app/README.md`. It uses `/opt/homebrew/bin/python3` (3.15).
- **Don't remove the DYLD fix.** `~/.zshrc` sets `DYLD_LIBRARY_PATH=/opt/homebrew/lib`, which made
  Playwright's Firefox load Homebrew's libnss3 and crash. `app/e2e/conftest.py` removes the variable.
  - The user may switch the shell line to `DYLD_FALLBACK_LIBRARY_PATH`.
  - `/usr/bin/env` hides `DYLD_*` variables, so check with `echo $DYLD_LIBRARY_PATH` instead.
- **Node** (v26, Homebrew) is now installed. The tests stay on Python unless the user asks to switch.

## Repository and working conventions

- Work on `develop`; `main` has only the first commit ("add .gitignore"). Commit only when the user asks.
- `.work/` holds the venv, logs and debug scripts, and is git-ignored. `notes/` is for Claude's plans.
  `docs/` is the user's.
- Use `trash`, never `rm`.

## Next steps

1. **Get the user's answers to the open questions,** then revise the GHCN-Daily JSON if needed (for
   example, pull in the archives and instruments research, or split RRS by repository).
2. **Categorize the next datasets:** GPCP Daily, PERSIANN-CDR Daily, IMERG Late Run. Each needs a folder in
   `data-rstar-categories/datasets/`; `imerg-late-run/` doesn't exist yet. Re-run `build_data.py`
   afterwards.
3. **Maybe add a scoring step:** the user picks 0 or the point value for each subcategory, and the app
   computes R*. The viewer plan lists this, plus confidence filters and a side-by-side dataset view, as
   later ideas.
4. **Design the network graph and knowledge graph app** from `docs/rstar_relationship_graph/rstar_graphs.md`.
5. **Keep the e2e tests passing in both browsers** as the viewer changes.
