# Come Contribuire a NicheSafe

Grazie per il tuo interesse nel contribuire a NicheSafe! 🎉

## 🐛 Segnalare Bug

Se trovi un bug, per favore apri una [issue](https://github.com/tuousername/nichesafe/issues) includendo:

- **Descrizione chiara** del problema
- **Passi per riprodurre** il bug
- **Comportamento atteso** vs **comportamento attuale**
- **Screenshot** se applicabile
- **Informazioni sul browser** (nome, versione, OS)

## ✨ Proporre Nuove Feature

Per proporre una nuova funzionalità:

1. Apri una issue con il tag `enhancement`
2. Descrivi la feature e il caso d'uso
3. Se possibile, proponi una soluzione tecnica
4. Attendi feedback prima di iniziare a sviluppare

## 🔧 Sviluppo

### Setup Ambiente di Sviluppo

1. Fai un fork del repository
2. Clona il tuo fork:
```bash
git clone https://github.com/tuousername/nichesafe.git
cd nichesafe
```

3. Avvia un server locale:
```bash
python -m http.server 8000
```

4. Apri http://localhost:8000 nel browser

### Struttura del Codice

```
nichesafe/
├── index.html          # Struttura HTML
├── styles.css          # Stili e layout
├── app.js              # Logica principale
├── niches-data.js     # Dati delle nicchie
├── service-worker.js  # PWA offline support
└── manifest.json      # PWA manifest
```

### Convenzioni di Codice

#### HTML
- Usa indentazione di 4 spazi
- Attributi sempre tra doppi apici
- Commenta le sezioni principali

#### CSS
- Usa variabili CSS per i colori (`:root`)
- Commenta sezioni complesse
- Mobile-first approach

#### JavaScript
- Usa `const` e `let`, mai `var`
- Nomi di funzioni descrittivi (`handleCheck`, `updateProgress`)
- Commenta la logica complessa
- Usa async/await per operazioni asincrone

### Git Workflow

1. Crea un branch per la tua feature:
```bash
git checkout -b feature/nome-feature
```

2. Fai commit atomici con messaggi descrittivi:
```bash
git commit -m "feat: aggiunge upload multiplo foto"
git commit -m "fix: corregge calcolo percentuale progresso"
git commit -m "docs: aggiorna README con nuove istruzioni"
```

3. Prefissi commit:
   - `feat:` - Nuova feature
   - `fix:` - Bug fix
   - `docs:` - Documentazione
   - `style:` - Formattazione, manca punto e virgola, ecc.
   - `refactor:` - Refactoring codice
   - `test:` - Aggiunta test
   - `chore:` - Manutenzione generale

4. Push al tuo fork:
```bash
git push origin feature/nome-feature
```

5. Apri una Pull Request

### Pull Request Guidelines

- **Titolo chiaro** che descrive la modifica
- **Descrizione dettagliata** di cosa cambia e perché
- **Riferimenti** alle issue correlate (es: "Closes #123")
- **Screenshot** per modifiche UI
- **Test** che la feature funzioni correttamente
- **Un solo obiettivo** per PR (evita PR troppo grandi)

### Testing

Prima di aprire una PR, testa:

1. **Funzionalità desktop** (Chrome, Firefox, Safari)
2. **Funzionalità mobile** (iOS Safari, Chrome Android)
3. **Modalità offline** (con Service Worker attivo)
4. **Salvataggio dati** in localStorage
5. **Generazione PDF** con vari scenari
6. **Acquisizione foto** su dispositivi mobili

### Code Review

Tutte le PR vengono revisionate. Sii paziente e aperto ai feedback! 

## 📝 Documentazione

Aggiorna sempre la documentazione quando:
- Aggiungi una nuova feature
- Modifichi il comportamento esistente
- Cambi i requisiti o le dipendenze

## 🙋 Domande?

Se hai domande, sentiti libero di:
- Aprire una issue con il tag `question`
- Commentare su issue o PR esistenti

## 📜 Codice di Condotta

Sii rispettoso, costruttivo e professionale in tutte le interazioni.

---

Grazie per contribuire a NicheSafe! 🚀
