---
name: request-indexing
description: Ask Google to index newly released pages and resubmit the sitemap in Google Search Console through a browser agent, using the right Google account. Use after a content release, or when asked to "request indexing", "resubmit the sitemap", or "my new pages are not in Google". Only on the account owner's explicit request.
---

# Request indexing in Search Console

This acts inside the account owner's Google account. Run it only when the owner asks for it in this session
(for example "yes, request indexing"). It changes no settings, adds no users and does not touch property verification.

## Steps

1. **Pick the right browser and account.**
   - List the connected browsers, then open
     `https://search.google.com/search-console?resource_id=sc-domain%3A<domain>`.
   - Read the Google account button on the page. If it shows "you don't have access" or the account is not the owner's,
     **stop on that account**, switch to another connected browser, and check again.
   - Browser names and device ids can swap after an extension reconnects. Identify the browser by the account shown on
     the page, not by its name.
   - Never put an email address in a URL parameter.

2. **Inspect, then request indexing, per URL.**
   - Use the on-page "Inspect any URL in <domain>" box. Type the full URL and press Enter. Wait about 15 seconds.
   - Note the status before you request (for example "URL is not on Google", "no referring sitemap"). That is your baseline.
   - Click "Request indexing", wait about 20 seconds, and confirm the "Indexing requested" dialog appears, then close it.
   - The quota is roughly 10 URLs per property per day. Do hubs and index pages first, because they link to the rest.
   - Do not open a direct inspect URL: it can return 404. The on-page box is reliable.

3. **Resubmit the sitemap after the release.**
   - Open `.../sitemaps?resource_id=sc-domain%3A<domain>`, enter the full sitemap URL, click Submit, and confirm the
     "Sitemap submitted successfully" dialog.
   - Compare the "Discovered pages" count before and after. It should rise by the number of pages you released.

4. **Close the tabs you opened** and record what you did: URLs requested, and the sitemap page count before and after.

## Tips and pitfalls
- If a screenshot times out because the renderer is busy, read the dialog text with a find/read-page call instead.
- A sitemap submitted before the release keeps its old page count. Submit again after the release.
- The first browser may be signed into someone else's account. That is normal; check the account and move on.
