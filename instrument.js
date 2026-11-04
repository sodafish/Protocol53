/* Protocol 53 — INSTRUMENT (tweede design); de Balance-matrix geldt ook in Classic.  (op vraag van Tom, 4 nov 2026).
   Keuze: Settings › Appearance › Design (Classic · Instrument), localStorage p53-design, per toestel.
   Dit script voegt de onderdelen toe die enkel in Instrument bestaan (klasse .ins-only, in Classic verborgen):
   Today-kop op Workout, gewicht-stepper in een open rij, spiermatrix op Balance, eindscherm i.p.v. vuurwerk.
   Het rekent zelf niets nieuws uit: alles komt uit de bestaande bronnen (__calDays, __balState, __p53sug, de DOM). */
(function(){
  var R=document.documentElement;
  function on(){ return R.getAttribute('data-design')==='instrument'; }
  var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  function pad(n){ return (n<10?'0':'')+n; }
  function ymd(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function el(tag,cls,html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
  function later(fn,ms){ var t=0; return function(){ clearTimeout(t); t=setTimeout(fn,ms||60); }; }
  function fmt(v){ return v>=10?Math.round(v)+'':(Math.round(v*10)/10+''); }

  /* ── 1. Settings › Appearance › Design ── */
  function setPaint(){
    var c=window.__p53design?window.__p53design():'classic';
    document.querySelectorAll('#stDesign button[data-ds]').forEach(function(b){ b.setAttribute('aria-pressed',b.dataset.ds===c?'true':'false'); });
    var n=document.getElementById('stDesignNote'); if(n) n.hidden=c==='classic';
    document.querySelectorAll('#st-sheet button[data-th]').forEach(function(b){ if(c!=='classic') b.setAttribute('aria-disabled','true'); else b.removeAttribute('aria-disabled'); });
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('#stDesign button[data-ds]');
    if(b){ try{ if(b.dataset.ds!=='classic') localStorage.setItem('p53-design',b.dataset.ds); else localStorage.removeItem('p53-design'); }catch(x){}
      if(window.__p53designApply) window.__p53designApply(); setPaint(); refreshAll(); return; }
    /* Instrument is enkel licht: de themaknoppen doen niets zolang Instrument aan staat */
    var t=e.target.closest&&e.target.closest('#st-sheet button[data-th]');
    if(t&&on()){ e.preventDefault(); e.stopPropagation(); }
  },true);

  /* ── 2. Today-kop bovenaan Workout: trainingsdagen deze maand + maandkalender in bolletjes ── */
  var today=null;
  function paintToday(){
    var pane=document.getElementById('s-d3'); if(!pane) return;
    if(!today){ today=el('div','ins-today ins-only'); today.setAttribute('aria-live','off'); pane.insertBefore(today,pane.firstChild); }
    if(!on()) return;
    var days={}; try{ days=window.__calDays?window.__calDays():{}; }catch(e){ days={}; }
    var now=new Date(), y=now.getFullYear(), m=now.getMonth(), key=ymd(now), pre=y+'-'+pad(m+1)+'-';
    var mon=new Date(now); mon.setHours(0,0,0,0); mon.setDate(mon.getDate()-((mon.getDay()+6)%7)); var monK=ymd(mon);
    var nMonth=0, nWeek=0; Object.keys(days).forEach(function(k){ if(k.indexOf(pre)===0) nMonth++; if(k>=monK&&k<=key) nWeek++; });
    var first=new Date(y,m,1), off=(first.getDay()+6)%7, len=new Date(y,m+1,0).getDate(), cells=Math.ceil((off+len)/7)*7, wd=(now.getDay()+6)%7;
    var h='<div class="ins-today-top"><div class="ins-today-n" aria-hidden="true">'+nMonth+'</div><div class="ins-today-d"><span>'+DAY[now.getDay()]+' '+now.getDate()+'</span><span>'+MON[m]+'</span></div></div>'+
      '<p class="ins-lab">Training days this month · '+nWeek+' this week</p>'+
      '<span class="ins-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">'+nMonth+(nMonth===1?' training day':' training days')+' in '+MON[m]+'.</span>'+
      '<div class="ins-cal" aria-hidden="true">'+['M','T','W','T','F','S','S'].map(function(l,i){ return '<b'+(i===wd?' class="t"':'')+'>'+l+'</b>'; }).join('');
    for(var i=0;i<cells;i++){ var d=i-off+1, c='x';
      if(d>=1&&d<=len){ var k=pre+pad(d); c=k===key?('today'+(days[k]?' on':'')):k<key?(days[k]?'on':'off'):''; }
      h+='<i'+(c?' class="'+c+'"':'')+'></i>'; }
    h+='</div>';
    today.innerHTML=h;
  }
  var paintTodayL=later(paintToday,80);

  /* ── 3. Gewicht-stepper in een open rij (− / waarde / +), stuurt een gewoon input-event naar het kg-veld ── */
  function kgOf(li){ var a=li.querySelectorAll(':scope > input.note.exr-in'); for(var i=0;i<a.length;i++){ var x=a[i]; if(x.type!=='hidden'&&x.placeholder==='kg') return x; } return null; }
  function num(v){ var m=String(v||'').replace(',','.').match(/-?\d+(\.\d+)?/); return m?parseFloat(m[0]):null; }
  function stepOf(v){ return v!=null&&v<10?1:2.5; }
  function showVal(st,inp){ var o=st.querySelector('output'); var v=num(inp.value); var t=String(inp.value).trim(), mm=t.match(/^(-?\d+)([.,]\d+)?$/); o.innerHTML=(v==null?'–':mm?mm[1]+(mm[2]?'<span class="dec">'+mm[2]+'</span>':''):t)+'<small>kg</small>'; }
  function addSteppers(){
    document.querySelectorAll('#s-d3 .exr.rep-on > .rep-wrap').forEach(function(w){
      var li=w.parentNode; if(li.classList.contains('rep-bw')||li.classList.contains('rep-ss')) return;
      var inp=kgOf(li); if(!inp) return;
      var st=w.querySelector(':scope > .ins-step');
      if(!st){ st=el('div','ins-step ins-only',
          '<button type="button" class="ins-dn" aria-label="Lower the weight"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h12" stroke="currentColor" stroke-width="2"/></svg></button>'+
          '<button type="button" class="ins-v" aria-label="Type the weight"><output></output></button>'+
          '<button type="button" class="ins-up" aria-label="Raise the weight"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h12M9 3v12" stroke="currentColor" stroke-width="2"/></svg></button>');
        st.querySelector('.ins-v').style.cssText='box-shadow:none;background:transparent;width:auto;padding:0 8px;border-radius:12px';
        var last=w.querySelector(':scope > .rep-last'); w.insertBefore(st,last?last.nextSibling:w.firstChild); }
      showVal(st,inp);
    });
  }
  var addSteppersL=later(addSteppers,60);
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.ins-step button'); if(!b) return;
    e.stopPropagation(); var li=b.closest('.exr'), inp=li&&kgOf(li); if(!inp) return;
    if(b.classList.contains('ins-v')){ inp.focus(); return; }
    var v=num(inp.value); if(v==null) v=num(inp.placeholder)||0;
    var s=stepOf(v), nv=Math.max(0,Math.round((v+(b.classList.contains('ins-up')?s:-s))*100)/100);
    var comma=/,/.test(inp.value), txt=String(nv); if(comma) txt=txt.replace('.',',');
    inp.value=txt; inp.dispatchEvent(new Event('input',{bubbles:true})); inp.dispatchEvent(new Event('change',{bubbles:true}));
    showVal(b.closest('.ins-step'),inp);
  },true);
  document.addEventListener('input',function(e){ var t=e.target; if(t&&t.classList&&t.classList.contains('exr-in')){ var li=t.closest('.exr'), st=li&&li.querySelector('.ins-step'); if(st) showVal(st,t); } },true);

  /* ── 4. Balance: spiermatrix (1 bolletje = 1 set; ring = nog tot het minimum) ── */
  var bal=null;
  function figOn(){ try{ return localStorage.getItem('p53-ins-fig')==='1'; }catch(e){ return false; } }
  function paintBal(){
    var sv=document.querySelector('.stats > .sv[data-sv="body"]'); if(!sv) return;
    document.body.classList.toggle('ins-fig',figOn());
    if(!bal){ bal={
        head:el('div','ins-bal-head'),
        bar:el('div','ins-bal-bar','<div class="ins-key"><span><i></i>Set</span><span><i class="r"></i>To minimum</span></div><div class="ins-vseg" role="group" aria-label="View"><button type="button" data-v="mx">Matrix</button><button type="button" data-v="fig">Figure</button></div>'),
        mx:el('ol','ins-mx'), sug:el('button','ins-sug') };
      bal.sug.type='button';
      var per=sv.querySelector('.stats-per'), sub=sv.querySelector('.stats-subrow');
      sv.insertBefore(bal.head,sub||per.nextSibling);
      var after=sub?sub.nextSibling:null; sv.insertBefore(bal.bar,after); sv.insertBefore(bal.mx,after); sv.insertBefore(bal.sug,after);
      bal.bar.addEventListener('click',function(e){ var b=e.target.closest('button[data-v]'); if(!b) return;
        try{ if(b.dataset.v==='fig') localStorage.setItem('p53-ins-fig','1'); else localStorage.removeItem('p53-ins-fig'); }catch(x){} paintBal();
        if(b.dataset.v==='fig'&&window.__balDraw) try{ window.__balDraw(); }catch(x){} });
      bal.sug.addEventListener('click',function(){ var s=document.getElementById('sugBtn'); if(s) s.click(); });
    }
    bal.bar.querySelectorAll('button[data-v]').forEach(function(b){ b.setAttribute('aria-pressed',(b.dataset.v==='fig')===figOn()?'true':'false'); });
    var B=window.__balState||{sc:{},n:0,perWeek:true,spanW:1}, S=window.__p53sug||{MLAB:{},SUG_MIN:{}}, sc=B.sc||{}, W=B.perWeek?1:(B.spanW||1);
    var keys=Object.keys(S.MLAB), max=0;
    keys.forEach(function(k){ var t=(S.SUG_MIN[k]||0)*W; max=Math.max(max,sc[k]||0,t); });
    var u=max>12?Math.ceil(max/12):1;
    bal.head.innerHTML='<span class="ins-bal-n">'+(B.n||0)+'</span><div class="ins-bal-u"><span>'+((B.n===1)?'training day':'training days')+'</span><span>'+(B.perWeek?'sets per week':'sets in total')+'</span></div>';
    bal.bar.querySelector('.ins-key span').lastChild.textContent=u===1?'Set':u+' sets';
    var low=[];
    bal.mx.innerHTML=keys.map(function(k){
      var v=sc[k]||0, t=(S.SUG_MIN[k]||0)*W, f=Math.floor(v/u+1e-9), half=(v/u-f)>=.5, tt=Math.ceil(t/u-1e-9), d='';
      for(var i=0;i<12;i++){ var c=i<f?'on':(i===f&&half)?'h':i<tt?'t':''; d+='<i'+(c?' class="'+c+'"':'')+'></i>'; }
      var isLow=t>0&&v<t-1e-9; if(isLow) low.push({k:k,r:v/t});
      return '<li class="'+(isLow?'low':'')+(v?'':' zero')+'" aria-label="'+S.MLAB[k]+': '+fmt(v)+(t?' of '+fmt(t):'')+' sets"><span class="n">'+S.MLAB[k]+'</span><span class="d" aria-hidden="true">'+d+'</span><span class="v">'+(v?fmt(v):'–')+(isLow?'/'+fmt(t):'')+'</span></li>';
    }).join('');
    low.sort(function(a,b){ return a.r-b.r; });
    bal.sug.hidden=!B.n;
    bal.sug.classList.toggle('ok',!low.length);
    bal.sug.innerHTML=low.length
      ? '<span>Give more attention<small>'+low.slice(0,3).map(function(x){ return S.MLAB[x.k]; }).join(', ')+(low.length>3?' …':'')+'</small></span><b>'+low.length+'</b>'
      : '<span>Nicely balanced<small>Every muscle gets enough work.</small></span><b>›</b>';
  }
  var paintBalL=later(paintBal,40);

  /* ── 5. Eindscherm i.p.v. vuurwerk (enkel Instrument) ── */
  var snap=null;
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('#woEnd'); if(!b||b.classList.contains('is-start')) return;
    var n=b.querySelector('.wo-end-n'), txt=n?n.textContent:'', g=[].slice.call(document.querySelectorAll('#woGrp button'));
    var tab=document.querySelector('#wtabs .wd-pill button[aria-selected="true"]');
    snap={sets:+((txt.match(/(\d+)\s*sets?/)||[])[1]||0), cardio:((txt.match(/(\d+h(?: \d+m)?|\d+m)\s*cardio/)||[])[1]||''),
      gd:g.filter(function(x){ return x.classList.contains('d'); }).length, gt:g.length, prog:tab?tab.textContent.trim():''};
  },true);
  function doneScreen(o){
    var s=snap||{sets:0,cardio:'',gd:0,gt:0,prog:''}; snap=null;
    var now=new Date(), min=o&&o.min!=null?o.min:null, ex=o&&o.n||0;
    var tm=min==null?'–':min<60?min+' min':Math.floor(min/60)+'h '+pad(min%60);
    var slots=Math.min(30,Math.max(10,Math.ceil(Math.max(s.sets,ex)/5)*5)), fill=Math.min(slots,s.sets||ex), dots='';
    for(var i=0;i<slots;i++) dots+='<i'+(i<fill?' class="on"':'')+' style="transition-delay:'+(i*28)+'ms"></i>';
    var head=s.sets?s.sets+(s.sets===1?' set':' sets'):ex?ex+(ex===1?' exercise':' exercises'):'Done';
    var bits=[]; if(min!=null) bits.push(tm); if(ex) bits.push(ex+(ex===1?' exercise':' exercises')); if(s.cardio) bits.push(s.cardio+' cardio');
    var w=el('div','ins-done','<div class="ins-done-in" role="dialog" aria-modal="true" aria-label="Workout done">'+
      '<span class="ins-done-k">'+DAY[now.getDay()]+' '+now.getDate()+' '+MON[now.getMonth()].slice(0,3)+(s.prog?' · '+s.prog:'')+'</span>'+
      '<div class="ins-done-dots" aria-hidden="true">'+dots+'</div>'+
      '<h2>'+head+'</h2><p>Congratulations. '+bits.join(', ')+'.</p>'+
      '<div class="ins-done-grid"><div><span>Time</span><b>'+tm+'</b></div><div><span>Groups</span><b>'+(s.gt?s.gd+' / '+s.gt:'–')+'</b></div><div><span>Exercises</span><b>'+(ex||'–')+'</b></div></div>'+
      '<button type="button">View balance</button></div>');
    document.body.appendChild(w); var btn=w.querySelector('button');
    requestAnimationFrame(function(){ w.classList.add('on'); btn.focus({preventScroll:true}); });
    function close(){ w.classList.remove('on'); document.removeEventListener('keydown',key); setTimeout(function(){ w.remove(); },260); }
    function key(e){ if(e.key==='Escape'||e.key==='Enter') close(); }
    w.addEventListener('click',close); document.addEventListener('keydown',key);
  }
  function wrapCongrats(){
    if(!window.__congrats||window.__congrats.__ins) return;
    var orig=window.__congrats;
    window.__congrats=function(o){ return on()?doneScreen(o):orig(o); }; window.__congrats.__ins=1;
  }

  /* ── verversen ── */
  function refreshAll(){ setPaint(); paintToday(); addSteppers(); paintBal(); }
  function boot(){
    wrapCongrats(); refreshAll();
    document.addEventListener('p53-prog',paintTodayL); document.addEventListener('p53-design',refreshAll);
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible') paintTodayL(); });
    var cg=document.getElementById('calGrid'); if(cg) new MutationObserver(paintTodayL).observe(cg,{childList:true});
    var sl=document.getElementById('statsList'); if(sl) new MutationObserver(paintBalL).observe(sl,{childList:true});
    var sd=document.getElementById('s-d3'); if(sd) new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){ var t=ms[i].target; if(t.closest&&t.closest('.ins-step')) continue; addSteppersL(); return; } }).observe(sd,{childList:true,subtree:true});
    setInterval(function(){ if(on()) paintToday(); },10*60*1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
