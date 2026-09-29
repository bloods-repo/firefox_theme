// ==UserScript==
// @name           URL to Site Title
// @description    Shows site name overlay in urlbar when not focused
// ==/UserScript==

(function () {
  const DOMAINS = {
    "github.com": "GitHub",
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
    "google.com": "Google",
    "gmail.com": "Gmail",
    "reddit.com": "Reddit",
    "twitter.com": "Twitter",
    "x.com": "X",
    "instagram.com": "Instagram",
    "facebook.com": "Facebook",
    "wikipedia.org": "Wikipedia",
    "stackoverflow.com": "Stack Overflow",
    "twitch.tv": "Twitch",
    "discord.com": "Discord",
    "notion.so": "Notion",
    "figma.com": "Figma",
    "claude.ai": "Claude",
    "anthropic.com": "Anthropic",
    "chatgpt.com": "ChatGPT",
    "openai.com": "OpenAI",
    "spotify.com": "Spotify",
    "netflix.com": "Netflix",
    "duckduckgo.com": "DuckDuckGo",
    "pornhub.com": "Pornhub",
    "smutbase.com": "Smutbase",
    "pinterest.com": "Pinterest",
    "vk.com": "VK",
    "t.me": "Telegram",
    "telegram.org": "Telegram",
    "paypal.com": "PayPal",
    "amazon.com": "Amazon",
    "ebay.com": "eBay",
    "localhost": "Localhost",
  };

  function getSiteName(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if (DOMAINS[host]) return DOMAINS[host];
      const parts = host.split(".");
      if (parts.length > 2) {
        const parent = parts.slice(-2).join(".");
        if (DOMAINS[parent]) return DOMAINS[parent];
      }
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch (e) {
      return null;
    }
  }

  function init() {
    const urlbar = document.getElementById("urlbar");
    if (!urlbar) return;

    const inputBox = urlbar.querySelector(".urlbar-input-box");
    const input = urlbar.querySelector("#urlbar-input");
    if (!inputBox || !input) return;

    // Overlay поверх input — сам input не трогаем
    const overlay = document.createElement("div");
    overlay.id = "url-title-overlay";
    overlay.style.cssText = `
      position: absolute;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      color: inherit;
      font: inherit;
      z-index: 10;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;

    inputBox.style.position = "relative";
    inputBox.appendChild(overlay);

    function update() {
      const isFocused = urlbar.hasAttribute("focused") || urlbar.hasAttribute("open");
      const url = gBrowser.currentURI?.spec;

      if (!isFocused && url && !url.startsWith("about:")) {
        const name = getSiteName(url);
        if (name) {
          overlay.textContent = name;
          overlay.style.display = "flex";
          input.style.opacity = "0";
          return;
        }
      }

      overlay.style.display = "none";
      input.style.opacity = "1";
    }

    new MutationObserver(update).observe(urlbar, {
      attributes: true,
      attributeFilter: ["focused", "open"],
    });

    gBrowser.tabContainer.addEventListener("TabSelect", () => setTimeout(update, 150));

    gBrowser.addTabsProgressListener({
      onLocationChange() { setTimeout(update, 150); }
    });

    setTimeout(update, 600);
  }

  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init, { once: true });
  }
})();
