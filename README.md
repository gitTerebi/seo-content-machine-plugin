# SEO Content Machine plugin for Claude Code

Lets Claude Code drive [SEO Content Machine](https://seocontentmachine.com) (SCM), the desktop SEO workspace. Claude can create and run SCM tasks and read their results:

- scrape articles from search results for a keyword list
- crawl a site and list its internal links
- pull Google Maps listings with ratings and reviews
- download archive.org copies of a site
- extract values from pages into CSV
- add and update pages in an SEO Workspace

The plugin adds SCM's MCP server and a skill that shows Claude how to use it.

## Requirements

- SEO Content Machine running on the same machine, on Windows, Mac or Linux. SCM is a paid app with a [14-day free trial](https://seocontentmachine.com/members/signup/trial), no card needed.
- Node.js 18 or newer.

## Install

In Claude Code:

```
/plugin marketplace add gitTerebi/seo-content-machine-plugin
/plugin install seo-content-machine@seo-content-machine
```

The plugin works with SCM's default settings. It has two optional settings, which you can change in `/config`:

- **SCM API key**: only if you set one in SCM under Settings > App > Api secret key.
- **SCM API address**: only if SCM's API is not at `http://localhost:8008`.

You can open SCM before or after Claude Code. The SCM tools appear once SCM is running.

## Use

Open SCM, then ask Claude Code for the job, for example:

- "Use SCM to find dentists in Austin TX with at least 4 stars"
- "Crawl example.com with SCM and tell me which pages have no internal links"
- "Add these 10 page ideas to my SEO Workspace"

## What the plugin runs and sends

The MCP server is one file, [mcp/index.mjs](mcp/index.mjs), with no dependencies. Claude Code runs it with Node. It reads messages from Claude Code on stdin and posts each one to SCM's API at the SCM API address, `http://localhost:8008/mcp` by default, with the API key as a Bearer header when you set one. It sends nothing anywhere else.

While SCM is closed, the server checks that address every 5 seconds and tells Claude Code to list the tools again once SCM answers.

The work itself runs inside SCM on your machine. Tasks you start through it browse and scrape the sites and searches you ask for, and write their results to SCM's output folders.

The same server is on npm as [seo-content-machine-mcp](https://www.npmjs.com/package/seo-content-machine-mcp) for other MCP clients.

## License

MIT
