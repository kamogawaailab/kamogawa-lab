/* ============================================================
   Kääselä — サイト共通スクリプト
   1) 言語プルダウン（<details>）を外側クリック / Esc で閉じる
   2) Hero：水が流れ込み、知識グラフ（関係のネットワーク）へ変わる
   どちらも対象要素が無いページでは何もしない（レポート等でも安全）。
   ============================================================ */
(function(){
  /* --- 言語プルダウン --- */
  var menu = document.querySelector('.lang-menu');
  if (menu) {
    document.addEventListener('click', function(e){
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') menu.open = false;
    });
  }

  /* --- Hero：水 → 知識グラフ --- */
  var canvas = document.getElementById('graph');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, DPR, nodes = [], links = [], parts = [], t = 0;
  var RIVER = '74,144,164', TEAL = '124,183,176', SAND = '234,223,204';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function layout(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
    build();
  }
  function build(){
    nodes = []; links = []; parts = [];
    var N = Math.max(15, Math.min(24, Math.round(W/34)));
    var cx = W*0.60, cy = H*0.50;
    for (var i=0;i<N;i++){
      var a = i*2.399963, rad = Math.sqrt(i/N)*Math.min(W*0.34, H*0.46);
      var x = cx+Math.cos(a)*rad*1.05, y = cy+Math.sin(a)*rad*0.9;
      nodes.push({x:x,y:y,ox:x,oy:y,ph:Math.random()*6.283,r:2+Math.random()*2.2,sand:Math.random()<0.09});
    }
    for (var i2=0;i2<nodes.length;i2++){
      var d = [];
      for (var j=0;j<nodes.length;j++) if (i2!==j){
        var dx=nodes[i2].x-nodes[j].x, dy=nodes[i2].y-nodes[j].y; d.push([dx*dx+dy*dy,j]);
      }
      d.sort(function(p,q){return p[0]-q[0];});
      var k = 2+(Math.random()<0.5?1:0);
      for (var m=0;m<k;m++){ var jj=d[m][1];
        if (!links.some(function(l){return l.a===jj && l.b===i2;})) links.push({a:i2,b:jj,ph:Math.random()*6.283}); }
    }
    var P = Math.round(W/10);
    for (var p2=0;p2<P;p2++) parts.push(newP(true));
  }
  function newP(seed){
    return {x:seed?Math.random()*W*0.5:-10, y:Math.random()*H, baseY:0,
      target:nodes[(Math.random()*nodes.length)|0],
      spd:0.25+Math.random()*0.35, amp:6+Math.random()*13, wl:0.008+Math.random()*0.01,
      ph:Math.random()*6.283, settle:0};
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    for (var n=0;n<nodes.length;n++){ var nd=nodes[n];
      nd.x=nd.ox+Math.sin(t*0.006+nd.ph)*3; nd.y=nd.oy+Math.cos(t*0.005+nd.ph)*3; }
    for (var l=0;l<links.length;l++){ var L=links[l], A=nodes[L.a], B=nodes[L.b];
      var br=0.10+0.10*(0.5+0.5*Math.sin(t*0.01+L.ph));
      ctx.strokeStyle='rgba('+TEAL+','+br+')'; ctx.lineWidth=0.8;
      var mx=(A.x+B.x)/2, my=(A.y+B.y)/2+Math.sin(t*0.008+L.ph)*4;
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.quadraticCurveTo(mx,my,B.x,B.y); ctx.stroke();
    }
    for (var i=0;i<parts.length;i++){ var p=parts[i];
      if (p.settle<1){
        p.x+=p.spd*1.6;
        var wave=Math.sin(p.x*p.wl+p.ph+t*0.02)*p.amp;
        p.y+=(wave-(p.baseY||0))*0.04; p.baseY=wave;
        var enter=Math.max(0,(p.x-W*0.34)/(W*0.30));
        if (enter>0){ var e=Math.min(1,enter);
          p.x+=(p.target.x-p.x)*0.02*e; p.y+=(p.target.y-p.y)*0.02*e;
          var dx=p.target.x-p.x, dy=p.target.y-p.y; if (dx*dx+dy*dy<9) p.settle=1; }
        var al=0.18+0.32*Math.min(1,p.x/(W*0.6));
        ctx.fillStyle='rgba('+RIVER+','+al+')';
        ctx.beginPath(); ctx.arc(p.x,p.y,1.4,0,6.2832); ctx.fill();
        ctx.strokeStyle='rgba('+RIVER+','+(al*0.4)+')'; ctx.lineWidth=0.7;
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-7,p.y-p.baseY*0.15); ctx.stroke();
      } else { p.settle+=0.012; if (p.settle>1.9){ var np=newP(false); for (var key in np) p[key]=np[key]; } }
    }
    for (var s=0;s<nodes.length;s++){ var N2=nodes[s];
      var pulse=0.5+0.5*Math.sin(t*0.01+N2.ph);
      if (N2.sand){ ctx.fillStyle='rgba('+SAND+',0.95)'; ctx.shadowColor='rgba('+SAND+',0.6)'; ctx.shadowBlur=8; }
      else { ctx.fillStyle='rgba('+RIVER+','+(0.65+0.25*pulse)+')'; ctx.shadowColor='rgba('+RIVER+',0.35)'; ctx.shadowBlur=6; }
      ctx.beginPath(); ctx.arc(N2.x,N2.y,N2.r+(N2.sand?0.6:0),0,6.2832); ctx.fill(); ctx.shadowBlur=0;
    }
  }
  function step(){ t++; draw(); requestAnimationFrame(step); }

  layout();
  window.addEventListener('resize', function(){ clearTimeout(window._rz); window._rz=setTimeout(layout,180); });
  if (reduce) { draw(); }            /* 動きを控えたい設定では静止画を一度だけ */
  else { requestAnimationFrame(step); }
})();
