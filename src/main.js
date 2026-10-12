import '@fontsource/prata/400.css';
import '@fontsource/golos-text/400.css';
import '@fontsource/golos-text/500.css';
import '@fontsource/golos-text/600.css';
import './styles.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- smooth scroll ---------- */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- header & menu ---------- */
const header = $('#header');
const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const burger = $('#burger');
const menu = $('#menu');
if (burger && menu) {
  burger.addEventListener('click', () => {
    const open = document.documentElement.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });
}
const page = document.body.dataset.page;
$$('#menu [data-nav="' + page + '"]').forEach((a) => a.setAttribute('aria-current', 'page'));

/* ---------- footer year ---------- */
$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------- animations ---------- */
function animate() {
  if (reduce) return;

  // headings: line-by-line mask reveal
  $$('.split').forEach((el) => {
    const inHero = el.closest('.hero, .phero');
    const split = SplitText.create(el, { type: 'lines', linesClass: 'line', mask: 'lines', autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: inHero ? 0.15 : 0,
          scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
    return split;
  });

  // fade-up groups
  $$('[data-reveal]').forEach((el) => {
    const kids = el.dataset.reveal === 'children' ? [...el.children] : [el];
    gsap.from(kids, {
      y: 36, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  // image reveal (clip) + parallax
  $$('[data-parallax]').forEach((wrap) => {
    const img = wrap.querySelector('img');
    if (!img) return;
    if (!wrap.closest('.hero')) {
      gsap.from(wrap, { clipPath: 'inset(12% 6% 12% 6% round 32px)', duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: wrap, start: 'top 92%', once: true } });
    }
    gsap.fromTo(img, { yPercent: -10 }, { yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // hero entrance
  const hero = $('.hero');
  if (hero) {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero__photo', { clipPath: 'inset(8% 8% 8% 8% round 32px)', scale: 1.04, duration: 1.6 }, 0)
      .from('.hero__float', { y: 40, opacity: 0, duration: 1.2 }, 0.5)
      .from('.seal', { scale: 0.6, opacity: 0, duration: 1.2 }, 0.7)
      .from('.hero__ghost', { y: 60, opacity: 0, duration: 2 }, 0)
      .from('.hero [data-hero-fade]', { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.45);
  }

  // counters
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, { v: end, duration: 1.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.firstChild.nodeValue = Math.round(obj.v)) });
  });

  // horizontal process
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const sec = $('.process');
    const track = $('.process__track');
    if (!sec || !track) return;
    const dist = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
    });
  });
}

if (document.fonts && document.fonts.ready) document.fonts.ready.then(animate); else animate();
window.addEventListener('load', () => ScrollTrigger.refresh());

/* ---------- forms ---------- */
$$('form[data-lead]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const name = (form.elements.name && form.elements.name.value.trim()) || '';
    const box = document.createElement('div');
    box.className = 'form-ok';
    box.innerHTML = '<h3>Заявка принята</h3><p></p>';
    box.querySelector('p').textContent = (name ? name + ', с' : 'С') + 'пасибо. Менеджер свяжется с вами в течение рабочего дня и пришлёт прайс. Срочные вопросы — +998 94 614 02 41.';
    form.replaceWith(box);
  });
});

/* ---------- copy ---------- */
$$('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const old = btn.textContent;
    try { await navigator.clipboard.writeText(btn.dataset.copy); btn.textContent = 'Скопировано'; }
    catch { btn.textContent = btn.dataset.copy; }
    setTimeout(() => (btn.textContent = old), 1800);
  });
});
