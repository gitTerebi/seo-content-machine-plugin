---
name: scm
description: Use SEO Content Machine (SCM) through its MCP tools to write AI pages from page templates, scrape articles from search results, crawl a site, list search results, pull Google Maps business listings, save YouTube subtitles, download archive.org copies of a site, extract values from pages into CSV, or plan and write pages in an SEO Workspace. Use when the user mentions SCM or SEO Content Machine, or asks for one of those jobs.
---

# SEO Content Machine

SEO Content Machine (SCM) is a desktop app. Its MCP tools create and run tasks inside the app, which does the browsing, scraping, writing and file saving on the user's machine. Results land in the task's output folder on that machine.

## Before the first call

The app must be open. If no SCM tools are available, or a tool answers "Cannot reach SCM", ask the user to start SEO Content Machine and log in. The tools appear on their own within a few seconds of SCM starting. Do not retry in a loop.

Call `task_list` first in a new session. It shows the tasks that already exist and how busy the machine is.

## How a task runs

Every `*_create` tool and `page_pipeline_upsert` only make a draft task. The pattern is always:

1. Create it. The reply has the task id.
2. Start it with `task_run` and that id.
3. Check progress with `task_get`. Pass `include_logs: true` when a run looks stuck or failed.
4. Call `task_results`. Its rows point to what the run wrote: a file, files, a CSV or a sheet, and `run.output_folder` is the output folder. Read those files with your own file tools. A Maps CSV with review text is wide, so read only the columns you need.

Runs take from seconds to many minutes. Poll `task_get` every 20 to 60 seconds rather than in a tight loop, and tell the user what is happening while you wait.

`task_run` resumes an unfinished run. `task_run` with `fromStart: true` starts over from the first input line. `task_cancel` stops a run.

## Which tool for which job

| Job | Tool |
| --- | --- |
| AI pages from page templates, or articles scraped from search results, for a list of keywords | `page_pipeline_upsert` |
| Write pages already planned in an SEO Workspace | `workspace_create_pages` |
| Specific values from pages (prices, schema, titles) into CSV | `dynamic_pages_create` |
| Whole pages saved as cleaned article files, no browser | `static_pages_create` |
| Every internal link on a site | `site_crawler_create` |
| Search results (rank, URL, title) for a list of queries, as one CSV | `url_finder_create` |
| Subtitles of YouTube videos, by URL or keyword search | `youtube_subtitles_create` |
| A dead or old site rebuilt from archive.org | `web_archives_create` |
| Businesses in a place, with ratings and reviews | `local_listings_create` |
| A quick web search | `web_search` |
| Read one page after its JavaScript runs | `browser_open` |
| Click, type or log in on a site | `cdp_open` |
| Print HTML to a PDF | `render_pdf` |

For "best", "top rated" or "near me" questions about businesses in a place, use `local_listings_create` with a line such as "plumbers in denver", not a web search.

Output folders accept `%project_folder%`, which is the task's own project folder.

## SEO Workspace pages

An SEO Workspace is a task of type "seo workspace". Find its id with `task_list` and `type: "seo workspace"`, or make one with `seo_workspace_create`. That id is the `task_id` the workspace tools take.

- `workspace_query` reads one collection, such as `pages`, `sitePlan`, `brief` or `documents`, with a Mongo filter. Pass `fields` to keep the reply short.
- `workspace_write` inserts or updates rows straight away, with no confirmation step. Show the user the list of pages and get a yes before you add them. To update exact pages, filter with `{"pageId": {"$in": [...]}}`. Page and Site plan changes are journaled, and the user can undo them in the app.
- `workspace_create_pages` hands pages to a Page Pipeline, which researches, writes and reviews one page each and saves it as a draft document. Pass `run: false` to set the model and effort with `page_pipeline_upsert` before `task_run`. Use effort "medium" or higher, because on low the writer stops researching.
- `workspace_documents_edit` replaces exact text in one document's body.

For local service pages across towns, follow the `local-seo` skill.

The user reviews and publishes pages in the app. Do not describe a page as published because its status changed.

## Care

- `task_delete` removes the task folder, including its results and log. Confirm with the user first.
- AI images in a Page Pipeline cost SCM AI credits (5k per image on the scm service). Mention the cost before turning them on.
- AI pages use the user's own AI service, roughly 75k to 300k tokens a page. Mention it before a large batch.
- Do not start many large tasks at once. `task_list` shows the machine's CPU, RAM and task load.
