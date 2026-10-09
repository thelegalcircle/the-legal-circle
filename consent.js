(function () {
  "use strict";

  var STORAGE_KEY = "tlc_optional_tracking";
  var STORAGE_LIFETIME = 180 * 24 * 60 * 60 * 1000;
  var GTM_ID = "GTM-M3MTPBTV";
  var GA4_ID = "G-QZK4G9K20V";
  var gtmLoaded = false;
  var lastFocus = null;

  function getPreference() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (!saved || (saved.choice !== "accepted" && saved.choice !== "rejected")) return null;
      if (!saved.savedAt || Date.now() - saved.savedAt > STORAGE_LIFETIME) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return saved.choice;
    } catch (error) {
      return null;
    }
  }

  function savePreference(choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: choice, savedAt: Date.now() }));
    } catch (error) {
      // The current-page choice still applies when browser storage is unavailable.
    }
  }

  function loadGoogleTagManager() {
    if (gtmLoaded || document.querySelector("script[data-tlc-gtm]")) return;
    gtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
    var analytics = document.createElement("script");
    analytics.async = true;
    analytics.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
    analytics.setAttribute("data-tlc-ga4", GA4_ID);
    document.head.appendChild(analytics);
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID);
    script.setAttribute("data-tlc-gtm", GTM_ID);
    document.head.appendChild(script);
  }

  function removeKnownOptionalCookies() {
    var names = ["_ga", "_gid", "_gat", "_gcl_au", "_gcl_aw", "_gcl_dc"];
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.trim().split('=')[0];
      if (/^_ga_/.test(name)) names.push(name);
    });
    var hostname = window.location.hostname;
    var domains = ["", hostname, "." + hostname, ".thelegalcircle.ca"];

    names.forEach(function (name) {
      domains.forEach(function (domain) {
        var domainPart = domain ? "; domain=" + domain : "";
        document.cookie = name + "=; Max-Age=0; path=/" + domainPart + "; SameSite=Lax";
      });
    });
  }

  function buildInterface() {
    var banner = document.createElement("section");
    banner.className = "tlc-consent-banner";
    banner.setAttribute("aria-labelledby", "tlc-consent-title");
    banner.innerHTML =
      '<div class="tlc-consent-copy">' +
        '<h2 id="tlc-consent-title">Your privacy choices</h2>' +
        '<p>We use essential services to operate the site. With your permission, Google Analytics and Google Tag Manager load optional measurement tools. <a href="/privacy-policy/#cookies">Read our Privacy Policy</a>.</p>' +
      '</div>' +
      '<div class="tlc-consent-actions">' +
        '<button class="tlc-consent-button tlc-consent-accept" type="button">Accept optional</button>' +
        '<button class="tlc-consent-button tlc-consent-reject" type="button">Reject optional</button>' +
        '<button class="tlc-consent-manage" type="button">Manage preferences</button>' +
      '</div>';

    var backdrop = document.createElement("div");
    backdrop.className = "tlc-consent-backdrop";
    backdrop.hidden = true;
    backdrop.innerHTML =
      '<section class="tlc-consent-dialog" role="dialog" aria-modal="true" aria-labelledby="tlc-preferences-title">' +
        '<button class="tlc-consent-close" type="button" aria-label="Close cookie preferences">&times;</button>' +
        '<p class="tlc-eyebrow">Privacy</p>' +
        '<h2 id="tlc-preferences-title">Cookie preferences</h2>' +
        '<div class="tlc-consent-option tlc-consent-essential">' +
          '<div><strong>Essential functionality</strong><p>Required for core site features and preference storage. Always active.</p></div><span aria-hidden="true">On</span>' +
        '</div>' +
        '<label class="tlc-consent-option" for="tlc-optional-tracking">' +
          '<div><strong>Optional measurement</strong><p>Allows Google Analytics and Google Tag Manager to measure website visits.</p></div>' +
          '<input id="tlc-optional-tracking" type="checkbox">' +
        '</label>' +
        '<button class="tlc-consent-button tlc-consent-save" type="button">Save preferences</button>' +
      '</section>';

    document.body.appendChild(banner);
    document.body.appendChild(backdrop);

    var optional = backdrop.querySelector("#tlc-optional-tracking");
    var dialog = backdrop.querySelector(".tlc-consent-dialog");

    function hideBanner() {
      banner.hidden = true;
    }

    function closeDialog() {
      backdrop.hidden = true;
      document.body.classList.remove("tlc-consent-open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    function openDialog(trigger) {
      lastFocus = trigger || document.activeElement;
      optional.checked = getPreference() === "accepted";
      backdrop.hidden = false;
      document.body.classList.add("tlc-consent-open");
      window.setTimeout(function () { dialog.querySelector(".tlc-consent-close").focus(); }, 0);
    }

    function applyPreference(choice) {
      var previous = getPreference();
      savePreference(choice);
      hideBanner();
      closeDialog();
      if (choice === "accepted") {
        loadGoogleTagManager();
      } else {
        removeKnownOptionalCookies();
        if (previous === "accepted" || gtmLoaded) window.location.reload();
      }
    }

    banner.querySelector(".tlc-consent-accept").addEventListener("click", function () { applyPreference("accepted"); });
    banner.querySelector(".tlc-consent-reject").addEventListener("click", function () { applyPreference("rejected"); });
    banner.querySelector(".tlc-consent-manage").addEventListener("click", function (event) { openDialog(event.currentTarget); });
    backdrop.querySelector(".tlc-consent-close").addEventListener("click", closeDialog);
    backdrop.querySelector(".tlc-consent-save").addEventListener("click", function () { applyPreference(optional.checked ? "accepted" : "rejected"); });
    backdrop.addEventListener("click", function (event) { if (event.target === backdrop) closeDialog(); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !backdrop.hidden) closeDialog();
      if (event.key === "Tab" && !backdrop.hidden) {
        var focusable = dialog.querySelectorAll('button, input, a[href]');
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });

    document.querySelectorAll(".tlc-footer nav").forEach(function (footerNav) {
      var trigger = document.createElement("button");
      trigger.className = "tlc-cookie-preferences-trigger";
      trigger.type = "button";
      trigger.textContent = "Cookie preferences";
      trigger.addEventListener("click", function () { openDialog(trigger); });
      footerNav.appendChild(trigger);
    });

    var preference = getPreference();
    if (preference === "accepted") {
      hideBanner();
      loadGoogleTagManager();
    } else if (preference === "rejected") {
      hideBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildInterface);
  } else {
    buildInterface();
  }
})();
