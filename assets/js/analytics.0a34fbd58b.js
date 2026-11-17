/* Google Analytics 4 with Google consent mode, and a small cookie banner.
   - EEA, UK and Switzerland: nothing is stored until the visitor accepts (consent defaults to denied there).
   - Elsewhere: analytics runs by default; the visitor can decline in the banner or later via "Cookie settings".
   - Ads storage and ads user data follow the same rule: Google signals needs them for its demographics and interests
     reports. Ads personalization (remarketing) is never granted.
   UTM tags (utm_source, utm_medium, utm_campaign, ...) are read by GA4 itself from the landing URL. */
(function () {
  var GA_ID = 'G-QPH4NJWWVS';
  var KEY = 'sx-analytics-consent'; // 'granted' | 'denied'
  var STRICT = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH'];

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage blocked: ask every visit */ }

  function state(v) { return { analytics_storage: v, ad_storage: v, ad_user_data: v, ad_personalization: 'denied' }; }
  var strict = state('denied'); strict.region = STRICT; strict.wait_for_update = 500;
  gtag('consent', 'default', strict);
  gtag('consent', 'default', state('granted'));
  if (saved === 'granted' || saved === 'denied') gtag('consent', 'update', state(saved));

  gtag('js', new Date());
  gtag('config', GA_ID);
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  function choose(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* ignore */ }
    gtag('consent', 'update', state(v));
    var b = document.getElementById('sx-consent');
    if (b) b.remove();
  }

  function banner() {
    if (document.getElementById('sx-consent')) return;
    var b = document.createElement('div');
    b.id = 'sx-consent';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Cookie choice');
    b.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:90;max-width:640px;margin:0 auto;background:#fff;border:1px solid #D6D3CB;border-radius:8px;box-shadow:0 16px 32px -20px rgba(30,41,59,.45);padding:16px 18px;display:flex;flex-wrap:wrap;gap:12px 16px;align-items:center;font:500 15px/1.45 Manrope,ui-sans-serif,system-ui,sans-serif;color:#1E1E1E';
    b.innerHTML = '<p style="margin:0;flex:1 1 260px">We use Google Analytics cookies to see how visitors find and use this site, including aggregated demographics. <a href="/privacy" style="color:inherit">Privacy</a></p>' +
      '<span style="display:flex;gap:10px"><button type="button" data-v="denied" style="min-height:38px;padding:0 16px;border-radius:5px;border:1px solid #C9C6BE;background:#fff;color:#1E1E1E;font:inherit;cursor:pointer">Decline</button>' +
      '<button type="button" data-v="granted" style="min-height:38px;padding:0 16px;border-radius:5px;border:1px solid #1E293B;background:#1E293B;color:#fff;font:inherit;cursor:pointer">Accept</button></span>';
    b.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute && e.target.getAttribute('data-v');
      if (v) choose(v);
    });
    document.body.appendChild(b);
  }

  // Leads: sign-up, checkout and sales-contact clicks, and the contact form being sent
  function track(e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/\/disclaimer(\b|$)/.test(h)) gtag('event', 'sign_up_click', { link_text: (a.textContent || '').trim().slice(0, 80) });
    else if (/\/(test)?subscribe(\b|$)/.test(h)) gtag('event', 'begin_checkout_click', { link_text: (a.textContent || '').trim().slice(0, 80) });
    else if (/\/contact\?/.test(h)) gtag('event', 'contact_sales_click', { link_text: (a.textContent || '').trim().slice(0, 80) });
    else if (/smarttestaix|testaix\.sentraix\.com/.test(h)) gtag('event', 'login_click');
  }

  function start() {
    document.addEventListener('click', track, true);
    document.addEventListener('submit', function (e) {
      if (e.target && e.target.closest && e.target.closest('form.form')) gtag('event', 'generate_lead', { form: 'contact' });
    }, true);
    // "Cookie settings" in the footer's legal links reopens the choice
    var legal = document.querySelector('nav[aria-label="Legal"]');
    if (legal && !legal.querySelector('[data-cookie-settings]')) {
      var l = document.createElement('a');
      l.href = '#';
      l.textContent = 'Cookie settings';
      l.setAttribute('data-cookie-settings', '');
      l.addEventListener('click', function (e) { e.preventDefault(); banner(); });
      legal.appendChild(l);
    }
    if (saved !== 'granted' && saved !== 'denied') banner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
