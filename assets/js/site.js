/* olcOS site behaviour: nav, reveals, hero demo, pinned scene, sticky features,
 * terminal, FAQ. No dependencies. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileQ = window.matchMedia('(max-width: 900px)');
  var EN = (doc.lang || '').indexOf('en') === 0;
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  function onNav() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  onNav();
  window.addEventListener('scroll', onNav, { passive: true });

  /* ---------- reveal ---------- */
  var revealEls = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window && !reduce.matches) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { rio.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- platform-aware CTA: the visitor's phone goes first ---------- */
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = !isIOS && /android/i.test(ua);
  if (isIOS || isAndroid) {
    var first = isIOS ? 'ios' : 'android';
    var second = isIOS ? 'android' : 'ios';
    [].forEach.call(document.querySelectorAll('[data-cta]'), function (group) {
      var a = group.querySelector('[data-platform="' + first + '"]');
      var b = group.querySelector('[data-platform="' + second + '"]');
      if (!a || !b) return;
      group.insertBefore(a, group.firstElementChild);
      a.classList.remove('btn-secondary'); a.classList.add('btn-primary');
      b.classList.remove('btn-primary'); b.classList.add('btn-secondary');
    });
    [].forEach.call(document.querySelectorAll('[data-plat]'), function (box) {
      var card = box.querySelector('[data-platform-card="' + first + '"]');
      if (card) box.insertBefore(card, box.firstElementChild);
    });
  }

  /* ---------- download links follow the latest release ---------- */
  var dlLinks = document.querySelectorAll('[data-dl]');
  if (dlLinks.length && window.fetch) {
    fetch('https://api.github.com/repos/olcOS/olcos/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rel) {
        if (!rel || !rel.assets) return;
        var pick = { android: /android\.apk$/i, ios: /ios\.ipa$/i };
        Object.keys(pick).forEach(function (k) {
          var asset = null;
          rel.assets.forEach(function (x) { if (!asset && pick[k].test(x.name)) asset = x; });
          if (!asset || !asset.browser_download_url) return;
          [].forEach.call(document.querySelectorAll('[data-dl="' + k + '"]'), function (el) {
            el.setAttribute('href', asset.browser_download_url);
          });
          var mb = Math.round(asset.size / 1048576);
          if (mb > 0) [].forEach.call(document.querySelectorAll('[data-dl-size="' + k + '"]'), function (el) {
            el.textContent = mb + (EN ? ' MB' : ' МБ');
          });
        });
      })
      .catch(function () { /* keep the links from the page */ });
  }

  /* ---------- hero device: idle -> connected ---------- */
  var device = document.getElementById('hero-device');
  if (device) {
    var shots = device.querySelectorAll('.shot');
    var tap = device.querySelector('[data-toggle]');
    var setOn = function (on) {
      device.classList.toggle('is-on', on);
      [].forEach.call(shots, function (s) {
        s.classList.toggle('is-active', (s.getAttribute('data-state') === 'on') === on);
      });
      if (tap) {
        tap.setAttribute('aria-pressed', on ? 'true' : 'false');
        tap.setAttribute('aria-label', on
          ? (EN ? 'Show the disconnected screen' : 'Показать экран до подключения')
          : (EN ? 'Show the connected screen' : 'Показать подключение'));
      }
    };
    var touched = false;
    if (tap) tap.addEventListener('click', function () {
      touched = true;
      setOn(!device.classList.contains('is-on'));
    });
    if (reduce.matches) setOn(true);
    else window.setTimeout(function () { if (!touched) setOn(true); }, 1900);
  }

  /* ---------- pinned scene ---------- */
  var track = document.querySelector('[data-how]');
  var canvas = track && track.querySelector('.how-canvas');
  if (track && canvas && typeof window.createOlcScene === 'function') {
    var steps = [].slice.call(track.querySelectorAll('.how-step'));
    var bars = [].slice.call(track.querySelectorAll('.how-progress i'));
    var stepsBox = track.querySelector('.how-steps');
    var centerFor = function () { return mobileQ.matches ? [0.5, 0.3, 0.9] : [0.7, 0.54, 0.8]; };
    var c0 = centerFor();
    var sceneOpts = { cx: c0[0], cy: c0[1], zoom: c0[2], maxDpr: 1.75, bg: '#0b0c0f' };
    var scene = window.createOlcScene(canvas, sceneOpts);
    var shown = 0, flow = 0, last = 0, raf = 0, visible = false, chapter = -1;
    var BOUNDS = [0, 0.36, 0.68, 1];

    var progress = function () {
      var r = track.getBoundingClientRect();
      var span = track.offsetHeight - window.innerHeight;
      return span > 0 ? clamp(-r.top / span, 0, 1) : 1;
    };
    var setChapter = function (k) {
      if (k === chapter) return;
      chapter = k;
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === k); });
    };
    var sizeSteps = function () {
      if (!stepsBox || reduce.matches) return;
      var h = 0;
      steps.forEach(function (s) { h = Math.max(h, s.offsetHeight); });
      stepsBox.style.minHeight = h + 'px';
    };
    var frame = function (now) {
      raf = 0;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      var p = progress();
      var target = clamp((p - 0.04) / 0.88, 0, 1) * scene.END;
      shown += (target - shown) * Math.min(1, dt * 7);
      if (Math.abs(target - shown) < 0.002) shown = target;
      flow += dt;
      scene.render(shown, flow);
      setChapter(p < BOUNDS[1] ? 0 : p < BOUNDS[2] ? 1 : 2);
      bars.forEach(function (b, i) {
        var f = clamp((p - BOUNDS[i]) / (BOUNDS[i + 1] - BOUNDS[i]), 0, 1);
        b.style.transform = 'scaleX(' + f.toFixed(3) + ')';
      });
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    var start = function () { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
    var staticFrame = function () {
      setChapter(-1);
      steps.forEach(function (s) { s.classList.add('is-active'); });
      scene.render(scene.END, 2);
    };

    var refit = function () {
      var c = centerFor();
      sceneOpts.zoom = c[2];
      scene.setCenter(c[0], c[1]);
      scene.fit();
      sizeSteps();
      if (reduce.matches) staticFrame(); else { scene.render(shown, flow); }
    };
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(refit, 120); });

    if (reduce.matches) {
      staticFrame();
    } else {
      sizeSteps();
      shown = clamp((progress() - 0.04) / 0.88, 0, 1) * scene.END;
      scene.render(shown, 0);
      setChapter(0);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          if (visible) start();
        }, { rootMargin: '120px 0px' }).observe(track);
      } else { visible = true; start(); }
      document.addEventListener('visibilitychange', function () { if (!document.hidden && visible) start(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeSteps);
    }
  }

  /* ---------- features: sticky phone follows the list ---------- */
  var feat = document.querySelector('[data-feat]');
  if (feat) {
    var items = [].slice.call(feat.querySelectorAll('.feat-item'));
    var fshots = [].slice.call(feat.querySelectorAll('.feat-sticky .shot'));
    var now = feat.querySelector('[data-feat-now]');
    var active = 0, ticking = false;
    var pick = function () {
      ticking = false;
      if (mobileQ.matches) return;
      var mid = window.innerHeight / 2, best = 0, bestD = Infinity;
      items.forEach(function (it, i) {
        var r = it.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best === active) return;
      active = best;
      items.forEach(function (it, i) { it.classList.toggle('is-active', i === best); });
      fshots.forEach(function (s, i) { s.classList.toggle('is-active', i === best); });
      if (now) now.textContent = (best < 9 ? '0' : '') + (best + 1);
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(pick); }
    }, { passive: true });
    window.addEventListener('resize', pick);
    pick();
  }

  /* ---------- terminal: type the command once, copy button ---------- */
  var term = document.querySelector('.term');
  if (term) {
    var code = term.querySelector('[data-type]');
    var full = code ? code.textContent : '';
    if (code && !reduce.matches && 'IntersectionObserver' in window) {
      var caret = document.createElement('span');
      caret.className = 'caret';
      caret.setAttribute('aria-hidden', 'true');
      code.textContent = '';
      code.setAttribute('aria-label', full);
      code.parentNode.appendChild(caret);
      var typed = false;
      var tio = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting || typed) return;
        typed = true; tio.disconnect();
        var n = 0;
        var tick = function () {
          n = Math.min(full.length, n + (n < 12 ? 1 : 2));
          code.textContent = full.slice(0, n);
          if (n < full.length) setTimeout(tick, 18 + Math.random() * 22);
        };
        setTimeout(tick, 380);
      }, { threshold: 0.6 });
      tio.observe(term);
    }
    var btn = term.querySelector('[data-copy]');
    var label = btn && btn.querySelector('[data-copy-label]');
    if (btn) {
      var idle = label ? label.textContent : '';
      var done = function (ok) {
        if (label) label.textContent = ok ? (EN ? 'Copied' : 'Скопировано') : (EN ? 'Select and copy' : 'Выделите и скопируйте');
        btn.classList.toggle('is-done', ok);
        setTimeout(function () { if (label) label.textContent = idle; btn.classList.remove('is-done'); }, 2200);
      };
      var fallback = function (text) {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        done(ok);
      };
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(text); });
        } else fallback(text);
      });
    }
  }

  /* ---------- FAQ: animate open/close ---------- */
  [].forEach.call(document.querySelectorAll('details.qa'), function (d) {
    var sum = d.querySelector('summary');
    var ans = d.querySelector('.ans');
    if (!sum || !ans || !ans.animate) return;
    var anim = null;
    sum.addEventListener('click', function (e) {
      if (reduce.matches) return;
      e.preventDefault();
      if (anim) anim.cancel();
      if (!d.open) {
        d.open = true;
        var h = ans.scrollHeight;
        anim = ans.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }],
          { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
        anim.onfinish = function () { anim = null; };
      } else {
        var h2 = ans.offsetHeight;
        anim = ans.animate([{ height: h2 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 300, easing: 'cubic-bezier(.4,0,.2,1)' });
        anim.onfinish = function () { d.open = false; anim = null; };
      }
    });
  });
})();
