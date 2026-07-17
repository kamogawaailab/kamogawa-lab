/* ============================================================
   Kääselä — サイト共通スクリプト
   1) 言語プルダウンの開閉
   2) 記事ページのページ上部へ戻るボタン
   3) Hero アニメーション：River Flow → Invisible Intelligence
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

/* --- Hero：River Flow → 隠れた知識グラフが現れ・つながり・呼吸して、また流れへ還る --- */
(function(){
  var cv = document.querySelector('.hero-flow');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var W, H, DPR, lines = [], nodes = [], edges = [], t0 = performance.now();
  var RIVER = '74,144,164', TEAL = '124,183,176', SAND = '234,223,204';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOOP = 28000;

  function layout(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    if (!W || !H) return;
    cv.width = W*DPR; cv.height = H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
    build();
  }
  function build(){
    lines = []; nodes = []; edges = [];
    var NL = 16;
    for (var i=0;i<NL;i++){ var f=i/(NL-1);
      lines.push({base:H*(0.08+0.86*f), amp:12+Math.random()*22, wl:190+Math.random()*170,
                  sp:0.05+Math.random()*0.05, ph:Math.random()*6.283, teal:i%3===0, a:0.05+Math.random()*0.05}); }
    var anchors=[[2,0.30],[4,0.52],[5,0.40],[6,0.66],[7,0.34],[8,0.58],[9,0.46],[10,0.70],[11,0.38],[12,0.60],[13,0.50]];
    anchors.forEach(function(an,idx){ nodes.push({li:an[0], xf:0.18+an[1]*0.72, r:2+Math.random()*1.4,
                    sand:(idx===3||idx===8), breathe:(idx===8)}); });
    var pos = nodes.map(function(n){ return nodeXY(n,0); });
    for (var a=0;a<nodes.length;a++){ var d=[];
      for (var b=0;b<nodes.length;b++) if(a!==b){ var dx=pos[a].x-pos[b].x, dy=pos[a].y-pos[b].y; d.push([dx*dx+dy*dy,b]); }
      d.sort(function(p,q){return p[0]-q[0];});
      for (var m=0;m<2;m++){ var jj=d[m][1]; if(!edges.some(function(e){return e.a===jj&&e.b===a;})) edges.push({a:a,b:jj}); } }
  }
  function ly(L,x,t){ return L.base + L.amp*Math.sin(x/L.wl*6.283 - t*L.sp + L.ph) + 8*Math.sin(t*0.09+L.ph); }
  function nodeXY(n,t){ var L=lines[n.li]||lines[0]; return {x:W*n.xf, y:ly(L,W*n.xf,t)}; }
  function smooth(a,b,x){ x=Math.max(0,Math.min(1,(x-a)/(b-a))); return x*x*(3-2*x); }

  function frame(now){
    if (!W || !H){ requestAnimationFrame(frame); return; }
    var el = now - t0, t = el*0.001, cp = (el % LOOP)/LOOP;
    if (reduce) t = 0;
    ctx.clearRect(0,0,W,H);
    for (var i=0;i<lines.length;i++){ var L=lines[i]; ctx.beginPath();
      for (var x=-10;x<=W+10;x+=9){ var y=ly(L,x,t); if(x<=-10)ctx.moveTo(x,y); else ctx.lineTo(x,y); }
      ctx.strokeStyle='rgba('+(L.teal?TEAL:RIVER)+','+L.a+')'; ctx.lineWidth=1; ctx.stroke(); }
    var nodeP = reduce?0.55 : smooth(0.30,0.46,cp)*(1-smooth(0.78,0.92,cp));
    var edgeP = reduce?0.45 : smooth(0.42,0.58,cp)*(1-smooth(0.74,0.88,cp));
    var breatheP = reduce?0 : smooth(0.58,0.63,cp)*(1-smooth(0.66,0.72,cp));
    if (nodeP>0.01 || edgeP>0.01){
      var P = nodes.map(function(n){ return nodeXY(n,t); });
      for (var e=0;e<edges.length;e++){ var A=P[edges[e].a], B=P[edges[e].b];
        ctx.strokeStyle='rgba('+TEAL+','+(0.28*edgeP)+')'; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke(); }
      for (var k=0;k<nodes.length;k++){ var n=nodes[k], p=P[k];
        var g=(n.breathe?breatheP:0), col=n.sand?SAND:RIVER;
        if(g>0.02){ ctx.shadowColor='rgba('+col+','+(0.6*g)+')'; ctx.shadowBlur=12*g; }
        ctx.fillStyle='rgba('+col+','+((n.sand?0.7:0.6)*nodeP + 0.4*g)+')';
        ctx.beginPath(); ctx.arc(p.x,p.y,n.r+1.6*g,0,6.2832); ctx.fill(); ctx.shadowBlur=0; }
    }
    requestAnimationFrame(frame);
  }
  layout();
  window.addEventListener('resize', function(){ clearTimeout(window._hrz); window._hrz=setTimeout(layout,180); });
  requestAnimationFrame(frame);
})();
