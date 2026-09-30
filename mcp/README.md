# SEO Content Machine MCP server

Connects Claude Code, Codex, Claude Desktop or any MCP client to [SEO Content Machine](https://seocontentmachine.com) (SCM), the desktop SEO workspace.

Your assistant can then create and run SCM tasks and read their results: article scraping from search results, site crawls, Google Maps listings, archive.org downloads and SEO Workspace pages. The work runs inside the SCM app on your machine, with its own browser and task queue.

## Requirements

- SEO Content Machine running on the same machine, on Windows, Mac or Linux. There is a [14-day free trial](https://seocontentmachine.com/members/signup/trial), no card needed.
- Node.js 18 or newer.

## Setup

Claude Code:

```
claude mcp add scm -- npx -y seo-content-machine-mcp
```

Any other MCP client, in its config file:

```json
{
  "mcpServers": {
    "scm": {
      "command": "npx",
      "args": ["-y", "seo-content-machine-mcp"]
    }
  }
}
```

If you set an API key in SCM (Settings > App > Api secret key), pass it as `SCM_API_KEY`. If SCM's API runs somewhere other than `http://localhost:8008`, set `SCM_API_URL`.

## Tools

| Tool | What it does |
| --- | --- |
| `task_list`, `task_get`, `task_results` | List SCM tasks, read one with its log, read the rows of its last run |
| `task_run`, `task_restart`, `task_cancel`, `task_delete` | Start, restart, stop or delete a task |
| `page_pipeline_create` | Scrape articles from search results for a list of keywords |
| `dynamic_pages_create` | Extract values from rendered pages into CSV with CSS selectors |
| `static_pages_create` | Fetch pages without a browser and save each as a cleaned article |
| `site_crawler_create` | Crawl a site and save the links it finds |
| `url_finder_create` | Search a list of queries and save every result to one CSV of query, rank, url and title |
| `web_archives_create` | Download the newest archive.org copy of each page on a domain |
| `local_listings_create` | Scrape Google Maps listings, such as "plumbers in denver" |
| `workspace_pages_add`, `workspace_pages_update` | Add or edit pages in an SEO Workspace project |
| `web_search`, `open_url`, `cdp_open` | Search the web, read a page, or drive a real browser |

## How it works

SCM serves MCP over HTTP at `/mcp` inside the app. This package is a small stdio relay: the client talks to it over stdin and stdout, and it forwards each message to the app. You can start SCM before or after your MCP client. While SCM is closed the server lists no tools, and it tells the client to list them again once SCM starts. Tool calls made while SCM is closed return an error that says to start it.
