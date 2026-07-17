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
