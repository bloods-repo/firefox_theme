// ==UserScript==
// @name           URL to Site Title
// @description    Shows site name in urlbar when not focused, full URL when focused
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
    "discord.gg": "Discord",
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
      // Check exact match
      if (DOMAINS[host]) return DOMAINS[host];
      // Check parent domain (e.g. mail.google.com → google.com)
      const parts = host.split(".");
      if (parts.length > 2) {
        const parent = parts.slice(-2).join(".");
        if (DOMAINS[parent]) return DOMAINS[parent];
      }
      // Fallback: capitalize first part of domain
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch (e) {
      return null;
    }
  }

  function updateUrlbar(urlbar) {
    const input = urlbar.querySelector("#urlbar-input");
    if (!input) return;

    const realUrl = gBrowser.currentURI?.spec;
    if (!realUrl || realUrl === "about:blank" || realUrl === "about:newtab") return;

    const isFocused = urlbar.hasAttribute("focused") || urlbar.hasAttribute("open");

    if (!isFocused) {
      const name = getSiteName(realUrl);
      if (name && input.value !== name) {
        input._realValue = input.value;
        input.value = name;
        input.style.textAlign = "center";
      }
    } else {
      if (input._realValue) {
        input.value = input._realValue;
        input._realValue = null;
      }
      input.style.textAlign = "left";
    }
  }

  function init() {
    const urlbar = document.getElementById("urlbar");
    if (!urlbar) return;

    // On page load / tab change
    gBrowser.tabContainer.addEventListener("TabSelect", () => {
      setTimeout(() => updateUrlbar(urlbar), 100);
    });

    // On navigation
    gBrowser.addTabsProgressListener({
      onLocationChange() {
        setTimeout(() => updateUrlbar(urlbar), 100);
      },
    });

    // On focus/blur
    urlbar.addEventListener("focus", () => updateUrlbar(urlbar));
    urlbar.addEventListener("blur", () => setTimeout(() => updateUrlbar(urlbar), 50));

    // Attribute changes (focused, open)
    new MutationObserver(() => updateUrlbar(urlbar)).observe(urlbar, {
      attributes: true,
      attributeFilter: ["focused", "open"],
    });

    // Initial update
    setTimeout(() => updateUrlbar(urlbar), 500);
  }

  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init, { once: true });
  }
})();
