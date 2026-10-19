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
2. Poll `task_get` every 30 seconds. A run takes about a minute.
3. Call `task_results`. Its rows point to a CSV file. Read that file with your own file tool.
4. Count the `reviewTags` across the places. The tags that repeat are the jobs customers book.

Show the user the repeated tags next to their services, and agree the service list. Leave out a service they do not offer, however often it appears.

## 3. Plan the Workspace

1. Create the Workspace with `seo_workspace_create`.
2. Fill the brief with `workspace_write` (`brief`, `updateOne`): `businessName`, `targetSite`, `geo` with the towns, `articleGoogleCountry` such as "United States:English", and `notes` with every fact from step 1.
3. Show the user the plan as a table of services by towns, with the page count, and get a yes before you write any pages.
4. Insert the pages with `workspace_write` (`pages`, `insertMany`), with `intent` "local" and `status` "planned":
   - One hub per service, topic "<service> <main city>", `templateType` "Local SEO Hub".
   - One page per service and town, topic "<service> <town> <state>", `templateType` "Local SEO Service".
5. Put them on the site plan with `workspace_write` (`sitePlan`, `insertMany`): hubs at the top level, and each town page with `parentPageId` set to its service's hub.

## 4. Write a first batch

1. Pick one hub and two of its town pages. Pass their page ids to `workspace_create_pages` with `run` false.
2. Set the model on the pipeline it returns with `page_pipeline_upsert`: the AI service the user runs in SCM, and effort "medium" or higher. On low effort the writer stops researching the town, and the page turns generic.
3. Start it with `task_run` and poll `task_get` every minute. A batch of three takes about 5 to 10 minutes.
4. Read the drafts with `workspace_query` on `documents`, and the log with `task_get` and `include_logs`. Each page logs a `Review scores:` line.

Tell the user what each page found about its town, and ask them to open the drafts in the app.

## 5. Write the rest

Hand the remaining pages over in batches of 8 to 10, hubs first. A town page links only to pages already written, so a hub written later is missing from its town pages.

Each page uses roughly 75k to 300k tokens. On a subscription plan, spread a large site over several days.

## When a page comes out thin

Some towns publish little, or hide their fees and rules in collapsed page sections and old reports, so their pages score lower whatever the effort. Tell the user which towns these are. They can add what they know about the town to the brief, or skip the town.
