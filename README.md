# Granite North Advisors

The marketing site for Granite North Advisors LLC: one static page built with [Astro](https://astro.build) and plain CSS. It ships no client-side JavaScript, cookies or third-party requests.

## Run it locally

Requires Node 24 (see `.node-version`).

```sh
npm install
npm run dev        # http://localhost:4321, live reload
npm run build      # static output in dist/
npm run preview    # serve dist/ the way production will
```

## Headshots

The photos live at:

```
src/assets/team/john-clemente.jpg
src/assets/team/shawn-coe.jpg
```

To replace one, overwrite the file. On the next build each photo is cropped to 224×224 and converted to AVIF and WebP. If a file is missing, the dashed `[PHOTO]` placeholder shows instead. `.jpeg`, `.png` and `.webp` work too, as long as the base name matches. Strip location and camera metadata before committing a new photo, since this repo is public.

## Change the domain

Edit `SITE_URL` in `src/site.config.ts`. The canonical URL, Open Graph and Twitter tags, JSON-LD, `robots.txt` and `sitemap.xml` all read from it. Contact details and the address live in the same file.

## Where things are

| Path | What it is |
| --- | --- |
| `src/pages/index.astro` | The page: title, meta description, section order |
| `src/components/` | One component per section, plus `MountainMark` and `Headshot` |
| `src/styles/tokens.css` | Colors, type sizes, spacing as CSS custom properties |
| `src/styles/global.css` | Base styles, focus ring, skip link, shared classes |
| `src/layouts/Base.astro` | `<head>`: meta tags, fonts, favicons, JSON-LD |
| `amplify.yml` | Build spec plus security and cache headers for AWS Amplify |
| `scripts/make-icons.mjs` | Regenerates the favicon set and `og.png` (`npm run icons`, needs Google Chrome) |

Fonts (Archivo and Source Sans 3) are self-hosted from `@fontsource`, Latin subset only. Fallback fonts are metric-matched, so the swap doesn't move the layout.

## Deploy (AWS Amplify)

**From Git:** in the AWS Amplify console, choose Create new app → Host web app → GitHub, authorize access to this repo, and pick the `main` branch. Amplify detects `amplify.yml` and uses it for the build and the response headers; no extra build settings are needed.

Then add the custom domain under the app's **Hosting → Custom domains** tab. Amplify issues an ACM certificate and gives you the DNS records to add at your registrar.

The build spec pins Node 24 (via `nvm`) to match `.node-version`, builds with `npm run build`, and publishes the `dist/` directory.

## Ground rules

- Every contact action is a `mailto:` or `tel:` link. Don't add forms. People will type patient details into anything that looks like one.
- No trackers, chat widgets or cookies. If you add analytics, use a cookieless one (e.g. Plausible), and update the CSP in `amplify.yml` to allow it.
