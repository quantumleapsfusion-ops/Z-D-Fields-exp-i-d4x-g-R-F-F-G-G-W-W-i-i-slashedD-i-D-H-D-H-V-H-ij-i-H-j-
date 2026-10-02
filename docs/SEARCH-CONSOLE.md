# Putting earth1.co and e1-4.com on Google

Neither site is indexed yet. Both already serve what Google needs (titles, descriptions,
Open Graph cards, JSON-LD, `sitemap.xml`, `robots.txt`, canonical URLs). What is missing is
the part only the owner can do: proving to Google that we own the domains and handing it the
sitemaps. This is the exact sequence. Nothing here changes DNS or Vercel settings except the
one environment variable in step 2b, which the owner adds by hand.

## 0. What is already in place

|                                | earth1.co                                                       | e1-4.com                                                                             |
| ------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Sitemap                        | `https://earth1.co/sitemap.xml`                                 | `https://e1-4.com/sitemap.xml`                                                       |
| Robots                         | `https://earth1.co/robots.txt` (allow all)                      | `https://e1-4.com/robots.txt` (home + privacy indexable; app surfaces disallowed)    |
| Organization / WebSite JSON-LD | home page                                                       | home page (plus `WebApplication` and a `DefinedTerm` saying e1-4 = earth life-forms) |
| Open Graph image               | `/opengraph-image.png`, "Earth One, Global citizenship for all" | `/opengraph-image.png`, "e1-4, earth life-forms"                                     |
| Verification meta tag          | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`                          | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`                                               |

e1-4.com shows no visible text by design, so "e1-4 stands for earth life-forms" lives in the
`<title>`, the meta description, the Open Graph card, the JSON-LD, a screen-reader-only
heading, and a once-per-device spoken introduction.

## 1. Sign in to Search Console

Go to <https://search.google.com/search-console> with the Google account that should own
the properties (the company account, not a personal one, so access survives staff changes).

## 2. Add each site as a property

Do this twice, once per domain. Pick **one** of the two verification methods.

### 2a. Domain property (recommended, covers www, http and https at once)

1. Choose **Domain**, type `earth1.co`, press Continue.
2. Search Console shows a TXT record like `google-site-verification=abc123...`.
3. In Cloudflare DNS for `earth1.co`, add a **TXT** record: name `@`, content exactly that
   string, TTL auto. Save.
4. Back in Search Console press **Verify**. DNS can take a few minutes; if it fails, wait and
   press Verify again rather than adding a second record.
5. Repeat for `e1-4.com`.

### 2b. URL-prefix property with the HTML tag (no DNS change)

1. Choose **URL prefix**, type `https://earth1.co`, press Continue.
2. Open **HTML tag**. It shows `<meta name="google-site-verification" content="XYZ" />`.
   Copy only the `content` value (`XYZ`).
3. In Vercel, project **earth1-co**, Settings, Environment Variables: add
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = `XYZ` for Production. Redeploy the latest
   production deployment so the tag is rendered.
4. Check `view-source:https://earth1.co/` contains the meta tag, then press **Verify**.
5. Repeat for `https://e1-4.com` with the **e1-4-com** project.

Leave the variable in place afterwards: Google re-checks it from time to time and drops the
property if the tag disappears.

## 3. Submit the sitemaps

In each property, left menu, **Sitemaps**: enter `sitemap.xml` and press Submit. Status should
read "Success" within a day. If it says "Couldn't fetch", open the sitemap URL in a browser
to confirm it is reachable, then resubmit.

## 4. Ask for the home pages right away

Still in each property, paste the home URL into the search bar at the top (**URL Inspection**)
and press **Request indexing**. Do the same for the handful of pages that matter most:

- earth1.co: `/`, `/quantum-mechanics`, `/quantum-computing`, `/global-citizenship`, `/founder`
- e1-4.com: `/`, `/privacy`

Requests are rate-limited to roughly a dozen a day; the sitemap covers the rest.

## 5. What to expect, and how to check

- First crawl usually within a few days; first results in a week or two.
- In the property, **Pages** shows what is indexed and why anything was skipped.
- `site:earth1.co` and `site:e1-4.com` in Google show what has landed.
- **Enhancements** will list the Organization / WebSite structured data once Google has read
  it. The home pages can be checked today at <https://search.google.com/test/rich-results>.
- Preview the link cards at <https://www.opengraph.xyz/> or by pasting the URL into a chat
  app.

## 6. Optional, same account, five minutes

- **Bing Webmaster Tools** (<https://www.bing.com/webmasters>) can import the Search Console
  properties in one click and covers Bing, DuckDuckGo and Copilot.
- **Google Business Profile** for Earth 1 Coalescent is a separate product and not needed for
  indexing.

## Troubleshooting

| Symptom                                       | Cause                                                        | Fix                                                                  |
| --------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| Verify fails with the HTML tag                | Variable set but no redeploy, or set on Preview only         | Set for Production, redeploy, check view-source                      |
| "Excluded by robots.txt" on an e1-4 URL       | Intended: app surfaces (`/stream`, `/talk`, ...) are private | Nothing; only `/` and `/privacy` should index                        |
| "Duplicate, Google chose different canonical" | `www` and apex both live                                     | Keep the redirect from `www` to the apex in Vercel domains           |
| Title in results differs from `<title>`       | Google rewrites titles it finds unclear                      | Leave it; the description and JSON-LD still carry "earth life-forms" |
