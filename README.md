# NicheSafe - Verifica Apprestamenti Tecnologici GGA

Sistema di verifica e monitoraggio degli apprestamenti tecnologici nelle nicchie della Galleria di Base del Brennero (GGA).

[![GitHub Pages](https://img.shields.io/badge/demo-online-success)](https://alessandromanduchi.github.io/checklist-impianti-GGA-rev.2/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](CHANGELOG.md)

## 🚀 Demo Online

**[Apri l'applicazione](https://alessandromanduchi.github.io/checklist-impianti-GGA-rev.2/)**

## 📋 Descrizione

NicheSafe è un'applicazione Progressive Web App (PWA) per la verifica sistematica degli apprestamenti tecnologici installati nelle nicchie della galleria. Permette di:

- ✅ Verificare **282 nicchie** dotate di apprestamenti tecnologici
- 🔥 Controllare **138 Idranti VVF**
- 📞 Verificare **114 Colonnine TEM**
- ⚡ Ispezionare **76 Quadri di Soccorso VVF**
- ⚠️ Segnalare malfunzionamenti (camminamento, corrimano, illuminazione)
- 📸 Acquisire foto per anomalie
- 📄 Generare report PDF completi
- 💾 Funzionare offline con salvataggio locale

## ✨ Caratteristiche Principali

### Verifica Apprestamenti
Per ogni apprestamento tecnologico vengono verificati:
- **Stato di funzionamento** (Funzionante/Non Funzionante)
- **Integrità sigillo** (Integro/Manomesso)
- **Presenza segnaletica** (Presente/Assente)
- **Documentazione fotografica** obbligatoria per anomalie

### Segnalazione Malfunzionamenti
Floating Action Button (⚠️) per segnalare rapidamente:
- **Camminamento** - con foto e progressiva km
- **Corrimano** - con foto e progressiva km
- **Impianto Illuminazione**:
  - Tipo guasto (Fungo Blu / Corpi Illuminanti)
  - Numero corpi non funzionanti
  - Foto e progressiva km obbligatorie

### Report e Documentazione
- 📊 Progresso verifiche in tempo reale
- 📄 Generazione automatica report PDF
- 📸 Foto integrate nel report
- ⏱️ Timestamp di tutte le operazioni

### Progressive Web App
- 📱 Installabile su smartphone e tablet
- 🌐 Funziona offline
- 💾 Salvataggio automatico dati
- 🔄 Sincronizzazione quando online

## 🎯 Dati Tecnici

### Nicchie con Apprestamenti: 282
- **Idranti VVF**: 138 installazioni
- **Colonnine TEM**: 114 installazioni
- **Quadri Soccorso VVF**: 76 installazioni
- Alcune nicchie hanno apprestamenti multipli

### Nicchie Totali: 740
Database completo per selezione progressiva chilometrica nelle segnalazioni

## 🚀 Installazione

### Come PWA su Mobile

#### Android (Chrome)
1. Apri https://alessandromanduchi.github.io/checklist-impianti-GGA-rev.2/
2. Menu (⋮) → "Installa app"
3. L'app apparirà nella home screen

#### iOS (Safari)
1. Apri l'URL in Safari
2. Tocca il pulsante Condividi
3. Seleziona "Aggiungi a Home"

### Uso Locale per Sviluppo

```bash
# Clona il repository
git clone https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.2.git
cd checklist-impianti-GGA-rev.2

# Avvia server locale
python -m http.server 8000

# Apri browser
http://localhost:8000
```

## 📱 Utilizzo

### 1. Verifica Apprestamenti

1. Scorri la lista delle 282 nicchie con apprestamenti
2. Per ogni nicchia, verifica:
   - Stato dell'apprestamento
   - Integrità del sigillo
   - Presenza della segnaletica
3. Allega foto se necessario (obbligatorie per anomalie)
4. La nicchia viene marcata automaticamente come completata

### 2. Segnala Malfunzionamenti

1. Clicca sul pulsante rosso ⚠️ (Floating Action Button)
2. Seleziona tipo di malfunzionamento
3. Specifica progressiva chilometrica (scelta tra 740 nicchie)
4. Allega foto obbligatoria
5. Aggiungi note opzionali
6. Salva la segnalazione

### 3. Genera Report

1. Completa le verifiche necessarie
2. Clicca "📄 Genera Report PDF"
3. Il PDF include:
   - Riepilogo verifiche effettuate
   - Dettaglio per ogni nicchia
   - Segnalazioni malfunzionamenti
   - Timestamp completi

## 🔧 Tecnologie

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **PDF**: jsPDF
- **Storage**: LocalStorage API
- **PWA**: Service Worker, Web App Manifest
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **Fonts**: Google Fonts (Syne, DM Sans)

## 📂 Struttura Progetto

```
checklist-impianti-GGA-rev.2/
├── index.html              # Applicazione principale
├── styles.css              # Stili e layout
├── app.js                  # Logica applicazione
├── niches-data.js         # Dati 282 nicchie + 740 totali
├── manifest.json          # PWA manifest
├── service-worker.js      # Service worker per offline
├── icons/                 # Icone PWA (8 dimensioni)
├── .github/workflows/     # GitHub Actions
└── docs/                  # Documentazione
```

## 💾 Gestione Dati

Tutti i dati sono salvati **localmente** nel browser:
- ✅ Verifiche nicchie
- 📸 Foto (formato base64)
- ⚠️ Segnalazioni malfunzionamenti
- ⏱️ Timestamp operazioni

**Importante**: Genera sempre un report PDF prima di cancellare i dati!

## 🔐 Privacy

- ✅ Tutti i dati salvati SOLO localmente
- ✅ Nessuna trasmissione a server esterni
- ✅ Nessun tracking o analytics
- ✅ Codice open source ispezionabile

## 🤝 Contributi

I contributi sono benvenuti! Leggi [CONTRIBUTING.md](CONTRIBUTING.md) per le linee guida.

## 📝 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi [LICENSE](LICENSE) per i dettagli.

## 📧 Contatti

- **Repository**: https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.2
- **Issues**: https://github.com/alessandromanduchi/checklist-impianti-GGA-rev.2/issues
- **Autore**: Alessandro Manduchi

## 🙏 Riconoscimenti

Sviluppato per la sicurezza e manutenzione della Galleria di Base del Brennero (GGA).

---

**Versione**: 1.0.0 | **Data**: Febbraio 2024 | **Licenza**: MIT
