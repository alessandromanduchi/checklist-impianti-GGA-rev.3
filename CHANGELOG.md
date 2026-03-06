# Changelog

Tutte le modifiche importanti a questo progetto verranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).

## [1.0.0] - 2024-02-14

### Aggiunto
- ✨ Sistema di verifica per 282 nicchie con apprestamenti tecnologici
- 🔥 Verifica Idranti VVF (138 installazioni)
  - Stato dell'apprestamento
  - Verifica manomissione sigillo
  - Presenza segnaletica di riferimento
  - Acquisizione foto per anomalie
- 📞 Verifica Colonnine TEM (114 installazioni)
  - Stato dell'apprestamento
  - Verifica manomissione sigillo
  - Presenza segnaletica di riferimento
  - Acquisizione foto per anomalie
- ⚡ Verifica Quadri di Soccorso VVF (76 installazioni)
  - Stato dell'apprestamento
  - Verifica manomissione sigillo
  - Presenza segnaletica di riferimento
  - Acquisizione foto per anomalie
- ⚠️ Floating Action Button per segnalazioni rapide
- 🚶 Segnalazione malfunzionamenti camminamento
  - Selezione progressiva chilometrica (740 nicchie totali)
  - Acquisizione foto obbligatoria
  - Note aggiuntive
- 🛡️ Segnalazione malfunzionamenti corrimano
  - Selezione progressiva chilometrica
  - Acquisizione foto obbligatoria
  - Note aggiuntive
- 💡 Segnalazione malfunzionamenti illuminazione
  - Tipo guasto: Fungo Blu o Corpi Illuminanti
  - Numero corpi illuminanti non funzionanti
  - Selezione progressiva chilometrica
  - Acquisizione foto obbligatoria
  - Note aggiuntive
- 📄 Generazione report PDF completo
  - Riepilogo verifiche
  - Dettaglio per ogni nicchia
  - Segnalazioni malfunzionamenti
  - Timestamp di tutte le operazioni
- 💾 Salvataggio automatico in localStorage
  - Persistenza dati verifiche
  - Persistenza foto (base64)
  - Persistenza segnalazioni
  - Recupero automatico al riavvio
- 📊 Barra di progresso verifiche
  - Percentuale completamento
  - Contatore nicchie verificate
  - Aggiornamento real-time
- 🎨 Interfaccia dark mode
  - Ottimizzata per ambienti poco illuminati
  - Palette colori professionale
  - Animazioni fluide
- 📱 Progressive Web App (PWA)
  - Installabile su smartphone
  - Funzionamento offline
  - Service Worker per caching
  - Manifest completo
- 🔄 Gestione stato applicazione
  - Marcatura automatica completamento
  - Validazione dati
  - Gestione errori
- 🗑️ Funzione reset dati
  - Cancellazione completa
  - Conferma richiesta
  - Toast di notifica

### Sicurezza
- 🔒 Tutti i dati salvati localmente
- 🔒 Nessuna trasmissione dati a server esterni
- 🔒 Privacy garantita per foto e segnalazioni

### Documentazione
- 📖 README.md completo
- 📖 CONTRIBUTING.md per contributori
- 📖 LICENSE MIT
- 📖 Commenti nel codice
- 📖 JSDoc per funzioni principali

### Infrastruttura
- 🏗️ Struttura modulare del codice
- 🏗️ Separazione HTML/CSS/JS
- 🏗️ Service Worker per offline
- 🏗️ Manifest PWA
- 🏗️ Icone multiple dimensioni
- 🏗️ .gitignore configurato

---

## [1.3.2] - 2026-03-06

### Corretto
- **[ALTO] Finestra "Verifica Altri Impianti" non si chiude dopo "Salva Osservazione"**: `closeGenericPhotoModal()` era chiamata all'interno del callback asincrono `reader.onload`. Qualsiasi eccezione sollevata prima di raggiungere quella riga (ad es. `QuotaExceededError` da `localStorage.setItem`) impediva la chiusura della finestra. Fix: `closeGenericPhotoModal()` viene ora chiamata in modo sincrono subito dopo la cattura di tutti i dati del form, prima dell'avvio del `FileReader`. Il riferimento `photoFile` è già catturato in una variabile locale, quindi il successivo `form.reset()` non interferisce con la lettura asincrona del file.

## [1.3.1] - 2026-02-20

### Corretto
- **[ALTO] Chiusura automatica modal "Verifica Altri Impianti" alla seconda segnalazione**: `updateGenericObsForm()` non rimuoveva l'attributo `required` da `generic-obs-funghi-count` e `generic-obs-corpi-count` quando nascondeva tutti i campi (ad es. dopo il reset del form). Su mobile Safari/iOS i campi nascosti con `required` bloccano la validazione nativa del form, impedendo l'evento `submit` e quindi la chiusura automatica della modal alla seconda e successive segnalazioni. Fix: aggiunta la rimozione di `required` da questi campi nella sezione "nascondi tutti i campi" di `updateGenericObsForm()`.

## [1.3.0] - 2025-02-20

### Corretto
- **[CRITICO] Foto segnalazioni non salvate nel PDF**: `closeMalfunctionModal()` chiamava `form.reset()` prima che `FileReader` completasse la lettura del file, azzerando `photoInput.files[0]` e rendendo la foto non disponibile. Fix: il file viene catturato in una variabile locale prima di qualsiasi reset; la modal si chiude e il form viene resettato solo all'interno del callback `reader.onload`, garantendo la lettura completa.
- **[CRITICO] Formato immagine hardcoded a JPEG nel PDF**: `pdf.addImage()` usava sempre `'JPEG'` come formato, causando errori o immagini corrotte per foto PNG, WebP, GIF. Fix: il formato viene rilevato automaticamente dal prefisso del data-URL sia per le foto di malfunzionamento che per le foto generiche.
- **[ALTO] Chiusura automatica modal malfunzionamento**: la modal ora si chiude automaticamente dopo il salvataggio della foto, garantendo che la chiusura avvenga solo a operazione completata.
- **[BASSO] Aggiunto gestore `reader.onerror`**: in caso di errore nella lettura del file, viene mostrato un toast di errore invece di fallire silenziosamente.

### Modificato
- **Configurazione iniziale semplificata**: rimossi i riferimenti geografici "Vernio" e "San Benedetto Val di Sambro" dalla select di configurazione. Le opzioni mostrano solo l'ordine di verifica (Crescente / Decrescente) con la relativa progressiva chilometrica.
- **Label campo configurazione**: rinominato "Punto di Partenza" in "Ordine di Verifica".

## [1.2.0] - 2025-02-19

### Corretto
- **[CRITICO] Sezione "Apprestamenti Non Funzionanti" assente nel PDF**: `TECH_NICHES_DATA.find(n => n.id === item.id)` falliva perché le nicchie nel dataset non hanno il campo `id`. Fix: ricerca per `km` e `binario`.
- **[ALTO] Service Worker percorso errato**: il path di registrazione puntava a `rev.2` invece di `rev.3`, impedendo il funzionamento offline.
- **[ALTO] Errore JS in `clearAllData()`**: chiamata a `populateStartNicheSelect()` non definita causava crash al click su "Cancella Dati".
- **[MEDIO] Event listener duplicato su `illuminazione-fault-type`**: cercava l'elemento `corpi-count-group` non presente nell'HTML. Rimosso il listener ridondante.
- **[BASSO] Emoji nei testi PDF**: jsPDF non supporta emoji Unicode nei font standard, causando quadratini vuoti. Sostituite con etichette ASCII.

## [Unreleased]

### In Sviluppo
- 🔄 Sincronizzazione cloud opzionale
- 📧 Invio report via email
- 📊 Dashboard statistiche
- 🗺️ Mappa interattiva galleria
- 🔍 Ricerca e filtri avanzati
- 📅 Pianificazione verifiche
- 👥 Gestione team multipli
- 🌐 Multilingua (EN, IT, FR, DE)

### Considerazioni Future
- Backend API per sincronizzazione
- Autenticazione utenti
- Database centralizzato
- Notifiche push
- Export Excel/CSV
- Integrazione QR code per nicchie
- Modalità scansione barcode

---

## Formato

### Tipi di modifiche
- `Aggiunto` - per nuove funzionalità
- `Modificato` - per modifiche a funzionalità esistenti
- `Deprecato` - per funzionalità che verranno rimosse
- `Rimosso` - per funzionalità rimosse
- `Corretto` - per bug fix
- `Sicurezza` - in caso di vulnerabilità

[1.0.0]: https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.3/releases/tag/v1.0.0
[Unreleased]: https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.3/compare/v1.0.0...HEAD
