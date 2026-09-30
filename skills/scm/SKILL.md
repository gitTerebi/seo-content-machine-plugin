---
name: scm
description: Use SEO Content Machine (SCM) through its MCP tools to scrape articles from search results, crawl a site, pull Google Maps business listings, download archive.org copies of a site, extract values from pages into CSV, or add and update pages in an SEO Workspace. Use when the user mentions SCM or SEO Content Machine, or asks for one of those jobs.
---

# SEO Content Machine

SEO Content Machine (SCM) is a desktop app. Its MCP tools create and run tasks inside the app, which does the browsing, scraping and file writing on the user's machine. Results land in the task's output folder on that machine.

## Before the first call

The app must be open. If no SCM tools are available, or a tool answers "Cannot reach SCM", ask the user to start SEO Content Machine and log in. The tools appear on their own within a few seconds of SCM starting. Do not retry in a loop.

Call `task_list` first in a new session. It shows the tasks that already exist and how busy the machine is.

## How a task runs

Most tools only create a draft task. The pattern is always:

1. Create it with a `*_create` tool. The reply has the task id.
2. Start it with `task_run` and that id. `local_listings_create` is the exception: it starts the task itself.
3. Check progress with `task_get`. Pass `include_logs: true` when a run looks stuck or failed.
4. Read the output with `task_results`. It pages through result rows, and with offset 0 it also returns the files in the output folder.

Runs take from seconds to many minutes. Poll `task_get` every 20 to 60 seconds rather than in a tight loop, and tell the user what is happening while you wait.

`task_run` resumes an unfinished run. `task_restart` starts over from the first input line and clears the unfinished run's progress. `task_cancel` stops a run.

## Which tool for which job

| Job | Tool |
| --- | --- |
| Articles for a list of keywords, scraped from search results | `page_pipeline_create` |
| Specific values from pages (prices, schema, titles) into CSV | `dynamic_pages_create` |
| Whole pages saved as cleaned article files, no browser | `static_pages_create` |
| Every internal link on a site | `site_crawler_create` |
| A dead or old site rebuilt from archive.org | `web_archives_create` |
| Businesses in a place, with ratings and reviews | `local_listings_create` |
| A quick web search | `web_search` |
| Read one page after its JavaScript runs | `open_url` |
| Click, type or log in on a site | `cdp_open` |

For "best", "top rated" or "near me" questions about businesses in a place, use `local_listings_create` with a line such as "plumbers in denver", not a web search.

Output folders accept `%project_folder%`, which is the task's own project folder.

## SEO Workspace pages

An SEO Workspace is a task of type "seo workspace". Find its id with `task_list` and `type: "seo workspace"`.

- `workspace_pages_add` adds rows to its Pages table straight away, with no confirmation step. Show the user the list of pages and get a yes before you call it.
- `workspace_pages_update` edits pages that a filter matches. Target exact pages with `{"pageId": {"$in": [...]}}`. A status change needs a short `reason`. Edits are journaled and the user can undo them in the app.

The user reviews and approves pages in the app. Do not describe a page as published because its status changed.

## Care

- `task_delete` removes the task folder, including its results and log. Confirm with the user first.
- AI images in `page_pipeline_create` cost SCM AI credits (5k per image on the scm service). Mention the cost before turning them on.
- Do not start many large tasks at once. `task_list` shows the machine's CPU, RAM and task load.
