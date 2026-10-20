---
name: local-seo
description: Plan and write local service pages for one business with SEO Content Machine. Pulls competitor Google Maps listings, picks services from their review tags, plans a hub page per service with a page per town under it in an SEO Workspace, then has SCM research, write and review each page. Use when asked for local SEO pages, service area pages, city pages, or "every service in every city" for a local business.
---

# Local SEO pages

You plan a local business's service pages and hand them to SEO Content Machine (SCM) to write. SCM researches each page, writes it, has fresh reviewers check its facts, and saves it as a draft in an SEO Workspace. The user reviews and publishes from the app. Read the `scm` skill first if you have not used the SCM tools in this session.

The pages are only as good as two inputs: the business facts you put in the brief, and the city facts SCM can find. Both steps below matter more than the page count.

## 1. Get the business facts

Ask the user for these, and wait for the answers:

- Business name, website, main city, and the towns it serves.
- The services it offers.
- How it works: response time, pricing approach, free estimates, warranty, who pulls permits, licences.

The writer may claim only what the brief says about the business, so a missing fact becomes a gap the reviewers mark down. Never invent one.

## 2. See what competitors are known for

1. Call `local_listings_create` with one line such as "plumbers in austin tx", `resultsLimit` 15, `reviewCount` 3 and `uniqueDomain` true. Then `task_run` it.
2. Poll `task_list` with the task's `name` every 30 seconds until its status is done. A run takes about a minute.
3. Call `task_results`. Its rows point to a CSV file. Read that file with your own file tool.
4. Group the `reviewTags` by job, then count how many places each job appears at. Tags name one job in many ways ("ev charger", "electric car charger installation", "charging"), so an exact count undercounts it. Drop tags that name no job, such as "punctuality", "fair pricing" or "clean".

Show the user the jobs and their counts next to their services, and agree the service list. Leave out a service they do not offer, however often it appears. A service they offer with no matching tag can stay, because customers rarely tag routine work.

## 3. Plan the Workspace

1. Create the Workspace with `seo_workspace_create`.
2. Fill the brief with `workspace_write` (`brief`, `updateOne`): `businessName`, `targetSite`, `geo` with the main city and the towns, `articleGoogleCountry` such as "United States:English", and `notes` with every fact from step 1. Always set `articleGoogleCountry`, because a new Workspace starts with the user's saved region, which may be another country, and the pages are researched and written for that region.
3. Show the user the plan as a table of services by towns, with the page count, and get a yes before you write any pages.
4. Insert the pages with `workspace_write` (`pages`, `insertMany`), with `intent` "local" and `status` "planned":
   - One hub per service, topic "<service> <main city>", `templateType` "Local SEO Hub".
   - One page per service and town, topic "<service> <town> <state>", `templateType` "Local SEO Service".
5. Put them on the site plan with `workspace_write` (`sitePlan`, `insertMany`): hubs at the top level, and each town page with `parentPageId` set to its service's hub.

## 4. Write a first batch

1. Pick one hub and two of its town pages. Pass their page ids to `workspace_create_pages`. SCM writes them with the AI model and effort the user last picked in the app.
2. Poll `task_list` with `seo_workspace_id` set to the Workspace id every minute until the pipeline's status is done. A batch of three takes about 5 to 10 minutes.
3. Read the drafts with `workspace_query` on `documents`, with `fields` that include `body`, because the page text is left out otherwise. Read the log once with `task_get` and `include_logs`.
4. For each page, find two log lines. `Review scores:` gives the last reviewer's scores out of 10. `Review done with N rounds` gives the writer's last reply, with any blocking fails left open.

Tell the user what each page found about its town, and ask them to open the drafts in the app. When a page has blocking fails left open, it is still saved as a draft, so list those claims for the user to check or remove before publishing.

## 5. Write the rest

Hand the remaining pages over in batches of 8 to 10. Each page links to its hub and its sibling towns by their site plan addresses, so the order does not matter.

Each page uses roughly 75k to 300k tokens. On a subscription plan, spread a large site over several days.

## When a page comes out thin

Some towns publish little, hide their fees and rules in collapsed page sections and old reports, or block SCM's browser, so their pages score lower whatever the effort. Tell the user which towns these are. They can add what they know about the town to the brief, or skip the town.
