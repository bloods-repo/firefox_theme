// ==UserScript==
// @name           Sidebar Hover Reveal
// @description    Reveals the hidden sidebar when the cursor touches the left window edge
// @include        main
// ==/UserScript==

(function () {
  const EDGE_WIDTH = 6;   // px: ширина невидимой зоны у левого края
  const HIDE_DELAY = 500; // ms: задержка перед скрытием после ухода мыши
  const TAG = "[sidebar-hover]";

  function init() {
    // В Firefox 151 у <sidebar-main> нет id, поэтому берём внешний контейнер
    const sidebar = document.getElementById("sidebar-container");
    const toggleKey = document.getElementById("toggleSidebarKb");

    if (!sidebar || !toggleKey) {
      console.warn(TAG, "elements not found", {
        sidebar: !!sidebar,
        toggleKey: !!toggleKey,
      });
      return;
    }

    // Невидимая зона у левого края
    const zone = document.createElement("div");
    zone.id = "sidebar-hover-zone";
    zone.style.cssText = `
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: ${EDGE_WIDTH}px;
      z-index: 2147483647;
      background: transparent;
    `;
    document.documentElement.appendChild(zone);

    const isVisible = () => sidebar.getBoundingClientRect().width > 0;

    let autoOpened = false; // панель открыта нами, а не вручную
    let busy = false;
    let hideTimer = null;

    // Тот же эффект, что и Ctrl+Alt+Z
    function toggle(expectVisible) {
      if (busy) return;
      busy = true;
      try {
        toggleKey.doCommand();
      } catch (e) {
        console.error(TAG, "toggle failed", e);
      }
      setTimeout(() => {
        busy = false;
        if (isVisible() !== expectVisible) {
          console.warn(TAG, "toggle did not change sidebar state");
        }
      }, 400);
    }

    function updateZone() {
      const visible = isVisible();
      zone.style.display = visible ? "none" : "block";
      if (!visible) autoOpened = false;
    }

    function tryHide() {
      if (!autoOpened || !isVisible()) return;

      const popupOpen = document.querySelector(
        "menupopup[state='open'], panel[state='open']"
      );

      if (popupOpen) {
        scheduleHide(); // открыто контекстное меню, ждём
        return;
      }
      if (sidebar.matches(":hover")) return;

      autoOpened = false;
      toggle(false);
    }

    function scheduleHide() {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(tryHide, HIDE_DELAY);
    }

    zone.addEventListener("mouseenter", () => {
      clearTimeout(hideTimer);
      if (!isVisible()) {
        autoOpened = true;
        toggle(true);
      }
    });

    sidebar.addEventListener("mouseenter", () => clearTimeout(hideTimer));
    sidebar.addEventListener("mouseleave", scheduleHide);

    // Следим за появлением/исчезновением панели (в том числе по Ctrl+Alt+Z)
    new ResizeObserver(updateZone).observe(sidebar);
    updateZone();

    console.log(TAG, "ready");
  }

  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init, { once: true });
  }
})();
