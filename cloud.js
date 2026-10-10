/* Protocol 53 — opslag in Supabase, met offline wachtrij.
   Bootst dezelfde db-API na die de app eerder gebruikte (collection/doc/set/delete/onSnapshot). */
(function(){
  var SB_URL='https://vfcdcnrxtwwcqqksrxad.supabase.co';
  var SB_KEY='sb_publishable_slEtU8zK73VJbSc5zun36Q_Xc6pJhrn';
  /* link uit de mail 'reset password' (op vraag van Tom, 10 okt): #…type=recovery (of een fout, bv. verlopen link); vóór createClient lezen, die wist de hash */
  var HASH=location.hash||'', RECOVERY=/type=recovery/.test(HASH), LINKERR=/error_code=|error=/.test(HASH)?(/otp_expired/.test(HASH)?'This reset link has expired. Request a new one below.':'This link is no longer valid. Request a new one below.'):'';
  var REDIRECT=location.origin+location.pathname;
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
  var pendSince=0, pendTimer=null;
  var down=false; /* true zolang de database niet antwoordt terwijl het toestel wel online is */
  function stamp(){
    var el=document.getElementById('syncStamp'); if(!el) return;
    var msg='';
    if(!navigator.onLine) msg='Offline · what you enter is saved once you are online';
    else if(down) msg='Database unreachable · your data stays saved on this device';
    else if(queue.length && pulled){
      /* pas tonen als het na 1 s nog niet bewaard is (anders flikkert het bij elk vinkje) */
      if(!pendSince){ pendSince=Date.now(); clearTimeout(pendTimer); pendTimer=setTimeout(stamp,1050); }
      if(Date.now()-pendSince>=1000) msg='Not saved yet · one moment';
    }
    if(!queue.length){ pendSince=0; clearTimeout(pendTimer); }
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
      recent.push({op:op,t:Date.now()}); if(recent.length>200) recent.splice(0,recent.length-200);
      var c=cache[op.coll]=cache[op.coll]||{};
      if(op.data===null) delete c[op.id]; else c[op.id]=op.data;
      save(CKEY,cache);
      return flush();
    },function(){ flushing=false; setDown(true); stamp(); });
  }
  /* wat tijdens een lopende pull bewaard werd, staat nog niet in het antwoord van die pull: opnieuw toepassen, anders verdwijnt
     een vinkje/meting die je net zette (race tussen pull en flush) */
  var recent=[];
  function pull(){
    if(!user) return Promise.resolve();
    var t0=Date.now()-2000;
    return sb.from('p53').select('coll,id,data').then(function(r){
      if(r.error){ setDown(true); return; }
      setDown(false);
      var next={};
      (r.data||[]).forEach(function(row){ (next[row.coll]=next[row.coll]||{})[row.id]=row.data; });
      recent=recent.filter(function(x){ return x.t>Date.now()-120000; });
      recent.forEach(function(x){ if(x.t<t0) return; var o=x.op, c=next[o.coll]=next[o.coll]||{}; if(o.data===null) delete c[o.id]; else c[o.id]=o.data; });
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

  /* alle lokale gegevens van de app (fitlog-*, p53-queue, p53-cache) wissen, bv. bij een andere gebruiker */
  function wipeLocal(){
    try{ Object.keys(localStorage).forEach(function(k){ if(/^fitlog-/.test(k)||k===QKEY||k===CKEY||k==='p53-seeded') localStorage.removeItem(k); }); }catch(e){}
  }

  /* ---------- inloggen ---------- */
  var resolveDb, dbReady=new Promise(function(res){ resolveDb=res; });
  window.claude={use:function(name){ return name==='db'?dbReady:Promise.resolve(null); }};

  function start(u){
    /* ander account dan de vorige keer op dit toestel: niets van de vorige gebruiker meenemen */
    var prev=load('p53-uid',null);
    if(prev && prev!==u.id){ wipeLocal(); save('p53-uid',u.id); location.reload(); return; }
    save('p53-uid',u.id);
    user=u; window.__p53user=u; resolveDb(db);
    try{ document.dispatchEvent(new CustomEvent('p53-user',{detail:u})); }catch(e){}
    flush().then(pull);
  }
  function showLogin(msg){
    var o=document.getElementById('p53-login'); if(o){ o.hidden=false; if(msg) o.querySelector('.lg-msg').textContent=msg; return; }
    o=document.createElement('div'); o.id='p53-login';
    o.innerHTML='<form class="lg-card" novalidate>'+
      '<h1>Protocol</h1>'+
      '<p class="lg-sub">Log in to save your data across all your devices.</p>'+
      '<label>Email<input type="email" name="email" autocomplete="username" required></label>'+
      '<label>Password<input type="password" name="pw" autocomplete="current-password" required minlength="6"></label>'+
      '<label class="lg-dob" hidden>Date of birth<input type="date" name="dob"></label>'+
      '<p class="lg-msg" role="status"></p>'+
      '<button type="submit" class="lg-main">Log in</button>'+
      '<button type="button" class="lg-alt">No account yet? Create account</button>'+
      '<button type="button" class="lg-alt lg-forgot">Forgot password?</button>'+
    '</form>';
    document.body.appendChild(o);
    var f=o.querySelector('form'), m=o.querySelector('.lg-msg'), signup=false, reset=false, fg=o.querySelector('.lg-forgot');
    if(msg) m.textContent=msg;
    /* wachtwoord vergeten: enkel e-mail, Supabase stuurt een link die terugkomt naar de app (type=recovery) */
    function setReset(on){ reset=on; signup=false; f.pw.closest('label').hidden=on; o.querySelector('.lg-dob').hidden=true;
      o.querySelector('.lg-main').textContent=on?'Send reset link':'Log in';
      o.querySelector('.lg-alt').textContent='No account yet? Create account'; o.querySelector('.lg-alt').hidden=on;
      fg.textContent=on?'Back to log in':'Forgot password?'; m.textContent=on?'Enter your email. We’ll send you a link to choose a new password.':''; }
    fg.addEventListener('click',function(){ setReset(!reset); });
    if(msg&&msg===LINKERR){ setReset(true); m.textContent=msg; }
    o.querySelector('.lg-alt').addEventListener('click',function(){
      if(reset) setReset(false);
      signup=!signup;
      o.querySelector('.lg-main').textContent=signup?'Create account':'Log in';
      this.textContent=signup?'Already have an account? Log in':'No account yet? Create account';
      f.pw.setAttribute('autocomplete',signup?'new-password':'current-password');
      o.querySelector('.lg-dob').hidden=!signup;
      m.textContent='';
    });
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var email=f.email.value.trim(), pw=f.pw.value;
      if(reset){ if(!/\S+@\S+\.\S+/.test(email)){ m.textContent='Enter your email address.'; return; }
        m.textContent='Sending…';
        sb.auth.resetPasswordForEmail(email,{redirectTo:REDIRECT}).then(function(r){
          if(r.error){ m.textContent=/rate|limit|seconds/i.test(r.error.message)?'Too many requests. Wait a little and try again.':r.error.message; return; }
          m.textContent='If there’s an account for this address, you’ll get an email with a link. Open it, choose a new password, then log in here.';
        },function(){ m.textContent='No connection. Try again once you are online.'; }); return; }
      if(!email||pw.length<6){ m.textContent='Enter your email and a password of at least 6 characters.'; return; }
      var dob=f.dob.value;
      if(signup && !/^\d{4}-\d{2}-\d{2}$/.test(dob)){ m.textContent='Enter your date of birth.'; return; }
      m.textContent=signup?'Creating account…':'Logging in…';
      var p=signup?sb.auth.signUp({email:email,password:pw,options:{data:{dob:dob}}}):sb.auth.signInWithPassword({email:email,password:pw});
      p.then(function(r){
        if(r.error){ m.textContent=/Invalid login/i.test(r.error.message)?'Email or password is incorrect.':/not confirmed/i.test(r.error.message)?'First confirm your email address via the email you received.':r.error.message; return; }
        if(signup && !r.data.session){ m.textContent='Account created. Confirm via the email you received, then log in here.'; signup=false; o.querySelector('.lg-main').textContent='Log in'; o.querySelector('.lg-dob').hidden=true; o.querySelector('.lg-alt').textContent='No account yet? Create account'; return; }
        o.hidden=true; start(r.data.user||r.data.session.user);
      },function(){ m.textContent='No connection. Try again once you are online.'; });
    });
  }

  /* na de link uit de mail: nieuw wachtwoord kiezen, daarna gewoon verder */
  function showNewPw(u){
    try{ history.replaceState(null,'',REDIRECT); }catch(e){}
    var o=document.createElement('div'); o.id='p53-login';
    o.innerHTML='<form class="lg-card" novalidate>'+
      '<h1>Protocol</h1>'+
      '<p class="lg-sub">Choose a new password for '+String(u.email||'your account').replace(/</g,'&lt;')+'.</p>'+
      '<label>New password<input type="password" name="pw" autocomplete="new-password" required minlength="6"></label>'+
      '<p class="lg-msg" role="status"></p>'+
      '<button type="submit" class="lg-main">Save password</button>'+
    '</form>';
    document.body.appendChild(o);
    var f=o.querySelector('form'), m=o.querySelector('.lg-msg');
    f.addEventListener('submit',function(e){ e.preventDefault(); var pw=f.pw.value;
      if(pw.length<6){ m.textContent='Use at least 6 characters.'; return; }
      m.textContent='Saving…';
      sb.auth.updateUser({password:pw}).then(function(r){
        if(r.error){ m.textContent=/different/i.test(r.error.message)?'Choose a password you haven’t used before.':r.error.message; return; }
        o.remove(); start(u);
      },function(){ m.textContent='No connection. Try again once you are online.'; }); });
  }
  /* wachtwoord wijzigen terwijl je ingelogd bent (Settings) */
  window.p53ChangePw=function(pw){ if(!navigator.onLine) return Promise.reject(new Error('offline'));
    return sb.auth.updateUser({password:pw}).then(function(r){ if(r.error) throw r.error; }); };

  function boot(){
    if(LINKERR){ try{ history.replaceState(null,'',REDIRECT); }catch(e){} }
    sb.auth.getSession().then(function(r){
      var s=r&&r.data&&r.data.session;
      if(s&&RECOVERY){ showNewPw(s.user); return; }
      if(s){ start(s.user); return; }
      /* geen sessie: offline toch verder met wat er lokaal staat */
      if(!navigator.onLine && Object.keys(cache).length){ resolveDb(db); return; }
      showLogin(LINKERR);
    },function(){ showLogin(LINKERR); });
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
    ['log','checks','counts','hist','prog','cfg','sess'].forEach(function(c){ data[c]=merged(c); }); /* alles: ook statistieken, metingen en instellingen */
    var name='protocol53-backup-'+new Date().toISOString().slice(0,10)+'.json';
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    try{
      var file=new File([blob],name,{type:'application/json'});
      if(navigator.canShare && navigator.canShare({files:[file]})){ navigator.share({files:[file],title:name}).catch(function(){}); return; }
    }catch(e){}
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1000);
  };
  /* alle trainingsgegevens wissen (opnieuw beginnen): vinkjes, tellers, statistieken, metingen, sessies en de waarden in de
     invulvelden (logIds). Notities en instellingen (cfg: oefeningkeuze, sets, profiel) blijven. Alleen online. */
  window.p53ResetData=function(logIds){
    var COLLS=['checks','counts','hist','prog','sess'];
    if(!user||!navigator.onLine) return Promise.reject(new Error('offline'));
    var ids=(logIds||[]).filter(Boolean);
    return sb.from('p53').delete().eq('user_id',user.id).in('coll',COLLS).then(function(r){
      if(r.error) throw r.error;
      return ids.length?sb.from('p53').delete().eq('user_id',user.id).eq('coll','log').in('id',ids):{};
    }).then(function(r){
      if(r&&r.error) throw r.error;
      COLLS.forEach(function(c){ delete cache[c]; });
      if(cache.log) ids.forEach(function(id){ delete cache.log[id]; });
      queue=queue.filter(function(op){ return COLLS.indexOf(op.coll)<0 && !(op.coll==='log'&&ids.indexOf(op.id)>=0); });
      save(QKEY,queue); save(CKEY,cache);
      try{ ['fitlog-checks','fitlog-counts','fitlog-hist','fitlog-prog','fitlog-sess','fitlog-undo','fitlog-wo-start'].forEach(function(k){ localStorage.removeItem(k); }); }catch(e){}
    });
  };
  window.p53Logout=function(){
    function out(){ sb.auth.signOut().then(function(){ wipeLocal(); try{ localStorage.removeItem('p53-uid'); }catch(e){} location.reload(); }); }
    if(!queue.length) return out();
    var ask=window.p53Confirm?window.p53Confirm({title:'Log out?',msg:'Some changes have not been saved yet.',ok:'Log out',danger:true}):Promise.resolve(confirm('Some changes have not been saved yet. Log out anyway?'));
    ask.then(function(y){ if(y) out(); });
  };

  if('serviceWorker' in navigator){ window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }
})();
