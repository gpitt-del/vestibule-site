  // The click-through preview (the fold's screen on the first page, the device on the
  // others), shared by every page of the site. Every
  // screen is plain markup in the page; this decides which one shows and puts a mark on
  // the next thing to click. Nothing plays by itself: the viewer does every click.
  // Each page hands over its own scenes as window.PREVIEW_PAGE (the states of the
  // click-through, the words under the device, the report's page names, where it starts),
  // defined in the page before this file runs. The counseling screen's figures (the audiogram with the
  // speech canoe, the tympanograms, the DP-grams) are drawn here from the app's own numbers (COUNSEL-SITE-1).
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
    function rectOf(el) { return el.getBoundingClientRect(); }
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
      if (!marked || !markSpec) return;
      // A target in a pane the viewer has clicked away from has no box: the mark and the hand wait for it.
      var r = marked.getBoundingClientRect(), vis = r.width > 0 && r.height > 0;
      flag.hidden = !vis;
      if (!vis) { if (PAGE.onMark) PAGE.onMark(null, null); return; }
      var alt = markSpec.length > 3 && narrow();
      place(flag, marked, alt ? markSpec[3] : markSpec[1], alt ? markSpec[4] : markSpec[2]);
      if (PAGE.onMark) PAGE.onMark(marked, STATES[current]);
    }
    function clearMarks() {
      flag.hidden = true;
      flag.classList.remove("bob");
      marked = null; markSpec = null;
      if (PAGE.onMark) PAGE.onMark(null, null);
    }
    function findTarget(scope, sel) { return scope.querySelector(sel); }
    function clearPulse() {
      all(phone, ".pulse").forEach(function (el) { el.classList.remove("pulse"); });
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
    window.addEventListener("resize", function () { fitCounsel(); placeMarks(); });
    if (window.ResizeObserver) { try { new ResizeObserver(function () { fitCounsel(); placeMarks(); }).observe(app); } catch (err) {} }
    if (document.fonts && document.fonts.ready) { try { document.fonts.ready.then(function () { fitCounsel(); placeMarks(); }); } catch (err) {} }

    // ── The counseling screen: the app's Patient Review in the fold's screen (COUNSEL-SITE-1). The
    // audiogram with the speech canoe and the phonemes, the tympanograms and the DP-grams are the
    // app's own drawings (its PatientReview chart, TympImage and DpGram), drawn here with Roy's
    // numbers — the same numbers the report scene's audiogram, its tympanometry page and its DPOAE
    // page carry. The tabs, the three-way choice and the ear picker are live; a click on the thing
    // the page's state named (hotTo) moves the scene along; everything else is part of the picture.
    // The locked tabs and parts say "Subscribers only" in the mock's words. ──
    var hot = {};
    function hotTo(key, state) { hot[key] = state; }
    var prv = phone.querySelector('[data-screen="ha-counsel"]');
    var PRV = {
      FREQS: [250, 500, 1000, 2000, 4000, 8000],
      ROY: { R: [15, 15, 20, 55, 65, 75], L: [15, 20, 20, 55, 70, 80] },
      NORMAL: { R: [10, 5, 5, 10, 10, 15], L: [5, 10, 5, 5, 15, 10] },
      EXAMPLE: { R: [20, 25, 35, 50, 60, 70], L: [25, 30, 40, 55, 65, 70] },   // the app's "Moderate sloping" example
      CANOE_TOP: [[250, 10], [500, 20], [3700, 20], [6000, 10]],
      CANOE_BOT: [[250, 40], [500, 50], [3700, 50], [6000, 40]],
      PHON: [["v", 321, 15.5], ["z", 286, 20.5], ["j", 259, 31], ["d", 328, 35.5], ["b", 357, 37.5], ["m", 306, 40.5], ["n", 350, 42.5], ["u", 340, 44.5], ["e", 396, 44.5], ["l", 453, 46.5], ["i", 575, 40.5], ["a", 610, 42.5], ["o", 575, 45.5], ["r", 681, 47], ["p", 1410, 23], ["h", 1513, 26], ["g", 1631, 29], ["ch", 1198, 35.5], ["sh", 1477, 40.5], ["t", 3148, 23.5], ["k", 2935, 27.5], ["f", 4400, 19.5], ["s", 4800, 23], ["th", 5750, 14]],
      DEGREES: [["Normal", -10, 25.5], ["Mild", 25.5, 40.5], ["Moderate", 40.5, 55.5], ["Moderately severe", 55.5, 70.5], ["Severe", 70.5, 90.5], ["Profound", 90.5, 120]],
      DEG_FILL: ["#F7F3EF", "#F0E8E2", "#E7DAD1", "#DDCABE", "#D1B9AB", "#C4A799"],
      // The report's tympanometry page: ECV · TPP · static compliance · gradient, type A both ears.
      TYMP: { right: { ecv: 1.1, tpp: -15, sc: 0.74, gradient: 95 }, left: { ecv: 1.2, tpp: -5, sc: 0.68, gradient: 105 } },
      // The report's DPOAE page: present through 1.5 kHz (the first two points), absent above.
      DP_F2: [1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
      DP: {
        right: { dp: [8.4, 2.3, -9.3, -12.8, -15.2, -16.4, -17.1, -16.3, -18.2, -19.0, -20.3], nf: [-7.9, -9.2, -11.4, -13.9, -15.0, -17.2, -16.8, -17.5, -18.4, -18.8, -19.6], det: 2 },
        left: { dp: [6.3, 1.1, -10.1, -14.0, -16.2, -16.9, -18.1, -17.6, -19.2, -18.9, -20.1], nf: [-8.3, -9.1, -12.0, -13.8, -16.0, -17.3, -17.9, -17.2, -19.0, -19.4, -19.8], det: 2 }
      },
      // The DP-gram's normative band, Ramos 2013 Table 3: f2 · 5th · 95th percentile.
      BAND: [[500, -6.1, 11.5], [629, -3.9, 15.1], [793, -1.3, 15.8], [1000, -3.6, 17.6], [1259, -8.3, 21.4], [1587, -9.1, 18.0], [2000, -12.5, 15.3], [2519, -12.8, 9.6], [3174, -7.0, 12.2], [4000, -10.9, 17.8], [5039, -9.6, 21.7], [6349, -14.4, 21.5], [8000, -16.3, 6.9]]
    };
    // The chart's geometry (ANSI aspect: one octave = 20 dB), the app's own numbers.
    var AG = { OCT: 100, DB: 5, F0: 125, DBMIN: -10, DBMAX: 120, L: 62, T: 56, PW: 600, PH: 650, DEGX: 680, DEGW: 64, W: 790, H: 735 };
    function agx(f) { return AG.L + AG.OCT * Math.log(f / AG.F0) / Math.LN2; }
    function agy(d) { return AG.T + AG.DB * (d - AG.DBMIN); }
    function agf(px) { return AG.F0 * Math.pow(2, (px - AG.L) / AG.OCT); }
    function fmtHz(f) { return f >= 1000 ? (f / 1000) + "k" : String(f); }
    function thrAt(pts, f) {
      if (f <= pts[0].hz) return pts[0].db;
      var last = pts[pts.length - 1];
      if (f >= last.hz) return last.db;
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1];
        if (f >= a.hz && f <= b.hz) { var t = (Math.log(f) - Math.log(a.hz)) / (Math.log(b.hz) - Math.log(a.hz)); return a.db + t * (b.db - a.db); }
      }
      return pts[0].db;
    }
    var CANOE = "M" + PRV.CANOE_TOP.map(function (p) { return agx(p[0]).toFixed(1) + "," + agy(p[1]).toFixed(1); }).join(" L") + " L" + PRV.CANOE_BOT.slice().reverse().map(function (p) { return agx(p[0]).toFixed(1) + "," + agy(p[1]).toFixed(1); }).join(" L") + "Z";
    function drawAudiogram(svg, who, ear) {
      var set = who === "theirs" ? PRV.ROY : who === "normal" ? PRV.NORMAL : PRV.EXAMPLE;
      var pts = function (arr) { return PRV.FREQS.map(function (hz, i) { return { hz: hz, db: arr[i] }; }); };
      var R = pts(set.R), L = pts(set.L);
      var line = ear === "R" ? function (f) { return thrAt(R, f); } : ear === "L" ? function (f) { return thrAt(L, f); } : function (f) { return Math.min(thrAt(R, f), thrAt(L, f)); };
      var s = "", d, f;
      s += '<defs><pattern id="prv-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#2B3950" stroke-opacity=".10" stroke-width="1"/></pattern><clipPath id="prv-plot"><rect x="' + AG.L + '" y="' + AG.T + '" width="' + AG.PW + '" height="' + AG.PH + '"/></clipPath></defs>';
      s += '<rect x="' + AG.L + '" y="' + AG.T + '" width="' + AG.PW + '" height="' + AG.PH + '" fill="#FFFFFF"/>';
      for (d = AG.DBMIN; d <= AG.DBMAX; d += 10) s += '<line x1="' + AG.L + '" y1="' + agy(d) + '" x2="' + (AG.L + AG.PW) + '" y2="' + agy(d) + '" stroke="#D9D3CD" stroke-width="' + (d % 20 === 0 ? 1 : 0.8) + '"/><text x="' + (AG.L - 10) + '" y="' + (agy(d) + 5) + '" text-anchor="end" class="ax">' + d + '</text>';
      [125, 250, 500, 1000, 2000, 4000, 8000].forEach(function (f) { var xx = agx(f).toFixed(1); s += '<line x1="' + xx + '" y1="' + AG.T + '" x2="' + xx + '" y2="' + (AG.T + AG.PH) + '" stroke="#C9C2BB" stroke-width="1"/><text x="' + xx + '" y="' + (AG.T - 12) + '" text-anchor="middle" class="ax">' + fmtHz(f) + '</text>'; });
      [750, 1500, 3000, 6000].forEach(function (f) { var xx = agx(f).toFixed(1); s += '<line x1="' + xx + '" y1="' + AG.T + '" x2="' + xx + '" y2="' + (AG.T + AG.PH) + '" stroke="#D9D3CD" stroke-width="1" stroke-dasharray="4 5"/><text x="' + xx + '" y="' + (AG.T - 12) + '" text-anchor="middle" class="ax" opacity=".7">' + fmtHz(f) + '</text>'; });
      s += '<text x="' + (AG.L + AG.PW / 2) + '" y="' + (AG.T - 34) + '" text-anchor="middle" class="ax-title">Frequency (Hz)</text>';
      s += '<text x="16" y="' + (AG.T + AG.PH / 2) + '" text-anchor="middle" class="ax-title" transform="rotate(-90 16 ' + (AG.T + AG.PH / 2) + ')">Hearing level (dB HL)</text>';
      PRV.DEGREES.forEach(function (g, i) {
        var y1 = agy(g[1]), y2 = agy(g[2]), cy = (y1 + y2) / 2, words = g[0].split(" ");
        s += '<rect x="' + AG.DEGX + '" y="' + y1 + '" width="' + AG.DEGW + '" height="' + (y2 - y1) + '" fill="' + PRV.DEG_FILL[i] + '"/>';
        if (words.length === 1) { var cx = AG.DEGX + AG.DEGW / 2 + 4; s += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" class="deg" transform="rotate(-90 ' + cx + ' ' + cy + ')">' + g[0] + '</text>'; }
        else { var c1 = AG.DEGX + AG.DEGW / 2 - 3, c2 = AG.DEGX + AG.DEGW / 2 + 11; s += '<text x="' + c1 + '" y="' + cy + '" text-anchor="middle" class="deg" transform="rotate(-90 ' + c1 + ' ' + cy + ')">' + words[0] + '</text><text x="' + c2 + '" y="' + cy + '" text-anchor="middle" class="deg" transform="rotate(-90 ' + c2 + ' ' + cy + ')">' + words.slice(1).join(" ") + '</text>'; }
      });
      s += '<text x="' + (AG.DEGX + AG.DEGW / 2) + '" y="' + (AG.T - 12) + '" text-anchor="middle" class="ax">Degree</text>';
      s += '<path d="' + CANOE + '" fill="#CDB4A9" fill-opacity="0.32" stroke="#B3978C" stroke-width="1.5" stroke-linejoin="round" clip-path="url(#prv-plot)"/>';
      var dpath = "M" + AG.L + "," + AG.T;
      for (var px = AG.L; px <= AG.L + AG.PW; px += 4) dpath += " L" + px.toFixed(1) + "," + agy(line(agf(px))).toFixed(1);
      dpath += " L" + (AG.L + AG.PW) + "," + AG.T + " Z";
      s += '<path d="' + dpath + '" fill="url(#prv-hatch)" clip-path="url(#prv-plot)"/><path d="' + dpath + '" fill="#2B3950" fill-opacity="0.05" clip-path="url(#prv-plot)"/>';
      PRV.PHON.forEach(function (p) { s += '<text x="' + agx(p[1]).toFixed(1) + '" y="' + (agy(p[2]) + 5) + '" text-anchor="middle" class="phon' + (p[2] >= line(p[1]) ? "" : " miss") + '">' + p[0] + '</text>'; });
      function earMarks(pts, color, e) {
        if (ear !== "B" && ear !== e) return "";
        var o = '<path d="' + pts.map(function (p, i) { return (i ? " L" : "M") + agx(p.hz).toFixed(1) + "," + agy(p.db).toFixed(1); }).join("") + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-opacity="0.9"/>';
        pts.forEach(function (p) {
          var cx = agx(p.hz), cy = agy(p.db);
          o += e === "R"
            ? '<circle cx="' + cx.toFixed(1) + '" cy="' + cy + '" r="7" fill="none" stroke="' + color + '" stroke-width="2.4"/>'
            : '<line x1="' + (cx - 6.5).toFixed(1) + '" y1="' + (cy - 6.5) + '" x2="' + (cx + 6.5).toFixed(1) + '" y2="' + (cy + 6.5) + '" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round"/><line x1="' + (cx - 6.5).toFixed(1) + '" y1="' + (cy + 6.5) + '" x2="' + (cx + 6.5).toFixed(1) + '" y2="' + (cy - 6.5) + '" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round"/>';
        });
        return o;
      }
      s += earMarks(R, "#B5362F", "R") + earMarks(L, "#2F5BA8", "L");
      svg.innerHTML = s;
      svg.setAttribute("data-who", who);
      svg.setAttribute("data-ear", ear);
      svg.setAttribute("aria-label", (who === "theirs" ? "Roy’s audiogram" : who === "normal" ? "Normal hearing" : "An example loss, moderate sloping,") + " over the speech sounds" + (ear === "B" ? ", both ears" : ear === "R" ? ", the right ear" : ", the left ear"));
    }
    // One tympanogram per ear, as the app draws it: the type-A box, the curve modeled from the
    // numbers (a single peak at the pressure, the compliance tall, the gradient wide), the volume bar.
    function drawTymp(svg, ear, v) {
      var W = 300, H = 250, PL = 38, GAP = 12, BW = 18, PR = GAP + BW + 16, PT = 24, PB = 36;
      var color = ear === "right" ? "#b91c1c" : "#1d4ed8";
      var plotW = W - PL - PR, plotH = H - PT - PB;
      function x(p) { return PL + ((p + 300) / 500) * plotW; }
      function y(ml) { return H - PB - (Math.min(Math.max(ml, 0), 2.5) / 2.5) * plotH; }
      var s = "";
      s += '<rect x="' + x(-150).toFixed(1) + '" y="' + y(1.5).toFixed(1) + '" width="' + (x(50) - x(-150)).toFixed(1) + '" height="' + (y(0.3) - y(1.5)).toFixed(1) + '" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>';
      [0, 0.5, 1, 1.5, 2, 2.5].forEach(function (ml) { s += '<line x1="' + PL + '" x2="' + (PL + plotW) + '" y1="' + y(ml).toFixed(1) + '" y2="' + y(ml).toFixed(1) + '" stroke="#e5e7eb" stroke-width="0.6"/><text x="' + (PL - 6) + '" y="' + (y(ml) + 3).toFixed(1) + '" font-size="9" fill="#6b7280" text-anchor="end">' + ml.toFixed(1) + '</text>'; });
      [-300, -200, -100, 0, 100, 200].forEach(function (p) { s += '<line x1="' + x(p).toFixed(1) + '" x2="' + x(p).toFixed(1) + '" y1="' + PT + '" y2="' + (H - PB) + '" stroke="' + (p === 0 ? "#9ca3af" : "#e5e7eb") + '" stroke-width="' + (p === 0 ? 1 : 0.6) + '"/><text x="' + x(p).toFixed(1) + '" y="' + (H - PB + 12) + '" font-size="9" fill="#6b7280" text-anchor="middle">' + (p > 0 ? "+" + p : p) + '</text>'; });
      s += '<line x1="' + PL + '" x2="' + PL + '" y1="' + PT + '" y2="' + (H - PB) + '" stroke="#9ca3af" stroke-width="1"/><line x1="' + PL + '" x2="' + (PL + plotW) + '" y1="' + (H - PB) + '" y2="' + (H - PB) + '" stroke="#9ca3af" stroke-width="1"/>';
      s += '<text x="' + (PL + plotW / 2) + '" y="' + (H - 8) + '" font-size="9" fill="#6b7280" text-anchor="middle">pressure (daPa)</text>';
      s += '<text x="10" y="' + (PT + plotH / 2) + '" font-size="9" fill="#6b7280" transform="rotate(-90 10 ' + (PT + plotH / 2) + ')" text-anchor="middle">admittance (mL)</text>';
      var sigma = v.gradient / 2.354820045, d = "";
      for (var p = -300; p <= 200; p += 10) { var ml = v.sc * Math.exp(-((p - v.tpp) * (p - v.tpp)) / (2 * sigma * sigma)); d += (p === -300 ? "M" : " L") + x(p).toFixed(1) + "," + y(ml).toFixed(1); }
      s += '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2"/>';
      var bx = PL + plotW + GAP;
      s += '<line x1="' + (bx - 3) + '" x2="' + (bx + BW + 3) + '" y1="' + (H - PB) + '" y2="' + (H - PB) + '" stroke="#9ca3af" stroke-width="1"/>';
      s += '<rect x="' + bx + '" y="' + y(v.ecv).toFixed(1) + '" width="' + BW + '" height="' + (H - PB - y(v.ecv)).toFixed(1) + '" fill="' + color + '"/>';
      s += '<text x="' + (bx + BW / 2) + '" y="' + (y(v.ecv) - 4).toFixed(1) + '" font-size="10" font-weight="600" fill="' + color + '" text-anchor="middle">' + v.ecv.toFixed(2) + '</text>';
      s += '<text x="' + (bx + BW / 2) + '" y="' + (H - 8) + '" font-size="9" fill="#6b7280" text-anchor="middle">Volume</text>';
      svg.innerHTML = s;
    }
    // One DP-gram per ear, as the app draws it: f2 on a log axis, the Ramos band behind, the noise
    // floor shaded, the DP level with its symbols, a green check on each detected point.
    function drawDpGram(svg, ear, dd) {
      var W = 380, H = 260, PL = 42, PR = 12, PT = 46, PB = 30;
      var color = ear === "right" ? "#b91c1c" : "#1d4ed8";
      var lo = Math.log(500), hi = Math.log(10000);
      function x(f) { return PL + ((Math.log(Math.max(500, Math.min(10000, f))) - lo) / (hi - lo)) * (W - PL - PR); }
      function y(db) { return PT + (1 - (Math.max(-40, Math.min(40, db)) + 40) / 80) * (H - PT - PB); }
      var s = "";
      s += '<text x="' + PL + '" y="14" font-size="12" font-weight="600" fill="' + color + '">' + (ear === "right" ? "Right" : "Left") + ' DP-gram</text>';
      s += '<text x="' + PL + '" y="27" font-size="9" fill="#6b7280">f2/f1 1.22 · L1/L2 65/55 dB SPL · pass SNR ≥ 6 dB · min reliability 99%</text>';
      s += '<text x="' + (W - PR) + '" y="14" font-size="8" fill="#6b7280" text-anchor="end">✓ = detected · above floor · in normative range (Ramos 2013)</text>';
      var band = PRV.BAND;
      var bp = band.map(function (r, i) { return (i ? "L" : "M") + x(r[0]).toFixed(1) + "," + y(r[2]).toFixed(1); }).join(" ") + " " + band.slice().reverse().map(function (r) { return "L" + x(r[0]).toFixed(1) + "," + y(r[1]).toFixed(1); }).join(" ") + " Z";
      s += '<path d="' + bp + '" fill="#d9e6f2" fill-opacity="0.55"/>';
      for (var db = -40; db <= 40; db += 10) {
        s += '<line x1="' + PL + '" x2="' + (W - PR) + '" y1="' + y(db).toFixed(1) + '" y2="' + y(db).toFixed(1) + '" stroke="' + (db === 0 ? "#9ca3af" : "#e5e7eb") + '" stroke-width="' + (db === 0 ? 1 : 0.5) + '"/>';
        if (db % 20 === 0) s += '<text x="' + (PL - 6) + '" y="' + (y(db) + 3).toFixed(1) + '" font-size="8" fill="#6b7280" text-anchor="end">' + db + '</text>';
      }
      var my = (PT + H - PB) / 2;
      s += '<text x="12" y="' + my + '" font-size="8" fill="#6b7280" transform="rotate(-90 12 ' + my + ')" text-anchor="middle">dB SPL</text>';
      s += '<line x1="' + PL + '" x2="' + PL + '" y1="' + PT + '" y2="' + (H - PB) + '" stroke="#9ca3af" stroke-width="1"/><line x1="' + PL + '" x2="' + (W - PR) + '" y1="' + (H - PB) + '" y2="' + (H - PB) + '" stroke="#9ca3af" stroke-width="1"/>';
      var F = PRV.DP_F2;
      F.forEach(function (f, i) { if (i % 2 === 0 || i === F.length - 1) s += '<text x="' + x(f).toFixed(1) + '" y="' + (H - PB + 11) + '" font-size="7.5" fill="#6b7280" text-anchor="middle">' + (f >= 1000 ? (+(f / 1000).toFixed(1)) + "k" : f) + '</text>'; });
      s += '<text x="' + ((PL + W - PR) / 2) + '" y="' + (H - 6) + '" font-size="8" fill="#6b7280" text-anchor="middle">f2 (Hz)</text>';
      var np = F.map(function (f, i) { return (i ? "L" : "M") + x(f).toFixed(1) + "," + y(dd.nf[i]).toFixed(1); }).join(" ");
      s += '<path d="' + np + ' L' + x(F[F.length - 1]).toFixed(1) + ',' + (H - PB) + ' L' + x(F[0]).toFixed(1) + ',' + (H - PB) + ' Z" fill="#9ca3af" opacity="0.15"/><path d="' + np + '" fill="none" stroke="#9ca3af" stroke-width="1"/>';
      s += '<path d="' + F.map(function (f, i) { return (i ? "L" : "M") + x(f).toFixed(1) + "," + y(dd.dp[i]).toFixed(1); }).join(" ") + '" fill="none" stroke="' + color + '" stroke-width="1.5"/>';
      F.forEach(function (f, i) {
        var cx = x(f), cy = y(dd.dp[i]);
        s += ear === "right"
          ? '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="3.2" fill="none" stroke="' + color + '" stroke-width="1.5"/>'
          : '<g stroke="' + color + '" stroke-width="1.5"><line x1="' + (cx - 3.2).toFixed(1) + '" y1="' + (cy - 3.2).toFixed(1) + '" x2="' + (cx + 3.2).toFixed(1) + '" y2="' + (cy + 3.2).toFixed(1) + '"/><line x1="' + (cx - 3.2).toFixed(1) + '" y1="' + (cy + 3.2).toFixed(1) + '" x2="' + (cx + 3.2).toFixed(1) + '" y2="' + (cy - 3.2).toFixed(1) + '"/></g>';
        if (i < dd.det) s += '<path d="M' + (cx - 3).toFixed(1) + ',' + (cy - 9).toFixed(1) + ' l2.2,2.2 l4,-5" fill="none" stroke="#15803d" stroke-width="1.6" stroke-linecap="round"/>';
      });
      svg.innerHTML = s;
    }
    var prvState = { who: "theirs", ear: "B", tab: "aud" };
    var LOCKED_NOTE = "Locked on the site: a subscriber’s screen.";
    function prvNarrow() { try { return getComputedStyle(prv).getPropertyValue("--prv-narrow").trim() === "1"; } catch (err) { return false; } }
    function prvQ(sel) { return prv ? prv.querySelector(sel) : null; }
    function prvDraw() {
      var svg = prvQ(".prv-chart");
      if (svg) drawAudiogram(svg, prvState.who, prvState.ear);
      all(prv, "[data-pr-who]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-pr-who") === prvState.who ? "true" : "false"); });
      all(prv, "[data-pr-ear]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-pr-ear") === prvState.ear ? "true" : "false"); });
    }
    // The figures take the height the screen gives them on a wide stage (the screen keeps the app's
    // 16:10); on a narrow stage the screen grows with its content and the stylesheet sizes them.
    function fitCounsel() {
      if (!prv || prv.hidden) return;
      var tab = prvState.tab, pane = prvQ('[data-pr-pane="' + tab + '"]');
      if (!pane) return;
      var narrow = prvNarrow();
      function size(el, boxW, boxH, ratio) {
        if (narrow) { el.style.width = ""; el.style.height = ""; return; }
        var w = Math.min(boxW, boxH * ratio);
        if (!(w > 40)) return;
        el.style.width = w.toFixed(1) + "px";
        el.style.height = (w / ratio).toFixed(1) + "px";
      }
      if (tab === "aud") {
        var aud = pane.querySelector(".prv-aud"), panel = pane.querySelector(".prv-panel"), chart = pane.querySelector(".prv-chart");
        if (!aud || !panel || !chart) return;
        var cs = getComputedStyle(panel);
        size(chart, aud.clientWidth * 0.62 - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), aud.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 2, AG.W / AG.H);
      } else if (tab === "ana") {
        var ana = pane.querySelector(".prv-ana"), pic = pane.querySelector(".prv-pic"), thumbs = pane.querySelector(".prv-thumbs"), lock = pane.querySelector(".prv-locked");
        if (!ana || !pic) return;
        var gap = parseFloat(getComputedStyle(ana).rowGap) || 0;
        size(pic, ana.clientWidth * 0.8, ana.clientHeight - (thumbs ? thumbs.offsetHeight : 0) - (lock ? lock.offsetHeight : 0) - 2 * gap - 2, 16 / 9);
      } else if (tab === "tym" || tab === "oae") {
        var fig = pane.querySelector(".prv-fig");
        if (!fig) return;
        var fcs = getComputedStyle(fig), fine = fig.querySelector(".fine");
        var availH = fig.clientHeight - parseFloat(fcs.paddingTop) - parseFloat(fcs.paddingBottom) - (fine ? fine.offsetHeight + (parseFloat(fcs.rowGap) || 0) : 0);
        all(fig, "figure").forEach(function (f) {
          var svg = f.querySelector("svg");
          if (!svg) return;
          var extra = 0;
          Array.prototype.forEach.call(f.children, function (ch) { if (ch !== svg) extra += ch.offsetHeight; });
          var vb = (svg.getAttribute("viewBox") || "0 0 1 1").split(/\s+/);
          size(svg, f.clientWidth, availH - extra - 6, parseFloat(vb[2]) / parseFloat(vb[3]));
        });
      }
    }
    function counselFoot(locked) { if (foot && prv && !prv.hidden) foot.textContent = locked ? LOCKED_NOTE : (FOOT.counsel || FOOT.report); }
    function prvTab(k) {
      if (!prv) return;
      prvState.tab = k;
      all(prv, "[data-pr-pane]").forEach(function (p) { p.hidden = p.getAttribute("data-pr-pane") !== k; });
      all(prv, "[data-pr-tab]").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-pr-tab") === k ? "true" : "false"); });
      counselFoot(k === "coc" || k === "sim");
      fitCounsel();
      later(fitCounsel, 60);
      later(placeMarks, 30);
    }
    function prvPart(key) {
      var lock = prvQ('[data-pr-lock="part"]');
      if (lock) lock.classList.toggle("on", key !== "whole");
      all(prv, "[data-pr-thumb]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-pr-thumb") === key ? "true" : "false"); });
    }
    function prvAids(locked) {
      var style = prvQ('[data-pr-ha="style"]'), lock = prvQ('[data-pr-ha="locked"]');
      if (style) style.hidden = locked;
      if (lock) lock.hidden = !locked;
    }
    function prvReset() {
      if (!prv) return;
      prvState.who = "theirs"; prvState.ear = "B";
      prvPart("whole");
      prvAids(false);
      prvDraw();
      prvTab("aud");
    }
    var counsel = { reset: prvReset, tab: prvTab, lockAids: function () { prvAids(true); } };
    if (prv) {
      var tr = prvQ('[data-pr-tymp="right"]'), tl = prvQ('[data-pr-tymp="left"]'), or = prvQ('[data-pr-dp="right"]'), ol = prvQ('[data-pr-dp="left"]');
      if (tr) drawTymp(tr, "right", PRV.TYMP.right);
      if (tl) drawTymp(tl, "left", PRV.TYMP.left);
      if (or) drawDpGram(or, "right", PRV.DP.right);
      if (ol) drawDpGram(ol, "left", PRV.DP.left);
      prvReset();
      prv.addEventListener("click", function (e) {
        var t = e.target.closest ? e.target.closest("[data-pr-tab],[data-pr-thumb],[data-pr-choose],[data-pr-who],[data-pr-ear]") : null;
        if (!t || !prv.contains(t)) return;
        var key = "", v;
        if (t.hasAttribute("data-pr-tab")) { v = t.getAttribute("data-pr-tab"); prvTab(v); key = "tab:" + v; }
        else if (t.hasAttribute("data-pr-thumb")) { v = t.getAttribute("data-pr-thumb"); prvPart(v); key = "thumb:" + v; later(fitCounsel, 0); later(placeMarks, 30); }
        else if (t.hasAttribute("data-pr-choose")) { v = t.getAttribute("data-pr-choose"); prvAids(true); key = "choose:" + v; later(placeMarks, 30); }
        else if (t.hasAttribute("data-pr-who")) { prvState.who = t.getAttribute("data-pr-who"); prvDraw(); }
        else if (t.hasAttribute("data-pr-ear")) { prvState.ear = t.getAttribute("data-pr-ear"); prvDraw(); }
        var to = key && hot[key];
        if (to) later(function () { show(to); }, 0);
      });
    }

    // This page's own scenes.
    var PAGE = (window.PREVIEW_PAGE || function () { return {}; })({
      $: $, all: all, phone: phone, app: app, later: later, still: still, timers: timers,
      resetDesk: resetDesk, landOnChart: landOnChart, drawInNoah: drawInNoah, selectTab: selectTab,
      allStepsDone: allStepsDone, clearSig: clearSig, playReferral: playReferral, hotTo: hotTo, show: show, counsel: counsel,
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
      if (prv && !prv.hidden) { fitCounsel(); later(fitCounsel, 120); }
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
