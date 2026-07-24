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

  function showTitle(input) {
    const realUrl = gBrowser.currentURI?.spec;
    if (!realUrl || realUrl.startsWith("about:")) return;
    const name = getSiteName(realUrl);
    if (name) {
      input.value = name;
      input.style.textAlign = "center";
    }
  }

  function showUrl(input) {
    const realUrl = gBrowser.currentURI?.spec;
    if (realUrl) {
      input.value = realUrl;
      input.style.textAlign = "left";
    }
  }

  function init() {
    const urlbar = document.getElementById("urlbar");
    if (!urlbar) return;
    const input = urlbar.querySelector("#urlbar-input");
    if (!input) return;

    // Blur — показываем название
    urlbar.addEventListener("blur", () => {
      setTimeout(() => {
        if (!urlbar.hasAttribute("focused") && !urlbar.hasAttribute("open")) {
          showTitle(input);
        }
      }, 100);
    });

    // Focus — показываем полный URL
    urlbar.addEventListener("focus", () => {
      showUrl(input);
      input.select();
    });

    // Следим за атрибутами focused/open
    new MutationObserver(() => {
      const isFocused = urlbar.hasAttribute("focused") || urlbar.hasAttribute("open");
      if (!isFocused) {
        setTimeout(() => showTitle(input), 100);
      }
    }).observe(urlbar, {
      attributes: true,
      attributeFilter: ["focused", "open"],
    });

    // Смена вкладки / навигация
    gBrowser.tabContainer.addEventListener("TabSelect", () => {
      setTimeout(() => {
        if (!urlbar.hasAttribute("focused")) showTitle(input);
      }, 150);
    });

    gBrowser.addTabsProgressListener({
      onLocationChange() {
        setTimeout(() => {
          if (!urlbar.hasAttribute("focused")) showTitle(input);
        }, 150);
      },
    });

    // Начальное состояние
    setTimeout(() => showTitle(input), 600);
  }

  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init, { once: true });
  }
})();
