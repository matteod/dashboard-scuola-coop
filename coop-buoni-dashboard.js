(() => {
  const API = 'https://api.coopperlascuola.it/v1/fundraising/get-beneficiaries';
  const HEADERS = {'x-custom-header': JSON.stringify({alias:'www.coopperlascuola.it',source:'web',lang:'it'})};
  const COLORS = ['#3457eb','#008c82','#7652d6','#e59b35','#f16f61','#65758b'];

  class CoopBuoniDashboard extends HTMLElement {
    static get observedAttributes(){ return ['comune']; }
    constructor(){
      super(); this.attachShadow({mode:'open'}); this.data=[]; this.types=[];
      this.sortKey='score'; this.sortDir=-1; this.requestId=0; this.ready=false;
      this.shadowRoot.innerHTML = `
      <style>
      :host{display:block;color:#202333;font:14px/1.45 "Trebuchet MS",system-ui,sans-serif;--surface:#fffdf8;--paper:#fff8ec;--ink:#252638;--text:#202333;--muted:#696777;--line:#ded8ce;--tablehead:#f8f1e7;--row:#fff9ef;--hover:#fff4d7;--track:#f0e9dd;--status:#fffdf8}
      :host([theme="dark"]){color:#edf0f7;--surface:#202431;--paper:#171b25;--ink:#d9deeb;--text:#edf0f7;--muted:#aeb5c6;--line:#41485a;--tablehead:#2a3040;--row:#242a38;--hover:#333a4b;--track:#343b4c;--status:#252b39}
      *{box-sizing:border-box}.wrap{background:var(--paper);background-image:radial-gradient(#80869a12 .7px,transparent .8px);background-size:16px 16px;padding:16px;border-radius:14px;color:var(--text)}
      header{position:relative;overflow:hidden;background:#252638;color:#fff;padding:24px;border:2px solid #202333;border-radius:12px;margin-bottom:14px}
      header:before{content:"";position:absolute;right:7%;top:-90px;width:230px;height:230px;border-radius:50%;background:radial-gradient(#f4c94f 1px,transparent 1.5px);background-size:12px 12px;opacity:.4}
      header:after{content:"✳";position:absolute;right:11%;top:16px;font-size:45px;color:#f4c94f}
      .eyebrow{display:inline-block;background:#f4c94f;color:#202333;padding:4px 9px;border:1.5px solid #202333;border-radius:4px;box-shadow:2px 2px 0 #f16f61;text-transform:uppercase;letter-spacing:.08em;font-size:10px;font-weight:900}
      h1{font-size:clamp(24px,3vw,36px);line-height:1.12;letter-spacing:-.04em;margin:13px 0 7px;font-weight:900}.sub{margin:0;color:#e3e4ed}
      .citybar,.filters{display:grid;gap:11px;align-items:stretch;margin-bottom:12px}.citybar{grid-template-columns:minmax(170px,270px) auto 1fr}.filters{grid-template-columns:minmax(180px,2fr) minmax(150px,1.2fr) minmax(130px,1fr) auto}
      .field,.card{background:var(--surface);color:var(--text);border:1.5px solid var(--ink);border-radius:10px;box-shadow:3px 3px 0 var(--ink);min-width:0}.field{padding:8px 11px}
      label{display:block;color:var(--muted);font-size:10px;font-weight:900;letter-spacing:.08em}input,select{font:inherit;color:var(--text);max-width:100%}input{width:100%;border:0;outline:0;background:transparent;padding:4px 0}select{width:100%;border:0;background:transparent;padding:4px 0}
      input:focus-visible,select:focus-visible,button:focus-visible,th:focus-visible{outline:3px solid #f4c94f;outline-offset:2px}.cityfield input{font-weight:800;text-transform:uppercase}.cityfield{position:relative}.cityfield:after{content:'⌄';position:absolute;right:12px;bottom:9px;color:var(--muted);pointer-events:none}
      button{font:inherit;font-weight:900;border:1.5px solid #202333;background:#f16f61;color:#202333;border-radius:7px;padding:9px 14px;box-shadow:2px 2px 0 #202333;cursor:pointer}button:hover{transform:translate(1px,1px);box-shadow:1px 1px 0 #202333}
      .hint,.desc,.note,.foot{font-size:12px;color:var(--muted)}.hint{align-self:center}.status{font-size:12px;font-weight:700;padding:9px 12px;margin:0 0 14px;border:1.5px solid var(--line);border-radius:8px;background:var(--status);color:var(--muted)}.loading{background:#fff4d7!important;border-color:#d7a928!important;color:#71570b!important}.success{background:#e7f7f1!important;border-color:#6bb6a3!important;color:#145e50!important}.error{background:#fff0ec!important;border-color:#e69a8d!important;color:#913d32!important}
      .kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}.card{padding:14px}.kpis .card:nth-child(1){border-top:4px solid #3457eb}.kpis .card:nth-child(2){border-top:4px solid #f16f61}.kpis .card:nth-child(3){border-top:4px solid #008c82}.kpis .card:nth-child(4){border-top:4px solid #f4c94f}
      .kpi-label{font-size:12px;color:var(--muted);font-weight:800}.kpi-value{font-size:clamp(23px,2.6vw,34px);font-weight:900;letter-spacing:-.05em}.layout{display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-bottom:14px}h2{font-size:16px;letter-spacing:-.02em;margin:0 0 7px}h2:before{content:"";display:inline-block;width:7px;height:7px;background:#f16f61;border:1px solid #202333;border-radius:2px;margin-right:8px}
      .barrow{display:grid;grid-template-columns:minmax(90px,1.2fr) minmax(45px,1fr) auto;gap:8px;align-items:center;margin:10px 0}.barlabel{font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.track{height:11px;border:1px solid #202333;border-radius:4px;background:#f0e9dd;overflow:hidden}.fill{height:100%}.barvalue{font-size:11px;font-weight:900}.typebar{display:flex;height:17px;border:1.5px solid #202333;border-radius:5px;overflow:hidden;margin:15px 0}.legend{display:grid;gap:10px}.legenditem{display:grid;grid-template-columns:11px 1fr;gap:8px;font-size:12px}.legenditem strong{display:block}.dot{width:11px;height:11px;border:1px solid #202333;border-radius:3px;margin-top:3px}
      .tablecard{padding:0;overflow:hidden}.tablehead{padding:16px;display:flex;justify-content:space-between;gap:10px}.tablewrap{overflow:auto;border-top:1.5px solid var(--ink)}table{width:100%;min-width:650px;border-collapse:collapse;text-align:left;font-size:12px}th,td{padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}th{background:var(--tablehead);color:var(--muted);font-weight:900;cursor:pointer;white-space:nowrap}th:hover,tbody tr:hover{background:var(--hover)}tbody tr:nth-child(even){background:var(--row)}td.name{font-weight:800;min-width:200px}td small{display:block;font-size:10px;font-weight:400;color:var(--muted);margin-top:3px}.pill{display:inline-block;background:#c8f1e8;color:#075f58;border:1px solid #202333;border-radius:4px;padding:2px 7px}.inactive{background:#ffe0d9;color:#923b30}.score{text-align:right;font-weight:900;white-space:nowrap}.zero{color:#aaa4a0}.foot{display:flex;justify-content:space-between;gap:10px;padding:12px 2px 0}
      @media(max-width:850px){.filters{grid-template-columns:1fr 1fr}.kpis{grid-template-columns:1fr 1fr}.layout{grid-template-columns:1fr}.citybar{grid-template-columns:minmax(150px,1fr) auto}.hint{grid-column:1/-1}}
      @media(max-width:520px){.wrap{padding:9px}.citybar,.filters{grid-template-columns:1fr}.hint{grid-column:auto}header{padding:19px 15px}header:after{font-size:32px;right:6%;top:18px}header:before{right:-150px}.kpis{gap:8px}.card{padding:11px}.kpi-value{font-size:25px}.tablehead,.foot{flex-direction:column}.citybar button{width:100%}}
      :host([theme="dark"]) .field,:host([theme="dark"]) .card{border-color:#687086;box-shadow:3px 3px 0 #10131b}
      :host([theme="dark"]) .status{border-color:#41485a}
      :host([theme="dark"]) .loading{background:#42391f!important;border-color:#806b2b!important;color:#ffe39a!important}
      :host([theme="dark"]) .success{background:#183c36!important;border-color:#327d70!important;color:#a7f0df!important}
      :host([theme="dark"]) .error{background:#482a2a!important;border-color:#a9564e!important;color:#ffc0b6!important}
      :host([theme="dark"]) .pill{background:#194b45;color:#b9f8eb;border-color:#687086}
      :host([theme="dark"]) .inactive{background:#4a2b2d;color:#ffc2ba}
      :host([theme="dark"]) .zero{color:#7f8798}
      :host([theme="dark"]) .track{border-color:#687086}
      </style>
      <div class="wrap">
        <header><div class="eyebrow">Esplora i dati · <span id="cityLabel">FIRENZE</span></div><h1>Buoni ricevuti dalle scuole</h1><p class="sub">Un quadro aggiornato delle strutture beneficiarie, comune per comune.</p></header>
        <section class="citybar"><div class="field cityfield"><label for="city">COMUNE ITALIANO</label><input id="city" list="cityOptions" placeholder="Cerca un comune…" autocomplete="off" aria-label="Cerca e seleziona un comune italiano"><datalist id="cityOptions"></datalist></div><button id="loadCity">Carica comune ↗</button><div class="hint">Parametro URL: <code>?comune=FIRENZE</code></div></section>
        <div id="apiStatus" class="status" role="status" aria-live="polite">In attesa del caricamento…</div>
        <section class="filters"><div class="field"><label for="q">CERCA STRUTTURA O INDIRIZZO</label><input id="q" placeholder="Es. Matteotti, via Morgagni…"></div><div class="field"><label for="type">TIPOLOGIA</label><select id="type"><option value="">Tutte le tipologie</option></select></div><div class="field"><label for="state">STATO</label><select id="state"><option value="">Tutti gli stati</option><option value="active">Attive</option><option value="inactive">Non attive</option></select></div><button id="reset">Azzera filtri</button></section>
        <section class="kpis"><div class="card"><div class="kpi-label">Strutture visualizzate</div><div class="kpi-value" id="kCount">—</div><div class="note" id="kCountNote">sul totale del dataset</div></div><div class="card"><div class="kpi-label">Buoni ricevuti</div><div class="kpi-value" id="kTotal">—</div><div class="note">somma dei punteggi filtrati</div></div><div class="card"><div class="kpi-label">Media per struttura</div><div class="kpi-value" id="kAvg">—</div><div class="note">punteggio medio</div></div><div class="card"><div class="kpi-label">Strutture a zero</div><div class="kpi-value" id="kZero">—</div><div class="note" id="kZeroNote">nessun buono ricevuto</div></div></section>
        <section class="layout"><div class="card"><h2>Top 10 per buoni ricevuti</h2><div class="desc">Le strutture con il punteggio più alto nella selezione corrente.</div><div id="topChart"></div></div><div class="card"><h2>Distribuzione per tipologia</h2><div class="desc">Numero di strutture e quota sul totale filtrato.</div><div id="typeChart"></div></div></section>
        <section class="card tablecard"><div class="tablehead"><div><h2>Elenco strutture</h2><div class="desc">Seleziona un'intestazione per ordinare i risultati.</div></div><div id="tableCount" class="note"></div></div><div class="tablewrap"><table><thead><tr><th tabindex="0" data-sort="name">Struttura ↕</th><th tabindex="0" data-sort="school_type">Tipologia ↕</th><th tabindex="0" data-sort="zipcode">CAP ↕</th><th tabindex="0" data-sort="active">Stato ↕</th><th tabindex="0" data-sort="score">Buoni ricevuti ↕</th></tr></thead><tbody id="tbody"><tr><td colspan="5">Caricamento…</td></tr></tbody></table></div></section>
        <div class="foot"><span>Fonte: API Coop per la Scuola.</span><span id="footCount"></span></div>
      </div>`;
      this.$ = s => this.shadowRoot.querySelector(s);
    }
    connectedCallback(){
      if(!this.ready){
        this.ready=true;
        this.$('#loadCity').addEventListener('click',()=>this.loadCity(this.$('#city').value));
        this.$('#city').addEventListener('keydown',e=>{if(e.key==='Enter')this.loadCity(this.$('#city').value)});
        this.$('#q').addEventListener('input',()=>this.render());
        this.$('#type').addEventListener('change',()=>this.render());
        this.$('#state').addEventListener('change',()=>this.render());
        this.$('#reset').addEventListener('click',()=>{this.$('#q').value='';this.$('#type').value='';this.$('#state').value='';this.sortKey='score';this.sortDir=-1;this.render()});
        this.shadowRoot.addEventListener('click',e=>{const th=e.target.closest('th[data-sort]');if(!th)return;const key=th.dataset.sort;if(this.sortKey===key)this.sortDir*=-1;else{this.sortKey=key;this.sortDir=key==='score'?-1:1}this.render()});
        this.shadowRoot.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('th[data-sort]')){e.preventDefault();e.target.click()}});
      }
      this.loadMunicipalities();
      this.loadCity(this.getAttribute('comune')||this.cityFromUrl()||'FIRENZE');
    }
    attributeChangedCallback(name,oldValue,newValue){if(name==='comune'&&oldValue!==newValue&&this.isConnected&&this.ready)this.loadCity(newValue||'FIRENZE')}
    async loadMunicipalities(){
      const fallback=['FIRENZE','PRATO','PISTOIA','LIVORNO','PISA','LUCCA','AREZZO','SIENA','GROSSETO','MASSA','CARRARA','EMPOLI','SCANDICCI','SESTO FIORENTINO','CAMPI BISENZIO','BAGNO A RIPOLI','ROMA','MILANO','NAPOLI','TORINO','BOLOGNA','PALERMO','GENOVA','VENEZIA','VERONA','BARI','CATANIA','PADOVA','TRIESTE','BRESCIA','PARMA','MODENA','REGGIO EMILIA','PERUGIA','RAVENNA','RIMINI','BERGAMO','TRENTO','BOLZANO','CAGLIARI','SALERNO','FERRARA','SASSARI','MONZA','LATINA','NOVARA','COMO','TARANTO','LECCE','PESCARA','ANCONA','UDINE','CESENA','FORLÌ','TREVISO','PIACENZA','FROSINONE','VITERBO','TERNI','LA SPEZIA','SAVONA','PESARO','FAENZA','VIAREGGIO','PONTEDERA','CASCINA','COLLE DI VAL D’ELSA','FIGLINE E INCISA VALDARNO'];
      const list=this.$('#cityOptions');
      const fill=names=>{const unique=[...new Set(names.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'it'));list.innerHTML=unique.map(n=>'<option value="'+this.esc(n.toLocaleUpperCase('it'))+'"></option>').join('')};
      fill(fallback);
      try{
        const response=await fetch('https://cdn.jsdelivr.net/gh/RP92/comuni-italiani/data/comuni.json');
        if(!response.ok)throw Error('Elenco comuni non disponibile');
        const payload=await response.json();
        const names=Array.isArray(payload)?payload.map(item=>item.nome):[];
        if(names.length>1000)fill(names);
      }catch(_){/* L'autocomplete resta disponibile con i comuni più cercati; è possibile digitare qualsiasi nome. */}
    }
    cityFromUrl(){const p=new URLSearchParams(window.location.search);return p.get('comune')||p.get('city')||''}
    norm(s){return String(s||'').trim().replace(/\s+/g,' ').toLocaleUpperCase('it')}
    fmt(n){return Number(n).toLocaleString('it-IT',{maximumFractionDigits:1})}
    esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
    clean(n){return String(n||'').replace(/^.*? - /,'')}
    status(msg,kind=''){this.$('#apiStatus').textContent=msg;this.$('#apiStatus').className='status '+kind}
    unwrap(p){if(Array.isArray(p))return p;for(const k of ['data','beneficiaries','results','items'])if(Array.isArray(p?.[k]))return p[k];throw Error('Formato della risposta API non riconosciuto.')}
    async loadCity(raw){
      const city=this.norm(raw);if(!city){this.status('Inserisci il nome di un comune italiano.','error');return}
      const id=++this.requestId;this.$('#city').value=city;this.$('#cityLabel').textContent=city;this.status('Caricamento dati per '+city+'…','loading');this.$('#tbody').innerHTML='<tr><td colspan="5">Caricamento…</td></tr>';
      try{
        const r=await fetch(API+'?city='+encodeURIComponent(city),{method:'GET',headers:HEADERS,redirect:'follow'});
        if(!r.ok)throw Error('L’API ha risposto con HTTP '+r.status+'.');
        const rows=this.unwrap(await r.json());if(id!==this.requestId)return;
        this.data=rows.map(d=>({...d,city:d.city||city,score:Number(d.score)||0,active:d.active===true||d.active===1||String(d.active).toLowerCase()==='true'}));
        this.types=[...new Set(this.data.map(d=>d.school_type).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'it'));
        this.$('#type').innerHTML='<option value="">Tutte le tipologie</option>'+this.types.map(t=>'<option>'+this.esc(t)+'</option>').join('');
        this.$('#q').value='';this.$('#type').value='';this.$('#state').value='';this.sortKey='score';this.sortDir=-1;this.render();
        this.status(this.data.length?'Dati caricati · '+city+' · '+this.fmt(this.data.length)+' strutture':'Nessuna struttura trovata per '+city+'.','success');
        this.dispatchEvent(new CustomEvent('coop-data-loaded',{detail:{comune:city,count:this.data.length},bubbles:true,composed:true}));
      }catch(e){if(id!==this.requestId)return;this.data=[];this.types=[];this.$('#type').innerHTML='<option value="">Tutte le tipologie</option>';this.render();this.status('Impossibile caricare i dati per '+city+'. '+(e.message||'Verifica connessione e CORS.'),'error');this.dispatchEvent(new CustomEvent('coop-data-error',{detail:{comune:city,message:e.message||String(e)},bubbles:true,composed:true}))}
    }
    filtered(){const q=this.$('#q').value.trim().toLocaleLowerCase('it'),t=this.$('#type').value,s=this.$('#state').value;return this.data.filter(d=>(!q||[d.name,d.address1,d.zipcode,d.external_id].some(v=>String(v||'').toLocaleLowerCase('it').includes(q)))&&(!t||d.school_type===t)&&(!s||(s==='active'?d.active:!d.active)))}
    render(){
      const rows=this.filtered(),total=rows.reduce((a,d)=>a+(Number(d.score)||0),0),zeros=rows.filter(d=>(Number(d.score)||0)===0).length;
      this.$('#kCount').textContent=this.fmt(rows.length);this.$('#kCountNote').textContent='su '+this.fmt(this.data.length)+' strutture nel dataset';this.$('#kTotal').textContent=this.fmt(total);this.$('#kAvg').textContent=this.fmt(rows.length?total/rows.length:0);this.$('#kZero').textContent=this.fmt(zeros);this.$('#kZeroNote').textContent=(rows.length?Math.round(zeros/rows.length*100):0)+'% della selezione';this.$('#tableCount').textContent=this.fmt(rows.length)+' risultati';this.$('#footCount').textContent='Selezione corrente · '+this.fmt(rows.length)+' record';
      const top=[...rows].sort((a,b)=>(Number(b.score)||0)-(Number(a.score)||0)).slice(0,10),max=Math.max(1,...top.map(d=>Number(d.score)||0));
      this.$('#topChart').innerHTML=top.length?top.map((d,i)=>`<div class="barrow"><div class="barlabel" title="${this.esc(d.name)}">${this.esc(this.clean(d.name))}</div><div class="track"><div class="fill" style="width:${(Number(d.score)||0)/max*100}%;background:${COLORS[i%COLORS.length]}"></div></div><div class="barvalue">${this.fmt(d.score)}</div></div>`).join(''):'<p class="desc">Nessun risultato con questi filtri.</p>';
      const counts=this.types.map((t,i)=>({t,i,n:rows.filter(d=>d.school_type===t).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n);
      this.$('#typeChart').innerHTML=rows.length?'<div class="typebar">'+counts.map(x=>`<div title="${this.esc(x.t)}: ${x.n}" style="width:${x.n/rows.length*100}%;background:${COLORS[x.i%COLORS.length]}"></div>`).join('')+'</div><div class="legend">'+counts.map(x=>`<div class="legenditem"><span class="dot" style="background:${COLORS[x.i%COLORS.length]}"></span><div><strong>${this.esc(x.t)}</strong>${this.fmt(x.n)} strutture · ${Math.round(x.n/rows.length*100)}%</div></div>`).join('')+'</div>':'<p class="desc">Nessun risultato con questi filtri.</p>';
      const sorted=[...rows].sort((a,b)=>{let x=a[this.sortKey],y=b[this.sortKey];if(this.sortKey==='score')return((Number(x)||0)-(Number(y)||0))*this.sortDir;if(this.sortKey==='active')return((x?1:0)-(y?1:0))*this.sortDir;return String(x||'').localeCompare(String(y||''),'it',{numeric:true,sensitivity:'base'})*this.sortDir});
      this.$('#tbody').innerHTML=sorted.map(d=>`<tr><td class="name">${this.esc(this.clean(d.name))}<small>${this.esc(d.address1||'')}${d.external_id?' · '+this.esc(d.external_id):''}</small></td><td>${this.esc(d.school_type||'—')}</td><td>${this.esc(d.zipcode||'—')}</td><td><span class="pill ${d.active?'':'inactive'}">${d.active?'Attiva':'Non attiva'}</span></td><td class="score ${Number(d.score)===0?'zero':''}">${this.fmt(Number(d.score)||0)}</td></tr>`).join('');
    }
  }
  if(!customElements.get('coop-buoni-dashboard'))customElements.define('coop-buoni-dashboard',CoopBuoniDashboard);
})();