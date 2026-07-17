/* ============================================================
   Kääselä — サイト共通スクリプト
   言語プルダウン（<details>）を外側クリック / Esc で閉じる。
   （Hero は静的グラデーションになったため、アニメーションは無し）
   ============================================================ */
(function(){
  var menu = document.querySelector('.lang-menu');
  if (!menu) return;
  document.addEventListener('click', function(e){
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') menu.open = false;
  });
})();

/* --- ページ上部へ戻る（記事ページにのみ表示） --- */
(function(){
  if (!document.querySelector('article')) return;
  var btn = document.createElement('button');
  btn.className = 'to-top';
  btn.setAttribute('aria-label', 'ページ上部へ戻る');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
  btn.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(btn);
  function onScroll(){
    if (window.scrollY > 400) btn.classList.add('show');
    else btn.classList.remove('show');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
