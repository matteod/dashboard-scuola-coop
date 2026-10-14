(() => {
    const API = 'https://api.coopperlascuola.it/v1/fundraising/get-beneficiaries';
    const HEADERS = {'x-custom-header': JSON.stringify({alias: 'www.coopperlascuola.it', source: 'web', lang: 'it'})};
    const COLORS = ['#3457eb', '#008c82', '#7652d6', '#e59b35', '#f16f61', '#65758b'];

    class CoopBuoniDashboard extends HTMLElement {
        static get observedAttributes() {
            return ['comune', 'theme'];
        }

        constructor() {
            super();
            this.attachShadow({mode: 'open'});
            this.data = [];
            this.types = [];
            this.sortKey = 'score';
            this.sortDir = -1;
            this.requestId = 0;
            this.ready = false;
            this.map = null;
            this.markerLayer = null;
            this.mapCity = '';
            this.cityCoordsCache = {};
            this.schoolCoords = new Map();
            this.mapTiles = null;
            this.lastGeocodeAt = 0;
            this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
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
      .kpi-label{font-size:12px;color:var(--muted);font-weight:800}.kpi-value{font-size:clamp(23px,2.6vw,34px);font-weight:900;letter-spacing:-.05em}.mapcard{padding:14px;margin-bottom:14px}.maphead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}.mapmeta{font-size:11px;color:var(--muted);margin-top:3px}.mapstage{height:360px;min-height:280px;border:1.5px solid var(--ink);border-radius:9px;overflow:hidden;background:var(--track);position:relative}.mapstage #map{height:100%;width:100%;z-index:1}.mapnotice{font-size:12px;color:var(--muted);padding:9px 11px;border:1px solid var(--line);border-radius:8px;margin-top:10px;background:var(--surface)}.mapbadge{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;padding:5px 8px;border:1px solid var(--line);border-radius:20px;background:var(--surface);color:var(--muted);white-space:nowrap}.mapbadge:before{content:'';width:7px;height:7px;border-radius:50%;background:#e5a93b}.mapbadge.ready:before{background:#008c82}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:var(--surface);color:var(--text)}.leaflet-popup-content{font:12px/1.45 "Trebuchet MS",system-ui,sans-serif}.popup-name{font-weight:900;font-size:13px;margin-bottom:4px}.popup-score{display:inline-block;margin-top:5px;padding:3px 6px;border-radius:4px;background:#f4c94f;color:#252638;font-weight:900}.layout{display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-bottom:14px}h2{font-size:16px;letter-spacing:-.02em;margin:0 0 7px}h2:before{content:"";display:inline-block;width:7px;height:7px;background:#f16f61;border:1px solid #202333;border-radius:2px;margin-right:8px}
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

      /* Ranking per tipologia */
      .top-types-card{margin-bottom:14px}
      .top-types-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:12px;margin-top:14px}
      .type-ranking{min-width:0;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--row)}
      .type-ranking h3{display:flex;align-items:center;gap:7px;margin:0 0 10px;font-size:13px}
      .ranking-item{display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:8px;align-items:start;padding:9px 0;border-top:1px solid var(--line)}
      .ranking-position{font-weight:900;color:var(--muted)}
      .ranking-name{min-width:0;font-size:12px;font-weight:800;overflow-wrap:anywhere}
      .ranking-name small{display:block;margin-top:3px;color:var(--muted);font-size:10px;font-weight:400}
      .ranking-score{white-space:nowrap;font-size:12px;font-weight:900}
      /* Elenco collassabile, con scroll interno */
      .tablecard{padding:0;overflow:hidden}
      .tablecard details{min-width:0}
      .table-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px;cursor:pointer;list-style:none}
      .table-summary::-webkit-details-marker{display:none}
      .table-summary::after{content:'+';flex-shrink:0;font-size:22px;font-weight:900}
      .tablecard details[open] .table-summary::after{content:'−'}
      .table-summary h2{margin-bottom:5px}
      .tablewrap{max-height:360px;overflow:auto;border-top:1.5px solid var(--ink)}
      .tablewrap th{position:sticky;top:0;z-index:2}
      .table-summary:focus-visible{outline:3px solid #f4c94f;outline-offset:-3px}
      @media(max-width:520px){.top-types-grid{grid-template-columns:1fr}.table-summary{align-items:flex-start;padding:12px}}

      </style>
      <div class="wrap">
        <header><div class="eyebrow">Esplora i dati · <span id="cityLabel">FIRENZE</span></div><h1>Buoni ricevuti dalle scuole</h1><p class="sub">Un quadro aggiornato delle strutture beneficiarie, comune per comune.</p></header>
        <section class="citybar"><div class="field cityfield"><label for="city">COMUNE ITALIANO</label><input id="city" list="cityOptions" placeholder="Cerca un comune…" autocomplete="off" aria-label="Cerca e seleziona un comune italiano"><datalist id="cityOptions"></datalist></div><button id="loadCity">Carica comune ↗</button><div class="hint">Parametro URL: <code>?comune=FIRENZE</code></div></section>
        <div id="apiStatus" class="status" role="status" aria-live="polite">In attesa del caricamento…</div>
        <section class="filters"><div class="field"><label for="q">CERCA STRUTTURA O INDIRIZZO</label><input id="q" placeholder="Es. Matteotti, via Morgagni…"></div><div class="field"><label for="type">TIPOLOGIA</label><select id="type"><option value="">Tutte le tipologie</option></select></div><div class="field"><label for="state">STATO</label><select id="state"><option value="">Tutti gli stati</option><option value="active">Attive</option><option value="inactive">Non attive</option></select></div><button id="reset">Azzera filtri</button></section>
        <section class="kpis"><div class="card"><div class="kpi-label">Strutture visualizzate</div><div class="kpi-value" id="kCount">—</div><div class="note" id="kCountNote">sul totale del dataset</div></div><div class="card"><div class="kpi-label">Buoni ricevuti</div><div class="kpi-value" id="kTotal">—</div><div class="note">somma dei punteggi filtrati</div></div><div class="card"><div class="kpi-label">Media per struttura</div><div class="kpi-value" id="kAvg">—</div><div class="note">punteggio medio</div></div><div class="card"><div class="kpi-label">Strutture a zero</div><div class="kpi-value" id="kZero">—</div><div class="note" id="kZeroNote">nessun buono ricevuto</div></div></section>
        <section class="card mapcard"><div class="maphead"><div><h2>Mappa dei beneficiari</h2><div class="desc">Esplora il comune selezionato. I marker puntuali compaiono quando sono disponibili coordinate verificate.</div></div><span id="mapBadge" class="mapbadge">Coordinate da preparare</span></div><div class="mapstage"><div id="map" role="application" aria-label="Mappa dei beneficiari"></div></div><div id="mapNotice" class="mapnotice" role="status">La mappa mostrerà le scuole solo quando avremo coordinate geografiche attendibili.</div></section>
        <section class="layout"><div class="card"><h2>Top 10 per buoni ricevuti</h2><div class="desc">Le strutture con il punteggio più alto nella selezione corrente.</div><div id="topChart"></div></div><div class="card"><h2>Distribuzione per tipologia</h2><div class="desc">Numero di strutture e quota sul totale filtrato.</div><div id="typeChart"></div></div></section>
        <section class="card top-types-card">
  <h2>Le migliori 3 per tipologia</h2>
  <div class="desc">
    Le scuole con più buoni ricevuti per ciascuna tipologia,
    in base alla selezione corrente.
  </div>
  <div id="topByType" class="top-types-grid"></div>
</section>

<section class="card tablecard">
  <details>
    <summary class="table-summary">
      <div>
        <h2>Elenco completo delle strutture</h2>
        <div class="desc">
          Apri per consultare e ordinare tutti i risultati.
        </div>
      </div>
      <div id="tableCount" class="note"></div>
    </summary>

    <div class="tablewrap">
      <table>
        <thead>
          <tr>
            <th tabindex="0" data-sort="name">Struttura ↕</th>
            <th tabindex="0" data-sort="school_type">Tipologia ↕</th>
            <th tabindex="0" data-sort="zipcode">CAP ↕</th>
            <th tabindex="0" data-sort="active">Stato ↕</th>
            <th tabindex="0" data-sort="score">Buoni ricevuti ↕</th>
          </tr>
        </thead>
        <tbody id="tbody">
          <tr><td colspan="5">Caricamento…</td></tr>
        </tbody>
      </table>
    </div>
  </details>
</section>
        <div class="foot"><span>Fonte: API Coop per la Scuola.</span><span id="footCount"></span></div>
      </div>`;
            this.$ = s => this.shadowRoot.querySelector(s);
        }

        connectedCallback() {
            if (!this.ready) {
                this.ready = true;
                this.$('#loadCity').addEventListener('click', () => this.loadCity(this.$('#city').value));
                this.$('#city').addEventListener('keydown', e => {
                    if (e.key === 'Enter') this.loadCity(this.$('#city').value)
                });
                this.$('#q').addEventListener('input', () => this.render());
                this.$('#type').addEventListener('change', () => this.render());
                this.$('#state').addEventListener('change', () => this.render());
                this.$('#reset').addEventListener('click', () => {
                    this.$('#q').value = '';
                    this.$('#type').value = '';
                    this.$('#state').value = '';
                    this.sortKey = 'score';
                    this.sortDir = -1;
                    this.render()
                });
                this.shadowRoot.addEventListener('click', e => {
                    const th = e.target.closest('th[data-sort]');
                    if (!th) return;
                    const key = th.dataset.sort;
                    if (this.sortKey === key) this.sortDir *= -1; else {
                        this.sortKey = key;
                        this.sortDir = key === 'score' ? -1 : 1
                    }
                    this.render()
                });
                this.shadowRoot.addEventListener('keydown', e => {
                    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('th[data-sort]')) {
                        e.preventDefault();
                        e.target.click()
                    }
                });
                this.loadSchoolCoordinates();
                this.initMap();
            }
            this.loadMunicipalities();
            this.loadCity(this.getAttribute('comune') || this.cityFromUrl() || 'FIRENZE');
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue || !this.isConnected || !this.ready) return;
            if (name === 'comune') this.loadCity(newValue || 'FIRENZE');
            if (name === 'theme') this.setMapTiles()
        }

        async loadMunicipalities() {
            const fallback = ['FIRENZE', 'PRATO', 'PISTOIA', 'LIVORNO', 'PISA', 'LUCCA', 'AREZZO', 'SIENA', 'GROSSETO', 'MASSA', 'CARRARA', 'EMPOLI', 'SCANDICCI', 'SESTO FIORENTINO', 'CAMPI BISENZIO', 'BAGNO A RIPOLI', 'ROMA', 'MILANO', 'NAPOLI', 'TORINO', 'BOLOGNA', 'PALERMO', 'GENOVA', 'VENEZIA', 'VERONA', 'BARI', 'CATANIA', 'PADOVA', 'TRIESTE', 'BRESCIA', 'PARMA', 'MODENA', 'REGGIO EMILIA', 'PERUGIA', 'RAVENNA', 'RIMINI', 'BERGAMO', 'TRENTO', 'BOLZANO', 'CAGLIARI', 'SALERNO', 'FERRARA', 'SASSARI', 'MONZA', 'LATINA', 'NOVARA', 'COMO', 'TARANTO', 'LECCE', 'PESCARA', 'ANCONA', 'UDINE', 'CESENA', 'FORLÌ', 'TREVISO', 'PIACENZA', 'FROSINONE', 'VITERBO', 'TERNI', 'LA SPEZIA', 'SAVONA', 'PESARO', 'FAENZA', 'VIAREGGIO', 'PONTEDERA', 'CASCINA', 'COLLE DI VAL D’ELSA', 'FIGLINE E INCISA VALDARNO'];
            const list = this.$('#cityOptions');
            const fill = names => {
                const unique = [...new Set(names.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'it'));
                list.innerHTML = unique.map(n => '<option value="' + this.esc(n.toLocaleUpperCase('it')) + '"></option>').join('')
            };
            fill(fallback);
            try {
                const response = await fetch('https://cdn.jsdelivr.net/gh/RP92/comuni-italiani/data/comuni.json');
                if (!response.ok) throw Error('Elenco comuni non disponibile');
                const payload = await response.json();
                const names = Array.isArray(payload) ? payload.map(item => item.nome) : [];
                if (names.length > 1000) fill(names);
            } catch (_) {/* L'autocomplete resta disponibile con i comuni più cercati; è possibile digitare qualsiasi nome. */
            }
        }

        cityFromUrl() {
            const p = new URLSearchParams(window.location.search);
            return p.get('comune') || p.get('city') || ''
        }

        norm(s) {
            return String(s || '').trim().replace(/\s+/g, ' ').toLocaleUpperCase('it')
        }

        fmt(n) {
            return Number(n).toLocaleString('it-IT', {maximumFractionDigits: 1})
        }

        esc(v) {
            return String(v ?? '').replace(/[&<>"']/g, c => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[c]))
        }

        clean(n) {
            return String(n || '').replace(/^.*? - /, '')
        }

        status(msg, kind = '') {
            this.$('#apiStatus').textContent = msg;
            this.$('#apiStatus').className = 'status ' + kind
        }

        unwrap(p) {
            if (Array.isArray(p)) return p;
            for (const k of ['data', 'beneficiaries', 'results', 'items']) if (Array.isArray(p?.[k])) return p[k];
            throw Error('Formato della risposta API non riconosciuto.')
        }

        async loadCity(raw) {
            const city = this.norm(raw);
            if (!city) {
                this.status('Inserisci il nome di un comune italiano.', 'error');
                return
            }
            const id = ++this.requestId;
            this.$('#city').value = city;
            this.$('#cityLabel').textContent = city;
            this.status('Caricamento dati per ' + city + '…', 'loading');
            this.$('#tbody').innerHTML = '<tr><td colspan="5">Caricamento…</td></tr>';
            try {
                const r = await fetch(API + '?city=' + encodeURIComponent(city), {
                    method: 'GET',
                    headers: HEADERS,
                    redirect: 'follow'
                });
                if (!r.ok) throw Error('L’API ha risposto con HTTP ' + r.status + '.');
                const rows = this.unwrap(await r.json());
                if (id !== this.requestId) return;
                this.data = rows.map(d => ({
                    ...d,
                    city: d.city || city,
                    score: Number(d.score) || 0,
                    active: d.active === true || d.active === 1 || String(d.active).toLowerCase() === 'true'
                }));
                this.types = [...new Set(this.data.map(d => d.school_type).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'it'));
                this.$('#type').innerHTML = '<option value="">Tutte le tipologie</option>' + this.types.map(t => '<option>' + this.esc(t) + '</option>').join('');
                this.$('#q').value = '';
                this.$('#type').value = '';
                this.$('#state').value = '';
                this.sortKey = 'score';
                this.sortDir = -1;
                this.render();
                this.loadMapCity(city);
                this.status(this.data.length ? 'Dati caricati · ' + city + ' · ' + this.fmt(this.data.length) + ' strutture' : 'Nessuna struttura trovata per ' + city + '.', 'success');
                this.dispatchEvent(new CustomEvent('coop-data-loaded', {
                    detail: {comune: city, count: this.data.length},
                    bubbles: true,
                    composed: true
                }));
            } catch (e) {
                if (id !== this.requestId) return;
                this.data = [];
                this.types = [];
                this.$('#type').innerHTML = '<option value="">Tutte le tipologie</option>';
                this.render();
                this.status('Impossibile caricare i dati per ' + city + '. ' + (e.message || 'Verifica connessione e CORS.'), 'error');
                this.dispatchEvent(new CustomEvent('coop-data-error', {
                    detail: {
                        comune: city,
                        message: e.message || String(e)
                    }, bubbles: true, composed: true
                }))
            }
        }

        filtered() {
            const q = this.$('#q').value.trim().toLocaleLowerCase('it'), t = this.$('#type').value,
                s = this.$('#state').value;
            return this.data.filter(d => (!q || [d.name, d.address1, d.zipcode, d.external_id].some(v => String(v || '').toLocaleLowerCase('it').includes(q))) && (!t || d.school_type === t) && (!s || (s === 'active' ? d.active : !d.active)))
        }

        async loadSchoolCoordinates() {
            try {
                const r = await fetch('/school-coordinates.json', {cache: 'no-cache'});
                if (!r.ok) return;
                const rows = await r.json();
                if (!Array.isArray(rows)) return;
                this.schoolCoords = new Map(rows.filter(d => d && d.external_id && Number.isFinite(Number(d.latitude)) && Number.isFinite(Number(d.longitude))).map(d => [String(d.external_id), {
                    lat: Number(d.latitude),
                    lng: Number(d.longitude),
                    status: d.status || 'verified'
                }]));
                this.renderMapMarkers()
            } catch (_) {/* Il file coordinate è opzionale nella prima fase. */
            }
        }

        initMap() {
            if (!this.$('#map') || !window.L) {
                this.$('#mapNotice').textContent = 'La libreria cartografica non è disponibile. Controlla la connessione e il caricamento di Leaflet.';
                return
            }
            if (this.map) return;
            this.map = window.L.map(this.$('#map'), {scrollWheelZoom: false}).setView([43.7696, 11.2558], 11);
            this.markerLayer = window.L.featureGroup().addTo(this.map);
            this.setMapTiles();
            this.map.whenReady(() => setTimeout(() => this.map.invalidateSize(), 80));
        }


        setMapTiles() {
            if (!this.map || !window.L) return;

            if (this.mapTiles) {
                this.map.removeLayer(this.mapTiles);
            }

            // OpenStreetMap non richiede una API key.
            this.mapTiles = window.L.tileLayer(
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    maxZoom: 19,
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
                }
            ).addTo(this.map);
        }


        async loadMapCity(city) {
            if (!this.map) {
                this.initMap();
                if (!this.map) return
            }
            const key = this.norm(city);
            this.mapCity = key;
            const badge = this.$('#mapBadge');
            badge.classList.remove('ready');
            badge.textContent = 'Localizzo il comune…';
            try {
                let coords = this.cityCoordsCache[key];
                if (!coords) {
                    try {
                        const saved = localStorage.getItem('coop-city-coords-v1');
                        const parsed = saved ? JSON.parse(saved) : {};
                        if (parsed[key] && Date.now() - parsed[key].savedAt < 1000 * 60 * 60 * 24 * 30) coords = parsed[key].coords;
                    } catch (_) {
                    }
                }
                if (!coords) {
                    const wait = Math.max(0, 1100 - (Date.now() - this.lastGeocodeAt));
                    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
                    this.lastGeocodeAt = Date.now();
                    const u = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=it&q=' + encodeURIComponent(key + ', Italia');
                    const r = await fetch(u, {headers: {'Accept-Language': 'it'}});
                    if (!r.ok) throw Error('Servizio di geocodifica non disponibile');
                    const hits = await r.json();
                    if (!hits.length) throw Error('Comune non trovato');
                    coords = {lat: Number(hits[0].lat), lng: Number(hits[0].lon)};
                    try {
                        const saved = localStorage.getItem('coop-city-coords-v1');
                        const parsed = saved ? JSON.parse(saved) : {};
                        parsed[key] = {coords, savedAt: Date.now()};
                        localStorage.setItem('coop-city-coords-v1', JSON.stringify(parsed));
                    } catch (_) {
                    }
                }
                this.cityCoordsCache[key] = coords;
                if (this.mapCity !== key) return;
                this.map.setView([coords.lat, coords.lng], 12);
                badge.textContent = 'Comune localizzato';
                badge.classList.add('ready');
                this.renderMapMarkers();
            } catch (e) {
                badge.textContent = 'Posizione comune non disponibile';
                this.$('#mapNotice').textContent = 'Non riesco a centrare automaticamente ' + key + '. La mappa resta utilizzabile; le posizioni puntuali richiedono coordinate verificate.';
            }
        }

        renderMapMarkers() {
            if (!this.map || !this.markerLayer) return;
            this.markerLayer.clearLayers();
            const rows = this.filtered();
            let found = 0;
            for (const d of rows) {
                const c = this.schoolCoords.get(String(d.external_id));
                if (!c || c.status === 'unmatched') continue;
                const marker = window.L.circleMarker([c.lat, c.lng], {
                    radius: 7,
                    weight: 2,
                    color: '#252638',
                    fillColor: COLORS[this.types.indexOf(d.school_type) % COLORS.length] || '#008c82',
                    fillOpacity: .92
                });
                marker.bindPopup('<div class="popup-name">' + this.esc(this.clean(d.name)) + '</div><div>' + this.esc(d.address1 || '') + ' · ' + this.esc(d.city || '') + '</div><div class="popup-score">' + this.fmt(d.score) + ' buoni ricevuti</div>');
                marker.addTo(this.markerLayer);
                found++;
            }
            const notice = this.$('#mapNotice'), badge = this.$('#mapBadge');
            if (found) {
                notice.textContent = 'Visualizzate ' + this.fmt(found) + ' strutture con coordinate verificate su ' + this.fmt(rows.length) + ' risultati filtrati.';
                badge.textContent = found + ' marker';
                badge.classList.add('ready');
            } else {
                notice.textContent = 'Mappa centrata sul comune. Le scuole non hanno ancora coordinate verificate nel file school-coordinates.json: non mostriamo marker approssimativi.';
                if (!badge.classList.contains('ready')) badge.textContent = 'Coordinate da preparare';
            }
        }

        render() {
            const rows = this.filtered();
            this.renderSummary(rows);
            this.renderTopChart(rows);
            this.renderTypeDistribution(rows);
            this.renderTopByType(rows);
            this.renderTable(rows);
            this.renderMapMarkers();
        }

        renderSummary(rows) {
            const total = rows.reduce((sum, row) => sum + (Number(row.score) || 0), 0);
            const zeros = rows.filter(row => (Number(row.score) || 0) === 0).length;

            this.$('#kCount').textContent = this.fmt(rows.length);
            this.$('#kCountNote').textContent = 'su ' + this.fmt(this.data.length) + ' strutture nel dataset';
            this.$('#kTotal').textContent = this.fmt(total);
            this.$('#kAvg').textContent = this.fmt(rows.length ? total / rows.length : 0);
            this.$('#kZero').textContent = this.fmt(zeros);
            this.$('#kZeroNote').textContent = (rows.length ? Math.round(zeros / rows.length * 100) : 0) + '% della selezione';
            this.$('#tableCount').textContent = this.fmt(rows.length) + ' risultati';
            this.$('#footCount').textContent = 'Selezione corrente · ' + this.fmt(rows.length) + ' record';
        }

        renderTopChart(rows) {
            const top = [...rows]
                .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
                .slice(0, 10);
            const maxScore = Math.max(1, ...top.map(row => Number(row.score) || 0));

            this.$('#topChart').innerHTML = top.length
                ? top.map((row, index) => `
                    <div class="barrow">
                      <div class="barlabel" title="${this.esc(row.name)}">${this.esc(this.clean(row.name))}</div>
                      <div class="track"><div class="fill" style="width:${(Number(row.score) || 0) / maxScore * 100}%;background:${COLORS[index % COLORS.length]}"></div></div>
                      <div class="barvalue">${this.fmt(row.score)}</div>
                    </div>`).join('')
                : '<p class="desc">Nessun risultato con questi filtri.</p>';
        }

        renderTypeDistribution(rows) {
            const counts = this.types
                .map((type, index) => ({ type, index, count: rows.filter(row => row.school_type === type).length }))
                .filter(item => item.count > 0)
                .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type, 'it'));

            this.$('#typeChart').innerHTML = rows.length
                ? `<div class="typebar">${counts.map(item => `
                    <div title="${this.esc(item.type)}: ${item.count}"
                         style="width:${item.count / rows.length * 100}%;background:${COLORS[item.index % COLORS.length]}"></div>`).join('')}
                   </div>
                   <div class="legend">${counts.map(item => `
                    <div class="legenditem">
                      <span class="dot" style="background:${COLORS[item.index % COLORS.length]}"></span>
                      <div><strong>${this.esc(item.type)}</strong>${this.fmt(item.count)} strutture · ${Math.round(item.count / rows.length * 100)}%</div>
                    </div>`).join('')}
                   </div>`
                : '<p class="desc">Nessun risultato con questi filtri.</p>';
        }

        renderTopByType(rows) {
            const groups = this.types
                .map((type, typeIndex) => ({
                    type,
                    typeIndex,
                    schools: rows
                        .filter(row => row.school_type === type)
                        .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0)
                            || String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' }))
                        .slice(0, 3)
                }))
                .filter(group => group.schools.length > 0);

            this.$('#topByType').innerHTML = groups.length
                ? groups.map(group => `
                    <section class="type-ranking">
                      <h3><span class="dot" style="background:${COLORS[group.typeIndex % COLORS.length]}"></span>${this.esc(group.type)}</h3>
                      ${group.schools.map((school, index) => `
                        <div class="ranking-item">
                          <div class="ranking-position">${index + 1}.</div>
                          <div class="ranking-name">${this.esc(this.clean(school.name))}
                            <small>${this.esc(school.address1 || '')}</small>
                          </div>
                          <div class="ranking-score">${this.fmt(Number(school.score) || 0)}</div>
                        </div>`).join('')}
                    </section>`).join('')
                : '<p class="desc">Nessuna struttura disponibile con questi filtri.</p>';
        }

        sortRows(rows) {
            const key = this.sortKey;
            const direction = this.sortDir;

            return [...rows].sort((a, b) => {
                const left = a[key];
                const right = b[key];

                if (key === 'score') return (((Number(left) || 0) - (Number(right) || 0)) * direction) || String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' });
                if (key === 'active') return ((left ? 1 : 0) - (right ? 1 : 0)) * direction;

                return String(left || '').localeCompare(String(right || ''), 'it', {
                    numeric: true,
                    sensitivity: 'base'
                }) * direction;
            });
        }

        renderTable(rows) {
            const sorted = this.sortRows(rows);
            this.$('#tbody').innerHTML = sorted.map(row => `
                <tr>
                  <td class="name">${this.esc(this.clean(row.name))}<small>${this.esc(row.address1 || '')}${row.external_id ? ' · ' + this.esc(row.external_id) : ''}</small></td>
                  <td>${this.esc(row.school_type || '—')}</td>
                  <td>${this.esc(row.zipcode || '—')}</td>
                  <td><span class="pill ${row.active ? '' : 'inactive'}">${row.active ? 'Attiva' : 'Non attiva'}</span></td>
                  <td class="score ${Number(row.score) === 0 ? 'zero' : ''}">${this.fmt(Number(row.score) || 0)}</td>
                </tr>`).join('');
        }

    }

    if (!customElements.get('coop-buoni-dashboard')) customElements.define('coop-buoni-dashboard', CoopBuoniDashboard);
})();
