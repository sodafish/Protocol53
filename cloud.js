/* Protocol 53 — opslag in Supabase, met offline wachtrij.
   Bootst dezelfde db-API na die de app eerder gebruikte (collection/doc/set/delete/onSnapshot). */
(function(){
  var SB_URL='https://vfcdcnrxtwwcqqksrxad.supabase.co';
  var SB_KEY='sb_publishable_slEtU8zK73VJbSc5zun36Q_Xc6pJhrn';
  var sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'p53-auth'}});
  window.__sb=sb;

  var QKEY='p53-queue', CKEY='p53-cache';
  function load(k,def){ try{ var v=JSON.parse(localStorage.getItem(k)); return v==null?def:v; }catch(e){ return def; } }
  function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
  var queue=load(QKEY,[]), cache=load(CKEY,{}), listeners={}, pulled=false, flushing=false, user=null;

  function merged(coll){
    var m={}, c=cache[coll]||{}, k;
    for(k in c) m[k]=c[k];
    queue.forEach(function(op){ if(op.coll!==coll) return; if(op.data===null) delete m[op.id]; else m[op.id]=op.data; });
    return m;
  }
  function snap(coll){
    var m=merged(coll);
    return {metadata:{fromCache:!pulled},docs:Object.keys(m).map(function(id){ var d=m[id]; return {id:id,exists:true,data:function(){ return d; }}; })};
  }
  var down=false; /* true zolang de database niet antwoordt terwijl het toestel wel online is */
  function stamp(){
    var el=document.getElementById('syncStamp'); if(!el) return;
    var msg='';
    if(!navigator.onLine) msg='Offline · wat je invult wordt bewaard zodra je online bent';
    else if(down) msg='Database niet bereikbaar · je gegevens blijven op dit toestel bewaard';
    else if(queue.length && pulled) msg='Nog niet bewaard · even geduld';
    if(msg){ el.textContent=msg; el.classList.add('warn'); }
    else if(el.classList.contains('warn')){ el.textContent=''; el.classList.remove('warn'); }
  }
  function setDown(v){ if(down!==v){ down=v; stamp(); } }
  function emit(coll){
    (listeners[coll]||[]).forEach(function(l){ try{ l(snap(coll)); }catch(e){} });
    setTimeout(stamp,0);
  }
  function emitAll(){ Object.keys(listeners).forEach(emit); }

  function flush(){
    if(flushing||!user||!queue.length) { stamp(); return Promise.resolve(); }
    flushing=true;
    var op=queue[0];
    var p=op.data===null
      ? sb.from('p53').delete().eq('coll',op.coll).eq('id',op.id)
      : sb.from('p53').upsert({user_id:user.id,coll:op.coll,id:op.id,data:op.data,updated_at:new Date().toISOString()},{onConflict:'user_id,coll,id'});
    return p.then(function(r){
      flushing=false;
      if(r.error){ setDown(true); stamp(); return; }
      setDown(false);
      queue.shift(); save(QKEY,queue);
      var c=cache[op.coll]=cache[op.coll]||{};
      if(op.data===null) delete c[op.id]; else c[op.id]=op.data;
      save(CKEY,cache);
      return flush();
    },function(){ flushing=false; setDown(true); stamp(); });
  }
  function pull(){
    if(!user) return Promise.resolve();
    return sb.from('p53').select('coll,id,data').then(function(r){
      if(r.error){ setDown(true); return; }
      setDown(false);
      var next={};
      (r.data||[]).forEach(function(row){ (next[row.coll]=next[row.coll]||{})[row.id]=row.data; });
      cache=next; save(CKEY,cache); pulled=true; emitAll();
      return r.data||[];
    },function(){ setDown(true); });
  }
  function sync(){ return flush().then(pull); }

  function collection(coll){
    return {
      doc:function(id){
        return {
          set:function(data){ queue=queue.filter(function(o){ return !(o.coll===coll&&o.id===id); }); queue.push({coll:coll,id:id,data:data}); save(QKEY,queue); flush(); return Promise.resolve(); },
          delete:function(){ queue=queue.filter(function(o){ return !(o.coll===coll&&o.id===id); }); queue.push({coll:coll,id:id,data:null}); save(QKEY,queue); flush(); return Promise.resolve(); }
        };
      },
      onSnapshot:function(cb){ (listeners[coll]=listeners[coll]||[]).push(cb); setTimeout(function(){ cb(snap(coll)); },0); return function(){}; }
    };
  }
  var db={collection:collection};

  /* eenmalig: gegevens uit de Claude-versie overnemen */
  function seedIfEmpty(rows){
    if(rows && rows.length) return Promise.resolve();
    if(load('p53-seeded',false)) return Promise.resolve();
    return fetch('seed.json',{cache:'no-store'}).then(function(r){ return r.ok?r.json():null; }).then(function(seed){
      if(!seed) return;
      Object.keys(seed).forEach(function(coll){ Object.keys(seed[coll]).forEach(function(id){ queue.push({coll:coll,id:id,data:seed[coll][id]}); }); });
      save(QKEY,queue); save('p53-seeded',true);
      return sync();
    }).catch(function(){});
  }

  /* ---------- inloggen ---------- */
  var resolveDb, dbReady=new Promise(function(res){ resolveDb=res; });
  window.claude={use:function(name){ return name==='db'?dbReady:Promise.resolve(null); }};

  function start(u){
    user=u; resolveDb(db);
    flush().then(pull).then(seedIfEmpty);
  }
  function showLogin(msg){
    var o=document.getElementById('p53-login'); if(o){ o.hidden=false; if(msg) o.querySelector('.lg-msg').textContent=msg; return; }
    o=document.createElement('div'); o.id='p53-login';
    o.innerHTML='<form class="lg-card" novalidate>'+
      '<h1>Protocol <em>53</em></h1>'+
      '<p class="lg-sub">Log in om je gegevens op al je toestellen te bewaren.</p>'+
      '<label>E-mail<input type="email" name="email" autocomplete="username" required></label>'+
      '<label>Wachtwoord<input type="password" name="pw" autocomplete="current-password" required minlength="6"></label>'+
      '<p class="lg-msg" role="status"></p>'+
      '<button type="submit" class="lg-main">Inloggen</button>'+
      '<button type="button" class="lg-alt">Nog geen account? Account aanmaken</button>'+
    '</form>';
    document.body.appendChild(o);
    var f=o.querySelector('form'), m=o.querySelector('.lg-msg'), signup=false;
    if(msg) m.textContent=msg;
    o.querySelector('.lg-alt').addEventListener('click',function(){
      signup=!signup;
      o.querySelector('.lg-main').textContent=signup?'Account aanmaken':'Inloggen';
      this.textContent=signup?'Al een account? Inloggen':'Nog geen account? Account aanmaken';
      f.pw.setAttribute('autocomplete',signup?'new-password':'current-password');
      m.textContent='';
    });
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var email=f.email.value.trim(), pw=f.pw.value;
      if(!email||pw.length<6){ m.textContent='Vul je e-mail in en een wachtwoord van minstens 6 tekens.'; return; }
      m.textContent=signup?'Account aanmaken…':'Inloggen…';
      var p=signup?sb.auth.signUp({email:email,password:pw}):sb.auth.signInWithPassword({email:email,password:pw});
      p.then(function(r){
        if(r.error){ m.textContent=/Invalid login/i.test(r.error.message)?'E-mail of wachtwoord klopt niet.':/not confirmed/i.test(r.error.message)?'Bevestig eerst je e-mailadres via de mail die je kreeg.':r.error.message; return; }
        if(signup && !r.data.session){ m.textContent='Account aangemaakt. Bevestig via de mail die je kreeg, en log dan hier in.'; signup=false; o.querySelector('.lg-main').textContent='Inloggen'; return; }
        o.hidden=true; start(r.data.user||r.data.session.user);
      },function(){ m.textContent='Geen verbinding. Probeer opnieuw zodra je online bent.'; });
    });
  }

  function boot(){
    sb.auth.getSession().then(function(r){
      var s=r&&r.data&&r.data.session;
      if(s){ start(s.user); return; }
      /* geen sessie: offline toch verder met wat er lokaal staat */
      if(!navigator.onLine && Object.keys(cache).length){ resolveDb(db); return; }
      showLogin();
    },function(){ showLogin(); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();

  window.addEventListener('online',function(){ sync(); });
  window.addEventListener('offline',stamp);
  /* zolang er iets misloopt: elke minuut opnieuw proberen */
  setInterval(function(){ if(user && document.visibilityState==='visible' && navigator.onLine && (down||queue.length)) sync(); },60000);
  document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible') sync(); });

  /* ---------- back-up en uitloggen ---------- */
  window.p53Backup=function(){
    var data={exported:new Date().toISOString()}, k;
    ['log','checks','counts'].forEach(function(c){ data[c]=merged(c); });
    var name='protocol53-backup-'+new Date().toISOString().slice(0,10)+'.json';
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    try{
      var file=new File([blob],name,{type:'application/json'});
      if(navigator.canShare && navigator.canShare({files:[file]})){ navigator.share({files:[file],title:name}).catch(function(){}); return; }
    }catch(e){}
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1000);
  };
  window.p53Logout=function(){
    if(queue.length && !confirm('Er zijn nog wijzigingen die niet bewaard zijn. Toch uitloggen?')) return;
    sb.auth.signOut().then(function(){ ['p53-queue','p53-cache'].forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} }); location.reload(); });
  };

  if('serviceWorker' in navigator){ window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }
})();
