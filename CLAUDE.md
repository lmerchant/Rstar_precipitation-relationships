## Project overview

The app/ folder will be used to create an app using web research information on precipitation datasets to create a weighted network graph and/or knowledge graph for relationships of datasets metadata.

## File locations

The folder data-rstar-query-results/ contains web research on precipitation datasets (about-datasets/), their data repositories (archives/), and instruments used to measure precipitation (instruments/).

The folder data-rstar-categories/datasets/ stores the web research reformatted into subcategories, one JSON file per dataset in a folder named by dataset id (for example ghcn-daily/).

The folder datasets-gap-queries/ stores, for each dataset, the gaps note (what the research never searched, per subcategory), the gap query files for new web searches, and the run sheet for rewriting and running them.

The folder scripts/categorize/ holds the script for each dataset (build_<id>.py) that holds the hand-sorted evidence and writes its category JSON.

The folder datasets_metadata/json/ contains metadata about each dataset.

The folder app/ contains the website that shows the categorizations; app/scripts/build_data.py rebuilds its data.

The folder docs/ will be for me to add documentation for the project.

The folder notes/ is for Claude to store project notes and plans.

The folder rstar_definitions/ contains definitions of subcategories to divide and reformat the web research into.

## Creating categories from web research

For creating categories applying @/Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/docs/create_rstar_node_files.md, you can use all files in /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/data-rstar-query-results

Follow the steps and prompts in docs/categorizing-web-searches_README.md for categorizing a dataset, adding it to the website, writing gap queries, and adding new research.


## Handoff doc

Before you compact a session and at the end of a session, update a HANDOFF.md file stored in the top folder with notes on the project and the steps to do next for the project so that the project goals can be remembered as it progresses through new sessions.

## At the end of a session

I will tell you when I will be starting a new session, and when that happens, update all docs as needed and make a commit on the develop branch.

## Skills to use

Use the frontend-ui-engineering skill found in ~/.my-claude-plugins to apply accessibility settings and the playwright-expert skill found in ~/.my-claude-plugins to use playwright to view the web pages.

## Viewing the website

After each big change, show me the command to start the server so I can view the app in my browser:

```bash
cd /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/app && python3 -m http.server 3000 --bind 127.0.0.1
```

Then open http://127.0.0.1:3000/

