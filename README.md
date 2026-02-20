# Monitoraggio Gallerie - Verifica Apprestamenti Tecnologici GGA

Sistema avanzato di verifica e monitoraggio degli apprestamenti tecnologici nelle nicchie della Grande Galleria dell'Appennino (GGA).

[![GitHub Pages](https://img.shields.io/badge/demo-online-success)](https://alessandromanduchi.github.io/checklist-impianti-GGA-rev.3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.4.0-blue)](CHANGELOG.md)

## 🚀 Demo Online

**[Apri l'applicazione](https://alessandromanduchi.github.io/checklist-impianti-GGA-rev.3/)**

## 📋 Descrizione

Monitoraggio Gallerie è un'applicazione Progressive Web App (PWA) avanzata per la verifica sistematica degli apprestamenti tecnologici installati nelle nicchie della galleria. Permette di:

- ✅ Verificare **282 nicchie** dotate di apprestamenti tecnologici
- 🔥 Controllare **138 Idranti VVF**
- 📞 Verificare **114 Colonnine TEM**
- ⚡ Ispezionare **76 Quadri di Soccorso VVF**
- 🎯 Configurare verifica con ordine crescente o decrescente di progressiva chilometrica
- 🔍 Filtrare apprestamenti per tipo (TEM, Idranti VVF, Quadri VVF)
- 📍 Navigare rapidamente a nicchie specifiche
- ⚠️ Registrare osservazioni su altri impianti con 4 categorie
- 🏗️ Riferimenti QE specifici per impianti illuminazione (152 QE)
- 📸 Acquisire foto per anomalie
- 📄 Generare report PDF completi con operatore
- 💾 Funzionare offline con salvataggio locale
- 🎨 Sistema di verifica a 3 stati (verde/rosso/giallo)

## ✨ Caratteristiche Principali

### Configurazione Iniziale
All'avvio della verifica, l'applicazione richiede:
- **Ordine di verifica**: Seleziona l'ordine di percorrenza delle nicchie
  - **Ordine Crescente** (37+259 → 55+742)
  - **Ordine Decrescente** (55+742 → 37+259)

### Navigazione Intelligente
- **📍 Navigation Floating Button**: Salta rapidamente a qualsiasi nicchia
  - Dropdown con tutte le 282 nicchie in ordine configurato
  - Riordina automaticamente la lista dalla nicchia selezionata
  - Mantiene il filtro attivo durante la navigazione

### Filtri Apprestamenti
- **🔍 Filter Floating Button** (in alto a destra):
  - 📋 **Tutti**: Visualizza tutte le nicchie
  - ⚡ **TEM**: Solo nicchie con Colonnine TEM
  - 🚿 **Idranti VVF**: Solo nicchie con Idranti VVF
  - ⚙️ **Quadri VVF**: Solo nicchie con Quadri di Soccorso VVF
- Filtri persistono durante la paginazione

### Sistema di Verifica a 3 Stati
Per ogni apprestamento tecnologico, il sistema indica lo stato con colori:

**🟢 Verde - Verifica Completa e Funzionante**:
- Tutte le verifiche completate
- Tutte le foto richieste allegate
- Tutti gli elementi funzionanti, integri e presenti

**🔴 Rosso - Verifica Completa con Criticità**:
- Tutte le verifiche completate
- Tutte le foto richieste allegate
- **Tutti** i controlli nello stato peggiore:
  - TEM: Stato "Non Funzionante" E Segnaletica "Assente"
  - Altri: Stato "Non Funzionante" E Sigillo "Manomesso" E Segnaletica "Assente"

**🟡 Giallo - Verifica Parziale**:
- Almeno una verifica completata
- Non tutte le verifiche completate o foto mancanti
- Indica lavoro in corso

### Verifica Apprestamenti
Per ogni tipo di apprestamento vengono verificati:

**Per TEM (Colonnine Emergenza)**:
- **Stato di funzionamento** (Funzionante/Non Funzionante)
- **Presenza segnaletica** (Presente/Assente)
- **Documentazione fotografica** per anomalie

**Per Idranti VVF e Quadri Soccorso VVF**:
- **Stato di funzionamento** (Funzionante/Non Funzionante)
- **Integrità sigillo** (Integro/Manomesso)
- **Presenza segnaletica** (Presente/Assente)
- **Documentazione fotografica** per anomalie

### Verifica Altri Impianti
Floating Action Button (**⚠️ rosso in basso a destra**) per registrare osservazioni su:

**1. Camminamento e corrimano**
- Stato (Agibile / Non Agibile)
- Nicchia di riferimento (fra le 720 totali)
- Foto obbligatoria
- Descrizione opzionale

**2. Impianto di Illuminazione**
- Tipo guasto: **Fungo Blu** / **Corpi Illuminanti**
- Numero elementi non funzionanti (1–10 o >10)
- **QE di riferimento** (opzionale) – 152 riferimenti specifici, *a cura di IG*
  - Se QE selezionato: **Ramo** (Destro/Sinistro); campo progressiva nascosto
  - Se QE non selezionato: **Nicchia di riferimento** (fra le 720 totali)
- Foto obbligatoria
- Descrizione opzionale

**3. Segnaletica**
- Nicchia di riferimento (fra le 720 totali)
- Foto obbligatoria
- Descrizione opzionale

**4. Altro**
- Nicchia di riferimento (fra le 720 totali)
- Foto obbligatoria
- Descrizione opzionale

### Informazioni Operatore
Prima della generazione del PDF, il sistema raccoglie:
- **Nome** (obbligatorio)
- **Cognome** (obbligatorio)
- **Settore** (obbligatorio):
  - LV (Linea Veicoli)
  - TE (Trazione Elettrica)
  - IS (Impianti Segnalamento)
  - IG (Impianti Generali) - *pre-compilato se QE usato*
  - TLC (Telecomunicazioni)
  - Altro
- **Feedback operatore** (opzionale):
  - Problemi riscontrati durante l'utilizzo
  - Suggerimenti di miglioramento

### Report e Documentazione
- 📊 Progresso verifiche in tempo reale (contatore nicchie verificate)
- 📄 Generazione automatica report PDF completo:
  - Informazioni operatore (nome, cognome, settore)
  - Data e ora report
  - Nicchie verificate con stato colore
  - Riepilogo problematiche
  - **Apprestamenti non funzionanti** (sezione dedicata)
  - Dettaglio completo di ogni verifica
  - **Verifica altri impianti** con tutte le informazioni:
    - Tipo, categoria, QE di riferimento, Ramo, Progressiva
    - **Foto integrate nel PDF**
    - Note e timestamp
  - Feedback operatore
- 📸 Tutte le foto integrate nel report
- ⏱️ Timestamp di tutte le operazioni

### Progressive Web App
- 📱 Installabile su smartphone e tablet (iOS e Android)
- 🌐 Funziona completamente offline
- 💾 Salvataggio automatico dati in localStorage
- 🔄 Pulizia automatica dati ad ogni ricarica pagina

## 🎯 Dati Tecnici

### Nicchie con Apprestamenti: 282
- **Idranti VVF**: 138 installazioni
- **Colonnine TEM**: 114 installazioni
- **Quadri Soccorso VVF**: 76 installazioni
- Alcune nicchie hanno apprestamenti multipli

### Nicchie Totali: 720
Database completo per selezione progressiva chilometrica nelle segnalazioni

### QE Illuminazione: 152
Riferimenti specifici per Quadri Elettrici con:
- Numero QE (1-152)
- Progressiva chilometrica esatta
- Binario (D o P)

## 🚀 Installazione

### Come PWA su Mobile

#### Android (Chrome)
1. Apri https://alessandromanduchi.github.io/checklist-impianti-GGA-rev.3/
2. Menu (⋮) → "Installa app" o "Aggiungi a schermata Home"
3. L'app apparirà nella home screen

#### iOS (Safari)
1. Apri https://alessandromanduchi.github.io/checklist-impianti-GGA-rev.3/ in Safari
2. Tocca il pulsante Condividi (icona quadrato con freccia)
3. Scorri e seleziona "Aggiungi a Home"
4. L'icona apparirà nella home screen

### Uso Locale per Sviluppo

```bash
# Clona il repository
git clone https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.3.git
cd checklist-impianti-GGA-rev.3

# Avvia server locale
python -m http.server 8000
# Oppure con Python 2:
# python -m SimpleHTTPServer 8000

# Apri browser
http://localhost:8000
```

## 📱 Utilizzo

### 1. Configurazione Iniziale

Al primo avvio o dopo ricarica pagina:
1. Scegli **Punto di Partenza**:
   - **Vernio (37+259)** → verifica in ordine crescente verso San Benedetto
   - **San Benedetto (55+742)** → verifica in ordine decrescente verso Vernio
2. La lista delle nicchie viene ordinata automaticamente

### 2. Filtri e Navigazione

**Filtra per tipo di apprestamento**:
1. Clicca il pulsante **🔍 Filter** in alto a destra
2. Seleziona: Tutti / TEM / Idranti VVF / Quadri VVF
3. La lista si aggiorna automaticamente

**Naviga a nicchia specifica**:
1. Clicca il pulsante **📍 Navigation** sul lato destro
2. Seleziona la nicchia dall'elenco completo
3. La verifica riprende da quella nicchia

### 3. Verifica Apprestamenti

1. Visualizza 10 nicchie alla volta (paginazione automatica)
2. Per ogni nicchia, compila le verifiche richieste:
   - Seleziona stato (Funzionante/Non Funzionante)
   - Verifica sigillo se richiesto (Integro/Manomesso)
   - Verifica segnaletica (Presente/Assente)
3. Allega foto per ogni anomalia riscontrata (campo obbligatorio)
4. La nicchia cambia colore in base allo stato:
   - 🟡 Giallo: verifica parziale
   - 🟢 Verde: completata e funzionante
   - 🔴 Rosso: completata con criticità

### 4. Verifica Altri Impianti

1. Clicca sul pulsante **⚠️** rosso in basso a destra
2. Seleziona la **Categoria**:
   - Camminamento e corrimano
   - Impianto di illuminazione
   - Segnaletica
   - Altro
3. Compila i campi specifici della categoria
4. Allega **foto obbligatoria**
5. Aggiungi descrizione se necessario (opzionale)
6. Clicca **"Salva Osservazione"** (la finestra si chiude automaticamente)

### 5. Genera Report

1. Completa le verifiche necessarie
2. Clicca **"PDF"** (pulsante verde in basso a sinistra)
3. Compila **Informazioni Operatore**:
   - Nome
   - Cognome
   - Settore (pre-compilato "IG" se hai usato QE di riferimento)
   - Ricorda: inviare report a **a.manduchi@rfi.it**
4. Fornisci **Feedback** (opzionale):
   - Problemi riscontrati
   - Suggerimenti di miglioramento
5. Il PDF viene generato con:
   - Tutte le verifiche effettuate
   - Apprestamenti non funzionanti
   - Verifica altri impianti con foto
   - Informazioni operatore e feedback

## 🔧 Tecnologie

- **Frontend**: HTML5, CSS3, JavaScript ES6+ (Vanilla)
- **PDF Generation**: jsPDF 2.5.1
- **Storage**: LocalStorage API
- **PWA**: Service Worker, Web App Manifest
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **Fonts**: Google Fonts (Syne, DM Sans)
- **Icons**: PWA icons (72x72 to 512x512)
- **Image Processing**: FileReader API (Base64)

## 📂 Struttura Progetto

```
checklist-impianti-GGA-rev.3/
├── index.html              # Applicazione principale
├── styles.css              # Stili e layout responsive
├── app.js                  # Logica applicazione (3000+ linee)
├── niches-data.js         # Dati 282 nicchie + 720 totali + 152 QE
├── manifest.json          # PWA manifest
├── service-worker.js      # Service worker per offline
├── icons/                 # Icone PWA (8 dimensioni)
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── screenshots/           # Screenshot per PWA
├── .github/              # GitHub configuration
├── README.md             # Questo file
├── CHANGELOG.md          # Log delle modifiche
├── CONTRIBUTING.md       # Guida contributi
├── QUICK_START.md        # Guida rapida
└── LICENSE               # Licenza MIT
```

## 💾 Gestione Dati

### Salvataggio Automatico
Tutti i dati sono salvati **localmente** nel browser tramite localStorage:
- ✅ Verifiche nicchie (stato, foto)
- 📸 Foto (formato base64)
- ⚠️ Osservazioni altri impianti (con foto)
- ⚙️ Configurazione verifica
- ⏱️ Timestamp operazioni

### Ciclo di Vita dei Dati
- 🔄 Dati cancellati automaticamente **ad ogni ricarica pagina** (fresh start)
- ⚠️ **Genera sempre il PDF prima di chiudere o ricaricare la pagina!**

### Gestione Manuale
- 🗑️ Pulsante "Cancella Dati" per reset completo
- ✅ Richiesta conferma prima della cancellazione
- 🔄 Notifica toast di conferma

## 🔐 Privacy e Sicurezza

- ✅ **100% locale**: Tutti i dati salvati SOLO nel browser
- ✅ **Zero trasmissioni**: Nessun invio a server esterni
- ✅ **No tracking**: Nessun analytics o monitoraggio
- ✅ **Open source**: Codice completamente ispezionabile
- ✅ **Offline-first**: Funziona senza connessione internet
- ✅ **Foto sicure**: Salvate in Base64 nel dispositivo

## 🎨 Interfaccia

- **Dark Mode**: Ottimizzata per ambienti poco illuminati
- **Responsive**: Funziona su desktop, tablet e smartphone
- **Floating Buttons**: 4 pulsanti per azioni rapide:
  - 🔍 Filter (top-right, viola)
  - 📍 Navigation (right, blu)
  - 📄 PDF (bottom-left, verde)
  - ⚠️ Verifica Altri Impianti (bottom-right, rosso)
- **Feedback visivo**: Toast notifications e animazioni
- **Accessibilità**: Contrasti elevati e testi leggibili

## 🤝 Contributi

I contributi sono benvenuti! Per contribuire:

1. Leggi [CONTRIBUTING.md](CONTRIBUTING.md) per le linee guida
2. Fork del repository
3. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
4. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
5. Push al branch (`git push origin feature/AmazingFeature`)
6. Apri una Pull Request

## 📝 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi [LICENSE](LICENSE) per i dettagli completi.

## 📧 Contatti e Supporto

- **Repository**: https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.3
- **Issues**: https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.3/issues
- **Autore**: Alessandro Manduchi
- **Email Report**: a.manduchi@rfi.it

## 🙏 Riconoscimenti

Sviluppato per la sicurezza e manutenzione della **Grande Galleria dell'Appennino (GGA)**.

Ringraziamenti speciali a:
- Team di manutenzione RFI
- Personale tecnico della galleria
- Operatori sul campo per feedback e suggerimenti

## 📊 Statistiche Progetto

- **Linee di codice**: ~3500+
- **Nicchie supportate**: 282 con apprestamenti, 720 totali
- **Riferimenti QE**: 152 quadri elettrici specifici
- **Categorie osservazioni**: 4 (Camminamento, Illuminazione, Segnaletica, Altro)
- **Formati export**: PDF con foto integrate
- **Browser supportati**: Chrome, Firefox, Safari, Edge (ultimi 2 anni)
- **Lingue**: Italiano
- **Licenza**: MIT (Open Source)

## 🔄 Aggiornamenti

Per vedere tutte le modifiche e le versioni:
- [CHANGELOG.md](CHANGELOG.md) - Log completo delle modifiche
- [Releases](https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.3/releases) - Versioni rilasciate

---

**Versione**: 1.4.0 | **Data**: Febbraio 2026 | **Licenza**: MIT

*Fatto con ❤️ per la sicurezza ferroviaria*

## 🚀 Demo Online

**[Apri l'applicazione](https://alessandromanduchi.github.io/checklist-impianti-GGA-rev.3/)**

## 📋 Descrizione

Monitoraggio Gallerie è un'applicazione Progressive Web App (PWA) avanzata per la verifica sistematica degli apprestamenti tecnologici installati nelle nicchie della galleria. Permette di:

- ✅ Verificare **282 nicchie** dotate di apprestamenti tecnologici
- 🔥 Controllare **138 Idranti VVF**
- 📞 Verificare **114 Colonnine TEM**
- ⚡ Ispezionare **76 Quadri di Soccorso VVF**
- 🎯 Configurare verifica con ordine crescente o decrescente di progressiva chilometrica
- 🔍 Filtrare apprestamenti per tipo (TEM, Idranti VVF, Quadri VVF)
- 📍 Navigare rapidamente a nicchie specifiche
- ⚠️ Segnalare malfunzionamenti con 4 tipologie
- 🏗️ Riferimenti QE specifici per impianti illuminazione (152 QE)
- 📸 Acquisire foto per anomalie
- 📄 Generare report PDF completi con operatore
- 💾 Funzionare offline con salvataggio locale
- 🎨 Sistema di verifica a 3 stati (verde/rosso/giallo)

## ✨ Caratteristiche Principali

### Configurazione Iniziale
All'avvio della verifica, l'applicazione richiede:
- **Ordine di verifica**: Seleziona l'ordine di percorrenza delle nicchie
  - **Ordine Crescente** (37+259 → 55+742)
  - **Ordine Decrescente** (55+742 → 37+259)

### Navigazione Intelligente
- **📍 Navigation Floating Button**: Salta rapidamente a qualsiasi nicchia
  - Dropdown con tutte le 282 nicchie in ordine configurato
  - Riordina automaticamente la lista dalla nicchia selezionata
  - Mantiene il filtro attivo durante la navigazione

### Filtri Apprestamenti
- **🔍 Filter Floating Button** (in alto a destra):
  - 📋 **Tutti**: Visualizza tutte le nicchie
  - ⚡ **TEM**: Solo nicchie con Colonnine TEM
  - 🚿 **Idranti VVF**: Solo nicchie con Idranti VVF
  - ⚙️ **Quadri VVF**: Solo nicchie con Quadri di Soccorso VVF
- Filtri persistono durante la paginazione

### Sistema di Verifica a 3 Stati
Per ogni apprestamento tecnologico, il sistema indica lo stato con colori:

**🟢 Verde - Verifica Completa e Funzionante**:
- Tutte le verifiche completate
- Tutte le foto richieste allegate
- Tutti gli elementi funzionanti, integri e presenti

**🔴 Rosso - Verifica Completa con Criticità**:
- Tutte le verifiche completate
- Tutte le foto richieste allegate
- **Tutti** i controlli nello stato peggiore:
  - TEM: Stato "Non Funzionante" E Segnaletica "Assente"
  - Altri: Stato "Non Funzionante" E Sigillo "Manomesso" E Segnaletica "Assente"

**🟡 Giallo - Verifica Parziale**:
- Almeno una verifica completata
- Non tutte le verifiche completate o foto mancanti
- Indica lavoro in corso

### Verifica Apprestamenti
Per ogni tipo di apprestamento vengono verificati:

**Per TEM (Colonnine Emergenza)**:
- **Stato di funzionamento** (Funzionante/Non Funzionante)
- **Presenza segnaletica** (Presente/Assente)
- **Documentazione fotografica** per anomalie

**Per Idranti VVF e Quadri Soccorso VVF**:
- **Stato di funzionamento** (Funzionante/Non Funzionante)
- **Integrità sigillo** (Integro/Manomesso)
- **Presenza segnaletica** (Presente/Assente)
- **Documentazione fotografica** per anomalie

### Segnalazione Malfunzionamenti
Floating Action Button (⚠️ rosso in basso a destra) per segnalare:

**1. Camminamento** - con foto e progressiva km

**2. Corrimano** - con foto e progressiva km

**3. Impianto Illuminazione**:
   - Tipo guasto: Fungo Blu / Corpi Illuminanti
   - Numero corpi non funzionanti (se applicabile)
   - **QE di riferimento** (opzionale) - 152 riferimenti specifici:
     - Format: "QE n.X (km - Binario Y)"
     - Esempio: "QE n.42 (42+063 - Binario P)"
     - Campo riservato a personale IG
   - **Ramo di riferimento** (quando QE selezionato):
     - Destro o Sinistro
     - Nasconde automaticamente campo "Progressiva chilometrica"
   - Foto obbligatoria
   - Note opzionali

**4. Segnaletica Generale** - con foto e progressiva km

### Informazioni Operatore
Prima della generazione del PDF, il sistema raccoglie:
- **Nome** (obbligatorio)
- **Cognome** (obbligatorio)
- **Settore** (obbligatorio):
  - LV (Linea Veicoli)
  - TE (Trazione Elettrica)
  - IS (Impianti Segnalamento)
  - IG (Impianti Generali) - *pre-compilato se QE usato*
  - TLC (Telecomunicazioni)
  - Altro
- **Feedback operatore** (opzionale):
  - Problemi riscontrati durante l'utilizzo
  - Suggerimenti di miglioramento

### Report e Documentazione
- 📊 Progresso verifiche in tempo reale (contatore nicchie verificate)
- 📄 Generazione automatica report PDF completo:
  - Informazioni operatore (nome, cognome, settore)
  - Data e ora report
  - Nicchie verificate con stato colore
  - Riepilogo problematiche
  - **Apprestamenti non funzionanti** (sezione dedicata)
  - Dettaglio completo di ogni verifica
  - **Segnalazioni malfunzionamenti** con tutte le informazioni:
    - Tipo, QE di riferimento, Ramo, Progressiva
    - **Foto integrate nel PDF**
    - Note e timestamp
  - Feedback operatore
- 📸 Tutte le foto integrate nel report
- ⏱️ Timestamp di tutte le operazioni

### Progressive Web App
- 📱 Installabile su smartphone e tablet (iOS e Android)
- 🌐 Funziona completamente offline
- 💾 Salvataggio automatico dati in localStorage
- 🔄 Cancellazione automatica dati dopo generazione PDF
- 🔄 Pulizia automatica dati ad ogni ricarica pagina

## 🎯 Dati Tecnici

### Nicchie con Apprestamenti: 282
- **Idranti VVF**: 138 installazioni
- **Colonnine TEM**: 114 installazioni
- **Quadri Soccorso VVF**: 76 installazioni
- Alcune nicchie hanno apprestamenti multipli

### Nicchie Totali: 740
Database completo per selezione progressiva chilometrica nelle segnalazioni

### QE Illuminazione: 152
Riferimenti specifici per Quadri Elettrici con:
- Numero QE (1-152)
- Progressiva chilometrica esatta
- Binario (D o P)

## 🚀 Installazione

### Come PWA su Mobile

#### Android (Chrome)
1. Apri https://alessandromanduchi.github.io/checklist-impianti-GGA-rev.3/
2. Menu (⋮) → "Installa app" o "Aggiungi a schermata Home"
3. L'app apparirà nella home screen

#### iOS (Safari)
1. Apri https://alessandromanduchi.github.io/checklist-impianti-GGA-rev.3/ in Safari
2. Tocca il pulsante Condividi (icona quadrato con freccia)
3. Scorri e seleziona "Aggiungi a Home"
4. L'icona apparirà nella home screen

### Uso Locale per Sviluppo

```bash
# Clona il repository
git clone https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.3.git
cd checklist-impianti-GGA-rev.3

# Avvia server locale
python -m http.server 8000
# Oppure con Python 2:
# python -m SimpleHTTPServer 8000

# Apri browser
http://localhost:8000
```

## 📱 Utilizzo

### 1. Configurazione Iniziale

Al primo avvio o dopo cancellazione dati:
1. Scegli **Punto di Partenza**:
   - **Vernio (37+259)** → verifica in ordine crescente verso San Benedetto
   - **San Benedetto (55+742)** → verifica in ordine decrescente verso Vernio
2. La lista delle nicchie viene ordinata automaticamente

### 2. Filtri e Navigazione

**Filtra per tipo di apprestamento**:
1. Clicca il pulsante **🔍 Filter** in alto a destra
2. Seleziona: Tutti / TEM / Idranti VVF / Quadri VVF
3. La lista si aggiorna automaticamente

**Naviga a nicchia specifica**:
1. Clicca il pulsante **📍 Navigation** sul lato destro
2. Seleziona la nicchia dall'elenco completo
3. La verifica riprende da quella nicchia

### 3. Verifica Apprestamenti

1. Visualizza 10 nicchie alla volta (paginazione automatica)
2. Per ogni nicchia, compila le verifiche richieste:
   - Seleziona stato (Funzionante/Non Funzionante)
   - Verifica sigillo se richiesto (Integro/Manomesso)
   - Verifica segnaletica (Presente/Assente)
3. Allega foto per ogni anomalia riscontrata (campo obbligatorio)
4. La nicchia cambia colore in base allo stato:
   - 🟡 Giallo: verifica parziale
   - 🟢 Verde: completata e funzionante
   - 🔴 Rosso: completata con criticità

### 4. Segnala Malfunzionamenti

1. Clicca sul pulsante **⚠️** rosso (in basso a destra)
2. Seleziona **Tipo di Malfunzionamento**:
   - Camminamento
   - Corrimano
   - Impianto Illuminazione
   - Segnaletica Generale
3. Per **Impianto Illuminazione**:
   - Seleziona tipo guasto (Fungo Blu / Corpi Illuminanti)
   - *Opzionale*: Seleziona **QE di riferimento** specifico (1-152)
   - Se QE selezionato: scegli **Ramo** (Destro/Sinistro)
   - Se QE non selezionato: specifica **Progressiva chilometrica**
4. Allega **foto obbligatoria**
5. Aggiungi note se necessario
6. Clicca **"Salva Segnalazione"** (la finestra si chiude automaticamente)

### 5. Genera Report

1. Completa le verifiche necessarie
2. Clicca **"📄 Genera Report PDF"** (pulsante verde in basso a sinistra)
3. Compila **Informazioni Operatore**:
   - Nome
   - Cognome
   - Settore (pre-compilato "IG" se hai usato QE di riferimento)
   - Ricorda: inviare report a **a.manduchi@rfi.it**
4. Fornisci **Feedback** (opzionale):
   - Problemi riscontrati
   - Suggerimenti di miglioramento
5. Il PDF viene generato con:
   - Tutte le verifiche effettuate
   - Apprestamenti non funzionanti
   - Segnalazioni malfunzionamenti con foto
   - Informazioni operatore e feedback
6. **Importante**: I dati vengono cancellati automaticamente dopo la generazione

## 🔧 Tecnologie

- **Frontend**: HTML5, CSS3, JavaScript ES6+ (Vanilla)
- **PDF Generation**: jsPDF 2.5.1
- **Storage**: LocalStorage API
- **PWA**: Service Worker, Web App Manifest
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **Fonts**: Google Fonts (Syne, DM Sans)
- **Icons**: PWA icons (72x72 to 512x512)
- **Image Processing**: FileReader API (Base64)

## 📂 Struttura Progetto

```
checklist-impianti-GGA-rev.3/
├── index.html              # Applicazione principale
├── styles.css              # Stili e layout responsive
├── app.js                  # Logica applicazione (3000+ linee)
├── niches-data.js         # Dati 282 nicchie + 740 totali + 152 QE
├── manifest.json          # PWA manifest
├── service-worker.js      # Service worker per offline
├── icons/                 # Icone PWA (8 dimensioni)
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── screenshots/           # Screenshot per PWA
├── .github/              # GitHub configuration
├── README.md             # Questo file
├── CHANGELOG.md          # Log delle modifiche
├── CONTRIBUTING.md       # Guida contributi
├── QUICK_START.md        # Guida rapida
└── LICENSE               # Licenza MIT
```

## 💾 Gestione Dati

### Salvataggio Automatico
Tutti i dati sono salvati **localmente** nel browser tramite localStorage:
- ✅ Verifiche nicchie (stato, foto)
- 📸 Foto (formato base64)
- ⚠️ Segnalazioni malfunzionamenti (con foto)
- ⚙️ Configurazione verifica
- ⏱️ Timestamp operazioni

### Cancellazione Automatica
- 🔄 Dati cancellati automaticamente dopo generazione PDF
- 🔄 Dati cancellati automaticamente ad ogni ricarica pagina
- ⚠️ **Genera sempre il PDF prima di chiudere!**

### Gestione Manuale
- 🗑️ Pulsante "Cancella Dati" per reset completo
- ✅ Richiesta conferma prima della cancellazione
- 🔄 Notifica toast di conferma

## 🔐 Privacy e Sicurezza

- ✅ **100% locale**: Tutti i dati salvati SOLO nel browser
- ✅ **Zero trasmissioni**: Nessun invio a server esterni
- ✅ **No tracking**: Nessun analytics o monitoraggio
- ✅ **Open source**: Codice completamente ispezionabile
- ✅ **Offline-first**: Funziona senza connessione internet
- ✅ **Foto sicure**: Salvate in Base64 nel dispositivo

## 🎨 Interfaccia

- **Dark Mode**: Ottimizzata per ambienti poco illuminati
- **Responsive**: Funziona su desktop, tablet e smartphone
- **Floating Buttons**: 4 pulsanti per azioni rapide:
  - 🔍 Filter (top-right, viola)
  - 📍 Navigation (right, blu)
  - 📄 PDF (bottom-left, verde)
  - ⚠️ Malfunction (bottom-right, rosso)
- **Feedback visivo**: Toast notifications e animazioni
- **Accessibilità**: Contrasti elevati e testi leggibili

## 🤝 Contributi

I contributi sono benvenuti! Per contribuire:

1. Leggi [CONTRIBUTING.md](CONTRIBUTING.md) per le linee guida
2. Fork del repository
3. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
4. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
5. Push al branch (`git push origin feature/AmazingFeature`)
6. Apri una Pull Request

## 📝 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi [LICENSE](LICENSE) per i dettagli completi.

## 📧 Contatti e Supporto

- **Repository**: https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.3
- **Issues**: https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.3/issues
- **Autore**: Alessandro Manduchi
- **Email Report**: a.manduchi@rfi.it

## 🙏 Riconoscimenti

Sviluppato per la sicurezza e manutenzione della **Grande Galleria dell'Appennino (GGA)**.

Ringraziamenti speciali a:
- Team di manutenzione RFI
- Personale tecnico della galleria
- Operatori sul campo per feedback e suggerimenti

## 📊 Statistiche Progetto

- **Linee di codice**: ~3500+
- **Nicchie supportate**: 282 con apprestamenti, 740 totali
- **Riferimenti QE**: 152 quadri elettrici specifici
- **Tipi malfunzionamento**: 4 categorie complete
- **Formati export**: PDF con foto integrate
- **Browser supportati**: Chrome, Firefox, Safari, Edge (ultimi 2 anni)
- **Lingue**: Italiano
- **Licenza**: MIT (Open Source)

## 🔄 Aggiornamenti

Per vedere tutte le modifiche e le versioni:
- [CHANGELOG.md](CHANGELOG.md) - Log completo delle modifiche
- [Releases](https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.3/releases) - Versioni rilasciate

---

**Versione**: 1.0.0 | **Data**: Febbraio 2026 | **Licenza**: MIT

*Fatto con ❤️ per la sicurezza ferroviaria*
