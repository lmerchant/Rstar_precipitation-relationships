## Project overview

The app/ folder will be used to create an app using web research information on precipitation datasets to create a weighted network graph and/or knowledge graph for relationships of datasets metadata.

## File locations

The folder data-rstar-query results contains web research on precipitation datasets, their data repositories, and instruments used to measure precipitation.

The folder data-rstar-categories will be used to store reformatted web research into subcategories of information for each dataset.

The folder daasets_metadata contains metadata about each dataset.

The folder docs/ will be for me to add documentation for the project.

The folder notes/ is for Claude to store project notes and plans.

The folder rstar_definitions contains definitions of subcategories to divide and reformat the web research into.


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

