# SEO Content Machine plugin for Claude Code

Lets Claude Code drive [SEO Content Machine](https://seocontentmachine.com) (SCM), the desktop SEO workspace. Claude can create and run SCM tasks and read their results:

- scrape articles from search results for a keyword list
- crawl a site and list its internal links
- pull Google Maps listings with ratings and reviews
- download archive.org copies of a site
- extract values from pages into CSV
- add and update pages in an SEO Workspace

The plugin adds SCM's MCP server ([seo-content-machine-mcp](https://www.npmjs.com/package/seo-content-machine-mcp) on npm) and a skill that shows Claude how to use it.

## Requirements

- SEO Content Machine running on the same machine, on Windows, Mac or Linux. SCM is a paid app with a [14-day free trial](https://seocontentmachine.com/members/signup/trial), no card needed.
- Node.js 18 or newer.

## Install

In Claude Code:

```
/plugin marketplace add gitTerebi/seo-content-machine-plugin
/plugin install seo-content-machine@seo-content-machine
```

It works with SCM's default settings. If you set an API key in SCM (Settings > App > Api secret key), set the `SCM_API_KEY` environment variable to it before you start Claude Code. If SCM's API is not at `http://localhost:8008`, set `SCM_API_URL`.

You can open SCM before or after Claude Code. The SCM tools appear once SCM is running.

## Use

Open SCM, then ask Claude Code for the job, for example:

- "Use SCM to find dentists in Austin TX with at least 4 stars"
- "Crawl example.com with SCM and tell me which pages have no internal links"
- "Add these 10 page ideas to my SEO Workspace"

## License

MIT
