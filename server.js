// server.js
// Simple proxy with two endpoints:
// 1) GET /fetch?url=...  -> fetch raw HTML/text via axios
// 2) GET /render?url=... -> use puppeteer to fully render page (runs JS) and returns outerHTML
//
// Protect with ?key=YOUR_PROXY_KEY
//
// NOTE: Deploy this on Render/Vercel/Replit/ Railway (see instructions below).

const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;
const PROXY_KEY = process.env.PROXY_KEY || "CHANGE_THIS_TO_A_SECRET";

// optional puppeteer for JS-rendered pages
let usePuppeteer = false;
let puppeteer;
try {
  puppeteer = require("puppeteer");
  usePuppeteer = true;
} catch (e) {
  console.log("Puppeteer not installed; /render will return error unless installed.");
}

// small helper: validate and normalize URL
function normalizeUrl(raw) {
  if (!raw) return null;
  try {
    let u = raw;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    const parsed = new URL(u);
    return parsed.toString();
  } catch (e) {
    return null;
  }
}

app.get("/", (req, res) => {
  res.send("Roser proxy alive");
});

app.get("/fetch", async (req, res) => {
  const key = req.query.key;
  if (key !== PROXY_KEY) return res.status(401).json({ error: "invalid key" });

  const rawUrl = req.query.url;
  const url = normalizeUrl(rawUrl);
  if (!url) return res.status(400).json({ error: "invalid url" });

  try {
    // simple GET, return text/html
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "RoserProxy/1.0 (+https://yourdomain.example/)"
      },
      timeout: 15000,
      responseType: "text"
    });

    // optional: you can parse to extract title/meta if you want
    const html = response.data;
    // quick title extraction
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    return res.json({
      ok: true,
      url,
      title,
      html,            // full html as string (could be large)
      timestamp: Date.now()
    });
  } catch (err) {
    console.error("fetch err:", err.message || err);
    return res.status(500).json({ error: "fetch_failed", detail: err.message || "" });
  }
});

app.get("/render", async (req, res) => {
  const key = req.query.key;
  if (key !== PROXY_KEY) return res.status(401).json({ error: "invalid key" });

  const rawUrl = req.query.url;
  const url = normalizeUrl(rawUrl);
  if (!url) return res.status(400).json({ error: "invalid url" });

  if (!usePuppeteer) {
    return res.status(501).json({ error: "puppeteer_not_installed" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent("RoserProxy/puppeteer");
    // navigate and wait for network idle to allow JS to run
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // get outerHTML after render
    const html = await page.content();

    // optional: extract page title and some metadata
    const title = await page.title();

    await browser.close();
    return res.json({
      ok: true,
      url,
      title,
      html,
      timestamp: Date.now()
    });
  } catch (err) {
    if (browser) try { await browser.close(); } catch(e) {}
    console.error("render err:", err.message || err);
    return res.status(500).json({ error: "render_failed", detail: err.message || "" });
  }
});

app.listen(port, () => {
  console.log(`Roser proxy listening on port ${port}`);
});
