import { resetPage } from './util';
import { initThemeControls } from './theme';
import { initGlass } from './glass';
import { initNav } from './nav';
import { initPointer, initMagnetic, initTilt, initReveal, initDecode, initCount, initClock } from './fx';
import { initSearch } from './search';
import { initPost } from './post';
import { initPreview, initFilter, initTimeline } from './lists';

function boot() {
  resetPage();
  initThemeControls();
  initNav();
  initPointer();
  initMagnetic();
  initTilt();
  initReveal();
  initDecode();
  initCount();
  initClock();
  initSearch();
  initPost();
  initPreview();
  initFilter();
  initTimeline();
  requestAnimationFrame(initGlass);
}

document.addEventListener('astro:page-load', boot);
let rz = 0;
addEventListener('resize', () => { clearTimeout(rz); rz = window.setTimeout(initGlass, 200); });
