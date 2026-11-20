#!/usr/bin/env node
/**
 * Hundo Pizza brand asset scraper
 * Pulls images, logos, fonts and design tokens (colors, font families,
 * button styles) from hundopizza.com into the repo.
 *
 * Usage (Node 18+, no dependencies):
 *   node scripts/scrape-brand-assets.mjs
 *
 * Output:
 *   public/brand/images/   all site images (banners, logos, product shots)
 *   public/brand/fonts/    font files referenced by the site's CSS (if directly downloadable)
 *   public/brand/css/      the site's raw stylesheets, for reference
 *   brand-report.json      colors ranked by usage, font families, @font-face list,
 *                          button CSS rules, and an image manifest
 */

import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const SITE = "https://www.hundopizza.com";
const PAGES = ["/", "/our-story", "/reheat", "/partners", "/feedback"];
const OUT = "public/brand";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, as = "text") {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Referer: SITE },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return as === "buffer" ? Buffer.from(await res.arrayBuffer()) : res.text();
}

function abs(u, base) {
  try {
    return new URL(u.replace(/&amp;/g, "&"), base).toString();
  } catch {
    return null;
  }
}

function safeName(url, fallbackExt = "") {
  const u = new URL(url);
  let base = decodeURIComponent(path.basename(u.pathname)) || "file";
  base = base.replace(/[^a-zA-Z0-9._-]+/g, "_");
  if (!path.extname(base) && fallbackExt) base += fallbackExt;
  const hash = createHash("md5").update(url).digest("hex").slice(0, 6);
  const ext = path.extname(base);
  return `${path.basename(base, ext)}_${hash}${ext}`;
}

// Ask Squarespace's CDN for the largest rendition
function fullSize(url) {
  if (!/squarespace-cdn\.com|static1\.squarespace\.com/.test(url)) return url;
  const u = new URL(url);
  u.searchParams.set("format", "2500w");
  return u.toString();
}

const images = new Set();
const stylesheets = new Set();
const inlineCss = [];

console.log("→ Crawling pages");
for (const p of PAGES) {
  const url = SITE + p;
  let html;
  try {
    html = await get(url);
  } catch (e) {
    console.warn("  skip", url, e.message);
    continue;
  }
  console.log("  ✓", url);

  // Images: src, data-src, data-image, srcset, og:image, background-image
  const attrRe = /(?:src|data-src|data-image|content|href)=["']([^"']+\.(?:png|jpe?g|webp|gif|svg|ico)[^"']*)["']/gi;
  for (const m of html.matchAll(attrRe)) {
    const a = abs(m[1], url);
    if (a) images.add(a.split("?")[0]);
  }
  const srcsetRe = /srcset=["']([^"']+)["']/gi;
  for (const m of html.matchAll(srcsetRe)) {
    for (const part of m[1].split(",")) {
      const a = abs(part.trim().split(" ")[0], url);
      if (a) images.add(a.split("?")[0]);
    }
  }
  const sqImgRe = /https?:\/\/(?:images\.squarespace-cdn\.com|static1\.squarespace\.com)[^"'\s)]+/gi;
  for (const m of html.matchAll(sqImgRe)) {
    // Strip HTML-entity tails (&amp; / &quot;) that otherwise produce duplicate "_quot_" files
    if (/\.(png|jpe?g|webp|gif|svg)/i.test(m[0])) images.add(m[0].split("?")[0].replace(/&(?:amp|quot|#34|#39);.*/, ""));
  }

  // Stylesheets and inline styles
  for (const m of html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)) {
    const href = m[0].match(/href=["']([^"']+)["']/i);
    if (href) {
      const a = abs(href[1], url);
      if (a) stylesheets.add(a);
    }
  }
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) inlineCss.push(m[1]);

  await sleep(400);
}

await mkdir(`${OUT}/images`, { recursive: true });
await mkdir(`${OUT}/fonts`, { recursive: true });
await mkdir(`${OUT}/css`, { recursive: true });

console.log(`→ Downloading ${stylesheets.size} stylesheets`);
const cssTexts = [...inlineCss];
for (const s of stylesheets) {
  try {
    const css = await get(s);
    cssTexts.push(css);
    await writeFile(`${OUT}/css/${safeName(s, ".css")}`, css);
    console.log("  ✓", s);
  } catch (e) {
    console.warn("  ✗", s, e.message);
  }
}
// Strip inline data: URIs (Squarespace embeds ~1 MB base64 blobs). They contain no
// braces, so leaving them in makes the selector regexes below backtrack quadratically.
const allCss = cssTexts.join("\n").replace(/url\(\s*["']?data:[^)]*\)/gi, "url(data:…)");

// ---- Design tokens ----
const colorCounts = {};
const colorRe = /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b|rgba?\([^)]+\)|hsla?\([^)]+\)/gi;
for (const m of allCss.matchAll(colorRe)) {
  const c = m[0].toLowerCase().replace(/\s+/g, "");
  colorCounts[c] = (colorCounts[c] || 0) + 1;
}
const colors = Object.entries(colorCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40)
  .map(([value, count]) => ({ value, count }));

// Squarespace exposes site-style colors as CSS custom properties
const cssVars = {};
for (const m of allCss.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;}{]+)/g)) {
  const k = m[1];
  if (/color|accent|font|button|heading|body|radius|letter|weight|size/i.test(k)) {
    cssVars[k] = m[2].trim();
  }
}

const fontFamilies = {};
for (const m of allCss.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
  const f = m[1].trim();
  fontFamilies[f] = (fontFamilies[f] || 0) + 1;
}

const fontFaces = [];
for (const m of allCss.matchAll(/@font-face\s*{([^}]+)}/gi)) {
  const block = m[1];
  const family = (block.match(/font-family\s*:\s*([^;]+)/i) || [])[1]?.trim();
  const weight = (block.match(/font-weight\s*:\s*([^;]+)/i) || [])[1]?.trim();
  const style = (block.match(/font-style\s*:\s*([^;]+)/i) || [])[1]?.trim();
  const urls = [...block.matchAll(/url\(["']?([^"')]+)["']?\)/gi)].map((u) => u[1]);
  fontFaces.push({ family, weight, style, urls });
}

// Split into "selector { body }" rules first, then filter — linear, no backtracking.
const buttonRules = [];
for (const m of allCss.matchAll(/([^{}]{1,2000}){([^{}]*)}/g)) {
  if (buttonRules.length >= 60) break;
  const selector = m[1].trim();
  if (/button|btn|sqs-block-button/i.test(selector)) {
    buttonRules.push({ selector: selector.slice(0, 200), css: m[2].trim() });
  }
}

// ---- Fonts ----
console.log(`→ Downloading fonts from ${fontFaces.length} @font-face rules`);
const fontFiles = [];
// Squarespace ships its theme-default Google fonts and internal icon fonts on every site.
// hundopizza.com overrides them with TheMixMono in its custom CSS, so only download fonts
// that are not Squarespace defaults/internals. (They are still listed in fontFaces.)
const SKIP_FONTS = /squarespace-ui-font|social-icon-font|^'?(Source Code Pro|Abel)'?$/i;
for (const ff of fontFaces) {
  if (ff.family && SKIP_FONTS.test(ff.family.replace(/["]/g, "'").trim())) continue;
  for (const u of ff.urls) {
    if (u.startsWith("data:")) continue;
    const a = abs(u, SITE);
    if (!a) continue;
    try {
      const buf = await get(a, "buffer");
      const name = safeName(a, ".woff2");
      await writeFile(`${OUT}/fonts/${name}`, buf);
      fontFiles.push({ family: ff.family, weight: ff.weight, style: ff.style, file: `/brand/fonts/${name}` });
      console.log("  ✓", ff.family, ff.weight || "");
    } catch (e) {
      console.warn("  ✗", ff.family, e.message, "(may be served by Adobe Fonts with domain locking)");
    }
  }
}

// ---- Images ----
console.log(`→ Downloading ${images.size} images`);
const imageManifest = [];
for (const img of images) {
  const src = fullSize(img);
  try {
    const buf = await get(src, "buffer");
    const name = safeName(img);
    await writeFile(`${OUT}/images/${name}`, buf);
    const isLogo = /logo|title|favicon/i.test(img);
    imageManifest.push({ source: img, file: `/brand/images/${name}`, bytes: buf.length, likelyLogo: isLogo });
    console.log("  ✓", name);
  } catch (e) {
    console.warn("  ✗", img, e.message);
  }
  await sleep(150);
}

const report = {
  scrapedFrom: SITE,
  scrapedAt: new Date().toISOString(),
  pages: PAGES,
  cssCustomProperties: cssVars,
  colorsByUsage: colors,
  fontFamiliesByUsage: Object.entries(fontFamilies)
    .sort((a, b) => b[1] - a[1])
    .map(([family, count]) => ({ family, count })),
  fontFaces,
  downloadedFonts: fontFiles,
  buttonRules,
  images: imageManifest,
};
await writeFile("brand-report.json", JSON.stringify(report, null, 2));

console.log(`
Done.
  Images: ${imageManifest.length}  →  ${OUT}/images
  Fonts:  ${fontFiles.length}  →  ${OUT}/fonts
  Report: brand-report.json

Next: open hundopizza.com in Chrome DevTools, inspect the "Give me pizza" button,
the header, body text and the "Alt-Dough!" heading, and confirm which of the
reported colors/fonts they use. Then fill src/styles/tokens.css.`);
