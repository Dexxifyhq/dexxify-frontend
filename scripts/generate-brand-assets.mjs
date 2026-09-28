/**
 * Generates the site's icon and social-card files from public/logo-set/.
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Writes into src/app/, where Next.js picks them up by file convention and
 * emits the <link>/<meta> tags itself:
 *
 *   favicon.ico          16/32/48 px — replaces the old-logo favicon
 *   icon.png             512 px      — browser tabs, Android, and the logo
 *                                      the homepage's structured data points to
 *   apple-icon.png       180 px      — iOS home screen
 *   opengraph-image.png  1200×630    — link previews (Google, WhatsApp, Slack,
 *                                      LinkedIn, iMessage)
 *   twitter-image.png    1200×630    — X/Twitter cards
 *
 * Icons use the white "D" mark on Carbon Black (#212529, the ramp's darkest
 * step) so they read on both light and dark tab bars — a black mark on a
 * transparent background disappears on dark tabs. The social card is the black
 * wordmark on white with the site's tagline, matching the marketing pages.
 *
 * Re-run whenever the logo changes, then commit the outputs.
 */
import { readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const require = createRequire(import.meta.url);

// sharp ships with Next.js but pnpm doesn't hoist it, so find it in the store.
function loadSharp() {
  try {
    return require("sharp");
  } catch {
    const store = path.join(root, "node_modules", ".pnpm");
    const dir = readdirSync(store).find((d) => d.startsWith("sharp@"));
    if (!dir) throw new Error("sharp not found — run `pnpm install` first.");
    return require(path.join(store, dir, "node_modules", "sharp"));
  }
}
const sharp = loadSharp();

const LOGOS = path.join(root, "public", "logo-set");
const OUT = path.join(root, "src", "app");

const CARBON = "#212529"; // --n-900
const MUTED = "#6C757D"; // --n-500
const TAGLINE = "Crypto payments and payouts, settled in Naira.";

/** The white D mark, trimmed of its transparent margin. */
async function whiteMark() {
  return sharp(path.join(LOGOS, "transparent-1.png")).trim({ threshold: 10 }).toBuffer();
}

/** Square icon: white mark centred on Carbon Black, mark at `ratio` of the side. */
async function squareIcon(size, ratio = 0.6) {
  const markSize = Math.round(size * ratio);
  const mark = await sharp(await whiteMark())
    .resize(markSize, markSize, { fit: "inside" })
    .toBuffer();
  const { width, height } = await sharp(mark).metadata();
  return sharp({
    create: { width: size, height: size, channels: 4, background: CARBON },
  })
    .composite([
      {
        input: mark,
        left: Math.round((size - width) / 2),
        top: Math.round((size - height) / 2),
      },
    ])
    .png()
    .toBuffer();
}

/**
 * ICO container holding PNG images (supported by every current browser).
 * Header: reserved(2)=0, type(2)=1, count(2). Each 16-byte directory entry:
 * width, height, colours=0, reserved=0, planes(2)=1, bpp(2)=32, size(4), offset(4).
 */
function toIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

/** 1200×630 social card: black wordmark on white, tagline beneath. */
async function socialCard() {
  const W = 1200;
  const H = 630;
  const wordmark = await sharp(path.join(LOGOS, "dexxify-tight.png"))
    .resize({ width: 620 })
    .toBuffer();
  const { width: ww, height: wh } = await sharp(wordmark).metadata();

  const tagline = Buffer.from(
    `<svg width="${W}" height="80" xmlns="http://www.w3.org/2000/svg">
       <text x="50%" y="50" text-anchor="middle"
             font-family="Segoe UI, Helvetica, Arial, sans-serif"
             font-size="38" fill="${MUTED}">${TAGLINE}</text>
     </svg>`,
  );

  const top = Math.round((H - wh) / 2) - 40;
  return sharp({
    create: { width: W, height: H, channels: 4, background: "#FFFFFF" },
  })
    .composite([
      { input: wordmark, left: Math.round((W - ww) / 2), top },
      { input: tagline, left: 0, top: top + wh + 40 },
    ])
    .png()
    .toBuffer();
}

const write = (name, buf) => {
  writeFileSync(path.join(OUT, name), buf);
  console.log(`wrote src/app/${name}  (${(buf.length / 1024).toFixed(0)} KB)`);
};

write("icon.png", await squareIcon(512));
write("apple-icon.png", await squareIcon(180));
write(
  "favicon.ico",
  toIco(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({
        size,
        // A touch larger at tiny sizes so the mark stays legible.
        data: await squareIcon(size, size <= 16 ? 0.78 : 0.68),
      })),
    ),
  ),
);
const card = await socialCard();
write("opengraph-image.png", card);
write("twitter-image.png", card);
