  // The click-through preview (the fold's screen on the first page, the device on the
  // others), shared by every page of the site. Every
  // screen is plain markup in the page; this decides which one shows and puts a mark on
  // the next thing to click. Nothing plays by itself: the viewer does every click.
  // Each page hands over its own scenes as window.PREVIEW_PAGE (the states of the
  // click-through, the words under the device, the report's page names, where it starts),
  // defined in the page before this file runs.
  (function () {
    var stage = document.getElementById("stage");
    var phone = document.getElementById("phone");
    if (!stage || !phone) return;
    function $(id) { return document.getElementById(id); }
    function all(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    var app = phone.querySelector(".app");
    var guide = $("demo-guide"), hint = $("demo-hint"), stepsEl = $("demo-steps"), claim = $("demo-claim");
    var nextBtn = $("demo-next"), againBtn = $("demo-again"), foot = $("demo-foot"), also = $("demo-also");
    var flag = $("flag"), tip = $("tip"), tipDone = $("tip-done"), cap = $("device-cap");
    var resScroll = $("res-scroll"), thumb = $("res-thumb");
    var demo = $("try"), dEmpty = $("d-empty"), dRes = $("d-res"), dDue = $("d-due");
    var nPlot = phone.querySelector(".n-plot"), nWhen = $("n-when"), nDate = $("n-date"), nAsk = $("n-ask");
    var nLines = all(phone, ".n-s"), nMods = all(phone, ".n-mods [data-mod]"), pdf = $("pdf-scroll"), hints = $("demo-hints");
    var chips = all(document, "[data-scene]");
    var screens = all(phone, "[data-screen]");
    var overlays = all(phone, "[data-overlay]");
    var tabs = all(phone, "[data-tab]");
    var panes = all(phone, "[data-pane]");
    var stepItems = stepsEl ? all(stepsEl, "li") : [];
    var still = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var timers = [];
    var current = "report-desk", noahDrawn = false;
    var marked = null, markSpec = null;

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function stopTimers() { timers.forEach(clearTimeout); timers.length = 0; }

    // Today's date in the sample screens, so the preview never looks stale.
    (function () {
      function shift(days) { var d = new Date(); d.setDate(d.getDate() + days); return d; }
      all(document, "[data-d]").forEach(function (el) {
        var d = shift(parseInt(el.getAttribute("data-d"), 10) || 0);
        el.textContent = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
      });
      all(document, "[data-md]").forEach(function (el) {
        var d = shift(parseInt(el.getAttribute("data-md"), 10) || 0);
        el.textContent = (d.getMonth() + 1) + "/" + d.getDate();
      });
      var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      all(document, "[data-dl]").forEach(function (el) {
        var d = shift(parseInt(el.getAttribute("data-dl"), 10) || 0);
        el.textContent = months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
      });
      // The sample patient's last test: about two years ago (today less two years and 23 days).
      var old = new Date(); old.setFullYear(old.getFullYear() - 2); old.setDate(old.getDate() - 23);
      all(document, "[data-old]").forEach(function (el) {
        el.textContent = (old.getMonth() + 1) + "/" + old.getDate() + "/" + old.getFullYear();
      });
    })();

    // The month over the number cards is always the current one.
    (function () {
      var el = $("kpi-month");
      if (!el) return;
      var names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var d = new Date();
      el.textContent = names[d.getMonth()] + " " + d.getFullYear();
    })();

    // The finished report inside the Preview step is the same sample report shown below, every page of it.
    (function () {
      var book = $("book"), slot = $("pdf-slot");
      if (!book || !slot) return;
      all(book, ".sheet").forEach(function (sheet) {
        var copy = sheet.cloneNode(true);
        copy.removeAttribute("id");
        copy.removeAttribute("data-page");
        copy.hidden = false;
        copy.classList.remove("turn-next", "turn-prev");
        slot.appendChild(copy);
      });
    })();

    // The seal on the Open in Noah button is the certification seal already on the page.
    (function () {
      var seal = document.querySelector(".cert-seal");
      if (!seal) return;
      all(phone, "img[data-seal]").forEach(function (i) { i.src = seal.src; });
    })();

    // The audiogram in Noah's window and on the chart is the report's own, so they all match.
    (function () {
      var plot = phone.querySelector(".res-audio");
      if (!plot) return;
      all(phone, "[data-aud]").forEach(function (slot) {
        var c = plot.cloneNode(true);
        c.setAttribute("class", "aud");
        all(c, "polyline").forEach(function (l) { l.setAttribute("pathLength", "1"); l.setAttribute("class", "aud-line"); });
        Array.prototype.slice.call(c.children).forEach(function (g) {
          if (g.tagName.toLowerCase() !== "g" || g.querySelector("text")) return;
          Array.prototype.slice.call(g.children).forEach(function (m, i) {
            m.setAttribute("class", "aud-mark");
            m.style.animationDelay = (0.45 + i * 0.17).toFixed(2) + "s";
          });
        });
        slot.appendChild(c);
      });
    })();

    // In Noah: whether the test shows as saved (its line under Sessions, its date over the audiogram).
    function noahShown(n) {
      nLines.forEach(function (l, i) { l.hidden = i >= n; });
      if (nDate) nDate.style.visibility = n > 0 ? "" : "hidden";
      if (nWhen) nWhen.style.visibility = n > 0 ? "" : "hidden";
    }
    function noahModule(which) {
      nMods.forEach(function (m) { m.classList.toggle("on", m.getAttribute("data-mod") === which); });
    }
    // The test goes into Noah: the audiogram draws itself, then shows as saved.
    function noahSaved() {
      noahShown(PAGE.noahLines || 1); noahModule(""); noahDrawn = true;
      if (PAGE.afterNoah) PAGE.afterNoah();
    }
    function drawInNoah() {
      if (!nPlot) return;
      nPlot.classList.remove("draw");
      if (noahDrawn || still) { noahSaved(); return; }
      noahShown(0);
      noahModule("audio");
      void nPlot.offsetWidth;
      nPlot.classList.add("draw");
      later(noahSaved, 2300);
    }
    // Back on the chart: the results are there, and so is the amber Report due.
    function landOnChart() {
      if (!dRes || !dEmpty) return;
      var was = dRes.hidden;
      dEmpty.hidden = true;
      dRes.hidden = false;
      if (dDue) dDue.hidden = false;
      if (was && !still) {
        dRes.classList.remove("in"); void dRes.offsetWidth; dRes.classList.add("in");
        if (dDue) { dDue.classList.remove("in"); void dDue.offsetWidth; dDue.classList.add("in"); }
      }
    }
    function resetDesk() {
      noahDrawn = false;
      if (PAGE.onResetDesk) PAGE.onResetDesk();
      if (dEmpty) dEmpty.hidden = false;
      if (dRes) dRes.hidden = true;
      if (dDue) dDue.hidden = true;
      noahShown(0);
      noahModule("");
    }

    // When one device becomes another (the computer, the kiosk, the phone), bring it into view if the viewer was looking at it.
    function keepInView() {
      var r = phone.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var bar = document.querySelector(".top");
      var top0 = (bar ? bar.getBoundingClientRect().bottom : 0) + 10;
      if (r.bottom < top0 || r.top > vh) return;                 // the viewer is somewhere else on the page
      if (r.top >= top0 && r.bottom <= vh - 10) return;          // it already fits
      var dy = r.height > vh - top0 - 10 ? r.top - top0 : (r.bottom > vh - 10 ? r.bottom - (vh - 10) : r.top - top0);
      if (Math.abs(dy) < 4) return;
      try { window.scrollBy({ top: dy, behavior: still ? "auto" : "smooth" }); } catch (err) { window.scrollBy(0, dy); }
    }

    // The device and the screen for a state. No timers are touched here.
    // Answers true when the device itself changed.
    function setStage(s) {
      var desk = s.device === "desk", wasDesk = stage.classList.contains("desk"), wasKiosk = stage.classList.contains("kiosk");
      var kiosk = s.scene === "checkin";
      stage.classList.toggle("kiosk", kiosk);
      stage.classList.toggle("desk", desk);
      var changed = desk !== wasDesk || kiosk !== wasKiosk;
      if (demo) {
        demo.classList.toggle("is-desk", desk);
        if (changed && !still) { demo.classList.remove("swap"); void demo.offsetWidth; demo.classList.add("swap"); }
      }
      screens.forEach(function (el) { el.hidden = el.getAttribute("data-screen") !== s.screen; });
      overlays.forEach(function (el) { el.hidden = el.getAttribute("data-overlay") !== s.overlay; });
      if (nAsk) nAsk.hidden = !s.ask;
      if (cap) cap.textContent = kiosk ? "The kiosk in your lobby" : !desk ? "On your phone"
        : "On your computer" + (s.clicks === 2 ? " · 2 clicks. Done!" : s.n ? " · click " + s.n + " of 2" : "");
      if (foot) foot.textContent = FOOT[s.scene] || FOOT.report;
      if (also) also.hidden = s.scene !== "report";
      return changed;
    }

    // The sample report turns its pages in place.
    (function () {
      var book = $("book"), prev = $("pg-prev"), next = $("pg-next"), label = $("pg-n");
      if (!book || !prev || !next || !label) return;
      var pages = all(book, ".sheet");
      var NAMES = ["The report", "Audiogram", "Tympanometry", "Otoacoustic emissions"];
      var at = 0;
      function go(to) {
        if (to < 0 || to >= pages.length || to === at) return;
        var dir = to > at ? "turn-next" : "turn-prev";
        pages[at].hidden = true;
        at = to;
        var page = pages[at];
        page.classList.remove("turn-next", "turn-prev");
        page.hidden = false;
        void page.offsetWidth;
        page.classList.add(dir);
        prev.disabled = at === 0;
        next.disabled = at === pages.length - 1;
        label.innerHTML = "<b>Page " + (at + 1) + " of " + pages.length + "</b><span>" + (PAGE.NAMES || NAMES)[at] + "</span>";
      }
      prev.addEventListener("click", function () { go(at - 1); if (prev.disabled) next.focus(); });
      next.addEventListener("click", function () { go(at + 1); if (next.disabled) prev.focus(); });
    })();

    // What each part of the report says about itself.
    var TIPS = {
      hx: "Already written, from your <b>recorded or dictated history</b> with the patient.",
      results: "Results are in the app <b>from Noah, instantly.</b>",
      interp: "<b>Reports scripted in your own words. Two clicks.</b> Edit as needed.",
      recs: "<b>Reports scripted in your own words. Two clicks.</b> Edit as needed.",
      summary: ""
    };
    var FOOT = {
      report: "A click-through preview with sample patients. Noah's screen is drawn here in simple form.",
      checkin: "The kiosk is a tablet in your lobby. Patients check themselves in and sign their consent forms on it.",
      referral: "A preview with sample patients. Your own demo is the whole app."
    };

    function markStep(key) {
      var hit = -1;
      stepItems.forEach(function (li, i) { if (li.getAttribute("data-step") === key) hit = i; });
      stepItems.forEach(function (li, i) {
        li.classList.toggle("on", i === hit);
        li.classList.toggle("done", hit > -1 && i < hit);
      });
    }
    function allStepsDone() {
      stepItems.forEach(function (li) { li.classList.remove("on"); li.classList.add("done"); });
    }

    function syncThumb() {
      if (!resScroll || !thumb || !resScroll.clientHeight) return;
      var max = resScroll.scrollHeight - resScroll.clientHeight;
      var h = Math.max(0.14, Math.min(1, resScroll.clientHeight / resScroll.scrollHeight));
      thumb.style.height = (h * 100) + "%";
      thumb.style.top = (max > 0 ? (resScroll.scrollTop / max) * (1 - h) * 100 : 0) + "%";
    }
    if (resScroll) resScroll.addEventListener("scroll", syncThumb, { passive: true });

    function selectTab(name) {
      tabs.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-tab") === name); });
      panes.forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== name; });
      if (tip) tip.innerHTML = TIPS[name] || "";
      if (name === "results" && resScroll) { resScroll.scrollTop = 0; syncThumb(); }
    }

    // ── The marks: "Click here", then "Click here next" ──
    // A mark sits beside its target, inside the screen, with its point on the target.
    // A target's box in the page, also when it sits inside the counseling tool's frame.
    function rectOf(el) {
      var r = el.getBoundingClientRect(), doc = el.ownerDocument;
      if (doc === document) return r;
      var fr = doc.defaultView && doc.defaultView.frameElement;
      if (!fr) return r;
      var f = fr.getBoundingClientRect(), k = toolK;
      return { left: f.left + r.left * k, top: f.top + r.top * k, right: f.left + r.right * k, bottom: f.top + r.bottom * k, width: r.width * k, height: r.height * k };
    }
    function place(el, target, side, align) {
      var a = app.getBoundingClientRect(), r = rectOf(target);
      if (!a.width || !r.width) return;
      var w = el.offsetWidth, h = el.offsetHeight;
      var gap = Math.max(7, w * 0.07), pad = 4, nub = Math.min(w * 0.2, 20);
      var cx = r.left - a.left + r.width / 2, cy = r.top - a.top + r.height / 2;
      var px = typeof align === "number" ? cx + align * r.width : cx;   // a number moves the point along the target
      var x, y;
      if (side === "inside") {
        // inside the button, at its right end; where that would cover the button's own words, above it instead
        var words = null;
        try { var rg = document.createRange(); rg.selectNodeContents(target); words = rg.getBoundingClientRect(); } catch (err) {}
        x = r.right - a.left - w - Math.max(8, r.height * 0.3);
        y = cy - h / 2;
        if (words && words.width && x < words.right - a.left + 14) { side = "top"; align = "end"; }
      }
      if (side === "top" || side === "bottom") {
        x = typeof align === "number" ? px - nub : align === "start" ? cx - nub : align === "end" ? cx - w + nub : cx - w / 2;
        y = side === "top" ? r.top - a.top - h - gap : r.bottom - a.top + gap;
      } else if (side !== "inside") {
        y = cy - h / 2;
        x = side === "left" ? r.left - a.left - w - gap : r.right - a.left + gap;
      }
      x = Math.max(pad, Math.min(a.width - w - pad, x));
      y = Math.max(pad, Math.min(a.height - h - pad, y));
      el.style.left = x.toFixed(1) + "px";
      el.style.top = y.toFixed(1) + "px";
      var along = side === "top" || side === "bottom" ? Math.max(9, Math.min(w - 9, px - x)) : Math.max(7, Math.min(h - 7, cy - y));
      el.style.setProperty("--a", along.toFixed(1) + "px");
      el.setAttribute("data-side", side);
    }
    // On a narrow screen a mark may need another side: a spec can carry one as its 4th and 5th items.
    function narrow() {
      try { return getComputedStyle(app).getPropertyValue("--narrow").trim() === "1"; } catch (err) { return false; }
    }
    function placeMarks() {
      if (marked && markSpec && !flag.hidden) {
        var alt = markSpec.length > 3 && narrow();
        place(flag, marked, alt ? markSpec[3] : markSpec[1], alt ? markSpec[4] : markSpec[2]);
        if (PAGE.onMark) PAGE.onMark(marked, STATES[current]);
      }
    }
    function clearMarks() {
      flag.hidden = true;
      flag.classList.remove("bob");
      marked = null; markSpec = null;
      if (PAGE.onMark) PAGE.onMark(null, null);
    }
    // "[data-hot='play']" and the like are the counseling tool's own buttons, inside its frame.
    function findTarget(scope, sel) {
      var m = /^\[data-hot='(\w+)'\]$/.exec(sel || "");
      if (m) { var d = toolDoc(); return d ? d.querySelector(HOT_SEL[m[1]] || "#none") : null; }
      return scope.querySelector(sel);
    }
    function clearPulse() {
      all(phone, ".pulse").forEach(function (el) { el.classList.remove("pulse"); });
      var d = toolDoc(); if (d) all(d, ".pulse").forEach(function (el) { el.classList.remove("pulse"); });
    }
    function setMark(s) {
      var scope = phone.querySelector('[data-screen="' + s.screen + '"]') || phone;
      var t = s.target ? findTarget(scope, s.target) : null;
      if (!t) return;
      t.classList.add("pulse");
      if (!s.flag) return;
      marked = t; markSpec = s.flag;
      flag.innerHTML = (s.n ? "<b>" + s.n + "</b>" : "") + s.flag[0];
      flag.hidden = false;
      placeMarks();
      if (!still) { void flag.offsetWidth; flag.classList.add("bob"); }
    }
    flag.addEventListener("click", function () { if (marked) marked.click(); });
    window.addEventListener("resize", function () { fitTool(); placeMarks(); });
    if (window.ResizeObserver) { try { new ResizeObserver(function () { fitTool(); placeMarks(); }).observe(app); } catch (err) {} }
    if (document.fonts && document.fonts.ready) { try { document.fonts.ready.then(placeMarks); } catch (err) {} }

    // ── The counseling tools: the live Speech Intelligibility Audiogram runs in its own
    // frame inside the device (tools/speech-intelligibility-audiogram.html?embed). It is
    // scaled to fit the screen, the marks land on its own buttons, and a click on Play,
    // Normal hearing or Their hearing moves the guide along, as a page's hotTo() asks. ──
    var TOOL_W = 1000, toolK = 1, hot = {};
    var HOT_SEL = { play: "#play", normal: "[data-who='normal']", their: "[data-who='theirs']" };
    function hotTo(key, state) { hot[key] = state; }
    function toolFrame() { return phone.querySelector(".sia-frame"); }
    function toolDoc() {
      var fr = toolFrame();
      try { return fr && fr.contentDocument && fr.contentDocument.getElementById("play") ? fr.contentDocument : null; } catch (err) { return null; }
    }
    function toolShowing() {
      var fr = toolFrame(), scr = fr && fr.closest ? fr.closest("[data-screen]") : null;
      return !!(scr && !scr.hidden);
    }
    function fitTool() {
      var fr = toolFrame(), d = toolDoc();
      if (!fr || !d) return;
      var wrap = fr.parentNode, cw = wrap.clientWidth, ch = wrap.clientHeight;
      if (!cw || !ch) return;
      var main = d.querySelector("main");
      var h = main ? Math.ceil(main.getBoundingClientRect().height) : 0;
      if (h < 100) h = 1100;
      fr.style.height = h + "px";
      toolK = Math.min(cw / TOOL_W, ch / h);
      fr.style.transform = "scale(" + toolK.toFixed(4) + ")";
      fr.style.left = ((cw - TOOL_W * toolK) / 2).toFixed(1) + "px";
      fr.style.top = ((ch - h * toolK) / 2).toFixed(1) + "px";
    }
    // Which hearing the tool shows: "theirs", the patient's, or "normal".
    function toolSet(who) {
      var d = toolDoc(); if (!d) return;
      var b = d.querySelector("[data-who='" + who + "']");
      if (b && b.getAttribute("aria-pressed") !== "true") b.click();
    }
    function toolPause() {
      var d = toolDoc(); if (!d) return;
      var b = d.getElementById("play");
      if (b && /pause/i.test(b.textContent)) b.click();
    }
    function wireTool() {
      var fr = toolFrame(); if (!fr) return;
      function ready() {
        var d = toolDoc(); if (!d || d.vestibuleWired) return;
        d.vestibuleWired = true;
        var st = d.createElement("style");
        st.textContent = ".pulse{position:relative}.pulse::after{content:'';position:absolute;inset:-5px;border-radius:999px;border:3px solid #F59E0B;pointer-events:none;animation:vpulse 1.7s ease-out infinite}.seg .pulse::after{inset:2px}@keyframes vpulse{0%{opacity:1;transform:scale(.97)}70%{opacity:0;transform:scale(1.06)}100%{opacity:0;transform:scale(1.06)}}@media (prefers-reduced-motion:reduce){.pulse::after{animation:none;opacity:1}}";
        d.head.appendChild(st);
        d.addEventListener("click", function (e) {
          var b = e.target && e.target.closest ? e.target.closest("button") : null;
          if (!b) return;
          var key = b.id === "play" ? "play" : b.getAttribute("data-who") === "normal" ? "normal" : b.getAttribute("data-who") === "theirs" ? "their" : "";
          var to = key && hot[key];
          if (to) later(function () { show(to); }, 0);
        });
        if (d.fonts && d.fonts.ready) { try { d.fonts.ready.then(function () { fitTool(); placeMarks(); }); } catch (err) {} }
        fitTool();
        if (toolShowing()) {
          var cur = STATES[current];
          if (cur && cur.tool) toolSet(cur.tool);
          if (cur && cur.target) { setMark(cur); later(placeMarks, 60); }
        }
      }
      fr.addEventListener("load", ready);
      ready();
    }

    // This page's own scenes.
    var PAGE = (window.PREVIEW_PAGE || function () { return {}; })({
      $: $, all: all, phone: phone, app: app, later: later, still: still, timers: timers,
      resetDesk: resetDesk, landOnChart: landOnChart, drawInNoah: drawInNoah, selectTab: selectTab,
      allStepsDone: allStepsDone, clearSig: clearSig, playReferral: playReferral, hotTo: hotTo,
      noahShown: noahShown, noahModule: noahModule, noahDrawn: function (v) { noahDrawn = !!v; },
      pdf: pdf, dDue: dDue, tipDone: tipDone, hint: hint, nextBtn: nextBtn, againBtn: againBtn
    });
    var STATES = PAGE.STATES || {};
    if (PAGE.FOOT) FOOT = PAGE.FOOT;

    // The words for every step of a scene, unseen, hold the guide at one height through that scene.
    var REFERRAL_DONE = "A fax became a booked, confirmed visit. No one at the desk did a thing.";
    var ghostScene = "";
    function holdHeight(scene) {
      if (!hints || scene === ghostScene) return;
      ghostScene = scene;
      all(hints, ".ghost").forEach(function (g) { hints.removeChild(g); });
      var words = Object.keys(STATES).filter(function (k) { return STATES[k].scene === scene; }).map(function (k) { return STATES[k].hint; });
      if (scene === "referral") words.push(REFERRAL_DONE);
      words.forEach(function (w) {
        var g = document.createElement("p");
        g.className = "demo-hint ghost";
        g.setAttribute("aria-hidden", "true");
        g.innerHTML = w;
        hints.appendChild(g);
      });
    }

    function show(key) {
      var s = STATES[key];
      if (!s) return;
      stopTimers();
      current = key;
      holdHeight(s.scene);
      var changed = setStage(s);
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-scene") === s.scene ? "true" : "false"); });
      clearPulse();
      clearMarks();
      if (stepsEl) stepsEl.hidden = s.scene !== "report";
      if (claim) claim.hidden = s.scene !== "report";
      if (s.step) markStep(s.step);
      hint.innerHTML = s.hint || "";
      if (s.next) { nextBtn.textContent = s.next[0]; nextBtn.setAttribute("data-next", s.next[1]); nextBtn.hidden = false; }
      else { nextBtn.hidden = true; }
      againBtn.hidden = (PAGE.againHidden || ["report-desk", "checkin", "referral"]).indexOf(key) >= 0;
      var seen = key === "report-noah" && noahDrawn;   // Noah was already opened once: nothing new to wait for
      hot = {};
      if (s.enter) s.enter();
      if (toolShowing()) { fitTool(); if (s.tool) toolSet(s.tool); later(fitTool, 120); }
      else toolPause();
      if (s.target) {
        // The mark waits where something has to be seen first (the test going into Noah).
        if (s.wait && !still && !seen) later(function () { setMark(s); }, s.wait);
        else setMark(s);
        later(placeMarks, 60);
        later(placeMarks, 380);
      }
      if (changed) keepInView();
      if (PAGE.onShow) PAGE.onShow(key, s);
    }

    function playReferral() {
      var lines = all(document, "#f-card .f-line");
      var stages = all(document, "#f-stages span");
      var total = $("f-total");
      lines.forEach(function (l) { l.hidden = !still; });
      stages.forEach(function (s) { s.className = still ? "on" : ""; });
      total.hidden = !still;
      function finish() {
        total.hidden = false;
        hint.innerHTML = REFERRAL_DONE;
        nextBtn.textContent = "Get your own demo";
        nextBtn.setAttribute("data-next", "#demo");
        nextBtn.hidden = false;
        againBtn.hidden = false;
      }
      if (still) { finish(); return; }
      lines.forEach(function (l, i) {
        later(function () {
          l.hidden = false;
          var st = parseInt(l.getAttribute("data-stage"), 10);
          stages.forEach(function (s, j) { s.className = j <= st ? "on" : ""; });
          if (i === lines.length - 1) later(finish, 700);
        }, 700 + i * 950);
      });
    }

    // The signature pad on the kiosk.
    var sig = $("sig"), sigTip = $("sig-tip"), ctx = sig && sig.getContext ? sig.getContext("2d") : null, drawing = false;
    function clearSig() { if (ctx) ctx.clearRect(0, 0, sig.width, sig.height); if (sigTip) sigTip.hidden = false; }
    function at(e) {
      var r = sig.getBoundingClientRect();
      return [(e.clientX - r.left) * sig.width / r.width, (e.clientY - r.top) * sig.height / r.height];
    }
    if (ctx) {
      ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#2B3950";
      sig.addEventListener("pointerdown", function (e) {
        drawing = true; sigTip.hidden = true;
        var p = at(e); ctx.beginPath(); ctx.moveTo(p[0], p[1]);
        try { sig.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });
      sig.addEventListener("pointermove", function (e) {
        if (!drawing) return;
        var p = at(e); ctx.lineTo(p[0], p[1]); ctx.stroke();
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) {
        sig.addEventListener(n, function () { drawing = false; });
      });
      $("sig-clear").addEventListener("click", clearSig);
    }

    phone.addEventListener("click", function (e) {
      if (!e.target.closest) return;
      if (e.target.closest(".a-flag")) return;          // the mark passes its click to its target itself
      var go = e.target.closest("[data-go]");
      if (go && phone.contains(go)) {
        var key = go.getAttribute("data-go");
        if (key === "report-sent") {
          clearMarks();
          go.classList.remove("pulse");
          go.textContent = "Signing…";
          later(function () { show("report-sent"); }, still ? 0 : 650);
          return;
        }
        show(key);
        return;
      }
      // The soft line under the sections: optional, and it opens the interpretation.
      if (e.target.closest("#r-opt")) { selectTab("interp"); later(placeMarks, 30); return; }
      var tab = e.target.closest("[data-tab]");
      if (tab) {
        selectTab(tab.getAttribute("data-tab"));
        later(placeMarks, 30);
        return;
      }
      if (e.target.closest("[data-live]") || e.target.closest("canvas") || e.target.closest(".a-scroll") || e.target.closest(".a-pdf")) return;
      // Anything else in the device is part of the picture. Point back at the next step.
      if (guide) { guide.classList.add("nudge"); setTimeout(function () { guide.classList.remove("nudge"); }, 700); }
      if (PAGE.onNudge) PAGE.onNudge();
    });

    function startScene(scene) { show(scene === "report" ? "report-desk" : scene); }
    chips.forEach(function (c) {
      c.addEventListener("click", function () { startScene(c.getAttribute("data-scene")); });
    });
    nextBtn.addEventListener("click", function () {
      var to = nextBtn.getAttribute("data-next");
      if (to && to.charAt(0) === "#") {
        var el = document.querySelector(to);
        if (el) el.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
        return;
      }
      show(to);
    });
    againBtn.addEventListener("click", function () {
      var s = STATES[current];
      startScene(s ? s.scene : "report");
    });

    wireTool();
    // At rest: the page's first scene, with the first mark on it.
    show(PAGE.start || "report-desk");
  })();

  // The demo request. Two choices, one form. Each request is delivered to the
  // Vestibule inbox by Web3Forms. ACCESS_KEY is that service's public form key
  // (it is not a password and is meant to sit in the page). Empty = preview,
  // nothing sent. No patient file is ever taken on this page. For a demo with
  // a practice's own records, a mobile number or an email is enough: with a
  // number, the agreement goes by text and is signed on the phone.
  (function () {
    var ACCESS_KEY = "63ba2e59-3dbc-4b1d-9b22-82c68cb8ae86";
    var form = document.getElementById("ask");
    var note = document.getElementById("ask-note");
    if (!form) return;
    var button = document.getElementById("ask-send");
    var choiceField = document.getElementById("ask-choice");
    var choices = Array.prototype.slice.call(document.querySelectorAll(".choice"));
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-for]"));
    function say(cls, text) { note.className = cls; note.textContent = text; }
    function pick(c) {
      choiceField.value = c;
      choices.forEach(function (b) { b.setAttribute("aria-checked", b.getAttribute("data-choice") === c ? "true" : "false"); });
      blocks.forEach(function (b) { b.hidden = b.getAttribute("data-for") !== c; });
      button.textContent = c === "own" ? "Send me the agreement" : "Get my demo";
      say("note", "");
    }
    choices.forEach(function (b) {
      b.addEventListener("click", function () { pick(b.getAttribute("data-choice")); });
    });
    function failed() { say("note", "That did not go through. Please write to help@vestibulehq.com."); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var own = choiceField.value === "own";
      var name = form.elements.name.value.trim();
      var practice = form.elements.practice.value.trim();
      var email = form.elements.email.value.trim();
      var phone = own ? form.elements.phone.value.trim() : "";
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var digits = phone.replace(/\D/g, "");
      var okPhone = digits.length >= 10 && digits.length <= 15;
      if (own) {
        if (!name || !practice || (!email && !phone)) {
          say("note", "Please fill in your name, your practice, and a mobile number or an email.");
          return;
        }
        if (phone && !okPhone) { say("note", "That mobile number looks short. Please check it."); return; }
        if (email && !okEmail) { say("note", "That email does not look right. Please check it."); return; }
      } else if (!name || !practice || !okEmail) {
        say("note", "Please fill in your name, your practice and a working email.");
        return;
      }
      var byText = own && okPhone;
      if (form.elements.botcheck.checked) { thanksKeep(); return; }
      if (!ACCESS_KEY) {
        var subj = (own ? "Demo request, my own patients' records: " : "Demo request, sample patients: ") + practice;
        var lines = ["Name: " + name, "Practice: " + practice];
        if (email) lines.push("Email: " + email);
        if (phone) lines.push("Mobile: " + phone);
        lines.push("Demo: " + (own ? "my own patients' records (please send the agreement" + (byText ? " by text" : "") + ")" : "sample patients"));
        try { window.location.href = "mailto:help@vestibulehq.com?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(lines.join("\n")); } catch (err) {}
        say("done", "Your email should open with the request ready to send. If it does not, write to help@vestibulehq.com.");
        return;
      }
      var body = {
        access_key: ACCESS_KEY,
        subject: (own ? "Demo request, own patients (send the agreement" + (byText ? " by text" : " by email") + "): " : "Demo request, sample patients: ") + practice,
        from_name: "Vestibule website",
        demo: own ? "Own patients: send the business associate agreement " + (byText ? "by text to " + phone : "by email") : "Sample patients",
        name: name,
        practice: practice
      };
      if (email) body.email = email;
      if (phone) body.phone = phone;
      button.disabled = true;
      say("note", "Sending.");
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body)
      }).then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (j) { if (j && j.success) { thanksKeep(); } else { failed(); } })
        .catch(failed)
        .then(function () { button.disabled = false; });

      function thanksKeep() {
        var text = !own ? "Thank you. We'll send your demo link to " + email + "."
          : byText ? "Thank you. We'll text the agreement to " + phone + ". Sign it on your phone, and then we'll ask for the results."
          : "Thank you. We'll email the agreement to " + email + ". Once it is signed, we'll ask for the results.";
        form.reset();
        pick(own ? "own" : "sample");
        say("done", text);
      }
    });
  })();

  // The fold's headline (SITE-CLICK-2): from 40rem it fills the content width on one line,
  // measured in the page so the fit holds whichever font has loaded; a phone wraps it.
  (function () {
    var line = document.querySelector(".fold-line");
    if (!line) return;
    var mq = window.matchMedia ? window.matchMedia("(min-width: 40rem)") : null;
    function fit() {
      line.style.fontSize = "";
      if (mq && !mq.matches) return;
      var avail = line.clientWidth;
      if (!avail) return;
      var range;
      try { range = document.createRange(); range.selectNodeContents(line); } catch (err) { return; }
      var width = range.getBoundingClientRect().width;
      var size = parseFloat(getComputedStyle(line).fontSize);
      if (!width || !size) return;
      line.style.fontSize = (size * avail / width * 0.995).toFixed(2) + "px";
    }
    fit();
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) { try { document.fonts.ready.then(fit); } catch (err) {} }
  })();
