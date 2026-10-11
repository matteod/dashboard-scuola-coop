# Coop per la Scuola — starter statico per Vercel

Landing page statica in HTML + JavaScript, senza framework e senza dipendenze npm.

## File

- `index.html` — pagina host, layout responsive e stile esterno.
- `coop-buoni-dashboard.js` — Web Component che carica e visualizza i beneficiari.

## Pubblicazione su Vercel

### Opzione A — da Git (consigliata)
1. Crea un repository Git e inserisci entrambi i file nella root.
2. In Vercel scegli **Add New → Project** e importa il repository.
3. Se Vercel chiede le impostazioni:
   - Framework Preset: **Other**
   - Build Command: lascia vuoto
   - Output Directory: `.`
   - Install Command: lascia vuoto
4. Premi **Deploy**.

### Opzione B — Vercel CLI
Dalla cartella che contiene `index.html` e `coop-buoni-dashboard.js`:
```bash
vercel
```
Segui le richieste della CLI. Per pubblicare in produzione:
```bash
vercel --prod
```

## Scegliere il comune

- Default: Firenze
- URL: `https://tuo-dominio.vercel.app/?comune=PRATO`
- Alias alternativo supportato: `?city=PRATO`

## API

Il componente usa la chiamata GET già configurata:
`https://api.coopperlascuola.it/v1/fundraising/get-beneficiaries?city=...`

e invia l'header `x-custom-header` con alias `www.coopperlascuola.it`, source `web`, lang `it`.

## Nota

La chiamata API non è stata verificata live da questo pacchetto. Se funziona già dal browser nel dominio di destinazione, non dovrebbe essere necessario cambiare l'integrazione. Se Vercel viene pubblicato su un dominio nuovo e la richiesta fallisce, controlla l'errore nella console del browser e le regole CORS dell'API.

## Funzioni UI aggiunte

- **Dark mode** con pulsante nella testata; la preferenza viene salvata nel browser.
- **Autocomplete comune** nel campo comune: carica l'elenco completo dei comuni italiani da jsDelivr (dataset RP92/comuni-italiani); in caso di indisponibilità propone una lista di comuni frequenti e permette comunque di digitare liberamente qualsiasi comune.
- La chiamata ai beneficiari continua a usare l'API Coop già configurata. L'elenco comuni è solo per i suggerimenti del campo.
